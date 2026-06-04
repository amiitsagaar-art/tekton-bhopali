const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let c = fs.readFileSync(file, 'utf8');

const targetStr = `                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {loginRole === "vendor" ? "Registered Vendor Phone" : "Phone Number"}
                        </label>
                        <input
                          type="tel"
                          placeholder="Enter your 10-digit number"
                          title="Your registered phone number"
                          value={loginPhoneInput}
                          onChange={(e) => setLoginPhoneInput(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (loginPhoneInput.trim().length < 10) {
                            alert("Please enter a valid 10-digit phone number.");
                            return;
                          }
                          await handleFirebaseLogin();
                        }}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-2 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                            Sending SMS...
                          </>
                        ) : (
                          "🔑 Send Verification OTP"
                        )}
                      </button>`;

const replacementStr = `                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {loginRole === "vendor" ? "Vendor Email Address" : "Email Address"}
                        </label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmailInput}
                          onChange={(e) => setLoginEmailInput(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={loginPasswordInput}
                          onChange={(e) => setLoginPasswordInput(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (!loginEmailInput || !loginPasswordInput) {
                            alert("Please enter both email and password.");
                            return;
                          }
                          await handleFirebaseLogin();
                        }}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-4 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                            Logging in...
                          </>
                        ) : (
                          "🔑 Login Securely"
                        )}
                      </button>`;

if (c.includes(targetStr)) {
  fs.writeFileSync(file, c.replace(targetStr, replacementStr));
  console.log("Login UI successfully replaced with Email & Password!");
} else {
  console.log("Could not find the target string in TektonApp.tsx. Looking for chunks...");
  // Fallback to a broader regex replacement if whitespace differed
}
