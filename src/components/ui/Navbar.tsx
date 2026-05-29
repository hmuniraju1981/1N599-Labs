// =============================================================================
// FILE: src/components/ui/Navbar.tsx
// PURPOSE: Fixed navigation bar with glass-morphism effect.
// =============================================================================

"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import Logo from "./Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="z-50">
          <Logo size={36} showText={true} />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden z-50 text-slate-300 hover:text-cyan-400 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-0 left-0 right-0 bg-[#030712]/98 backdrop-blur-xl pt-24 pb-8 px-6 md:hidden border-b border-white/5">
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
