"use client";
import React from "react";
import AddCategoryForm from "./AddCategoryForm";
import CategoryList from "./CategoryList";

// Props:
// budget: { name, type, totalBudget, categories }, required
// onBack: () => void
// onAddCategory: (categoryObj) => void
// onUpdateCategory: (catName, patchObj) => void

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

  // Defensive: categories defaults to empty array if missing
  const categories = Array.isArray(budget.categories) ? budget.categories : [];

  return (
    <>
      <button onClick={onBack} className="mb-6">← Back</button>
      <div className="max-w-xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-1">{budget.name} ({budget.type})</h2>
        <div className="text-md font-semibold mb-5">
          Total Budget: ₹{budget.totalBudget?.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Add Category Form */}
      <div className="max-w-xl mx-auto mb-8 bg-white p-6 rounded shadow">
        <AddCategoryForm onAddCategory={onAddCategory} />
      </div>

      {/* List/Edit Categories */}
      <CategoryList
        categories={categories}
        onUpdateCategory={onUpdateCategory}
      />
    </>
  );
}
