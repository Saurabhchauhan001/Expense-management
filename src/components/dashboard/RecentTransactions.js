"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/transactions/recent");
        const data = await res.json();
        if (Array.isArray(data)) setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading) return <div className="text-gray-500">Loading recent transactions...</div>;
  if (transactions.length === 0) return <div className="text-gray-400">No recent paid transactions found.</div>;

  const getBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "income":
        return "bg-green-100 text-green-700";
      case "expense":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // Container animation for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  // Individual transaction animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Transactions</h2>

      <motion.ul
        className="divide-y divide-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {transactions.map((tx) => (
          <motion.li
            key={tx._id}
            variants={itemVariants}
            className="py-3 flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-700">{tx.name || tx.category}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(tx.type)}`}>
                  {tx.type || "Other"}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
            </div>
            <span
              className={`font-semibold ${
                tx.type?.toLowerCase() === "income" ? "text-green-700" : "text-red-700"
              }`}
            >
              {tx.type?.toLowerCase() === "income" ? "+" : "-"}₹{tx.amount}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}