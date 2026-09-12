const fs = require('fs');
const path = require('path');

function loadLang(p) {
  let s = fs.readFileSync(p, 'utf8').replace('export default', 'module.exports =');
  return eval(s);
}
function flatten(obj, prefix, out) {
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k;
    if (obj[k] && typeof obj[k] === 'object') flatten(obj[k], full, out);
    else out[full] = true;
  }
  return out;
}
const langs = {};
let zhFlat = null;
for (const f of ['zh-cn', 'en', 'th', 'my']) {
  const o = loadLang('src/i18n/langs/' + f + '.js');
  langs[f] = o;
  const flat = flatten(o, '', {});
  console.log(f + ': ' + Object.keys(flat).length + ' keys');
  if (f === 'zh-cn') zhFlat = flat;
  else {
    const missing = Object.keys(zhFlat).filter((k) => !flat[k]);
    const extra = Object.keys(flat).filter((k) => !zhFlat[k]);
    console.log('   parity vs zh-cn -> missing: ' + missing.length + ', extra: ' + extra.length);
    if (missing.length) console.log('   MISSING sample: ' + missing.slice(0, 10).join(', '));
    if (extra.length) console.log('   EXTRA sample: ' + extra.slice(0, 10).join(', '));
  }
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(vue|js)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = walk('src');
const missing = new Set();
let refs = 0;
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const re = /(?:\$t|i18n\.t)\(\s*(['"])([^'"]+)\1\s*\)/g;
  let m;
  while ((m = re.exec(s))) {
    refs++;
    if (!zhFlat[m[2]]) missing.add(f.replace(/\\/g, '/') + ' -> ' + m[2]);
  }
}
console.log('total refs: ' + refs + '; missing refs: ' + missing.size);
for (const x of missing) console.log('  MISSING ' + x);
