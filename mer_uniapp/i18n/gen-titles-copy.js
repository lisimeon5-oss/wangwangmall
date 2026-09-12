const fs = require('fs')
const path = require('path')
const en = fs.readFileSync(path.join(__dirname, 'phrases/en.js'), 'utf8')
fs.writeFileSync(path.join(__dirname, 'phrases/th.js'), en)
fs.writeFileSync(path.join(__dirname, 'phrases/my.js'), en)

const src = fs.readFileSync(path.join(__dirname, '../pages.json'), 'utf8')
let root = ''
let lastPath = ''
const acc = {}
const lines = src.split(/\r?\n/)
for (const line of lines) {
  const r = line.match(/"root"\s*:\s*"([^"]+)"/)
  if (r) root = r[1]
  const p = line.match(/"path"\s*:\s*"([^"]+)"/)
  if (p && !line.includes('iconPath') && !line.includes('pagePath')) {
    lastPath = p[1].includes('/') ? (p[1].startsWith('pages/') || root === '' ? p[1] : root + '/' + p[1]) : (root ? root + '/' + p[1] : p[1])
  }
  const t = line.match(/"navigationBarTitleText"\s*:\s*"([^"]+)"/)
  if (t && lastPath && /[\u4e00-\u9fff]/.test(t[1])) {
    acc[lastPath] = t[1]
  }
}

const out = ['export const PAGE_TITLES = {']
Object.keys(acc).sort().forEach((k) => {
  out.push(`  '${k}': '${acc[k].replace(/'/g, "\\'")}',`)
})
out.push('}')
out.push('')
fs.writeFileSync(path.join(__dirname, 'pageTitles.js'), out.join('\n'))
console.log('titles', Object.keys(acc).length)
