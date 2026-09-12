// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
import * as constants from '@/utils/constants.js';
import { formatDates } from '@/utils/index';
import i18n from '@/i18n';
import { getLocalizedName } from '@/utils/localizedName';

export function filterEmpty(val) {
  let _result = '-';
  if (!val) {
    return _result;
  }
  _result = val;
  return _result;
}

export function formatDate(time) {
  if (time !== 0) {
    const date = new Date(time * 1000);
    return formatDates(date, 'yyyy-MM-dd hh:mm');
  }
}

export function filterYesOrNo(value) {
  return value ? i18n.t('common.yes') : i18n.t('common.no');
}

export function filterShowOrHide(value) {
  return value ? i18n.t('common.show') : i18n.t('common.notShow');
}

export function filterShowOrHideForFormConfig(value) {
  return value === '‘0’' ? i18n.t('common.show') : i18n.t('common.notShow');
}

export function filterYesOrNoIs(value) {
  return value ? i18n.t('common.no') : i18n.t('common.yes');
}

export function filterCategroyType(value) {
  return constants.categoryType.filter((item) => value === item.value)[0].name;
}

export function filterConfigCategory(value) {
  return constants.configCategory.filter((item) => value === item.value)[0].label;
}

export function keywordStatusFilter(status) {
  const statusMap = {
    text: i18n.t('common.textMessage'),
    image: i18n.t('common.imageMessage'),
    news: i18n.t('common.newsMessage'),
    voice: i18n.t('common.voiceMessage'),
  };
  return statusMap[status];
}

export function couponCategoryFilter(status) {
  const statusMap = {
    1: i18n.t('coupon.shopScope'),
    2: i18n.t('coupon.productScope'),
    3: i18n.t('coupon.generalScope'),
    4: i18n.t('coupon.categoryScope'),
    5: i18n.t('coupon.brandScope'),
    6: i18n.t('coupon.crossStoreScope'),
  };
  return statusMap[status];
}

export function couponTypeFilter(status) {
  const statusMap = {
    1: i18n.t('coupon.merchantCoupon'),
    2: i18n.t('coupon.productCoupon'),
    3: i18n.t('coupon.platformCoupon'),
  };
  return statusMap[status];
}

export function couponUserTypeFilter(status) {
  const statusMap = {
    1: i18n.t('common.couponManual'),
    2: i18n.t('common.couponGift'),
  };
  return statusMap[status];
}

export function articleTypeFilter(status) {
  if (!status) {
    return '';
  }
  let arrayList = JSON.parse(localStorage.getItem('articleClass'));
  if (arrayList.filter((item) => Number(status) === Number(item.id)).length < 1) {
    return '';
  }
  return getLocalizedName(arrayList.filter((item) => Number(status) === Number(item.id))[0], i18n.locale);
}

export function payStatusFilter(status) {
  const statusMap = {
    false: i18n.t('order.unpaid'),
    true: i18n.t('order.paid'),
  };
  return statusMap[status];
}

export function extractTypeFilter(status) {
  const statusMap = {
    bank: i18n.t('finance.bankCard'),
    alipay: i18n.t('order.alipay'),
    weixin: i18n.t('order.wechat'),
  };
  return statusMap[status];
}

export function rechargeTypeFilter(status) {
  const statusMap = {
    public: i18n.t('common.publicAccount'),
    weixinh5: i18n.t('common.webPayment'),
    routine: i18n.t('common.miniProgram'),
  };
  return statusMap[status];
}

export function extractStatusFilter(status) {
  const statusMap = {
    '-1': i18n.t('common.rejected'),
    0: i18n.t('common.auditing'),
    1: i18n.t('common.withdrawn'),
  };
  return statusMap[status];
}

export function bargainStatusFilter(status) {
  const statusMap = {
    1: i18n.t('common.ongoing'),
    2: i18n.t('common.incomplete'),
    3: i18n.t('common.succeeded'),
  };
  return statusMap[status];
}

export function bargainColorFilter(status) {
  const statusMap = {
    1: '',
    2: 'danger',
    3: 'success',
  };
  return statusMap[status];
}

export function groupStatusFilter(status) {
  const statusMap = {
    1: i18n.t('common.ongoing'),
    2: i18n.t('common.succeeded'),
    3: i18n.t('common.incomplete'),
  };
  return statusMap[status];
}

export function groupColorFilter(status) {
  const statusMap = {
    1: '',
    2: 'success',
    3: 'danger',
  };
  return statusMap[status];
}

export function onePassTypeFilter(status) {
  const statusMap = {
    sms: i18n.t('common.sms'),
    copy: i18n.t('common.productCollection'),
    expr_query: i18n.t('common.logisticsQuery'),
    expr_dump: i18n.t('common.electronicWaybill'),
  };
  return statusMap[status];
}

export function editStatusFilter(status) {
  const statusMap = {
    '-1': i18n.t('product.violationOffShelf'),
    '-2': i18n.t('product.platformOffShelf'),
    '-3': i18n.t('product.merchantOffShelf'),
    1: i18n.t('product.notAudited'),
    2: i18n.t('common.auditing'),
    3: i18n.t('common.auditFailed'),
    4: i18n.t('common.auditSuccess'),
  };
  return statusMap[status];
}

export function platformStatusFilter(status) {
  const statusMap = {
    1: i18n.t('product.notAudited'),
    2: i18n.t('common.auditing'),
    3: i18n.t('common.auditFailed'),
    4: i18n.t('common.auditSuccess'),
  };
  return statusMap[status];
}

export function videoStatusFilter(status) {
  const statusMap = {
    0: i18n.t('product.initialValue'),
    5: i18n.t('product.onShelf'),
    11: i18n.t('product.selfOffShelf'),
    13: i18n.t('product.violationSystemOffShelf'),
  };
  return statusMap[status];
}

export function roleTypeFilter(status) {
  const statusMap = {
    platform: i18n.t('common.rolePlatform'),
    merchant: i18n.t('common.roleMerchant'),
    system: i18n.t('common.roleSystem'),
  };
  return statusMap[status];
}

export function activityStatusFilter(status) {
  const statusMap = {
    0: i18n.t('common.notStarted'),
    1: i18n.t('common.ongoing'),
    2: i18n.t('common.ended'),
  };
  return statusMap[status];
}
