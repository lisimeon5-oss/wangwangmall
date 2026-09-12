const fs = require('fs');
const dir = 'd:/workspacenew/morelanguage/code/mer_mer_admin/public/static/tinymce4.7.5/langs/';
const files = ['th', 'my', 'zh_CN'];
for (const f of files) {
  const p = dir + f + '.js';
  const c = fs.readFileSync(p, 'utf8');
  let ok = 'OK';
  try {
    new Function(c);
  } catch (e) {
    ok = 'ERROR: ' + e.message;
  }
  const m = c.match(/addI18n\('([^']+)'/);
  const keys = (c.match(/"\s*,/g) || []).length;
  console.log(f + ' | locale=' + (m ? m[1] : '?') + ' | keys=' + keys + ' | ' + ok);
}
