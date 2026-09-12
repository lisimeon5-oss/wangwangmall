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
    } else if (/\.(vue|js)$/.test(ent.name) && ent.name !== 'echarts.min.js') acc.push(p)
  }
  return acc
}

let n = 0
for (const f of walk(ROOT, [])) {
  if (f.includes(`${path.sep}i18n${path.sep}`)) continue
  let s = fs.readFileSync(f, 'utf8')
  const isVue = f.endsWith('.vue')
  const call = isVue ? "this.$t" : "t"
  let next = s.replace(
    /(uni\.show(?:Loading|Toast)\(\s*\{[\s\S]{0,120}?title:\s*)(['"])(加载中(?:\.\.\.)?|正在加载中)\2/g,
    (m, pre, q, zh) => {
      if (m.includes('$t(') || m.includes("t('")) return m
      return `${pre}${call}('${zh}')`
    }
  )
  if (next !== s) {
    if (!isVue && next.includes("t('") && !/from ['"]@\/i18n['"]/.test(next) && !/require\(['"]@\/i18n['"]\)/.test(next)) {
      if (!next.includes("import { t }") && next.includes('import ')) {
        next = next.replace(/(import[^\n]+\n)/, `$1import { t } from '@/i18n'\n`)
      }
    }
    fs.writeFileSync(f, next)
    n++
  }
}
console.log('loading titles', n)
