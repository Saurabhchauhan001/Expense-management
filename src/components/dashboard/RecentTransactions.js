"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";

export default function RecentTransactions({ limit }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/transactions/recent");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTransactions(limit ? data.slice(0, limit) : data);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [limit]);

  if (loading) return <div className="text-sm text-muted-foreground py-4">Loading recent transactions...</div>;
  if (transactions.length === 0) return <div className="text-sm text-muted-foreground py-4">No recent paid transactions found.</div>;

  // Container animation for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  // Individual transaction animation
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {transactions.map((tx) => {
        const isIncome = tx.type?.toLowerCase() === "income";
        return (
          <motion.div
            key={tx._id}
            variants={itemVariants}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}>
                {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{tx.name || tx.category}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleDateString()} • {tx.category}
                </p>
              </div>
            </div>
            <div className={`text-sm font-medium ${isIncome ? "text-green-600" : "text-foreground"
              }`}>
              {isIncome ? "+" : "-"}₹{tx.amount}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}