const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<(input|textarea)[^>]*className=(["'])([^"']*)\2[^>]*>/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('--- MATCH ---');
  console.log(match[0]);
}

const regex2 = /<(input|textarea)[^>]*className=\{([^}]*)\}[^>]*>/g;
while ((match = regex2.exec(content)) !== null) {
  console.log('--- MATCH (dynamic) ---');
  console.log(match[0]);
}
