const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/handleFirebaseRegister\(.*?\)/g, 'handleFirebaseRegister()');

fs.writeFileSync(file, c);
console.log("Fixed handleFirebaseRegister args.");
