import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock, ShieldCheck, Award } from "lucide-react";

const TEAM = [
  { name: "Amit Sagar", role: "Proprietor & Founder", dept: "Leadership", color: "bg-amber-400" },
  { name: "Mosin", role: "Senior Electrician", dept: "Skilled Worker", color: "bg-blue-400" },
  { name: "Anshar", role: "Electrician", dept: "Skilled Worker", color: "bg-emerald-500" },
  { name: "Satendra", role: "Electrician", dept: "Skilled Worker", color: "bg-purple-500" },
  { name: "Rahul", role: "Lead Plumber", dept: "Skilled Worker", color: "bg-yellow-500" },
  { name: "Rohit", role: "Senior Painter", dept: "Skilled Worker", color: "bg-cyan-500" },
  { name: "Toshit Kushwaha", role: "Senior Carpenter", dept: "Skilled Worker", color: "bg-rose-400" },
  { name: "Priya Verma", role: "Quality Inspection Expert", dept: "Quality Control", color: "bg-indigo-500" },
  { name: "Anjali Singh", role: "Quality Auditor", dept: "Quality Control", color: "bg-orange-500" },
  { name: "Deepak Sharma", role: "Quality Inspection", dept: "Quality Control", color: "bg-teal-500" },
  { name: "Neeraj Tiwari", role: "Quality Auditor", dept: "Quality Control", color: "bg-pink-400" },
  { name: "Vikram Rajput", role: "Quality Auditor", dept: "Quality Control", color: "bg-lime-500" },
];

const DEPT_COLORS: Record<string, string> = {
  "Leadership": "bg-amber-950 text-amber-400 border border-amber-900",
  "Skilled Worker": "bg-blue-950 text-blue-400 border border-blue-900",
  "Quality Control": "bg-emerald-950 text-emerald-400 border border-emerald-900",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      <Header />

      {/* HERO */}
      <div className="bg-slate-900/50 py-16 px-4 text-center border-b border-white/5">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">About <span className="text-amber-400">Tekton</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Revolutionizing the blue-collar service industry in Bhopal, Madhya Pradesh.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full flex-1 space-y-16 pb-20">

        {/* MISSION */}
        <section className="bg-slate-900 p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
          <h2 className="text-2xl font-black mb-4 text-white">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            At Tekton Bhopal, we believe finding a reliable plumber, electrician, or carpenter shouldn't take days.
            Inspired by 10-minute delivery apps, we are building a hyper-local network of verified, skilled artisans
            who can reach your doorstep anywhere in Bhopal within minutes.
          </p>
          <p className="text-slate-300 leading-relaxed">
            "Tekton" comes from the ancient Greek word for artisan or builder. We empower local workers with steady income
            while providing residents with unparalleled convenience and trust.
          </p>
        </section>

        {/* PILLARS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 text-center shadow-lg hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Instant Dispatch</h3>
            <p className="text-xs text-slate-400">Like your groceries, our workers arrive in minutes, not days.</p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 text-center shadow-lg hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Verified Pros</h3>
            <p className="text-xs text-slate-400">Background checked and skill-tested artisans only.</p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 text-center shadow-lg hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Transparent Pricing</h3>
            <p className="text-xs text-slate-400">No haggling. Clear upfront base prices starting at ₹49.</p>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Meet Our <span className="text-amber-500">Expert Team</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              The hardworking people behind Tekton Bhopal — from our founders to our skilled workers on the ground.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {TEAM.map((member, idx) => (
              <div
                key={idx}
                className="bg-slate-900 rounded-2xl border border-white/5 p-5 shadow-lg flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Avatar Image using Ui-Avatars as placeholder for professional headshots */}
                <div className="mb-4 relative">
                  <div className={`absolute inset-0 rounded-full ${member.color} opacity-20 group-hover:scale-110 transition-transform blur-sm`}></div>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff&size=128&font-size=0.33`}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover relative z-10 border-2 border-slate-700 shadow-md group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </div>
                
                <h4 className="font-bold text-slate-200 text-sm leading-tight mb-1">{member.name}</h4>
                <p className="text-[11px] text-slate-400 mb-3 leading-tight">{member.role}</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${DEPT_COLORS[member.dept]}`}>
                  {member.dept}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
