const fs = require('fs');

function loadLang(p) { let s = fs.readFileSync(p, 'utf8').replace('export default', 'module.exports ='); return eval(s); }
const zh = loadLang('src/i18n/langs/zh-cn.js');
const rev = {};
(function flatten(o, pre) { for (const k of Object.keys(o)) { const full = pre ? pre + '.' + k : k; if (o[k] && typeof o[k] === 'object') flatten(o[k], full); else if (!(o[k] in rev)) rev[o[k]] = full; } })(zh, '');
const OV = {
  '全部': 'common.all', '重置': 'common.reset', '提示': 'common.tip', '待审核': 'order.pendingAudit',
  '审核通过': 'finance.auditPassed', '审核失败': 'common.auditFailed', '审核成功': 'common.auditSuccess',
  '系统': 'finance.system', '商户名称': 'product.merchantName',
};
function keyOf(v) { return OV[v] || rev[v] || null; }

const files = [
  'src/views/finance/charge/index.vue',
  'src/views/finance/closing/merchantClosing/index.vue',
  'src/views/finance/closing/userClosing/index.vue',
  'src/views/finance/statement/index.vue',
  'src/views/finance/journalAccount/capitalFlow/index.vue',
  'src/views/finance/setting/index.vue',
];

for (const p of files) {
  let s = fs.readFileSync(p, 'utf8');
  const crlf = s.includes('\r\n');
  if (crlf) s = s.replace(/\r\n/g, '\n');

  // --- template ---
  const tStart = s.indexOf('<template>');
  const tEnd = s.lastIndexOf('</template>');
  if (tStart !== -1 && tEnd > tStart) {
    let t = s.slice(tStart + '<template>'.length, tEnd);
    // static attrs label/placeholder/title
    t = t.replace(/(\s)(label|placeholder|start-placeholder|end-placeholder|title)="([^"]*[\u4e00-\u9fff][^"]*)"/g, (m, sp, attr, val) => {
      const k = keyOf(val);
      return k ? `${sp}:${attr}="$t('${k}')"` : m;
    });
    // Chinese single-quoted inside expressions / mustache -> $t()
    t = t.replace(/'([^'\n]*[\u4e00-\u9fff][^'\n]*)'/g, (m, val) => {
      const k = keyOf(val);
      return k ? `$t('${k}')` : m;
    });
    // text nodes
    t = t.replace(/>([^<>{}]*[\u4e00-\u9fff][^<>{}]*)</g, (m, txt) => {
      const v = txt.trim();
      const k = keyOf(v);
      return k ? '>' + txt.replace(v, `{{ $t('${k}') }}`) + '<' : m;
    });
    // explicit edge-case replacements
    t = t.replace(/}}笔/g, "}}{{ $t('finance.unitCount') }}");
    t = t.replace(/>开户户名 ：</g, ">{{ $t('finance.accountHolderLabel') }}<");
    s = s.slice(0, tStart + '<template>'.length) + t + s.slice(tEnd);
  }

  // --- script ---
  const scMatch = s.match(/<script>([\s\S]*?)<\/script>/);
  if (scMatch) {
    let sc = scMatch[1];
    sc = sc.replace(/'([^'\n]*[\u4e00-\u9fff][^'\n]*)'/g, (m, val) => {
      const k = keyOf(val);
      return k ? `this.$t('${k}')` : m;
    });
    s = s.replace(scMatch[1], sc);
  }

  if (crlf) s = s.replace(/\n/g, '\r\n');
  fs.writeFileSync(p, s);
  console.log('converted ' + p);
}
console.log('done');
