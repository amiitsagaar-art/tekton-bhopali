import React from "react";
import { Star, MapPin } from "lucide-react";

interface Review {
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
  date: string;
}

interface TestimonialsProps {
  reviewsList: Review[];
  newFeedbackName: string;
  setNewFeedbackName: (val: string) => void;
  newFeedbackLocation: string;
  setNewFeedbackLocation: (val: string) => void;
  newFeedbackService: string;
  setNewFeedbackService: (val: string) => void;
  newFeedbackRating: number;
  setNewFeedbackRating: (val: number) => void;
  newFeedbackText: string;
  setNewFeedbackText: (val: string) => void;
  handleSubmitFeedback: (e: React.FormEvent) => void;
}

export default function Testimonials({
  reviewsList,
  newFeedbackName, setNewFeedbackName,
  newFeedbackLocation, setNewFeedbackLocation,
  newFeedbackService, setNewFeedbackService,
  newFeedbackRating, setNewFeedbackRating,
  newFeedbackText, setNewFeedbackText,
  handleSubmitFeedback
}: TestimonialsProps) {
  return (
    <div className="bg-white border-t border-slate-200 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Trusted by 10,000+ <span className="text-amber-500">Bhopal Residents</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Real feedback from real people across Bhopal. See what your neighbors are saying about our 10-minute instant response service.
          </p>
        </div>

        <div className="overflow-hidden pb-6 relative w-full group">
          <div className="flex space-x-4 animate-marquee w-max">
            {[...reviewsList, ...reviewsList].map((review, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-[300px] sm:w-[350px] bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-700 text-lg border border-amber-200">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{review.name}</h4>
                      <div className="flex items-center text-[10px] text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 mr-0.5 text-slate-400" /> {review.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-900 leading-relaxed italic font-medium">
                  "{review.text}"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                  {review.service}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {review.date}
                </span>
              </div>
            </div>
          ))}
          </div>
          {/* Gradient overlays for smooth fading edges */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        {/* WRITE A REVIEW FORM */}
        <div className="max-w-xl mx-auto mt-12 p-6 bg-slate-50/80 backdrop-blur-md border border-slate-200 rounded-[2rem] shadow-lg animate-fade-in relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <h3 className="text-base font-black text-slate-900 mb-1 tracking-tight text-center flex items-center justify-center gap-1.5">
            ✍️ Share Your Bhopal Tekton Experience!
          </h3>
          <p className="text-xs text-slate-500 text-center mb-5 font-medium">Your rating helps us reward our partner workers directly.</p>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Saxena"
                  value={newFeedbackName}
                  onChange={(e) => setNewFeedbackName(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Bhopal Colony</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arera Colony"
                  value={newFeedbackLocation}
                  onChange={(e) => setNewFeedbackLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Service Category</label>
                <select
                  value={newFeedbackService}
                  onChange={(e) => setNewFeedbackService(e.target.value)}
                  title="Select service received"
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="Plumber">Plumbing</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Painter">Painter</option>
                  <option value="Tank Cleaning">Tank Cleaning</option>
                  <option value="Interior Design">Interior Design</option>
                  <option value="Exterior Design">Exterior Design</option>
                  <option value="Cleaning Service">Cleaning Service</option>
                  <option value="AC & Appliances">AC & Appliances</option>
                  <option value="CCTV Cameras">CCTV Cameras</option>
                  <option value="General">General/Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Select Rating</label>
                <div className="flex items-center space-x-1.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                      onClick={() => setNewFeedbackRating(star)}
                      className="focus:outline-none transition hover:scale-125"
                    >
                      <Star
                        className={`w-5 h-5 ${ star <= newFeedbackRating ? "fill-amber-400 text-amber-400" : "text-slate-350" } text-slate-900 bg-white placeholder-slate-400`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">Your Experience / Feedback</label>
              <textarea
                required
                rows={2}
                placeholder="Share your experience with Bhopal residents..."
                value={newFeedbackText}
                onChange={(e) => setNewFeedbackText(e.target.value)}
                className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 placeholder-slate-400"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition duration-300 border border-slate-850 hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              Post Review Live 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
