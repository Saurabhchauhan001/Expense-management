import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side */}
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                E
              </div>
              <h2 className="text-lg font-bold tracking-tight">ExpenseApp</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Manage your expenses efficiently and stay on budget with our professional tools.
            </p>
          </div>

          {/* Center links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/budget-planner" className="hover:text-primary transition-colors">
              Budgets
            </Link>
            <Link href="/reports" className="hover:text-primary transition-colors">
              Reports
            </Link>
            <Link href="/profile" className="hover:text-primary transition-colors">
              Profile
            </Link>
          </div>

          {/* Right side social links */}
          <div className="flex gap-4">
            <a
              href="https://github.com/Saurabhchauhan001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://linkedin.com/in/saurabh-chauhan001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaLinkedin size={20} />
            </a>
            <a
              href="mailto:saurabhrakeshchauhan@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaEnvelope size={20} />
            </a>
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ExpenseApp by Saurabh Chauhan. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;