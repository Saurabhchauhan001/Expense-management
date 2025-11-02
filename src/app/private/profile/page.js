"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="text-center mt-10">Loading...</p>;
  if (!session) return <p className="text-center mt-10 text-red-600">Access Denied. Please sign in.</p>;

  const { user } = session;

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="flex flex-col items-center gap-4">
        <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full" />
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        {/* Additional Info */}
        <p className="text-gray-500">Welcome to your expense management dashboard!</p>
      </div>
    </div>
  );
}
