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

export function createTimeOptions() {
  return {
    shortcuts: [
      {
        text: i18n.t('common.yesterday'),
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24);
          picker.$emit('pick', [start, start]);
        },
      },
      {
        text: i18n.t('common.last7Days'),
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
          picker.$emit('pick', [start, end]);
        },
      },
      {
        text: i18n.t('common.thisMonth'),
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.setTime(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
          picker.$emit('pick', [start, end]);
        },
      },
      {
        text: i18n.t('common.last30Days'),
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          picker.$emit('pick', [start, end]);
        },
      },
      {
        text: i18n.t('common.lastYear'),
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
          picker.$emit('pick', [start, end]);
        },
      },
    ],
  };
}

export default createTimeOptions;
