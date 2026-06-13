"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.admin": "Admin",
    "nav.partner": "Become a Partner",
    "nav.login": "Login / Register",
    "nav.profile": "Profile",
    "hero.tagline": "Bhopal Exclusive",
    "hero.price": "🏷️ Services Start @ ₹49",
    "hero.speed": "⚡ 10-Min Arrival Active",
    "hero.title1": "Bhopal's Premium",
    "hero.title2": "Skilled Worker",
    "hero.title3": "Marketplace.",
    "hero.subtitle": "Get verified Plumbers, Electricians, Carpenters, and General Helpers at your doorstep in minutes.",
    "hero.bookNow": "Book a Service",
    "hero.joinPartner": "Join as Partner",
    "hero.trusted": "Trusted in Bhopal",
    "stats.pros": "Active Pros Online",
    "stats.response": "Avg. Response Time",
    "stats.rating": "Customer Rating",
    "categories.title": "Select Task Category",
    "categories.plumber": "Plumber",
    "categories.plumber.desc": "Pipes & Leaks",
    "categories.electrician": "Electrician",
    "categories.electrician.desc": "Wiring & Fans",
    "categories.carpenter": "Carpenter",
    "categories.carpenter.desc": "Wood & Locks",
    "categories.painter": "Painter",
    "categories.painter.desc": "Walls & Polish",
    "categories.tankcleaning": "Tank Cleaning",
    "categories.tankcleaning.desc": "Water Tanks",
    "categories.generalhelper": "General Helper",
    "categories.generalhelper.desc": "Lifting & Moving",
    "categories.acappliances": "AC & Appliances",
    "categories.acappliances.desc": "Service & Repair",
    "categories.cctvcameras": "CCTV Cameras",
    "categories.cctvcameras.desc": "Install & Repair",
    "how.title": "How",
    "how.title2": "Works",
    "how.subtitle": "Three simple steps to get high-quality services at your doorstep in Bhopal.",
    "how.step1.title": "Choose a Service",
    "how.step1.desc": "Select the service you need from our extensive range of options like plumbing, electrical work, and carpentry.",
    "how.step2.title": "Instant Confirmation",
    "how.step2.desc": "Our advanced matching system connects you with a verified partner in minutes, ensuring speedy arrival.",
    "how.step3.title": "Job Done",
    "how.step3.desc": "Our verified partner completes your task cleanly. You pay only after checking the work to your satisfaction.",
    "booking.title": "Book Your Service",
    "booking.step1": "Select Service & Location",
    "booking.step2": "Date & Time",
    "booking.step3": "Confirm Details",
    "booking.jugaad.title": "Jugaad Scanner / AI Diagnostics",
    "booking.jugaad.desc": "Upload a photo of the broken item, and our AI will estimate the cost and service automatically.",
    "booking.jugaad.button": "Upload Photo",
    "booking.jugaad.scanning": "Scanning image...",
    "booking.jugaad.result": "AI Suggestion: ",
  },
  hi: {
    "nav.home": "होम",
    "nav.services": "सेवाएँ",
    "nav.about": "हमारे बारे में",
    "nav.contact": "संपर्क करें",
    "nav.admin": "एडमिन",
    "nav.partner": "पार्टनर बनें",
    "nav.login": "लॉगिन / रजिस्टर",
    "nav.profile": "प्रोफ़ाइल",
    "hero.tagline": "भोपाल एक्सक्लूसिव",
    "hero.price": "🏷️ सेवाएँ ₹49 से शुरू",
    "hero.speed": "⚡ 10-मिनट में आगमन",
    "hero.title1": "भोपाल का प्रीमियम",
    "hero.title2": "कुशल कारीगर",
    "hero.title3": "मार्केटप्लेस.",
    "hero.subtitle": "वेरिफाइड प्लंबर, इलेक्ट्रीशियन, बढ़ई, और हेल्पर्स को कुछ ही मिनटों में अपने घर पर बुलाएँ।",
    "hero.bookNow": "अभी बुक करें",
    "hero.joinPartner": "पार्टनर के रूप में जुड़ें",
    "hero.trusted": "भोपाल में विश्वसनीय",
    "stats.pros": "ऑनलाइन कारीगर",
    "stats.response": "औसत रिस्पांस टाइम",
    "stats.rating": "ग्राहक रेटिंग",
    "categories.title": "सेवा का चयन करें",
    "categories.plumber": "प्लंबर",
    "categories.plumber.desc": "पाइप और लीक",
    "categories.electrician": "इलेक्ट्रीशियन",
    "categories.electrician.desc": "वायरिंग और पंखे",
    "categories.carpenter": "बढ़ई",
    "categories.carpenter.desc": "लकड़ी और ताले",
    "categories.painter": "पेंटर",
    "categories.painter.desc": "दीवारें और पॉलिश",
    "categories.tankcleaning": "टैंक सफाई",
    "categories.tankcleaning.desc": "पानी की टंकी",
    "categories.generalhelper": "जनरल हेल्पर",
    "categories.generalhelper.desc": "सामान उठाना / शिफ्टिंग",
    "categories.acappliances": "एसी और अप्लायंसेज",
    "categories.acappliances.desc": "सर्विस और रिपेयर",
    "categories.cctvcameras": "सीसीटीवी कैमरे",
    "categories.cctvcameras.desc": "इंस्टॉल और रिपेयर",
    "how.title": "टेक्टॉन कैसे",
    "how.title2": "काम करता है",
    "how.subtitle": "भोपाल में घर पर उच्च गुणवत्ता वाली सेवाएँ पाने के लिए 3 आसान कदम।",
    "how.step1.title": "सेवा चुनें",
    "how.step1.desc": "प्लंबिंग, इलेक्ट्रिकल काम, और बढ़ई जैसी हमारी विस्तृत सेवाओं में से अपनी जरूरत की सेवा चुनें।",
    "how.step2.title": "तुरंत कन्फर्मेशन",
    "how.step2.desc": "हमारा सिस्टम आपको मिनटों में एक वेरिफाइड पार्टनर से जोड़ता है, जिससे त्वरित आगमन सुनिश्चित होता है।",
    "how.step3.title": "काम पूरा",
    "how.step3.desc": "हमारे पार्टनर आपका काम सफाई से पूरा करते हैं। आप काम जांचने के बाद ही पैसे देते हैं।",
    "booking.title": "अपनी सेवा बुक करें",
    "booking.step1": "सेवा और स्थान चुनें",
    "booking.step2": "तारीख और समय",
    "booking.step3": "विवरण की पुष्टि करें",
    "booking.jugaad.title": "जुगाड़ स्कैनर / AI डायग्नोस्टिक्स",
    "booking.jugaad.desc": "टूटे हुए सामान की फोटो अपलोड करें, और हमारा AI अपने आप लागत और सेवा का अनुमान लगाएगा।",
    "booking.jugaad.button": "फोटो अपलोड करें",
    "booking.jugaad.scanning": "इमेज स्कैन हो रही है...",
    "booking.jugaad.result": "AI सुझाव: ",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("tektonLang") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "hi")) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("tektonLang", newLang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
