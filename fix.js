const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const \[registerEmail, setRegisterEmail\] = useState\(""\);/g, `const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");`);

// In the UI, the login submit button called sendFirebaseOtp
c = c.replace(/sendFirebaseOtp\(loginPhoneInput\)/g, 'handleFirebaseLogin()');

// There might be some sendFirebaseOtp(registerPhone) -> wait, verifyFirebaseOtp handles register.
c = c.replace(/sendFirebaseOtp\(registerPhone\)/g, 'handleFirebaseRegister()');

// If sendFirebaseOtp was called anywhere else:
c = c.replace(/sendFirebaseOtp/g, 'handleFirebaseLogin');
c = c.replace(/verifyFirebaseOtp/g, 'handleFirebaseRegister');

fs.writeFileSync(file, c);
console.log("Fixed state and function references.");
