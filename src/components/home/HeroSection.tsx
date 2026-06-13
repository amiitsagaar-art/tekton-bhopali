import React from "react";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Users, Clock3, Award } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface HeroSectionProps {
  activeImage: number;
  triggerBooking: (worker: any, categoryName?: string) => void;
}

const heroImages = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop"
];

export default function HeroSection({ activeImage, triggerBooking }: HeroSectionProps) {
  const { t } = useLanguage();
  return (
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
              {t("hero.tagline")}
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full">
              {t("hero.price")}
            </span>
            <span className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full hidden sm:inline-block">
              {t("hero.speed")}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
            {t("hero.title1")} <br />
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>{" "}
            {t("hero.title3")}
          </h1>
          
          <p className="text-base sm:text-lg text-slate-350 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={() => triggerBooking(null)}
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-base font-black px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-1 hover:scale-105"
            >
              <span>{t("hero.bookNow")}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <Link
              href="/join-as-partner"
              className="w-full sm:w-auto border border-white/20 hover:border-yellow-500/50 hover:bg-white/5 text-white hover:text-yellow-400 text-base font-bold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-1 hover:scale-105"
            >
              <span>{t("hero.joinPartner")}</span>
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
              <span className="text-xs text-slate-400 font-medium">{t("hero.trusted")}</span>
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
  );
}
