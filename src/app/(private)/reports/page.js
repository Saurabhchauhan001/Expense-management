"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const expenseData = reportData.weeklyData || [];
  const categoryData = reportData.categorySummary || [];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
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
            className="bg-green-600 hover:bg-green-700"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense vs Income Bar Chart */}
        <Card className="shadow-md">
          <div>
            <h2 className="text-lg font-semibold mb-2">Expense vs Income</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
                <Bar dataKey="income" fill="#34d399" name="Income" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category-wise Spending Pie Chart */}
        <Card className="shadow-md">
          <div>
            <h2 className="text-lg font-semibold mb-2">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm p-4 flex flex-col items-center justify-center bg-red-50 border border-red-100">
          <ArrowDownCircle className="w-6 h-6 text-red-500 mb-2" />
          <h3 className="text-sm text-gray-600">Total Expenses</h3>
          <p className="text-xl font-bold text-red-600">₹{reportData.totalExpense.toLocaleString()}</p>
        </Card>

        <Card className="shadow-sm p-4 flex flex-col items-center justify-center bg-green-50 border border-green-100">
          <ArrowUpCircle className="w-6 h-6 text-green-500 mb-2" />
          <h3 className="text-sm text-gray-600">Total Income</h3>
          <p className="text-xl font-bold text-green-600">₹{reportData.totalIncome.toLocaleString()}</p>
        </Card>

        <Card className="shadow-sm p-4 flex flex-col items-center justify-center bg-blue-50 border border-blue-100">
          <Wallet className="w-6 h-6 text-blue-500 mb-2" />
          <h3 className="text-sm text-gray-600">Net Savings</h3>
          <p className="text-xl font-bold text-blue-600">₹{reportData.netSavings.toLocaleString()}</p>
        </Card>
      </div>
    </div>
  );
}