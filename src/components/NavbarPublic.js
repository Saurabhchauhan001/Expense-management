"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function NavbarPublic() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Financial Insights", href: "/insights" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            E
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">ExpenseApp</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${pathname === link.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {link.name}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-4">
          <div className="flex flex-col space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}