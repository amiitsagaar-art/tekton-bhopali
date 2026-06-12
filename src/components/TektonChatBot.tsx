"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, X, Send, Paperclip, AlertTriangle,
  CheckCircle, RotateCcw, Headphones, ChevronDown, Mic
} from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  imageUrl?: string;
  isEmergency?: boolean;
  isConfirmed?: boolean;
  timestamp: Date;
  // Optional intent metadata attached to bot messages
  intent?: {
    type: string;
    service: string;
    zone: string | null;
  };
}

type BookingStep = "idle" | "diagnostic" | "confirm_service" | "date" | "time" | "address" | "done";

const QUICK_REPLIES: Record<BookingStep, string[]> = {
  idle: ["Paani leak ho raha hai 💧", "Bijli ki problem hai ⚡", "AC kharab hai ❄️", "Ghar ki safai chahiye 🧹"],
  diagnostic: [],
  confirm_service: ["Haan, book karo ✅", "Nahi, baad mein"],
  date: ["Aaj 📅", "Kal 📅", "Parso"],
  time: ["Subah 10-12 🌅", "Dopahar 1-4 ☀️", "Shaam 4-7 🌇", "Instant ⚡"],
  address: [],
  done: ["Ek aur service chahiye", "Shukriya 🙏"],
};

