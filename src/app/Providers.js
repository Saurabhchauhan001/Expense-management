"use client";
import { SessionProvider } from "next-auth/react";
import { ExpenseProvider } from "./context/ExpenseContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ExpenseProvider>{children}</ExpenseProvider>
    </SessionProvider>
  );
}