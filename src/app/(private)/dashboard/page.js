"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

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

  if (status === "loading") return <p className="text-center mt-10">Loading...</p>;

  if (!session)
    return (
      <p className="text-center mt-10 text-red-600">Access Denied. Please sign in.</p>
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

  // Top Category
  const categoryTotals = {};
  userPaidTransactions.forEach((t) => {
    const cat = t.category.charAt(0).toUpperCase() + t.category.slice(1).toLowerCase();
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <>
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-teal-600">
          <h2 className="text-gray-500">Total Expenses</h2>
          <p className="text-3xl font-bold text-teal-500">₹{total}</p>
          <h2 className="text-gray-500">Total UnPaid</h2>
          <p className="text-3xl font-bold text-orange-500">₹{totalUnPaid}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-amber-500">
          <h2 className="text-gray-500">This Month</h2>
          <p className="text-3xl font-bold text-teal-600">₹{thisMonthTotal}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-teal-500">
          <h2 className="text-gray-500">Top Category</h2>
          <p className="text-3xl font-bold text-amber-500">{topCategory}</p>
        </div>
      </div>
    </>
  );
}