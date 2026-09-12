const fs = require('fs');
const path = require('path');

function loadLang(p) { let s = fs.readFileSync(p, 'utf8').replace('export default', 'module.exports ='); return eval(s); }
const zh = loadLang('src/i18n/langs/zh-cn.js');
const rev = {};
(function flatten(obj, prefix) {
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k;
    if (obj[k] && typeof obj[k] === 'object') flatten(obj[k], full);
    else if (!(obj[k] in rev)) rev[obj[k]] = full;
  }
})(zh, '');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.vue')) out.push(p);
  }
  return out;
}

const dir = process.argv[2] || 'src/views/finance';
const outFile = process.argv[3] || '_extract_out.txt';
const files = walk(dir);
const found = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  // quoted strings with CJK
  const re = /['"]([^'"\n]*[\u4e00-\u9fff][^'"\n]*)['"]/g;
  let m;
  while ((m = re.exec(s))) {
    const v = m[1];
    if (!found.has(v)) found.set(v, rev[v] || 'NEW');
  }
  // template text nodes
  const re2 = />([^<>{}]*[\u4e00-\u9fff][^<>{}]*)</g;
  while ((m = re2.exec(s))) {
    const v = m[1].trim();
    if (v && !found.has(v)) found.set(v, rev[v] || 'NEW');
  }
}
const items = [...found.entries()].sort((a, b) => (a[1] === 'NEW') - (b[1] === 'NEW') || a[0].localeCompare(b[0]));
for (const [v, k] of items) console.log((k === 'NEW' ? 'NEW ' : 'REUSE ' + k) + ' | ' + v);
console.log('\nTOTAL unique: ' + items.length + ', NEW: ' + items.filter(([, k]) => k === 'NEW').length);
fs.writeFileSync(outFile, items.map(([v, k]) => (k === 'NEW' ? 'NEW ' : 'REUSE ' + k) + ' | ' + v).join('\n') + '\n\nTOTAL unique: ' + items.length + ', NEW: ' + items.filter(([, k]) => k === 'NEW').length);
