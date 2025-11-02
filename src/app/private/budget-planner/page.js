"use client";
import React, { useState } from "react";
import { BudgetProvider, useBudgets } from "./context/BudgetContext";
import BudgetList from "./components/BudgetList";
import BudgetDetails from "./components/BudgetDetails";
import CreateBudgetForm from "./components/CreateBudgetForm";

function PlannerInner() {
  // Updated context destructuring to match context implementation!
  const { budgets, addBudget, updateBudget, refreshAll } = useBudgets();
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleSelect = (budget) => {
    setSelected(budget);
    setShowCreate(false);
  };

  const handleCreateClick = () => setShowCreate(true);

  // Called by AddCategoryForm or CategoryList
  const handleAddCategory = async ({ category, planned, actual }) => {
    if (!selected) throw new Error("No selected budget");

    // ✅ Create new category object with entered actual value
    const newCategory = { 
      name: category, 
      planned: Number(planned), 
      actual: Number(actual) || 0 
    };

    // Merge with existing categories
    const updatedCategories = [...(selected.categories || []), newCategory];

    // Update backend via PUT
    const res = await fetch(`/api/budgets/${selected._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: updatedCategories }),
    });

    if (!res.ok) throw new Error("Failed to update budget");

    const updatedBudget = await res.json();

    // Update local state
    setSelected(updatedBudget);
  };

  const handleUpdateCategoryActual = async (category, patch) => {
    if (!selected) throw new Error("No selected budget");
    // Optionally: mutate selected in context and locally
    await updateBudget(selected._id || selected.id, { category, ...patch });
    // setSelected(updated);
  };

  return (
    <div className="p-6">
      {/* Show list and create form when nothing is selected */}
      {!selected && (
        <>
          <BudgetList
            budgets={budgets}
            onSelect={handleSelect}
            onCreateClick={handleCreateClick}
          />
          {showCreate && (
            <CreateBudgetForm
              onCreate={async (payload) => {
                await addBudget(payload); // <-- use addBudget, not createBudget!
                setShowCreate(false);
              }}
            />
          )}
        </>
      )}

      {/* Show details if a budget is selected */}
      {selected && (
        <BudgetDetails
          budget={selected}
          onBack={() => setSelected(null)}
          onAddCategory={handleAddCategory}
          onUpdateCategoryActual={handleUpdateCategoryActual}
        />
      )}
    </div>
  );
}

export default function BudgetPlannerPage() {
  return (
    <BudgetProvider>
      <PlannerInner />
    </BudgetProvider>
  );
}
