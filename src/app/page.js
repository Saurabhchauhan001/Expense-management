"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-500 to-teal-400 text-white px-6 py-12">
      <h1 className="text-5xl font-bold mb-6 animate-fadeIn">Welcome to Expense Manager</h1>
      <p className="text-lg mb-10 text-center max-w-xl animate-fadeIn delay-200">
        Track your expenses, plan your budget, and take control of your finances effortlessly.
      </p>

      <div className="space-x-4 mb-16 animate-fadeIn delay-400">
        <Link
          href="/auth/signin"
          className="bg-amber-400 text-teal-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-500 transition shadow-md hover:shadow-teal-700/40"
        >
          Sign In
        </Link>
      </div>

      <section className="max-w-4xl w-full bg-teal-700 bg-opacity-30 rounded-lg p-8 animate-slideUp shadow-lg shadow-teal-900/10">
        <h2 className="text-3xl font-semibold mb-6 text-center text-amber-400">Why Choose Expense Manager?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/90">
          <div className="bg-teal-600 bg-opacity-90 rounded-lg p-6 shadow-lg hover:shadow-teal-800/60 transition-shadow text-white">
            <h3 className="text-xl font-bold mb-3 text-amber-300">Smart Budgeting</h3>
            <p>
              Create customized budgets to manage your finances effectively and avoid overspending.
            </p>
          </div>
          <div className="bg-teal-600 bg-opacity-90 rounded-lg p-6 shadow-lg hover:shadow-teal-800/60 transition-shadow text-white">
            <h3 className="text-xl font-bold mb-3 text-amber-300">Spending Analysis</h3>
            <p>
              Get detailed insights and reports to understand your spending habits and make informed decisions.
            </p>
          </div>
          <div className="bg-teal-600 bg-opacity-90 rounded-lg p-6 shadow-lg hover:shadow-teal-800/60 transition-shadow text-white">
            <h3 className="text-xl font-bold mb-3 text-amber-300">Secure & Private</h3>
            <p>
              Your data is protected with top-level security measures ensuring your privacy at all times.
            </p>
          </div>
          <div className="bg-teal-600 bg-opacity-90 rounded-lg p-6 shadow-lg hover:shadow-teal-800/60 transition-shadow text-white">
            <h3 className="text-xl font-bold mb-3 text-amber-300">Easy Expense Tracking</h3>
            <p>
              Quickly add and categorize expenses to keep your financial records up-to-date effortlessly.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-16 text-sm text-white/80 animate-fadeIn delay-600">
        © {new Date().getFullYear()} Expense Manager. All rights reserved.
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}