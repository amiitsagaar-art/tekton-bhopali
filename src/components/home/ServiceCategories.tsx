import React from "react";
import { useLanguage } from "../../context/LanguageContext";

interface Category {
  name: string;
  icon: any; // Lucide icon
  color: string;
  desc: string;
}

interface ServiceCategoriesProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  triggerBooking: (worker: any, categoryName?: string) => void;
}

export default function ServiceCategories({
  categories,
  selectedCategory,
  setSelectedCategory,
  triggerBooking
}: ServiceCategoriesProps) {
  const { t } = useLanguage();
  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-450 mb-4">
        {t("categories.title")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => {
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
                  {t(`categories.${cat.name.toLowerCase().replace(' & ', '').replace(' / ', '').replace(' ', '')}`)}
                </span>
                <span className="block text-[10px] text-slate-400 leading-tight truncate">
                  {t(`categories.${cat.name.toLowerCase().replace(' & ', '').replace(' / ', '').replace(' ', '')}.desc`)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
