/**
 * Wrap remaining mixed Chinese in vue templates + loadTitle display + toast strings.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SKIP_DIR = new Set(['node_modules', 'uni_modules', 'unpackage', 'static', 'i18n'])

function walk(dir, acc, pred) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!SKIP_DIR.has(ent.name)) walk(p, acc, pred)
    } else if (pred(ent.name)) acc.push(p)
  }
  return acc
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function wrapZhRuns(s) {
  return s.replace(/[\u4e00-\u9fff][^\{\}<]*?[\u4e00-\u9fff]|[\u4e00-\u9fff]+/g, (zh) => {
    const t = zh.replace(/\s+/g, ' ').trim()
    if (!t || t.length > 40) return zh
    if (t.includes('$t(') || t.includes('{{')) return zh
    return `{{$t('${esc(t)}')}}`
  })
}

function wrapQuotedZh(expr) {
  return expr.replace(/(['"])([\u4e00-\u9fff][^'"]{0,50})\1/g, (m, q, zh) => {
    if (m.includes('$t(')) return m
    return `$t('${esc(zh)}')`
  }).replace(/`([^`]*[\u4e00-\u9fff][^`]*)`/g, (m, inner) => {
    if (m.includes('$t(')) return m
    const next = inner.replace(/([\u4e00-\u9fff][^\$\{\}]{0,20}[\u4e00-\u9fff]|[\u4e00-\u9fff]+)/g, (zh) => {
      const t = zh.trim()
      if (!t || t.includes('$t')) return zh
      return `\${$t('${esc(t)}')}`
    })
    return '`' + next + '`'
  })
}

function wrapTemplate(tmpl) {
  tmpl = tmpl.replace(/>([^<>]+)</g, (m, inner) => {
    if (!/[\u4e00-\u9fff]/.test(inner)) return m
    if (inner.includes('$t(') && !/\{\{[^}]*['"][\u4e00-\u9fff]/.test(inner) && !/[\u4e00-\u9fff][^{]*\{\{/.test(inner) && !/\}\}[^}]*[\u4e00-\u9fff]/.test(inner)) {
      return m
    }
    const parts = inner.split(/(\{\{[\s\S]*?\}\})/)
    const out = parts.map((part) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const expr = part.slice(2, -2)
        if (!/[\u4e00-\u9fff]/.test(expr)) return part
        if (/\$t\s*\(\s*['"]/.test(expr) && !/(['"])[\u4e00-\u9fff]/.test(expr.replace(/\$t\s*\(\s*(['"])[\u4e00-\u9fff][^'"]*\1/g, ''))) {
          return '{{' + wrapQuotedZh(expr) + '}}'
        }
        return '{{' + wrapQuotedZh(expr) + '}}'
      }
      if (!/[\u4e00-\u9fff]/.test(part)) return part
      return wrapZhRuns(part)
    }).join('')
    return '>' + out + '<'
  })

  tmpl = tmpl.replace(/\{\{\s*loadTitle\s*\}\}/g, '{{$t(loadTitle)}}')
  tmpl = tmpl.replace(/([?:\s])loadTitle(\s*[:}])/g, (m, a, b) => {
    if (m.includes('$t(loadTitle)')) return m
    return `${a}$t(loadTitle)${b}`
  })
  tmpl = tmpl.replace(/\?loadTitle:/g, '?$t(loadTitle):')
  tmpl = tmpl.replace(/\? loadTitle:/g, '? $t(loadTitle):')
  return tmpl
}

function wrapScriptToasts(script) {
  const wrapField = (src) => src.replace(
    /(\b(?:title|content|confirmText|cancelText)\s*:\s*)(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\2/g,
    (m, pre, q, zh) => {
      if (m.includes('$t(') || m.includes('this.$t') || m.includes("t('")) return m
      return `${pre}this.$t('${esc(zh)}')`
    }
  )
  script = script.replace(/uni\.showToast\(\s*\{[\s\S]{0,200}?title:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, (m) => wrapField(m))
  script = script.replace(/uni\.showModal\(\s*\{[\s\S]{0,400}?\}\s*\)/g, (m) => {
    if (!/[\u4e00-\u9fff]/.test(m) || m.includes('$t(')) return m
    return wrapField(m)
  })
  script = script.replace(/(?:\$util\.)?Tips\(\s*\{[\s\S]{0,200}?title:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, (m) => wrapField(m))
  return script
}

const keys = new Set()
function collect(text) {
  const re = /\$t\(\s*'((?:\\'|[^'])+)'/g
  let m
  while ((m = re.exec(text))) keys.add(m[1].replace(/\\'/g, "'"))
}

let changed = 0
for (const f of walk(ROOT, [], (n) => n.endsWith('.vue'))) {
  const src = fs.readFileSync(f, 'utf8')
  const parts = src.split(/(<template[\s\S]*?<\/template>)/i)
  let out = ''
  for (const chunk of parts) {
    if (/^<template/i.test(chunk)) out += wrapTemplate(chunk)
    else if (chunk.includes('<script')) out += wrapScriptToasts(chunk)
    else out += chunk
  }
  collect(out)
  if (out !== src) {
    fs.writeFileSync(f, out, 'utf8')
    changed++
  }
}

for (const f of walk(ROOT, [], (n) => n.endsWith('.js') && n !== 'echarts.min.js')) {
  if (f.includes(`${path.sep}i18n${path.sep}`)) continue
  let src = fs.readFileSync(f, 'utf8')
  if (!/[\u4e00-\u9fff]/.test(src)) continue
  let next = wrapScriptToasts(src.replace(/this\.\$t\(/g, 'this.$t('))
  next = next.replace(
    /(\b(?:title|content)\s*:\s*)(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\2/g,
    (m, pre, q, zh, offset, whole) => {
      const head = whole.slice(Math.max(0, offset - 80), offset)
      if (!/showToast|showModal|Tips\(/.test(head)) return m
      if (m.includes('$t(') || m.includes("t('")) return m
      const isModule = /export |import /.test(whole.slice(0, 200)) || head.includes('function ')
      const call = isModule ? `t('${esc(zh)}')` : `this.$t('${esc(zh)}')`
      return `${pre}${call}`
    }
  )
  collect(next)
  if (next !== src) {
    fs.writeFileSync(f, next, 'utf8')
    changed++
  }
}

const keyFile = path.join(__dirname, 'phrase-keys.json')
const prev = JSON.parse(fs.readFileSync(keyFile, 'utf8'))
prev.forEach((k) => keys.add(k))
const arr = [...keys].filter((k) => /[\u4e00-\u9fff]/.test(k)).sort((a, b) => a.localeCompare(b, 'zh'))
fs.writeFileSync(keyFile, JSON.stringify(arr, null, 2), 'utf8')
console.log('changed', changed, 'keys', arr.length)
