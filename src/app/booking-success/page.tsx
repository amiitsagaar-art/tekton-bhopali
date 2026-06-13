"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Calendar, BookOpen, Home, Share2, Phone } from "lucide-react";
import TektonLogo from "@/components/TektonLogo";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id") || "TEK-???";
  const service = searchParams.get("service") || "Service";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Tekton Booking Confirmed!",
        text: `My ${service} booking (${bookingId}) is confirmed for ${date} at ${time}. Tekton Bhopal — Skilled Workers Marketplace.`,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(bookingId);
      alert("Booking ID copied: " + bookingId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-amber-500/8 rounded-full blur-[100px] animate-pulse" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className={`max-w-md w-full space-y-6 transition-all duration-700 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <TektonLogo className="w-10 h-10" />
            <span className="text-xl font-black text-white">TEKTON</span>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className={`w-24 h-24 bg-emerald-500/15 border-2 border-emerald-500/40 rounded-full flex items-center justify-center transition-all duration-1000 ${animate ? "scale-100" : "scale-0"}`}>
              <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
            <p className="text-slate-400 text-sm">
              Your {service} request has been received. Our team will dispatch the best artisan to you.
            </p>
          </div>

          {/* Booking ID Card */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Booking ID</p>
            <p className="text-3xl font-black text-amber-400 tracking-wider">{bookingId}</p>
            <p className="text-[10px] text-slate-500 mt-1">Save this ID for reference</p>
          </div>

          {/* Details */}
          {(date || time) && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              {service && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Service</p>
                    <p className="font-bold text-white">{service}</p>
                  </div>
                </div>
              )}
              {date && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Scheduled</p>
                    <p className="font-bold text-white">{date}{time && ` · ${time}`}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">What happens next?</h3>
            {[
              { step: "1", text: "Our team reviews your booking request", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
              { step: "2", text: "Best available artisan gets assigned to your task", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
              { step: "3", text: "Artisan arrives at your address at scheduled time", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${item.color}`}>
                  {item.step}
                </div>
                <p className="text-xs text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-xl text-xs transition"
            >
              <Share2 className="w-4 h-4" />
              Share / Copy ID
            </button>
            <Link
              href="/my-bookings"
              className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl text-xs transition"
            >
              <BookOpen className="w-4 h-4" />
              Track Booking
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-bold transition py-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Support */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-[10px] text-slate-500 mb-1">Need Help? Call Us</p>
            <a
              href="tel:+917440038385"
              className="flex items-center justify-center gap-2 text-amber-400 font-black text-sm hover:text-amber-300 transition"
            >
              <Phone className="w-4 h-4" />
              +91 74400 38385
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
