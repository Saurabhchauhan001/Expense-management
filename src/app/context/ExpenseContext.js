// 1️⃣ Extend ExpenseContext to update/delete expenses in MongoDB: src/context/ExpenseContext.js

"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error(err);
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (expense) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (res.ok) {
        const newExp = await res.json();
        setExpenses(prev => [...prev, newExp]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeExpense = async (id) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses(prev => prev.filter(exp => exp._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateExpense = async (id, updatedExpense) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExpense),
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(prev => prev.map(exp => exp._id === id ? data : exp));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, removeExpense, updateExpense, fetchExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpenseContext);
}
