"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TektonLogo from "@/components/TektonLogo";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import { registerPushNotifications, addPushListeners, removePushListeners } from "@/utils/pushNotifications";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {
  Wrench,
  Hammer,
  Zap,
  Paintbrush,
  HardHat,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  UserPlus,
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  Phone,
  Briefcase,
  Camera,
  X,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Droplets,
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  Award,
  Clock3,
  MessageSquare,
  Send,
  Headphones,
  Menu,
  Bell,
  Tag
} from "lucide-react";

// Types
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
  createdAt: string;
}

const CATEGORIES = [
  { name: "Plumber", icon: Wrench, color: "bg-blue-50 text-blue-600 border-blue-200", desc: "Pipes & Leaks" },
  { name: "Carpenter", icon: Hammer, color: "bg-amber-50 text-amber-700 border-amber-200", desc: "Furniture & Wood" },
  { name: "Electrician", icon: Zap, color: "bg-yellow-50 text-yellow-600 border-yellow-200", desc: "Wiring & Appliances" },
  { name: "Painter", icon: Paintbrush, color: "bg-purple-50 text-purple-600 border-purple-200", desc: "Walls & Polish" },
  { name: "Civil Architect", icon: HardHat, color: "bg-rose-50 text-rose-600 border-rose-200", desc: "Design & Build" },
  { name: "Civil Construction", icon: Building2, color: "bg-orange-50 text-orange-700 border-orange-200", desc: "Brick & Concrete" },
  { name: "Cleaning Service", icon: Sparkles, color: "bg-teal-50 text-teal-600 border-teal-200", desc: "Deep Cleaning" },
  { name: "Tank Cleaning", icon: Droplets, color: "bg-sky-50 text-sky-600 border-sky-200", desc: "Water Tank" },
  { name: "Interior Design", icon: LayoutDashboard, color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200", desc: "Room Makeover" },
  { name: "Exterior Design", icon: Building2, color: "bg-emerald-50 text-emerald-600 border-emerald-200", desc: "Facade & Garden" },
  { name: "AC & Appliances", icon: Briefcase, color: "bg-cyan-50 text-cyan-600 border-cyan-200", desc: "AC & Fridge" },
  { name: "Washing Machine & Fridge", icon: Wrench, color: "bg-blue-50 text-blue-600 border-blue-200", desc: "Visit Charge ₹99" },
  { name: "CCTV Cameras", icon: Camera, color: "bg-indigo-50 text-indigo-600 border-indigo-200", desc: "Security Setup" },
  { name: "Pest Control", icon: ShieldCheck, color: "bg-green-50 text-green-700 border-green-200", desc: "Cockroach & Termite" },
  { name: "Car Wash", icon: Droplets, color: "bg-orange-50 text-orange-600 border-orange-200", desc: "Doorstep Car Wash" },
];


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
  "All Bhopal Colonies"
];

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "02:00 PM - 04:00 PM",
  "05:00 PM - 07:00 PM",
  "Instant (Within 10 mins Arrival)"
];

const COUPONS: Record<string, { type: "percent" | "flat"; value: number; desc: string }> = {
  TEKTON10:  { type: "percent", value: 10,  desc: "10% off on any service" },
  FIRSTBOOK: { type: "flat",    value: 50,  desc: "₹50 off on your first booking" },
  BHOPAL2026:{ type: "flat",    value: 30,  desc: "₹30 off – Bhopal Special" },
  WELCOME49: { type: "flat",    value: 49,  desc: "₹49 off – Welcome offer" },
};

const BOOKING_STATUS_STEPS = [
  { key: "Pending",   label: "Booking Placed",   icon: "📋" },
  { key: "Confirmed", label: "Confirmed",         icon: "✅" },
  { key: "OnTheWay",  label: "Expert On The Way", icon: "🛵" },
  { key: "Completed", label: "Job Done!",          icon: "🎉" },
];

const CUSTOMER_REVIEWS = [
  {
    name: "Sneha Rajput",
    location: "Arera Colony",
    rating: 5,
    text: "Booked a plumber for a leaking pipe at 9 PM. The worker arrived within 15 minutes. Very professional and polite. Best service in Bhopal!",
    service: "Plumbing",
    date: "2 days ago"
  },
  {
    name: "Rahul Verma",
    location: "Indrapuri",
    rating: 5,
    text: "Used Tekton for full house deep cleaning before Diwali. The team was fully equipped and did an immaculate job. Worth every penny.",
    service: "Cleaning Service",
    date: "1 week ago"
  },
  {
    name: "Amit Tiwari",
    location: "Kolar Road",
    rating: 5,
    text: "AC stopped working in the middle of summer. Got a technician instantly via this app. Fixed the gas leak in an hour. Very satisfied.",
    service: "AC & Appliances",
    date: "3 weeks ago"
  },
  {
    name: "Neha Sharma",
    location: "Awadhpuri",
    rating: 5,
    text: "Needed urgent carpentry work for my modular kitchen. The carpenter was highly skilled and finished the job perfectly without any mess.",
    service: "Carpenter",
    date: "1 month ago"
  }
];

// Hero Images for the animated Carousel background
const heroImages = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop", // Plumber/Construction
  "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=800&auto=format&fit=crop", // Electrician
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop", // Cleaning
  "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?q=80&w=800&auto=format&fit=crop", // Carpenter/Workshop
  "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop"  // Painter
];

