// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

//小程序 微信过滤器
import Cookies from 'js-cookie';
import i18n from '@/i18n';
/**
 * @description 小程序所属类目
 */
export function wxCategoryFilter(status) {
  if (!status) {
    return '';
  }
  if (!Cookies.get('WxCategory')) {
    return;
  }
  let arrayList = JSON.parse(Cookies.get('WxCategory'));
  if (arrayList.filter((item) => Number(status) === Number(item.id)).length < 1) {
    return '';
  }
  return arrayList.filter((item) => Number(status) === Number(item.id))[0].name;
}

/**
 * @description 小程序模板类型
 */
export function wxTypeFilter(status) {
  const statusMap = {
    2: i18n.t('wx.oneTimeSubscribe'),
    3: i18n.t('wx.longTermSubscribe'),
  };
  return statusMap[status];
}
