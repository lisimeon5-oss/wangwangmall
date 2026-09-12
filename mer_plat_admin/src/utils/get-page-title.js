// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import defaultSettings from '@/settings';
import i18n from '@/i18n';
import { translateText } from '@/utils/i18nText';

function resolveAppTitle() {
  let stored = '';
  try {
    stored = window.localStorage.getItem('platSiteName') || '';
  } catch (e) {
    stored = '';
  }
  if (stored) {
    return translateText(stored) || stored;
  }
  const fallback = (defaultSettings && defaultSettings.title) || '';
  if (fallback) {
    return translateText(fallback) || i18n.t('common.loading');
  }
  return i18n.t('common.loading');
}

export default function getPageTitle(pageTitle) {
  const title = resolveAppTitle();
  if (pageTitle) {
    // 路由 meta.title 使用 '{{ menu.dashboard }}' 形式时，翻译为当前语言
    if (typeof pageTitle === 'string' && pageTitle.includes('{{') && pageTitle.includes('}}')) {
      pageTitle = pageTitle.replace(/({{[\s\S]+?}})/, (m) => m.replace(/{{([\s\S]*)}}/, (_, key) => i18n.t(key.trim())));
    } else if (typeof pageTitle === 'string') {
      pageTitle = translateText(pageTitle);
    }
    return `${pageTitle} - ${title}`;
  }
  return `${title}`;
}
