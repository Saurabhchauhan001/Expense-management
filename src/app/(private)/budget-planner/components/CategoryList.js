"use client";
import React, { useState, useEffect } from "react";

// Pass in: categories (array), onUpdateCategory (function)
export default function CategoryList({ categories = [], onUpdateCategory }) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValues, setEditValues] = useState({ planned: "", actual: "" });
  const [safeCategories, setSafeCategories] = useState(
    Array.isArray(categories) ? categories : []
  );

  // ✅ keeps local safeCategories synced when parent updates its prop
  useEffect(() => {
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
            key={cat.category}
            className="mb-2 border p-2 rounded flex gap-2 items-center"
          >
            <span className="w-32 font-medium">{cat.category}</span>
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
                  onClick={() => {
                    onUpdateCategory(cat.category, {
                      planned: Number(editValues.planned),
                      actual: Number(editValues.actual),
                    });
                    setEditingIndex(-1);
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
                <span className="w-20">Planned: ₹{cat.planned}</span>
                <span className="w-20">Actual: ₹{cat.actual}</span>
                <button
                  className="px-2 py-1 text-blue-600"
                  onClick={() => {
                    setEditingIndex(idx);
                    setEditValues({
                      planned: cat.planned,
                      actual: cat.actual,
                    });
                  }}
                >
                  Edit
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
