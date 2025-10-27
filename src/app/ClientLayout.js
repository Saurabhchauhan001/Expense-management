"use client";

import NavbarApp from "../components/NavbarApp";
import NavbarPublic from "../components/NavbarPublic";
import Providers from "./Providers";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const publicRoutes = ["/", "/about", "/insights", "/contact", "/auth/signin"];
  const isPublicPage = publicRoutes.includes(pathname);

  return (
    <Providers>
      {isPublicPage ? <NavbarPublic /> : <NavbarApp />}
      <main>{children}</main>
    </Providers>
  );
}