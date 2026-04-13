"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!session)
    return (
      <div className="flex items-center justify-center h-screen text-destructive">Access Denied. Please sign in.</div>
    );

  // --- Filtering Logic Fixes ---
  // Get all user transactions (API already filters by user email, but just in case)
  const userTransactions = transactions.filter((t) => t.userEmail === session?.user?.email);

  // Total Expenses (type strictly 'expense')
  const totalExpenses = userTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Total Income (type strictly 'income')
  const totalIncome = userTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Pending Dues (type 'due', 'borrowed', 'payable' and status not 'Paid')
  const totalPendingDues = userTransactions
    .filter((t) => ['due', 'borrowed', 'payable'].includes(t.type) && t.status !== 'Paid')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Filtering based on user selection
  const now = new Date();
  
  let filteredTransactions = [];
  let chartData = [];
  let filteredExpenses = 0;

  if (filterType === 'weekly') {
    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0); // start of 7 days ago
    
    filteredTransactions = userTransactions.filter(t => new Date(t.date || t.createdAt) >= sevenDaysAgo);
    
    // Group chart data by day for last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = d.toLocaleDateString('default', { weekday: 'short' });
      const dayTotal = filteredTransactions
        .filter(t => new Date(t.date || t.createdAt).toLocaleDateString() === d.toLocaleDateString() && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      chartData.push({ name: dayName, total: dayTotal });
    }
  } else if (filterType === 'monthly') {
    filteredTransactions = userTransactions.filter(t => {
      const d = new Date(t.date || t.createdAt);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for(let i=1; i<=daysInMonth; i++) {
        const d = new Date(selectedYear, selectedMonth, i);
        const dayTotal = filteredTransactions
            .filter(t => new Date(t.date || t.createdAt).getDate() === i && t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        chartData.push({ name: `${i}`, total: dayTotal });
    }
  } else if (filterType === 'yearly') {
    filteredTransactions = userTransactions.filter(t => {
      const d = new Date(t.date || t.createdAt);
      return d.getFullYear() === selectedYear;
    });

    // Group by month
    for(let i=0; i<12; i++) {
        const monthName = new Date(selectedYear, i, 1).toLocaleString('default', { month: 'short' });
        const monthTotal = filteredTransactions
            .filter(t => new Date(t.date || t.createdAt).getMonth() === i && t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        chartData.push({ name: monthName, total: monthTotal });
    }
  }

  filteredExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container-custom py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
           <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
           </select>

           {filterType === 'monthly' && (
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-background border border-input rounded-md px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
           )}

           {(filterType === 'monthly' || filterType === 'yearly') && (
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-background border border-input rounded-md px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
           )}
        </div>
      </div>

      {/* Metric Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">₹{totalIncome}</div>
              <p className="text-xs text-muted-foreground">Lifetime reported income</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Wallet className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">₹{totalExpenses}</div>
              <p className="text-xs text-muted-foreground">Lifetime actual expenses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">₹{totalPendingDues}</div>
              <p className="text-xs text-muted-foreground">Unpaid transactions/dues</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Expense</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{filteredExpenses}</div>
              <p className="text-xs text-muted-foreground">Spent in selected period</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
        <Card className="col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Expense Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ExpenseChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Filtered Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions limit={5} transactionsData={filteredTransactions} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}