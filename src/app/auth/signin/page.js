// src/app/auth/signin/page.js
"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/dashboard", redirect: true });
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-teal-50">
        <p className="text-teal-700 text-lg font-semibold">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-teal-50">
      <div className="p-6 rounded shadow-md w-96 bg-white text-center">
        <h2 className="text-2xl font-bold mb-6 text-teal-700">Sign In</h2>

        {session ? (
          <p className="text-green-600 mb-4">You are already signed in! Redirecting...</p>
        ) : (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`px-6 py-3 rounded font-semibold shadow-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-amber-400"
              }`}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
            <p className="text-gray-600 mt-4">
              Use your Google account to access your budget dashboard.
            </p>
          </>
        )}
      </div>
    </div>
  );
}