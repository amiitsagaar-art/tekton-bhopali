const fs = require('fs');
const content = fs.readFileSync('src/components/TektonApp.tsx', 'utf8');

const regex = /appointments\.filter\([^)]*\)\.map\(/;
const match = content.match(regex);

if (match) {
    const idx = match.index;
    console.log(content.slice(Math.max(0, idx + 6500), idx + 8000));
}
