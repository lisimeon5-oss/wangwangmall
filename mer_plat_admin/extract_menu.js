const fs = require('fs');

const sqlPath = 'd:/workspacenew/morelanguage/code/mer_java/sql/多商户V1.8.1全量.sql';
const text = fs.readFileSync(sqlPath, 'utf8');

const lines = text.split(/\r?\n/);

function parseValuesTuple(str) {
  // str is like "(1, 0, '主页', ...);"
  // returns array of values (strings/numbers/null)
  const values = [];
  let i = 0;
  const n = str.length;
  // skip leading '('
  while (i < n && str[i] !== '(') i++;
  i++; // past '('
  while (i < n) {
    // skip whitespace
    while (i < n && /\s/.test(str[i])) i++;
    if (i >= n || str[i] === ')') break;
    if (str[i] === "'") {
      // string
      i++;
      let s = '';
      while (i < n) {
        const c = str[i];
        if (c === '\\') {
          s += str[i + 1] || '';
          i += 2;
          continue;
        }
        if (c === "'") {
          // check for doubled quote ''
          if (str[i + 1] === "'") {
            s += "'";
            i += 2;
            continue;
          }
          i++; // closing quote
          break;
        }
        s += c;
        i++;
      }
      values.push(s);
    } else {
      let tok = '';
      while (i < n && str[i] !== ',' && str[i] !== ')') {
        tok += str[i];
        i++;
      }
      tok = tok.trim();
      if (tok === 'NULL') values.push(null);
      else if (/^-?\d+$/.test(tok)) values.push(Number(tok));
      else values.push(tok);
    }
    // skip to comma or ')'
    while (i < n && str[i] !== ',' && str[i] !== ')') i++;
    if (str[i] === ',') i++;
  }
  return values;
}

const rows = [];
for (const line of lines) {
  if (!line.startsWith('INSERT INTO `eb_system_menu`')) continue;
  const vi = line.indexOf('VALUES');
  if (vi < 0) {
    console.error('NO VALUES:', line.slice(0, 160));
    continue;
  }
  const tuple = line.slice(vi + 6).trim(); // after "VALUES"
  const values = parseValuesTuple(tuple);
  // column order (with or without column list) is the same:
  // id, pid, name, icon, perms, component, menu_type, sort, is_show, is_delte, type, create_time, update_time
  if (values.length < 11) {
    console.error('SHORT PARSE (' + values.length + '):', line.slice(0, 160));
    continue;
  }
  rows.push({
    id: values[0],
    pid: values[1],
    name: values[2],
    menu_type: values[6],
    is_show: values[8],
    is_delte: values[9],
    type: values[10],
  });
}

console.log('TOTAL ROWS:', rows.length);
console.log('UNIQUE NAMES:', new Set(rows.map(r => r.name)).size);
console.log('type=3:', rows.filter(r => r.type === 3).length);
console.log('type=4:', rows.filter(r => r.type === 4).length);
console.log('is_delte=1:', rows.filter(r => r.is_delte === 1).length);
console.log('menu_type M/C/A:', rows.filter(r => r.menu_type === 'M').length, rows.filter(r => r.menu_type === 'C').length, rows.filter(r => r.menu_type === 'A').length);

fs.writeFileSync('d:/workspacenew/morelanguage/code/mer_plat_admin/menu_rows.json', JSON.stringify(rows, null, 0));
console.log('WROTE menu_rows.json');

