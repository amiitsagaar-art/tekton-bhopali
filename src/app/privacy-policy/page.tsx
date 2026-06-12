import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Eye, Lock, Database, Bell, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Tekton Bhopal",
  description: "Read Tekton Bhopal's Privacy Policy. Learn how we collect, use, and protect your personal information when you use our home services platform.",
};

const SECTIONS = [
  {
    icon: Database,
    title: "Information We Collect",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    content: [
      "**Personal Information**: Name, mobile number, email address, and home address when you register or book a service.",
      "**Location Data**: Your approximate location (Bhopal area/colony) to match you with nearby verified workers.",
      "**Usage Data**: Pages visited, services browsed, and booking history within our platform.",
      "**Device Information**: Browser type, operating system, and device identifiers for app optimization.",
      "**Payment Information**: Payment method choice (Cash/UPI) — we do NOT store full card or UPI details.",
    ],
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    content: [
      "To match you with the nearest available verified skilled worker in your Bhopal area.",
      "To send booking confirmations, worker arrival updates, and service completion notifications via SMS/WhatsApp.",
      "To improve our platform, fix bugs, and enhance the overall user experience.",
      "To verify partner (worker) identities through KYC document review.",
      "To send promotional offers, coupons, and service updates (you may opt out anytime).",
    ],
  },
  {
    icon: Lock,
    title: "Data Security",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    content: [
      "All data is encrypted in transit using industry-standard TLS/SSL protocols.",
      "Worker KYC documents (Aadhaar, PAN) are stored securely and only accessed by authorized admin personnel.",
      "We use Firebase Authentication with OTP-based verification to prevent unauthorized account access.",
      "Regular security audits are conducted to identify and fix vulnerabilities.",
      "We never sell your personal data to third parties for advertising purposes.",
    ],
  },
  {
    icon: Bell,
    title: "Communications & Notifications",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    content: [
      "We send transactional SMS/WhatsApp messages related to your bookings (arrival time, worker details, job completion).",
      "Promotional messages are sent only if you have not opted out.",
      "To opt out of promotional messages, reply STOP to any SMS or contact us at support@tektonbhopal.com.",
      "Push notifications (if enabled) are used for real-time booking status updates.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Your Rights",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    content: [
      "**Right to Access**: Request a copy of all personal data we hold about you.",
      "**Right to Correction**: Ask us to correct inaccurate or incomplete information.",
      "**Right to Deletion**: Request deletion of your account and associated personal data.",
      "**Right to Portability**: Receive your data in a machine-readable format.",
      "To exercise any of these rights, contact us at support@tektonbhopal.com.",
    ],
  },
];

function renderContent(text: string) {
  if (text.startsWith("**") && text.includes("**:")) {
    const parts = text.split("**:");
    const label = parts[0].replace(/\*\*/g, "");
    const rest = parts[1];
    return (
      <span>
        <span className="font-bold text-slate-200">{label}:</span>
        {rest}
      </span>
    );
  }
  return text;
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      <Header />

      {/* HERO */}
      <div className="bg-slate-900/50 py-16 px-4 text-center border-b border-white/5">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Your Privacy Matters</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Privacy <span className="text-amber-400">Policy</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          We are committed to protecting your personal information. This policy explains how Tekton Bhopal collects, uses, and safeguards your data.
        </p>
        <p className="text-slate-500 text-xs mt-3">Last Updated: June 2026 · Effective Immediately</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full flex-1 space-y-6 pb-20">
        {/* Intro */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <p className="text-slate-300 leading-relaxed text-sm">
            Welcome to <strong className="text-white">Tekton Bhopal</strong> (&quot;Tekton&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). This Privacy Policy governs how we collect and handle information when you use our website, mobile app, or any Tekton service operating within Bhopal, Madhya Pradesh, India. By using Tekton, you agree to this policy.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 ${section.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h2 className="text-xl font-black text-white">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <span className="text-amber-400 mt-1 shrink-0">•</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{renderContent(item)}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Contact */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-white">Contact Our Privacy Team</h2>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            If you have any questions about this Privacy Policy or want to exercise your data rights, please reach out:
          </p>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400">Email: </span><a href="mailto:support@tektonbhopal.com" className="text-amber-400 font-bold hover:underline">support@tektonbhopal.com</a></p>
            <p><span className="text-slate-400">Address: </span><span className="text-slate-300">MP Nagar Zone 1, Bhopal, Madhya Pradesh 462011</span></p>
            <p><span className="text-slate-400">Response Time: </span><span className="text-slate-300">Within 48 business hours</span></p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
