// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

/**
 *优惠券 类型
 */
import i18n from '@/i18n';

export function couponCategory(status) {
  const statusMap = {
    1: i18n.t('marketing.shop'),
    2: i18n.t('marketing.product'),
    3: i18n.t('marketing.general'),
    4: i18n.t('marketing.category'),
    5: i18n.t('marketing.brand'),
    6: i18n.t('marketing.crossStore'),
  };
  return statusMap[status];
}

/**
 * 优惠券领取方式
 */
export function receiveType(val) {
  const typeObj = {
    1: i18n.t('marketing.userReceive'),
    2: i18n.t('user.productGiftCoupon'),
    3: i18n.t('marketing.platformActivityUse'),
  };
  return typeObj[val];
}
