const fs = require('fs');
const rows = JSON.parse(fs.readFileSync('d:/workspacenew/morelanguage/code/mer_plat_admin/menu_rows.json', 'utf8'));
const counts = new Map();
for (const r of rows) {
  counts.set(r.name, (counts.get(r.name) || 0) + 1);
}
const names = [...counts.keys()].sort((a, b) => a.localeCompare(b, 'zh'));
let out = '';
for (const n of names) {
  out += counts.get(n) + '\t' + n + '\n';
}
fs.writeFileSync('d:/workspacenew/morelanguage/code/mer_plat_admin/unique_names.txt', out);
console.log('UNIQUE NAMES:', names.length);
console.log('WROTE unique_names.txt');
