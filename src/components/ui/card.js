"use client";
import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-200 p-4 transition hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}