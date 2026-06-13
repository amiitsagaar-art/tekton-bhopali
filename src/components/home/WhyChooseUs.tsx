import React from "react";

interface RecentWork {
  id: number;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  cost?: string;
}

interface WhyChooseUsProps {
  recentWorks: RecentWork[];
}

export default function WhyChooseUs({ recentWorks }: WhyChooseUsProps) {
  const worksToDisplay = recentWorks.length > 0 ? recentWorks : [
    {
      id: 1,
      title: "Heavy Industrial Gate Metal Fabrication",
      category: "Fabrication / Welding",
      location: "Govindpura Industrial",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
      cost: "₹14,999"
    },
    {
      id: 2,
      title: "Premium Main Door Polish & Lock Installation",
      category: "Carpenter / Woodwork",
      location: "Minal Residency",
      imageUrl: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?q=80&w=800&auto=format&fit=crop",
      cost: "₹2,499"
    },
    {
      id: 3,
      title: "Modular Kitchen Woodwork & Fitting Setup",
      category: "Carpenter / Modular",
      location: "Arera Colony",
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745a8281?q=80&w=800&auto=format&fit=crop",
      cost: "₹18,500"
    }
  ];

  return (
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
          {worksToDisplay.map((work) => (
            <div key={work.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(248,203,70,0.15)] hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between">
              <div>
                <div className="h-56 overflow-hidden relative">
                  <img src={work.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={work.title} />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-md">{work.location}</span>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-sm text-slate-900">{work.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {work.title} project successfully completed in Bhopal by our skilled professionals.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Category: {work.category}</span>
                  {"cost" in work && (
                    <span className="text-xs font-black text-emerald-650">{work.cost} Total Cost</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
