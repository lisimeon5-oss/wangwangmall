// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

//订单过滤器
import i18n from '@/i18n';

/**
 * @description 支付状态
 */
export function paidFilter(status) {
  const statusMap = {
    true: i18n.t('order.paid'),
    false: i18n.t('order.unpaid'),
  };
  return statusMap[status];
}

/**
 * @description 订单状态
 * 2,已收货，待评价
 */
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

/**
 * @description 订单中的退款状态
 * 2,已收货，待评价
 */
export function orderRefundStatusFilter(status) {
  const statusMap = {
    0: i18n.t('order.notRefunded'),
    1: i18n.t('order.refundApplying'),
    2: i18n.t('order.partialRefund'),
    3: i18n.t('order.refunded'),
  };
  return statusMap[status];
}

/**
 * @description 退款单退款状态
 *
 */
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

/**
 * @description 支付方式
 */
export function payTypeFilter(status) {
  const statusMap = {
    weixin: i18n.t('order.wechat'),
    alipay: i18n.t('order.alipay'),
    yue: i18n.t('order.balance'),
    '': '-',
  };
  return statusMap[status];
}

/**
 * @description 订单类型
 */
export function orderTypeFilter(status) {
  const statusMap = {
    0: i18n.t('order.normalOrder'),
    1: i18n.t('order.spikeOrder'),
    2: i18n.t('order.groupBuyOrder'),
  };
  return statusMap[status];
}

/**
 * @description 订单类型
 */
export function shippingTypeFilter(status) {
  const statusMap = {
    1: i18n.t('order.merchantDelivery'),
    2: i18n.t('order.storePickup'),
    3: i18n.t('order.virtualShipment'),
  };
  return statusMap[status];
}
