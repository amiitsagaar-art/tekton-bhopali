"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ArrowLeft,
  Sliders,
  DollarSign,
  MapPin,
  TrendingUp,
  Sparkles,
  PhoneCall,
  UserCheck
} from "lucide-react";
import Link from "next/link";

interface Worker {
  id: number;
  name: string;
  phone: string;
  category: string;
  experienceYears: number;
  basePrice: number;
  locations: string;
  rating: string;
  reviewsCount: number;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  status?: string;
  portfolio?: string[];
  aadhaarUrl?: string;
  panUrl?: string;
  passbookUrl?: string;
  selfieUrl?: string;
}

interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  location: string;
  category: string;
  description: string;
  appointmentDate: string;
  appointmentTime: string;
  assignedWorkerId: number | null;
  status: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  location: string;
  photoUrl?: string;
  createdAt: string;
}

const CATEGORIES = [
  "Plumber",
  "Carpenter",
  "Electrician",
  "Painter",
  "Civil Architect",
  "Civil Construction",
  "Cleaning Service",
  "AC & Appliances",
  "Tank Cleaning",
  "Interior Design",
  "Exterior Design"
];

export default function AdminPanel() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "workers" | "appointments" | "users" | "analytics" | "coupons">("overview");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkerKycId, setExpandedWorkerKycId] = useState<number | null>(null);

  // Search queries
  const [workerSearch, setWorkerSearch] = useState("");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Edit Modals state
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workersRes, appointmentsRes, usersRes] = await Promise.all([
        fetch("/api/workers?all=true"),
        fetch("/api/appointments"),
        fetch("/api/users")
      ]);
      const workersData = await workersRes.json();
      const appointmentsData = await appointmentsRes.json();
      const usersData = await usersRes.json();

      setWorkers(Array.isArray(workersData) ? workersData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Failed to load admin payload", err);
      showToast("❌ Error loading administrative data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // APPROVE / REJECT status updates
  const updateWorkerStatus = async (id: number, status: string, isVerified: boolean, name: string) => {
    try {
      const res = await fetch(`/api/workers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, isVerified })
      });
      if (res.ok) {
        setWorkers(prev => prev.map(w => w.id === id ? { ...w, status, isVerified } : w));
        showToast(`✅ Profile for ${name} marked as ${status}`);
      } else {
        showToast("❌ Failed status shift");
      }
    } catch (err) {
      showToast("❌ Server connection exception");
    }
  };

  // DELETE functions
  const handleDeleteWorker = async (id: number, name: string) => {
    if (!confirm(`Are you absolutely sure you want to remove ${name} from the active platform?`)) return;
    try {
      const res = await fetch(`/api/workers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorkers(prev => prev.filter(w => w.id !== id));
        showToast(`🗑️ Removed worker: ${name}`);
      } else {
        const err = await res.json();
        showToast(`❌ Error: ${err.error}`);
      }
    } catch (err) {
      showToast("❌ Failed to delete worker");
    }
  };

  const handleDeleteAppointment = async (id: number, customer: string) => {
    if (!confirm(`Remove enquiry record for ${customer}?`)) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== id));
        showToast(`🗑️ Deleted appointment record #${id}`);
      } else {
        showToast("❌ Failed to delete");
      }
    } catch (err) {
      showToast("❌ Failed to delete");
    }
  };

  // UPDATE Worker details submission
  const handleUpdateWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    try {
      const res = await fetch(`/api/workers/${editingWorker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingWorker)
      });

      if (res.ok) {
        const updated = await res.json();
        setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w));
        setEditingWorker(null);
        showToast(`✅ Successfully updated profile for ${updated.name}`);
      } else {
        const err = await res.json();
        showToast(`❌ Update error: ${err.error}`);
      }
    } catch (err) {
      showToast("❌ Update failure");
    }
  };

  // UPDATE Appointment details submission
  const handleUpdateAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    try {
      const res = await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAppointment)
      });

      if (res.ok) {
        const updated = await res.json();
        setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
        setEditingAppointment(null);
        showToast(`✅ Updated Status & Assignment for Enquiry #${updated.id}`);
      } else {
        showToast("❌ Failed to patch update");
      }
    } catch (err) {
      showToast("❌ Failed to save update");
    }
  };

  // DELETE User account
  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete the user account for ${name}?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        showToast(`🗑️ Removed user account: ${name}`);
      } else {
        const err = await res.json();
        showToast(`❌ Error: ${err.error}`);
      }
    } catch (err) {
      showToast("❌ Failed to delete user account");
    }
  };

  // UPDATE User details submission
  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser)
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        setEditingUser(null);
        showToast(`✅ Successfully updated user profile for ${updated.name}`);
      } else {
        const err = await res.json();
        showToast(`❌ Update error: ${err.error}`);
      }
    } catch (err) {
      showToast("❌ Update failure");
    }
  };

  // Trigger Database Master Fresh Reset
  const handleMasterReset = async () => {
    if (!confirm("⚠️ Master Action: This will wipe all test records and re-seed the core database with pristine default specialists configured exclusively for Bhopal, Madhya Pradesh. Proceed?")) return;
    
    setLoading(true);
    showToast("🔄 Reinitializing primary master schema nodes...");
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchData();
      showToast("✨ Database clean and optimized for Bhopal parameters successfully!");
    } catch (err) {
      showToast("❌ Failed database re-seed command");
      setLoading(false);
    }
  };

  // Inline Quick Toggle Verification Status
  const toggleWorkerVerification = async (worker: Worker) => {
    try {
      const newStatus = !worker.isVerified;
      const res = await fetch(`/api/workers/${worker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: newStatus })
      });
      if (res.ok) {
        setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, isVerified: newStatus } : w));
        showToast(`🔒 ${worker.name} status switched to ${newStatus ? "Verified" : "Unverified"}`);
      }
    } catch (err) {
      showToast("❌ Error updating toggle");
    }
  };

  // Filters
  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.category.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.locations.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.phone.includes(workerSearch)
  );

  const filteredAppointments = appointments.filter(a =>
    a.customerName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
    a.category.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
    a.location.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
    a.description.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
    a.status.toLowerCase().includes(appointmentSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.location.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Admin Login Verification check — calls server API (no hardcoded passwords)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setLoginError(null);
      } else {
        setLoginError("Invalid credentials. Please check your admin password.");
      }
    } catch (err) {
      setLoginError("Server error. Please try again.");
    }
  };

  // Computed summary metrics
  const totalPros = workers.length;
  const verifiedPros = workers.filter(w => w.isVerified).length;
  const totalLeads = appointments.length;
  const pendingLeads = appointments.filter(a => a.status !== "Completed" && a.status !== "Cancelled").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Sliders className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-950 tracking-tight">Tekton Admin Operations</h1>
            <p className="text-xs text-slate-500">Secure access required to modify core schemas</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Login ID *</label>
              <input
                type="text"
                required
                placeholder="Enter ID (admin)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Administrator Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Authenticate Command Access
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link href="/" className="text-slate-500 hover:text-slate-900 text-xs font-semibold inline-flex items-center space-x-1">
              <span>← Return to Public Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased selection:bg-slate-200">
      
      {/* Toast feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-xl shadow-xl border border-slate-800 text-xs font-medium animate-fade-in flex items-center space-x-2">
          <span>{toast}</span>
        </div>
      )}

      {/* TOP PREMIUM HEADER BANNER */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Website</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <div className="bg-[#1E293B] text-white p-1.5 rounded-lg">
                <Sliders className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-slate-900 block leading-none">Tekton Command Center</span>
                <span className="text-[10px] text-slate-500 font-medium">Bhopal Core Master Administrator</span>
              </div>
            </div>
          </div>

          {/* Quick triggers */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPassword("");
                showToast("🔒 Logged out of Admin Console");
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg transition"
              title="Lock Admin Workspace"
            >
              Logout
            </button>

            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
              title="Refresh all metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <button
              onClick={handleMasterReset}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
              title="Wipe custom inputs & reload baseline Bhopal specialists list"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Master Schema Reset</span>
              <span className="md:hidden">Reset</span>
            </button>
          </div>

        </div>
      </header>

      {/* DASHBOARD CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PREMIUM SUBTLE STATS OVERVIEW CARDS (Neat & Clean Theme) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered Artisans</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalPros}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Active across Bhopal zones</span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verified Pros</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{verifiedPros}</span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block flex items-center">
                <UserCheck className="w-3 h-3 mr-0.5" /> {Math.round((verifiedPros/ (totalPros || 1))*100)}% Trusted Rating
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Enquiries</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalLeads}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Bhopal manual requests</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending / Live Dispatch</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">{pendingLeads}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Awaiting completion state</span>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered Users</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{users.length}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Bhopal Customer Accounts</span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* ADMIN TAB NAVIGATION */}
        <div className="bg-white rounded-xl p-1.5 border border-slate-200 mb-6 flex overflow-x-auto hide-scrollbar space-x-1 whitespace-nowrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "overview" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab("workers")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "workers" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manage Workers ({filteredWorkers.length})
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "appointments" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Task Leads ({filteredAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "users" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Users ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "analytics" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Analytics & Charts
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "coupons" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manage Coupons
          </button>
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Quick Summary Guidelines Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">Platform Control Mechanisms</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">🛠️ Editing Skilled Workers</strong>
                  Switch to the <em>Manage Workers</em> tab to instantly modify pricing, contact numbers, skills, or operational reach inside Bhopal. Toggling the badge verifies or un-verifies their state live on the main client application.
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">📅 Leads & Task Command</strong>
                  In the <em>Task Leads</em> panel, edit client phone numbers, exact requested works ("kya kam karana h"), adjust scheduled timeslots, or dynamically map specific Worker IDs directly to assigned jobs.
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">📍 Exclusive Bhopal Constraint</strong>
                  All newly requested artisans automatically have Bhopal integrated into their geographical mapping scope to conform to the precise user parameters.
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">🧹 Housekeeping Controls</strong>
                  Clean out spam test enquiries or broken dummy listings instantly by clicking the trashbin icons without requiring structural code redeploys.
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab("workers")}
                  className="bg-[#1E293B] hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                >
                  Browse Artisans Table ➜
                </button>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2 rounded-lg transition"
                >
                  Inspect Incoming Leads ➜
                </button>
              </div>
            </div>

            {/* Quick Sidebar: Platform Live Configurations */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Environment Core Info</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Database Framework</span>
                    <span className="font-semibold text-slate-800">PostgreSQL + Drizzle</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Service Model</span>
                    <span className="font-semibold text-slate-800">Blinkit Express App Feel</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Guaranteed Dispatch Slot</span>
                    <span className="font-semibold text-emerald-600 font-bold">10-Minute Response</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Target Base Scope</span>
                    <span className="font-semibold text-amber-900">Bhopal City Exclusively</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-950 mt-4 leading-tight">
                  <strong>Soothing Professional UI:</strong> Color arrays have been fine-tuned to dark slate accents and minimalist grey structures to satisfy visual neatness ("ankho me na chubhe").
                </div>
              </div>

              {/* Seed state helper */}
              <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h5 className="font-bold text-xs text-white uppercase tracking-wider">Fast Testing Support</h5>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  If the user views are empty or if test data appears disorganized, press the <strong>Master Schema Reset</strong> button located on the top right header to inject beautifully clean default state.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENT: MANAGE WORKERS */}
        {activeTab === "workers" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fade-in">
            
            {/* Table controls */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter name, skill or zone..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                />
              </div>

              <div className="text-xs text-slate-500 shrink-0">
                Click <span className="font-bold text-slate-800">Verified Badge</span> to switch trust levels instantly.
              </div>
            </div>

            {/* Main Listing Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading core schema records...</div>
              ) : filteredWorkers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No artisans found matching "{workerSearch}". Try resetting filter or global re-seed.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Artisan Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Phone Line</th>
                      <th className="py-3 px-3">Base Visit Cost</th>
                      <th className="py-3 px-3">Bhopal Operating Zones</th>
                      <th className="py-3 px-3 text-center">Roster State</th>
                      <th className="py-3 px-3 text-center">Verified Status</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkers.map((worker) => (
                      <React.Fragment key={worker.id}>
                        <tr className="hover:bg-slate-50/80 transition">
                          
                          {/* Name & avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={worker.avatarUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                                }}
                              />
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">{worker.name}</span>
                                <span className="text-[10px] text-slate-400 block font-medium">★ {worker.rating} ({worker.reviewsCount} rev)</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {worker.category}
                            </span>
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {worker.phone}
                          </td>

                          {/* Base Price */}
                          <td className="py-3 px-3 font-bold text-slate-900">
                            ₹{worker.basePrice}
                          </td>

                          {/* Locations */}
                          <td className="py-3 px-3">
                            <span className="text-slate-600 line-clamp-1 max-w-xs">
                              {worker.locations}
                            </span>
                          </td>

                          {/* Roster state workflow approval/rejection */}
                          <td className="py-3 px-3 text-center">
                            <div className="space-y-1">
                              <span className={`block px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                                worker.status === "Approved" ? "bg-emerald-100 text-emerald-850" :
                                worker.status === "Rejected" ? "bg-rose-100 text-rose-850" : "bg-amber-100 text-amber-850"
                              }`}>
                                ● {worker.status || "Approved"}
                              </span>
                              
                              <div className="flex items-center justify-center space-x-1 mt-1">
                                {worker.status !== "Approved" && (
                                  <button
                                    onClick={() => updateWorkerStatus(worker.id, "Approved", true, worker.name)}
                                    className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded"
                                    title="Approve Profile"
                                  >
                                    Approve
                                  </button>
                                )}
                                {worker.status !== "Rejected" && (
                                  <button
                                    onClick={() => updateWorkerStatus(worker.id, "Rejected", false, worker.name)}
                                    className="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[9px] rounded"
                                    title="Reject Profile"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Verification toggle inline */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => toggleWorkerVerification(worker)}
                              title="Click to flip authentication state"
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                                worker.isVerified
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700"
                                  : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {worker.isVerified ? "✓ Verified" : "Unverified"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setExpandedWorkerKycId(expandedWorkerKycId === worker.id ? null : worker.id)}
                                className={`px-2 py-1 rounded-lg transition text-[10px] font-bold flex items-center ${
                                  expandedWorkerKycId === worker.id
                                    ? "bg-slate-900 text-white"
                                    : "text-indigo-750 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150"
                                }`}
                                title="Inspect KYC Dossier"
                              >
                                📄 KYC
                              </button>

                              <button
                                onClick={() => setEditingWorker(worker)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Full Profile Editor"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteWorker(worker.id, worker.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Record Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>

                        {expandedWorkerKycId === worker.id && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={8} className="px-6 py-4 border-t border-b border-slate-100">
                              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs max-w-5xl mx-auto space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
                                      <Users className="w-4 h-4" />
                                    </span>
                                    <div>
                                      <h4 className="font-bold text-slate-900 text-xs">KYC Verification Dossier - {worker.name}</h4>
                                      <p className="text-[10px] text-slate-450">Review official artisan identification, bank credentials, and selfie verification</p>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                                    worker.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                                    worker.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                                  }`}>
                                    Status: {worker.status || "Pending Approval"}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  {/* Selfie Card */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Selfie Photo</span>
                                      {worker.selfieUrl ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-150 flex items-center justify-center">
                                          <img src={worker.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                                          <a href={worker.selfieUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition">Open Original ↗</a>
                                        </div>
                                      ) : (
                                        <div className="border-2 border-dashed border-slate-200 rounded-lg aspect-square bg-white flex flex-col items-center justify-center text-[10px] text-slate-450 p-2 text-center">
                                          <span>Selfie Not Uploaded</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Aadhaar Card */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Aadhaar Card</span>
                                      {worker.aadhaarUrl ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-150 flex items-center justify-center">
                                          <img src={worker.aadhaarUrl} alt="Aadhaar" className="w-full h-full object-cover" />
                                          <a href={worker.aadhaarUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition">Open Original ↗</a>
                                        </div>
                                      ) : (
                                        <div className="border-2 border-dashed border-slate-200 rounded-lg aspect-square bg-white flex flex-col items-center justify-center text-[10px] text-slate-450 p-2 text-center">
                                          <span>Aadhaar Not Uploaded</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* PAN Card */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">PAN Card</span>
                                      {worker.panUrl ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-150 flex items-center justify-center">
                                          <img src={worker.panUrl} alt="PAN Card" className="w-full h-full object-cover" />
                                          <a href={worker.panUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition">Open Original ↗</a>
                                        </div>
                                      ) : (
                                        <div className="border-2 border-dashed border-slate-200 rounded-lg aspect-square bg-white flex flex-col items-center justify-center text-[10px] text-slate-450 p-2 text-center">
                                          <span>PAN Not Uploaded</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Bank Passbook */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bank Passbook</span>
                                      {worker.passbookUrl ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-150 flex items-center justify-center">
                                          <img src={worker.passbookUrl} alt="Passbook" className="w-full h-full object-cover" />
                                          <a href={worker.passbookUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition">Open Original ↗</a>
                                        </div>
                                      ) : (
                                        <div className="border-2 border-dashed border-slate-200 rounded-lg aspect-square bg-white flex flex-col items-center justify-center text-[10px] text-slate-450 p-2 text-center">
                                          <span>Passbook Not Uploaded</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 text-[10px]">
                                  {worker.status !== "Approved" && (
                                    <button
                                      onClick={() => updateWorkerStatus(worker.id, "Approved", true, worker.name)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                                    >
                                      Approve & Verify
                                    </button>
                                  )}
                                  {worker.status !== "Rejected" && (
                                    <button
                                      onClick={() => updateWorkerStatus(worker.id, "Rejected", false, worker.name)}
                                      className="px-3 py-1 bg-rose-550 hover:bg-rose-600 bg-rose-500 text-white font-bold rounded-lg transition"
                                    >
                                      Reject KYC Dossier
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setExpandedWorkerKycId(null)}
                                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 font-bold rounded-lg transition"
                                  >
                                    Close Drawer
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Bottom context notice */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              Showing total live roster lists connected to public search queries. Changes persist instantly into PostgreSQL via Drizzle.
            </div>

          </div>
        )}

        {/* TAB CONTENT: MANAGE APPOINTMENTS / LEADS */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fade-in">
            
            {/* Controls */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer, requested works..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                />
              </div>

              <div className="text-xs text-slate-500">
                Sorted by latest submission order. Direct command assignment available.
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading leads framework...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No active custom service requests correspond with this view query.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Lead ID & Customer</th>
                      <th className="py-3 px-3">Bhopal Address Sub-Zone</th>
                      <th className="py-3 px-3">Service Scope</th>
                      <th className="py-3 px-4">Kya Kam Karana Hai (Description)</th>
                      <th className="py-3 px-3">Assigned Artisan ID</th>
                      <th className="py-3 px-3">Status State</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((app) => {
                      const assignedPro = workers.find(w => w.id === app.assignedWorkerId);

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition">
                          
                          {/* ID & Customer */}
                          <td className="py-3 px-4 align-top">
                            <span className="font-bold text-slate-900 block leading-tight">
                              #{app.id} • {app.customerName}
                            </span>
                            <span className="text-[10px] text-slate-500 block">📞 {app.customerPhone}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">📅 {app.appointmentDate} ({app.appointmentTime})</span>
                          </td>

                          {/* Address */}
                          <td className="py-3 px-3 align-top max-w-xs">
                            <span className="font-semibold text-slate-800 block text-[11px]">{app.location}</span>
                            <span className="text-slate-500 text-[10px] line-clamp-2 italic">{app.customerAddress}</span>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 align-top">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                              {app.category}
                            </span>
                          </td>

                          {/* Requested specific works */}
                          <td className="py-3 px-4 align-top max-w-xs">
                            <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] leading-tight line-clamp-3">
                              {app.description}
                            </p>
                          </td>

                          {/* Assigned Worker */}
                          <td className="py-3 px-3 align-top">
                            {assignedPro ? (
                              <div className="text-xs">
                                <span className="font-bold text-slate-900 block leading-tight">{assignedPro.name}</span>
                                <span className="text-[10px] text-indigo-600 block font-semibold">ID #{assignedPro.id}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block font-semibold">
                                Pending Assign
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 align-top">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                              app.status === "Confirmed" ? "bg-amber-100 text-amber-800" :
                              app.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                              app.status === "Cancelled" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                            }`}>
                              ● {app.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 align-top text-right shrink-0">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => setEditingAppointment(app)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-[11px] font-medium flex items-center space-x-0.5"
                                title="Edit Task Lead Properties"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteAppointment(app.id, app.customerName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Purge Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination footer guidance */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Bhopal Instant App Engine Lead Processing Layer</span>
              <span className="font-semibold">Showing {filteredAppointments.length} matching leads</span>
            </div>

          </div>
        )}

        {/* TAB CONTENT: MANAGE USERS */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fade-in">
            
            {/* Controls */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name, phone, zone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                />
              </div>

              <div className="text-xs text-slate-500">
                Registered customers inside Bhopal City limits.
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading customer profiles...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No registered users found matching "{userSearch}".
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">User ID & Name</th>
                      <th className="py-3 px-3">Phone Line</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Bhopal Sub-Zone</th>
                      <th className="py-3 px-3">Joined Date</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        
                        {/* ID & Name */}
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <img
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            src={u.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop"}
                            alt={u.name}
                          />
                          <span>#{u.id} • {u.name}</span>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-3 text-slate-650 font-medium">
                          {u.phone}
                        </td>

                        {/* Email */}
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {u.email || <span className="text-slate-400 italic">Not provided</span>}
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {u.location}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 px-3 text-slate-505 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit User Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Customer Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Bhopal Customer Directory Service</span>
              <span className="font-semibold">Showing {filteredUsers.length} registered users</span>
            </div>

          </div>
        )}

      </div>

        {/* TAB CONTENT: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in mt-6">
            <h1 className="text-xl font-black text-slate-900">Platform Analytics (Bhopal)</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: "₹4.2L", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Active Bookings", value: "142", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Registered Partners", value: "85", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Avg Ticket Size", value: "₹280", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6">
              <h3 className="text-sm font-black text-slate-900 mb-6">Revenue Trend (Last 7 Days)</h3>
              <div className="flex items-end gap-2 h-48">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-indigo-100 rounded-t-sm relative group-hover:bg-indigo-200 transition" style={{ height: `${h}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition">₹{h}k</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Day {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: COUPONS */}
        {activeTab === "coupons" && (
          <div className="space-y-6 animate-fade-in mt-6">
            <h1 className="text-xl font-black text-slate-900">Coupon Management</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2 space-y-4">
                {[
                  { code: "TEKTON10", type: "percent", value: 10, uses: 145 },
                  { code: "FIRSTBOOK", type: "flat", value: 50, uses: 890 },
                  { code: "BHOPAL2026", type: "flat", value: 30, uses: 34 }
                ].map((c) => (
                  <div key={c.code} className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                        <span className="text-amber-500 font-black">₹</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{c.code}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Usage</p>
                      <p className="text-sm font-black text-slate-700">{c.uses}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-1">
                <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 sticky top-24">
                  <h3 className="text-sm font-black text-slate-900 mb-4">Create New Coupon</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER50"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900">
                          <option value="flat">Flat ₹</option>
                          <option value="percent">Percent %</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Value</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Amount"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900"
                        />
                      </div>
                    </div>
                    <button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2">
                      <PlusCircle className="w-4 h-4" /> Add Coupon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* MODAL 1: EDIT SKILLED WORKER */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Core Roster Editor</span>
                <h3 className="font-bold text-sm text-white">Modify Artisan Profile #{editingWorker.id}</h3>
              </div>
              <button onClick={() => setEditingWorker(null)} className="text-slate-400 hover:text-white" title="Close editor" aria-label="Close worker editor">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateWorkerSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    title="Full Name"
                    placeholder="e.g. Ramesh Sharma"
                    value={editingWorker.name}
                    onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Line</label>
                  <input
                    type="text"
                    required
                    title="Phone Number"
                    placeholder="10-digit mobile number"
                    value={editingWorker.phone}
                    onChange={(e) => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    title="Select service category"
                    aria-label="Service Category"
                    value={editingWorker.category}
                    onChange={(e) => setEditingWorker({ ...editingWorker, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    title="Base visiting price in rupees"
                    placeholder="49"
                    value={editingWorker.basePrice}
                    onChange={(e) => setEditingWorker({ ...editingWorker, basePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exp. (Yrs)</label>
                  <input
                    type="number"
                    required
                    title="Years of experience"
                    placeholder="e.g. 5"
                    value={editingWorker.experienceYears}
                    onChange={(e) => setEditingWorker({ ...editingWorker, experienceYears: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bhopal Covered Locations</label>
                <input
                  type="text"
                  required
                  title="Bhopal covered locations"
                  placeholder="e.g. MP Nagar, Arera Colony, Kolar Road, Bhopal"
                  value={editingWorker.locations}
                  onChange={(e) => setEditingWorker({ ...editingWorker, locations: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Ensure "Bhopal" tag stays bound to map correctly.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialties Bio</label>
                <textarea
                  rows={2}
                  title="Worker specialties bio"
                  placeholder="Describe the worker's specialties and expertise..."
                  value={editingWorker.bio}
                  onChange={(e) => setEditingWorker({ ...editingWorker, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  title="Avatar image URL"
                  placeholder="https://images.unsplash.com/..."
                  value={editingWorker.avatarUrl}
                  onChange={(e) => setEditingWorker({ ...editingWorker, avatarUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-600 truncate"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Roster Access State</label>
                  <select
                    title="Roster access state"
                    aria-label="Roster Access State"
                    value={editingWorker.status || "Approved"}
                    onChange={(e) => setEditingWorker({ ...editingWorker, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  >
                    <option value="Approved">Approved (Public)</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Blocked">Blocked (Suspended)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end pb-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="modalVerified"
                      checked={editingWorker.isVerified}
                      onChange={(e) => setEditingWorker({ ...editingWorker, isVerified: e.target.checked })}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <label htmlFor="modalVerified" className="font-bold text-slate-900 cursor-pointer text-[11px]">
                      Verified Trusted Tag
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition"
                >
                  Save Profile Settings Live
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT APPOINTMENT / LEAD */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lead Workflow Mapping</span>
                <h3 className="font-bold text-sm text-white">Edit Customer Task Lead #{editingAppointment.id}</h3>
              </div>
              <button onClick={() => setEditingAppointment(null)} className="text-slate-400 hover:text-white" title="Close editor" aria-label="Close appointment editor">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAppointmentSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 leading-tight">
                <strong>Requested Client:</strong> {editingAppointment.customerName} ({editingAppointment.customerPhone})
                <span className="block text-slate-500 mt-0.5">📍 Address: {editingAppointment.customerAddress}, {editingAppointment.location}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kya Kam Karana Hai? (Task description text)
                </label>
                <textarea
                  rows={3}
                  required
                  title="Task description"
                  placeholder="Describe what work needs to be done..."
                  value={editingAppointment.description}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schedule Date</label>
                  <input
                    type="date"
                    required
                    title="Appointment schedule date"
                    placeholder="YYYY-MM-DD"
                    value={editingAppointment.appointmentDate}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointmentDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Arrival Time Frame</label>
                  <input
                    type="text"
                    required
                    title="Arrival time frame"
                    placeholder="e.g. 09:00 AM - 11:00 AM"
                    value={editingAppointment.appointmentTime}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointmentTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-indigo-900 mb-1">Assign Pro / Artisan ID</label>
                  <select
                    title="Assign professional to this task"
                    aria-label="Assign Pro / Artisan"
                    value={editingAppointment.assignedWorkerId || ""}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, assignedWorkerId: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-2 font-semibold text-indigo-950"
                  >
                    <option value="">-- No Pro Assigned (Pending) --</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>
                        ID #{w.id} - {w.name} ({w.category})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Maps professional profile natively to the customer view.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Update Processing State</label>
                  <select
                    title="Update appointment processing state"
                    aria-label="Update Processing State"
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  >
                    <option value="Pending">Pending Dispatch</option>
                    <option value="Confirmed">Confirmed Live</option>
                    <option value="Completed">Completed Task</option>
                    <option value="Cancelled">Cancelled Lead</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Updates progress light instantly on client tab.</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition"
                >
                  Save Lead Modification Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER PROFILE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Customer Directory Editor</span>
                <h3 className="font-bold text-sm text-white">Modify User Profile #{editingUser.id}</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white" title="Close editor" aria-label="Close user editor">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Sagar"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Line</label>
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile number"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. amit@gmail.com"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bhopal Sub-Zone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Awadhpuri, Arera Colony"
                  value={editingUser.location}
                  onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition"
                >
                  Save User Profile Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SOOTHING PREMIUM FOOTER */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium">Tekton Web Command Operations Console • Tailored exclusively for Bhopal, Madhya Pradesh infrastructure.</p>
          <p className="text-[10px] mt-1">Design aesthetics parameterized for clean minimalism without eyestrain. Built securely atop Next.js server routers.</p>
        </div>
      </footer>

    </div>
  );
}
