import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      
      <Header />

      {/* HERO */}
      <div className="bg-slate-900/50 py-16 px-4 text-center border-b border-white/5">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Contact <span className="text-amber-400">Us</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Need help? Reach out to our Bhopal dispatch center directly.
        </p>
      </div>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full flex-1 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Contact Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black mb-6 text-white">Get in Touch</h2>
            
            <div className="flex items-start space-x-4 bg-slate-900 p-5 rounded-2xl border border-white/5 shadow-lg">
              <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Phone Support</h4>
                <p className="text-sm text-slate-400 mb-1">Available 8 AM to 10 PM</p>
                <a href="tel:+919876543210" className="text-lg font-black text-amber-400 hover:underline">+91 98765 43210</a>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-slate-900 p-5 rounded-2xl border border-white/5 shadow-lg">
              <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Email Us</h4>
                <p className="text-sm text-slate-400 mb-1">We typically reply within 2 hours</p>
                <a href="mailto:support@tekton.in" className="text-lg font-black text-blue-400 hover:underline">support@tekton.in</a>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-slate-900 p-5 rounded-2xl border border-white/5 shadow-lg">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Head Office</h4>
                <p className="text-sm text-slate-400 mb-1">Central Dispatch Zone</p>
                <p className="text-base font-bold text-slate-300">MP Nagar Zone 1, Bhopal, MP 462011</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-white">Send a Message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
                <input type="text" placeholder="Rahul Sharma" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email or Phone</label>
                <input type="text" placeholder="hello@example.com" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Message</label>
                <textarea rows={4} placeholder="How can we help you?" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"></textarea>
              </div>
              <button type="button" className="w-full bg-[#F8CB46] hover:bg-amber-400 text-slate-900 font-black text-sm uppercase tracking-wider py-3.5 rounded-xl transition shadow-md">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
