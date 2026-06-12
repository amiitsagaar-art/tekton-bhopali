"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Zap, Power, IndianRupee, Clock, Check, X, LogOut } from "lucide-react";

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("tektonWorkerPhone");
    router.push("/");
  };

  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);

  // Load partner profile and jobs on mount
  useEffect(() => {
    const fetchData = async () => {
      const phone = localStorage.getItem("tektonWorkerPhone");
      if (!phone) {
        router.push("/");
        return;
      }

      try {
        const workersRes = await fetch(`/api/workers?phone=${phone}`);
        const workers = await workersRes.json();
        if (!workersRes.ok || !Array.isArray(workers)) {
          throw new Error("Failed to fetch worker profile.");
        }
        const partner = workers[0];

        // Strict validation: ensure partner exists
        if (!partner) {
          alert("This number is not registered as a Partner.");
          localStorage.removeItem("tektonWorkerPhone");
          router.push("/");
          return;
        }

        // Status validation
        const partnerStatus = partner.status?.toLowerCase();
        if (partnerStatus === "pending" || partnerStatus === "rejected") {
          alert(
            "Your partner application is currently " + partner.status + ". Please wait for admin approval."
          );
          localStorage.removeItem("tektonWorkerPhone");
          router.push("/");
          return;
        }

        // Success case – approved/active partner
        setPartnerProfile(partner);
        
        const appointmentsRes = await fetch(`/api/appointments?workerId=${partner.id}`);
        const appointments = await appointmentsRes.json();
        if (!appointmentsRes.ok || !Array.isArray(appointments)) {
          throw new Error("Failed to fetch assigned appointments.");
        }

        const myJobs = appointments;
        const assigned = myJobs.filter((b: any) => {
          const status = b.status?.toLowerCase();
          return status === "assigned" || status === "pending";
        });
        const active = myJobs.filter((b: any) => {
          const status = b.status?.toLowerCase();
          return ["accepted", "confirmed", "completed"].includes(status);
        });
        setAssignedJobs(assigned);
        setActiveJobs(active);

        // Calculate real earnings from completed jobs
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const completedJobs = myJobs.filter((b: any) => b.status?.toLowerCase() === "completed");
        const todayEarnings = completedJobs
          .filter((b: any) => b.appointmentDate === todayStr)
          .reduce((sum: number, b: any) => sum + (b.totalAmount || b.visitCharge || 0), 0);
        const weekEarnings = completedJobs
          .filter((b: any) => new Date(b.createdAt) >= oneWeekAgo)
          .reduce((sum: number, b: any) => sum + (b.totalAmount || b.visitCharge || 0), 0);
        const monthEarnings = completedJobs
          .filter((b: any) => new Date(b.createdAt) >= oneMonthAgo)
          .reduce((sum: number, b: any) => sum + (b.totalAmount || b.visitCharge || 0), 0);
        setEarnings({ today: todayEarnings, week: weekEarnings, month: monthEarnings });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleAcceptJob = async (id: number) => {
    const job = assignedJobs.find((j) => j.id === id);
    if (!job) return;
    const phone = localStorage.getItem("tektonWorkerPhone");
    if (!phone) return;
    try {
      const res = await fetch(`/api/appointments/${id}/partner-update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-worker-phone": phone,
        },
        body: JSON.stringify({ status: "Confirmed" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to accept job");
      }
      // Move job to active list with updated status
      setAssignedJobs((prev) => prev.filter((j) => j.id !== id));
      setActiveJobs((prev) => [...prev, { ...job, status: "Confirmed" }]);
    } catch (e: any) {
      console.error(e);
      alert("Could not accept job: " + (e.message || "Unknown error"));
    }
  };

  const handleDeclineJob = async (id: number) => {
    const phone = localStorage.getItem("tektonWorkerPhone");
    if (!phone) return;
    try {
      const res = await fetch(`/api/appointments/${id}/partner-update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-worker-phone": phone,
        },
        body: JSON.stringify({ status: "Pending", assignedWorkerId: null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to decline job");
      }
      setAssignedJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (e: any) {
      console.error(e);
      alert("Could not decline job: " + (e.message || "Unknown error"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <p className="text-xl font-bold">Loading Partner Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-white/10 px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-400 hover:text-yellow-400 text-xs font-bold transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-3 relative">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none group text-left cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition">{partnerProfile?.name || "Partner"}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-yellow-400 transition shrink-0">
                  <img src={partnerProfile?.avatarUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop"} alt="Profile" />
                </div>
              </button>
              <button
                onClick={() => setShowIdModal(true)}
                className="ml-3 text-xs font-medium text-yellow-400 hover:underline"
              >
                Show Digital ID
              </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-10 mt-1 w-32 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-450 hover:bg-white/5 hover:text-rose-400 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* DASHBOARD */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-xl font-black text-white">Partner Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">{partnerProfile?.category ? `${partnerProfile?.category} Specialist` : "Partner Specialist"}</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-white/10">
            <span className="text-xs font-bold px-2">Duty Status:</span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-black transition shadow-lg ${
                isOnline 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              <Power className={`w-4 h-4 ${isOnline ? "text-emerald-400" : "text-rose-400"}`} />
              <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </button>
          </div>
        </div>

        {/* Earnings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-yellow-400/30 transition">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Today's Earnings</p>
              <p className="text-2xl font-black text-white mt-1">₹{earnings.today}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
              <IndianRupee className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-yellow-400/30 transition">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">This Week</p>
              <p className="text-2xl font-black text-white mt-1">₹{earnings.week}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <IndianRupee className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-yellow-400/30 transition">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">This Month</p>
              <p className="text-2xl font-black text-white mt-1">₹{earnings.month}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Job Requests */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Incoming Job Requests
          </h2>
          
          {!isOnline ? (
            <div className="bg-slate-900/50 border border-rose-500/20 rounded-2xl p-8 text-center">
              <Power className="w-10 h-10 text-rose-500/50 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-300">You are currently OFFLINE</p>
              <p className="text-xs text-slate-500 mt-1">Go online to receive new task requests in Bhopal.</p>
            </div>
          ) : assignedJobs.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 text-center">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-300">No new requests right now</p>
              <p className="text-xs text-slate-500 mt-1">Stay online, we will notify you when a customer books.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedJobs.map(job => (
                <div key={job.id} className="bg-slate-900 rounded-2xl border border-white/10 p-5 flex flex-col gap-4 hover:border-yellow-400/20 transition group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Task #{job.id}</span>
                      <h3 className="text-sm font-black text-white mt-2">{job.category} Services</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-yellow-400" /> {job.appointmentDate} at {job.appointmentTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Estimated Pay</p>
                      <p className="text-lg font-black text-emerald-400">₹{job.totalAmount || job.visitCharge}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 rounded-xl p-3 text-xs border border-white/5">
                    <p className="text-slate-400 font-medium">📍 {job.customerAddress}</p>
                  </div>
                  
                  {job.status === "Assigned" ? (
                    <div className="flex gap-2 mt-auto pt-2">
                      <button 
                        onClick={() => handleAcceptJob(job.id)}
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Accept Task
                      </button>
                      <button 
                        onClick={() => handleDeclineJob(job.id)}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="mt-auto pt-2">
                      <div className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Task {job.status}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Active Jobs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeJobs.map(job => (
                <div key={job.id} className="bg-slate-900 rounded-2xl border border-white/10 p-5 flex flex-col gap-4 hover:border-yellow-400/20 transition group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Task #{job.id}</span>
                      <h3 className="text-sm font-black text-white mt-2">{job.category} Services</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-yellow-400" /> {job.appointmentDate} at {job.appointmentTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Estimated Pay</p>
                      <p className="text-lg font-black text-emerald-400">₹{job.totalAmount || job.visitCharge}</p>
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 text-xs border border-white/5">
                    <p className="text-slate-400 font-medium">📍 {job.customerAddress}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <div className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Task {job.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      
      {/* Digital ID Modal */}
      {showIdModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-blue-900 to-slate-950 rounded-2xl p-6 border border-yellow-400/30 shadow-xl">
            <button
              onClick={() => setShowIdModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-xs font-semibold tracking-widest text-yellow-400 uppercase">
                TEKTON VERIFIED PARTNER
              </h3>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 bg-slate-800 flex items-center justify-center">
                <img src={partnerProfile?.avatarUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop"} alt="Partner" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm font-bold text-white">{partnerProfile?.name || "Partner"}</p>
              <p className="text-xs text-slate-400">{partnerProfile?.category || "Specialist"}</p>
              <p className="text-xs text-slate-400">ID: {partnerProfile?.id || "N/A"}</p>
            </div>
            <div className="mt-6 flex justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TektonPartnerID"
                alt="QR Code"
                className="w-32 h-32 rounded-md border border-yellow-400/30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
