import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RotateCcw, CheckCircle2, XCircle, Clock, AlertCircle, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

export const metadata = {
  title: "Refund Policy — Tekton Bhopal",
  description: "Tekton Bhopal Refund & Cancellation Policy. Learn about our transparent refund process for home services booked in Bhopal, MP.",
};

const ELIGIBLE = [
  "Service was not delivered despite a confirmed booking and worker dispatch.",
  "Worker arrived more than 60 minutes late beyond the agreed time slot without prior notice.",
  "The completed work was found to be defective or substantially different from what was agreed.",
  "You paid online (UPI/wallet) but the booking was cancelled by Tekton or the assigned worker.",
  "Duplicate payment was made for the same booking.",
];

const NOT_ELIGIBLE = [
  "Cancellations made less than 30 minutes before the agreed service start time.",
  "You were not present at the service location at the scheduled time despite confirmation.",
  "The service was completed and you are dissatisfied due to personal preference (not a defect).",
  "Cash payment bookings — refund is handled via direct adjustment on next booking.",
  "Issues arising from pre-existing damage to the property unrelated to our service.",
];

const STEPS = [
  { step: "1", title: "Contact Us", desc: `Email ${SITE_CONFIG.email} or call us within 48 hours of the service date with your booking ID and reason.`, icon: Mail },
  { step: "2", title: "Review (1–2 Days)", desc: "Our quality team reviews your request, checks booking records, and may contact the assigned worker for clarification.", icon: Clock },
  { step: "3", title: "Decision", desc: "We will notify you of the refund decision via SMS and email within 2 business days.", icon: AlertCircle },
  { step: "4", title: "Refund Issued", desc: "Approved refunds are processed to the original payment method within 5–7 business days.", icon: CheckCircle2 },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      <Header />

      {/* HERO */}
      <div className="bg-slate-900/50 py-16 px-4 text-center border-b border-white/5">
        <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Fair & Transparent</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Refund <span className="text-amber-400">Policy</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          We believe in fair and transparent service. If something goes wrong, we will make it right. Here&apos;s how our refund process works.
        </p>
        <p className="text-slate-500 text-xs mt-3">Last Updated: June 2026 · Effective Immediately</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full flex-1 space-y-6 pb-20">

        {/* Cancellation Policy */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <h2 className="text-xl font-black text-white mb-5 flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <span>Cancellation Policy</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-emerald-400 mb-1">FREE</p>
              <p className="text-xs font-bold text-white mb-2">Cancellation</p>
              <p className="text-xs text-slate-400">Cancel more than <strong className="text-slate-200">60 minutes</strong> before service time — no charges.</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-amber-400 mb-1">₹49</p>
              <p className="text-xs font-bold text-white mb-2">Late Cancellation Fee</p>
              <p className="text-xs text-slate-400">Cancel within <strong className="text-slate-200">30–60 minutes</strong> of service time — convenience fee applies.</p>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-rose-400 mb-1">₹99</p>
              <p className="text-xs font-bold text-white mb-2">No-Show Fee</p>
              <p className="text-xs text-slate-400">Worker arrives but customer is <strong className="text-slate-200">not present</strong> — visit charge is non-refundable.</p>
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eligible */}
          <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-black text-white">Eligible for Refund</h2>
            </div>
            <ul className="space-y-3">
              {ELIGIBLE.map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="text-emerald-400 mt-0.5 shrink-0 text-lg">✓</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Eligible */}
          <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="text-lg font-black text-white">Not Eligible for Refund</h2>
            </div>
            <ul className="space-y-3">
              {NOT_ELIGIBLE.map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="text-rose-400 mt-0.5 shrink-0 text-lg">✗</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Refund Process Steps */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <h2 className="text-xl font-black text-white mb-8 text-center">How to Request a Refund</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Step {step.step}</div>
                  <h3 className="font-bold text-white text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 text-center">
          <h2 className="text-xl font-black text-white mb-3">Need Help with a Refund?</h2>
          <p className="text-sm text-slate-300 mb-5 max-w-md mx-auto">
            Our customer support team is available 7 days a week from 8 AM to 10 PM to assist you with any refund or cancellation issues.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-6 py-3 rounded-xl transition"
            >
              Email Us
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl transition border border-white/10"
            >
              Call: {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
