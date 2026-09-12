// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
import Cookies from 'js-cookie';
import i18n from '@/i18n';

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

export function wxTypeFilter(status) {
  const statusMap = {
    2: i18n.t('wx.oneTimeSubscribe'),
    3: i18n.t('wx.longTermSubscribe'),
  };
  return statusMap[status];
}
