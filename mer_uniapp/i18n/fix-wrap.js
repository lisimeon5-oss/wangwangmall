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
    } else if (ent.name.endsWith('.vue') || (ent.name.endsWith('.js') && ent.name !== 'echarts.min.js')) acc.push(p)
  }
  return acc
}

function undouble(s) {
  let prev
  do {
    prev = s
    s = s.replace(/\$t\(\s*\$t\(\s*(['"])((?:\\.|[^\\])*?)\1\s*\)\s*\)/g, "$$t($1$2$1)")
  } while (s !== prev)
  return s
}

function isZhKey(k) {
  return /^[\u4e00-\u9fff0-9A-Za-z:：、，。！？～\s฿%％()（）+\-_.]*$/.test(k) && /[\u4e00-\u9fff]/.test(k)
}

function mergeAdj(s) {
  let prev
  do {
    prev = s
    s = s.replace(/\{\{\s*\$t\('((?:\\'|[^'])+)'\)\s*\}\}\{\{\s*\$t\('((?:\\'|[^'])+)'\)\s*\}\}/g, (m, a, b) => {
      const aa = a.replace(/\\'/g, "'")
      const bb = b.replace(/\\'/g, "'")
      if (isZhKey(aa) && isZhKey(bb) && aa.length <= 20 && bb.length <= 20) {
        return `{{$t('${(aa + bb).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')}}`
      }
      return m
    })
  } while (s !== prev)
  return s
}

let n = 0
for (const f of walk(ROOT, [])) {
  if (f.includes(`${path.sep}i18n${path.sep}`)) continue
  const src = fs.readFileSync(f, 'utf8')
  let next = undouble(src)
  if (f.endsWith('.vue')) next = mergeAdj(next)
  if (next !== src) {
    fs.writeFileSync(f, next, 'utf8')
    n++
  }
}
console.log('fixed', n)
