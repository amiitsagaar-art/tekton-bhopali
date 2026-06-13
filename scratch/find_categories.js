const fs = require('fs');
const content = fs.readFileSync('src/components/TektonApp.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('CATEGORIES')) {
    console.log(`${index + 1}: ${line}`);
  }
});
