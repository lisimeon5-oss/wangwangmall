/**
 * Wrap Chinese UI in vue templates / toast with $t('中文').
 */
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

function wrapAttrs(tmpl) {
  return tmpl.replace(
    /(\s)(placeholder|navTitle|title|label|confirmText|cancelText|headerTitle|content)=(["'])([^"']*[\u4e00-\u9fff][^"']*)\3/g,
    (m, sp, attr, q, val) => {
      if (val.includes('$t(') || val.includes('{{')) return m
      return `${sp}:${attr}="$t('${esc(val)}')"`
    }
  )
}

function wrapTextNodes(tmpl) {
  return tmpl.replace(/>([^<>]+)</g, (m, inner) => {
    if (!/[\u4e00-\u9fff]/.test(inner)) return m
    if (inner.includes('$t(') || inner.includes('{{')) return m
    if (inner.includes('//') || inner.includes('/*')) return m
    const trimmed = inner.replace(/\s+/g, ' ').trim()
    if (!trimmed || trimmed.length > 40) return m
    if (!/^[\u4e00-\u9fff0-9A-Za-z\/\+\-\_\%\.\,:：；、，。！？~《》()（）\s]+$/.test(trimmed)) return m
    const lead = inner.match(/^\s*/)[0]
    const trail = inner.match(/\s*$/)[0]
    return `>${lead}{{$t('${esc(trimmed)}')}}${trail}<`
  })
}

function wrapScript(script) {
  const replacer = (m, quote, zh) => {
    if (!zh || zh.includes('$t(') || zh.includes('this.$t')) return m
    return m.replace(quote + zh + quote, `this.$t('${esc(zh)}')`)
  }
  script = script.replace(/uni\.showToast\(\s*\{[\s\S]{0,80}?title:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, replacer)
  script = script.replace(/uni\.showModal\(\s*\{[\s\S]{0,120}?title:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, replacer)
  script = script.replace(/uni\.showModal\(\s*\{[\s\S]{0,200}?content:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, replacer)
  script = script.replace(/\$util\.Tips\(\s*\{[\s\S]{0,80}?title:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, replacer)
  script = script.replace(/Tips\(\s*\{[\s\S]{0,80}?title:\s*(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, replacer)
  return script
}

function collectKeys(text, set) {
  const re = /\$t\(\s*'((?:\\'|[^'])+)'/g
  let m
  while ((m = re.exec(text))) {
    const k = m[1].replace(/\\'/g, "'")
    if (/[\u4e00-\u9fff]/.test(k)) set.add(k)
  }
}

const files = walk(ROOT, [])
const keys = new Set()
let changed = 0
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8')
  const parts = src.split(/(<template[\s\S]*?<\/template>)/i)
  let out = ''
  for (let i = 0; i < parts.length; i++) {
    let chunk = parts[i]
    if (/^<template/i.test(chunk)) {
      chunk = wrapAttrs(chunk)
      chunk = wrapTextNodes(chunk)
    } else if (chunk.includes('<script')) {
      chunk = wrapScript(chunk)
    }
    out += chunk
  }
  collectKeys(out, keys)
  if (out !== src) {
    fs.writeFileSync(f, out, 'utf8')
    changed++
  }
}

const arr = [...keys].sort((a, b) => a.localeCompare(b, 'zh'))
fs.writeFileSync(path.join(__dirname, 'phrase-keys.json'), JSON.stringify(arr, null, 2), 'utf8')
console.log('vue files', files.length, 'changed', changed, 'keys', arr.length)
