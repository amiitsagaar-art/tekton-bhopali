"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, Menu, X, Bell, MapPin } from "lucide-react";
import TektonLogo from "./TektonLogo";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const getDesktopClass = (path: string) => {
    return `px-3 py-2 text-sm font-semibold transition-colors rounded-xl ${
      isActive(path)
        ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.05)] font-bold"
        : "text-slate-300 hover:text-yellow-400"
    }`;
  };

  const getMobileClass = (path: string) => {
    return `block px-4 py-3 text-sm font-semibold rounded-xl transition ${
      isActive(path)
        ? "text-yellow-400 bg-yellow-400/10 border-l-2 border-yellow-400 font-bold"
        : "text-slate-300 hover:text-yellow-400 hover:bg-white/5"
    }`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left Element (Desktop Logo / Mobile Hamburger) */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Button (Mobile only) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Logo */}
            <Link href="/" className="hidden lg:flex items-center space-x-2.5 hover:scale-105 transition-all duration-300">
              <TektonLogo className="w-10 h-10 shrink-0" />
              <div className="flex flex-col text-left justify-center">
                <span className="text-xl font-black tracking-tight text-white leading-none mb-0.5">
                  TEKTON
                </span>
                <span className="text-[10px] font-black text-yellow-400 tracking-wide ml-0.5 leading-none">
                  Bhopal
                </span>
              </div>
            </Link>
          </div>

          {/* Center Element (Desktop Nav Menu / Mobile Logo) */}
          <div className="flex-1 flex items-center justify-center">
            {/* Desktop Links */}
            <nav className="hidden lg:flex items-center space-x-2">
              <Link href="/" className={getDesktopClass("/")}>Home</Link>
              <Link href="/services" className={getDesktopClass("/services")}>Services</Link>
              <Link href="/recent-work" className={getDesktopClass("/recent-work")}>Recent Work</Link>
              <Link href="/about" className={getDesktopClass("/about")}>About Us</Link>
              <Link href="/contact" className={getDesktopClass("/contact")}>Contact</Link>
            </nav>

            {/* Mobile Logo */}
            <Link href="/" className="lg:hidden flex items-center space-x-2">
              <TektonLogo className="w-8 h-8 shrink-0" />
              <span className="text-base font-black tracking-tight text-white">TEKTON</span>
            </Link>
          </div>

          {/* Right Element (Actions - Desktop Only) */}
          <div className="hidden lg:flex items-center space-x-3 justify-end">
            <Link href="/partner-join" className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
              Join as Partner
            </Link>
            <Link href="/?book=true" className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition">
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-4/5 max-w-sm bg-slate-900 h-full shadow-2xl flex flex-col border-r border-white/10 animate-slide-right">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                <TektonLogo className="w-8 h-8 shrink-0" />
                <span className="text-lg font-black text-white">TEKTON</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={getMobileClass("/")}>
                Home
              </Link>
              <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className={getMobileClass("/services")}>
                Services
              </Link>
              <Link href="/recent-work" onClick={() => setIsMobileMenuOpen(false)} className={getMobileClass("/recent-work")}>
                Recent Work
              </Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className={getMobileClass("/about")}>
                About Us
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={getMobileClass("/contact")}>
                Contact Us
              </Link>
            </nav>

            <div className="p-4 border-t border-white/10 space-y-3">
              <Link href="/partner-join" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-white/10 text-white py-3 rounded-xl text-sm font-bold border border-white/10">
                Join as Partner
              </Link>
              <Link href="/?book=true" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-yellow-400 text-slate-950 py-3 rounded-xl text-sm font-black">
                Book a Service
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
