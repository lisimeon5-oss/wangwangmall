const fs = require('fs');
const p = 'src/filters/product.js';
let s = fs.readFileSync(p, 'utf8');
const crlf = s.includes('\r\n');
if (crlf) s = s.replace(/\r\n/g, '\n');

const R = [
  ["/**\n * 审核状态\n */\nexport function auditStatusFilter", "import i18n from '@/i18n';\n\n/**\n * 审核状态\n */\nexport function auditStatusFilter"],
  ["    0: '无需审核',\n    1: '待审核',\n    2: '审核成功',\n    3: '审核拒绝',", "    0: i18n.t('product.noAudit'),\n    1: i18n.t('order.pendingAudit'),\n    2: i18n.t('common.auditSuccess'),\n    3: i18n.t('product.auditRejected'),"],
  ["    '-1': '违规/风控系统下',\n    '-2': '平台下架',\n    '-3': '商家下架',\n    1: '未审核',\n    2: '审核中',\n    3: '审核失败',\n    4: '审核成功',", "    '-1': i18n.t('product.violationOffShelf'),\n    '-2': i18n.t('product.platformOffShelf'),\n    '-3': i18n.t('product.merchantOffShelf'),\n    1: i18n.t('product.notAudited'),\n    2: i18n.t('common.auditing'),\n    3: i18n.t('common.auditFailed'),\n    4: i18n.t('common.auditSuccess'),"],
  ["    1: '未审核',\n    2: '审核中',\n    3: '审核失败',\n    4: '审核成功',", "    1: i18n.t('product.notAudited'),\n    2: i18n.t('common.auditing'),\n    3: i18n.t('common.auditFailed'),\n    4: i18n.t('common.auditSuccess'),"],
  ["    0: '初始值',\n    5: '上架',\n    11: '自主下架',\n    13: '违规下架/风控系统下架',", "    0: i18n.t('product.initialValue'),\n    5: i18n.t('product.onShelf'),\n    11: i18n.t('product.selfOffShelf'),\n    13: i18n.t('product.violationSystemOffShelf'),"],
  ["    0: '不需要',\n    1: '必填',\n    2: '选填',\n    null: '无要求',", "    0: i18n.t('product.notRequired'),\n    1: i18n.t('product.required'),\n    2: i18n.t('product.optional'),\n    null: i18n.t('product.noRequirement'),"],
  ["    0: '商户创建/撤回',\n    1: '平台待审核/商户重新提交审核',\n    2: '平台审核通过/微信审核中',\n    3: '平台审核失败',\n    4: '微信审核成功',\n    5: '微信审核失败',", "    0: i18n.t('product.merchantCreateWithdraw'),\n    1: i18n.t('product.platformPendingReAudit'),\n    2: i18n.t('product.platformApprovedWechatAuditing'),\n    3: i18n.t('product.platformAuditFailed'),\n    4: i18n.t('product.wechatAuditSuccess'),\n    5: i18n.t('product.wechatAuditFailed'),"],
  ["    101: '直播中',\n    102: '未开始',\n    103: '已结束',\n    104: '禁播',\n    105: '暂停',\n    106: '异常',\n    107: '已过期',", "    101: i18n.t('product.liveStreaming'),\n    102: i18n.t('common.notStarted'),\n    103: i18n.t('common.ended'),\n    104: i18n.t('product.banned'),\n    105: i18n.t('product.paused'),\n    106: i18n.t('product.abnormal'),\n    107: i18n.t('product.expiredOver'),"],
  ["    0: '平台待审核',\n    1: '平台审核失败',\n    2: '微信审核失败',\n    3: '微信审核成功',", "    0: i18n.t('product.platformPendingAudit'),\n    1: i18n.t('product.platformAuditFailed'),\n    2: i18n.t('product.wechatAuditFailed'),\n    3: i18n.t('product.wechatAuditSuccess'),"],
  ["    1: '开启',\n    0: '关闭',", "    1: i18n.t('common.open'),\n    0: i18n.t('common.close'),"],
  ["    1: '一口价',\n    2: '价格区间',\n    3: '折扣价',", "    1: i18n.t('product.fixedPrice'),\n    2: i18n.t('product.priceRange'),\n    3: i18n.t('product.discountPrice'),"],
  ["    0: '普通商品',\n    1: '积分商品',\n    2: '虚拟商品',\n    4: '视频号',\n    5: '云盘商品',\n    6: '卡密商品',", "    0: i18n.t('product.normalProduct'),\n    1: i18n.t('product.integralProduct'),\n    2: i18n.t('product.virtualProduct'),\n    4: i18n.t('product.videoProduct'),\n    5: i18n.t('product.cloudProduct'),\n    6: i18n.t('product.cardKeyProduct'),"],
];

for (const [a, b] of R) {
  if (!s.includes(a)) {
    console.error('NOT FOUND: ' + JSON.stringify(a.slice(0, 70)));
    process.exitCode = 1;
    continue;
  }
  s = s.split(a).join(b);
}
if (crlf) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(p, s);
console.log('done');
