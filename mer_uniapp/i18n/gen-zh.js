const fs = require('fs');
const path = require('path');

const base = 'D:/workspacenew/morelanguage/code/mer_uniapp/i18n';
const keys = JSON.parse(fs.readFileSync(path.join(base, 'phrase-keys.json'), 'utf8'));
const dir = path.join(base, 'phrases');
fs.mkdirSync(dir, { recursive: true });

const body = keys.map(k => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(k) + ',').join('\n');
fs.writeFileSync(path.join(dir, 'zh-cn.js'), 'export default {\n' + body + '\n}\n', 'utf8');

console.log('keys:', keys.length, 'unique:', new Set(keys).size);
