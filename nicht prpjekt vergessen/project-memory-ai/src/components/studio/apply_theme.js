const fs = require('fs');

const path = 'ContentStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Regex replacements to make classes responsive
const replacements = [
  { from: /bg-slate-950/g, to: 'bg-slate-50 dark:bg-slate-950' },
  { from: /bg-slate-900/g, to: 'bg-slate-100 dark:bg-slate-900' },
  { from: /border-white\/([a-zA-Z0-9\.]+)/g, to: 'border-black/10 dark:border-white/$1' },
  { from: /text-white/g, to: 'text-slate-900 dark:text-white' },
  { from: /text-slate-300/g, to: 'text-slate-700 dark:text-slate-300' },
  { from: /text-slate-200/g, to: 'text-slate-800 dark:text-slate-200' },
  { from: /text-slate-400/g, to: 'text-slate-600 dark:text-slate-400' },
  // Be careful with bg-white inside conditional literals
  { from: /bg-white\/([0-9\.]+)(?!\/)/g, to: 'bg-black/5 dark:bg-white/$1' },
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// Since some elements might get duplicate dark:dark: we can fix that
content = content.replace(/dark:dark:/g, 'dark:');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated Theme classes!');
