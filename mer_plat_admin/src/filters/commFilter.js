// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import * as constants from '@/utils/constants.js';
import { formatDates } from '@/utils/index';
import i18n from '@/i18n';
import { getLocalizedName } from '@/utils/localizedName';

// 公共过滤器
export function filterEmpty(val) {
  let _result = '-';
  if (!val) {
    return _result;
  }
  _result = val;
  return _result;
}

// 时间过滤器
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

/**
 * @description 公众号回复类型
 */
export function keywordStatusFilter(status) {
  const statusMap = {
    text: i18n.t('common.textMessage'),
    image: i18n.t('common.imageMessage'),
    news: i18n.t('common.newsMessage'),
    voice: i18n.t('common.voiceMessage'),
  };
  return statusMap[status];
}

/**
 * @description 优惠券领取方式
 */
export function couponTypeFilter(status) {
  const statusMap = {
    1: i18n.t('common.couponManual'),
    2: i18n.t('common.couponNewcomer'),
    3: i18n.t('common.couponGift'),
  };
  return statusMap[status];
}

/**
 * @description 文章分类
 */
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

/**
 * @description 支付状态
 */
export function payStatusFilter(status) {
  const statusMap = {
    false: i18n.t('order.unpaid'),
    true: i18n.t('order.paid'),
  };
  return statusMap[status];
}

/**
 * @description 提现方式
 */
export function extractTypeFilter(status) {
  const statusMap = {
    bank: i18n.t('finance.bankCard'),
    alipay: i18n.t('order.alipay'),
    weixin: i18n.t('order.wechat'),
  };
  return statusMap[status];
}

/**
 * @description 充值类型
 */
export function rechargeTypeFilter(status) {
  const statusMap = {
    public: i18n.t('common.publicAccount'),
    h5: i18n.t('common.webPayment'),
    mini: i18n.t('common.miniProgram'),
    wechatIos: i18n.t('common.wechatIos'),
    wechatAndroid: i18n.t('common.wechatAndroid'),
    alipay: i18n.t('order.alipay'),
    alipayApp: i18n.t('common.alipayApp'),
  };
  return statusMap[status];
}

/**
 * @description 财务审核状态
 */
export function extractStatusFilter(status) {
  const statusMap = {
    '-1': i18n.t('common.rejected'),
    0: i18n.t('common.auditing'),
    1: i18n.t('common.withdrawn'),
  };
  return statusMap[status];
}

/**
 * @description 砍价状态
 */
export function bargainStatusFilter(status) {
  const statusMap = {
    1: i18n.t('common.ongoing'),
    2: i18n.t('common.incomplete'),
    3: i18n.t('common.succeeded'),
  };
  return statusMap[status];
}

/**
 * @description 砍价状态
 */
export function bargainColorFilter(status) {
  const statusMap = {
    1: '',
    2: 'danger',
    3: 'success',
  };
  return statusMap[status];
}

/**
 * @description 拼团状态
 */
export function groupStatusFilter(status) {
  const statusMap = {
    1: i18n.t('common.ongoing'),
    2: i18n.t('common.succeeded'),
    3: i18n.t('common.incomplete'),
  };
  return statusMap[status];
}

/**
 * @description 拼团状态
 */
export function groupColorFilter(status) {
  const statusMap = {
    1: '',
    2: 'success',
    3: 'danger',
  };
  return statusMap[status];
}

/**
 * @description 一号通tab值
 */
export function onePassTypeFilter(status) {
  const statusMap = {
    sms: i18n.t('common.sms'),
    copy: i18n.t('common.productCollection'),
    expr_query: i18n.t('common.logisticsQuery'),
    expr_dump: i18n.t('common.electronicWaybill'),
  };
  return statusMap[status];
}

/**
 * @description 积分状态
 */
export function integralStatusFilter(status) {
  const statusMap = {
    1: i18n.t('common.orderCreated'),
    2: i18n.t('common.frozenPeriod'),
    3: i18n.t('common.finish'),
    4: i18n.t('common.expired'),
  };
  return statusMap[status];
}

/**
 * @description 关联类型
 */
export function integralLinkTypeFilter(status) {
  const statusMap = {
    order: i18n.t('common.linkOrder'),
    refund: i18n.t('common.linkRefund'),
    sign: i18n.t('common.linkSign'),
    system: i18n.t('common.linkSystem'),
  };
  return statusMap[status];
}

/**
 * @description 关联id
 */
export function integralLinkIdFilter(status) {
  const statusMap = {
    orderNo: i18n.t('common.orderNo'),
    refundOrderNo: i18n.t('order.refundOrderNo'),
    0: '-',
  };
  return statusMap[status];
}

/**
 * @description 氛围图、活动边框使用范围类型
 */
export function activityMethodFilter(status) {
  const statusMap = {
    0: i18n.t('common.allProducts'),
    1: i18n.t('common.specifiedProducts'),
    2: i18n.t('common.specifiedBrand'),
    3: i18n.t('common.specifiedCategory'),
    4: i18n.t('common.specifiedMerchant'),
  };
  return statusMap[status];
}

/**
 * @description 秒杀商品活动状态
 *
 */
export function activityStatusFilter(status) {
  const statusMap = {
    0: i18n.t('common.notStarted'),
    1: i18n.t('common.ongoing'),
    2: i18n.t('common.ended'),
  };
  return statusMap[status];
}

/**
 * @description 社区评论审核状态
 *
 */
export function communityStatusFilter(status) {
  const statusMap = {
    0: i18n.t('order.pendingAudit'),
    1: i18n.t('common.approved'),
    2: i18n.t('common.rejected'),
  };
  return statusMap[status];
}

/**
 * @description 社区评论审核状态
 *
 */
export function communityReplyStatusFilter(status) {
  const statusMap = {
    1: i18n.t('common.open'),
    2: i18n.t('common.close'),
    3: i18n.t('common.platformClosed'),
  };
  return statusMap[status];
}

/**
 * @description 社区内容审核状态
 *
 */
export function communityAuditStatusFilter(status) {
  const statusMap = {
    0: i18n.t('order.pendingAudit'),
    1: i18n.t('common.auditSuccess'),
    2: i18n.t('common.auditFailed'),
    3: i18n.t('common.platformClosed'),
  };
  return statusMap[status];
}
