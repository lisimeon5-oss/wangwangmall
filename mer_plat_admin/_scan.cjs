const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.vue')) out.push(p);
  }
  return out;
}

const cjk = /[\u4e00-\u9fff]/g;
function count(s) { return (s.match(cjk) || []).length; }

function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\n)\s*\/\/[^\n]*/g, '$1')
    .replace(/<!--[\s\S]*?-->/g, '');
}

const files = walk('src/views');
const rows = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const tpl = (s.match(/<template[\s\S]*?<\/template>/) || [''])[0];
  const sc = (s.match(/<script[\s\S]*?<\/script>/) || [''])[0];
  const tplCjk = count(stripComments(tpl));
  const scCjk = count(stripComments(sc));
  const hasT = /\$t\(/.test(s);
  rows.push({ f: f.replace(/\\/g, '/'), tpl: tplCjk, sc: scCjk, hasT });
}

// files with CJK in template (likely untranslated UI)
const pending = rows.filter((r) => r.tpl > 0).sort((a, b) => b.tpl - a.tpl);
console.log('=== FILES WITH CJK IN TEMPLATE (count | $t? | file) ===');
for (const r of pending) console.log(String(r.tpl).padStart(4) + ' | ' + (r.hasT ? 'T' : '-') + ' | ' + r.f);
console.log('\nTotal .vue files: ' + rows.length + '; with template CJK: ' + pending.length);
