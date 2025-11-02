"use client";
import React, { useState, useEffect } from "react";

// Pass in: categories (array), onUpdateCategory (function), budgetId (string)
export default function CategoryList({ categories = [], onUpdateCategory = () => {}, budgetId }) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValues, setEditValues] = useState({ planned: "", actual: "" });
  const [safeCategories, setSafeCategories] = useState(
    Array.isArray(categories) ? categories : []
  );

  // ✅ keeps local safeCategories synced when parent updates its prop
  useEffect(() => {
  console.log("Updated categories prop:", categories);
  setSafeCategories(Array.isArray(categories) ? categories : []);
}, [categories]);

  return (
    <div className="max-w-xl mx-auto">
      <h3 className="font-bold mb-2">Categories</h3>
      {safeCategories.length === 0 && (
        <p className="text-gray-500 mb-4">No categories yet.</p>
      )}
      <ul>
        {safeCategories.map((cat, idx) => (
          <li
            key={`${cat._id || cat.name || cat.category || "category"}-${idx}`}
            className="mb-2 border p-2 rounded flex gap-2 items-center"
          >
            <span className="w-32 font-medium">{cat.name || cat.category}</span>
            {editingIndex === idx ? (
              <>
                <input
                  type="number"
                  value={editValues.planned}
                  onChange={(e) =>
                    setEditValues((v) => ({ ...v, planned: e.target.value }))
                  }
                  placeholder="Planned"
                  className="border rounded px-2 w-20"
                />
                <input
                  type="number"
                  value={editValues.actual}
                  onChange={(e) =>
                    setEditValues((v) => ({ ...v, actual: e.target.value }))
                  }
                  placeholder="Actual"
                  className="border rounded px-2 w-20"
                />
                <button
                  className="px-2 py-1 text-green-600 font-bold"
                  onClick={async () => {
                    try {
                      const updatedCategory = {
                        ...cat, // preserve name and any existing properties
                        planned: Number(editValues.planned),
                        actual: Number(editValues.actual),
                      };

                      // Update the local copy first
                      const updatedCategories = safeCategories.map((c) =>
                        (c._id || c.name || c.category) === (cat._id || cat.name || cat.category)
                          ? updatedCategory
                          : c
                      );
                      setSafeCategories(updatedCategories);

                      // Persist changes to backend
                      const res = await fetch(`/api/budgets/${budgetId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ categories: updatedCategories }),
                      });

                      if (!res.ok) throw new Error("Failed to update category in database");
                      const updatedBudget = await res.json();

                      // Trigger parent callback if available
                      onUpdateCategory(cat._id || cat.name || cat.category, updatedCategory);

                      setEditingIndex(-1);
                    } catch (err) {
                      console.error("Error updating category:", err);
                      alert("Failed to update category. Please try again.");
                    }
                  }}
                >
                  Save
                </button>
                <button
                  className="px-2 py-1 text-gray-400"
                  onClick={() => setEditingIndex(-1)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="w-20">Planned: {cat.planned == null ? "—" : `₹${cat.planned}`}</span>
                <span className="w-20">Actual: {cat.actual == null ? "—" : `₹${cat.actual}`}</span>
                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${
                        cat.planned && cat.actual
                          ? Math.min((cat.actual / cat.planned) * 100, 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <button
                  className="px-2 py-1 text-blue-600"
                  onClick={() => {
                    setEditingIndex(idx);
                    setEditValues({
                      planned: cat.planned ?? "",
                      actual: cat.actual ?? "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 text-red-600"
                  onClick={async () => {
                    const displayName = cat.name || cat.category || "this category";
                    if (!window.confirm(`Delete category "${displayName}"?`)) return;
                    try {
                      const updatedCategories = safeCategories.filter(
                        (c) => (c._id || c.name || c.category) !== (cat._id || cat.name || cat.category)
                      );
                      setSafeCategories(updatedCategories);

                      // Persist changes to backend
                      const res = await fetch(`/api/budgets/${budgetId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ categories: updatedCategories }),
                      });

                      if (!res.ok) throw new Error("Failed to delete category from database");
                      const updatedBudget = await res.json();

                      // ✅ Sync with backend data to avoid showing deleted categories again
                      setSafeCategories(updatedBudget.categories || []);
                      onUpdateCategory(cat._id || cat.name || cat.category, null);
                    } catch (err) {
                      console.error("Error deleting category:", err);
                      alert("Failed to delete category. Please try again.");
                    }
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
