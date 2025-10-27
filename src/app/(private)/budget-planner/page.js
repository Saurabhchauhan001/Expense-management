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
  const handleAddCategory = async ({ category, planned }) => {
    if (!selected) throw new Error("No selected budget");
    // Optionally: mutate selected in context and locally
    await updateBudget(selected._id || selected.id, { category, planned });
    // In a real app, you may want to re-fetch the updated budget or update local state:
    // setSelected(updated);
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
