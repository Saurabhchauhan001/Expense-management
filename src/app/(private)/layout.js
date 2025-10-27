// src/app/(private)/layout.js
"use client";

import { SessionProvider } from "next-auth/react";
import NavbarApp from "../../components/NavbarApp"; // relative path
import "../globals.css";

export default function PrivateLayout({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
       
        <main className="p-6">{children}</main>
      </div>
    </SessionProvider>
  );
}