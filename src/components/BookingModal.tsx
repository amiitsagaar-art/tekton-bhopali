"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Calendar, Clock, User, Phone, MapPin, CheckCircle2, Ticket, CreditCard, Sparkles } from "lucide-react";

interface Worker {
  id: number;
  name: string;
  avatarUrl: string;
  category: string;
  basePrice: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  basePrice: number | string;
  worker: Worker | null;
  initialLocation?: string;
  onSubmit: (formData: any) => Promise<void>;
}

const BHOPAL_LOCATIONS = [
  "MP Nagar",
  "Minal Residency",
  "People's Mall Area",
  "Ashoka Garden",
  "Indrapuri",
  "Anand Nagar",
  "Patel Nagar",
  "Arera Colony",
  "Kolar Road",
  "Govindpura",
  "Awadhpuri",
  "Bairagarh",
  "Gulmohar",
  "Saket Nagar",
  "Ayodhya Bypass",
  "Jahangirabad",
  "Lalghati",
  "BHEL",
  "Habibganj",
  "TT Nagar",
  "New Market Area"
];

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "Urgent (Within 45 Mins)"
];

export default function BookingModal({
  isOpen,
  onClose,
  serviceName,
  basePrice,
  worker,
  initialLocation = "MP Nagar",
  onSubmit
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [locationZone, setLocationZone] = useState(initialLocation);
  const [visitDate, setVisitDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[6]); // default to urgent

  // Pricing from API
  const [apiBasePrice, setApiBasePrice] = useState<number | null>(null);

  // Coupon & Payment states
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponIsPercentage, setCouponIsPercentage] = useState(false);
  const [couponDesc, setCouponDesc] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card">("Cash");

  // Load profile + API price on open
  useEffect(() => {
    if (isOpen) {
      // Set default date to today (min date)
      const today = new Date().toISOString().split("T")[0];
      setVisitDate(today);

      // Pre-fill user data if available
      const savedPhone = localStorage.getItem("tektonUserPhone") || "";
      if (savedPhone) setCustomerPhone(savedPhone);
      const savedName = localStorage.getItem("tektonUserName") || "";
      if (savedName) setCustomerName(savedName);

      // Fetch API pricing for this service category
      fetch("/api/pricing")
        .then(r => r.json())
        .then(data => {
          if (data.prices && data.prices[serviceName]) {
            setApiBasePrice(data.prices[serviceName]);
          }
        })
        .catch(() => {}); // silently fallback to prop basePrice
    }
  }, [isOpen, serviceName]);

  if (!isOpen) return null;

  // Price resolution: worker price > API price > prop price > 99
  const actualBasePrice = worker
    ? worker.basePrice
    : (apiBasePrice ?? Number(basePrice)) || 99;

  // Final price with coupon applied
  const couponDeducted = couponApplied
    ? couponIsPercentage
      ? Math.round((actualBasePrice * couponDiscount) / 100)
      : couponDiscount
    : 0;
  const finalPrice = Math.max(0, actualBasePrice - couponDeducted);

  // Today string for date min attribute
  const todayStr = new Date().toISOString().split("T")[0];

  // Server-side coupon validation
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/pricing/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discountValue);
        setCouponIsPercentage(data.isPercentage);
        setCouponDesc(data.description || "");
        setCouponError("");
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setCouponApplied(false);
        setCouponDiscount(0);
      }
    } catch {
      setCouponError("Network error. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode("");
    setCouponDiscount(0);
    setCouponIsPercentage(false);
    setCouponDesc("");
    setCouponError("");
  };

  // Step 1 Validation
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      alert("Please describe your requirement in a bit more detail (minimum 5 characters).");
      return;
    }
    setStep(2);
  };

  // Step 2 Validation
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) { alert("Please enter your name."); return; }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) { alert("Please enter a valid 10-digit phone number."); return; }
    if (!customerAddress.trim()) { alert("Please enter your complete address."); return; }
    if (visitDate < todayStr) { alert("Please select today or a future date."); return; }
    setStep(3);
  };

  // Step 3 Submission — field names match the appointments API
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalPayload = {
        serviceCategory: serviceName,
        description,
        customerName,
        phoneNumber: customerPhone,        // ✅ API expects phoneNumber
        exactAddress: customerAddress,     // ✅ API expects exactAddress
        locationZone,                      // ✅ API expects locationZone
        visitDate,                         // ✅ API expects visitDate
        timeSlot,                          // ✅ API expects timeSlot
        totalPrice: finalPrice,            // ✅ API expects totalPrice
        couponCode: couponApplied ? couponCode : "",
        couponDiscount: couponDeducted,
        paymentMethod,
        assignedWorkerId: worker ? worker.id : null,
      };

      // Save name & phone for future convenience
      localStorage.setItem("tektonUserPhone", customerPhone);
      localStorage.setItem("tektonUserName", customerName);

      await onSubmit(finalPayload);
      // Close & reset form
      onClose();
      setStep(1);
      setDescription("");
      setCouponApplied(false);
      setCouponCode("");
    } catch (err) {
      console.error(err);
      alert("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md transition-opacity duration-300">
      
      {/* Click Outside to Close (Desktop Only) */}
      <div className="absolute inset-0 hidden md:block" onClick={onClose} />

      {/* Modal/Sheet Card Container */}
      <div className="w-full max-h-[92vh] md:max-h-[90vh] bg-slate-900 border border-white/10 rounded-t-[2.5rem] md:rounded-3xl shadow-2xl flex flex-col md:max-w-lg overflow-hidden animate-slide-up md:animate-zoom-in relative z-10">
        
        {/* Progress & Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-white/5 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-black uppercase bg-yellow-400 text-slate-950 px-2 py-0.5 rounded tracking-wide">
                Bhopal Instant Booking
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Step {step} of 3
              </span>
            </div>
            <h3 className="font-black text-white text-base mt-1">
              {worker ? `Book Artisan: ${worker.name}` : `Book ${serviceName}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            title="Close"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 shrink-0 relative">
          <div 
            className="bg-yellow-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Form Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200 space-y-5">
          
          {/* STEP 1: Service Confirmation */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-5">
              
              {/* Selected Service Card Summary */}
              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {worker ? (
                    <img 
                      src={worker.avatarUrl} 
                      alt={worker.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-2xl flex items-center justify-center font-bold">
                      🛠️
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-white text-sm">
                      {worker ? worker.name : serviceName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Category: {serviceName}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase font-black block">Base Pricing</span>
                  <span className="text-lg font-black text-yellow-400">₹{actualBasePrice}</span>
                </div>
              </div>

              {/* Bhopal Operational Warning */}
              <div className="bg-amber-400/10 border border-amber-400/20 px-4 py-3 rounded-xl flex items-start space-x-2.5">
                <span className="text-base leading-none">📍</span>
                <p className="text-[11px] text-amber-400 font-bold leading-relaxed">
                  Only Operational across Bhopal municipal areas including MP Nagar, Kolar, Arera Colony, Habibganj & surrounding sectors.
                </p>
              </div>

              {/* Requirement details */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-200 uppercase tracking-wider">
                  Describe the issue briefly *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Bathroom sink pipe has a minor leakage. Need immediate fixing. Or bedroom wardrobe lock is broken."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 block italic">
                  Be descriptive so the artisan comes prepared with the correct tools.
                </span>
              </div>

              {/* Next Button */}
              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] flex items-center justify-center space-x-2"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Contact Details & Schedule */}
          {step === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-5">
              
              {/* Profile Details Inputs */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-white/5 pb-1">
                  1. Contact Details
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Your Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">WhatsApp / Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        placeholder="e.g. 9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details Inputs */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-white/5 pb-1">
                  2. Location Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Bhopal Sector / Zone *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <select
                        title="Bhopal Location"
                        value={locationZone}
                        onChange={(e) => setLocationZone(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                      >
                        {BHOPAL_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc} className="bg-slate-900 text-white">{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Complete Address / Colony *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 302, Sagar Enclave"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Details Inputs */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-white/5 pb-1">
                  3. Schedule Arrival
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Visit Date *</label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      title="Select Appointment Date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Time Slot *</label>
                    <select
                      title="Select Appointment Time"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot} className="bg-slate-900 text-white">{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-white/5 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition border border-white/5 flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition shadow-[0_0_20px_rgba(250,204,21,0.2)] flex items-center justify-center space-x-1.5"
                >
                  <span>Review Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Summary, Coupons, Payments & Confirmation */}
          {step === 3 && (
            <div className="space-y-5">
              
              {/* Review Info Card */}
              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-3.5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Booking Review</span>
                  <span className="text-[10px] text-yellow-400 font-bold lowercase italic">instant dispatch active</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Client</span>
                    <span className="font-extrabold text-white">{customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">WhatsApp / Mobile</span>
                    <span className="font-extrabold text-white font-mono">{customerPhone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Service Location</span>
                    <span className="font-semibold text-white block">{customerAddress}, {locationZone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Visit Date</span>
                    <span className="font-semibold text-white">{visitDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Visit Time</span>
                    <span className="font-bold text-yellow-400">{timeSlot}</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold mb-0.5">Problem Details</span>
                  <p className="text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-white/5 text-[11px] leading-relaxed italic">
                    &ldquo;{description}&rdquo;
                  </p>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-yellow-400" />
                  <span>Have a Promo Coupon?</span>
                </label>
                
                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. TEKTON10, FIRSTBOOK"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                      className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-400 uppercase tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 font-black text-xs px-4 py-2 rounded-xl transition shrink-0 disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                    <div>
                      <span className="text-emerald-400 text-xs font-black">✓ {couponCode}</span>
                      <span className="text-emerald-300 text-[10px] ml-2 block sm:inline">{couponDesc}</span>
                    </div>
                    <button type="button" onClick={removeCoupon} className="text-rose-400 hover:text-rose-300 text-xs font-bold ml-2">× Remove</button>
                  </div>
                )}
                {couponError && <p className="text-rose-400 text-[11px] font-semibold">{couponError}</p>}
              </div>

              {/* Payment Selector */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  <span>Choose Payment Method</span>
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  {(["Cash", "UPI", "Card"] as const).map((method) => {
                    const iconMap = { Cash: "💵", UPI: "📱", Card: "💳" };
                    const labelMap = { Cash: "Cash", UPI: "UPI / QR", Card: "Card" };
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-2.5 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1.5 transition ${
                          isSelected 
                            ? "bg-yellow-400/15 border-yellow-400 text-yellow-400" 
                            : "bg-slate-950/60 border-white/10 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-base">{iconMap[method]}</span>
                        <span>{labelMap[method]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Base Booking Charges</span>
                  <span>₹{actualBasePrice}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Coupon ({couponCode}) {couponIsPercentage ? `(${couponDiscount}%)` : ""}</span>
                    <span>-₹{couponDeducted}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-black border-t border-white/10 pt-2.5 mt-2.5 text-sm">
                  <span>Total Payable ({paymentMethod})</span>
                  <span className="text-yellow-400">₹{finalPrice}</span>
                </div>
              </div>

              {/* Dispatch Urgency Banner */}
              <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-2xl flex items-center space-x-3 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.05)]">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs font-black">Dispatch Urgency Active</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    A Tekton Expert will be dispatched to your location shortly.
                  </p>
                </div>
              </div>

              {/* Final Actions */}
              <div className="pt-4 border-t border-white/5 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition border border-white/5 flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Confirm Booking & Get Worker</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
