"use client";

import React, { useState } from "react";
import { UserPlus, CheckCircle2, ArrowLeft, ShieldCheck, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Plumber",
  "Carpenter",
  "Electrician",
  "Painter",
  "Civil Architect",
  "Civil Construction",
  "Cleaning Service",
  "AC & Appliances"
];

export default function PartnerJoinPage() {
  const [workerForm, setWorkerForm] = useState({
    name: "",
    phone: "",
    category: "Plumber",
    experienceYears: 4,
    basePrice: 49,
    locations: "MP Nagar, Minal Residency, Indrapuri, Bhopal",
    bio: "",
    avatarUrl: "",
    aadhaarUrl: "",
    panUrl: "",
    passbookUrl: "",
    selfieUrl: "",
  });

  const handleFileChange = (field: "aadhaarUrl" | "panUrl" | "passbookUrl" | "selfieUrl") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size is too large! Please upload a file smaller than 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setWorkerForm(prev => ({
        ...prev,
        [field]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!workerForm.selfieUrl) { alert("Please upload your Selfie photo."); setLoading(false); return; }
    if (!workerForm.aadhaarUrl) { alert("Please upload your Aadhaar card."); setLoading(false); return; }
    if (!workerForm.panUrl) { alert("Please upload your PAN card."); setLoading(false); return; }
    if (!workerForm.passbookUrl) { alert("Please upload your Bank Passbook."); setLoading(false); return; }

    // Auto append Bhopal constraint
    const finalLocations = workerForm.locations.toLowerCase().includes("bhopal")
      ? workerForm.locations
      : `${workerForm.locations}, Bhopal`;

    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...workerForm, locations: finalLocations }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to register profile.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-100">
      
      {/* BRAND HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-600 hover:text-slate-950 text-xs font-bold transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tekton Homepage</span>
          </Link>
          
          <div className="bg-[#F8CB46] text-black font-black text-lg px-2.5 py-0.5 rounded-lg tracking-tight border border-amber-300">
            TEKTON <span className="text-[9px] bg-black text-white px-1 py-0.2 rounded font-black uppercase">Partner</span>
          </div>
        </div>
      </header>

      {/* CORE FORM CONTAINER */}
      <main className="max-w-xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        
        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center animate-fade-in space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <span className="bg-emerald-100 text-emerald-850 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
              Application Under Verification Queue
            </span>

            <h2 className="text-xl font-black text-slate-950">Registration Submitted Successfully!</h2>
            
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Thank you for signing up to offer premium manual task services in Bhopal. Your professional card has been pushed directly to the <strong>Admin Dashboard</strong>.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-[11px] text-amber-950 space-y-1">
              <strong className="block">⚡ What Happens Next?</strong>
              <span>Our local quality team will review your mobile line details. Upon admin approval, your active service block becomes searchable to normal clients starting with standard ₹49 budget requests.</span>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-block bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition"
              >
                Return to Home Platform
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-1 bg-amber-50 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 mb-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Bhopal Network Artisan Registry</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950">Register As Skilled Worker</h1>
              <p className="text-xs text-slate-500">Provide direct manual reachability across Madhya Pradesh hubs</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Line (10-Digit) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Mobile for active reach"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Core Professional Skill *</label>
                  <select
                    value={workerForm.category}
                    onChange={(e) => setWorkerForm({ ...workerForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={workerForm.experienceYears}
                    onChange={(e) => setWorkerForm({ ...workerForm, experienceYears: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Base Starting Fee (Starts from ₹49 natively) *
                </label>
                <input
                  type="number"
                  min="40"
                  max="5000"
                  required
                  placeholder="e.g. 49"
                  value={workerForm.basePrice}
                  onChange={(e) => setWorkerForm({ ...workerForm, basePrice: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Standard baseline visit budget requested by clients.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Covered Sub-Colonies in Bhopal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minal Residency, People's Mall, Ashoka Garden, MP Nagar, Indrapuri"
                  value={workerForm.locations}
                  onChange={(e) => setWorkerForm({ ...workerForm, locations: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Separate individual covered neighborhoods using commas.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Specialties & Owned Hardware Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention fast dispatch setup, certifications, custom tool kits..."
                  value={workerForm.bio}
                  onChange={(e) => setWorkerForm({ ...workerForm, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              {/* KYC DOCUMENTS & IDENTITY UPLOADS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-extrabold text-slate-900 flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Identity & Documents (KYC) *</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selfie Upload */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Selfie Photo *</label>
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={handleFileChange("selfieUrl")}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    {workerForm.selfieUrl && (
                      <div className="mt-2 flex items-center space-x-2">
                        <img src={workerForm.selfieUrl} alt="Selfie" className="w-8 h-8 rounded-full object-cover border border-slate-300" />
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Selected Selfie</span>
                      </div>
                    )}
                  </div>

                  {/* Aadhaar Upload */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Aadhaar Card *</label>
                    <input
                      type="file"
                      required
                      accept="image/*,application/pdf"
                      onChange={handleFileChange("aadhaarUrl")}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    {workerForm.aadhaarUrl && (
                      <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">✓ Selected Aadhaar</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PAN Upload */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PAN Card *</label>
                    <input
                      type="file"
                      required
                      accept="image/*,application/pdf"
                      onChange={handleFileChange("panUrl")}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    {workerForm.panUrl && (
                      <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">✓ Selected PAN</span>
                    )}
                  </div>

                  {/* Bank Passbook Upload */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Passbook *</label>
                    <input
                      type="file"
                      required
                      accept="image/*,application/pdf"
                      onChange={handleFileChange("passbookUrl")}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    {workerForm.passbookUrl && (
                      <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">✓ Selected Passbook</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-tight">
                🔒 <strong>Admin Roster Flow:</strong> Submitted profiles are routed securely into the command backend. Live visibility triggers instantly once authenticated by platform administrators.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F8CB46] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {loading ? "Transmitting Application..." : "Submit Profile to Admin Review"}
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-[10px] text-slate-400 shrink-0">
        <p>Tekton Verified Artisan Partnership Portal • Operating exclusively across municipal borders of Bhopal city.</p>
      </footer>

    </div>
  );
}
