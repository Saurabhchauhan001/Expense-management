"use client";
import "./globals.css";
import NavbarApp from "../components/NavbarApp.js";
import NavbarPublic from "../components/NavbarPublic";
import Providers from "./Providers";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const publicRoutes = ["/", "/about", "/insights", "/contact"];
  const isPublicPage = publicRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          {isPublicPage ? <NavbarPublic /> : <NavbarApp />}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}