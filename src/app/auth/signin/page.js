"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-teal-50">
      <div className="p-8 rounded shadow-md w-full max-w-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-teal-700 text-center">Sign In</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-left text-gray-700 text-sm font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-left text-gray-700 text-sm font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">or</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition font-semibold ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p className="text-gray-600 mt-4 text-center">
          Don’t have an account?{" "}
          <a href="/auth/register" className="text-teal-600 font-semibold hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}