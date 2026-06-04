const fs = require('fs');
let c = fs.readFileSync('src/components/TektonApp.tsx', 'utf8');
const lines = c.split('\n');
const seen = new Set();
const out = lines.filter(l => {
  if (l.includes('useState') && (l.includes('loginEmailInput') || l.includes('loginPasswordInput') || l.includes('registerPassword'))) {
    if (seen.has(l.trim())) return false;
    seen.add(l.trim());
  }
  return true;
});
fs.writeFileSync('src/components/TektonApp.tsx', out.join('\n'));
console.log('Fixed duplications.');
