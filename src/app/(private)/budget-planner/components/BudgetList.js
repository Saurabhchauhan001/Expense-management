"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";

export default function BudgetList({ budgets, onSelect, onCreateClick }) {
  return (
    <div className="max-w-3xl mx-auto mb-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Budgets</h2>
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" /> Create New Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No budgets yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {budgets.map((budget) => (
            <Card
              key={budget._id || budget.id || budget.category}
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => onSelect && onSelect(budget)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {budget.name || budget.category || "Untitled"}
                  </h3>
                  {budget.type && (
                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {budget.type}
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-primary">
                  {typeof budget.totalBudget === "number"
                    ? `₹${Number(budget.totalBudget).toLocaleString("en-IN")}`
                    : budget.totalBudget}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
