const { keys, EN, enOf, dump, dir } = require('./trans-core')
const fs = require('fs')
const path = require('path')

const enObj = {}
keys.forEach((k) => { enObj[k] = enOf(k) })
const stillZh = keys.filter((k) => /[\u4e00-\u9fff]/.test(enObj[k]))
console.log('en still zh', stillZh.length)
console.log(stillZh.join('\n'))
fs.writeFileSync(path.join(dir, 'zh-cn.js'), dump(Object.fromEntries(keys.map((k) => [k, k]))))
fs.writeFileSync(path.join(dir, 'en.js'), dump(enObj))
fs.writeFileSync(path.join(__dirname, 'en-missing.json'), JSON.stringify(stillZh, null, 2))
