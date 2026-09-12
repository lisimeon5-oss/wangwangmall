// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

//财务过滤器
import i18n from '@/i18n';
/**
 * 资金流水 交易类型
 */
export function transactionTypeFilter(status) {
  const statusMap = {
    pay_order: i18n.t('finance.orderPay'),
    refund_order: i18n.t('finance.orderRefund'),
  };
  return statusMap[status];
}

/**
 * 结算类型
 */
export function closingTypeFilter(status) {
  const statusMap = {
    bank: i18n.t('finance.bankCard'),
    wechat: i18n.t('order.wechat'),
    alipay: i18n.t('order.alipay'),
  };
  return statusMap[status];
}
