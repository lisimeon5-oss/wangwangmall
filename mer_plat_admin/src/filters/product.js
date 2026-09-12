// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import i18n from '@/i18n';

/**
 * 审核状态
 */
export function auditStatusFilter(status) {
  const statusMap = {
    0: i18n.t('product.noAudit'),
    1: i18n.t('order.pendingAudit'),
    2: i18n.t('common.auditSuccess'),
    3: i18n.t('product.auditRejected'),
  };
  return statusMap[status];
}

/**
 * @description 视频号草稿商品微信审核状态
 */
export function editStatusFilter(status) {
  const statusMap = {
    '-1': i18n.t('product.violationOffShelf'),
    '-2': i18n.t('product.platformOffShelf'),
    '-3': i18n.t('product.merchantOffShelf'),
    1: i18n.t('product.notAudited'),
    2: i18n.t('common.auditing'),
    3: i18n.t('common.auditFailed'),
    4: i18n.t('common.auditSuccess'),
  };
  return statusMap[status];
}

/**
 * @description 视频号草稿商品平台审核状态
 */
export function platformStatusFilter(status) {
  const statusMap = {
    1: i18n.t('product.notAudited'),
    2: i18n.t('common.auditing'),
    3: i18n.t('common.auditFailed'),
    4: i18n.t('common.auditSuccess'),
  };
  return statusMap[status];
}

/**
 * @description 视频号正式商品状态
 */
export function videoStatusFilter(status) {
  const statusMap = {
    0: i18n.t('product.initialValue'),
    5: i18n.t('product.onShelf'),
    11: i18n.t('product.selfOffShelf'),
    13: i18n.t('product.violationSystemOffShelf'),
  };
  return statusMap[status];
}

/**
 * @description 视频号 微信商品类型资质类型
 */
export function productQualificationTypeFilter(status) {
  const statusMap = {
    0: i18n.t('product.notRequired'),
    1: i18n.t('product.required'),
    2: i18n.t('product.optional'),
    null: i18n.t('product.noRequirement'),
  };
  return statusMap[status];
}

/**
 * @description 直播商品审核状态
 */
export function liveReviewStatusFilter(status) {
  const statusMap = {
    0: i18n.t('product.merchantCreateWithdraw'),
    1: i18n.t('product.platformPendingReAudit'),
    2: i18n.t('product.platformApprovedWechatAuditing'),
    3: i18n.t('product.platformAuditFailed'),
    4: i18n.t('product.wechatAuditSuccess'),
    5: i18n.t('product.wechatAuditFailed'),
  };
  return statusMap[status];
}

/**
 * @description 直播状态
 */
export function broadcastStatusFilter(status) {
  const statusMap = {
    101: i18n.t('product.liveStreaming'),
    102: i18n.t('common.notStarted'),
    103: i18n.t('common.ended'),
    104: i18n.t('product.banned'),
    105: i18n.t('product.paused'),
    106: i18n.t('product.abnormal'),
    107: i18n.t('product.expiredOver'),
  };
  return statusMap[status];
}

/**
 * @description 直播间审核状态
 */
export function roomReviewStatusFilter(status) {
  const statusMap = {
    0: i18n.t('product.platformPendingAudit'),
    1: i18n.t('product.platformAuditFailed'),
    2: i18n.t('product.wechatAuditFailed'),
    3: i18n.t('product.wechatAuditSuccess'),
  };
  return statusMap[status];
}

/**
 * @description 直播间开启关闭状态
 */
export function roomShowFilter(status) {
  const statusMap = {
    1: i18n.t('common.open'),
    0: i18n.t('common.close'),
  };
  return statusMap[status];
}

/**
 * @description 直播商品价格类型
 */
export function priceTypeFilter(status) {
  const statusMap = {
    1: i18n.t('product.fixedPrice'),
    2: i18n.t('product.priceRange'),
    3: i18n.t('product.discountPrice'),
  };
  return statusMap[status];
}

/**
 * @description 商品类型
 */
export function productTpyeFilter(status) {
  const statusMap = {
    0: i18n.t('product.normalProduct'),
    1: i18n.t('product.integralProduct'),
    2: i18n.t('product.virtualProduct'),
    4: i18n.t('product.videoProduct'),
    5: i18n.t('product.cloudProduct'),
    6: i18n.t('product.cardKeyProduct'),
  };
  return statusMap[status];
}
