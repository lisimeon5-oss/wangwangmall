// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
import i18n from '@/i18n';

export function transactionTypeFilter(status) {
  const statusMap = {
    pay_order: i18n.t('finance.orderPay'),
    refund_order: i18n.t('finance.orderRefund'),
  };
  return statusMap[status];
}

export function transferTypeFilter(status) {
  const statusMap = {
    bank: i18n.t('finance.bankCard'),
    alipay: i18n.t('order.alipay'),
    wechat: i18n.t('order.wechat'),
  };
  return statusMap[status];
}
