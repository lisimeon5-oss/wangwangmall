// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { Local } from '@/utils/storage';
import elementZhCN from 'element-ui/lib/locale/lang/zh-CN';
import elementEn from 'element-ui/lib/locale/lang/en';
import elementTh from 'element-ui/lib/locale/lang/th';
import zhCN from './langs/zh-cn';
import en from './langs/en';
import th from './langs/th';
import my from './langs/my';

Vue.use(VueI18n);

function mergeElementLang(elementLang, appLang) {
  return {
    ...elementLang,
    ...appLang,
    el: {
      ...(elementLang.el || {}),
      ...(appLang.el || {}),
    },
  };
}

// Element UI 无缅甸语包，日期控件按英文结构补齐年/月文案
const elementMy = mergeElementLang(elementEn, {
  el: {
    datepicker: {
      ...(elementEn.el && elementEn.el.datepicker),
      year: 'နှစ်',
      month1: 'ဇန်နဝါရီ',
      month2: 'ဖေဖော်ဝါရီ',
      month3: 'မတ်',
      month4: 'ဧပြီ',
      month5: 'မေ',
      month6: 'ဇွန်',
      month7: 'ဇူလိုင်',
      month8: 'သြဂုတ်',
      month9: 'စက်တင်ဘာ',
      month10: 'အောက်တိုဘာ',
      month11: 'နိုဝင်ဘာ',
      month12: 'ဒီဇင်ဘာ',
      months: {
        jan: 'ဇန်',
        feb: 'ဖေ',
        mar: 'မတ်',
        apr: 'ဧ',
        may: 'မေ',
        jun: 'ဇွန်',
        jul: 'ဇူ',
        aug: 'ဩ',
        sep: 'စက်',
        oct: 'အောက်',
        nov: 'နို',
        dec: 'ဒီ',
      },
    },
  },
});

// 从本地缓存读取已保存的语言配置，默认 zh-cn
const themeConfigPrev = Local.get('JavaPlatThemeConfigPrev');
const savedLocale = themeConfigPrev && themeConfigPrev.globalI18n ? themeConfigPrev.globalI18n : 'zh-cn';

const i18n = new VueI18n({
  locale: savedLocale,
  fallbackLocale: 'zh-cn',
  messages: {
    'zh-cn': mergeElementLang(elementZhCN, zhCN),
    en: mergeElementLang(elementEn, en),
    th: mergeElementLang(elementTh, th),
    my: mergeElementLang(elementMy, my),
  },
  silentTranslationWarn: true,
  silentFallbackWarn: true,
});

export default i18n;
