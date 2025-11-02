"use client";
import { createContext, useContext, useState, useEffect } from "react";

// BudgetContext.js
const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all budgets (each has categories array)
  const refreshAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets");
      const data = await res.json();
      setBudgets(data.budgets || []);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      setBudgets([]); // Defensive fallback for UI
    } finally {
      setLoading(false);
    }
  };

  // Create a budget
  const addBudget = async (budget) => {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });
      if (!res.ok) throw new Error("Failed to create budget.");
      await refreshAll();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a budget
  const updateBudget = async (id, patch) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update budget.");
      await refreshAll();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add/update a category in a budget
  const addOrUpdateCategory = async (id, { category, planned, actual }) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets/${id}/category`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, planned, actual }),
      });
      if (!res.ok) throw new Error("Failed to update category.");
      await refreshAll();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <BudgetContext.Provider
      value={{
        budgets,             // Exposes all budgets (each has categories array!)
        loading,
        addBudget,
        updateBudget,
        addOrUpdateCategory,
        refreshAll,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudgets = () => useContext(BudgetContext);
