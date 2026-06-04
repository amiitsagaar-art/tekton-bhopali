const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
if (!content.includes('const [reviewingAppId, setReviewingAppId]')) {
    content = content.replace(/const \[appointments, setAppointments\] = useState<Appointment\[\]>\(\[\]\);/, `$&
  const [reviewingAppId, setReviewingAppId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);`);
}

// 2. Add functions
if (!content.includes('const submitReview = async')) {
    content = content.replace(/const fetchAppointments = async/, `const submitReview = async (appId: number, workerId: number) => {
    if (!reviewRating) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appId, workerId, rating: reviewRating, comment: reviewComment })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("🌟 Review submitted successfully!");
        setReviewingAppId(null);
        setReviewRating(5);
        setReviewComment("");
        fetchAppointments();
      } else {
        showToast("⚠️ " + (data.error || "Failed to submit review"));
      }
    } catch (e) {
      showToast("⚠️ Error submitting review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelBooking = async (appId: number) => {
    try {
      const res = await fetch(\`/api/bookings/\${appId}/cancel\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationReason: "User cancelled from app" })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("❌ " + data.message);
        fetchAppointments();
      } else {
        showToast("⚠️ " + (data.error || "Failed to cancel"));
      }
    } catch (e) {
      showToast("⚠️ Error cancelling booking");
    }
  };

  const fetchAppointments = async`);
}

// 3. Find the exact string to replace
const originalString = `{/* Action Buttons & Status Messages */}
                      <div className="px-4 pb-4 flex items-center justify-between gap-3 flex-wrap border-t border-white/5 pt-3">
                        {/* Status Message (visible to customer only) */}
                        {!isAdmin && (
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            {app.status === "Pending" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping shrink-0" />
                                <span>⏳ Waiting for dispatch confirmation...</span>
                              </>
                            )}
                            {app.status === "Confirmed" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                                <span>📅 Confirmed! Artisan will start shortly.</span>
                              </>
                            )}
                            {app.status === "OnTheWay" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping shrink-0" />
                                <span className="text-blue-400 font-extrabold">🛵 Artisan is on the way!</span>
                              </>
                            )}
                            {app.status === "Completed" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="text-emerald-400">✨ Service completed successfully.</span>
                              </>
                            )}
                          </span>
                        )}

                        <div className="flex gap-2 flex-wrap items-center ml-auto">
                          {/* Admin Only Actions */}
                          {isAdmin && (
                            <>
                              {app.status !== "Confirmed" && app.status !== "Completed" && app.status !== "Cancelled" && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, "Confirmed")}
                                  className="text-[11px] bg-yellow-400/10 border border-yellow-400/20 hover:bg-yellow-400/20 font-bold px-3 py-1.5 rounded-lg text-yellow-400 transition"
                                >
                                  ✓ Confirm
                                </button>
                              )}
                              {app.status === "Confirmed" && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, "OnTheWay")}
                                  className="text-[11px] bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 font-bold px-3 py-1.5 rounded-lg text-blue-400 transition"
                                >
                                  🛵 On The Way
                                </button>
                              )}
                              {app.status !== "Completed" && app.status !== "Cancelled" && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, "Completed")}
                                  className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold px-3 py-1.5 rounded-lg text-emerald-400 transition"
                                >
                                  🎉 Done
                                </button>
                              )}
                            </>
                          )}

                          {/* Customer & Admin Cancel Action */}
                          {app.status !== "Cancelled" && app.status !== "Completed" && (
                            <button
                              disabled={app.status === "OnTheWay"}
                              onClick={() => updateAppointmentStatus(app.id, "Cancelled")}
                              className={\`text-[11px] font-bold px-3 py-1.5 rounded-lg transition border \${
                                app.status === "OnTheWay"
                                  ? "bg-slate-800 border-white/5 text-slate-500 cursor-not-allowed opacity-50"
                                  : "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400"
                              }\`}
                              title={app.status === "OnTheWay" ? "Cannot cancel once helper is dispatched" : "Cancel Booking"}
                            >
                              {app.status === "OnTheWay" ? "✕ Cancel Disabled" : "✕ Cancel Booking"}
                            </button>
                          )}
                        </div>
                      </div>`;

