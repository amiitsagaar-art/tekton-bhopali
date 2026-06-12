import React from "react";
import Link from "next/link";
import {
  Hammer,
  Sparkles,
  Wrench,
  Zap,
  Paintbrush,
  HardHat,
  Briefcase,
  MapPin,
  ArrowRight,
  Camera,
  Building2,
  Droplets,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CATEGORIES = [
  { name: "Plumber", icon: Wrench, desc: "Fix leaks, pipe blockages, water tank cleaning", price: "Starting ₹199" },
  { name: "Carpenter", icon: Hammer, desc: "Furniture repair, lock replacement, custom woodwork", price: "Starting ₹249" },
  { name: "Electrician", icon: Zap, desc: "Wiring fixes, switchboard installation, appliance setup", price: "Starting ₹149" },
  { name: "Painter", icon: Paintbrush, desc: "Wall painting, touch-ups, putty and polishing", price: "Starting ₹499" },
  { name: "Civil Architect", icon: HardHat, desc: "Tile fixing, minor masonry, wall plastering", price: "Starting ₹599" },
  { name: "Civil Construction", icon: Building2, desc: "Bricklaying, wall construction, concrete mixing, and renovations", price: "Starting ₹799" },
  { name: "Cleaning Service", icon: Sparkles, desc: "Deep cleaning for bathrooms, kitchens, full house", price: "Starting ₹999" },
  { name: "Tank Cleaning", icon: Droplets, desc: "Water tank cleaning, disinfection, and vacuuming", price: "Starting ₹499" },
  { name: "Interior Design", icon: LayoutDashboard, desc: "Modular kitchen, false ceiling, complete room makeover", price: "Starting ₹2499" },
  { name: "Exterior Design", icon: Building2, desc: "Facade elevation, wall cladding, garden landscaping", price: "Starting ₹2999" },
  { name: "AC & Appliances", icon: Briefcase, desc: "AC servicing, gas filling, washing machine repair", price: "Starting ₹349" },
  { name: "Washing Machine & Fridge", icon: Wrench, desc: "Servicing and repair for all top brands", price: "Visit Charge ₹99" },
  { name: "CCTV Cameras", icon: Camera, desc: "Installation, repairs, and full security setup", price: "Starting ₹499" },
  { name: "Pest Control", icon: ShieldCheck, desc: "Cockroach control, termite treatment, bed bug removal", price: "Starting ₹599" },
  { name: "Car Wash", icon: Droplets, desc: "Doorstep Complete Car Wash & Vacuuming", price: "Starting ₹149" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      
      <Header />

      {/* HERO */}
      <div className="bg-slate-900/50 py-16 px-4 text-center border-b border-white/5">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Our <span className="text-amber-400">Services</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Professional, verified, and 10-minute instant dispatch for all your household manual labor needs across Bhopal.
        </p>
      </div>

      {/* SERVICES GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full flex-1 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={i} className="bg-slate-900 rounded-3xl border border-white/5 p-6 shadow-lg hover:shadow-xl hover:border-amber-500/30 transition-all group hover:-translate-y-1">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-400 transition-colors">
                  <Icon className="w-7 h-7 text-amber-400 group-hover:text-slate-950" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-2">{cat.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-black text-amber-400 text-lg">{cat.price}</span>
                  <Link href={`/?service=${encodeURIComponent(cat.name)}`} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-colors text-slate-300">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
