"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CreateBudgetForm({ onCreate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Event");
  const [total, setTotal] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg("Budget name is required.");
      return;
    }
    const num = Number(total);
    if (isNaN(num) || num <= 0) {
      setMsg("Enter a valid total budget.");
      return;
    }

    setMsg("Creating...");
    try {
      await onCreate({
        name: name.trim(),
        type,
        totalBudget: num,
        category: name.trim(),
      });
      setMsg("Budget created successfully!");
      setName("");
      setType("Event");
      setTotal("");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg(err?.message || "Failed to create budget.");
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Budget Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setMsg(""); }}
              placeholder="e.g. Wedding, Trip, Monthly"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Event">Event</option>
              <option value="Trip">Trip</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Total Budget (₹)
            </label>
            <Input
              type="number"
              value={total}
              min="0"
              step="1"
              onChange={(e) => { setTotal(e.target.value); setMsg(""); }}
              placeholder="Enter total budget amount"
            />
          </div>
          <Button type="submit" className="w-full">
            Create Budget
          </Button>
          {msg && (
            <p className={`text-center text-sm ${msg.includes("success") ? "text-green-600" : "text-destructive"}`}>
              {msg}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
