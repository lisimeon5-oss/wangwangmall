const fs = require('fs')
const path = require('path')

const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'phrase-keys.json'), 'utf8'))
const dir = path.join(__dirname, 'phrases')
if (!fs.existsSync(dir)) fs.mkdirSync(dir)

function dump(obj) {
  return 'export default ' + JSON.stringify(obj, null, 2).replace(/\\\\u/g, '\\u') + '\n'
}

const zh = {}
keys.forEach((k) => { zh[k] = k })
fs.writeFileSync(path.join(dir, 'zh-cn.js'), dump(zh))

const enExact = JSON.parse(fs.readFileSync(path.join(__dirname, 'trans-en.json'), 'utf8'))
const thExact = JSON.parse(fs.readFileSync(path.join(__dirname, 'trans-th.json'), 'utf8'))
const myExact = JSON.parse(fs.readFileSync(path.join(__dirname, 'trans-my.json'), 'utf8'))

function fill(exact) {
  const o = {}
  keys.forEach((k) => { o[k] = exact[k] || k })
  return o
}

fs.writeFileSync(path.join(dir, 'en.js'), dump(fill(enExact)))
fs.writeFileSync(path.join(dir, 'th.js'), dump(fill(thExact)))
fs.writeFileSync(path.join(dir, 'my.js'), dump(fill(thExact))) // placeholder swapped below
console.log('zh', Object.keys(zh).length)
