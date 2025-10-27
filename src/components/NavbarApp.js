// src/app/components/NavbarApp.js
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function NavbarApp() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Transactions", href: "/transactions" },
    { name: "Budget Planner", href: "/budget-planner" },
    { name: "Reports", href: "/reports" },
  ];

  return (
    <nav className="bg-teal-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide text-amber-400">
          Expense App
        </div>

        <div className="hidden md:flex space-x-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-md transition ${
                pathname === link.href
                  ? "bg-amber-400 text-teal-900 font-semibold"
                  : "hover:bg-amber-300 hover:text-teal-900"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {session && (
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-amber-300 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{session.user.name.split(" ")[0]}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-teal-600 text-amber-400 rounded shadow-lg p-4 flex flex-col gap-3 z-50">
                  <Link href="/profile" className="flex items-center gap-2 hover:bg-amber-400 px-2 py-1 rounded transition">
                    <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="text-left hover:bg-amber-400 px-2 py-1 rounded transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}