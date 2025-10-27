"use client";
import React, { useState } from "react";

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
        category: name.trim(), // <-- Unique: use name as category if needed by your context logic
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
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow rounded-lg p-6 border border-teal-200"
    >
      <h2 className="text-lg font-bold text-teal-700 mb-4">Create New Budget</h2>
      <div className="mb-4">
        <label className="block font-semibold text-teal-700 mb-1">
          Budget Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setMsg(""); }}
          className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="e.g. Wedding, Trip, Monthly"
          maxLength={50}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold text-teal-700 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="Event">Event</option>
          <option value="Trip">Trip</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold text-teal-700 mb-1">
          Total Budget (₹)
        </label>
        <input
          type="number"
          value={total}
          min="0"
          step="1"
          onChange={(e) => { setTotal(e.target.value); setMsg(""); }}
          className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Enter total budget amount"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded font-bold transition"
      >Create Budget</button>
      {msg && <p className="text-center mt-3 text-sm text-teal-700">{msg}</p>}
    </form>
  );
}
