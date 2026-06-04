const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// The functions start around line 256 and end around line 517
// Let's find exactly the line indices:
const startIndex = lines.findIndex(l => l.includes('const setupRecaptcha = () => {'));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('const [workers, setWorkers] = useState<Worker[]>([]);')) - 2;

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  const newLogic = `
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
  lines.splice(startIndex, endIndex - startIndex + 1, newLogic);
}

// Next.config.ts error: "eslint does not exist in type NextConfig"
const nextConfig = 'next.config.ts';
if (fs.existsSync(nextConfig)) {
  let nc = fs.readFileSync(nextConfig, 'utf8');
  nc = nc.replace(/eslint:\s*\{[\s\S]*?\},/g, '');
  fs.writeFileSync(nextConfig, nc);
}

fs.writeFileSync(file, lines.join('\n'));
console.log("Refactoring complete");
