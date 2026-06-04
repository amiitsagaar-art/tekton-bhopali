const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Add state variables (Excluding registerPassword, loginEmailInput, loginPasswordInput which are already there)
const stateVars = `
  const [appPin, setAppPin] = useState("");
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [isForgotPinOpen, setIsForgotPinOpen] = useState(false);
  const [forgotPinOtpSent, setForgotPinOtpSent] = useState(false);
  const [forgotPinOtpCode, setForgotPinOtpCode] = useState("");
  const [forgotPinUserInput, setForgotPinUserInput] = useState("");
`;

if (!c.includes('const [appPin, setAppPin]')) {
  c = c.replace('const [isLoggedIn, setIsLoggedIn] = useState(false);', 'const [isLoggedIn, setIsLoggedIn] = useState(false);' + stateVars);
}

// 2. Add useEffect logic
const useEffectLogic = `
    const storedPin = localStorage.getItem("tektonAppPin");
    if (storedPin) {
      setAppPin(storedPin);
      setIsAppLocked(true);
    }
`;

if (!c.includes('const storedPin = localStorage.getItem("tektonAppPin");')) {
  c = c.replace('localStorage.getItem("tektonUserPhone");', 'localStorage.getItem("tektonUserPhone");' + useEffectLogic);
}

// 3. Inject Modals
const modals = `
      {/* 4-DIGIT PIN LOCK SCREEN */}
      {isAppLocked && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-slate-950 text-white">
          <ShieldCheck className="w-16 h-16 text-amber-500 mb-6" />
          <h2 className="text-2xl font-black mb-2">App Locked</h2>
          <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">
            Enter your 4-digit PIN to access Tekton Bhopal.
          </p>
          
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              const val = e.target.value.replace(/\\D/g, "");
              setPinInput(val);
              if (val.length === 4) {
                if (val === appPin) {
                  setIsAppLocked(false);
                  setPinInput("");
                } else {
                  alert("Incorrect PIN");
                  setPinInput("");
                }
              }
            }}
            placeholder="••••"
            className="w-48 bg-slate-900 border border-slate-700 text-center text-3xl font-mono tracking-[1em] rounded-2xl px-4 py-4 focus:outline-none focus:border-amber-500 transition shadow-inner mb-6"
          />

          <button
            onClick={() => {
              setIsForgotPinOpen(true);
              setForgotPinOtpSent(false);
              setForgotPinUserInput("");
            }}
            className="text-amber-500 hover:text-amber-400 font-bold text-sm underline-offset-4 hover:underline"
          >
            Forgot PIN?
          </button>
        </div>
      )}

      {/* SET NEW PIN MODAL */}
      {isSettingPin && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setIsSettingPin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-900 mb-2">Set 4-Digit PIN</h2>
            <p className="text-slate-500 text-xs mb-6">Create a secure PIN for quick access.</p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Enter 4 digits"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\\D/g, ""))}
                  className="w-full bg-slate-50 border border-slate-300 text-center text-xl font-mono tracking-widest rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>
              <div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Confirm 4 digits"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\\D/g, ""))}
                  className="w-full bg-slate-50 border border-slate-300 text-center text-xl font-mono tracking-widest rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              <button
                onClick={() => {
                  if (newPinInput.length !== 4) { alert("PIN must be 4 digits"); return; }
                  if (newPinInput !== confirmPinInput) { alert("PINs do not match"); return; }
                  localStorage.setItem("tektonAppPin", newPinInput);
                  setAppPin(newPinInput);
                  setIsSettingPin(false);
                  setNewPinInput("");
                  setConfirmPinInput("");
                  alert("PIN successfully set!");
                }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black py-3 rounded-xl shadow-md transition"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PIN MODAL */}
      {isForgotPinOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setIsForgotPinOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-black text-white mb-2">Reset PIN</h2>
            
            {!forgotPinOtpSent ? (
              <>
                <p className="text-slate-400 text-xs mb-6">
                  We will send a 6-digit OTP to your registered email to verify your identity.
                </p>
                <button
                  onClick={() => {
                    // Generate Mock OTP
                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                    setForgotPinOtpCode(otp);
                    console.log("[MOCK EMAIL] Sent Forgot PIN OTP to user's email: ", otp);
                    setForgotPinOtpSent(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition"
                >
                  Send OTP to Email
                </button>
              </>
            ) : (
              <>
                <p className="text-amber-400 text-xs mb-6 font-bold">
                  OTP sent to your email! (Check console for mock OTP)
                </p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={forgotPinUserInput}
                  onChange={(e) => setForgotPinUserInput(e.target.value.replace(/\\D/g, ""))}
                  className="w-full bg-slate-950 border border-slate-700 text-center text-2xl font-mono tracking-[0.5em] rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-white mb-4"
                />
                <button
                  onClick={() => {
                    if (forgotPinUserInput === forgotPinOtpCode) {
                      // Bypass lock and reset
                      setIsForgotPinOpen(false);
                      setIsAppLocked(false);
                      setAppPin("");
                      localStorage.removeItem("tektonAppPin");
                      setIsSettingPin(true);
                    } else {
                      alert("Invalid OTP code!");
                    }
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 rounded-xl shadow-md transition"
                >
                  Verify & Reset PIN
                </button>
              </>
            )}
          </div>
        </div>
      )}
`;

if (!c.includes('{/* 4-DIGIT PIN LOCK SCREEN */}')) {
  c = c.replace('{/* EDIT PROFILE MODAL */}', modals + '\\n      {/* EDIT PROFILE MODAL */}');
}

// 4. Trigger isSettingPin(true) after successful login/registration if no pin exists.
// We'll append it to setIsLoggedIn(true) calls where it happens in handleFirebaseLogin/Register
c = c.replace(/setIsLoggedIn\\(true\\);/g, 'setIsLoggedIn(true); if(!localStorage.getItem("tektonAppPin")) setIsSettingPin(true);');

fs.writeFileSync(file, c);
console.log("PIN Modals and State added successfully!");
