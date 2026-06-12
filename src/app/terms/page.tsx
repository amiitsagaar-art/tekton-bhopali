import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Users, AlertTriangle, CheckCircle2, Ban, Scale } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Tekton Bhopal",
  description: "Tekton Bhopal Terms of Service. Understand your rights, responsibilities, and our service commitment when using our skilled worker marketplace in Bhopal.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      <Header />

      {/* HERO */}
      <div className="bg-slate-900/50 py-16 px-4 text-center border-b border-white/5">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Terms of <span className="text-amber-400">Service</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          These terms govern your use of the Tekton Bhopal platform. Please read them carefully before booking or registering as a partner.
        </p>
        <p className="text-slate-500 text-xs mt-3">Last Updated: June 2026 · Effective Immediately</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full flex-1 space-y-6 pb-20">

        {/* Acceptance */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-white">1. Acceptance of Terms</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            By accessing or using the Tekton Bhopal website, mobile application, or any service provided by Tekton Technologies MP (&quot;Tekton&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            If you do not agree with any part of these terms, you must not use our platform. These terms apply to all users — customers booking services and partners (skilled workers) providing services.
          </p>
        </div>

        {/* Platform Services */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-black text-white">2. Our Platform &amp; Services</h2>
          </div>
          <ul className="space-y-3">
            {[
              "Tekton Bhopal is a marketplace platform connecting customers with verified skilled workers (plumbers, electricians, carpenters, painters, and more) in Bhopal, MP.",
              "We facilitate bookings, coordinate worker dispatch, and handle payment flow — but the actual service is provided by the registered partner workers.",
              "Services are available within municipal boundaries of Bhopal city and selected surrounding areas.",
              "We strive for 10-minute response times in core zones (MP Nagar, Arera Colony, Indrapuri, etc.). Actual times may vary based on worker availability.",
              "Service availability, pricing, and worker assignment are subject to real-time availability and demand.",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* User Responsibilities */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-white">3. User Responsibilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5">
              <h3 className="font-bold text-emerald-400 mb-3 text-sm">As a Customer, you agree to:</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start space-x-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Provide accurate address and contact information</span></li>
                <li className="flex items-start space-x-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Be present or have an authorized adult at the service location</span></li>
                <li className="flex items-start space-x-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Treat Tekton workers with respect and dignity</span></li>
                <li className="flex items-start space-x-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Make payment as agreed (cash/UPI) upon service completion</span></li>
                <li className="flex items-start space-x-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Cancel bookings at least 30 minutes before scheduled time</span></li>
              </ul>
            </div>
            <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5">
              <h3 className="font-bold text-blue-400 mb-3 text-sm">As a Partner Worker, you agree to:</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start space-x-2"><span className="text-blue-400 mt-0.5">✓</span><span>Provide accurate KYC documents during registration</span></li>
                <li className="flex items-start space-x-2"><span className="text-blue-400 mt-0.5">✓</span><span>Arrive on time and complete the job professionally</span></li>
                <li className="flex items-start space-x-2"><span className="text-blue-400 mt-0.5">✓</span><span>Maintain the Tekton-approved service quality standards</span></li>
                <li className="flex items-start space-x-2"><span className="text-blue-400 mt-0.5">✓</span><span>Not solicit direct (off-platform) payments from customers</span></li>
                <li className="flex items-start space-x-2"><span className="text-blue-400 mt-0.5">✓</span><span>Report any disputes to the Tekton admin team</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prohibited Activities */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-xl font-black text-white">4. Prohibited Activities</h2>
          </div>
          <ul className="space-y-3">
            {[
              "Creating fake accounts or providing false personal information during registration.",
              "Booking services with no intention to pay or repeatedly cancelling at the last minute.",
              "Attempting to solicit Tekton workers for off-platform jobs to bypass our fee structure.",
              "Using the platform for any illegal purpose, including harassment of workers or staff.",
              "Attempting to hack, reverse-engineer, or disrupt the Tekton platform or its services.",
              "Submitting fraudulent reviews, ratings, or customer feedback.",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-rose-400 mt-0.5 shrink-0">✗</span>
                <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-black text-white">5. Limitation of Liability</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Tekton Bhopal acts as an intermediary marketplace and is not directly liable for the quality of work performed by partner workers. However, we take quality seriously and will mediate disputes.
          </p>
          <ul className="space-y-3">
            {[
              "We are not responsible for damages resulting from worker negligence beyond the service booking value.",
              "Our maximum liability in any dispute is limited to the total amount paid for the specific booking in question.",
              "We are not liable for delays caused by acts of nature, traffic, strikes, or other force majeure events.",
              "Service guarantees are subject to the specific terms of each service category.",
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Governing Law */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8">
          <h2 className="text-xl font-black text-white mb-4">6. Governing Law &amp; Jurisdiction</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            These Terms of Service are governed by the laws of India. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts of Bhopal, Madhya Pradesh.
          </p>
          <p className="text-sm text-slate-400">
            For any legal inquiries, contact us at{" "}
            <a href="mailto:support@tektonbhopal.com" className="text-amber-400 font-bold hover:underline">
              support@tektonbhopal.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
