const fs = require('fs');
const path = require('path');

const base = 'D:/workspacenew/morelanguage/code/mer_uniapp/i18n';
const keys = JSON.parse(fs.readFileSync(path.join(base, 'phrase-keys.json'), 'utf8'));

const files = process.argv.slice(2);
let bad = false;

for (const f of files) {
  const p = path.join(base, 'phrases', f + '.js');
  if (!fs.existsSync(p)) { console.log(f, '-> MISSING FILE'); bad = true; continue; }
  const src = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  let obj;
  try {
    obj = eval('(' + src.replace(/export\s+default\s*/, '') + ')');
  } catch (e) {
    console.log(f, '-> PARSE ERROR:', e.message); bad = true; continue;
  }
  const got = Object.keys(obj);
  const missing = keys.filter(k => !Object.prototype.hasOwnProperty.call(obj, k));
  const extra = got.filter(k => !keys.includes(k));
  const empty = got.filter(k => typeof obj[k] !== 'string' || obj[k].trim() === '');
  const untranslated = f === 'zh-cn' ? [] : got.filter(k => obj[k] === k);
  console.log(`${f}: entries=${got.length} expected=${keys.length} missing=${missing.length} extra=${extra.length} empty=${empty.length} sameAsKey=${untranslated.length}`);
  if (missing.length) { console.log('  MISSING:', JSON.stringify(missing)); bad = true; }
  if (extra.length) { console.log('  EXTRA:', JSON.stringify(extra)); bad = true; }
  if (empty.length) { console.log('  EMPTY:', JSON.stringify(empty)); bad = true; }
  if (untranslated.length) { console.log('  SAME AS KEY:', JSON.stringify(untranslated)); }
}

process.exit(bad ? 1 : 0);
