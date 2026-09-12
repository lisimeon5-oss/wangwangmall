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

function wrapTmpl(tmpl) {
  tmpl = tmpl.replace(
    /(\s)(placeholder|navTitle|title|label|confirmText|cancelText)=(["'])([^"']*[\u4e00-\u9fff][^"']*)\3/g,
    (m, sp, attr, q, val) => {
      if (val.includes('$t(') || val.includes('{{')) return m
      return `${sp}:${attr}="$t('${esc(val)}')"`
    }
  )
  tmpl = tmpl.replace(/\?\s*'([\u4e00-\u9fff][^']{0,40})'\s*:\s*'([\u4e00-\u9fff][^']{0,40})'/g, (m, a, b) => {
    if (m.includes('$t(')) return m
    return `? $t('${esc(a)}') : $t('${esc(b)}')`
  })
  tmpl = tmpl.replace(/>([^<>]+)</g, (m, inner) => {
    if (!/[\u4e00-\u9fff]/.test(inner)) return m
    if (inner.includes('$t(') || inner.includes('{{')) return m
    const trimmed = inner.replace(/\s+/g, ' ').trim()
    if (!trimmed || trimmed.length > 50) return m
    if (!/^[\u4e00-\u9fff0-9A-Za-z\/\+\-\_\%\.\,:：；、，。！？~《》()（）฿\s]+$/.test(trimmed)) return m
    const lead = inner.match(/^\s*/)[0]
    const trail = inner.match(/\s*$/)[0]
    return `>${lead}{{$t('${esc(trimmed)}')}}${trail}<`
  })
  return tmpl
}

const keys = new Set()
let changed = 0
for (const f of walk(ROOT, [])) {
  const src = fs.readFileSync(f, 'utf8')
  const ti = src.search(/<template/i)
  const si = src.search(/<script/i)
  if (ti < 0) continue
  const end = si > ti ? si : src.length
  const next = src.slice(0, ti) + wrapTmpl(src.slice(ti, end)) + src.slice(end)
  const re = /\$t\(\s*'((?:\\'|[^'])+)'/g
  let m
  while ((m = re.exec(next))) {
    const k = m[1].replace(/\\'/g, "'")
    if (/[\u4e00-\u9fff]/.test(k)) keys.add(k)
  }
  if (next !== src) {
    fs.writeFileSync(f, next, 'utf8')
    changed++
  }
}
const arr = [...keys].sort((a, b) => a.localeCompare(b, 'zh'))
fs.writeFileSync(path.join(__dirname, 'phrase-keys.json'), JSON.stringify(arr, null, 2), 'utf8')
console.log('changed', changed, 'keys', arr.length)
