"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar, FileDown, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export default function ReportsPage() {
  const [filter, setFilter] = useState("monthly");
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    categorySummary: [],
    weeklyData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/reports/summary");
        if (!res.ok) throw new Error("Failed to fetch report data");
        const data = await res.json();
        setReportData(data);
      } catch (err) {
        console.error("Error fetching report summary:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const expenseData = reportData.weeklyData || [];
  const categoryData = reportData.categorySummary || [];

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="container-custom py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-1" /> Filter
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              try {
                const res = await fetch("/api/reports/transactions?period=monthly");
                if (!res.ok) throw new Error("Failed to download report");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "Transaction_Report_Monthly.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Error downloading PDF:", err);
                alert("Failed to download report. Please try again.");
              }
            }}
          >
            <FileDown className="w-4 h-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <ArrowDownCircle className="w-8 h-8 text-destructive mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
            <p className="text-2xl font-bold text-destructive">₹{reportData.totalExpense.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <ArrowUpCircle className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
            <p className="text-2xl font-bold text-green-500">₹{reportData.totalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Wallet className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Net Savings</h3>
            <p className="text-2xl font-bold text-primary">₹{reportData.netSavings.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense vs Income Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense vs Income</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category-wise Spending Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}