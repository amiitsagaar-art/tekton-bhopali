"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Upload, Award, MapPin, User, Phone, Sparkles, AlertCircle, FileText, BadgeCheck } from "lucide-react";

const CATEGORIES = [
  "Plumber",
  "Carpenter",
  "Electrician",
  "Painter",
  "Civil Architect",
  "Civil Construction",
  "Cleaning Service",
  "Tank Cleaning",
  "Interior Design",
  "Exterior Design",
  "AC & Appliances",
  "Washing Machine & Fridge",
  "CCTV Cameras",
  "Pest Control",
  "Car Wash",
  "General Helper"
];

export default function PartnerJoinPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [basePrice, setBasePrice] = useState("49");
  
  const [serviceCategory, setServiceCategory] = useState("Plumber");
  const [preferredZone, setPreferredZone] = useState("");
  const [bio, setBio] = useState("");
  
  const [aadharNumber, setAadharNumber] = useState("");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [aadhaarUrl, setAadhaarUrl] = useState<string | null>(null);
  const [panUrl, setPanUrl] = useState<string | null>(null);
  const [passbookUrl, setPassbookUrl] = useState<string | null>(null);

  // File names for display
  const [fileNames, setFileNames] = useState({
    selfie: "",
    aadhaar: "",
    pan: "",
    passbook: ""
  });

  const handleFileUpload = (field: "selfieUrl" | "aadhaarUrl" | "panUrl" | "passbookUrl", fileKey: "selfie" | "aadhaar" | "pan" | "passbook") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size is too large! Please upload a file smaller than 2MB.");
        e.target.value = "";
        return;
      }
      setFileNames(prev => ({ ...prev, [fileKey]: file.name }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "selfieUrl") setSelfieUrl(reader.result as string);
        if (field === "aadhaarUrl") setAadhaarUrl(reader.result as string);
        if (field === "panUrl") setPanUrl(reader.result as string);
        if (field === "passbookUrl") setPassbookUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentStep === 1) {
      if (fullName.trim().length < 2) {
        setErrorMsg("Please enter your full legal name.");
        return;
      }
      if (whatsappNumber.trim().length < 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!experienceYears || Number(experienceYears) < 1) {
        setErrorMsg("Please enter valid years of experience (minimum 1).");
        return;
      }
      if (!basePrice || Number(basePrice) < 40) {
        setErrorMsg("Please enter a valid starting fee (minimum ₹40).");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (preferredZone.trim().length < 3) {
        setErrorMsg("Please mention your covered sub-colonies in Bhopal.");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (aadharNumber.trim().length < 12) {
      setErrorMsg("Aadhar Card number must be exactly 12 digits.");
      return;
    }
    if (!selfieUrl) { setErrorMsg("Please upload your Selfie photo."); return; }
    if (!aadhaarUrl) { setErrorMsg("Please upload your Aadhaar card image."); return; }
    if (!panUrl) { setErrorMsg("Please upload your PAN card image."); return; }
    if (!passbookUrl) { setErrorMsg("Please upload your Bank Passbook image."); return; }

    setIsSubmitting(true);

    const payload = {
      fullName,
      whatsappNumber,
      serviceCategory,
      preferredZone,
      experienceYears: Number(experienceYears),
      basePrice: Number(basePrice),
      bio: bio.trim() || `Professional ${serviceCategory} serving ${preferredZone} zone in Bhopal.`,
      aadharNumber,
      selfieUrl,
      aadhaarUrl,
      panUrl,
      passbookUrl
    };

    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-yellow-500/20 selection:text-yellow-400">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-bold transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider bg-yellow-400/10 px-2.5 py-0.5 rounded border border-yellow-400/20">
              Artisan Onboarding
            </span>
          </div>
        </div>
      </header>

      {/* CORE BODY CONTAINER */}
      <main className="max-w-xl mx-auto px-4 py-12 w-full flex-1 flex flex-col justify-center">
        
        {isSuccess ? (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300 space-y-6">
            <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 rounded-full flex items-center justify-center mx-auto border border-yellow-400/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-wider text-white">
                Application Submitted!
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Our local quality verification team will review your application details and KYC documents within 24 hours. Thank you for joining the Tekton Bhopal network!
              </p>
            </div>

            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 text-left text-[11px] text-slate-400 space-y-1">
              <strong className="block text-yellow-400">📋 Next Steps:</strong>
              <span>We will verify your Aadhar, PAN, and active locations. Once approved, your artisan card will be published live on the homepage for client bookings.</span>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(250,204,21,0.2)]"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in-50 duration-200">
            
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-yellow-400/15 text-yellow-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-yellow-400/20 tracking-wider">
                <Sparkles className="w-3 h-3 animate-pulse text-yellow-400" />
                <span>Earn More with Tekton</span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-wide text-white">Register As Skilled Worker</h1>
              <p className="text-xs text-slate-400 font-semibold">Offer your specialized manual services directly to customers in Bhopal</p>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Application Progress</span>
                <span className="text-yellow-400">Step {currentStep} of 3</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* MULTI-STEP FORM */}
            <form onSubmit={currentStep === 3 ? handleSubmit : handleNext} className="space-y-4 text-xs">
              
              {/* STEP 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider">Full Legal Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider">WhatsApp Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          placeholder="10-digit mobile number"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider">Years of Experience *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="50"
                        placeholder="e.g. 5"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider">Base Starting Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="5000"
                      placeholder="e.g. 49"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Standard baseline visit budget requested by clients. Default starts from ₹49.</span>
                  </div>
                </div>
              )}

              {/* STEP 2: Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider">Service Category *</label>
                    <div className="relative">
                      <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <select
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition font-bold"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider">Covered Areas in Bhopal *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. MP Nagar, Arera Colony, Kolar Road, Indrapuri"
                        value={preferredZone}
                        onChange={(e) => setPreferredZone(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Separate individual covered neighborhoods in Bhopal using commas.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider">Specialties & Owned Hardware Details</label>
                    <textarea
                      rows={3}
                      placeholder="Mention your specialized fields, certifications, or custom tool kits you own..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl p-3.5 text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: KYC Verification */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider">Aadhar Card Number *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{12}"
                      placeholder="12-digit Aadhar number"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").substring(0, 12))}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition font-mono tracking-widest text-center"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Selfie Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider">Your Selfie Photo *</label>
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-white/10 border-dashed rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800 transition">
                        <div className="text-center p-2">
                          <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                          <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">
                            {fileNames.selfie || "Upload Selfie"}
                          </p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload("selfieUrl", "selfie")} className="hidden" />
                      </label>
                      {selfieUrl && (
                        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-lg border border-white/5">
                          <img src={selfieUrl} alt="Selfie Preview" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                          <span className="text-[8px] text-emerald-400 font-black">✓ Selfie Loaded</span>
                        </div>
                      )}
                    </div>

                    {/* Aadhaar Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider">Aadhaar Card Front *</label>
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-white/10 border-dashed rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800 transition">
                        <div className="text-center p-2">
                          <FileText className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                          <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">
                            {fileNames.aadhaar || "Upload Aadhaar"}
                          </p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload("aadhaarUrl", "aadhaar")} className="hidden" />
                      </label>
                      {aadhaarUrl && (
                        <span className="text-[8px] text-emerald-450 text-emerald-400 font-black flex items-center gap-0.5"><BadgeCheck className="w-3.5 h-3.5 text-emerald-400" /> Aadhar Loaded</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PAN Card Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider">PAN Card Image *</label>
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-white/10 border-dashed rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800 transition">
                        <div className="text-center p-2">
                          <FileText className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                          <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">
                            {fileNames.pan || "Upload PAN"}
                          </p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload("panUrl", "pan")} className="hidden" />
                      </label>
                      {panUrl && (
                        <span className="text-[8px] text-emerald-400 font-black flex items-center gap-0.5"><BadgeCheck className="w-3.5 h-3.5 text-emerald-400" /> PAN Loaded</span>
                      )}
                    </div>

                    {/* Bank Passbook Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider">Bank Passbook *</label>
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-white/10 border-dashed rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800 transition">
                        <div className="text-center p-2">
                          <FileText className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                          <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">
                            {fileNames.passbook || "Upload Passbook"}
                          </p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload("passbookUrl", "passbook")} className="hidden" />
                      </label>
                      {passbookUrl && (
                        <span className="text-[8px] text-emerald-400 font-black flex items-center gap-0.5"><BadgeCheck className="w-3.5 h-3.5 text-emerald-400" /> Passbook Loaded</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-xl flex items-start space-x-2.5">
                    <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0" />
                    <p className="text-[9px] text-slate-400 leading-relaxed">
                      By submitting, you authorize Tekton Bhopal to verify your background details. Approved profiles usually go live on the homepage roster within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* NAV BUTTONS */}
              <div className="pt-4 border-t border-white/5 flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition border border-white/5 flex items-center justify-center space-x-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition shadow-[0_0_20px_rgba(250,204,21,0.25)] flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : currentStep === 3 ? (
                    <>
                      <span>Submit Application</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950/80 border-t border-white/5 py-6 px-4 text-center text-[10px] text-slate-500 shrink-0">
        <p>© {new Date().getFullYear()} Tekton Bhopal Artisans Hub. Built for Bhopal Quality Workers.</p>
      </footer>

    </div>
  );
}
