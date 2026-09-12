/**
 * Scan vue/js for Chinese UI chrome not wrapped by $t/t/this.$t.
 * Skips comments, i18n packs, uni_modules.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SKIP_DIR = new Set(['node_modules', 'uni_modules', 'unpackage', 'static', 'i18n'])
const SKIP_FILE = new Set(['echarts.min.js'])

function walk(dir, acc, exts) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!SKIP_DIR.has(ent.name)) walk(p, acc, exts)
    } else if (exts.some((e) => ent.name.endsWith(e)) && !SKIP_FILE.has(ent.name)) acc.push(p)
  }
  return acc
}

function stripComments(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

const hits = []

function add(file, kind, snippet) {
  const t = snippet.replace(/\s+/g, ' ').trim().slice(0, 120)
  if (!t) return
  hits.push({ file: path.relative(ROOT, file).replace(/\\/g, '/'), kind, t })
}

for (const f of walk(ROOT, [], ['.vue'])) {
  const src = fs.readFileSync(f, 'utf8')
  const parts = src.split(/(<template[\s\S]*?<\/template>)/i)
  for (const chunk of parts) {
    if (!/^<template/i.test(chunk)) continue
    const tmpl = stripComments(chunk)
    tmpl.replace(/>([^<>]+)</g, (m, inner) => {
      if (!/[\u4e00-\u9fff]/.test(inner)) return m
      if (inner.includes('$t(')) return m
      const plain = inner.replace(/\{\{[\s\S]*?\}\}/g, '')
      if (!/[\u4e00-\u9fff]/.test(plain) && inner.includes('{{')) {
        // mixed: 中文{{expr}}
        if (/[\u4e00-\u9fff]/.test(inner)) add(f, 'mixed-text', inner)
        return m
      }
      if (/[\u4e00-\u9fff]/.test(plain)) add(f, 'text', inner)
      return m
    })
    tmpl.replace(/\{\{\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, (m) => {
      if (!m.includes('$t(')) add(f, 'mustache-str', m)
      return m
    })
    tmpl.replace(/\s(?:placeholder|navTitle|title|label|confirmText|cancelText|headerTitle|content|emptyText|loadmoreText|nomoreText)=(["'])([^"']*[\u4e00-\u9fff][^"']*)\1/g, (m) => {
      if (!m.includes('$t')) add(f, 'attr', m)
      return m
    })
  }
  const si = src.search(/<script/i)
  if (si >= 0) {
    let script = src.slice(si)
    const ei = script.search(/<\/script>/i)
    if (ei > 0) script = script.slice(0, ei)
    script = stripComments(script)
    const toastRe = /(uni\.showToast|uni\.showModal|Tips|\$util\.Tips)\s*\(\s*\{[\s\S]{0,280}?(title|content|confirmText|cancelText)\s*:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\3/g
    let m
    while ((m = toastRe.exec(script))) {
      if (!m[0].includes('$t(') && !m[0].includes("t('")) add(f, 'toast', m[4])
    }
    script.replace(/(name|navTitle|title|label|text|tip|emptyText|loadTitle|loadendText)\s*:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]{0,40})\2/g, (mm, k, q, zh) => {
      if (zh.length > 30) return mm
      add(f, 'data-' + k, zh)
      return mm
    })
  }
}

const byKind = {}
for (const h of hits) {
  byKind[h.kind] = (byKind[h.kind] || 0) + 1
}
const uniqText = [...new Set(hits.filter((h) => h.kind === 'text' || h.kind === 'mixed-text').map((h) => h.t))]
fs.writeFileSync(path.join(__dirname, 'scan-unwrapped.json'), JSON.stringify({ byKind, hits, uniqText }, null, 2), 'utf8')
console.log('hits', hits.length, byKind)
console.log('uniq mixed/text', uniqText.length)
uniqText.slice(0, 80).forEach((t) => console.log(' -', t))
