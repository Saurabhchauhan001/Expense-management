"use client";
import React from "react";
import { useBudgets } from "../context/BudgetContext";

export default function BudgetList({ budgets, onSelect, onCreateClick }) {
  // If budgets are passed as prop, no need to get from context hook
  return (
    <div className="max-w-2xl mx-auto mb-8">
      <h2 className="text-xl font-bold text-teal-700 mb-4">Your Budgets</h2>
      {budgets.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No budgets yet.</p>
      ) : (
        <ul className="divide-y divide-teal-100 bg-white rounded-lg shadow border border-teal-200">
          {budgets.map((budget) => (
            <li
              key={budget._id || budget.id || budget.category}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-teal-50 transition"
              onClick={() => onSelect && onSelect(budget)}
            >
              <div>
                <span className="font-semibold text-teal-700 text-lg">
                  {budget.name || budget.category || "Untitled"}
                </span>
                {budget.type && (
                  <span className="ml-2 text-sm text-gray-500">({budget.type})</span>
                )}
              </div>
              <div className="font-semibold">
                {typeof budget.totalBudget === "number"
                  ? `₹${Number(budget.totalBudget).toLocaleString("en-IN")}`
                  : budget.totalBudget}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <button className="bg-teal-600 text-white px-4 py-2 rounded" onClick={onCreateClick}>
          Create New Budget
        </button>
      </div>
    </div>
  );
}
