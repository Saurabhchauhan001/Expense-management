"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ExpenseProvider } from "./context/ExpenseContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ExpenseProvider>{children}</ExpenseProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}