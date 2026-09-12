/**
 * Deep-merge platform admin lang packs into merchant admin.
 * Platform is the base; merchant overlay wins on the same key.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadDefaultExport(filePath) {
  const code = fs.readFileSync(filePath, 'utf8').replace(/export\s+default/, 'module.exports =');
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require, console });
  return module.exports;
}

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) return overlay;
  if (!base || typeof base !== 'object' || Array.isArray(base)) return overlay;
  const out = { ...base };
  Object.keys(overlay).forEach((key) => {
    out[key] = deepMerge(base[key], overlay[key]);
  });
  return out;
}

function serialize(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (obj === null) return 'null';
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    if (!obj.length) return '[]';
    return `[\n${obj.map((v) => `${padIn}${serialize(v, indent + 1)}`).join(',\n')}\n${pad}]`;
  }
  const keys = Object.keys(obj);
  if (!keys.length) return '{}';
  const body = keys
    .map((k) => {
      const safe = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `${padIn}${safe}: ${serialize(obj[k], indent + 1)}`;
    })
    .join(',\n');
  return `{\n${body}\n${pad}}`;
}

const header = `// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

`;

const langs = ['zh-cn', 'en', 'th', 'my'];
const platDir = path.resolve(__dirname, '../../mer_plat_admin/src/i18n/langs');
const merDir = path.resolve(__dirname, '../src/i18n/langs');

langs.forEach((lang) => {
  const plat = loadDefaultExport(path.join(platDir, `${lang}.js`));
  const mer = loadDefaultExport(path.join(merDir, `${lang}.js`));
  const merged = deepMerge(plat, mer);
  const out = `${header}export default ${serialize(merged, 0)};\n`;
  fs.writeFileSync(path.join(merDir, `${lang}.js`), out, 'utf8');
  console.log('merged', lang, 'keys-top', Object.keys(merged).length);
});
