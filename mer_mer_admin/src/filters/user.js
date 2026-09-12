// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
import i18n from '@/i18n';
import { getLocalizedName } from '@/utils/localizedName';

export function levelFilter(status) {
  if (!status) {
    return '';
  }
  let arrayList = JSON.parse(localStorage.getItem('levelKey'));
  if (!arrayList) return '';
  let array = arrayList.filter((item) => status === item.id);
  if (array.length) {
    return getLocalizedName(array[0], i18n.locale);
  }
  return '';
}

export function registerTypeFilter(status) {
  const statusMap = {
    wechat: i18n.t('user.registerWechat'),
    routine: i18n.t('user.registerRoutine'),
    h5: i18n.t('user.registerH5'),
    iosWx: i18n.t('user.registerIosWx'),
    androidWx: i18n.t('user.registerAndroidWx'),
    ios: i18n.t('user.registerIos'),
  };
  return statusMap[status];
}

export function filterIsPromoter(status) {
  const statusMap = {
    true: i18n.t('user.promoter'),
    false: i18n.t('user.normalUser'),
  };
  return statusMap[status];
}

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
