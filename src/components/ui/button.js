"use client";
import React from "react";

export function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold transition text-white bg-teal-600 hover:bg-teal-700 ${className}`}
    >
      {children}
    </button>
  );
}