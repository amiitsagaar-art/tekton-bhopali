"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Calendar, Clock, User, Phone, MapPin, CheckCircle2, Ticket, CreditCard, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

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
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card">(SITE_CONFIG.enableCashPayment ? "Cash" : "UPI");
  const [copied, setCopied] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [cashEnabled, setCashEnabled] = useState(SITE_CONFIG.enableCashPayment);

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
          // Normalize serviceName to match pricing API categories
          const mapping: Record<string, string> = {
            "Plumber": "Plumbing",
            "Carpenter": "Carpentry",
            "Electrician": "Electrician",
            "Painter": "Painting",
            "Cleaning Service": "Cleaning",
            "AC & Appliances": "AC Repair",
            "Civil Architect": "Civil Work",
            "Civil Construction": "Civil Work",
          };
          const pricingKey = mapping[serviceName] || serviceName;
          if (data.prices && data.prices[pricingKey]) {
            setApiBasePrice(data.prices[pricingKey]);
          }
        })
        .catch(() => {}); // silently fallback to prop basePrice

      // Fetch dynamic system settings (like enableCashPayment toggle)
      fetch("/api/settings")
        .then(r => r.json())
        .then(data => {
          if (data.success && data.settings && data.settings.enableCashPayment !== undefined) {
            const isCashOn = data.settings.enableCashPayment === "true";
            setCashEnabled(isCashOn);
            // If Cash is disabled and current selected method is Cash, switch to UPI
            if (!isCashOn) {
              setPaymentMethod(prev => prev === "Cash" ? "UPI" : prev);
            }
          }
        })
        .catch(() => {});
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitBooking = async (transactionId: string | null = null) => {
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
        transactionId: transactionId,
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

  // Step 3 Submission — field names match the appointments API
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    if (paymentMethod === "Cash") {
      await submitBooking(null);
      return;
    }

    if (paymentMethod === "UPI") {
      const utr = upiTransactionId.trim();
      if (!utr || !/^\d{12}$/.test(utr)) {
        alert("Please enter a valid 12-digit UPI Transaction UTR Number.");
        setIsSubmitting(false);
        return;
      }
      await submitBooking(utr);
      return;
    }

    try {
      // 1. Load Razorpay script
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        alert("Failed to load Razorpay library. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // 2. Create order on server
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: worker ? worker.id : null,
          category: serviceName,
          couponCode: couponApplied ? couponCode : "",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 3. Check if mock mode is active
      if (orderData.mock) {
        const mockPayId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;
        alert(`[Test Mode] Mock Payment order created successfully!\nOrder ID: ${orderData.orderId}\nProceeding with mock authorization...`);
        await submitBooking(mockPayId);
        return;
      }

      // 4. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Tekton Bhopal",
        description: worker ? `Artisan Booking: ${worker.name}` : `${serviceName} Service`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const transactionId = response.razorpay_payment_id;
          await submitBooking(transactionId);
        },
        prefill: {
          name: customerName,
          contact: customerPhone,
        },
        theme: {
          color: "#F8CB46",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Payment Error:", err);
      alert(`Payment initialization failed: ${err.message || err}. Please try again or choose Cash.`);
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
                  {(["Cash", "UPI", "Card"] as const)
                    .map((method) => {
                      const iconMap = { Cash: "💵", UPI: "📱", Card: "💳" };
                      const labelMap = { Cash: "Cash", UPI: "UPI / QR", Card: "Card" };
                      const isSelected = paymentMethod === method;
                      const isCashDisabled = method === "Cash" && !cashEnabled;
                      return (
                        <button
                          key={method}
                          type="button"
                          disabled={isCashDisabled}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-2.5 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1.5 transition relative ${
                            isCashDisabled
                              ? "bg-slate-900/40 border-white/5 text-slate-600 cursor-not-allowed opacity-50"
                              : isSelected 
                                ? "bg-yellow-400/15 border-yellow-400 text-yellow-400" 
                                : "bg-slate-950/60 border-white/10 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <span className="text-base">{iconMap[method]}</span>
                          <span>{labelMap[method]}</span>
                          {isCashDisabled && (
                            <span className="absolute -top-1.5 -right-1 bg-rose-500/90 text-[8px] text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider scale-90">
                              Offline
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* UPI Payment Details Section */}
              {paymentMethod === "UPI" && (
                <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                      📱 Direct PhonePe / UPI Payment
                    </span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">
                      Zero Fees
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-355 leading-relaxed text-slate-300">
                    Scan the QR code below using GPay, PhonePe, Paytm, or any UPI app to pay <strong className="text-yellow-450 text-yellow-400">₹{finalPrice}</strong>.
                  </p>

                  {/* QR Code Display */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl max-w-[210px] mx-auto border border-purple-500/20 shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=${SITE_CONFIG.upi.id}&pn=${encodeURIComponent(
                          SITE_CONFIG.upi.name
                        )}&am=${finalPrice}&cu=INR&tn=${encodeURIComponent(
                          `Tekton ${serviceName}`
                        )}`
                      )}`}
                      alt="UPI Payment QR Code"
                      className="w-40 h-40 object-contain"
                    />
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest mt-1.5">
                      Scan to Pay
                    </span>
                  </div>

                  {/* UPI ID Copy Box */}
                  <div className="bg-slate-900 border border-white/5 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="overflow-hidden">
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">UPI ID</span>
                      <code className="text-[11px] font-mono text-white select-all font-bold block truncate max-w-[150px]" title={SITE_CONFIG.upi.id}>{SITE_CONFIG.upi.id}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SITE_CONFIG.upi.id);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[10px] font-black uppercase bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg transition shrink-0"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {/* Mobile Deep Link Button */}
                  <div className="md:hidden">
                    <a
                      href={`upi://pay?pa=${SITE_CONFIG.upi.id}&pn=${encodeURIComponent(
                        SITE_CONFIG.upi.name
                      )}&am=${finalPrice}&cu=INR&tn=${encodeURIComponent(
                        `Tekton ${serviceName}`
                      )}`}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-md text-center"
                    >
                      <span>⚡ Pay via UPI App</span>
                    </a>
                  </div>

                  {/* UTR Input Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Enter 12-Digit UPI Transaction UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      pattern="\d{12}"
                      placeholder="e.g. 612849502934"
                      value={upiTransactionId}
                      onChange={(e) => setUpiTransactionId(e.target.value.replace(/\D/g, "").substring(0, 12))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition tracking-widest text-center"
                    />
                    <span className="text-[9px] text-slate-500 block italic leading-snug">
                      Enter the UTR reference number from your receipt to verify the transaction.
                    </span>
                  </div>
                </div>
              )}

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
