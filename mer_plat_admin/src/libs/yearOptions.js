// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------

import i18n from '@/i18n';

export function createYearOptions() {
  return {
    shortcuts: [
      {
        text: i18n.t('common.thisMonth'),
        onClick(picker) {
          picker.$emit('pick', [new Date(), new Date()]);
        },
      },
      {
        text: i18n.t('common.yearToDate'),
        onClick(picker) {
          const end = new Date();
          const start = new Date(new Date().getFullYear(), 0);
          picker.$emit('pick', [start, end]);
        },
      },
      {
        text: i18n.t('common.last6Months'),
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setMonth(start.getMonth() - 6);
          picker.$emit('pick', [start, end]);
        },
      },
    ],
  };
}

export default createYearOptions;
