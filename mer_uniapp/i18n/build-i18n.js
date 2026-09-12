/**
 * Extract Chinese UI strings and wrap them with $t().
 * Run from mer_uniapp: node i18n/build-i18n.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SKIP_DIR = new Set([
  'node_modules',
  'uni_modules',
  'unpackage',
  'static',
  'i18n'
])
const SKIP_FILE = [
  /city\.js$/,
  /echarts\.min\.js$/,
  /u-charts/,
  /vconsole/,
  /MpHtmlParser/,
  /CssHandler/,
  /parser\.js$/
]

const ZH = /[\u4e00-\u9fff]/

function walk(dir, acc) {
  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of list) {
    if (ent.name.startsWith('.')) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (SKIP_DIR.has(ent.name)) continue
      walk(p, acc)
    } else if (/\.(vue|js)$/.test(ent.name) && !SKIP_FILE.some((r) => r.test(p))) {
      acc.push(p)
    }
  }
  return acc
}

function extractFromText(text) {
  const set = new Set()
  const re = /['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]/g
  let m
  while ((m = re.exec(text))) {
    const s = m[1].trim()
    if (s && s.length < 80 && !s.includes('${') && !s.includes('\\n')) set.add(s)
  }
  const tmpl = text.match(/<template[\s\S]*?<\/template>/i)
  if (tmpl) {
    const t = tmpl[0]
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    const re2 = /[\u4e00-\u9fff][\u4e00-\u9fffA-Za-z0-9\s\/\+\-\_\%\.\(\)《》~，。！？、：；“”‘’]{0,60}/g
    let n
    while ((n = re2.exec(t))) {
      const s = n[0].trim()
      if (s.length >= 1 && s.length < 60) set.add(s)
    }
  }
  return set
}

const files = walk(ROOT, [])
const all = new Set()
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8')
  extractFromText(text).forEach((s) => all.add(s))
}

const arr = [...all].sort((a, b) => a.localeCompare(b, 'zh'))
fs.writeFileSync(path.join(__dirname, 'extracted-zh.json'), JSON.stringify(arr, null, 2), 'utf8')
console.log('files', files.length, 'phrases', arr.length)
