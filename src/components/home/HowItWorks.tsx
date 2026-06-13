import React from "react";
import { Wrench, CheckCircle2, Star } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          How <span className="text-yellow-400">Tekton</span> Works
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-400">
          Three simple steps to get high-quality services at your doorstep in Bhopal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
          <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/[0.03] select-none tracking-tighter">
            01
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Wrench className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Choose a Service</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Select the service you need from our extensive range of options like plumbing, electrical work, and carpentry.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
          <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/[0.03] select-none tracking-tighter">
            02
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Instant Confirmation</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Our advanced matching system connects you with a verified partner in minutes, ensuring speedy arrival.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
          <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/[0.03] select-none tracking-tighter">
            03
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400/10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Job Done</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Our verified partner completes your task cleanly. You pay only after checking the work to your satisfaction.
          </p>
        </div>
      </div>
    </div>
  );
}