export default function TektonApp() {
  const isAdmin = false; // TODO: Replace with actual auth role state

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState("Plumber");
  const [selectedLocation, setSelectedLocation] = useState("MP Nagar");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState<"services" | "appointments" | "check-area">("services");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic Hero State
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Initialize FCM Push Notifications on Native platforms (Android/iOS)
  useEffect(() => {
    addPushListeners({
      onTokenRegistered: (token) => {
        console.log("[FCM] Token registered successfully:", token);
        if (process.env.NODE_ENV === "development") {
          showToast(`FCM Token registered: ${token.substring(0, 8)}...`);
        }
      },
      onRegistrationError: (err) => {
        console.error("[FCM] Registration error:", err);
      },
      onNotificationReceived: (notification) => {
        console.log("[FCM] Foreground notification received:", notification);
        showToast(`🔔 ${notification.title}: ${notification.body}`);
      },
      onNotificationAction: (action) => {
        console.log("[FCM] Notification action performed:", action);
        setCurrentTab("appointments");
      }
    });

    registerPushNotifications();

    return () => {
      removePushListeners();
    };
  }, []);


  // User Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [loginPhoneInput, setLoginPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [registerLocation, setRegisterLocation] = useState("");
  const [loginRole, setLoginRole] = useState<"user" | "vendor">("user");
  const [authLoading, setAuthLoading] = useState(false);
  const [otpError, setOtpError] = useState("");


  const handleFirebaseRegister = async () => {
    if (registerName.trim().length < 2) { alert("Please enter your full name."); return; }
    if (!registerEmail.trim() || !registerPassword.trim()) { alert("Email and Password are required."); return; }
    if (!registerLocation) { alert("Please select your Bhopal zone."); return; }
    
    setAuthLoading(true);
    try {
      // 1. Check if user already exists in our DB
      const checkRes = await fetch(`/api/users?email=${registerEmail.trim()}`);
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.exists && data.user) {
          alert("⚠️ A user is already registered with this email. Please login instead.");
          setAuthLoading(false);
          return;
        }
      }

      // 2. Create in Firebase
      const cred = await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
      
      // 3. Save to DB
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          phone: registerPhone || "", // optional now
          email: registerEmail.trim(),
          location: registerLocation,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to register profile in database.");
      }

      localStorage.setItem("tektonUserEmail", registerEmail.trim());
      localStorage.setItem("tektonUserName", registerName);
      localStorage.setItem("tektonUserPhone", registerPhone || "");
      localStorage.setItem("tektonUserLocation", registerLocation);
      localStorage.setItem("tektonUserAvatarUrl", "");
      localStorage.setItem("tektonUserAddress", "");

      setUserEmail(registerEmail.trim());
      setUserName(registerName);
      setUserPhone(registerPhone || "");
      setSelectedLocation(registerLocation);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setIsRegistering(false);
      showToast(`✅ Welcome ${registerName}! Account created successfully.`);

    } catch (err: any) {
      console.error("Firebase Registration Error:", err);
      alert(`Firebase error: ${err.message || "Failed to register. Please try again."}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFirebaseLogin = async () => {
    if (!loginEmailInput.trim() || !loginPasswordInput.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    setAuthLoading(true);
    try {
      // 1. Login with Firebase
      await signInWithEmailAndPassword(auth, loginEmailInput.trim(), loginPasswordInput);

      if (loginRole === "vendor") {
        // Vendors might not have emails in DB yet in old schema, but we'll let them login
        localStorage.setItem("tektonWorkerEmail", loginEmailInput.trim());
        showToast("🔑 Logged in successfully! Accessing Partner Dashboard...");
        setShowLoginModal(false);
        setTimeout(() => {
          window.location.href = "/partner";
        }, 1000);
      } else {
        // 2. Check user DB
        const checkRes = await fetch(`/api/users?email=${loginEmailInput.trim()}`);
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.exists && data.user) {
            localStorage.setItem("tektonUserEmail", data.user.email);
            localStorage.setItem("tektonUserName", data.user.name || "");
            localStorage.setItem("tektonUserPhone", data.user.phone || "");
            localStorage.setItem("tektonUserLocation", data.user.location || "");
            
            setUserEmail(data.user.email);
            setUserName(data.user.name || "");
            setUserPhone(data.user.phone || "");
            setSelectedLocation(data.user.location || "All Bhopal (MP)");
            setIsLoggedIn(true);
            setShowLoginModal(false);
            showToast(`🚪 Welcome back, ${data.user.name}!`);
          } else {
             alert("⚠️ Your account details are missing from our database. Please contact support.");
          }
        }
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      alert(`Firebase error: ${err.message || "Invalid credentials."}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // State Data
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // Modals & Flows
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<Worker | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Custom availability check form
  const [checkAreaInput, setCheckAreaInput] = useState("");
  const [checkResult, setCheckResult] = useState<{ status: "idle" | "yes" | "no"; area: string; message: string }>({
    status: "idle",
    area: "",
    message: ""
  });

  // Appointment Form state
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    location: "All Bhopal (MP)",
    category: "",
    description: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: TIME_SLOTS[4], // Default to instant
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Notification banners
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Work-Related Mood Lifter
  const [showHappyMessage, setShowHappyMessage] = useState(false);
  const [happyMessages] = useState([
    "Ghar ki tension hum par chhod do! Our experts are ready! 👷‍♂️✨",
    "Leak ho ya wiring ki problem, Tekton karega sab fix! 🔧😎",
    "Take a deep breath! We'll hammer out all your problems. 🔨🔥",
    "Relax kijiye! We have a specialist for everything you need. 🧰💛"
  ]);
  const [currentHappyMessage, setCurrentHappyMessage] = useState("");

  const triggerHappyMood = () => {
    setCurrentHappyMessage(happyMessages[Math.floor(Math.random() * happyMessages.length)]);
    setShowHappyMessage(true);
    setTimeout(() => setShowHappyMessage(false), 5000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addNotification = (msg: string) => {
    const n = { id: Date.now(), msg, time: new Date().toLocaleTimeString(), read: false };
    setNotifications(prev => [n, ...prev].slice(0, 20));
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError("Enter a coupon code."); return; }
    const coupon = COUPONS[code];
    if (!coupon) { setCouponError("❌ Invalid coupon code."); setCouponDiscount(0); setCouponApplied(false); return; }
    setCouponApplied(true);
    setCouponDiscount(coupon.value);
    setCouponDesc(coupon.desc);
    setCouponError("");
    showToast(`🎉 Coupon applied! ${coupon.desc}`);
  };

  const removeCoupon = () => {
    setCouponCode(""); setCouponDiscount(0); setCouponApplied(false); setCouponError(""); setCouponDesc("");
  };

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDesc, setCouponDesc] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState<{id: number; msg: string; time: string; read: boolean}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic Customer Reviews State
  const [reviewsList, setReviewsList] = useState(CUSTOMER_REVIEWS);
  const [newFeedbackName, setNewFeedbackName] = useState("");
  const [newFeedbackLocation, setNewFeedbackLocation] = useState("");
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);
  const [newFeedbackText, setNewFeedbackText] = useState("");
  const [newFeedbackService, setNewFeedbackService] = useState("General");

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackName.trim()) { alert("Please enter your name."); return; }
    if (!newFeedbackText.trim()) { alert("Please enter your feedback text."); return; }
    if (!newFeedbackLocation.trim()) { alert("Please enter or select your area in Bhopal."); return; }

    const newReview = {
      name: newFeedbackName.trim(),
      location: newFeedbackLocation.trim(),
      rating: newFeedbackRating,
      text: newFeedbackText.trim(),
      service: newFeedbackService,
      date: "Just now"
    };

    const updatedList = [newReview, ...reviewsList];
    setReviewsList(updatedList);
    localStorage.setItem("tektonLocalReviews", JSON.stringify(updatedList));

    // Reset feedback text input
    setNewFeedbackText("");
    
    // Confetti Emoji pop & success toast
    showToast("🎉 Thank you! Your verified experience has been posted live!");
    triggerHappyMood();
  };



  // Check and fetch seed data
  useEffect(() => {
    const initializeData = async () => {
      setLoadingWorkers(true);
      try {
        const res = await fetch("/api/workers");
        const data = await res.json();
        
        // Auto trigger seed if empty or contains non-Bhopal data or is missing new premium categories
        const hasNonBhopal = Array.isArray(data) && data.some(w => w.locations.includes("Delhi NCR") || w.locations.includes("Mumbai"));
        const hasNewCategories = Array.isArray(data) && data.some(w => w.category === "Tank Cleaning");
        
        if (hasNonBhopal || !hasNewCategories || !Array.isArray(data) || data.length === 0) {
          await fetch("/api/seed", { method: "POST" });
          const freshRes = await fetch("/api/workers");
          const freshData = await freshRes.json();
          setWorkers(Array.isArray(freshData) ? freshData : []);
        } else {
          setWorkers(data);
        }
      } catch (err) {
        console.error("Failed fetching workers:", err);
      } finally {
        setLoadingWorkers(false);
      }
    };

    initializeData();
    fetchAppointments();

    const savedReviews = localStorage.getItem("tektonLocalReviews");
    if (savedReviews) {
      try {
        setReviewsList(JSON.parse(savedReviews));
      } catch (e) {}
    }

    const savedPhone = localStorage.getItem("tektonUserPhone");
    if (savedPhone) {
      setUserPhone(savedPhone);
      setIsLoggedIn(true);
    }
    const savedName = localStorage.getItem("tektonUserName");
    if (savedName) {
      setUserName(savedName);
      setNewFeedbackName(savedName);
    }
    const savedEmail = localStorage.getItem("tektonUserEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
    const savedAvatar = localStorage.getItem("tektonUserAvatarUrl");
    if (savedAvatar) {
      setUserAvatar(savedAvatar);
    }
    const savedAddress = localStorage.getItem("tektonUserAddress");
    if (savedAddress) {
      setUserAddress(savedAddress);
    }
    const savedLoc = localStorage.getItem("tektonUserLocation");
    if (savedLoc) {
      setNewFeedbackLocation(savedLoc);
    }
  }, []);

  // Fetch appointments list
  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed fetching appointments:", err);
    }
  };

  // Force reset data to Bhopal
  const handleResetData = async () => {
    setLoadingWorkers(true);
    showToast("🔄 Resetting application live data to Bhopal specialists...");
    try {
      await fetch("/api/seed", { method: "POST" });
      const freshRes = await fetch("/api/workers");
      const freshData = await freshRes.json();
      setWorkers(Array.isArray(freshData) ? freshData : []);
      await fetchAppointments();
      showToast("✅ Loaded fresh skilled workers for Bhopal, Madhya Pradesh!");
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to reload default data");
    } finally {
      setLoadingWorkers(false);
    }
  };

  // Handle live updates to filters
  const filteredWorkers = workers.filter((worker) => {
    const matchCategory = selectedCategory === "All" || worker.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    const matchLocation = selectedLocation === "All Bhopal (MP)" 
      ? worker.locations.toLowerCase().includes("bhopal") || BHOPAL_LOCATIONS.some(l => worker.locations.toLowerCase().includes(l.toLowerCase()))
      : worker.locations.toLowerCase().includes(selectedLocation.toLowerCase()) || worker.locations.toLowerCase().includes("all over bhopal");

    const matchSearch = searchQuery
      ? worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.locations.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchCategory && matchLocation && matchSearch;
  });



  // Open Appointment Form prefilled
  const triggerBooking = (worker: Worker | null, catOverride?: string) => {
    setSelectedWorkerForBooking(worker);
    setBookingForm((prev) => ({
      ...prev,
      category: worker ? worker.category : catOverride || (selectedCategory !== "All" ? selectedCategory : "Plumber"),
      location: selectedLocation === "All Bhopal (MP)" ? "MP Nagar, Bhopal" : selectedLocation,
      description: worker ? `Requested expert ${worker.name} for service in Bhopal.` : "",
    }));
    setShowAppointmentModal(true);
  };

  // Submit appointment / enquiry
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookingForm,
        assignedWorkerId: selectedWorkerForBooking ? selectedWorkerForBooking.id : null,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Booking failed");
        return;
      }

      await fetchAppointments();
      setShowAppointmentModal(false);
      showToast(`⚡ Appointment Confirmed! Assigned artisan dispatching to ${bookingForm.location} shortly.`);
      addNotification(`New Booking: ${bookingForm.category} task on ${bookingForm.appointmentDate}`);
      setCurrentTab("appointments");

      // Save user session based on booking phone
      setUserPhone(bookingForm.customerPhone);
      localStorage.setItem("tektonUserPhone", bookingForm.customerPhone);
      setIsLoggedIn(true);

      // Reset
      setBookingForm({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        location: selectedLocation,
        category: "",
        description: "",
        appointmentDate: new Date().toISOString().split("T")[0],
        appointmentTime: TIME_SLOTS[4],
      });
      setSelectedWorkerForBooking(null);
    } catch (err) {
      console.error(err);
      alert("Failed submitting appointment");
    }
  };

  // Update Status of appointment
  const updateAppointmentStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        showToast(`Task status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform area availability test specifically optimized for Bhopal constraints
  const handleVerifyArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAreaInput.trim()) return;
    
    const inputClean = checkAreaInput.toLowerCase().trim();
    
    // Check if user explicitly typed a non-Bhopal city
    const nonBhopalCities = ["delhi", "mumbai", "indore", "pune", "bangalore", "bengaluru", "chennai", "hyderabad", "kolkata", "jaipur", "ahmedabad", "noida", "gurgaon"];
    const isNonBhopal = nonBhopalCities.some(city => inputClean.includes(city)) && !inputClean.includes("bhopal");

    if (isNonBhopal) {
      setCheckResult({
        status: "no",
        area: checkAreaInput,
        message: "⚠️ Sorry! Tekton instant services are currently exclusive to Bhopal city (Madhya Pradesh). We are not available in other cities right now."
      });
      return;
    }

    // Check if matched Bhopal areas or valid Bhopal pincodes (462001 - 462050)
    const matchedZone = BHOPAL_LOCATIONS.find(loc => loc !== "All Bhopal (MP)" && inputClean.includes(loc.toLowerCase().replace(" area", "")));
    const hasBhopalPin = /^4620[0-9]{2}$/.test(inputClean) || inputClean.includes("4620");
    const matchesNewColonies = ["minal", "people's mall", "peoples mall", "ashoka garden", "indrapuri", "anand nagar", "patel nagar", "colony", "nagar", "vihar"].some(c => inputClean.includes(c));

    if (matchedZone || hasBhopalPin || matchesNewColonies || inputClean.includes("bhopal") || inputClean.includes("mp nagar") || inputClean.includes("arera") || inputClean.includes("kolar")) {
      setCheckResult({
        status: "yes",
        area: checkAreaInput,
        message: "✅ Guaranteed Coverage! 10-Minute Dispatch is fully ACTIVE across your specific colony for manual works starting at ₹49."
      });
    } else {
      // Default to covered inside Bhopal limits
      setCheckResult({
        status: "yes",
        area: `${checkAreaInput} (Bhopal Limit)`,
        message: "⚡ Fully Available! We support instant artisan scheduling for all residential colonies and commercial units within Bhopal limits."
      });
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col font-sans pb-24 relative selection:bg-yellow-400 selection:text-slate-950">
      
      {/* LEFT SIDEBAR (MOBILE DRAWER) */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop Overlay */}
        <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
        
        {/* Drawer Panel */}
        <div className={`absolute top-0 bottom-0 left-0 w-72 max-w-[80vw] bg-slate-900 border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-yellow-400 font-black tracking-wider text-lg">TEKTON BHOPAL</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition" aria-label="Close sidebar">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link href="/" onClick={() => setIsSidebarOpen(false)} className="text-sm font-bold text-slate-200 hover:text-yellow-400 transition-colors py-2 flex items-center space-x-2 border-b border-white/5">
                <span>Home</span>
              </Link>
              <Link href="/services" onClick={() => setIsSidebarOpen(false)} className="text-sm font-bold text-slate-200 hover:text-yellow-400 transition-colors py-2 flex items-center space-x-2 border-b border-white/5">
                <span>Services</span>
              </Link>
              <button onClick={() => { setIsSidebarOpen(false); setCurrentTab("services"); }} className="text-left text-sm font-bold text-slate-200 hover:text-yellow-400 transition-colors py-2 flex items-center space-x-2 border-b border-white/5">
                <span>Categories</span>
              </button>
              <Link href="/recent-work" onClick={() => setIsSidebarOpen(false)} className="text-sm font-bold text-slate-200 hover:text-yellow-400 transition-colors py-2 flex items-center space-x-2 border-b border-white/5">
                <span>Recent Work</span>
              </Link>
              <Link href="/about" onClick={() => setIsSidebarOpen(false)} className="text-sm font-bold text-slate-200 hover:text-yellow-400 transition-colors py-2 flex items-center space-x-2 border-b border-white/5">
                <span>About Us</span>
              </Link>
              <Link href="/contact" onClick={() => setIsSidebarOpen(false)} className="text-sm font-bold text-slate-200 hover:text-yellow-400 transition-colors py-2 flex items-center space-x-2">
                <span>Contact</span>
              </Link>
            </nav>
          </div>
          
          <div className="pt-4 border-t border-white/5 space-y-3">
            {!isLoggedIn ? (
              <button
                onClick={() => { setIsSidebarOpen(false); setShowLoginModal(true); }}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
              >
                Login
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setIsSidebarOpen(false); setCurrentTab("appointments"); }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>My Bookings ({appointments.length})</span>
                </button>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsLoggedIn(false);
                    localStorage.removeItem("tektonUserPhone");
                    localStorage.removeItem("tektonUserName");
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Logout
                </button>
              </>
            )}
            <Link href="/partner-join" onClick={() => setIsSidebarOpen(false)} className="block w-full text-center bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold py-2.5 rounded-xl text-xs transition">
              Join as Partner
            </Link>
          </div>
        </div>
      </div>

      {/* EXCLUSIVE ZONE STICKY BANNER */}
      <div className="bg-slate-950 text-yellow-400 px-4 py-1.5 text-center text-xs font-bold tracking-wide border-b border-white/10 flex items-center justify-center space-x-1.5 relative z-40">
        <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
        <span>AVAILABLE ONLY IN BHOPAL (MADHYA PRADESH)</span>
        <span className="text-slate-450 hidden sm:inline">• Central Express Roster for Skilled Manual Tasks</span>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 text-sm font-medium border border-white/10 animate-fade-in">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left Element (Desktop Logo / Mobile Hamburger) */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Button (Mobile only) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-yellow-450 hover:bg-white/5 rounded-lg transition"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Logo */}
            <Link href="/" className="hidden lg:flex items-center space-x-2.5 hover:scale-105 transition-all duration-300">
              <TektonLogo className="w-10 h-10 shrink-0" />
              <div className="flex flex-col text-left justify-center">
                <span className="text-xl font-black tracking-tight text-white leading-none mb-0.5">
                  TEKTON
                </span>
                <span className="text-[10px] font-black text-yellow-400 tracking-wide ml-0.5 leading-none">
                  Bhopal
                </span>
              </div>
            </Link>
          </div>

          {/* Center Element (Desktop Nav Menu / Mobile Logo) */}
          <div className="flex-1 flex items-center justify-center">
            {/* Desktop Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link href="/" className="px-3 py-2 text-sm font-black text-white hover:text-yellow-400 transition-colors">Home</Link>
              <Link href="/services" className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-yellow-400 transition-colors">Services</Link>
              <Link href="/recent-work" className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-yellow-400 transition-colors">Recent Work Done</Link>
              <Link href="/about" className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-yellow-400 transition-colors">About Us</Link>
              <Link href="/contact" className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-yellow-400 transition-colors">Contact</Link>
            </nav>

            {/* Mobile Logo */}
            <Link href="/" className="lg:hidden flex items-center space-x-2">
              <TektonLogo className="w-8 h-8 shrink-0" />
              <span className="text-base font-black tracking-tight text-white">TEKTON</span>
            </Link>
          </div>

          {/* Right Element (Actions) */}
          <div className="flex items-center space-x-2 sm:space-x-3 justify-end">
            
            {/* Location Selector (Desktop only) */}
            <div className="hidden md:flex items-center bg-white/5 hover:bg-white/10 transition px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer">
              <MapPin className="w-4 h-4 text-rose-500 mr-1.5 shrink-0 animate-pulse" />
              <div className="text-left text-xs">
                <span className="text-slate-400 block font-medium leading-none">Bhopal Hub Zone</span>
                <select
                  title="Select Bhopal service zone"
                  aria-label="Bhopal Hub Zone"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent font-bold text-white text-xs focus:outline-none cursor-pointer pr-1 pt-0.5"
                >
                  {BHOPAL_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-slate-900 text-white">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              {!isLoggedIn ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
                >
                  Login
                </button>
              ) : (
                <div className="relative group cursor-pointer z-50">
                  <div className="flex items-center gap-2 border border-white/10 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition bg-slate-900">
                      <img className="w-6 h-6 rounded-full object-cover border border-white/20" src={userAvatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop"} alt="User Profile" />
                      <span className="text-[10px] font-bold text-slate-200">{userName ? userName.split(" ")[0] : "User"}</span>
                  </div>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="p-3 border-b border-white/5 text-left">
                          <p className="text-xs font-bold text-white">{userName || "Valued User"}</p>
                          <p className="text-[10px] text-slate-400">{userPhone || "No Phone Registered"}</p>
                      </div>
                      <ul className="py-1 text-xs text-slate-300 text-left">
                          <li>
                            <button
                              onClick={() => setCurrentTab("appointments")}
                              className="w-full text-left block px-4 py-2 hover:bg-white/5 hover:text-yellow-400 font-semibold transition"
                            >
                              🕒 My Bookings ({appointments.filter(a => a.customerPhone === userPhone).length})
                            </button>
                          </li>
                          <li>
                            <div className="block px-4 py-2 hover:bg-white/5 hover:text-yellow-400 font-semibold transition flex items-center justify-between cursor-default">
                              <span>🪙 Rewards</span>
                              <span className="bg-yellow-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-bold">450</span>
                            </div>
                          </li>
                          <li>
                            <button
                              onClick={() => setIsEditProfileOpen(true)}
                              className="w-full text-left block px-4 py-2 hover:bg-white/5 hover:text-yellow-400 font-semibold transition"
                            >
                              👤 My Profile
                            </button>
                          </li>
                      </ul>
                      <div className="border-t border-white/5 py-1 text-left">
                          <button onClick={() => {
                            setIsLoggedIn(false);
                            localStorage.removeItem("tektonUserPhone");
                            localStorage.removeItem("tektonUserName");
                            localStorage.removeItem("tektonUserEmail");
                            localStorage.removeItem("tektonUserLocation");
                            localStorage.removeItem("tektonUserAvatarUrl");
                            localStorage.removeItem("tektonUserAddress");
                            setUserName("");
                            setUserPhone("");
                            setUserEmail("");
                            setUserAvatar("");
                            setUserAddress("");
                          }} className="block w-full text-left px-4 py-2 text-rose-500 hover:bg-rose-950/20 font-bold transition text-xs">🚪 Logout</button>
                      </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleResetData}
                title="Reset sample profiles for Bhopal"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 p-2 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setNotifications(prev => prev.map(n => ({...n, read: true}))); }}
                  className="relative p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-300 hover:text-yellow-400"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-black text-white">🔔 Notifications</span>
                      <button onClick={() => setNotifications([])} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold">Clear all</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">No notifications yet</div>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {notifications.map(n => (
                          <li key={n.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition">
                            <p className="text-xs text-slate-200 font-medium">{n.msg}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{n.time}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/partner-join"
                className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 border border-yellow-500 px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                <span>Join Partner</span>
              </Link>

              <button
                onClick={() => setCurrentTab("appointments")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                  currentTab === "appointments"
                    ? "bg-yellow-400 text-slate-950"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Bookings ({appointments.length})</span>
              </button>
            </div>

            {/* Mobile layout cleaned up by moving actions to Hamburger sidebar */}

          </div>
        </div>
      </header>

      {/* UPGRADED HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-16 md:py-24 px-4 border-b border-white/10 flex items-center min-h-[500px]">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt="Hero background"
              className={`hero-img-transition absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${activeImage === idx ? 'opacity-15 scale-105' : 'opacity-0 scale-100'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/65 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/10 z-10"></div>
          
          {/* Decorative Glow Effects */}
          <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-yellow-500/10 rounded-full blur-[100px] z-10 anim-pulse-slow"></div>
          <div className="absolute -bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[100px] z-10 anim-pulse-slower"></div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 w-full">
          {/* Text Content Area */}
          <div className="text-center lg:text-left flex-1 space-y-6">
            <div className="flex items-center justify-center lg:justify-start space-x-2 flex-wrap gap-2 mb-2">
              <span className="bg-yellow-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                Bhopal Exclusive
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full">
                🏷️ Services Start @ ₹49
              </span>
              <span className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full hidden sm:inline-block">
                ⚡ 10-Min Arrival Active
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
              Bhopal's Premium <br />
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Skilled Worker
              </span>{" "}
              Marketplace.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-350 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Get verified Plumbers, Electricians, and Carpenters at your doorstep in minutes.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={() => triggerBooking(null)}
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-base font-black px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                <span>Book a Service</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <Link
                href="/join-as-partner"
                className="w-full sm:w-auto border border-white/20 hover:border-yellow-500/50 hover:bg-white/5 text-white hover:text-yellow-400 text-base font-bold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                <span>Join as Partner</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 justify-center lg:justify-start pt-2">
              <div className="flex -space-x-3">
                {heroImages.slice(0, 4).map((src, i) => (
                  <img key={i} src={src} className="w-10 h-10 rounded-full border-2 border-slate-950 object-cover shadow-sm" alt={`Worker ${i+1}`} />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs text-white font-bold z-10 shadow-sm">
                  +5k
                </div>
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-xs text-slate-400 font-medium">Trusted in Bhopal</span>
              </div>
            </div>
          </div>
          
          {/* STATS CARDS (Desktop Right Side) */}
          <div className="hidden lg:flex w-5/12 relative items-center justify-center">
            <div className="relative w-[320px] space-y-4">
              {/* Card 1 */}
              <div className="glass-card-3d group cursor-default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-455 text-xs font-semibold uppercase tracking-widest mb-1">Active Pros Online</p>
                    <p className="text-4xl font-black text-white tracking-tight">5,200+</p>
                    <p className="text-emerald-400 text-xs font-bold mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +128 joined this week
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass-card-3d group cursor-default translate-x-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-455 text-xs font-semibold uppercase tracking-widest mb-1">Avg. Response Time</p>
                    <p className="text-4xl font-black text-white tracking-tight">8 min</p>
                    <p className="text-sky-400 text-xs font-bold mt-1 flex items-center gap-1">
                      <Clock3 className="w-3 h-3" /> Bhopal Express Dispatch
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock3 className="w-7 h-7 text-sky-400" />
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass-card-3d group cursor-default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-455 text-xs font-semibold uppercase tracking-widest mb-1">Customer Rating</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-white tracking-tight">4.9</p>
                      <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-450 fill-yellow-450" />)}</div>
                    </div>
                    <p className="text-purple-400 text-xs font-bold mt-1 flex items-center gap-1">
                      <Award className="w-3 h-3" /> 12,000+ verified reviews
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-400/20 border border-purple-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-7 h-7 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-6 -right-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 px-3 py-2 rounded-2xl shadow-xl anim-bounce-slow">
                <p className="text-emerald-400 text-xs font-black">⚡ LIVE</p>
              </div>
              <div className="absolute -bottom-4 -left-4 anim-pulse-slow">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl">
                  <p className="text-white text-[10px] font-bold">🏆 #1 in Bhopal</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* STATS CARDS (Mobile / Tablet Stacked Below Hero, hidden on desktop) */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-12 relative z-10">
          <div className="glass-card-3d flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl">
            <div>
              <p className="text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-0.5">Active Pros Online</p>
              <p className="text-2xl font-black text-white">5,200+</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-400" />
            </div>
          </div>

          <div className="glass-card-3d flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl">
            <div>
              <p className="text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-0.5">Avg. Response</p>
              <p className="text-2xl font-black text-white">8 min</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-400/20 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-sky-400" />
            </div>
          </div>

          <div className="glass-card-3d flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl">
            <div>
              <p className="text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-0.5">Rating</p>
              <p className="text-2xl font-black text-white">4.9 ⭐</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-400/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 w-full">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/15 p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Main Search Input */}
          <div className="md:col-span-2 relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search e.g. leaking pipe, fan repair, kitchen renovation, tile fixing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-slate-950 font-medium text-white placeholder:text-slate-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} title="Clear search" className="absolute right-4 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Area Status Verify widget */}
          <div className="flex items-center justify-between md:justify-end gap-3 bg-yellow-500/5 p-2 rounded-xl border border-yellow-500/10">
            <div className="text-left text-xs leading-tight">
              <span className="font-bold block text-white">Check Area Status</span>
              <span className="text-slate-400">Hamari services h ya nhi?</span>
            </div>
            <button
              onClick={() => setCurrentTab("check-area")}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 border border-yellow-500 text-xs font-black px-4 py-2.5 rounded-xl transition shrink-0 flex items-center space-x-1 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
            >
              <span>Verify</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            How <span className="text-yellow-400">Tekton</span> Works
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-400">
            Three simple steps to get high-quality services at your doorstep in Bhopal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
            <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/[0.03] select-none tracking-tighter">
              01
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Wrench className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Choose a Service</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Select the service you need from our extensive range of options like plumbing, electrical work, and carpentry.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
            <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/[0.03] select-none tracking-tighter">
              02
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Confirmation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our advanced matching system connects you with a verified partner in minutes, ensuring speedy arrival.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
            <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/[0.03] select-none tracking-tighter">
              03
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Job Done</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our verified partner completes your task cleanly. You pay only after checking the work to your satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-white/10 space-x-6 text-sm font-bold overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setCurrentTab("services")}
            className={`pb-3 shrink-0 relative transition ${
              currentTab === "services" ? "text-yellow-450 border-b-2 border-yellow-450" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Bhopal Experts & Enquire
          </button>
          
          <button
            onClick={() => setCurrentTab("check-area")}
            className={`pb-3 shrink-0 relative transition ${
              currentTab === "check-area" ? "text-yellow-450 border-b-2 border-yellow-450" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Coverage Check (MP Only)
          </button>

          <button
            onClick={() => setCurrentTab("appointments")}
            className={`pb-3 shrink-0 relative transition ${
              currentTab === "appointments" ? "text-yellow-450 border-b-2 border-yellow-450" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Active Bookings
            {appointments.length > 0 && (
              <span className="ml-1.5 bg-yellow-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                {appointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: EXPLORE WORKERS */}
      {currentTab === "services" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          
          {/* CATEGORIES GRID */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-450 mb-4">
              Select Task Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat, idx) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name + idx}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      triggerBooking(null, cat.name);
                    }}
                    className={`rounded-2xl border text-left p-4 transition-all duration-300 flex items-center space-x-3 hover:-translate-y-1.5 relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)] ring-2 ring-yellow-400/50"
                        : "bg-slate-900/40 hover:bg-slate-900/60 border-white/10 text-slate-200 shadow-md hover:border-yellow-400/30"
                    }`}
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    
                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? "bg-yellow-400 text-slate-950" : "bg-slate-800 text-yellow-400"}`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    
                    <div className="truncate flex-1">
                      <span className="block text-xs sm:text-sm md:text-base font-bold leading-tight truncate">
                        {cat.name}
                      </span>
                      <span className="block text-[10px] text-slate-400 leading-tight truncate">
                        {cat.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FILTER STATUS / INFO BAR */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/50 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 mb-6 gap-2 text-slate-350">
            <div>
              <span className="text-xs text-slate-400">Showing specialists for: </span>
              <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                {selectedCategory}
              </span>
              <span className="mx-1.5 text-slate-655">•</span>
              <span className="text-xs text-slate-400">Zone: </span>
              <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">
                📍 {selectedLocation}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Bhopal Express Core • 10-Min Response</span>
            </div>
          </div>

          {/* WORKERS GRID */}
          {loadingWorkers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-md animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-950/60 rounded mt-4" />
                </div>
              ))}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="relative bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-8 md:p-12 text-center border border-white/10 shadow-2xl max-w-3xl mx-auto overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full blur-[80px] opacity-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-[80px] opacity-10" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/20 px-4 py-1.5 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-yellow-450 uppercase tracking-widest">Available in {selectedLocation}</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                  Experts Ready For Dispatch in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">Bhopal!</span>
                </h3>
                
                <p className="text-base text-slate-405 mb-8 max-w-xl mx-auto leading-relaxed font-medium">
                  We don't have a specific profile card for this exact filter right now, but <strong className="text-white">our rapid response team covers every corner of {selectedLocation}</strong>. Just tell us what you need and we'll send a premium artisan to your doorstep in minutes.
                </p>
                
                <button
                  onClick={() => triggerBooking(null)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-base px-8 py-4 rounded-full shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center mx-auto space-x-2 border border-yellow-500"
                >
                  <span>🚀 Request Immediate Service</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map((worker, index) => (
                <div
                  key={worker.id}
                  className={`stagger-delay-${Math.min(index, 9)} animate-fade-in-up bg-slate-900/40 backdrop-blur-md rounded-[1.8rem] p-6 border border-white/10 hover:border-yellow-400/50 hover:shadow-[0_15px_40px_rgba(250,204,21,0.15)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between relative group overflow-hidden`}
                >
                  {/* Subtle dynamic background gradient */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 pointer-events-none translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:-translate-y-0" />
                  
                  <div>
                    {/* Top item row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={worker.avatarUrl}
                            alt={worker.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white/10 shrink-0 shadow-sm group-hover:border-yellow-450 transition-colors duration-300 z-10 relative"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                            }}
                          />
                          {/* Animated ring behind avatar */}
                          <div className="absolute inset-0 rounded-full border border-yellow-450 opacity-0 group-hover:opacity-100 group-hover:animate-ping duration-1000 anim-ping-slow" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-yellow-450 transition-colors">{worker.name}</h3>
                            {worker.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-900 shrink-0" />}
                          </div>
                          <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded mt-0.5 inline-block tracking-wide shadow-sm">
                            {worker.category}
                          </span>
                        </div>
                      </div>

                      {/* Pricing badge */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight">Visiting Cost</span>
                        <span className="text-sm font-black text-white">₹{worker.basePrice}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 my-4 pt-4 border-t border-white/5 text-xs text-slate-300">
                      <div className="flex items-center bg-slate-950/40 rounded-lg px-2 py-1.5 border border-white/5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-1.5 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]" />
                        <span className="font-bold text-white">{worker.rating}</span>
                        <span className="text-slate-500 ml-1">({worker.reviewsCount})</span>
                      </div>
                      <div className="text-right bg-slate-950/40 rounded-lg px-2 py-1.5 flex items-center justify-end border border-white/5">
                        <span className="font-semibold text-slate-200">{worker.experienceYears} yrs</span> <span className="ml-1 text-slate-400">exp.</span>
                      </div>
                    </div>

                    {/* Bio description */}
                    <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 p-3 rounded-xl italic border border-white/5 group-hover:bg-yellow-400/5 transition-colors duration-300">
                      "{worker.bio}"
                    </p>

                    {/* Service Coverage regions */}
                    <div className="mt-4 flex items-center text-[11px] text-slate-400 bg-slate-950/40 px-2.5 py-2 rounded-lg border border-white/5 group-hover:border-yellow-400/20 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0" />
                      <span className="truncate font-semibold text-slate-300">Serves: {worker.locations}</span>
                    </div>

                    {/* Portfolio / Recent Work */}
                    {worker.portfolio && worker.portfolio.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-2 block">Recent Work</span>
                        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                          {worker.portfolio.map((imgUrl, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-lg shrink-0 overflow-hidden border border-white/10">
                              <img src={imgUrl} alt={`Work ${idx+1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        alert(`📞 Call Bhopal Specialist ${worker.name}: +91 ${worker.phone}\nAlternatively, book an appointment below for guaranteed arrival.`);
                      }}
                      className="text-xs text-slate-400 hover:text-white font-semibold flex items-center py-2 px-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <span>Contact</span>
                    </button>

                    <button
                      onClick={() => triggerBooking(worker)}
                      className="group/btn relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center shrink-0 shadow-[0_4px_10px_rgba(250,204,21,0.2)] hover:shadow-[0_8px_20px_rgba(250,204,21,0.4)] hover:-translate-y-1 border border-yellow-500 overflow-hidden"
                    >
                      {/* Shine effect on button hover */}
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                      <span className="relative z-10">Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GENERAL ENQUIRY CALL TO ACTION */}
          <section className="mt-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-amber-400/10 pointer-events-none" />
            <div className="max-w-xl">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                Bhopal Core Delivery
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2">
                Bhopal Me Koi Bhi Kam Karana Hai? Post Enquiry Directly.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Batayein kya kam karana hai, aur Bhopal ki kis location par karwana hai. Waha hamari express service instantly dispatch hogi.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => triggerBooking(null, "Plumber")}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  🚰 Tap / Tank Fix
                </button>
                <button
                  onClick={() => triggerBooking(null, "Carpenter")}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  🪚 Door Repair
                </button>
                <button
                  onClick={() => triggerBooking(null, "Electrician")}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  ⚡ Light Fitting
                </button>
                <button
                  onClick={() => triggerBooking(null, "Painter")}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  🎨 Wall Dampness
                </button>
                <button
                  onClick={() => triggerBooking(null, "Cleaning Service")}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  🧹 Deep Cleaning
                </button>
              </div>

              <button
                onClick={() => triggerBooking(null)}
                className="mt-6 bg-[#F8CB46] text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition"
              >
                Open Custom Enquiry Form
              </button>
            </div>
          </section>

        </main>
      )}

      {/* TAB CONTENT 2: CHECK SERVICE COVERAGE AREA */}
      {currentTab === "check-area" && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Check Area Service Availability</h2>
                <p className="text-xs text-slate-400">Kon si location par karwana h waha hamari services h ya nhi?</p>
              </div>
            </div>

            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 mb-5 text-xs text-yellow-300 flex items-start gap-2">
              <span className="text-base">📍</span>
              <span><strong className="text-yellow-400">Notice:</strong> Tekton services are live <strong className="text-yellow-400">exclusively in Bhopal city, MP</strong>. Query your colony below.</span>
            </div>

            <form onSubmit={handleVerifyArea} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Enter Your Colony, Pincode or Landmark in Bhopal
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP Nagar Zone 1, Kolar Road, Arera Colony, 462016..."
                    value={checkAreaInput}
                    onChange={(e) => setCheckAreaInput(e.target.value)}
                    className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  >
                    Check
                  </button>
                </div>
              </div>
            </form>

            {checkResult.status !== "idle" && (
              <div className={`mt-5 p-4 rounded-xl border animate-fade-in ${
                checkResult.status === "yes"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}>
                <div className="flex items-start space-x-3">
                  <span className="text-base mt-0.5">{checkResult.status === "yes" ? "✅" : "❌"}</span>
                  <div className="flex-1">
                    <h4 className={`text-xs font-bold uppercase tracking-wide ${
                      checkResult.status === "yes" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {checkResult.status === "yes" ? "Service Available Here!" : "Out of Operational Range"}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      checkResult.status === "yes" ? "text-emerald-300" : "text-rose-300"
                    }`}>{checkResult.message}</p>
                    {checkResult.status === "yes" && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            const matched = BHOPAL_LOCATIONS.find(l => checkResult.area.toLowerCase().includes(l.toLowerCase()));
                            setSelectedLocation(matched || "All Bhopal (MP)");
                            triggerBooking(null);
                          }}
                          className="bg-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                        >
                          📅 Book For This Area
                        </button>
                        <button
                          onClick={() => setCurrentTab("services")}
                          className="bg-white/5 text-white border border-white/10 font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-white/10 transition"
                        >
                          View Available Pros
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                📍 Coverage Hubs in Bhopal
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BHOPAL_LOCATIONS.filter(l => l !== "All Bhopal (MP)").map((loc) => (
                  <div
                    key={loc}
                    onClick={() => { setSelectedLocation(loc); showToast(`Switched to ${loc}, Bhopal`); }}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer text-xs font-bold transition ${
                      selectedLocation === loc
                        ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/40"
                        : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-white/5 hover:border-white/15"
                    }`}
                  >
                    📍 {loc}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-3 text-center leading-relaxed">
                Covering Minal Residency, People's Mall, Ashoka Garden, Indrapuri, Anand Nagar, Kolar outskirts, and all Bhopal colonies.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* TAB CONTENT 3: MY APPOINTMENTS / BOOKINGS */}
      {currentTab === "appointments" && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">My Bookings & Dispatch</h2>
                <p className="text-xs text-slate-400">Track your Bhopal service requests live.</p>
              </div>
              <button
                onClick={fetchAppointments}
                className="text-xs font-bold text-slate-300 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/30 rounded-xl px-3 py-1.5 transition"
              >
                🔄 Refresh
              </button>
            </div>

            {appointments.filter(a => a.customerPhone === userPhone).length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-sm font-bold text-white mb-1">No bookings yet</p>
                <p className="text-xs text-slate-400">Book a service to see your live tracking here.</p>
                <button
                  onClick={() => setCurrentTab("services")}
                  className="mt-5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.filter(a => a.customerPhone === userPhone).map((app) => {
                  const assignedWorker = workers.find((w) => w.id === app.assignedWorkerId);
                  const stepIndex = BOOKING_STATUS_STEPS.findIndex(s => s.key === app.status);

                  return (
                    <div key={app.id} className="bg-slate-950/50 rounded-2xl border border-white/10 overflow-hidden group hover:border-yellow-400/20 transition-all duration-300">
                      
                      {/* Card Top: Category + Status */}
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                              app.status === "Confirmed"  ? "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30" :
                              app.status === "Completed"  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                              app.status === "Cancelled"  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                              app.status === "OnTheWay"   ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" :
                              "bg-slate-700 text-slate-300 border border-slate-600"
                            }`}>
                              ● {app.status}
                            </span>
                            <span className="text-sm font-bold text-white">{app.category}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            📅 {app.appointmentDate} &nbsp;•&nbsp; {app.appointmentTime}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Booking #</p>
                          <p className="text-xs font-black text-slate-300">{String(app.id).padStart(4,'0')}</p>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      {app.status !== "Cancelled" && (
                        <div className="px-4 pb-3">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute left-4 right-4 top-3 h-0.5 bg-slate-700 z-0" />
                            <div
                              className="absolute left-4 top-3 h-0.5 bg-yellow-400 z-0 transition-all duration-700"
                              style={{ width: stepIndex >= 0 ? `${(stepIndex / (BOOKING_STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                            />
                            {BOOKING_STATUS_STEPS.map((step, i) => (
                              <div key={step.key} className="relative z-10 flex flex-col items-center gap-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-all duration-500 ${
                                  i <= stepIndex
                                    ? "bg-yellow-400 border-yellow-400 text-slate-950"
                                    : "bg-slate-800 border-slate-600 text-slate-500"
                                }`}>
                                  {i <= stepIndex ? step.icon : i + 1}
                                </div>
                                <span className={`text-[9px] font-bold text-center max-w-[50px] leading-tight ${
                                  i <= stepIndex ? "text-yellow-400" : "text-slate-600"
                                }`}>{step.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="px-4 pb-3 border-t border-white/5 pt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-bold">Customer:</span>
                          <span className="text-slate-200 font-semibold">{app.customerName}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{app.customerPhone}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <span>{app.customerAddress}, {app.location}</span>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-2.5 text-xs text-slate-300 border border-white/5">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Work Requested</span>
                          {app.description}
                        </div>

                        {assignedWorker ? (
                          <div className="flex items-center gap-2 pt-1">
                            <img src={assignedWorker.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-yellow-400/30" />
                            <span className="text-xs text-slate-300">
                              Expert: <strong className="text-white">{assignedWorker.name}</strong>
                              <span className="text-slate-500 ml-1">• {assignedWorker.phone}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-yellow-400/70 italic flex items-center gap-1">
                            <span className="animate-pulse">⚡</span> Mapping nearest expert...
                          </div>
                        )}
                      </div>

                      {/* Action Buttons & Status Messages */}
                      <div className="px-4 pb-4 flex items-center justify-between gap-3 flex-wrap border-t border-white/5 pt-3">
                        {/* Status Message (visible to customer only) */}
                        {!isAdmin && (
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            {app.status === "Pending" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping shrink-0" />
                                <span>⏳ Waiting for dispatch confirmation...</span>
                              </>
                            )}
                            {app.status === "Confirmed" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                                <span>📅 Confirmed! Artisan will start shortly.</span>
                              </>
                            )}
                            {app.status === "OnTheWay" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping shrink-0" />
                                <span className="text-blue-400 font-extrabold">🛵 Artisan is on the way!</span>
                              </>
                            )}
                            {app.status === "Completed" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="text-emerald-400 font-extrabold">🎉 Task Completed! Thank you.</span>
                              </>
                            )}
                            {app.status === "Cancelled" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                <span className="text-rose-400 font-extrabold">❌ Booking Cancelled.</span>
                              </>
                            )}
                          </span>
                        )}

                        <div className="flex gap-2 flex-wrap items-center ml-auto">
                          {/* Admin Only Actions */}
                          {isAdmin && (
                            <>
                              {app.status !== "Confirmed" && app.status !== "Completed" && app.status !== "Cancelled" && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, "Confirmed")}
                                  className="text-[11px] bg-yellow-400/10 border border-yellow-400/20 hover:bg-yellow-400/20 font-bold px-3 py-1.5 rounded-lg text-yellow-400 transition"
                                >
                                  ✓ Confirm
                                </button>
                              )}
                              {app.status === "Confirmed" && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, "OnTheWay")}
                                  className="text-[11px] bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 font-bold px-3 py-1.5 rounded-lg text-blue-400 transition"
                                >
                                  🛵 On The Way
                                </button>
                              )}
                              {app.status !== "Completed" && app.status !== "Cancelled" && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, "Completed")}
                                  className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold px-3 py-1.5 rounded-lg text-emerald-400 transition"
                                >
                                  🎉 Done
                                </button>
                              )}
                            </>
                          )}

                          {/* Customer & Admin Cancel Action */}
                          {app.status !== "Cancelled" && app.status !== "Completed" && (
                            <button
                              disabled={app.status === "OnTheWay"}
                              onClick={() => updateAppointmentStatus(app.id, "Cancelled")}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition border ${
                                app.status === "OnTheWay"
                                  ? "bg-slate-800 border-white/5 text-slate-500 cursor-not-allowed opacity-50"
                                  : "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400"
                              }`}
                              title={app.status === "OnTheWay" ? "Cannot cancel once helper is dispatched" : "Cancel Booking"}
                            >
                              {app.status === "OnTheWay" ? "✕ Cancel Disabled" : "✕ Cancel Booking"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          </main>
        )}

      {/* 3-STEP APPOINTMENT / ENQUIRY BOOKING MODAL */}
      <BookingModal
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setSelectedWorkerForBooking(null);
        }}
        serviceName={bookingForm.category}
        basePrice={selectedWorkerForBooking ? selectedWorkerForBooking.basePrice : 99}
        worker={selectedWorkerForBooking}
        initialLocation={bookingForm.location}
        onSubmit={async (finalData) => {
          try {
            const basePriceValue = selectedWorkerForBooking ? selectedWorkerForBooking.basePrice : 99;
            const finalPriceValue = Math.max(0, basePriceValue - (finalData.couponDiscount || 0));
            const payload = {
              customerName: finalData.customerName,
              phoneNumber: finalData.customerPhone,
              locationZone: finalData.location,
              exactAddress: finalData.customerAddress,
              serviceCategory: finalData.category,
              description: finalData.description,
              visitDate: finalData.appointmentDate,
              timeSlot: finalData.appointmentTime,
              totalPrice: finalPriceValue,
            };

            const res = await fetch("/api/appointments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              const err = await res.json();
              alert(err.error || "Booking failed");
              return;
            }

            await fetchAppointments();
            showToast(`⚡ Appointment Confirmed! Assigned artisan dispatching to ${finalData.location} shortly.`);
            addNotification(`New Booking: ${finalData.category} task on ${finalData.appointmentDate}`);
            setCurrentTab("appointments");

            // Save user session based on booking phone
            setUserPhone(finalData.customerPhone);
            localStorage.setItem("tektonUserPhone", finalData.customerPhone);
            setIsLoggedIn(true);

          } catch (err) {
            console.error(err);
            alert("Failed submitting appointment");
          }
        }}
      />

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wider">
              👤 Edit Profile Details
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as typeof e.target & {
                  name: { value: string };
                  phone: { value: string };
                };
                const newName = target.name.value.trim();
                const newPhone = target.phone.value.trim();

                if (!newName || !newPhone) {
                  alert("Name and phone number cannot be empty.");
                  return;
                }

                localStorage.setItem("tektonUserName", newName);
                localStorage.setItem("tektonUserPhone", newPhone);
                setUserName(newName);
                setUserPhone(newPhone);
                setIsEditProfileOpen(false);
                showToast("✓ Profile updated successfully!");
              }}
              className="space-y-4 text-slate-200"
            >
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Full Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={userName}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={userPhone}
                  required
                  pattern="[0-9]{10}"
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-955 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition font-mono"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN / REGISTER MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">

            <button
              onClick={() => {
                setShowLoginModal(false);
                setIsRegistering(false);
                setRegisterName("");
                setRegisterPhone("");
                setLoginPhoneInput("");
                setIsOtpSent(false);
                setOtpCode("");
                setConfirmationResult(null);
                setOtpError("");
              }}
              title="Close"
              aria-label="Close login modal"
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full w-8 h-8 flex items-center justify-center transition z-10"
            >
              ✕
            </button>

            {/* Header */}
            <div className="bg-slate-900 text-white p-8 text-center rounded-b-[2rem]">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setIsOtpSent(false);
                    setOtpCode("");
                    setConfirmationResult(null);
                    setOtpError("");
                  }}
                  className={`text-sm font-bold px-4 py-1.5 rounded-full transition ${
                    !isRegistering
                      ? "bg-[#F8CB46] text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsRegistering(true);
                    setIsOtpSent(false);
                    setOtpCode("");
                    setConfirmationResult(null);
                    setOtpError("");
                  }}
                  className={`text-sm font-bold px-4 py-1.5 rounded-full transition ${
                    isRegistering
                      ? "bg-[#F8CB46] text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>
              <h2 className="text-2xl font-extrabold mb-1">
                {isRegistering ? "Join Tekton Bhopal" : "Welcome Back!"}
              </h2>
              <p className="text-slate-400 text-xs">
                {isRegistering
                  ? "Register to book services & track your orders."
                  : "Login to manage your bookings and rewards."}
              </p>
            </div>

            <div className="p-8 pt-5">
              {isRegistering ? (
                /* ── REGISTER FORM ── */
                <div className="space-y-4">
                  {!isOtpSent ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ramesh Sharma"
                          title="Your full name"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number (Optional)</label>
                        <input
                          type="tel"
                          placeholder="10-digit number e.g. 9876543210"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
                        <input
                          type="email"
                          placeholder="e.g. ramesh@gmail.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
                        <input
                          type="password"
                          placeholder="Create a password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">📍 Bhopal Zone / Area *</label>
                        <select
                          title="Select your Bhopal area"
                          aria-label="Select your Bhopal zone"
                          value={registerLocation}
                          onChange={(e) => setRegisterLocation(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition bg-white text-slate-900"
                        >
                          <option value="" className="text-slate-900 bg-white">-- Select your area --</option>
                          {BHOPAL_LOCATIONS.filter(l => l !== "All Bhopal (MP)").map((loc) => (
                            <option key={loc} value={loc} className="text-slate-900 bg-white">{loc}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={async () => {
                          if (registerName.trim().length < 2) { alert("Please enter your full name."); return; }
                          if (registerPhone.trim().length < 10) { alert("Please enter a valid 10-digit mobile number."); return; }
                          if (!registerLocation) { alert("Please select your Bhopal zone."); return; }
                          await handleFirebaseRegister();
                        }}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-2 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                            Sending SMS...
                          </>
                        ) : (
                          "🚀 Verify Phone & Continue"
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* OTP verification view for registration */}
                      <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 mb-2 text-center text-xs text-amber-850">
                        We sent a 6-digit OTP code to <strong className="font-bold">{registerPhone}</strong>. Please check your SMS.
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Enter 6-Digit OTP *</label>
                        <input
                          type="text"
                          placeholder="e.g. 123456"
                          maxLength={6}
                          title="Enter the 6-digit verification code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-center font-black tracking-widest text-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-300"
                        />
                      </div>
                      
                      {otpError && (
                        <p className="text-rose-600 font-bold text-xs text-center">{otpError}</p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setIsOtpSent(false);
                            setOtpCode("");
                            setConfirmationResult(null);
                            setOtpError("");
                          }}
                          disabled={authLoading}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-xl transition border border-slate-300"
                        >
                          Change Number
                        </button>
                        <button
                          onClick={() => handleFirebaseRegister()}
                          disabled={authLoading}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-xl transition border border-slate-300"
                        >
                          Resend OTP
                        </button>
                      </div>

                      <button
                        onClick={() => handleFirebaseRegister()}
                        disabled={authLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 disabled:cursor-not-allowed text-white font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-2 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Verifying...
                          </>
                        ) : (
                          "✓ Verify & Register Account"
                        )}
                      </button>
                    </>
                  )}
                  
                  <p className="text-center text-xs text-slate-500 mt-2 font-medium">
                    Already registered?{" "}
                    <button
                      onClick={() => {
                        setIsRegistering(false);
                        setIsOtpSent(false);
                        setOtpCode("");
                        setConfirmationResult(null);
                        setOtpError("");
                      }}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              ) : (
                /* ── LOGIN FORM ── */
                <div className="space-y-4">
                  {!isOtpSent ? (
                    <>
                      {/* Role Selector */}
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setLoginRole("user")}
                          title="Login as Customer/User"
                          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
                            loginRole === "user"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          👤 User / Customer
                        </button>
                        <button
                          onClick={() => setLoginRole("vendor")}
                          title="Login as Service Partner / Vendor"
                          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
                            loginRole === "vendor"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          🛠️ Vendor / Partner
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {loginRole === "vendor" ? "Registered Vendor Phone" : "Phone Number"}
                        </label>
                        <input
                          type="tel"
                          placeholder="Enter your 10-digit number"
                          title="Your registered phone number"
                          value={loginPhoneInput}
                          onChange={(e) => setLoginPhoneInput(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (loginPhoneInput.trim().length < 10) {
                            alert("Please enter a valid 10-digit phone number.");
                            return;
                          }
                          await handleFirebaseLogin();
                        }}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-2 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                            Sending SMS...
                          </>
                        ) : (
                          "🔑 Send Verification OTP"
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* OTP verification view for login */}
                      <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 mb-2 text-center text-xs text-amber-855">
                        We sent a 6-digit OTP code to <strong className="font-bold">{loginPhoneInput}</strong>. Please check your SMS.
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Enter 6-Digit OTP *</label>
                        <input
                          type="text"
                          placeholder="e.g. 123456"
                          maxLength={6}
                          title="Enter the 6-digit verification code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-center font-black tracking-widest text-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-300"
                        />
                      </div>

                      {otpError && (
                        <p className="text-rose-600 font-bold text-xs text-center">{otpError}</p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setIsOtpSent(false);
                            setOtpCode("");
                            setConfirmationResult(null);
                            setOtpError("");
                          }}
                          disabled={authLoading}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-xl transition border border-slate-300"
                        >
                          Change Number
                        </button>
                        <button
                          onClick={() => handleFirebaseLogin()}
                          disabled={authLoading}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-xl transition border border-slate-300"
                        >
                          Resend OTP
                        </button>
                      </div>

                      <button
                        onClick={() => handleFirebaseRegister()}
                        disabled={authLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 disabled:cursor-not-allowed text-white font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-2 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Verifying...
                          </>
                        ) : (
                          "✓ Verify & Login Securely"
                        )}
                      </button>
                    </>
                  )}

                  <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                    New to Tekton Bhopal?{" "}
                    <button
                      onClick={() => {
                        setIsRegistering(true);
                        setIsOtpSent(false);
                        setOtpCode("");
                        setConfirmationResult(null);
                        setOtpError("");
                      }}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      Create account
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* RECENT WORK GALLERY SECTION */}
      <div className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="bg-amber-100 text-amber-850 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-200">
              Platform Authenticity
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-3 tracking-tight">
              Real Work Done by Our <span className="text-amber-500">Bhopal Pros</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              No generic stock photos. These are real project snapshots captured directly from recent structural renovations and home assemblies across Bhopal colonies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Project 1 */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(248,203,70,0.15)] hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-56 overflow-hidden relative anim-pulse-slow">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Heavy Metal Gate Work" />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-md">Govindpura Industrial</span>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm text-slate-900">Heavy Industrial Gate Metal Fabrication</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Heavy-duty iron gate welding, alignment tuning, and anti-rust base painting completed for commercial workshop.</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Category: Fabrication / Welding</span>
                  <span className="text-xs font-black text-emerald-650">₹14,999 Total Cost</span>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(248,203,70,0.15)] hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1622372738946-62e02505feb3?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Modular Woodwork" />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-md">Minal Residency</span>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm text-slate-900">Premium Main Door Polish & Lock Installation</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Fine teakwood door lock carving, handle placement, and 3-layer protective premium teak varnish finish.</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Category: Carpenter / Woodwork</span>
                  <span className="text-xs font-black text-emerald-650">₹2,499 Total Cost</span>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(248,203,70,0.15)] hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1556910103-1c02745a8281?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Complete Modular Kitchen Woodwork" />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-md">Arera Colony</span>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm text-slate-900">Modular Kitchen Woodwork & Fitting Setup</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Complete hydraulic hinge installation, basket alignments, chimney fitting, and soft-close cabinet assembly.</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Category: Carpenter / Modular</span>
                  <span className="text-xs font-black text-emerald-650">₹18,500 Total Cost</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <div className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Trusted by 10,000+ <span className="text-amber-500">Bhopal Residents</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Real feedback from real people across Bhopal. See what your neighbors are saying about our 10-minute instant response service.
            </p>
          </div>

          <div className="overflow-hidden pb-6 relative w-full group">
            <div className="flex space-x-4 animate-marquee w-max">
              {[...reviewsList, ...reviewsList].map((review, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 w-[300px] sm:w-[350px] bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-700 text-lg border border-amber-200">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{review.name}</h4>
                        <div className="flex items-center text-[10px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 mr-0.5 text-slate-400" /> {review.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-900 leading-relaxed italic font-medium">
                    "{review.text}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {review.service}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {review.date}
                  </span>
                </div>
              </div>
            ))}
            </div>
            {/* Gradient overlays for smooth fading edges */}
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
          </div>

          {/* WRITE A REVIEW FORM */}
          <div className="max-w-xl mx-auto mt-12 p-6 bg-slate-50/80 backdrop-blur-md border border-slate-200 rounded-[2rem] shadow-lg animate-fade-in relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <h3 className="text-base font-black text-slate-900 mb-1 tracking-tight text-center flex items-center justify-center gap-1.5">
              ✍️ Share Your Bhopal Tekton Experience!
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5 font-medium">Your rating helps us reward our partner workers directly.</p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Saxena"
                    value={newFeedbackName}
                    onChange={(e) => setNewFeedbackName(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Bhopal Colony</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arera Colony"
                    value={newFeedbackLocation}
                    onChange={(e) => setNewFeedbackLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Service Category</label>
                  <select
                    value={newFeedbackService}
                    onChange={(e) => setNewFeedbackService(e.target.value)}
                    title="Select service received"
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="Plumber">Plumbing</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Painter">Painter</option>
                    <option value="Tank Cleaning">Tank Cleaning</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Exterior Design">Exterior Design</option>
                    <option value="Cleaning Service">Cleaning Service</option>
                    <option value="AC & Appliances">AC & Appliances</option>
                    <option value="CCTV Cameras">CCTV Cameras</option>
                    <option value="General">General/Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Select Rating</label>
                  <div className="flex items-center space-x-1.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                        onClick={() => setNewFeedbackRating(star)}
                        className="focus:outline-none transition hover:scale-125"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newFeedbackRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-350"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Your Experience / Feedback</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Share your experience with Bhopal residents..."
                  value={newFeedbackText}
                  onChange={(e) => setNewFeedbackText(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition duration-300 border border-slate-850 hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                Post Review Live 🚀
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* WORK-THEMED MOOD LIFTER */}
      {showHappyMessage && (
        <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-50 bg-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 text-sm font-extrabold text-white animate-fade-in-up origin-bottom-right transition-all flex items-center space-x-2 max-w-[250px] pointer-events-auto text-left">
          <span>{currentHappyMessage}</span>
        </div>
      )}

      <button
        onClick={triggerHappyMood}
        className="fixed bottom-6 right-[88px] sm:bottom-8 sm:right-[104px] z-50 w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center text-2xl hover:scale-105 transition-all duration-300 group border border-slate-200"
        title="Tension free button!"
      >
        <span className="group-hover:rotate-12 transition-transform duration-300">👷‍♂️</span>
      </button>

      {/* AI CHATBOT COMPONENT */}
      <AIChatbot 
        userContext={{
          isLoggedIn: isLoggedIn,
          name: isLoggedIn ? userName || "Rahul" : "Guest",
          location: selectedLocation || "Bhopal"
        }} 
      />

      <Footer />
      {/* Permanent invisible reCAPTCHA parent container mounted outside conditional modals */}
      <div id="recaptcha-parent" className="hidden"></div>
    </div>
  );
}
