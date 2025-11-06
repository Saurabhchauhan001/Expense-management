import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-10 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Left side */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-semibold text-white">Expense Manager</h2>
          <p className="text-sm text-gray-400">
            Manage your expenses efficiently and stay on budget.
          </p>
        </div>

        {/* Center links */}
        <div className="flex space-x-6 text-sm">
          <a href="/dashboard" className="hover:text-white transition">
            Dashboard
          </a>
          <a href="/budget" className="hover:text-white transition">
            Budgets
          </a>
          <a href="/reports" className="hover:text-white transition">
            Reports
          </a>
          <a href="/profile" className="hover:text-white transition">
            Profile
          </a>
        </div>

        {/* Right side social links */}
        <div className="flex space-x-4">
          <a
            href="https://github.com/Saurabhchauhan001"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://linkedin.com/in/saurabh-chauhan001"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="mailto:saurabhrakeshchauhan@gmail.com"
            className="hover:text-white transition"
          >
            <FaEnvelope size={20} />
          </a>
        </div>
      </div>

      {/* Bottom text */}
      <div className="text-center text-gray-500 text-xs mt-6">
        © {new Date().getFullYear()} Expense Manager by Saurabh Chauhan. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;