const newString = `{/* Dynamic Actions based on Status */}
                      <div className="p-4 bg-slate-900 border-t border-white/5 space-y-3">
                        
                        {/* Status Message (visible to customer only) */}
                        {!isAdmin && (
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                            {app.status === "Pending" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping shrink-0" />
                                <span>⏳ Waiting for dispatch confirmation...</span>
                              </>
                            )}
                            {app.status === "Confirmed" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                                <span>📅 Confirmed! Artisan will start shortly.</span>
                              </>
                            )}
                            {app.status === "OnTheWay" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping shrink-0" />
                                <span className="text-blue-400 font-extrabold">🛵 Artisan is on the way!</span>
                              </>
                            )}
                            {app.status === "Completed" && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="text-emerald-400">✨ Service completed successfully.</span>
                              </>
                            )}
                          </span>
                        )}

                        {/* 5-Min Cancel Refund Warning UI */}
                        {app.status === "Pending" && (
                          <div className="space-y-2 mt-2">
                            {(() => {
                              const createdTime = new Date(app.createdAt || Date.now()).getTime();
                              const now = new Date().getTime();
                              const diffMins = (now - createdTime) / 60000;
                              const isUnder5Mins = diffMins <= 5;
                              
                              return (
                                <>
                                  <div className={\`p-2.5 rounded-xl border flex items-start gap-2 text-xs \${isUnder5Mins ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}\`}>
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    {isUnder5Mins ? 
                                      <p><b>Full Refund Available:</b> You can cancel within the next {Math.max(0, Math.ceil(5 - diffMins))} minutes for a 100% refund.</p> :
                                      <p><b>Warning:</b> 5 minutes have passed. Cancellation now will incur a penalty.</p>
                                    }
                                  </div>
                                  <button
                                    onClick={() => handleCancelBooking(app.id)}
                                    className={\`w-full font-bold text-xs px-4 py-2.5 rounded-xl transition \${isUnder5Mins ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30" : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"}\`}
                                  >
                                    {isUnder5Mins ? "Cancel with Full Refund" : "Cancel Booking"}
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {/* Rate & Review Component */}
                        {app.status === "Completed" && assignedWorker && (
                          <div className="mt-2">
                            {reviewingAppId === app.id ? (
                              <div className="bg-slate-950 p-3 rounded-xl border border-white/10 space-y-3">
                                <h4 className="text-xs font-bold text-slate-300">Rate your experience with {assignedWorker.name}</h4>
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map(star => (
                                    <button 
                                      key={star} 
                                      onClick={() => setReviewRating(star)}
                                      className="focus:outline-none"
                                    >
                                      <Star className={\`w-6 h-6 \${star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}\`} />
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  placeholder="Write a review..."
                                  value={reviewComment}
                                  onChange={e => setReviewComment(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:border-yellow-400"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => setReviewingAppId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs">Cancel</button>
                                  <button 
                                    onClick={() => submitReview(app.id, assignedWorker.id)} 
                                    disabled={isSubmittingReview}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold py-2 rounded-lg text-xs"
                                  >
                                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewingAppId(app.id)}
                                className="w-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                              >
                                <Star className="w-4 h-4 fill-blue-400" /> Rate & Review Service
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Call Worker Button */}
                        {(app.status === "Confirmed" || app.status === "OnTheWay") && assignedWorker && (
                          <a
                            href={\`tel:\${assignedWorker.phone}\`}
                            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-xs px-4 py-2.5 rounded-xl transition mt-2"
                          >
                            <Phone className="w-4 h-4" /> Call {assignedWorker.name}
                          </a>
                        )}
                      </div>`;

if (content.includes('/* Action Buttons & Status Messages */')) {
    content = content.replace(originalString, newString);
    fs.writeFileSync(file, content);
    console.log("Patched correctly!");
} else {
    console.log("Could not find the target string.");
}
