const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  /import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase\/auth";/,
  `import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";`
);

// 2. States
content = content.replace(
  /const \[loginPhoneInput, setLoginPhoneInput\] = useState\(""\);\n  const \[otpCode, setOtpCode\] = useState\(""\);\n  const \[isOtpSent, setIsOtpSent\] = useState\(false\);\n  const \[confirmationResult, setConfirmationResult\] = useState<any>\(null\);/,
  `const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");`
);

// Remove sendFirebaseOtp, verifyFirebaseOtp, setupRecaptcha
// and replace with handleFirebaseLogin, handleFirebaseRegister
const authLogicRegex = /const setupRecaptcha = \(\) => \{[\s\S]*?\} finally \{\n      setAuthLoading\(false\);\n    \}\n  \};/m;

const newAuthLogic = `
  const handleFirebaseRegister = async () => {
    if (registerName.trim().length < 2) { alert("Please enter your full name."); return; }
    if (!registerEmail.trim() || !registerPassword.trim()) { alert("Email and Password are required."); return; }
    if (!registerLocation) { alert("Please select your Bhopal zone."); return; }
    
    setAuthLoading(true);
    try {
      // 1. Check if user already exists in our DB
      const checkRes = await fetch(\`/api/users?email=\${registerEmail.trim()}\`);
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.exists && data.user) {
          alert("⚠️ A user is already registered with this email. Please login instead.");
          setAuthLoading(false);
          return;
        }
      }

      // 2. Create in Firebase
      const cred = await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
      
      // 3. Save to DB
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          phone: registerPhone || "", // optional now
          email: registerEmail.trim(),
          location: registerLocation,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to register profile in database.");
      }

      localStorage.setItem("tektonUserEmail", registerEmail.trim());
      localStorage.setItem("tektonUserName", registerName);
      localStorage.setItem("tektonUserPhone", registerPhone || "");
      localStorage.setItem("tektonUserLocation", registerLocation);
      localStorage.setItem("tektonUserAvatarUrl", "");
      localStorage.setItem("tektonUserAddress", "");

      setUserEmail(registerEmail.trim());
      setUserName(registerName);
      setUserPhone(registerPhone || "");
      setSelectedLocation(registerLocation);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setIsRegistering(false);
      showToast(\`✅ Welcome \${registerName}! Account created successfully.\`);

    } catch (err: any) {
      console.error("Firebase Registration Error:", err);
      alert(\`Firebase error: \${err.message || "Failed to register. Please try again."}\`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFirebaseLogin = async () => {
    if (!loginEmailInput.trim() || !loginPasswordInput.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    setAuthLoading(true);
    try {
      // 1. Login with Firebase
      await signInWithEmailAndPassword(auth, loginEmailInput.trim(), loginPasswordInput);

      if (loginRole === "vendor") {
        // Vendors might not have emails in DB yet in old schema, but we'll let them login
        localStorage.setItem("tektonWorkerEmail", loginEmailInput.trim());
        showToast("🔑 Logged in successfully! Accessing Partner Dashboard...");
        setShowLoginModal(false);
        setTimeout(() => {
          window.location.href = "/partner";
        }, 1000);
      } else {
        // 2. Check user DB
        const checkRes = await fetch(\`/api/users?email=\${loginEmailInput.trim()}\`);
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.exists && data.user) {
            localStorage.setItem("tektonUserEmail", data.user.email);
            localStorage.setItem("tektonUserName", data.user.name || "");
            localStorage.setItem("tektonUserPhone", data.user.phone || "");
            localStorage.setItem("tektonUserLocation", data.user.location || "");
            
            setUserEmail(data.user.email);
            setUserName(data.user.name || "");
            setUserPhone(data.user.phone || "");
            setSelectedLocation(data.user.location || "All Bhopal (MP)");
            setIsLoggedIn(true);
            setShowLoginModal(false);
            showToast(\`🚪 Welcome back, \${data.user.name}!\`);
          } else {
             alert("⚠️ Your account details are missing from our database. Please contact support.");
          }
        }
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      alert(\`Firebase error: \${err.message || "Invalid credentials."}\`);
    } finally {
      setAuthLoading(false);
    }
  };
`;

content = content.replace(authLogicRegex, newAuthLogic);

// Replace modal state resets
content = content.replace(
  /setLoginPhoneInput\(""\);\n[\s\S]*?setOtpError\(""\);/g,
  `setLoginEmailInput("");
                setLoginPasswordInput("");
                setRegisterPassword("");`
);

// Replace Registration form UI
const regFormRegex = /<label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number \*<\/label>[\s\S]*?Bhopal Zone \/ Area \*<\/label>/m;
const newRegForm = `<label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number (Optional)</label>
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
                        <label className="block text-xs font-bold text-slate-600 mb-1">📍 Bhopal Zone / Area *</label>`;

content = content.replace(regFormRegex, newRegForm);

// Registration button
const regBtnRegex = /<button\n\s*onClick=\{async \(\) => \{\n\s*if \(registerName[\s\S]*?🚀 Verify Phone \& Continue"\n\s*\)}/m;
const newRegBtn = `<button
                        onClick={handleFirebaseRegister}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-2 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                            Registering...
                          </>
                        ) : (
                          "🚀 Create Account"
                        )}`;

content = content.replace(regBtnRegex, newRegBtn);

// Remove OTP view from registration
content = content.replace(/\{\!isOtpSent \? \(\n\s*<>\n\s*<div>\n\s*<label className="block text-xs font-bold text-slate-600 mb-1">Full Name \*/, '<>\n                      <div>\n                        <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *');

// Carefully remove the `) : (` part and the OTP verification UI for registration
content = content.replace(/<\/button>\n\s*<\/>\n\s*\) : \([\s\S]*?✓ Verify \& Register Account"\n\s*\)}\n\s*<\/button>\n\s*<\/>\n\s*\)}/, '</button>\n                    </>');


// Update Login Form
const loginFormRegex = /\{\!isOtpSent \? \([\s\S]*?✓ Verify \& Login Securely"\n\s*\)}\n\s*<\/button>\n\s*<\/>\n\s*\)}/m;

const newLoginForm = `<>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setLoginRole("user")}
                          className={\`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 \${loginRole === "user" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}\`}
                        >👤 User</button>
                        <button
                          onClick={() => setLoginRole("vendor")}
                          className={\`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 \${loginRole === "vendor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}\`}
                        >🛠️ Vendor</button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmailInput}
                          onChange={(e) => setLoginEmailInput(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={loginPasswordInput}
                          onChange={(e) => setLoginPasswordInput(e.target.value)}
                          className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      <button
                        onClick={handleFirebaseLogin}
                        disabled={authLoading}
                        className="w-full bg-[#F8CB46] hover:bg-amber-400 disabled:bg-slate-350 disabled:cursor-not-allowed text-slate-900 font-extrabold text-sm px-4 py-3 rounded-xl shadow-md transition mt-2 border border-amber-500 flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                            Logging in...
                          </>
                        ) : (
                          "🔑 Login Securely"
                        )}
                      </button>
                    </>`;

content = content.replace(loginFormRegex, newLoginForm);

// Remove recaptcha parent div at the bottom
content = content.replace(/\{\/\* Permanent invisible reCAPTCHA parent container mounted outside conditional modals \*\/\}\n\s*<div id="recaptcha-parent" className="hidden"><\/div>/, '');


fs.writeFileSync(file, content);
console.log("Refactoring complete");
