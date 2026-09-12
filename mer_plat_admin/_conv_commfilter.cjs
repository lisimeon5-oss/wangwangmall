const fs = require('fs');
const p = 'src/filters/commFilter.js';
let s = fs.readFileSync(p, 'utf8');
const crlf = s.includes('\r\n');
if (crlf) s = s.replace(/\r\n/g, '\n');

const R = [
  ["import { formatDates } from '@/utils/index';", "import { formatDates } from '@/utils/index';\nimport i18n from '@/i18n';"],
  ["return value ? '是' : '否';", "return value ? i18n.t('common.yes') : i18n.t('common.no');"],
  ["return value ? '显示' : '不显示';", "return value ? i18n.t('common.show') : i18n.t('common.notShow');"],
  ["return value === '‘0’' ? '显示' : '不显示';", "return value === '‘0’' ? i18n.t('common.show') : i18n.t('common.notShow');"],
  ["return value ? '否' : '是';", "return value ? i18n.t('common.no') : i18n.t('common.yes');"],
  ["    text: '文字消息',\n    image: '图片消息',\n    news: '图文消息',\n    voice: '声音消息',", "    text: i18n.t('common.textMessage'),\n    image: i18n.t('common.imageMessage'),\n    news: i18n.t('common.newsMessage'),\n    voice: i18n.t('common.voiceMessage'),"],
  ["    1: '手动领取',\n    2: '新人券',\n    3: '赠送券',", "    1: i18n.t('common.couponManual'),\n    2: i18n.t('common.couponNewcomer'),\n    3: i18n.t('common.couponGift'),"],
  ["    false: '未支付',\n    true: '已支付',", "    false: i18n.t('order.unpaid'),\n    true: i18n.t('order.paid'),"],
  ["    bank: '银行卡',\n    alipay: '支付宝',\n    weixin: '微信',", "    bank: i18n.t('finance.bankCard'),\n    alipay: i18n.t('order.alipay'),\n    weixin: i18n.t('order.wechat'),"],
  ["    public: '微信公众号',\n    h5: '网页支付',\n    mini: '小程序',\n    wechatIos: '微信Ios',\n    wechatAndroid: '微信Android',\n    alipay: '支付宝',\n    alipayApp: '支付宝App',", "    public: i18n.t('common.publicAccount'),\n    h5: i18n.t('common.webPayment'),\n    mini: i18n.t('common.miniProgram'),\n    wechatIos: i18n.t('common.wechatIos'),\n    wechatAndroid: i18n.t('common.wechatAndroid'),\n    alipay: i18n.t('order.alipay'),\n    alipayApp: i18n.t('common.alipayApp'),"],
  ["    '-1': '已拒绝',\n    0: '审核中',\n    1: '已提现',", "    '-1': i18n.t('common.rejected'),\n    0: i18n.t('common.auditing'),\n    1: i18n.t('common.withdrawn'),"],
  ["    1: '进行中',\n    2: '未完成',\n    3: '已成功',", "    1: i18n.t('common.ongoing'),\n    2: i18n.t('common.incomplete'),\n    3: i18n.t('common.succeeded'),"],
  ["    1: '进行中',\n    2: '已成功',\n    3: '未完成',", "    1: i18n.t('common.ongoing'),\n    2: i18n.t('common.succeeded'),\n    3: i18n.t('common.incomplete'),"],
  ["    sms: '短信',\n    copy: '商品采集',\n    expr_query: '物流查询',\n    expr_dump: '电子面单打印',", "    sms: i18n.t('common.sms'),\n    copy: i18n.t('common.productCollection'),\n    expr_query: i18n.t('common.logisticsQuery'),\n    expr_dump: i18n.t('common.electronicWaybill'),"],
  ["    1: '订单创建',\n    2: '冻结期',\n    3: '完成',\n    4: '失效',", "    1: i18n.t('common.orderCreated'),\n    2: i18n.t('common.frozenPeriod'),\n    3: i18n.t('common.finish'),\n    4: i18n.t('common.expired'),"],
  ["    order: '订单',\n    refund: '退款',\n    sign: '签到',\n    system: '系统操作',", "    order: i18n.t('common.linkOrder'),\n    refund: i18n.t('common.linkRefund'),\n    sign: i18n.t('common.linkSign'),\n    system: i18n.t('common.linkSystem'),"],
  ["    orderNo: '订单号',\n    refundOrderNo: '退款单号',", "    orderNo: i18n.t('common.orderNo'),\n    refundOrderNo: i18n.t('order.refundOrderNo'),"],
  ["    0: '全部商品',\n    1: '指定商品',\n    2: '指定品牌',\n    3: '指定商品分类',\n    4: '指定商户',", "    0: i18n.t('common.allProducts'),\n    1: i18n.t('common.specifiedProducts'),\n    2: i18n.t('common.specifiedBrand'),\n    3: i18n.t('common.specifiedCategory'),\n    4: i18n.t('common.specifiedMerchant'),"],
  ["    0: '未开始',\n    1: '进行中',\n    2: '已结束',", "    0: i18n.t('common.notStarted'),\n    1: i18n.t('common.ongoing'),\n    2: i18n.t('common.ended'),"],
  ["    0: '待审核',\n    1: '已通过',\n    2: '已拒绝',", "    0: i18n.t('order.pendingAudit'),\n    1: i18n.t('common.approved'),\n    2: i18n.t('common.rejected'),"],
  ["    1: '开启',\n    2: '关闭',\n    3: '平台关闭',", "    1: i18n.t('common.open'),\n    2: i18n.t('common.close'),\n    3: i18n.t('common.platformClosed'),"],
  ["    0: '待审核',\n    1: '审核成功',\n    2: '审核失败',\n    3: '平台关闭',", "    0: i18n.t('order.pendingAudit'),\n    1: i18n.t('common.auditSuccess'),\n    2: i18n.t('common.auditFailed'),\n    3: i18n.t('common.platformClosed'),"],
];

for (const [a, b] of R) {
  if (!s.includes(a)) {
    console.error('NOT FOUND: ' + JSON.stringify(a.slice(0, 60)));
    process.exitCode = 1;
    continue;
  }
  s = s.split(a).join(b);
}
if (crlf) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(p, s);
console.log('done');