export default function TektonChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: `Namaste! 🙏 Main *Tekton Bhopal AI Assistant* hoon.\n\nGhar ki koi bhi samasya batayein — paani, bijli, carpenter, AC, pest control, car wash — ya *photo upload karein*, main turant sahi technician book kar deta hoon!\n\n💰 Visit Charge sirf ₹99`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<BookingStep>("idle");
  const [bookingData, setBookingData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "hi-IN";
        
        rec.onstart = () => {
          setIsListening(true);
        };
        
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => {
              const space = prev && !prev.endsWith(" ") ? " " : "";
              return prev + space + transcript;
            });
          }
        };
        
        rec.onerror = (err: any) => {
          console.error("[Speech Recognition Error]:", err);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice typing is not supported in this browser. Try Google Chrome or Microsoft Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Format bot text: *bold* → <strong>, newlines → <br>
  const formatText = (text: string) => {
    return text
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  // -------------------------------------------------------------------
  //  Parse intent metadata from the AI reply (if present)
  // -------------------------------------------------------------------
  const parseIntentFromReply = (reply: string): { cleanText: string; intent?: Message["intent"] } => {
    const intentRegex = /\[INTENT:\s*([\w-]+)\s*\|\s*SERVICE:\s*([\w\s-]+)\s*\|\s*ZONE:\s*([\w\s-]+)\]$/i;
    const match = reply.match(intentRegex);
    if (!match) return { cleanText: reply };
    const [, type, service, zone] = match;
    const cleanText = reply.replace(intentRegex, "").trimEnd();
    return { cleanText, intent: { type, service: service.trim(), zone: zone.trim() } };
  };

  const addMessage = (role: "user" | "bot", text: string, extras?: Partial<Message>) => {
    const msg: Message = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: new Date(),
      ...extras,
    };
    setMessages(prev => [...prev, msg]);
    if (role === "bot" && !isOpen) setUnreadCount(c => c + 1);
  };

  const handleSend = async (overrideText?: string, imageBase64?: string) => {
    const text = overrideText || input.trim();
    if (!text && !imageBase64) return;

    setInput("");
    setPreviewImage(null);

    // Add user message
    addMessage("user", text || "📷 Photo bheja", { imageUrl: imageBase64 });
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          step,
          bookingData,
          hasImage: !!imageBase64,
          image: imageBase64 || null,
          userProfile: {
            name: typeof window !== "undefined" ? localStorage.getItem("tektonUserName") || "" : "",
            phone: typeof window !== "undefined" ? localStorage.getItem("tektonUserPhone") || "" : "",
            address: typeof window !== "undefined" ? localStorage.getItem("tektonUserAddress") || "" : "",
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        addMessage("bot", errorData.reply ?? "Sorry, something went wrong. Please try again later.");
        return;
      }

      const data = await response.json();

      // Update state
      setStep(data.nextStep || "idle");
      setBookingData(data.bookingData || {});

      const { cleanText, intent: parsedIntent } = parseIntentFromReply(data.reply);
      const finalIntent = data.intent || parsedIntent || null;
      if (finalIntent && finalIntent.zone === "unspecified") {
        finalIntent.zone = null;
      }
      addMessage("bot", cleanText, {
        isEmergency: data.isEmergency,
        isConfirmed: data.isConfirmed,
        ...(finalIntent ? { intent: finalIntent } : {}),
      });

      // Log CRM payload in console for backend integration
      if (data.crmPayload) {
        console.log("[TEKTON CRM] New Booking Payload:", JSON.stringify(data.crmPayload, null, 2));
      }
    } catch {
      addMessage("bot", "Maaf kijiye, network error aa gaya. Kripya dobara try karein. 🙏");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      setPreviewImage(base64);
      handleSend("Photo upload ki — yeh dekho", base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setMessages([{
      id: "welcome-reset",
      role: "bot",
      text: `Nayi baat shuru karte hain! 😊\n\nKya samasya hai aapke ghar mein?`,
      timestamp: new Date(),
    }]);
    setStep("idle");
    setBookingData({});
    setInput("");
  };

  const quickReplies = QUICK_REPLIES[step] || [];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setIsOpen(o => !o); setUnreadCount(0); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #F8CB46, #e0a800)" }}
        aria-label="Open Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-slate-900" />
        ) : (
          <MessageSquare className="w-6 h-6 text-slate-900" />
        )}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          style={{ height: isMinimized ? "60px" : "560px", transition: "height 0.3s ease", background: "#0f172a" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #1a2744, #0f172a)", borderBottom: "1px solid rgba(248,203,70,0.2)" }}
            onClick={() => setIsMinimized(m => !m)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4.5 h-4.5 text-slate-900" />
              </div>
              <div>
                <p className="text-white font-black text-sm leading-none">Tekton AI Assistant</p>
                <p className="text-amber-400 text-[10px] font-semibold mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                  Online • Bhopal Home Services
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); handleReset(); }} title="Reset Chat" className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={e => { e.stopPropagation(); setIsMinimized(m => !m); }} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ background: "#0f172a" }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mr-2 mt-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-900" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-amber-400 text-slate-900 font-semibold rounded-br-sm"
                          : msg.isEmergency
                          ? "bg-red-950/80 border border-red-500/50 text-red-100 rounded-bl-sm"
                          : msg.isConfirmed
                          ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-100 rounded-bl-sm"
                          : "bg-slate-800 text-slate-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.isEmergency && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Emergency Alert</span>
                        </div>
                      )}
                      {msg.isConfirmed && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Booking Confirmed</span>
                        </div>
                      )}
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Uploaded" className="w-full rounded-xl mb-2 max-h-36 object-cover" />
                      )}
                      <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                      
                      {/* Booking intent button */}
                      {msg.intent?.type === "BOOKING" && (
                        <button
                          className="mt-2 w-full px-3.5 py-2.5 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-amber-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                          onClick={() => {
                            if (typeof window !== "undefined" && (window as any).tektonTriggerBooking) {
                              (window as any).tektonTriggerBooking(msg.intent?.service, msg.intent?.zone);
                            } else {
                              console.error("Booking helper not loaded");
                            }
                          }}
                        >
                          Book Verified {msg.intent.service} {msg.intent.zone ? `in ${msg.intent.zone}` : ""} Now
                        </button>
                      )}

                      <p className={`text-[9px] mt-1 ${msg.role === "user" ? "text-amber-800" : "text-slate-500"}`}>
                        {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mr-2 mt-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-900" />
                    </div>
                    <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {quickReplies.length > 0 && !isLoading && (
                <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0" style={{ background: "#0f172a" }}>
                  {quickReplies.map(qr => (
                    <button
                      key={qr}
                      onClick={() => handleSend(qr)}
                      className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border border-amber-400/40 text-amber-400 hover:bg-amber-400 hover:text-slate-900 transition-all whitespace-nowrap"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="px-3 py-3 shrink-0" style={{ background: "#0f172a", borderTop: "1px solid rgba(248,203,70,0.15)" }}>
                <div className="flex items-center gap-2 bg-slate-800 rounded-2xl px-3 py-2">
                  {/* Image Upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                    title="Photo Upload karein"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Mic Button for Speech to Text */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`transition-colors shrink-0 ${
                      isListening ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-amber-400"
                    }`}
                    title={isListening ? "Listening... click to stop" : "Bolkar type karein (Voice typing)"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !isLoading && handleSend()}
                    placeholder={
                      step === "address"
                        ? "Apna address likhein..."
                        : step === "idle"
                        ? "Samasya batayein ya photo bhejein..."
                        : "Jawab likhein..."
                    }
                    className="flex-1 bg-transparent text-slate-100 text-xs placeholder-slate-500 focus:outline-none"
                    disabled={isLoading}
                  />

                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || (!input.trim())}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                    style={{ background: input.trim() ? "linear-gradient(135deg, #F8CB46, #e0a800)" : "transparent" }}
                  >
                    <Send className="w-3.5 h-3.5 text-slate-900" />
                  </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2 px-1">
                  <p className="text-[9px] text-slate-600">📍 Tekton Bhopal • Visit ₹99</p>
                  <button
                    onClick={() => window.open(`tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`)}
                    className="flex items-center gap-1 text-[9px] text-amber-400 hover:text-amber-300 font-bold transition-colors"
                  >
                    <Headphones className="w-3 h-3" />
                    Human Support
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
