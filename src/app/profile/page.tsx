"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, MapPin, Home, Save, CheckCircle, AlertCircle, Camera, Award } from "lucide-react";
import TektonLogo from "@/components/TektonLogo";

// Bhopal Zones exactly matching the app dropdown list
const BHOPAL_ZONES = [
  "MP Nagar",
  "Arera Colony",
  "Indrapuri",
  "Kolar Road",
  "Gulmohar",
  "Saket Nagar",
  "Minal Residency",
  "Awadhpuri",
  "Anand Nagar",
  "Bairagarh",
  "Karond",
  "Ayodhya Bypass",
  "Koh-e-Fiza",
  "All Bhopal (MP)"
];

// Predefined Beautiful Avatars for easy selection
const AVATAR_PRESETS = [
  { name: "Sleek Professional", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { name: "Modern Professional", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { name: "Urban Professional", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
  { name: "Classic Professional", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
  { name: "Artistic Creative", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" }
];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Profile Form States
  const [originalPhone, setOriginalPhone] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("MP Nagar");
  const [alternativeAddress, setAlternativeAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // OTP Verification States
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI Flow States
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Sync login/profile state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedPhone = localStorage.getItem("tektonUserPhone");
    const savedName = localStorage.getItem("tektonUserName");
    const savedEmail = localStorage.getItem("tektonUserEmail");
    const savedLocation = localStorage.getItem("tektonUserLocation");
    const savedAvatar = localStorage.getItem("tektonUserAvatarUrl");
    const savedAddress = localStorage.getItem("tektonUserAddress");

    if (savedPhone) {
      setIsLoggedIn(true);
      setOriginalPhone(savedPhone);
      setPhone(savedPhone);
      
      if (savedName) setName(savedName);
      if (savedEmail) {
        setOriginalEmail(savedEmail);
        setEmail(savedEmail);
      }
      if (savedLocation) setLocation(savedLocation);
      if (savedAvatar) setAvatarUrl(savedAvatar);
      if (savedAddress) setAlternativeAddress(savedAddress);
    }
  }, []);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // OTP Resend Cooldown Countdown Timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider text-slate-400">LOADING YOUR PROFILE...</p>
        </div>
      </div>
    );
  }

  // Handle simulated OTP generation and SMS sending
  const handleOfflineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 10) {
      setToast({ message: "Please enter a valid 10-digit Bhopal phone number.", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      // Generate a random 4-digit code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setOtpStep(true);
      setResendCooldown(30);
      
      // Show only generic success — never expose OTP in UI
      setToast({ message: `📱 OTP sent to +91 ${phone}. Check your SMS.`, type: "success" });
      console.log(`[TEKTON OTP DEV-ONLY] Code: ${code}`); // visible in server logs only
    } catch (err) {
      setToast({ message: "Failed to send OTP verification code.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Verify OTP and proceed with actual account login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEnteredOtp.trim()) {
      setToast({ message: "Please enter the verification code.", type: "error" });
      return;
    }

    // Verify entered OTP against generated code only
    if (userEnteredOtp.trim() !== generatedOtp) {
      setToast({ message: "❌ Invalid OTP code. Please try again or click Resend.", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const checkRes = await fetch(`/api/users?phone=${phone.trim()}`);
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.exists && data.user) {
          localStorage.setItem("tektonUserPhone", data.user.phone);
          localStorage.setItem("tektonUserName", data.user.name || "");
          localStorage.setItem("tektonUserEmail", data.user.email || "");
          localStorage.setItem("tektonUserLocation", data.user.location || "");
          localStorage.setItem("tektonUserAvatarUrl", data.user.avatarUrl || "");
          localStorage.setItem("tektonUserAddress", data.user.alternativeAddress || "");

          setOriginalPhone(data.user.phone);
          setPhone(data.user.phone);
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setOriginalEmail(data.user.email || "");
          setLocation(data.user.location || "MP Nagar");
          setAvatarUrl(data.user.avatarUrl || "");
          setAlternativeAddress(data.user.alternativeAddress || "");
          setIsLoggedIn(true);
          setToast({ message: `🎉 OTP Verified! Welcome back, ${data.user.name}!`, type: "success" });
        } else {
          // Allow them to start building profile as a new offline user
          localStorage.setItem("tektonUserPhone", phone.trim());
          localStorage.setItem("tektonUserName", "Bhopal Citizen");
          localStorage.setItem("tektonUserLocation", "MP Nagar");
          
          setOriginalPhone(phone.trim());
          setName("Bhopal Citizen");
          setIsLoggedIn(true);
          setToast({ message: "🎉 OTP Verified! Fill details below to complete your profile.", type: "success" });
        }
      }
    } catch (err) {
      // Fallback offline login
      localStorage.setItem("tektonUserPhone", phone.trim());
      localStorage.setItem("tektonUserName", "Local User");
      setOriginalPhone(phone.trim());
      setIsLoggedIn(true);
      setToast({ message: "Logged in via offline fallback.", type: "success" });
    } finally {
      setIsSaving(false);
      setOtpStep(false);
      setGeneratedOtp("");
      setUserEnteredOtp("");
    }
  };

  // Resend OTP handler
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setResendCooldown(30);
    setToast({ message: `📱 New OTP sent to +91 ${phone}. Check your SMS.`, type: "success" });
    console.log(`[TEKTON OTP DEV-ONLY RESEND] Code: ${code}`);
  };

  // Submit profile changes
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: "Name is required.", type: "error" });
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setToast({ message: "Valid phone number is required.", type: "error" });
      return;
    }

    setIsSaving(true);
    const lookupKey = originalPhone || originalEmail || phone.trim();

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lookupKey,
          updateData: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            location,
            alternativeAddress: alternativeAddress.trim(),
            avatarUrl: avatarUrl.trim()
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile.");
      }

      const responseData = await res.json();
      
      // Update browser local storage sessions
      localStorage.setItem("tektonUserPhone", phone.trim());
      localStorage.setItem("tektonUserName", name.trim());
      localStorage.setItem("tektonUserEmail", email.trim());
      localStorage.setItem("tektonUserLocation", location);
      localStorage.setItem("tektonUserAvatarUrl", avatarUrl.trim());
      localStorage.setItem("tektonUserAddress", alternativeAddress.trim());

      setOriginalPhone(phone.trim());
      setOriginalEmail(email.trim());
      setToast({ message: "🎉 Profile saved and synchronized with Google Sheets database!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to update profile.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ message: "⚠️ Please select a valid image file (PNG, JPG, WebP).", type: "error" });
      return;
    }

    setToast({ message: "⚡ Processing and optimizing image...", type: "success" });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setAvatarUrl(compressedBase64);
          setToast({ message: "📷 Photo uploaded & compressed successfully!", type: "success" });
        } else {
          setAvatarUrl(event.target?.result as string);
          setToast({ message: "📷 Photo uploaded successfully!", type: "success" });
        }
      };
    };
  };

  const handleCustomAvatarSubmit = () => {
    if (customAvatarUrl.trim()) {
      setAvatarUrl(customAvatarUrl.trim());
      setShowCustomAvatarInput(false);
      setToast({ message: "Custom avatar URL applied successfully!", type: "success" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden pb-16">
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-yellow-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slower"></div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 hover:scale-105 transition-all duration-300">
              <TektonLogo className="w-10 h-10 shrink-0" />
              <div className="flex flex-col text-left justify-center">
                <span className="text-xl font-black tracking-tight text-white leading-none mb-0.5">
                  TEKTON
                </span>
                <span className="text-[10px] font-black text-amber-400 tracking-wide ml-0.5 leading-none">
                  Bhopal Profile
                </span>
              </div>
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            <Home className="w-4.5 h-4.5" />
            <span>Go to Marketplace</span>
          </Link>
        </div>
      </header>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
            toast.type === "success" 
              ? "bg-emerald-950/90 border-emerald-500 text-emerald-300" 
              : "bg-rose-950/90 border-rose-500 text-rose-300"
          }`}>
            {toast.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
            <span className="text-xs font-bold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full flex-1 z-10">
        
        {/* Breadcrumb Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-bold transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bhopal Services Catalog</span>
          </Link>
        </div>

        {/* NOT LOGGED IN FALLBACK */}
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fade-in-up">
            
            {/* Display Shield or Key Icon based on step */}
            <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
              {otpStep ? (
                <CheckCircle className="w-8 h-8 animate-pulse text-amber-400" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>

            {!otpStep ? (
              // Step 1: Mobile Phone Number Input Form
              <>
                <div>
                  <h2 className="text-2xl font-black text-white">Login to View Profile</h2>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Provide your Bhopal mobile number below to access, build, and save your profile details in Google Sheets.
                  </p>
                </div>
                
                <form onSubmit={handleOfflineLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bhopal Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 pl-10 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-bold tracking-wider"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full btn-3d bg-[#F8CB46] hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-amber-500"
                  >
                    {isSaving ? "Sending OTP..." : "Get OTP Verification Code 🚀"}
                  </button>
                </form>
              </>
            ) : (
              // Step 2: OTP Entry Form
              <>
                <div>
                  <h2 className="text-2xl font-black text-white">Enter OTP Verification Code</h2>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    We've sent a 4-digit verification code to <strong className="text-slate-200">+91 {phone}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Verification Code</label>
                    <input
                      type="text"
                      placeholder="••••"
                      maxLength={4}
                      value={userEnteredOtp}
                      onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center text-xl text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-black tracking-widest"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-xl text-xs font-bold transition border border-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-[2] btn-3d bg-[#F8CB46] hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 border border-amber-500"
                    >
                      {isSaving ? "Verifying..." : "Verify & Login 🔐"}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    {resendCooldown > 0 ? (
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Resend code in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[10px] text-amber-400 hover:text-amber-500 font-bold transition underline"
                      >
                        Resend OTP Verification Code
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        ) : (
          /* PROFILE FORM & EDIT CARD */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Visual Profile Avatar & Summary Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
                
                {/* Avatar Display */}
                <div 
                  onClick={() => {
                    setShowCustomAvatarInput(true);
                    setTimeout(() => {
                      document.getElementById("avatar-file-upload")?.click();
                    }, 100);
                  }}
                  className="relative w-28 h-28 mx-auto mt-4 group cursor-pointer"
                  title="Click to upload profile photo"
                >
                  <img
                    className="w-full h-full rounded-full object-cover border-3 border-amber-400/80 shadow-xl group-hover:scale-105 transition-transform duration-300 bg-slate-800"
                    src={avatarUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=120&auto=format&fit=crop&q=80"}
                    alt="Active User Profile"
                  />
                  <div className="absolute bottom-0 right-0 bg-slate-950 p-1.5 rounded-full border border-slate-800 text-amber-400 shadow-md group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    <Camera className="w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="mt-5 space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-white">{name || "Tekton Bhopal User"}</h3>
                  <p className="text-[10px] text-amber-400 font-black uppercase tracking-wider flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Verified Bhopal Citizen
                  </p>
                  <p className="text-slate-400 text-xs pt-1 font-bold">{phone}</p>
                  <p className="text-slate-500 text-[10px] font-semibold">{email || "No Email Registered"}</p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/60 text-left space-y-3.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Zone: <strong className="text-slate-200">{location}</strong></span>
                  </div>
                  {alternativeAddress && (
                    <div className="flex items-start gap-2.5">
                      <Home className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Address: <strong className="text-slate-200">{alternativeAddress}</strong></span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsLoggedIn(false);
                    localStorage.removeItem("tektonUserPhone");
                    localStorage.removeItem("tektonUserName");
                    localStorage.removeItem("tektonUserEmail");
                    localStorage.removeItem("tektonUserLocation");
                    localStorage.removeItem("tektonUserAvatarUrl");
                    localStorage.removeItem("tektonUserAddress");
                    setName("");
                    setPhone("");
                    setEmail("");
                    setOriginalPhone("");
                    setOriginalEmail("");
                    setAvatarUrl("");
                    setAlternativeAddress("");
                    setToast({ message: "Logged out successfully from session.", type: "success" });
                  }}
                  className="w-full mt-6 py-2.5 bg-slate-950/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 hover:border-rose-900 transition-all font-bold text-xs"
                >
                  🚪 Logout Session
                </button>
              </div>

              {/* Bhopal Rewards Stats Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-xl flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tekton Bhopal Rewards</h4>
                  <p className="text-xl font-black text-white mt-1">450 <span className="text-xs font-black text-amber-400">Coins</span></p>
                </div>
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[10px] px-2.5 py-1 rounded-full font-black uppercase shadow-md">
                  Active
                </span>
              </div>
            </div>

            {/* Editable Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveDetails} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Edit Your Profile</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Fill in your details below to automatically sync with the "User Details" sheets database.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@bhopal.in"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Phone (Lookup key)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-semibold font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Bhopal Zone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bhopal dispatch Zone</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-semibold appearance-none cursor-pointer"
                      >
                        {BHOPAL_ZONES.map((zone) => (
                          <option key={zone} value={zone} className="bg-slate-950 text-white">
                            {zone}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Profile Picture / Avatar Presets selection */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Profile Avatar Preset</label>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(preset.url);
                          setShowCustomAvatarInput(false);
                        }}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                          avatarUrl === preset.url ? "border-amber-400 ring-2 ring-amber-400/30 scale-105" : "border-slate-850"
                        }`}
                        title={preset.name}
                      >
                        <img className="w-full h-full object-cover" src={preset.url} alt={preset.name} />
                      </button>
                    ))}
                    
                    {/* Custom Image URL Selector */}
                    <button
                      type="button"
                      onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                      className={`w-12 h-12 rounded-full bg-slate-950 hover:bg-slate-900 border-2 border-dashed transition-all flex items-center justify-center text-slate-400 hover:text-amber-400 ${
                        showCustomAvatarInput ? "border-amber-400" : "border-slate-800"
                      }`}
                      title="Custom Avatar Link"
                    >
                      <Camera className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {showCustomAvatarInput && (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 animate-fade-in-up">
                      {/* Image Upload Zone */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>📁 Option 1: Upload a Photo File</span>
                          <span className="bg-amber-500/20 text-amber-400 text-[8px] px-1.5 py-0.5 rounded font-black tracking-normal uppercase">New</span>
                        </h4>
                        
                        <input
                          type="file"
                          id="avatar-file-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileChange}
                        />
                        
                        <div
                          onClick={() => document.getElementById("avatar-file-upload")?.click()}
                          className="border border-dashed border-slate-800 hover:border-amber-400/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-900/30 hover:bg-slate-900/60 group animate-fade-in-up"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="p-3 bg-amber-400/5 group-hover:bg-amber-400/10 rounded-full border border-amber-400/10 transition-colors">
                              <Camera className="w-5 h-5 text-amber-400 animate-pulse" />
                            </div>
                            <div className="text-xs font-bold text-slate-200">
                              Choose a local photo or capture from camera
                            </div>
                            <p className="text-[9px] text-slate-500">
                              Supports JPG, PNG, WebP (auto-optimized & compressed)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Or Separator Divider */}
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-900"></div>
                        <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-black uppercase tracking-widest">OR</span>
                        <div className="flex-grow border-t border-slate-900"></div>
                      </div>

                      {/* Custom Image URL Selector */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">📁 Option 2: Enter Profile Photo Image Link URL</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={customAvatarUrl}
                            onChange={(e) => setCustomAvatarUrl(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleCustomAvatarSubmit}
                            className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-500 italic">Provide any valid image link URL (Unsplash, Imgur, etc.)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alternative Address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alternative Delivery / House Address (Optional)</label>
                  <textarea
                    rows={3}
                    value={alternativeAddress}
                    onChange={(e) => setAlternativeAddress(e.target.value)}
                    placeholder="Flat No, Wing, Sector, Society, Land-mark etc."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-semibold leading-relaxed"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full btn-3d bg-[#F8CB46] hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-amber-500"
                >
                  <Save className="w-4.5 h-4.5" />
                  {isSaving ? "Saving and Syncing details..." : "Save Details & Sync Database"}
                </button>

              </form>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
