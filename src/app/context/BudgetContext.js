// app/context/BudgetContext.js
"use client";
import { createContext, useContext, useState } from "react";

const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [plans, setPlans] = useState([]);

  const addPlan = (plan) => setPlans([...plans, plan]);
  const removePlan = (category) =>
    setPlans(plans.filter((p) => p.category !== category));
  const updatePlan = (category, updated) =>
    setPlans(plans.map((p) => (p.category === category ? updated : p)));

  return (
    <BudgetContext.Provider value={{ plans, addPlan, removePlan, updatePlan }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}
