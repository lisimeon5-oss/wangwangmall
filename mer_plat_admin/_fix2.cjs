const fs = require('fs');
for (const f of ['zh-cn', 'en', 'th', 'my']) {
  const p = 'src/i18n/langs/' + f + '.js';
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.split('"    name: \'').join('",\n    name: \'');
  fs.writeFileSync(p, s);
  console.log(f + ': ' + (before !== s ? 'repaired' : 'nochange'));
}