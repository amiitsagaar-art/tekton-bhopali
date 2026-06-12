"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, CheckCircle2, Send, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/config/site";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", contact: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError("Please enter your name."); return; }
    if (!formData.contact.trim()) { setError("Please enter your email or phone."); return; }
    if (!formData.message.trim()) { setError("Please enter your message."); return; }

    setLoading(true);
    setError("");
    // Simulate API call / send to contact form API
    await new Promise((res) => setTimeout(res, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      <Header />

      {/* HERO */}
      <div className="bg-slate-900/50 py-16 px-4 text-center border-b border-white/5">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Contact <span className="text-amber-400">Us</span>
        </h1>
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
            
            <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`} className="flex items-start space-x-4 bg-slate-900 p-5 rounded-2xl border border-white/5 shadow-lg hover:border-amber-500/30 transition-colors group">
              <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Phone Support</h4>
                <p className="text-sm text-slate-400 mb-1">Available 8 AM to 10 PM</p>
                <span className="text-lg font-black text-amber-400 hover:underline">{SITE_CONFIG.phone}</span>
              </div>
            </a>

            <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-start space-x-4 bg-slate-900 p-5 rounded-2xl border border-white/5 shadow-lg hover:border-blue-500/30 transition-colors group">
              <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400 group-hover:bg-blue-400 group-hover:text-slate-950 transition-colors">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Email Us</h4>
                <p className="text-sm text-slate-400 mb-1">We typically reply within 2 hours</p>
                <span className="text-lg font-black text-blue-400 hover:underline">{SITE_CONFIG.email}</span>
              </div>
            </a>

            <div className="flex items-start space-x-4 bg-slate-900 p-5 rounded-2xl border border-white/5 shadow-lg">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Head Office</h4>
                <p className="text-sm text-slate-400 mb-1">Central Dispatch Zone</p>
                <p className="text-base font-bold text-slate-300">{SITE_CONFIG.address}</p>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 shadow-lg">
              <h4 className="font-bold text-white mb-3">Working Hours</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monday – Saturday</span>
                  <span className="text-white font-bold">8:00 AM – 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sunday</span>
                  <span className="text-white font-bold">9:00 AM – 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Services</span>
                  <span className="text-emerald-400 font-bold">24/7 Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-white/5 shadow-xl">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white">Message Sent!</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Thank you for contacting Tekton Bhopal. Our team will get back to you within 2 hours.
                </p>
                <div className="bg-slate-800 rounded-xl p-4 text-xs text-slate-400 text-left space-y-1 w-full max-w-xs">
                  <p><span className="text-slate-300 font-bold">Name:</span> {formData.name}</p>
                  <p><span className="text-slate-300 font-bold">Contact:</span> {formData.contact}</p>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", contact: "", message: "" }); }}
                  className="text-amber-400 text-sm font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6 text-white">Send a Message</h3>
                {error && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    {error}
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Email or Phone *</label>
                    <input
                      type="text"
                      placeholder="hello@example.com or 9876543210"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Message *</label>
                    <textarea
                      rows={4}
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F8CB46] hover:bg-amber-400 text-slate-900 font-black text-sm uppercase tracking-wider py-3.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
