const fs = require('fs');

function loadLang(file) {
  let src = fs.readFileSync(file, 'utf8');
  const idx = src.indexOf('export default');
  if (idx === -1) throw new Error('no export default in ' + file);
  src = src.slice(idx + 'export default'.length).trim();
  src = src.replace(/;\s*$/, '');
  return eval('(' + src + ')');
}

const zhCN = loadLang('src/i18n/langs/zh-cn.js');
const en = loadLang('src/i18n/langs/en.js');

let zhIndex = null;
function buildZhIndex() {
  const index = new Map();
  const walk = (obj, prefix) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        walk(value, path);
      } else if (typeof value === 'string' && value && !index.has(value)) {
        index.set(value, path);
      }
    });
  };
  walk(zhCN, '');
  zhIndex = index;
  return index;
}

function t(key) {
  const parts = key.split('.');
  let cur = en;
  for (const p of parts) {
    if (cur == null) break;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : key;
}

buildZhIndex();
console.log('index size:', zhIndex.size);

function translateText(text) {
  if (!text || typeof text !== 'string') return text;
  if (zhIndex == null) buildZhIndex();
  const key = zhIndex.get(text);
  if (!key) return text;
  const translated = t(key);
  return translated && typeof translated === 'string' ? translated : text;
}

const labels = ['服务条款', '服务条款图标', '服务内容描述', '排序', '提交', '请输入服务条款'];
for (const l of labels) {
  console.log(JSON.stringify(l), '->', JSON.stringify(translateText(l)));
}
