const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SKIP_DIR = new Set(['node_modules', 'uni_modules', 'unpackage', 'static', 'i18n'])

function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!SKIP_DIR.has(ent.name)) walk(p, acc)
    } else if (ent.name.endsWith('.vue')) acc.push(p)
  }
  return acc
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function wrapTextNodes(tmpl) {
  return tmpl.replace(/>([^<>]+)</g, (m, inner) => {
    if (!/[\u4e00-\u9fff]/.test(inner)) return m
    if (inner.includes('$t(') || inner.includes('{{')) return m
    const trimmed = inner.replace(/\s+/g, ' ').trim()
    if (!trimmed || trimmed.length > 50) return m
    if (!/^[\u4e00-\u9fff0-9A-Za-z\/\+\-\_\%\.\,:：；、，。！？~《》()（）฿\s]+$/.test(trimmed)) return m
    const lead = inner.match(/^\s*/)[0]
    const trail = inner.match(/\s*$/)[0]
    return `>${lead}{{$t('${esc(trimmed)}')}}${trail}<`
  })
}

function wrapTernary(tmpl) {
  return tmpl.replace(/\?\s*'([\u4e00-\u9fff][^']{0,40})'\s*:\s*'([\u4e00-\u9fff][^']{0,40})'/g, (m, a, b) => {
    return `? $t('${esc(a)}') : $t('${esc(b)}')`
  })
}

const keys = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'phrase-keys.json'), 'utf8')))
const files = walk(ROOT, [])
let changed = 0
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8')
  const parts = src.split(/(<template[\s\S]*?<\/template>)/i)
  let out = ''
  for (const chunk of parts) {
    if (/^<template/i.test(chunk)) {
      let c = wrapTextNodes(chunk)
      c = wrapTernary(c)
      out += c
    } else out += chunk
  }
  const re = /\$t\(\s*'((?:\\'|[^'])+)'/g
  let m
  while ((m = re.exec(out))) keys.add(m[1].replace(/\\'/g, "'"))
  if (out !== src) {
    fs.writeFileSync(f, out, 'utf8')
    changed++
  }
}
const arr = [...keys].sort((a, b) => a.localeCompare(b, 'zh'))
fs.writeFileSync(path.join(__dirname, 'phrase-keys.json'), JSON.stringify(arr, null, 2), 'utf8')
console.log('changed', changed, 'keys', arr.length)
