"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, PhoneCall, MapPin, CheckCircle, Clock, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Worker {
  id: number;
  name: string;
  phone: string;
  category: string;
  isVerified: boolean;
  avatarUrl: string;
  status: string;
  rating: string;
  portfolio?: string[];
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
}

export default function WorkerDashboard() {
  const [phone, setPhone] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<Worker | null>(null);
  
  const [myJobs, setMyJobs] = useState<Appointment[]>([]);
  const [openPoolJobs, setOpenPoolJobs] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portfolio states
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // Auto-refresh interval for Rapido vibe
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoggedIn && workerProfile) {
      interval = setInterval(() => {
        fetchMyJobs(workerProfile);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, workerProfile]);

  useEffect(() => {
    const savedPhone = localStorage.getItem("tektonWorkerPhone");
    if (savedPhone) {
      setPhone(savedPhone);
      handleLogin(savedPhone);
    }
  }, []);

  const handleLogin = async (loginPhone: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workers?phone=${loginPhone}`);
      const allWorkers = await res.json();
      
      if (!res.ok || !Array.isArray(allWorkers)) {
        setError(allWorkers?.error || "Failed to retrieve worker profile.");
        setLoading(false);
        return;
      }
      
      const foundWorker = allWorkers[0];
      if (foundWorker) {
        if (foundWorker.status === "Blocked") {
          setError("Your account has been blocked by the Admin. Please contact support.");
          setLoading(false);
          return;
        }
        setWorkerProfile(foundWorker);
        setIsLoggedIn(true);
        localStorage.setItem("tektonWorkerPhone", loginPhone);
        fetchMyJobs(foundWorker);
      } else {
        setError("Account not found. Ensure you are registered & approved by Admin.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
    setLoading(false);
  };

  const fetchMyJobs = async (worker: Worker) => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      
      // Jobs specifically assigned to me OR accepted by me
      const assignedToMe = data.filter((app: Appointment) => app.assignedWorkerId === worker.id);
      
      // Open pool jobs: Pending, not assigned to anyone, matches my category
      const openLeads = data.filter((app: Appointment) => 
        app.assignedWorkerId === null && 
        app.status === "Pending" && 
        app.category === worker.category
      );

      // Sort my jobs
      assignedToMe.sort((a: Appointment, b: Appointment) => {
        const order = { "Pending": 1, "Confirmed": 2, "Completed": 3, "Cancelled": 4 };
        return (order[a.status as keyof typeof order] || 5) - (order[b.status as keyof typeof order] || 5);
      });

      setMyJobs(assignedToMe);
      setOpenPoolJobs(openLeads);
    } catch (err) {
      console.error(err);
    }
  };

  const acceptJob = async (appId: number) => {
    if (!workerProfile) return;
    try {
      const res = await fetch(`/api/appointments/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Confirmed", assignedWorkerId: workerProfile.id })
      });
      if (res.ok) {
        fetchMyJobs(workerProfile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const rejectJob = async (appId: number) => {
    if (!workerProfile) return;
    try {
      // Rejecting pushes it to the open pool (assignedWorkerId = null)
      const res = await fetch(`/api/appointments/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedWorkerId: null, status: "Pending" })
      });
      if (res.ok) {
        fetchMyJobs(workerProfile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markJobComplete = async (appId: number) => {
    if (!confirm("Are you sure this job is successfully completed?")) return;
    try {
      const res = await fetch(`/api/appointments/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" })
      });
      if (res.ok) {
        setMyJobs(prev => prev.map(job => job.id === appId ? { ...job, status: "Completed" } : job));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolioUrl.trim() || !workerProfile) return;
    setUploadingPortfolio(true);
    setPortfolioError(null);
    try {
      const currentPortfolio = workerProfile.portfolio || [];
      const updatedPortfolio = [...currentPortfolio, newPortfolioUrl.trim()];
      
      const res = await fetch(`/api/workers/${workerProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: updatedPortfolio })
      });
      
      if (res.ok) {
        const updatedWorker = await res.json();
        setWorkerProfile(updatedWorker);
        setNewPortfolioUrl("");
      } else {
        setPortfolioError("Failed to update portfolio.");
      }
    } catch (err) {
      setPortfolioError("Server error. Try again.");
    }
    setUploadingPortfolio(false);
  };

  const logout = () => {
    localStorage.removeItem("tektonWorkerPhone");
    setIsLoggedIn(false);
    setWorkerProfile(null);
    setPhone("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[#F8CB46] text-slate-900 rounded-full flex items-center justify-center mx-auto shadow-md border-4 border-amber-100">
              <Briefcase className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-4">Partner Login</h1>
            <p className="text-xs text-slate-500 font-medium">Log in to view your assigned tasks & earnings.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">Registered Phone Number</label>
              <input
                type="tel"
                placeholder="Enter 10 digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#F8CB46] outline-none"
              />
            </div>
            <button
              onClick={() => handleLogin(phone)}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-slate-100">
            <Link href="/" className="text-slate-500 hover:text-slate-900 text-xs font-semibold inline-flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pending vs Completed stats
  const activeJobs = myJobs.filter(j => j.status !== "Completed" && j.status !== "Cancelled");
  const completedJobs = myJobs.filter(j => j.status === "Completed");

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Header */}
      <header className="bg-slate-950 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={workerProfile?.avatarUrl} className="w-9 h-9 rounded-full border-2 border-[#F8CB46] object-cover" alt="" />
            <div>
              <h2 className="font-bold text-sm leading-tight text-white">{workerProfile?.name}</h2>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                {workerProfile?.isVerified ? "✓ Verified Partner" : "Pending Verification"}
              </span>
            </div>
          </div>
          <button onClick={logout} title="Logout" aria-label="Logout" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <LogOut className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Earnings & Stats Snapshot */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 text-indigo-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Active Jobs</span>
            </div>
            <span className="text-3xl font-black text-slate-900">{activeJobs.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Currently working</span>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 text-amber-600 mb-1">
              <Briefcase className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Open Pool</span>
            </div>
            <span className="text-3xl font-black text-slate-900">{openPoolJobs.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Available to accept</span>
          </div>
        </div>

        {/* OPEN POOL LEADS (Rapido Style) */}
        {openPoolJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4 bg-amber-100 text-amber-900 p-3 rounded-xl border border-amber-200">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider">New Leads Available!</h3>
            </div>
            
            <div className="space-y-4">
              {openPoolJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] overflow-hidden">
                  <div className="px-4 py-2 bg-amber-50 text-[10px] font-black text-amber-800 uppercase flex justify-between">
                    <span>Pool Lead #{job.id}</span>
                    <span>📍 {job.location}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-base">{job.category} Task</h4>
                    <p className="text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded my-2 border border-slate-100">{job.description}</p>
                    <div className="flex space-x-2 mt-4">
                      <button onClick={() => acceptJob(job.id)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg shadow-sm transition">
                        Accept Lead
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-200 pb-2">Your Task Assignments</h3>

        {loading && myJobs.length === 0 && openPoolJobs.length === 0 && <div className="text-center text-slate-500 py-10 animate-pulse font-bold">Loading tasks...</div>}
        
        {!loading && myJobs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-slate-800 font-bold">No jobs assigned yet</h4>
            <p className="text-xs text-slate-500 mt-1">Wait for a direct assignment or accept leads from the open pool.</p>
          </div>
        )}

        <div className="space-y-4">
          {myJobs.map((job) => {
            const isPendingDirect = job.status === "Pending";
            const isActive = job.status === "Confirmed";
            
            return (
              <div key={job.id} className={`bg-white rounded-2xl border ${isActive ? "border-amber-200 shadow-md" : "border-slate-200 shadow-sm"} overflow-hidden relative`}>
                
                {/* Status Bar */}
                <div className={`px-4 py-2 text-[10px] font-black uppercase flex justify-between items-center ${
                  isActive ? "bg-amber-50 text-amber-900" : "bg-slate-100 text-slate-500"
                }`}>
                  <span>Lead ID: #{job.id}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    job.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                    job.status === "Cancelled" ? "bg-rose-100 text-rose-700" :
                    "bg-amber-200 text-amber-900"
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="p-5">
                  {/* Customer Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg leading-tight">{job.customerName}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-start">
                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 mt-0.5" />
                        <span>{job.customerAddress}, {job.location}</span>
                      </p>
                    </div>
                    {isActive && (
                      <a href={`tel:${job.customerPhone}`} title={`Call ${job.customerName}`} aria-label={`Call customer ${job.customerName}`} className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0 hover:bg-green-200 transition">
                        <PhoneCall className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Task Details */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kya Kam Karana Hai</span>
                    <p className="text-sm font-medium text-slate-800 leading-snug">{job.description}</p>
                    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">DATE</span>
                        <span className="font-bold text-slate-900">{job.appointmentDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">TIME</span>
                        <span className="font-bold text-slate-900">{job.appointmentTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPendingDirect ? (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => acceptJob(job.id)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg transition shadow-sm text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectJob(job.id)}
                        className="flex-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold py-2.5 rounded-lg transition shadow-sm text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  ) : isActive ? (
                    <button
                      onClick={() => markJobComplete(job.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <CheckCircle className="w-5 h-5" /> Mark Job as Completed
                    </button>
                  ) : (
                    <div className="text-center text-xs font-bold text-slate-400 uppercase bg-slate-50 py-2 rounded-xl">
                      {job.status === "Completed" ? "✓ Task Successfully Finished" : "× Task Cancelled"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Portfolio / Recent Work Section */}
        <div className="mt-10">
          <h3 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-200 pb-2">My Recent Work (Portfolio)</h3>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Add New Work Photo</h4>
            <p className="text-xs text-slate-500 mb-4">Add image URLs of your completed tasks to show customers your skills.</p>
            
            {portfolioError && (
              <div className="p-2 mb-3 bg-rose-50 text-rose-700 text-xs rounded-lg font-bold">
                {portfolioError}
              </div>
            )}
            
            <div className="flex space-x-2">
              <input 
                type="url" 
                placeholder="Paste image URL (e.g. https://.../image.jpg)"
                value={newPortfolioUrl}
                onChange={(e) => setNewPortfolioUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#F8CB46] outline-none"
              />
              <button 
                onClick={handleAddPortfolio}
                disabled={uploadingPortfolio || !newPortfolioUrl.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 rounded-xl text-sm disabled:opacity-50 transition"
              >
                {uploadingPortfolio ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {workerProfile?.portfolio && workerProfile.portfolio.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {workerProfile.portfolio.map((imgUrl, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                  <img src={imgUrl} alt={`Portfolio ${idx+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
              <p className="text-sm font-medium text-slate-400">No recent work photos added yet.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
