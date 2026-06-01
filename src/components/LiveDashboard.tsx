"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { 
  LayoutDashboard, 
  RefreshCw, 
  Menu, 
  X, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  PlusCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Booking {
  id: string;
  date: string;
  customer: string;
  phone: string;
  service: string;
  location: string;
  status: string;
  amount: number;
}

export default function LiveDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newService, setNewService] = useState("Plumber");

  // SWR automatically polls the API every 3 seconds! Real-time magic.
  const { data: bookings, error, mutate, isValidating } = useSWR<Booking[]>("/api/bookings", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true
  });

  const isLoading = !bookings && !error;

  // Real-time calculations
  const totalBookings = bookings?.length || 0;
  const pendingJobs = bookings?.filter(b => b.status === "NEW" || b.status === "ASSIGNED").length || 0;
  const completedJobs = bookings?.filter(b => b.status === "COMPLETED").length || 0;
  const totalEarnings = bookings?.filter(b => b.status === "COMPLETED").reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

  // Chart Data Preparation (Grouping by Date)
  const chartData = React.useMemo(() => {
    if (!bookings) return [];
    const grouped: Record<string, number> = {};
    bookings.forEach(b => {
      const dateOnly = new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[dateOnly] = (grouped[dateOnly] || 0) + 1;
    });
    // Convert to array and sort chronologically (since API returns newest first, reverse it)
    return Object.entries(grouped).map(([name, Bookings]) => ({ name, Bookings })).reverse();
  }, [bookings]);

  // Handlers
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    if (bookings) {
      mutate(
        bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
        false
      );
    }
    
    // API Call
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    // Revalidate
    mutate();
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer) return;
    
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer: newCustomer, service: newService, amount: Math.floor(Math.random() * 1000) + 200 }),
    });
    
    setNewCustomer("");
    setIsAddingBooking(false);
    mutate(); // instantly refresh the list
  };

  // UI Helpers
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col border-r border-slate-800
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-black text-white tracking-tight">Live<span className="text-emerald-400">Hub</span></span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold transition">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 -ml-2 text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black text-slate-900 hidden sm:block">Live Real-Time Tracker</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${isValidating ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <RefreshCw className={`w-3 h-3 ${isValidating ? 'animate-spin' : ''}`} />
              <span>{isValidating ? 'Syncing...' : 'Live Connected'}</span>
            </span>
            <button 
              onClick={() => setIsAddingBooking(!isAddingBooking)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Booking</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          
          {/* CREATE FORM (CONDITIONAL) */}
          {isAddingBooking && (
            <form onSubmit={handleCreateBooking} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-end animate-fade-in">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Customer Name</label>
                <input type="text" required value={newCustomer} onChange={e => setNewCustomer(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter name" />
              </div>
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Service Type</label>
                <select value={newService} onChange={e => setNewService(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option>Plumber</option><option>Electrician</option><option>Painter</option><option>Carpenter</option>
                </select>
              </div>
              <button type="submit" className="w-full sm:w-auto bg-slate-900 text-white font-bold px-6 py-2 rounded-lg text-sm hover:bg-slate-800">
                Submit Test Booking
              </button>
            </form>
          )}

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Bookings</h3>
              </div>
              <p className="text-3xl font-black text-slate-900">{isLoading ? "..." : totalBookings}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Jobs</h3>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{isLoading ? "..." : pendingJobs}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</h3>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{isLoading ? "..." : completedJobs}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Earnings</h3>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><IndianRupee className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-emerald-600">₹{isLoading ? "..." : totalEarnings}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* REAL TIME CHART */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 h-96 flex flex-col">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Booking Volume</h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="Bookings" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} animationDuration={500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LIVE TABLE */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Live Activity Feed</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">Booking ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Live Status</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading live data...</td></tr>
                    ) : bookings?.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No bookings yet.</td></tr>
                    ) : (
                      bookings?.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50 transition-colors animate-fade-in">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 block">{job.id}</span>
                            <span className="text-[10px] text-slate-500">{new Date(job.date).toLocaleTimeString()}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">{job.customer}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded uppercase">
                              {job.service}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${getStatusColor(job.status)}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {job.status !== "COMPLETED" && (
                              <button 
                                onClick={() => handleUpdateStatus(job.id, "COMPLETED")}
                                className="bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                Mark Done
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
