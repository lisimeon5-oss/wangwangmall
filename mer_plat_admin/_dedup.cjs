const fs = require('fs');

function extractKeys(contentLines) {
  const keys = [];
  for (const l of contentLines) {
    const m = l.match(/^\s{2}"?([A-Za-z0-9_]+)"?\s*:/);
    if (m) keys.push(m[1]);
  }
  return keys;
}

function getBlocks(lines, keyName) {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp('^  ' + keyName + ': \\{').test(lines[i])) {
      let end = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (/^\},?$/.test(lines[j])) { end = j; break; }
      }
      blocks.push({ start: i, end, keys: extractKeys(lines.slice(i + 1, end)) });
      i = end;
    }
  }
  return blocks;
}

function superset(a, b) {
  // true if every key in a is in b
  const bs = new Set(b);
  return a.every((k) => bs.has(k));
}

for (const f of ['zh-cn.js', 'en.js', 'th.js', 'my.js']) {
  const p = 'src/i18n/langs/' + f;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  const uBlocks = getBlocks(lines, 'user');
  const mBlocks = getBlocks(lines, 'marketing');
  console.log('== ' + f + ' user blocks: ' + uBlocks.map((b) => b.keys.length).join(', ') + ' | marketing blocks: ' + mBlocks.map((b) => b.keys.length).join(', '));
  const lastU = uBlocks[uBlocks.length - 1];
  const lastM = mBlocks[mBlocks.length - 1];
  let ok = true;
  for (const b of uBlocks) {
    if (!superset(b.keys, lastU.keys)) { console.log('  !! earlier user block has keys missing in last: ' + b.keys.filter((k) => !lastU.keys.includes(k)).join(',')); ok = false; }
  }
  for (const b of mBlocks) {
    if (!superset(b.keys, lastM.keys)) { console.log('  !! earlier marketing block has keys missing in last: ' + b.keys.filter((k) => !lastM.keys.includes(k)).join(',')); ok = false; }
  }
  if (!ok) { console.log('  SKIPPED ' + f); continue; }
  // remove duplicated region: from first user block start to just before last user block start
  const firstUserStart = uBlocks[0].start;
  const lastUserStart = lastU.start;
  const dedup = lines.slice(0, firstUserStart).concat(lines.slice(lastUserStart));
  fs.writeFileSync(p, dedup.join('\n'));
  console.log('  deduped ' + f + ' (removed ' + (lastUserStart - firstUserStart) + ' lines)');
}
