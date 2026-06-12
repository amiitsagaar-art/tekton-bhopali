const fs = require('fs');

const file = 'src/components/TektonApp.tsx';
let content = fs.readFileSync(file, 'utf8');

// Function to clean and update a className string
function updateClassString(cls) {
  // Remove bad classes
  const badClasses = [
    'text-white', 'text-slate-200', 'text-slate-300', 'text-slate-400', 'text-slate-500', 
    'bg-slate-950/60', 'bg-slate-955', 'bg-slate-900', 'bg-slate-800', 'bg-transparent', 'bg-slate-950',
    'placeholder:text-slate-600', 'placeholder:text-slate-500', 'dark:text-white', 'placeholder-slate-500'
  ];
  
  let newCls = cls.split(' ').filter(c => !badClasses.includes(c.trim())).join(' ');
  
  // Add required classes if not present
  const required = ['text-slate-900', 'bg-white', 'placeholder-slate-400'];
  required.forEach(r => {
    if (!newCls.includes(r)) {
      newCls += ' ' + r;
    }
  });
  
  // Clean up extra spaces
  return newCls.replace(/\s+/g, ' ').trim();
}

// We need to replace classNames in <input ... /> and <textarea ... />
const regex = /<(input|textarea)([\s\S]*?)className=(["'])([\s\S]*?)\3([\s\S]*?)>/g;

let count = 0;
content = content.replace(regex, (match, tag, before, quote, clsStr, after) => {
  const newCls = updateClassString(clsStr);
  count++;
  return '<' + tag + before + 'className=' + quote + newCls + quote + after + '>';
});

console.log('Replaced ' + count + ' static classNames.');

// Now for dynamic classNames
const regexDynamic = /<(input|textarea)([\s\S]*?)className=\{`([\s\S]*?)`\}([\s\S]*?)>/g;
let countDynamic = 0;
content = content.replace(regexDynamic, (match, tag, before, clsStr, after) => {
  const newCls = updateClassString(clsStr);
  countDynamic++;
  return '<' + tag + before + 'className={`' + newCls + '`}' + after + '>';
});

console.log('Replaced ' + countDynamic + ' dynamic classNames.');

fs.writeFileSync(file, content);
console.log('File patched!');
