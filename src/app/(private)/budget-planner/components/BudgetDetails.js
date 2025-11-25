"use client";
import React, { useState, useEffect } from "react";
import AddCategoryForm from "./AddCategoryForm";
import CategoryList from "./CategoryList";
import { Button } from "@/components/ui/Button";
import { FileDown } from "lucide-react";

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

  return (
    <>
      <button onClick={onBack} className="mb-6">← Back</button>
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-1">
            {budget.name} ({budget.type})
          </h2>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
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
            <FileDown className="w-4 h-4 mr-1" /> Download Report
          </Button>
        </div>
        <div className="text-md font-semibold mb-5">
          Total Budget: ₹{budget.totalBudget?.toLocaleString("en-IN")}
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