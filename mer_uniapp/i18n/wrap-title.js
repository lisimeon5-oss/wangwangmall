const fs = require('fs')
const path = require('path')
const ROOT = path.resolve(__dirname, '..')
const SKIP_DIR = new Set(['node_modules', 'uni_modules', 'unpackage', 'static', 'i18n'])

function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!SKIP_DIR.has(ent.name)) walk(p, acc)
    } else if (ent.name.endsWith('.vue')) acc.push(p)
  }
  return acc
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

let n = 0
for (const f of walk(ROOT, [])) {
  let s = fs.readFileSync(f, 'utf8')
  const next = s.replace(/(\s)(titleText|navTitle)=(["'])([^"']*[\u4e00-\u9fff][^"']*)\3/g, (m, sp, attr, q, val) => {
    if (val.includes('$t') || val.includes('{{')) return m
    return `${sp}:${attr}="$t('${esc(val)}')"`
  })
  if (next !== s) {
    fs.writeFileSync(f, next)
    n++
  }
}
console.log('title attrs', n)
