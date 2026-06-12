"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Wrench, Hammer, Zap, Paintbrush, HardHat, Sparkles, 
  Droplets, LayoutDashboard, Building2, Briefcase, Camera,
  ShieldCheck, Star, Calendar, MapPin, Search, ArrowRight,
  TrendingUp, Award, Clock3, Users, DollarSign
} from "lucide-react";
import TektonLogo from "@/components/TektonLogo";
import Header from "@/components/Header";

// Predefined list of 15 mock completed jobs with realistic Bhopal contexts
const COMPLETED_JOBS = [
  {
    id: "TKT-8290",
    customerName: "Anil Saxena",
    location: "Arera Colony",
    category: "Tank Cleaning",
    icon: Droplets,
    color: "from-sky-400 to-blue-500",
    description: "Deep water tank cleaning (1000L PVC), vacuuming, high-pressure washing, and complete antibacterial chemical treatment.",
    workerName: "Sagar Kushwaha",
    workerRating: "4.9",
    cost: "₹799",
    daysAgo: 1,
    dateStr: "May 20, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8273",
    customerName: "Meera Deshmukh",
    location: "Minal Residency",
    category: "Interior Design",
    icon: LayoutDashboard,
    color: "from-fuchsia-400 to-pink-600",
    description: "Modular kitchen interior design consultation, detailed 3D layout rendering, and color scheme mapping for cabinets.",
    workerName: "Amit Tiwari",
    workerRating: "5.0",
    cost: "₹4,500",
    daysAgo: 2,
    dateStr: "May 19, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8255",
    customerName: "Rajesh Kulkarni",
    location: "Kolar Road",
    category: "Electrician",
    icon: Zap,
    color: "from-yellow-400 to-amber-500",
    description: "Complete house emergency board rewiring, inverter battery repair, and installation of modular smart switches.",
    workerName: "Dinesh Patel",
    workerRating: "4.8",
    cost: "₹1,200",
    daysAgo: 3,
    dateStr: "May 18, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8239",
    customerName: "Priyanka Singh",
    location: "MP Nagar",
    category: "Exterior Design",
    icon: Building2,
    color: "from-emerald-400 to-teal-600",
    description: "Office front facade building design concept blueprint and modern exterior color/glass cladding layout planning.",
    workerName: "Arun Vishwakarma",
    workerRating: "5.0",
    cost: "₹8,990",
    daysAgo: 4,
    dateStr: "May 17, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8221",
    customerName: "Vikram Rathore",
    location: "Gulmohar",
    category: "Plumber",
    icon: Wrench,
    color: "from-blue-400 to-indigo-600",
    description: "Resolved critical master bathroom concealed wall pipeline blockages, high-pressure leak testing, and upgraded premium taps.",
    workerName: "Kamlesh Solanki",
    workerRating: "4.9",
    cost: "₹1,499",
    daysAgo: 5,
    dateStr: "May 16, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8208",
    customerName: "Sunita Sharma",
    location: "Saket Nagar",
    category: "Cleaning Service",
    icon: Sparkles,
    color: "from-teal-400 to-emerald-500",
    description: "Full 3BHK deep home sterilization, professional sofa shampooing, modular kitchen grease washing, and window pane buffing.",
    workerName: "Manoj Kumar",
    workerRating: "5.0",
    cost: "₹3,499",
    daysAgo: 6,
    dateStr: "May 15, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8192",
    customerName: "Sanjay Mishra",
    location: "Ashoka Garden",
    category: "Tank Cleaning",
    icon: Droplets,
    color: "from-sky-400 to-blue-500",
    description: "Overhead PVC tank disinfection and underground RCC sump vacuum scrubbing completed for twin duplex house colony.",
    workerName: "Sagar Kushwaha",
    workerRating: "4.9",
    cost: "₹1,199",
    daysAgo: 7,
    dateStr: "May 14, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8178",
    customerName: "Dr. Alok Gupta",
    location: "Arera Colony",
    category: "CCTV Cameras",
    icon: Camera,
    color: "from-indigo-400 to-violet-600",
    description: "Installed 4 High-Definition smart IP cameras, configured cloud recording, NVR setup, and connected real-time smartphone feed.",
    workerName: "Vikram Sen",
    workerRating: "5.0",
    cost: "₹6,800",
    daysAgo: 8,
    dateStr: "May 13, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8154",
    customerName: "Rakesh Jain",
    location: "Indrapuri",
    category: "Carpenter",
    icon: Hammer,
    color: "from-amber-400 to-orange-500",
    description: "Custom design and structure assembly of a solid teak-wood living room sofa unit and master bed support repair.",
    workerName: "Rajesh Vishwakarma",
    workerRating: "4.8",
    cost: "₹8,500",
    daysAgo: 10,
    dateStr: "May 11, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8141",
    customerName: "Preeti Chawla",
    location: "Awadhpuri",
    category: "AC & Appliances",
    icon: Briefcase,
    color: "from-cyan-400 to-blue-500",
    description: "AC deep jet cleaning, high-pressure foam filter washing, gas pressure check, and replacement of a worn-out capacitor.",
    workerName: "Rahul Verma",
    workerRating: "4.9",
    cost: "₹899",
    daysAgo: 11,
    dateStr: "May 10, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8122",
    customerName: "Deepak Yadav",
    location: "Bairagarh",
    category: "Painter",
    icon: Paintbrush,
    color: "from-purple-400 to-pink-600",
    description: "Premium wall texture base application, anti-damp primer treatment, and double coat decorative styling for living room showcase wall.",
    workerName: "Sohan Lal",
    workerRating: "5.0",
    cost: "₹5,200",
    daysAgo: 12,
    dateStr: "May 09, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8109",
    customerName: "Nisha Lodhi",
    location: "Anand Nagar",
    category: "Tank Cleaning",
    icon: Droplets,
    color: "from-sky-400 to-blue-500",
    description: "Twin overhead tank mechanical scrubbing, mud suction, and food-grade safety chemical coating inside the water tank.",
    workerName: "Sagar Kushwaha",
    workerRating: "4.9",
    cost: "₹950",
    daysAgo: 13,
    dateStr: "May 08, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8091",
    customerName: "Harish Pathak",
    location: "Patel Nagar",
    category: "Interior Design",
    icon: LayoutDashboard,
    color: "from-fuchsia-400 to-pink-600",
    description: "Kids bedroom customized wallpaper assembly, bed position mapping, and false ceiling LED lighting panel planning.",
    workerName: "Amit Tiwari",
    workerRating: "5.0",
    cost: "₹6,400",
    daysAgo: 14,
    dateStr: "May 07, 2026",
    status: "Completed & Verified"
  },
  {
    id: "TKT-8078",
    customerName: "Vivek Chaurasia",
    location: "MP Nagar",
    category: "Electrician",
    icon: Zap,
    color: "from-yellow-400 to-amber-500",
    description: "Commercial shop ceiling spot lights assembly, emergency fuse board upgrades, and complete copper earthing installation.",
    workerName: "Dinesh Patel",
    workerRating: "4.9",
    cost: "₹2,800",
    daysAgo: 15,
    dateStr: "May 06, 2026",
    status: "Completed & Verified"
  }
];

