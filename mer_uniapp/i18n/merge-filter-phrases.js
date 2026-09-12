const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, 'phrases')
function load(n) {
  return JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8').replace(/^export default\s*/, ''))
}
function save(n, o) {
  fs.writeFileSync(path.join(dir, n), 'export default ' + JSON.stringify(o, null, 2) + '\n')
}
const extraEn = {
  '满': 'Min. ',
  '可用': ' usable',
  '仅限指定': 'Only for ',
  '优惠券将发放至个人账户，可在“我的优惠券”查看': 'Coupons are sent to your account. Find them in My Coupons',
  '管理员创建': 'Created by admin',
  '商户入驻申请': 'Merchant application',
  '非自营': 'Non-official',
  '商家审核中': 'Merchant reviewing',
  '商家已拒绝': 'Merchant declined',
  '商家已同意，退款中': 'Approved, refunding',
  '退款成功': 'Refunded',
  '商家已同意': 'Merchant approved',
  '等待商家收货并退款': 'Waiting for merchant to receive and refund',
  '撤销申请': 'Cancelled request',
  '部分发货': 'Partially shipped',
  '微信': 'WeChat',
  '支付宝': 'Alipay',
  '线下': 'Offline',
  '平台赠送': 'Gifted',
  '抢购中': 'On sale',
  '即将开始': 'Starting soon',
  '明日预告': 'Tomorrow',
  '基础': 'Normal',
  '审核通过': 'Approved',
  '退款前请与商家协商一致,有助于更好的处理售后问题。': 'Please confirm with the merchant before requesting a refund.',
  '若有异议，请联系平台处理。': 'Contact the platform if you disagree.',
  '商家已同意您的退款,若您已收到商品请您尽快退回，7天内未发出,系统自动撤销售后单，感谢您对我们的支持!': 'Refund approved. Please return the goods within 7 days.',
  '商家已为您退款，若商家已寄出商品请您尽快寄回，感谢您对我们的支持!': 'Refund completed. Please return shipped goods promptly.',
  '商家确认收货后进行退款,请您耐心等待，若有异议请联系平台客服处理!': 'Refund after the merchant receives the return.',
  '此退款单已撤销，若对此订单存在疑问，请联系商家协商处理。': 'This refund was cancelled. Contact the merchant if needed.'
}
const extraTh = {
  '满': 'ขั้นต่ำ ',
  '可用': ' ใช้ได้',
  '仅限指定': 'เฉพาะ ',
  '优惠券将发放至个人账户，可在“我的优惠券”查看': 'คูปองถูกส่งเข้าบัญชีแล้ว ดูได้ที่คูปองของฉัน'
}
const extraMy = {
  '满': 'အနည်းဆုံး ',
  '可用': ' သုံးနိုင်',
  '仅限指定': 'သတ်မှတ် ',
  '优惠券将发放至个人账户，可在“我的优惠券”查看': 'ကူပွန်ကို အကောင့်သို့ ပို့ပြီးပါပြီ'
}
const zh = load('zh-cn.js')
const en = load('en.js')
const th = load('th.js')
const my = load('my.js')
Object.keys(extraEn).forEach((k) => {
  zh[k] = k
  en[k] = extraEn[k]
  if (!th[k] || th[k] === extraEn[k] || th[k] === k) th[k] = extraTh[k] || extraEn[k]
  if (!my[k] || my[k] === extraEn[k] || my[k] === k) my[k] = extraMy[k] || extraEn[k]
})
save('zh-cn.js', zh)
save('en.js', en)
save('th.js', th)
save('my.js', my)
console.log('phrases', Object.keys(en).length)
