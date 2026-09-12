const fs = require('fs');
const T = require('./_t.cjs');
const langFiles = { zh: 'zh-cn', en: 'en', th: 'th', my: 'my' };

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

for (const ns of Object.keys(T)) {
  for (const [lang, file] of Object.entries(langFiles)) {
    const p = 'src/i18n/langs/' + file + '.js';
    let s = fs.readFileSync(p, 'utf8');
    let block = '  ' + ns + ': {\n';
    for (const [k, v] of Object.entries(T[ns])) {
      block += "    " + k + ": '" + esc(v[lang]) + "',\n";
    }
    block += '  },';
    const re = new RegExp('^  ' + ns + ': \\{', 'm');
    if (!re.test(s)) {
      s = s.replace(/\n\};\s*$/, '\n' + block + '\n};');
      fs.writeFileSync(p, s);
      continue;
    }
    // namespace exists -> merge (append missing keys) before its closing brace
    const start = s.search(re);
    const rest = s.slice(start);
    const closeMatch = rest.match(/\n[ \t]{0,2}\},/);
    if (!closeMatch) throw new Error('no close for ' + ns + ' in ' + file);
    const insertAt = start + closeMatch.index; // before the newline that precedes '},'
    const existing = rest.slice(0, closeMatch.index);
    const keys = Object.keys(T[ns]);
    let add = '';
    for (const k of keys) {
      if (new RegExp('^    ' + k + '\\s*:', 'm').test(existing)) continue;
      add += "    " + k + ": '" + esc(T[ns][k][lang]) + "',\n";
    }
    if (add) {
      const before = s.slice(0, insertAt);
      const lastLine = before.split('\n').pop();
      const prefix = lastLine.trim() && !lastLine.trim().endsWith(',') ? ',\n' : '';
      s = before + prefix + add + s.slice(insertAt);
      fs.writeFileSync(p, s);
    }
  }
}
console.log('built namespaces: ' + Object.keys(T).join(', '));
