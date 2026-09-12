const fs = require('fs');
const path = require('path');

function loadLang(p) { let s = fs.readFileSync(p, 'utf8').replace('export default', 'module.exports ='); return eval(s); }
const zh = loadLang('src/i18n/langs/zh-cn.js');
const rev = {};
(function flatten(o, pre) { for (const k of Object.keys(o)) { const full = pre ? pre + '.' + k : k; if (o[k] && typeof o[k] === 'object') flatten(o[k], full); else if (!(o[k] in rev)) rev[o[k]] = full; } })(zh, '');
function keyOf(v) { return rev[v] || null; }

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.vue')) out.push(p);
  }
  return out;
}

let files;
if (process.argv[2] && fs.existsSync(process.argv[2]) && fs.statSync(process.argv[2]).isDirectory()) {
  files = walk(process.argv[2]);
} else {
  files = process.argv.slice(2).filter((a) => a.endsWith('.vue'));
}

for (const p of files) {
  let s = fs.readFileSync(p, 'utf8');
  const crlf = s.includes('\r\n');
  if (crlf) s = s.replace(/\r\n/g, '\n');

  // --- template ---
  const tStart = s.indexOf('<template>');
  const tEnd = s.lastIndexOf('</template>');
  if (tStart !== -1 && tEnd > tStart) {
    let t = s.slice(tStart + '<template>'.length, tEnd);
    t = t.replace(/(\s)(label|placeholder|start-placeholder|end-placeholder|title|content|active-text|inactive-text|description|timestamp|empty-text)="([^"]*[\u4e00-\u9fff][^"]*)"/g, (m, sp, attr, val) => {
      const k = keyOf(val);
      return k ? `${sp}:${attr}="$t('${k}')"` : m;
    });
    t = t.replace(/'([^'\n]*[\u4e00-\u9fff][^'\n]*)'/g, (m, val) => {
      const k = keyOf(val);
      return k ? `$t('${k}')` : m;
    });
    t = t.replace(/>([^<>{}]*[\u4e00-\u9fff][^<>{}]*)</g, (m, txt) => {
      const v = txt.trim();
      const k = keyOf(v);
      return k ? '>' + txt.replace(v, `{{ $t('${k}') }}`) + '<' : m;
    });
    t = t.replace(/}}笔/g, "}}{{ $t('finance.unitCount') }}");
    s = s.slice(0, tStart + '<template>'.length) + t + s.slice(tEnd);
  }

  // --- script ---
  const scMatch = s.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scMatch) {
    let sc = scMatch[1];
    sc = sc.replace(/'([^'\n]*[\u4e00-\u9fff][^'\n]*)'/g, (m, val) => {
      const k = keyOf(val);
      return k ? `this.$t('${k}')` : m;
    });
    s = s.split(scMatch[1]).join(sc);
  }

  if (crlf) s = s.replace(/\n/g, '\r\n');
  fs.writeFileSync(p, s);
  console.log('converted ' + p);
}
console.log('done');