"use client"

import React, { useState, useEffect } from "react"
import { LogOut, Calendar, Users, FileCheck, CheckCircle, XCircle, AlertCircle, MapPin, Star, Trash2, Image as ImageIcon, UploadCloud, ShieldOff, Shield, Tag, IndianRupee, Plus, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut, User } from "firebase/auth"

export default function AdminControlPanel() {
  // Tab selection
  const [activeTab, setActiveTab] = useState<"bookings" | "workers" | "serviceAreas" | "reviews" | "recentWorks" | "pricing">("bookings")

  // Auth states
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""
  // NOTE: Admin token is sent via header but should be stored in env only
  // The actual secret lives in ADMIN_SECRET_TOKEN server-side env var
  const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || ""

  // Helper to verify admin email
  const isAdmin = (email?: string | null) => {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    const envAdminEmail = ADMIN_EMAIL.toLowerCase().trim();
    
    console.log("Admin Guard Debug:", { loggedIn: email, expected: ADMIN_EMAIL });

    if (envAdminEmail && cleanEmail === envAdminEmail) {
      return true;
    }
    // Fail-Safe Hardcoded Fallbacks
    return cleanEmail === "amiitsagaar@gmail.com" || cleanEmail === "amiit.sagaar@gmail.com";
  }

  // Helper: admin headers for all sensitive API calls
  const adminHeaders = {
    "Content-Type": "application/json",
    "x-admin-token": ADMIN_TOKEN,
  }

  // Firebase Auth listener — runs once on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Real data states (initially empty)
  const [isLoading, setIsLoading] = useState(true)

  const [bookings, setBookings] = useState<Array<{
    id: string
    customerName: string
    location: string
    category: string
    appointmentDate: string
    appointmentTime: string
    status: string
    price?: string
    description?: string
    assignedWorkerId?: string
  }>>([])

  const [workers, setWorkers] = useState<Array<{
    id: string
    name: string
    phone: string
    category: string
    locations: string
    experienceYears?: number
    aadharUrl?: string
    status: string
  }>>([])
  
  const [serviceAreas, setServiceAreas] = useState<Array<{
    id: string
    name: string
    isActive: boolean
  }>>([])

  const [reviews, setReviews] = useState<Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    customerName: string
    workerName: string
  }>>([])

  const [recentWorks, setRecentWorks] = useState<Array<{
    id: string
    title: string
    category: string
    location: string
    imageUrl: string
    createdAt: string
  }>>([])

  // New Work Form State
  const [newWork, setNewWork] = useState({
    title: "",
    category: "Plumbing",
    location: "Kolar Road",
    imageUrl: ""
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // Add New Zone State
  const [newZoneName, setNewZoneName] = useState("");
  const [isAddingZone, setIsAddingZone] = useState(false);

  // ─── Pricing & Coupons State ───────────────────────────────────
  const SERVICE_CATEGORIES = ["Plumbing", "Electrician", "Carpentry", "Painting", "Cleaning", "AC Repair", "Civil Work", "Home Tutors"];
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [savingPrice, setSavingPrice] = useState<string | null>(null);

  const [allCoupons, setAllCoupons] = useState<Array<{
    id: number; code: string; discountValue: number;
    isPercentage: boolean; description: string; isActive: boolean;
  }>>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "", discountValue: "", isPercentage: false, description: ""
  });
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);

  // Helper to mask Aadhaar numbers
  const maskAadhar = (aadhar?: string) => {
    if (!aadhar) return "[Aadhaar Redacted]"
    const last4 = aadhar.slice(-4)
    return `XXXX-XXXX-${last4}`
  }

  const fetchData = async () => {
    try {
      const [bookRes, workerRes, areaRes, reviewRes, workRes, pricingRes, couponRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/workers"),
        fetch("/api/service-areas"),
        fetch("/api/reviews"),
        fetch("/api/recent-works"),
        fetch("/api/pricing"),
        fetch("/api/coupons", { headers: adminHeaders }),
      ])
      const bookingsData = bookRes.ok ? await bookRes.json() : []
      const workersData = workerRes.ok ? await workerRes.json() : []
      const areaData = areaRes.ok ? await areaRes.json() : []
      const reviewsData = reviewRes.ok ? await reviewRes.json() : []
      const worksData = workRes.ok ? await workRes.json() : []
      const pricingData = pricingRes.ok ? await pricingRes.json() : { prices: {}, coupons: [] }
      const couponsData = couponRes.ok ? await couponRes.json() : []

      setBookings(bookingsData)
      setWorkers(workersData)
      setServiceAreas(areaData)
      setReviews(reviewsData)
      setRecentWorks(worksData)
      if (pricingData.prices) {
        setServicePrices(pricingData.prices)
        // Pre-fill editing inputs
        const initialEdits: Record<string, string> = {}
        Object.entries(pricingData.prices).forEach(([cat, price]) => {
          initialEdits[cat] = String(price)
        })
        setEditingPrices(initialEdits)
      }
      setAllCoupons(Array.isArray(couponsData) ? couponsData : [])
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch bookings and workers on component mount — only when admin is verified
  useEffect(() => {
    if (authUser && isAdmin(authUser.email)) {
      fetchData()
    }
  }, [authUser])

  // Update booking status via API
  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update booking")
      setBookings(prev =>
        prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
      )
    } catch (e) {
      console.error(e)
    }
  }

  // Update worker status via API
  const updateWorkerStatus = async (workerId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/workers/${workerId}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update worker")
      setWorkers(prev =>
        prev.map(w => (w.id === workerId ? { ...w, status: newStatus } : w))
      )
    } catch (e) {
      console.error(e)
    }
  }

  // Assign a worker to a booking
  const assignWorkerToBooking = async (bookingId: string, workerId: string) => {
    if (!workerId) return;
    try {
      const res = await fetch(`/api/appointments/${bookingId}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ assignedWorkerId: workerId, status: "Assigned" }),
      });
      if (!res.ok) throw new Error("Failed to assign worker");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, assignedWorkerId: workerId, status: "Assigned" } : b
        )
      );
      alert("Worker Assigned Successfully! Notification triggered.");
    } catch (e) {
      console.error(e);
      alert("Error assigning worker");
    }
  };

  const toggleServiceArea = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/service-areas`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({ id, isActive: !currentStatus }),
      })
      if (!res.ok) throw new Error("Failed to update area")
      setServiceAreas(prev =>
        prev.map(a => (a.id === id ? { ...a, isActive: !currentStatus } : a))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      } else {
        alert("Failed to delete review");
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handlePublishWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const res = await fetch("/api/recent-works", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify(newWork)
      });
      if (res.ok) {
        alert("Published successfully!");
        setNewWork({ title: "", category: "Plumbing", location: "Kolar Road", imageUrl: "" });
        fetchData(); // refresh list
      } else {
        alert("Failed to publish work.");
      }
    } catch (e) {
      console.error(e);
      alert("Error publishing work.");
    } finally {
      setIsPublishing(false);
    }
  }

  // ─── Save a service price ──────────────────────────────────────
  const handleSavePrice = async (category: string) => {
    const val = Number(editingPrices[category]);
    if (!val || val <= 0) { alert("Enter a valid price"); return; }
    setSavingPrice(category);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ category, basePrice: val }),
      });
      if (res.ok) {
        setServicePrices(prev => ({ ...prev, [category]: val }));
        alert(`✅ Price for ${category} updated to ₹${val}`);
      } else {
        alert("Failed to save price");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPrice(null);
    }
  };

  // ─── Add a new coupon ─────────────────────────────────────────
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) { alert("Fill all fields"); return; }
    setIsAddingCoupon(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          code: newCoupon.code,
          discountValue: Number(newCoupon.discountValue),
          isPercentage: newCoupon.isPercentage,
          description: newCoupon.description,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setAllCoupons(prev => [created, ...prev]);
        setNewCoupon({ code: "", discountValue: "", isPercentage: false, description: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create coupon");
      }
    } catch (e) { console.error(e); }
    finally { setIsAddingCoupon(false); }
  };

  // ─── Toggle coupon active ─────────────────────────────────────
  const handleToggleCoupon = async (id: number, current: boolean) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ id, isActive: !current }),
      });
      if (res.ok) {
        setAllCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
      }
    } catch (e) { console.error(e); }
  };

  // ─── Delete coupon ────────────────────────────────────────────
  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch("/api/coupons", {
        method: "DELETE",
        headers: adminHeaders,
        body: JSON.stringify({ id }),
      });
      if (res.ok) setAllCoupons(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  // Badge rendering helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">Pending</span>
      case "Confirmed":
        return <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">Confirmed</span>
      case "Completed":
        return <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">Completed</span>
      case "Approved":
        return <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">Approved</span>
      case "Rejected":
        return <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">Rejected</span>
      default:
        return <span className="bg-slate-500/20 text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-500/30">{status}</span>
    }
  }

  // ──────────────────────────────────────────────
  // SECURITY GATES — shown before the main dashboard
  // ──────────────────────────────────────────────

  // Gate 1: Firebase auth still resolving
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans gap-4">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Verifying Identity...</p>
      </div>
    )
  }

  // Gate 2: Not logged in at all
  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans px-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-10 text-center shadow-2xl shadow-red-500/10">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-6">You must be signed in to view this page.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Gate 3: Logged in but NOT the authorized admin email
  if (!isAdmin(authUser.email)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans px-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-10 text-center shadow-2xl shadow-red-500/10">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6 relative">
            <ShieldOff className="w-10 h-10 text-red-500" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-white">!</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Unauthorized</h1>
          <p className="text-slate-400 text-sm mb-1">
            <span className="text-red-400 font-bold">{authUser.email}</span>
          </p>
          <p className="text-slate-500 text-sm mb-6">This account does not have admin privileges.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => signOut(auth)}
              className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold px-5 py-2.5 rounded-xl transition text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
        <p className="text-slate-700 text-xs mt-6">Tekton Admin — Unauthorized Access Attempt Logged</p>
      </div>
    )
  }

  // Gate 4: Authorized admin — data still loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-yellow-400" />
          <p className="text-slate-300 font-medium">Loading Master Control...</p>
        </div>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-slate-950 font-black text-xl">T</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Admin Panel</h1>
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Master Control</p>
            </div>
          </div>
          <Link href="/" className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 group hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Bookings</p>
                <p className="text-4xl font-black text-white">{bookings.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 group hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Pending Verification</p>
                <p className="text-4xl font-black text-white">{workers.filter(w => w.status.toLowerCase() === "pending").length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 group hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Active Workers</p>
                <p className="text-4xl font-black text-white">{workers.filter(w => {
                  const s = w.status.toLowerCase()
                  return s === "approved" || s === "active"
                }).length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex space-x-6 border-b border-white/10 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`whitespace-nowrap pb-4 text-sm sm:text-base font-bold transition-all relative ${activeTab === "bookings" ? "text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            Manage Bookings
            {activeTab === "bookings" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("workers")}
            className={`whitespace-nowrap pb-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 ${activeTab === "workers" ? "text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            Partner Applications
            {workers.filter(w => w.status.toLowerCase() === "pending").length > 0 && (
              <span className="bg-yellow-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                {workers.filter(w => w.status.toLowerCase() === "pending").length}
              </span>
            )}
            {activeTab === "workers" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`whitespace-nowrap pb-4 text-sm sm:text-base font-bold transition-all relative ${activeTab === "reviews" ? "text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            Manage Ratings
            {activeTab === "reviews" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("recentWorks")}
            className={`whitespace-nowrap pb-4 text-sm sm:text-base font-bold transition-all relative ${activeTab === "recentWorks" ? "text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            Recent Work Gallery
            {activeTab === "recentWorks" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("serviceAreas")}
            className={`whitespace-nowrap pb-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 ${activeTab === "serviceAreas" ? "text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            Service Zones (Geofence)
            {activeTab === "serviceAreas" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`whitespace-nowrap pb-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 ${activeTab === "pricing" ? "text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            💰 Pricing & Coupons
            {activeTab === "pricing" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
        </div>
        
        {/* Tab content */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {activeTab === "bookings" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Date &amp; Time</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.length > 0 ? bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-300">{b.id}</td>
                      <td className="px-6 py-4 font-bold text-white">{b.customerName}</td>
                      <td className="px-6 py-4 text-slate-300">{b.category}</td>
                      <td className="px-6 py-4 text-slate-300">{b.location}</td>
                      <td className="px-6 py-4 text-slate-400">{b.appointmentDate} {b.appointmentTime}</td>
                      <td className="px-6 py-4 font-bold text-yellow-400">
                        {b.price ?? (b.description ? b.description : "-")}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(b.status)}</td>
                       <td className="px-6 py-4">
                         <select 
                           className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none focus:border-yellow-400"
                           value={b.assignedWorkerId || ""}
                           onChange={(e) => assignWorkerToBooking(b.id, e.target.value)}
                         >
                           <option value="" disabled>Select Partner...</option>
                           {workers.filter(w => w.status?.toLowerCase() === 'approved' || w.status?.toLowerCase() === 'active').map(w => (
                             <option key={w.id} value={w.id}>{w.name} ({w.category})</option>
                           ))}
                         </select>
                       </td>
                       <td className="px-6 py-4 text-right space-x-2">
                         <button
                           disabled={b.status !== "Pending"}
                           onClick={() => updateBookingStatus(b.id, "Confirmed")}
                           className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                         >Confirm</button>
                         <button
                           disabled={b.status !== "Confirmed"}
                           onClick={() => updateBookingStatus(b.id, "Completed")}
                           className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                         >Complete</button>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "workers" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">App ID</th>
                    <th className="px-6 py-4">Applicant Name</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4 text-red-400">Aadhaar No.</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {workers.length > 0 ? workers.map(w => (
                    <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-300">{w.id}</td>
                      <td className="px-6 py-4 font-bold text-white">{w.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-300">{w.phone}</td>
                      <td className="px-6 py-4 text-slate-300">{w.category}</td>
                      <td className="px-6 py-4 text-slate-300">{w.experienceYears ?? "-"}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{maskAadhar(w.aadharUrl)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          disabled={w.status.toLowerCase() !== "pending"}
                          onClick={() => updateWorkerStatus(w.id, "Approved")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          disabled={w.status.toLowerCase() !== "pending"}
                          onClick={() => updateWorkerStatus(w.id, "Rejected")}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <FileCheck className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "reviews" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Worker</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Comment</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reviews.length > 0 ? reviews.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{r.customerName || "Unknown"}</td>
                      <td className="px-6 py-4 text-slate-300">{r.workerName || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-normal min-w-[200px]">{r.comment || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <Star className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        No ratings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "recentWorks" ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-yellow-400" /> Publish Recent Work
                </h2>
              </div>
              
              <form onSubmit={handlePublishWork} className="bg-slate-950 p-6 rounded-2xl border border-white/10 max-w-2xl mx-auto mb-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={newWork.title}
                    onChange={e => setNewWork({...newWork, title: e.target.value})}
                    placeholder="e.g. Modern Bathroom Renovation"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-yellow-400 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                    <select
                      value={newWork.category}
                      onChange={e => setNewWork({...newWork, category: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-yellow-400 transition"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Painting">Painting</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Home Tutors">Home Tutors</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={newWork.location}
                      onChange={e => setNewWork({...newWork, location: e.target.value})}
                      placeholder="e.g. MP Nagar"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-yellow-400 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={newWork.imageUrl}
                    onChange={e => setNewWork({...newWork, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-yellow-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-5 h-5" /> {isPublishing ? "Publishing..." : "Publish Live"}
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recentWorks.map(work => (
                  <div key={work.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group">
                    <div className="h-40 w-full bg-slate-800 relative overflow-hidden">
                      <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white">
                        {work.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm truncate">{work.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {work.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {recentWorks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No recent works found.
                </div>
              )}
            </div>
          ) : activeTab === "serviceAreas" ? (
            <div>
              {/* Add New Zone Form */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newZoneName.trim()) return;
                    setIsAddingZone(true);
                    try {
                      const res = await fetch("/api/service-areas", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: newZoneName.trim(), isActive: true }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setServiceAreas(prev => [data.area, ...prev]);
                        setNewZoneName("");
                      } else {
                        alert("Failed to add zone.");
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsAddingZone(false);
                    }
                  }}
                  className="flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={newZoneName}
                    onChange={e => setNewZoneName(e.target.value)}
                    placeholder="Enter new zone name (e.g. Bhopal East)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={isAddingZone}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
                  >
                    {isAddingZone ? "Adding..." : "➕ Add Zone"}
                  </button>
                </form>
              </div>

              {/* Zones Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Zone Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {serviceAreas.length > 0 ? serviceAreas.map(area => (
                      <tr key={area.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-yellow-400" /> {area.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {area.isActive ? (
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">Active</span>
                          ) : (
                            <span className="bg-slate-500/20 text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-500/30">Disabled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleServiceArea(area.id, area.isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${area.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${area.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                          <MapPin className="w-8 h-8 mx-auto mb-3 opacity-50" />
                          No service areas found. Add one above!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "pricing" ? (
            <div className="p-6 space-y-8">

              {/* ── Service Pricing Section ── */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <IndianRupee className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-black text-white">Service Base Prices</h2>
                  <span className="text-xs text-slate-500 ml-2">Changes reflect instantly on the booking modal</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICE_CATEGORIES.map(cat => (
                    <div key={cat} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {cat === "Plumbing" ? "🔧" : cat === "Electrician" ? "⚡" : cat === "Carpentry" ? "🪵" : cat === "Painting" ? "🎨" : cat === "Cleaning" ? "🧹" : cat === "AC Repair" ? "❄️" : cat === "Civil Work" ? "🏗️" : "📚"}
                        </span>
                        <span className="text-sm font-bold text-white">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm font-bold">₹</span>
                        <input
                          type="number"
                          min={1}
                          value={editingPrices[cat] ?? servicePrices[cat] ?? ""}
                          onChange={e => setEditingPrices(prev => ({ ...prev, [cat]: e.target.value }))}
                          placeholder={String(servicePrices[cat] || 149)}
                          className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-yellow-400 transition"
                        />
                        <button
                          onClick={() => handleSavePrice(cat)}
                          disabled={savingPrice === cat}
                          className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-950 font-black text-xs px-3 py-2 rounded-xl transition whitespace-nowrap"
                        >
                          {savingPrice === cat ? "Saving..." : "Save"}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">Current: ₹{servicePrices[cat] ?? "default"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Coupon Manager Section ── */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Tag className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-black text-white">Coupon Manager</h2>
                </div>

                {/* Add New Coupon Form */}
                <form onSubmit={handleAddCoupon} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6 space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5"><Plus className="w-4 h-4 text-yellow-400" /> Add New Coupon</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SAVE50"
                        value={newCoupon.code}
                        onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-yellow-400 transition uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Discount Value *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="e.g. 50"
                        value={newCoupon.discountValue}
                        onChange={e => setNewCoupon(p => ({ ...p, discountValue: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-yellow-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Type</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setNewCoupon(p => ({ ...p, isPercentage: false }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${!newCoupon.isPercentage ? "bg-yellow-400 text-slate-950 border-yellow-400" : "bg-slate-900 text-slate-400 border-slate-700"}`}>
                          ₹ Flat
                        </button>
                        <button type="button" onClick={() => setNewCoupon(p => ({ ...p, isPercentage: true }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${newCoupon.isPercentage ? "bg-yellow-400 text-slate-950 border-yellow-400" : "bg-slate-900 text-slate-400 border-slate-700"}`}>
                          % Off
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. 50% off first booking"
                        value={newCoupon.description}
                        onChange={e => setNewCoupon(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isAddingCoupon}
                    className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {isAddingCoupon ? "Creating..." : "Create Coupon"}
                  </button>
                </form>

                {/* Existing Coupons Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3">Code</th>
                        <th className="px-5 py-3">Discount</th>
                        <th className="px-5 py-3">Description</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {allCoupons.length > 0 ? allCoupons.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3 font-mono font-black text-yellow-400">{c.code}</td>
                          <td className="px-5 py-3 font-bold text-white">
                            {c.isPercentage ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                          </td>
                          <td className="px-5 py-3 text-slate-400 text-xs">{c.description || "—"}</td>
                          <td className="px-5 py-3">
                            {c.isActive
                              ? <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">Active</span>
                              : <span className="bg-slate-500/20 text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-500/30">Inactive</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleToggleCoupon(c.id, c.isActive)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                                c.isActive
                                  ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                            >
                              {c.isActive ? <><ToggleLeft className="w-3.5 h-3.5" /> Disable</> : <><ToggleRight className="w-3.5 h-3.5" /> Enable</>}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                            <Tag className="w-8 h-8 mx-auto mb-3 opacity-50" />
                            No coupons yet. Add one above!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
