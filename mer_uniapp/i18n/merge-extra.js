const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, 'phrases')

function load(name) {
  const txt = fs.readFileSync(path.join(dir, name), 'utf8').replace(/^export default\s*/, '')
  return JSON.parse(txt)
}
function save(name, obj) {
  fs.writeFileSync(path.join(dir, name), 'export default ' + JSON.stringify(obj, null, 2) + '\n')
}

const extraEn = {
  '领取后{n}天内可用': 'Valid for {n} days after claiming',
  '登录提示': 'Sign-in',
  '登录以后可体验商城完整功能': 'Sign in to use all features',
  '请正确配置公众号后使用！': 'Please configure the official account first',
  '获取当前定位遇到困难，如需定位请开启权限': 'Location failed. Enable permission to continue',
  '访问位置被拒绝': 'Location permission denied',
  '取消选择': 'Selection cancelled',
  '您已拒绝导入微信地址权限': 'WeChat address permission denied',
  '已取消！': 'Cancelled',
  '首页': 'Home',
  '领券中心': 'Coupon center',
  '拼团活动': 'Group buy',
  '热门推荐': 'Recommended',
  '列表': 'List',
  '会员购买记录': 'Membership orders',
  '添加地址': 'Add address',
  '地址管理': 'Addresses',
  '订单核销': 'Verify order',
  '核销订单': 'Verified orders',
  '核销结果': 'Verification result',
  '商品管理': 'Products',
  '工作台': 'Workbench',
  '销售额统计': 'Sales stats',
  '立即退款': 'Refund now',
  '内容发布': 'Create post',
  '搜索页面': 'Search',
  '逛逛短视频': 'Short videos',
  '我的关注': 'Following',
  '评价列表': 'Reviews',
  '经验值明细': 'XP history',
  '商品评价': 'Write a review',
  '商品评分': 'Ratings',
  '等级规则说明': 'Level rules',
  '资讯详情': 'Article',
  '资讯': 'News',
  '提交订单': 'Checkout',
  '我的订单': 'My orders',
  '支付结果': 'Payment result',
  '售后详情': 'After-sale details',
  '售后列表': 'After-sales',
  '我的等级': 'My level',
  '收藏店铺': 'Favorite stores',
  '商品分类': 'Categories',
  '商户详情': 'Store details',
  '商户首页': 'Store home',
  '登录': 'Sign in',
  '推广人列表': 'Referrers',
  '商户入驻': 'Become a merchant',
  '账单明细': 'Bills',
  '个人资料': 'Profile',
  '我的账户': 'My account',
  '余额充值': 'Top up',
  '修改手机号': 'Change phone',
  '修改密码': 'Change password',
  '个人信息': 'Profile',
  '签到说明': 'Check-in rules',
  '佣金转入': 'Transfer commission',
  '分销海报': 'Referral poster',
  '我的推广': 'My referrals',
  '客服': 'Support',
  '逛逛': 'Discover',
  '个人中心': 'Profile'
}

const extraTh = {
  '领取后{n}天内可用': 'รับแล้วใช้ได้ {n} วัน',
  '首页': 'หน้าหลัก', '购物车': 'ตะกร้า', '分类': 'หมวดหมู่', '我的': 'ของฉัน',
  '登录': 'เข้าสู่ระบบ', '搜索': 'ค้นหา', '确认': 'ยืนยัน', '取消': 'ยกเลิก',
  '商品详情': 'สินค้า', '我的订单': 'คำสั่งซื้อ', '提交订单': 'สั่งซื้อ',
  '待付款': 'รอชำระ', '待发货': 'รอจัดส่ง', '待收货': 'รอรับของ', '全部': 'ทั้งหมด'
}

const extraMy = {
  '领取后{n}天内可用': 'ရယူပြီး {n} ရက် သုံးနိုင်',
  '首页': 'ပင်မ', '购物车': 'စျေးခြင်း', '分类': 'အမျိုးအစား', '我的': 'ကျွန်ုပ်',
  '登录': 'ဝင်မည်', '搜索': 'ရှာဖွေ', '确认': 'အတည်ပြု', '取消': 'ပယ်ဖျက်',
  '商品详情': 'ပစ္စည်း', '我的订单': 'အော်ဒါများ', '提交订单': 'အော်ဒါတင်',
  '待付款': 'ပေးရန်', '待发货': 'ပို့ရန်', '待收货': 'လက်ခံရန်', '全部': 'အားလုံး'
}

const zh = load('zh-cn.js')
const en = load('en.js')
const th = load('th.js')
const my = load('my.js')

Object.keys(extraEn).forEach((k) => {
  zh[k] = k
  if (!en[k] || en[k] === k) en[k] = extraEn[k]
})
Object.keys(extraTh).forEach((k) => { th[k] = extraTh[k] })
Object.keys(extraMy).forEach((k) => { my[k] = extraMy[k] })
Object.keys(en).forEach((k) => {
  if (!th[k]) th[k] = extraTh[k] || en[k]
  if (!my[k]) my[k] = extraMy[k] || en[k]
})

save('zh-cn.js', zh)
save('en.js', en)
save('th.js', th)
save('my.js', my)
console.log('merged', Object.keys(en).length)
