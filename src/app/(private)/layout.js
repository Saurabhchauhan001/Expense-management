// src/app/(private)/layout.js
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavbarApp from "../../components/NavbarApp";
import Footer from "../../components/Footer";
import "../globals.css";

function AuthenticatedLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  return (
    <>

      <main className="p-6">{children}</main>
      <Footer />
    </>
  );
}

export default function PrivateLayout({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </div>
    </SessionProvider>
  );
}