import React from "react";
import Link from "next/link";
import { Hammer, MapPin, Mail, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Intro */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex bg-[#F8CB46] text-black font-black text-2xl px-3 py-1 rounded-xl tracking-tight border border-amber-300 items-center space-x-1.5 hover:scale-105 transition-transform">
              <div className="bg-black text-amber-400 p-1 rounded-lg">
                <Hammer className="w-5 h-5" />
              </div>
              <span>TEKTON</span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 rounded ml-1">BHOPAL</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Revolutionizing the blue-collar service industry in Bhopal. Instant dispatch, verified pros, and transparent pricing.
            </p>
            <div className="flex space-x-4">
              <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 font-bold text-xs transition">FACEBOOK</a>
              <a href={SITE_CONFIG.social.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 font-bold text-xs transition">TWITTER</a>
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 font-bold text-xs transition">INSTAGRAM</a>
              <a href={SITE_CONFIG.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 font-bold text-xs transition">LINKEDIN</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-400 transition">Home</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition">Our Services</Link></li>
              <li><Link href="/recent-work" className="hover:text-amber-400 transition">Recent Work</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-amber-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-amber-400 transition">Refund Policy</Link></li>
              <li><Link href="/partner-join" className="hover:text-amber-400 transition">Become a Partner</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{SITE_CONFIG.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`} className="hover:text-amber-400 transition">{SITE_CONFIG.phone}</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-amber-400 transition">{SITE_CONFIG.email}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Tekton Bhopal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
