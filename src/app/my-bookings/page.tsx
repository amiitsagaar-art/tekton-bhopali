"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowLeft, Calendar, Clock, MapPin, CheckCircle2,
  XCircle, AlertCircle, Loader2, Package, Phone,
  IndianRupee, RefreshCw, X
} from "lucide-react";
import TektonLogo from "@/components/TektonLogo";

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  location: string;
  category: string;
  description: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  paymentStatus: string;
  visitCharge: number;
  extraCharge: number;
  totalAmount: number;
  transactionId?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Pending:   { bg: "bg-yellow-500/15 border-yellow-500/30", text: "text-yellow-400", icon: <AlertCircle className="w-4 h-4" /> },
  Confirmed: { bg: "bg-blue-500/15 border-blue-500/30",   text: "text-blue-400",   icon: <CheckCircle2 className="w-4 h-4" /> },
  Assigned:  { bg: "bg-purple-500/15 border-purple-500/30", text: "text-purple-400", icon: <CheckCircle2 className="w-4 h-4" /> },
  Completed: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", icon: <CheckCircle2 className="w-4 h-4" /> },
  Cancelled: { bg: "bg-rose-500/15 border-rose-500/30",   text: "text-rose-400",   icon: <XCircle className="w-4 h-4" /> },
};

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
});

export default function MyBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    setMounted(true);
    const phone = localStorage.getItem("tektonUserPhone");
    setUserPhone(phone);
  }, []);

  // SWR hook: only fetch when we have a phone number
  const swrKey = userPhone ? `/api/bookings?phone=${encodeURIComponent(userPhone)}` : null;
  const { data: bookings = [], error, isLoading, mutate } = useSWR<Booking[]>(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: true,         // revalidate when user returns to tab
      revalidateOnReconnect: true,     // revalidate on network reconnect
      refreshInterval: 30000,          // auto-refresh every 30 seconds
      dedupingInterval: 5000,          // dedupe requests within 5 seconds
      keepPreviousData: true,          // show old data while refreshing (no flash)
    }
  );

  const handleCancelBooking = async (bookingId: number) => {
    if (!cancelReason.trim()) {
      showToast("Please provide a cancellation reason.", "error");
      return;
    }
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: userPhone,
          reason: cancelReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Optimistic update via SWR mutate — no full refetch needed
        mutate(
          (prev) => prev?.map(b => b.id === bookingId ? { ...b, status: "Cancelled" } : b),
          { revalidate: false }
        );
        showToast("✅ Booking cancelled successfully.", "success");
        setShowCancelModal(null);
        setCancelReason("");
      } else {
        showToast(data.error || "Failed to cancel booking.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  if (!mounted) return null;

  const isLoggedIn = !!userPhone;
  const pendingBookings = bookings.filter(b => ["Pending", "Confirmed", "Assigned"].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === "Completed");
  const cancelledBookings = bookings.filter(b => b.status === "Cancelled");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:scale-105 transition-all">
            <TektonLogo className="w-9 h-9 shrink-0" />
            <div>
              <p className="text-base font-black text-white leading-none">TEKTON</p>
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">My Bookings</p>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </header>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-4 z-50">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold backdrop-blur-xl ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500 text-emerald-300"
              : "bg-rose-950/90 border-rose-500 text-rose-300"
          }`}>
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            {toast.msg}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {!isLoggedIn ? (
          /* NOT LOGGED IN */
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center">
              <Phone className="w-9 h-9 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Login Required</h2>
            <p className="text-slate-400 text-sm max-w-xs">
              Please login with your phone number to view your booking history.
            </p>
            <Link
              href="/profile"
              className="mt-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition"
            >
              Login / Create Profile
            </Link>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <XCircle className="w-12 h-12 text-rose-400" />
            <h2 className="text-xl font-black text-white">Failed to Load Bookings</h2>
            <p className="text-slate-400 text-sm">Network error. Please check your connection.</p>
            <button
              onClick={() => mutate()}
              className="mt-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : isLoading && !bookings.length ? (
          /* INITIAL LOADING — only shown when no cached data exists */
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          /* EMPTY */
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
              <Package className="w-9 h-9 text-slate-500" />
            </div>
            <h2 className="text-xl font-black text-white">No Bookings Yet</h2>
            <p className="text-slate-400 text-sm">Book a service and track it here.</p>
            <Link
              href="/"
              className="mt-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <>
            {/* STATS ROW */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Active", count: pendingBookings.length, color: "text-blue-400" },
                { label: "Completed", count: completedBookings.length, color: "text-emerald-400" },
                { label: "Cancelled", count: cancelledBookings.length, color: "text-rose-400" },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">All Bookings ({bookings.length})</h2>
              {/* SWR auto-refreshes, but manual refresh is kept for UX */}
              <button
                onClick={() => mutate()}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* BOOKINGS LIST */}
            <div className="space-y-4">
              {bookings.map(booking => {
                const style = STATUS_STYLES[booking.status] || STATUS_STYLES["Pending"];
                const canCancel = ["Pending", "Confirmed"].includes(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/20 transition-all"
                  >
                    {/* TOP ROW */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                            TEK-{booking.id}
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text}`}>
                            {style.icon}
                            {booking.status}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-white mt-1.5">{booking.category}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total</p>
                        <p className="text-xl font-black text-amber-400">
                          ₹{booking.totalAmount || booking.visitCharge || 0}
                        </p>
                      </div>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{booking.appointmentDate} • {booking.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{booking.customerAddress}, {booking.location}</span>
                      </div>
                      {booking.totalAmount > booking.visitCharge && (
                        <div className="flex items-center gap-2 text-slate-400 col-span-2">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Visit: ₹{booking.visitCharge} + Extra: ₹{booking.extraCharge}</span>
                        </div>
                      )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 text-[11px] text-slate-400 italic mb-4">
                      "{booking.description}"
                    </div>

                    {/* PAYMENT STATUS */}
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={`px-2.5 py-1 rounded-full border ${
                        booking.paymentStatus === "Paid"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      }`}>
                        Payment: {booking.paymentStatus || "Pending"}
                        {booking.transactionId && ` · ${booking.transactionId.slice(0, 8)}...`}
                      </span>

                      {canCancel && (
                        <button
                          onClick={() => setShowCancelModal(booking.id)}
                          className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* CANCEL MODAL */}
      {showCancelModal !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Cancel Booking TEK-{showCancelModal}</h3>
              <button onClick={() => { setShowCancelModal(null); setCancelReason(""); }}
                className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Please tell us why you want to cancel this booking.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g. I found another service provider..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(null); setCancelReason(""); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(showCancelModal)}
                disabled={cancellingId === showCancelModal}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                {cancellingId === showCancelModal ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                ) : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
