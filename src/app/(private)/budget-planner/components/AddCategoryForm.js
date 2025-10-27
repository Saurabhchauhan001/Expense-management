"use client";
import React, { useState } from "react";

// Props: onAddCategory({ category, planned, actual })
export default function AddCategoryForm({ onAddCategory }) {
  const [category, setCategory] = useState("");
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!category.trim()) {
      setError("Category name required");
      return;
    }
    if (isNaN(Number(planned)) || planned === "") {
      setError("Planned amount required");
      return;
    }
    setSaving(true);
    try {
      await onAddCategory({
        category: category.trim(),
        planned: Number(planned),
        actual: actual === "" ? 0 : Number(actual),
      });
      setCategory("");
      setPlanned("");
      setActual("");
    } catch (err) {
      setError(err?.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div>
        <label className="block text-sm font-semibold mb-1">Name</label>
        <input
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="Category name"
          className="border rounded px-2 w-28"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Planned</label>
        <input
          type="number"
          value={planned}
          onChange={e => setPlanned(e.target.value)}
          placeholder="Planned amount"
          className="border rounded px-2 w-20"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Actual</label>
        <input
          type="number"
          value={actual}
          onChange={e => setActual(e.target.value)}
          placeholder="Actual spent"
          className="border rounded px-2 w-20"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className={`px-3 py-1 font-semibold rounded ${
          saving ? "bg-gray-300" : "bg-green-600 text-white"
        }`}
      >
        {saving ? "Saving..." : "Add"}
      </button>
      {error && (
        <div className="text-red-500 ml-3 text-sm font-medium">{error}</div>
      )}
    </form>
  );
}
