"use client";
import React, { useState, useEffect } from "react";
import AddCategoryForm from "./AddCategoryForm";
import CategoryList from "./CategoryList";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function BudgetDetails({
  budget,
  onBack,
  onAddCategory,
  onUpdateCategory
}) {
  if (!budget) {
    return (
      <div className="max-w-xl mx-auto mt-6">
        <button onClick={onBack} className="mb-6">← Back</button>
        <div className="p-10 text-gray-500 text-center">No budget selected.</div>
      </div>
    );
  }

  // 🟢 Maintain local state for categories
  const [localCategories, setLocalCategories] = useState(
    Array.isArray(budget.categories) ? budget.categories : []
  );

  // Update when budget prop changes
  useEffect(() => {
    setLocalCategories(Array.isArray(budget.categories) ? budget.categories : []);
  }, [budget]);

  async function handleAddCategory(categoryData) {
    try {
      await onAddCategory(categoryData);

      // 🟢 Re-fetch updated categories via parent or optimistic update
      const res = await fetch(`/api/budgets/${budget._id}`);
      const updated = await res.json();
      setLocalCategories(updated.categories || []);
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  }

  // Calculate totals
  const totalPlanned = localCategories.reduce((sum, cat) => sum + (Number(cat.planned) || 0), 0);
  const totalActual = localCategories.reduce((sum, cat) => sum + (Number(cat.actual) || 0), 0);
  const remaining = totalPlanned - totalActual;
  const progress = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  // Determine status color
  let statusColor = "bg-primary";
  if (progress > 100) statusColor = "bg-destructive";
  else if (progress > 85) statusColor = "bg-yellow-500";
  else statusColor = "bg-green-500";

  return (
    <>
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Budgets
      </button>

      <div className="max-w-4xl mx-auto mb-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{budget.name}</h2>
            <p className="text-muted-foreground capitalize">{budget.type} Budget</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const res = await fetch(`/api/reports/budget/${budget._id}`);
                if (!res.ok) throw new Error("Failed to download report");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Budget_Report_${budget.name}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Error downloading PDF:", err);
                alert("Failed to download budget report. Please try again.");
              }
            }}
          >
            <FileDown className="w-4 h-4 mr-2" /> Download Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Planned</div>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">₹{totalPlanned.toLocaleString()}</div>
          </div>
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Spent</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-2xl font-bold ${totalActual > totalPlanned ? "text-destructive" : ""}`}>
              ₹{totalActual.toLocaleString()}
            </div>
          </div>
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Remaining</div>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-2xl font-bold ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
              ₹{remaining.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Budget Usage</span>
            <span className="text-muted-foreground">{Math.min(progress, 100).toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} indicatorColor={statusColor} className="h-3" />
        </div>
      </div>

      {/* Add Category Form */}
      <div className="max-w-xl mx-auto mb-8 bg-white p-6 rounded shadow">
        <AddCategoryForm onAddCategory={handleAddCategory} />
      </div>

      {/* List/Edit Categories */}
      <CategoryList
        categories={localCategories}
        onUpdateCategory={onUpdateCategory}
        budgetId={budget._id}
      />
    </>
  );
}