"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Filter only Paid transactions for the logged-in user
  const userPaidTransactions = transactions.filter(
    (t) => t.userEmail === session.user.email && t.status === "Paid"
  );
  // Total Expenses (sum of all Paid transactions)
  const total = userPaidTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // Filter only UnPaid transactions for the logged-in user
  const userUnPaidTransactions = transactions.filter(
    (t) => t.userEmail === session.user.email && t.status !== "Paid"
  );
  // Total UnPaid Expenses(sum of all UnPaid transaction)
  const totalUnPaid = userUnPaidTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // This Month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthTotal = userPaidTransactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Prepare Chart Data (Last 6 months)
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const monthTotal = userPaidTransactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    chartData.push({ name: monthName, total: monthTotal });
  }

  return (
    <div className="container-custom py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{total}</div>
            <p className="text-xs text-muted-foreground">Lifetime paid expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{totalUnPaid}</div>
            <p className="text-xs text-muted-foreground">Unpaid transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{thisMonthTotal}</div>
            <p className="text-xs text-muted-foreground">Spent this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ExpenseChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions limit={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}