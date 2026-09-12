// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
import i18n from '@/i18n';

export function paidFilter(status) {
  const statusMap = {
    true: i18n.t('order.paid'),
    false: i18n.t('order.unpaid'),
  };
  return statusMap[status];
}

export function orderStatusFilter(status) {
  const statusMap = {
    0: i18n.t('order.pendingPayment'),
    1: i18n.t('order.pendingShipment'),
    2: i18n.t('order.partialShipment'),
    3: i18n.t('order.awaitingVerification'),
    4: i18n.t('order.waitingReceipt'),
    5: i18n.t('order.received'),
    6: i18n.t('order.completed'),
    9: i18n.t('common.cancelled'),
  };
  return statusMap[status];
}

export function orderRefundStatusFilter(status) {
  const statusMap = {
    0: i18n.t('order.notRefunded'),
    1: i18n.t('order.refundApplying'),
    2: i18n.t('order.partialRefund'),
    3: i18n.t('order.refunded'),
  };
  return statusMap[status];
}

export function refundStatusFilter(status) {
  const statusMap = {
    0: i18n.t('order.pendingAudit'),
    1: i18n.t('order.merchantRejected'),
    2: i18n.t('order.refunding'),
    3: i18n.t('order.refundSuccess'),
    4: i18n.t('order.userReturning'),
    5: i18n.t('order.merchantAwaitingReceipt'),
    6: i18n.t('order.revoked'),
  };
  return statusMap[status];
}

export function payTypeFilter(status) {
  const statusMap = {
    weixin: i18n.t('order.wechat'),
    alipay: i18n.t('order.alipay'),
    yue: i18n.t('order.balance'),
    '': '-',
  };
  return statusMap[status];
}

export function orderTypeFilter(status) {
  const statusMap = {
    0: i18n.t('order.normalOrder'),
    1: i18n.t('order.spikeOrder'),
    2: i18n.t('order.groupBuyOrder'),
  };
  return statusMap[status];
}

export function shippingTypeFilter(status) {
  const statusMap = {
    1: i18n.t('order.merchantDelivery'),
    2: i18n.t('order.storePickup'),
    3: i18n.t('order.virtualShipment'),
  };
  return statusMap[status];
}
