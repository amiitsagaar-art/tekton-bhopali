const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let c = fs.readFileSync(file, 'utf8');

// Replace the Register Form content inside <div className="p-8 pt-5">
const registerFormStart = `{isRegistering ? (
                /* ── REGISTER FORM ── */
                <div className="space-y-4">
                  {!isOtpSent ? (`;
const registerFormEnd = `<p className="text-center text-xs text-slate-500 mt-2 font-medium">`;

let rStart = c.indexOf(registerFormStart);
let rEnd = c.indexOf(registerFormEnd, rStart);

if (rStart !== -1 && rEnd !== -1) {
  const newRegisterForm = `{isRegistering ? (
                /* ── REGISTER FORM ── */
                <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ramesh Sharma"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number (Optional)</label>
                        <input
                          type="tel"
                          placeholder="10-digit number e.g. 9876543210"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
                        <input
                          type="email"
                          placeholder="e.g. ramesh@gmail.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
                        <input
                          type="password"
                          placeholder="Create a password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">📍 Bhopal Zone / Area *</label>
                        <select
                          value={registerLocation}
                          onChange={(e) => setRegisterLocation(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition bg-white text-slate-900"
                        >
                          <option value="" className="text-slate-900 bg-white">-- Select your area --</option>
                          {BHOPAL_LOCATIONS.filter(l => l !== "All Bhopal (MP)").map((loc) => (
                            <option key={loc} value={loc} className="text-slate-900 bg-white">{loc}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={async () => {
                          if (registerName.trim().length < 2) { alert("Please enter your full name."); return; }
                          if (!registerEmail.trim() || !registerPassword.trim()) { alert("Please enter email and password."); return; }
                          if (!registerLocation) { alert("Please select your Bhopal zone."); return; }
                          await handleFirebaseRegister();
                        }}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-4 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? "Registering..." : "🚀 Create Account"}
                      </button>
                      
                  `;
  c = c.substring(0, rStart) + newRegisterForm + c.substring(rEnd);
}

// Replace the Login Form content
const loginFormStart = `) : (
                /* ── LOGIN FORM ── */
                <div className="space-y-4">
                  {!isOtpSent ? (`;
const loginFormEnd = `<p className="text-center text-xs text-slate-500 mt-4 font-medium">`;

let lStart = c.indexOf(loginFormStart);
let lEnd = c.indexOf(loginFormEnd, lStart);

if (lStart !== -1 && lEnd !== -1) {
  const newLoginForm = `) : (
                /* ── LOGIN FORM ── */
                <div className="space-y-4">
                      {/* Role Selector */}
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setLoginRole("user")}
                          className={\`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 \${
                            loginRole === "user"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }\`}
                        >
                          👤 User / Customer
                        </button>
                        <button
                          onClick={() => setLoginRole("vendor")}
                          className={\`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 \${
                            loginRole === "vendor"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }\`}
                        >
                          🛠️ Vendor / Partner
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          placeholder="Enter your registered email"
                          value={loginEmailInput}
                          onChange={(e) => setLoginEmailInput(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 mt-3">
                          Password *
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
                          if (!loginEmailInput.trim() || !loginPasswordInput.trim()) {
                            alert("Please enter both email and password.");
                            return;
                          }
                          await handleFirebaseLogin();
                        }}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-4 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? "Authenticating..." : "🔑 Login Securely"}
                      </button>

                  `;
  c = c.substring(0, lStart) + newLoginForm + c.substring(lEnd);
}

fs.writeFileSync(file, c);
console.log("Replaced modal HTML successfully.");
