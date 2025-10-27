"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarPublic() {
  const pathname = usePathname();
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Financial Insights", href: "/insights" },
    { name: "Contact", href: "/contact" },
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
      </div>
        <Link
          href="/auth/signin"
          className="bg-white text-blue-700 px-4 py-2 rounded font-semibold hover:bg-gray-200"
        >
          Sign In
        </Link>
      </div>
    

    </nav>
  );
}