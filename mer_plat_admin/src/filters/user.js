// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

//会员过滤器
import i18n from '@/i18n';
import { getLocalizedName } from '@/utils/localizedName';

/**
 * 用户注册类型
 */
export function registerTypeFilter(status) {
  const statusMap = {
    wechat: i18n.t('user.registerWechat'),
    routine: i18n.t('user.registerRoutine'),
    h5: 'H5',
    iosWx: i18n.t('user.registerIosWx'),
    androidWx: i18n.t('user.registerAndroidWx'),
    ios: 'ios',
  };
  return statusMap[status];
}

/**
 * 用户类型
 */
export function filterIsPromoter(status) {
  const statusMap = {
    true: i18n.t('user.promoter'),
    false: i18n.t('user.normalUser'),
  };
  return statusMap[status];
}

/**
 * 标签
 */
export function tagFilter(status) {
  if (!status) {
    return '-';
  }
  if (!localStorage.getItem('tagAllList')) return;
  let arr = JSON.parse(localStorage.getItem('tagAllList'));
  let obj = {};
  for (let i in arr) {
    obj[arr[i].id] = arr[i];
  }
  let strArr = status.split(',');
  let newArr = [];
  for (let item of strArr) {
    if (obj[item]) {
      newArr.push(getLocalizedName(obj[item], i18n.locale));
    }
  }
  return newArr.join(',');
}

/**
 * 会员权益
 */
export function filterMemberBenefits(status) {
  const statusMap = {
    experienceDoubling: i18n.t('user.benefitExperienceDoubling'),
    integralDoubling: i18n.t('user.benefitIntegralDoubling'),
    memberExclusivePrice: i18n.t('user.benefitMemberExclusivePrice'),
    exclusiveCustomer: i18n.t('user.benefitExclusiveCustomer'),
  };
  return statusMap[status];
}

/**
 * 会员权益
 */
export function filterMemberType(status) {
  const statusMap = {
    0: i18n.t('user.trial'),
    1: i18n.t('user.term'),
    2: i18n.t('user.permanent'),
  };
  return statusMap[status];
}

/**
 * 会员卡支付方式
 */
export function filterCardPayType(status) {
  const statusMap = {
    weixin: i18n.t('order.wechat'),
    alipay: i18n.t('order.alipay'),
    give: i18n.t('user.platformGift'),
    yue: i18n.t('order.balance'),
  };
  return statusMap[status];
}

/**
 * 会员卡类型
 */
export function filterCardType(status) {
  const statusMap = {
    0: i18n.t('user.trial'),
    1: i18n.t('user.term'),
    2: i18n.t('user.permanent'),
  };
  return statusMap[status];
}
/**
 * 移动端主题色
 */
export function filterTheme(status) {
  const statusMap = {
    0: '#e93323',
    1: '#fe5c2d',
    2: '#42ca4d',
    3: '#1ca5e9',
    4: '#ff448f',
  };
  return statusMap[status];
}
