const fs = require('fs');
const T = require('./dict.js');

const rows = JSON.parse(fs.readFileSync('d:/workspacenew/morelanguage/code/mer_plat_admin/menu_rows.json', 'utf8'));

// verify coverage
const missing = new Set();
for (const r of rows) if (!T[r.name]) missing.add(r.name);
if (missing.size) {
  console.log('MISSING COUNT:', missing.size);
  [...missing].sort((a, b) => a.localeCompare(b, 'zh')).forEach((n) => console.log('MISSING: ' + n));
  process.exit(1);
}

function sqlStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const sorted = [...rows].sort((a, b) => a.id - b.id);
const out = [];
out.push('-- ============================================================');
out.push('-- eb_system_menu name_json 多语言翻译填充脚本 (来源: 多商户V1.8.1全量.sql)');
out.push('-- 生成时间: 2026-08-24  覆盖行数: ' + sorted.length);
out.push('-- 说明: zh-cn 取自原始 name；en 英文；th/my 为常用术语翻译(上线前建议母语校对)');
out.push('-- 执行前建议备份: CREATE TABLE eb_system_menu_bak AS SELECT * FROM eb_system_menu;');
out.push('-- ============================================================');
out.push('SET NAMES utf8mb4;');
out.push('');
out.push('-- ---------------------------- 平台端 (type=3) ----------------------------');

let curType = null;
for (const r of sorted) {
  if (r.type !== curType) {
    curType = r.type;
    out.push('');
    out.push(curType === 4 ? '-- ---------------------------- 商户端 (type=4) ----------------------------' : '-- ---------------------------- 平台端 (type=3) ----------------------------');
  }
  const t = T[r.name];
  const json = JSON.stringify({ 'zh-cn': r.name, en: t.en, th: t.th, my: t.my });
  out.push(`UPDATE \`eb_system_menu\` SET \`name_json\` = '${sqlStr(json)}' WHERE \`id\` = ${r.id};`);
}

fs.writeFileSync('d:/workspacenew/morelanguage/code/mer_plat_admin/menu_name_json_translations.sql', out.join('\n') + '\n');
console.log('OK - wrote', sorted.length, 'UPDATE statements.');
