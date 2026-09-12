const fs = require('fs')
const path = require('path')
const { EN, enOf } = require('./trans-core')

const ROOT = path.resolve(__dirname, '..')
const SKIP_DIR = new Set(['node_modules', 'uni_modules', 'unpackage', 'static', 'i18n'])

function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!SKIP_DIR.has(ent.name)) walk(p, acc)
    } else if (ent.name.endsWith('.vue') || (ent.name.endsWith('.js') && ent.name !== 'echarts.min.js')) acc.push(p)
  }
  return acc
}

const EXTRA_EN = {
  '人拼团成功': ' groups completed',
  '人团': '-person group',
  '已拼': 'Joined ',
  '份': ' pcs',
  '限量': 'Quota',
  '已抢': 'Sold ',
  '已有': '',
  '人兑换': ' redeemed',
  '商品直降': 'Save ',
  '铢可用': ' min. spend',
  '当前积分': 'Points ',
  '拼团成功': 'Group success',
  '永久': 'Permanent',
  '收货人': 'Recipient',
  '收货地址': 'Address',
  '售后单号': 'After-sale no.',
  '共': '',
  '件': ' pcs',
  '订单号': 'Order no.',
  '购买': 'Qty ',
  '件售后中': ' in after-sale',
  '件已退款': ' refunded',
  '件已退': ' refunded',
  '件可退': ' refundable',
  '件已发': ' shipped',
  '全选': 'Select all',
  '件商品': ' items',
  '当前订单已发': 'Shipped ',
  '个包裹': ' packages',
  '人关注': ' following',
  '用户提交退款申请': 'Customer requested a refund',
  '请您及时处理哦': 'please handle it soon',
  '您已同意此退款申请，等待用户退货中': 'Refund approved, waiting for return',
  '用户已经填写退货信息': 'Return info submitted',
  '请您耐心等待': 'please wait',
  '最多可购买': 'Max qty ',
  '张优惠券可选': ' coupons available',
  '有': '',
  '立送{n}元余额': 'Get ฿{n} bonus',
  'SVIP会员至{time}': 'SVIP until {time}',
  '显示更多': 'Load more',
  '没有了': 'No more',
  '加载更多': 'Load more',
  '万': 'w',
  '人关注': ' following',
  '密码': 'Password',
  '月': '/',
  '日': ' ',
  '号': '',
  '补签': 'Makeup',
  '签到': 'Check-in',
  '获取中': 'Loading',
  '成功': ' success'
}

function collectKeys() {
  const keys = new Set()
  const re = /\$t\(\s*'((?:\\'|[^'])+)'/g
  for (const f of walk(ROOT, [])) {
    if (f.includes(`${path.sep}i18n${path.sep}`)) continue
    const src = fs.readFileSync(f, 'utf8')
    let m
    while ((m = re.exec(src))) {
      const k = m[1].replace(/\\'/g, "'")
      if (/[\u4e00-\u9fff]/.test(k)) keys.add(k)
    }
  }
  return [...keys].sort((a, b) => a.localeCompare(b, 'zh'))
}

function loadPhrases(name) {
  const p = path.join(__dirname, 'phrases', name)
  const txt = fs.readFileSync(p, 'utf8').replace(/^export default\s*/, '')
  return JSON.parse(txt)
}

function savePhrases(name, obj) {
  const ordered = {}
  Object.keys(obj).sort((a, b) => a.localeCompare(b, 'zh')).forEach((k) => { ordered[k] = obj[k] })
  fs.writeFileSync(path.join(__dirname, 'phrases', name), 'export default ' + JSON.stringify(ordered, null, 2) + '\n')
}

const keys = collectKeys()
fs.writeFileSync(path.join(__dirname, 'phrase-keys.json'), JSON.stringify(keys, null, 2), 'utf8')

const zh = loadPhrases('zh-cn.js')
const en = loadPhrases('en.js')
const th = loadPhrases('th.js')
const my = loadPhrases('my.js')
let added = 0
keys.forEach((k) => {
  if (!Object.prototype.hasOwnProperty.call(zh, k)) zh[k] = k
  if (!Object.prototype.hasOwnProperty.call(en, k) || en[k] === k) {
    const v = Object.prototype.hasOwnProperty.call(EXTRA_EN, k) ? EXTRA_EN[k]
      : Object.prototype.hasOwnProperty.call(EN, k) ? EN[k]
      : enOf(k)
    if (!Object.prototype.hasOwnProperty.call(en, k) || (en[k] === k && v !== k)) {
      en[k] = v
      if (!Object.prototype.hasOwnProperty.call(th, k) || th[k] === k) th[k] = v
      if (!Object.prototype.hasOwnProperty.call(my, k) || my[k] === k) my[k] = v
      added++
    }
  } else {
    if (!Object.prototype.hasOwnProperty.call(th, k)) th[k] = en[k]
    if (!Object.prototype.hasOwnProperty.call(my, k)) my[k] = en[k]
  }
})
savePhrases('zh-cn.js', zh)
savePhrases('en.js', en)
savePhrases('th.js', th)
savePhrases('my.js', my)
console.log('keys', keys.length, 'newly filled', added)
