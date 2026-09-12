// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
import i18n from '@/i18n';

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

export function roomReviewStatusFilter(status) {
  const statusMap = {
    0: i18n.t('product.platformPendingAudit'),
    1: i18n.t('product.platformAuditFailed'),
    2: i18n.t('product.wechatAuditFailed'),
    3: i18n.t('product.wechatAuditSuccess'),
  };
  return statusMap[status];
}

export function roomShowFilter(status) {
  const statusMap = {
    0: i18n.t('common.open'),
    1: i18n.t('common.close'),
  };
  return statusMap[status];
}

export function priceTypeFilter(status) {
  const statusMap = {
    1: i18n.t('product.fixedPrice'),
    2: i18n.t('product.priceRange'),
    3: i18n.t('product.discountPrice'),
  };
  return statusMap[status];
}

export function productTpyeFilter(status) {
  const statusMap = {
    0: i18n.t('product.typeNormal'),
    1: i18n.t('product.typeIntegral'),
    2: i18n.t('product.typeVirtual'),
    4: i18n.t('product.typeVideo'),
    5: i18n.t('product.typeCloudDisk'),
    6: i18n.t('product.typeCardPassword'),
  };
  return statusMap[status];
}
