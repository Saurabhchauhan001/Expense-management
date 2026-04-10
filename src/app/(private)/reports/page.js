"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar, FileDown, ArrowDownCircle, ArrowUpCircle, Wallet, ChevronDown, ChevronUp, Download } from "lucide-react";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null); // 'YYYY-MM'
  const [isLoading, setIsLoading] = useState(true);

  // For accordion-like behavior in the custom list
  const [expandedMonth, setExpandedMonth] = useState(null); 

  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  // Compute all-time stats (Fixed)
  const allTimeStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const catSum = {};
    
    transactions.forEach(tx => {
      const type = tx.type?.toLowerCase();
      const amount = Number(tx.amount) || 0;
      if (type === "income") totalIncome += amount;
      if (type === "expense") {
        totalExpense += amount;
        if (tx.category) {
          catSum[tx.category] = (catSum[tx.category] || 0) + amount;
        }
      }
    });

    const topCategoryAllTime = Object.keys(catSum).length > 0 
      ? Object.entries(catSum).sort((a,b) => b[1] - a[1])[0][0] 
      : "N/A";

    return { totalIncome, totalExpense, netSavings: totalIncome - totalExpense, topCategoryAllTime };
  }, [transactions]);

  // Group by Month
  const monthlyDataList = useMemo(() => {
    const monthMap = {};
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yyyy}-${mm}`;
      const monthName = d.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { monthKey, monthName, income: 0, expenses: 0, categories: {} };
      }

      const type = tx.type?.toLowerCase();
      const amount = Number(tx.amount) || 0;
      if (type === "income") monthMap[monthKey].income += amount;
      if (type === "expense") {
        monthMap[monthKey].expenses += amount;
        if (tx.category) {
          monthMap[monthKey].categories[tx.category] = (monthMap[monthKey].categories[tx.category] || 0) + amount;
        }
      }
    });

    return Object.values(monthMap).map(m => {
      let topCat = "N/A";
      let topVal = 0;
      if (Object.keys(m.categories).length > 0) {
        const sortedCats = Object.entries(m.categories).sort((a,b) => b[1] - a[1]);
        topCat = sortedCats[0][0];
        topVal = sortedCats[0][1];
      }
      return { ...m, topCategory: topCat, topCategoryValue: topVal };
    }).sort((a, b) => b.monthKey.localeCompare(a.monthKey)); // descending
  }, [transactions]);

  // Calculate Bar and Pie based on selectedMonth
  const { barData, pieData } = useMemo(() => {
    if (!selectedMonth) {
      // BarData is per month
      const bData = monthlyDataList.map(m => ({
        name: m.monthName,
        monthKey: m.monthKey,
        income: m.income,
        expenses: m.expenses,
      })).reverse(); // Oldest to newest for visual graph

      // Pie is all time
      const catSum = {};
      transactions.forEach(tx => {
        const type = tx.type?.toLowerCase();
        if (type === "expense" && tx.category) {
          catSum[tx.category] = (catSum[tx.category] || 0) + (Number(tx.amount) || 0);
        }
      });
      const pData = Object.entries(catSum).map(([k, v]) => ({ name: k, value: v }));
      return { barData: bData, pieData: pData };
    } else {
      // Selected month
      const monthTx = transactions.filter(tx => {
        const d = new Date(tx.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}` === selectedMonth;
      });

      // Weekly grouping
      const weekMap = {};
      const catSum = {};
      
      monthTx.forEach(tx => {
        const d = new Date(tx.date);
        const week = Math.ceil(d.getDate() / 7);
        const wKey = `Week ${week}`;
        if (!weekMap[wKey]) weekMap[wKey] = { name: wKey, income: 0, expenses: 0 };
        
        const type = tx.type?.toLowerCase();
        const amount = Number(tx.amount) || 0;
        if (type === "income") weekMap[wKey].income += amount;
        if (type === "expense") {
          weekMap[wKey].expenses += amount;
          if (tx.category) {
            catSum[tx.category] = (catSum[tx.category] || 0) + amount;
          }
        }
      });

      const bData = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map(w => {
        return weekMap[w] || { name: w, income: 0, expenses: 0 };
      }).filter(w => w.income > 0 || w.expenses > 0);

      const pData = Object.entries(catSum).map(([k, v]) => ({ name: k, value: v }));
      return { barData: bData, pieData: pData };
    }
  }, [selectedMonth, monthlyDataList, transactions]);

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#8b5cf6", "#6366f1", "#f43f5e"];

  const downloadReport = async (monthKey = null) => {
    try {
      let url = "/api/reports/transactions";
      if (monthKey) {
        url += `?month=${monthKey}`;
      } else {
        url += "?period=all_time";
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to download report");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = monthKey ? `Transaction_Report_${monthKey}.pdf` : "Transaction_Report_All_Time.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download report. Please try again.");
    }
  };

  const handleBarClick = (data) => {
    if (!selectedMonth && data && data.activePayload && data.activePayload.length > 0) {
       const pbDetails = data.activePayload[0].payload;
       if (pbDetails.monthKey) {
          downloadReport(pbDetails.monthKey);
       }
    }
  };

  const handleMonthToggle = (monthKey) => {
    if (expandedMonth === monthKey) {
      setExpandedMonth(null);
      setSelectedMonth(null);
    } else {
      setExpandedMonth(monthKey);
      setSelectedMonth(monthKey);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
        <div className="flex gap-3 items-center">
          {selectedMonth && (
             <Button variant="outline" size="sm" onClick={() => { setExpandedMonth(null); setSelectedMonth(null); }}>
               Clear Filters
             </Button>
          )}
          <Button size="sm" onClick={() => downloadReport(selectedMonth)}>
            <FileDown className="w-4 h-4 mr-1" />
            {selectedMonth ? "Download Monthly PDF" : "Download All PDF"}
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards - ALWAYS FIXED ALL TIME */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <ArrowDownCircle className="w-8 h-8 text-destructive mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
            <p className="text-2xl font-bold text-destructive">₹{allTimeStats.totalExpense.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full">All Time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <ArrowUpCircle className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
            <p className="text-2xl font-bold text-green-500">₹{allTimeStats.totalIncome.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full">All Time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Wallet className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Net Savings</h3>
            <p className="text-2xl font-bold text-primary">₹{allTimeStats.netSavings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full">All Time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
              <span className="text-lg">🏆</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Top Category</h3>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-400 truncate max-w-[150px]">
              {allTimeStats.topCategoryAllTime}
            </p>
            <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full">All Time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense vs Income Bar Chart */}
        <Card className="border">
          <CardHeader>
             <CardTitle className="flex justify-between items-center text-lg">
               <span>Expense vs Income {selectedMonth ? `(Weeks of ${monthlyDataList.find(m => m.monthKey === selectedMonth)?.monthName})` : "(Monthly)"}</span>
             </CardTitle>
             {!selectedMonth && (
               <p className="text-xs text-muted-foreground pt-1">Tip: Click on a month bar to download its PDF report.</p>
             )}
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
                  No chart data for this period.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} onClick={handleBarClick}>
                    <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "10px",
                            border: "1px solid rgba(0,0,0,0.05)",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                        }}
                        itemStyle={{ color: "#333", fontWeight: 500 }}
                    />
                    <Legend iconType="circle" />
                    <Bar 
                    dataKey="expenses" 
                    fill="url(#colorExpense)" 
                    name="Expenses" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1000} 
                    className={!selectedMonth ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                    />
                    <Bar 
                    dataKey="income" 
                    fill="url(#colorIncome)" 
                    name="Income" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1000} 
                    className={!selectedMonth ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                    />
                </BarChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category-wise Spending Pie Chart */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category {selectedMonth ? `(${monthlyDataList.find(m => m.monthKey === selectedMonth)?.monthName})` : "(All Time)"}</CardTitle>
          </CardHeader>
          <CardContent>
             {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
                  No expenses recorded.
                </div>
             ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      label
                      animationDuration={1000}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                      }}
                      itemStyle={{ color: "#333", fontWeight: 500 }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdowns List */}
      <h2 className="text-2xl font-bold mt-10 mb-6 flex items-center gap-2">
         <Calendar className="text-primary w-6 h-6" /> Monthly Breakdowns
      </h2>
      <div className="space-y-4">
         {monthlyDataList.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-xl border text-muted-foreground">
              No recorded transactions to display.
            </div>
         ) : null}
         {monthlyDataList.map((month) => {
            const isExpanded = expandedMonth === month.monthKey;
            
            return (
               <div key={month.monthKey} className={`border rounded-xl bg-card transition-all overflow-hidden shadow-sm ${isExpanded ? "ring-2 ring-primary/20 border-primary/40 shadow-md" : "hover:border-primary/40 hover:shadow-md"}`}>
                 <div 
                   className="p-5 flex items-center justify-between cursor-pointer"
                   onClick={() => handleMonthToggle(month.monthKey)}
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                         <Calendar className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-semibold text-lg">{month.monthName}</p>
                          <div className="flex items-center gap-2 text-sm mt-1">
                             <span className="text-green-500 font-medium">₹{month.income.toLocaleString()} in</span>
                             <span className="text-border">•</span>
                             <span className="text-destructive font-medium">₹{month.expenses.toLocaleString()} out</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <Button 
                          variant="ghost" 
                          size="sm"
                          className="hidden sm:flex text-primary hover:text-primary hover:bg-primary/20"
                          onClick={(e) => {
                             e.stopPropagation();
                             downloadReport(month.monthKey);
                          }}
                       >
                          <Download className="w-4 h-4 mr-2" /> PDF
                       </Button>
                       <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-foreground" /> : <ChevronDown className="w-5 h-5 text-foreground" />}
                       </div>
                    </div>
                 </div>
                 
                 {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t bg-muted/10 animate-in slide-in-from-top-4 duration-300">
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
                          <div className="bg-background rounded-lg p-4 border shadow-sm flex flex-col justify-center">
                             <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <span className="text-yellow-500 text-lg">🏆</span> Top Category
                             </p>
                             <div className="flex items-end gap-2">
                                <span className="text-xl font-bold truncate max-w-[150px]">{month.topCategory}</span>
                                {month.topCategory !== "N/A" && (
                                   <span className="text-sm font-medium text-destructive mb-0.5">₹{month.topCategoryValue?.toLocaleString()}</span>
                                )}
                             </div>
                          </div>
                          
                          <div className="bg-background rounded-lg p-4 border shadow-sm flex flex-col justify-center">
                             <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <Wallet className="w-4 h-4 text-primary" /> Net Flow
                             </p>
                             <p className={`text-xl font-bold ${month.income - month.expenses >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                                {month.income - month.expenses >= 0 ? "+" : ""}
                                ₹{(month.income - month.expenses).toLocaleString()}
                             </p>
                          </div>
                          
                          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1 block lg:hidden">
                             <Button 
                                variant="outline" 
                                className="w-full text-primary border-primary hover:bg-primary/10 h-12"
                                onClick={(e) => {
                                   downloadReport(month.monthKey);
                                }}
                             >
                                <Download className="w-4 h-4 mr-2" /> Download Report
                             </Button>
                          </div>
                       </div>
                    </div>
                 )}
               </div>
            );
         })}
      </div>
    </div>
  );
}