"use client"

import React, { useState, useEffect } from "react"
import { LogOut, Calendar, Users, FileCheck, CheckCircle, XCircle, AlertCircle, MapPin } from "lucide-react"
import Link from "next/link"

export default function AdminControlPanel() {
  // Tab selection
  const [activeTab, setActiveTab] = useState<"bookings" | "workers" | "serviceAreas">("bookings")

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Real data states (initially empty)
  const [bookings, setBookings] = useState<Array<{
    id: string
    customerName: string
    location: string
    category: string
    appointmentDate: string
    appointmentTime: string
    status: string
    // optional fields that may exist
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

  // Helper to mask Aadhaar numbers
  const maskAadhar = (aadhar?: string) => {
    if (!aadhar) return "[Aadhaar Redacted]"
    const last4 = aadhar.slice(-4)
    return `XXXX-XXXX-${last4}`
  }

  // Fetch bookings and workers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, workerRes, areaRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/workers"),
          fetch("/api/service-areas"),
        ])
        const bookingsData = bookRes.ok ? await bookRes.json() : []
        const workersData = workerRes.ok ? await workerRes.json() : []
        const areaData = areaRes.ok ? await areaRes.json() : []
        setBookings(bookingsData)
        setWorkers(workersData)
        setServiceAreas(areaData)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setBookings([])
        setWorkers([])
        setServiceAreas([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Update booking status via API
  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedWorkerId: workerId, status: "Assigned" }),
      });
      if (!res.ok) throw new Error("Failed to assign worker");
      // Optimistically update local state
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
        headers: { "Content-Type": "application/json" },
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

  // Loading UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
        <p className="text-xl font-medium">Loading dashboard data...</p>
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
        <div className="flex space-x-6 border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 text-sm sm:text-base font-bold transition-all relative ${activeTab === "bookings" ? "text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            Manage Bookings
            {activeTab === "bookings" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("workers")}
            className={`pb-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 ${activeTab === "workers" ? "text-yellow-400" : "text-slate-400 hover: text-slate-200"}`}
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
            onClick={() => setActiveTab("serviceAreas")}
            className={`pb-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 ${activeTab === "serviceAreas" ? "text-yellow-400" : "text-slate-400 hover: text-slate-200"}`}
          >
            Service Zones
            {activeTab === "serviceAreas" && (
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
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
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
          ) : activeTab === "serviceAreas" ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-400" /> Bhopal Service Zones
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {serviceAreas.map(area => (
                  <div key={area.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{area.name}</h3>
                      <p className="text-xs text-slate-400">{area.isActive ? "Active" : "Disabled"}</p>
                    </div>
                    <button
                      onClick={() => toggleServiceArea(area.id, area.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${area.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${area.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                ))}
                {serviceAreas.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-slate-500">
                    No service areas found.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