// Unique colonies & categories for filtering dropdowns
const BHOPAL_COLONIES = [
  "All Areas", "Arera Colony", "Minal Residency", "Kolar Road", 
  "MP Nagar", "Gulmohar", "Saket Nagar", "Ashoka Garden", 
  "Indrapuri", "Awadhpuri", "Bairagarh", "Anand Nagar", "Patel Nagar"
];

const FILTER_CATEGORIES = [
  "All Services", "Tank Cleaning", "Interior Design", "Exterior Design",
  "Plumber", "Carpenter", "Electrician", "Painter", 
  "Cleaning Service", "AC & Appliances", "CCTV Cameras"
];

export default function RecentWorkPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // null = show all 15 days
  const [selectedColony, setSelectedColony] = useState("All Areas");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to generate the past 15 days calendar
  const past15Days = useMemo(() => {
    const list = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 1; i <= 15; i++) {
      // Calculate date relative to today (assuming today is May 21, 2026 based on mock context)
      const mockToday = new Date(2026, 4, 21); // May 21, 2026
      const targetDate = new Date(mockToday.getTime() - (i - 1) * 24 * 60 * 60 * 1000);
      
      // Calculate how many mock jobs are completed on this specific day ago
      const count = COMPLETED_JOBS.filter(job => job.daysAgo === i - 1).length;

      list.push({
        daysAgo: i - 1,
        dayNum: targetDate.getDate(),
        monthStr: months[targetDate.getMonth()],
        dayName: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
        jobCount: count
      });
    }
    return list;
  }, []);

  // Filter completed jobs based on selected day, colony, category and search query
  const filteredJobs = useMemo(() => {
    return COMPLETED_JOBS.filter(job => {
      // Day filter
      if (selectedDay !== null && job.daysAgo !== selectedDay) return false;
      
      // Colony filter
      if (selectedColony !== "All Areas" && job.location !== selectedColony) return false;
      
      // Category filter
      if (selectedCategory !== "All Services" && job.category !== selectedCategory) return false;
      
      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = job.customerName.toLowerCase().includes(query);
        const matchesDesc = job.description.toLowerCase().includes(query);
        const matchesWorker = job.workerName.toLowerCase().includes(query);
        const matchesId = job.id.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesWorker && !matchesId) return false;
      }
      
      return true;
    });
  }, [selectedDay, selectedColony, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 pb-20 relative overflow-hidden">
      
      {/* 3D Premium Ambient Orbs */}
      <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-amber-500/10 rounded-full blur-[120px] ambient-orb -z-10"></div>
      <div className="absolute bottom-1/4 left-10 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] ambient-orb -z-10"></div>

      {/* HEADER NAVBAR */}
      <Header />

      {/* HERO BANNER SECTION */}
      <div className="relative py-12 px-4 border-b border-slate-800 text-center">
        <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-amber-500/20 tracking-wider">
          🔴 REAL-TIME PLATFORM LEDGER
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white mt-3 mb-4 tracking-tight leading-tight">
          Bhopal Jobs Completed in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-500">Last 15 Days</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm font-medium leading-relaxed">
          Unveiling full transparency. Browse verified service tickets successfully resolved across MP Nagar, Arera Colony, and surrounding Bhopal areas by our local professionals.
        </p>

        {/* Live Counters */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-850 text-center shadow-md">
            <Users className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Partners</p>
            <p className="text-xl font-black text-white mt-0.5">140+ Bhopal Pros</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-850 text-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jobs Dispatched</p>
            <p className="text-xl font-black text-white mt-0.5">1,489 completed</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-850 text-center shadow-md">
            <Clock3 className="w-5 h-5 text-sky-400 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Dispatch</p>
            <p className="text-xl font-black text-white mt-0.5">8.4 Min Arrival</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-850 text-center shadow-md">
            <DollarSign className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earnings Disbursed</p>
            <p className="text-xl font-black text-white mt-0.5">₹4.8 Lakhs Paid</p>
          </div>
        </div>
      </div>

      {/* DYNAMIC CALENDAR SLIDER (LAST 15 DAYS) */}
      <div className="bg-slate-900/40 border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Pick a completed date
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border transition ${
                selectedDay === null 
                  ? "bg-amber-400 text-slate-950 border-amber-400"
                  : "bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-850"
              }`}
            >
              📅 Show All 15 Days
            </button>
          </div>

          {/* Calendar Day Track */}
          <div className="flex space-x-2.5 overflow-x-auto pb-3 snap-x scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {past15Days.map((day) => (
              <button
                key={day.daysAgo}
                onClick={() => setSelectedDay(day.daysAgo)}
                className={`flex-shrink-0 snap-start w-[70px] py-3 rounded-2xl border flex flex-col items-center transition-all ${
                  selectedDay === day.daysAgo
                    ? "bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105"
                    : "bg-slate-900/80 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-wider opacity-80">{day.dayName}</span>
                <span className="text-2xl font-black mt-0.5 leading-none">{day.dayNum}</span>
                <span className="text-[8px] font-bold mt-1 opacity-70">{day.monthStr}</span>
                {day.jobCount > 0 && (
                  <span className={`text-[8px] font-black mt-2 px-1.5 py-0.5 rounded-full ${
                    selectedDay === day.daysAgo 
                      ? "bg-slate-950/20 text-slate-950" 
                      : "bg-amber-400/20 text-amber-400"
                  }`}>
                    {day.jobCount} Job{day.jobCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH WIDGET */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 p-4 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative flex items-center md:col-span-2">
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by client, task desc, worker name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* Area select */}
          <div className="relative">
            <select
              value={selectedColony}
              onChange={(e) => setSelectedColony(e.target.value)}
              title="Select Bhopal Area"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-400"
            >
              {BHOPAL_COLONIES.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Category select */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              title="Select Service Category"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-400"
            >
              {FILTER_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>

        {/* ACTIVE FILTER DISPLAY */}
        <div className="flex items-center gap-2 mt-4 text-slate-400 text-xs flex-wrap font-medium">
          <span>Active filter:</span>
          <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
            📅 {selectedDay === null ? "All 15 Days" : `May ${21 - selectedDay}, 2026`}
          </span>
          <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
            📍 {selectedColony}
          </span>
          <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
            🛠️ {selectedCategory}
          </span>
          {searchQuery && (
            <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
              🔍 "{searchQuery}"
            </span>
          )}
          <span className="ml-auto text-amber-400 font-black">
            Found {filteredJobs.length} Completed Job{filteredJobs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* COMPLETED JOBS TIMELINE CARD LIST */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full flex-1">
        {filteredJobs.length === 0 ? (
          <div className="bg-slate-900/40 rounded-3xl border border-slate-850 p-16 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-bold">No completed jobs found matching this specific filter.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting dates or selection options to search again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const JobIcon = job.icon;
              return (
                <div 
                  key={job.id} 
                  className="bg-slate-900/75 backdrop-blur-md rounded-[1.8rem] border border-slate-800 hover:border-amber-400/40 p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(248,203,70,0.1)] transition-all duration-500 transform hover:-translate-y-2 group relative overflow-hidden"
                >
                  {/* Glass style top color bar */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${job.color}`} />

                  {/* Header info */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{job.id}</span>
                      <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full anim-pulse-medium"></span> {job.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center shrink-0`}>
                        <JobIcon className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white tracking-tight">{job.category} completed</h4>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500" /> {job.location} • {job.dateStr}
                        </p>
                      </div>
                    </div>

                    {/* Task Description */}
                    <p className="text-slate-300 text-xs mt-4 leading-relaxed font-medium">
                      {job.description}
                    </p>
                  </div>

                  {/* Footer - Worker Profile & Financial Ledger */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-black text-[10px] text-amber-400 border border-slate-700">
                        {job.workerName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-white leading-none">{job.workerName}</p>
                        <p className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5 mt-0.5">
                          ★ {job.workerRating} <span className="text-[8px] text-slate-500">(Verified Partner)</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Ticket Cost</p>
                      <p className="text-sm font-black text-emerald-400">{job.cost}</p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
