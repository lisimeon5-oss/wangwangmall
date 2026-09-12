// +----------------------------------------------------------------------
// | 表单动态配置多语言翻译工具
// | 后端表单配置（content JSON）中的 label/placeholder/选项等文案以中文存储，
// | 这里通过 vue-i18n 的中文文案反向索引，把中文翻译成当前界面语言。
// +----------------------------------------------------------------------
import i18n from '@/i18n';
import menuDict from '../../dict.js';
import zhCN from '@/i18n/langs/zh-cn';
import enLang from '@/i18n/langs/en';
import thLang from '@/i18n/langs/th';
import myLang from '@/i18n/langs/my';

const LANG_PACKS = {
  'zh-cn': zhCN,
  'zh-CN': zhCN,
  en: enLang,
  th: thLang,
  my: myLang,
};

// 中文文案 -> i18n key 的反向索引，首次使用时构建并缓存
let localeIndexCache = {};
let dictReverse = null;

function foldLabel(text) {
  return String(text || '')
    .replace(/[\u00a0\u3000]/g, '')
    .replace(/\s+/g, '')
    .replace(/[:：]/g, '')
    .replace(/[？?]/g, '')
    .replace(/[！!]/g, '')
    .replace(/[，、]/g, ',')
    .replace(/[（【\[]/g, '(')
    .replace(/[）】\]]/g, ')');
}

function translateByKey(key) {
  const locale = String(i18n.locale || 'zh-cn');
  const pack = LANG_PACKS[locale] || LANG_PACKS[locale.split('-')[0]] || LANG_PACKS.en;
  const fromPack = key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), pack);
  if (typeof fromPack === 'string' && fromPack) return fromPack;
  const t = i18n.t(key);
  return typeof t === 'string' ? t : '';
}

function buildLocaleIndex(locale) {
  const index = new Map();
  const messages = LANG_PACKS[locale] || (i18n.messages && i18n.messages[locale]) || {};
  const walk = (obj, prefix) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach((key) => {
      if (!prefix && key === 'el') return;
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        walk(value, path);
      } else if (typeof value === 'string' && value) {
        if (!index.has(value)) index.set(value, path);
        const folded = foldLabel(value);
        if (folded && !index.has(folded)) index.set(folded, path);
      }
    });
  };
  walk(messages, '');
  localeIndexCache[locale] = index;
  return index;
}

function getDictReverse() {
  if (dictReverse) return dictReverse;
  dictReverse = new Map();
  const source = (menuDict && menuDict.default) || menuDict || {};
  Object.keys(source).forEach((zh) => {
    dictReverse.set(zh, zh);
    const foldedZh = foldLabel(zh);
    if (foldedZh) dictReverse.set(foldedZh, zh);
    const trans = source[zh];
    if (!trans || typeof trans !== 'object') return;
    Object.keys(trans).forEach((lang) => {
      if (trans[lang]) {
        dictReverse.set(trans[lang], zh);
        const folded = foldLabel(trans[lang]);
        if (folded) dictReverse.set(folded, zh);
      }
    });
  });
  return dictReverse;
}

function translateViaDict(text) {
  const map = getDictReverse();
  const zh = map.get(text) || map.get(foldLabel(text));
  if (!zh) return '';
  const locale = i18n.locale || 'zh-cn';
  if (locale === 'zh-cn' || locale === 'zh-CN') return zh;
  const source = (menuDict && menuDict.default) || menuDict || {};
  const trans = source[zh];
  return (trans && (trans[locale] || trans[locale.split('-')[0]])) || zh;
}

function findI18nKey(text) {
  const preferred = ['zh-cn', 'en', 'th', 'my'];
  for (let i = 0; i < preferred.length; i++) {
    const locale = preferred[i];
    const index = localeIndexCache[locale] || buildLocaleIndex(locale);
    const key = index.get(text) || index.get(foldLabel(text));
    if (key) return key;
  }
  return '';
}

/**
 * 从菜单树/扁平菜单里按 path 取当前语言标题（优先精确匹配，否则取最长前缀）。
 */
export function findMenuTitleByPath(path, ...menuLists) {
  if (!path) return '';
  const clean = String(path).split('?')[0];
  let bestTitle = '';
  let bestLen = -1;
  const visit = (arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((item) => {
      if (!item) return;
      if (item.path && item.title) {
        const p = String(item.path).split('?')[0];
        if (clean === p || (p !== '/' && clean.startsWith(p + '/'))) {
          if (p.length > bestLen) {
            bestLen = p.length;
            bestTitle = item.title;
          }
        }
      }
      if (item.children) visit(item.children);
    });
  };
  menuLists.forEach(visit);
  return bestTitle;
}

function translateMustacheTitle(title) {
  if (typeof title !== 'string' || !title.includes('{{') || !title.includes('}}')) return title;
  return title.replace(/({{[\s\S]+?}})/, (m, str) =>
    str.replace(/{{([\s\S]*)}}/, (mm, key) => i18n.t(key.trim())),
  );
}

/**
 * 导航标题：优先用当前菜单多语言名称，其次 {{ i18n.key }}，再按中文反查 vue-i18n。
 */
export function resolveNavTitle(rawTitle, path, ...menuLists) {
  const fromMenu = findMenuTitleByPath(path, ...menuLists);
  const title = fromMenu || translateMustacheTitle(rawTitle || '');
  return translateTitleWithSuffix(title);
}

function getByPath(obj, path) {
  if (!obj || !path) return '';
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), obj);
}

function expandZhLabelVariants(text) {
  if (!text) return []
  const out = []
  const seen = {}
  const push = (s) => {
    const v = String(s || '')
    if (!v || seen[v]) return
    seen[v] = true
    out.push(v)
  }
  push(text)
  push(text.trim())
  const strip = text.trim().replace(/\s*[:：]\s*$/, '')
  const bodies = [
    strip,
    strip.replace(/[（(]\s*元\s*[）)]/g, '（铢）'),
    strip.replace(/[（(]\s*元\s*[）)]/g, '(铢)'),
    strip.replace(/[（(]\s*铢\s*[）)]/g, '（元）'),
    strip.replace(/[（(]\s*铢\s*[）)]/g, '(元)'),
  ]
  const more = []
  bodies.forEach((b) => {
    more.push(b)
    more.push(b.replace(/\(/g, '（').replace(/\)/g, '）'))
    more.push(b.replace(/（/g, '(').replace(/）/g, ')'))
  })
  more.forEach((b) => {
    push(b)
    push(`${b}：`)
    push(`${b}:`)
    push(`${b} :`)
  })
  return out
}

function translateOnce(text) {
  const origHasColon = /[：:]\s*$/.test(String(text || ''))
  const variants = expandZhLabelVariants(text)
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    const key = findI18nKey(variant)
    if (key) {
      let translated = translateByKey(key)
      if (translated && typeof translated === 'string') {
        if (!origHasColon) translated = translated.replace(/[：:]\s*$/, '')
        return translated
      }
    }
    const fromDict = translateViaDict(variant)
    if (fromDict && fromDict !== variant) {
      return origHasColon || !/[：:]\s*$/.test(fromDict) ? fromDict : fromDict.replace(/[：:]\s*$/, '')
    }
  }
  return text
}

const COMPOUND_PREFIXES = ['请选择', '请输入', '请填写'];

function collapseDupLabel(tail) {
  if (!tail) return tail;
  const known = ['导航名称', '路由地址', '选中样式', '未选中样式', '数据组名称', '数据简介'];
  for (let i = 0; i < known.length; i++) {
    const label = known[i];
    if (tail === label) return tail;
    if (tail.endsWith(label) && label.startsWith(tail.slice(0, tail.length - label.length))) {
      return label;
    }
  }
  return tail;
}

function translateCompound(text) {
  for (let i = 0; i < COMPOUND_PREFIXES.length; i++) {
    const prefix = COMPOUND_PREFIXES[i];
    if (!text.startsWith(prefix) || text.length <= prefix.length) continue;
    const tail = collapseDupLabel(text.slice(prefix.length).trim());
    const headTr = translateOnce(prefix);
    const tailTr = translateText(tail);
    if (headTr === prefix && tailTr === tail) continue;
    const locale = String(i18n.locale || 'zh-cn').toLowerCase();
    const join = locale.startsWith('zh') ? '' : ' ';
    return `${headTr}${join}${tailTr}`.trim();
  }
  return '';
}

function getZhByKey(key) {
  const zh = getByPath(zhCN, key) || getByPath(i18n.messages['zh-cn'] || i18n.messages['zh-CN'], key);
  return typeof zh === 'string' && zh ? zh : '';
}

/** 把当前语言文案还原成中文源文（设计器编辑框回写用） */
export function toSourceZh(text) {
  if (!text || typeof text !== 'string') return text;
  const key = findI18nKey(text);
  if (key) {
    const zh = getZhByKey(key);
    if (zh) return zh;
  }
  const heads = [
    [i18n.t('formGenerator.pleaseSelect'), '请选择'],
    [i18n.t('formGenerator.pleaseEnter'), '请输入'],
    ['Please select', '请选择'],
    ['Please enter', '请输入'],
  ];
  for (let i = 0; i < heads.length; i++) {
    const headTr = heads[i][0];
    const headZh = heads[i][1];
    if (!headTr || !headZh || text === headTr || !text.startsWith(headTr)) continue;
    const rest = text.slice(headTr.length).trim();
    if (!rest) return headZh;
    const restZh = toSourceZh(rest);
    return `${headZh}${restZh}`;
  }
  return text;
}

/**
 * 将中文字符串翻译为当前语言；找不到对应 key 时原样返回。
 * 动态表单 label 常带中文冒号，匹配不到时去掉末尾冒号再查一次。
 */
function localeColon(originalColon) {
  const locale = i18n.locale || 'zh-cn';
  if (!originalColon) return '';
  return locale === 'zh-cn' || locale === 'zh-CN' ? originalColon : ':';
}

/** 翻译标签主体，尺寸如 (238x64) 原样保留 */
function translateKeepDimension(label, colonChar) {
  if (!label) return '';
  const matched = label.match(/^(.*?)(\s*[\(（][\d\sxX*×]+[\)）])\s*$/);
  if (!matched || !matched[1]) return '';
  const inner = translateOnce(matched[1].trim());
  if (inner === matched[1].trim()) return '';
  return inner + matched[2] + localeColon(colonChar);
}

function localeLang() {
  const locale = String(i18n.locale || 'zh-cn').toLowerCase()
  if (locale.startsWith('zh')) return 'zh-cn'
  if (locale.startsWith('th')) return 'th'
  if (locale.startsWith('my') || locale.startsWith('mm')) return 'my'
  return 'en'
}

const INTEGRAL_LOG_TEMPLATES = [
  { zh: '签到奖励{0}积分{1}经验', en: 'Check-in reward: {0} points, {1} XP', th: 'รางวัลเช็คอิน {0} แต้ม {1} ประสบการณ์', my: 'ချက်အင်ဆု {0} ပွိုင့် {1} အတွေ့အကြုံ' },
  { zh: '签到奖励{0}积分', en: 'Check-in reward: {0} points', th: 'รางวัลเช็คอิน {0} แต้ม', my: 'ချက်အင်ဆု {0} ပွိုင့်' },
  { zh: '签到奖励{0}经验', en: 'Check-in reward: {0} XP', th: 'รางวัลเช็คอิน {0} ประสบการณ์', my: 'ချက်အင်ဆု {0} အတွေ့အကြုံ' },
  { zh: '后台操作增加了{0}积分', en: 'Admin added {0} points', th: 'แอดมินเพิ่ม {0} แต้ม', my: 'အက်ဒ်မင် {0} ပွိုင့် ထည့်သည်' },
  { zh: '后台操作减少了{0}积分', en: 'Admin deducted {0} points', th: 'แอดมินหัก {0} แต้ม', my: 'အက်ဒ်မင် {0} ပွိုင့် နုတ်သည်' },
  { zh: '订单支付成功奖励{0}积分', en: 'Order paid, earned {0} points', th: 'ชำระสำเร็จ ได้รับ {0} แต้ม', my: 'ပေးချေအောင်မြင်၍ {0} ပွိုင့်ရ' },
  { zh: '订单退款，返还支付使用的{0}积分', en: 'Order refund, returned {0} points', th: 'คืนเงิน คืนแต้มที่ใช้ {0} แต้ม', my: 'ငွေပြန်အမ်း၊ သုံးထားသော {0} ပွိုင့် ပြန်ပေး' },
  { zh: '订单使用{0}积分进行金额抵扣', en: 'Order used {0} points as deduction', th: 'คำสั่งซื้อใช้ {0} แต้มหักยอด', my: 'အော်ဒါက {0} ပွိုင့်ဖြင့် ငွေနှုတ်' },
  { zh: '积分订单使用{0}积分进行兑换', en: 'Points order redeemed {0} points', th: 'แลกสินค้าด้วย {0} แต้ม', my: 'ပွိုင့်အော်ဒါ {0} ပွိုင့်ဖြင့် လဲ' },
  { zh: '订单取消，退回金额抵扣积分：{0}', en: 'Order cancelled, returned deduction points: {0}', th: 'ยกเลิกคำสั่งซื้อ คืนแต้มหักยอด: {0}', my: 'အော်ဒါပယ်ဖျက်၊ နှုတ်ပွိုင့်ပြန်: {0}' },
  { zh: '积分订单取消，退回兑换积分：{0}', en: 'Points order cancelled, returned redeem points: {0}', th: 'ยกเลิกออเดอร์แต้ม คืนแต้มแลก: {0}', my: 'ပွိုင့်အော်ဒါပယ်ဖျက်၊ လဲပွိုင့်ပြန်: {0}' }
]

function matchLogTpl(tpl, text) {
  const parts = String(tpl).split(/\{\d+\}/)
  const re = new RegExp('^' + parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(\\d+)') + '$')
  return text.match(re)
}

function fillLogTpl(tpl, groups) {
  return String(tpl).replace(/\{(\d+)\}/g, (_, i) => (groups[i] != null ? groups[i] : ''))
}

function translateIntegralLogText(text) {
  const lang = localeLang()
  const targetKey = lang === 'zh-cn' ? 'zh' : lang
  const sources = ['zh', 'en', 'th', 'my']
  for (let i = 0; i < INTEGRAL_LOG_TEMPLATES.length; i++) {
    const row = INTEGRAL_LOG_TEMPLATES[i]
    for (let s = 0; s < sources.length; s++) {
      const m = matchLogTpl(row[sources[s]], text)
      if (!m) continue
      const groups = []
      for (let g = 1; g < m.length; g++) groups.push(m[g])
      return fillLogTpl(row[targetKey] || row.en, groups)
    }
  }
  return ''
}

export function translateText(text) {
  if (!text || typeof text !== 'string') return text;
  try {
    const dyn = translateIntegralLogText(text.trim())
    if (dyn) return dyn
    const candidates = [text];
    const trimmed = text.trim();
    if (trimmed !== text) candidates.push(trimmed);
    for (let i = 0; i < candidates.length; i++) {
      const current = candidates[i];
      const direct = translateOnce(current);
      if (direct !== current) return direct;
      const matched = current.match(/^(.*?)([：:])\s*$/);
      if (matched && matched[1]) {
        const body = matched[1].trim();
        const inner = translateOnce(body);
        if (inner !== body) return inner + localeColon(matched[2]);
        const withDim = translateKeepDimension(body, matched[2]);
        if (withDim) return withDim;
      }
      const withDim = translateKeepDimension(current, '');
      if (withDim) return withDim;
      const compound = translateCompound(current);
      if (compound) return compound;
    }
    return text;
  } catch (e) {
    return text;
  }
}

function translateTitleWithSuffix(text) {
  if (!text || typeof text !== 'string') return text;
  const matched = text.match(/^(.*?)(\s+ID:\s*\S+)?$/);
  const base = ((matched && matched[1]) || text).trim();
  const suffix = (matched && matched[2]) || '';
  return `${translateText(base)}${suffix}`;
}

// 表单配置中会展示为文本的顶层属性
const TEXT_ATTRS = ['placeholder', 'start-placeholder', 'end-placeholder', 'range-separator', 'separator', 'active-text', 'inactive-text'];

function translateField(field) {
  if (!field || typeof field !== 'object') return;
  const config = field.__config__;
  if (config) {
    if (typeof config.label === 'string') config.label = translateText(config.label);
    if (typeof config.tipsDesc === 'string') config.tipsDesc = translateText(config.tipsDesc);
    if (typeof config.buttonText === 'string') config.buttonText = translateText(config.buttonText);
    if (Array.isArray(config.regList)) {
      config.regList.forEach((rule) => {
        if (rule && typeof rule.message === 'string') rule.message = translateText(rule.message);
      });
    }
    if (Array.isArray(config.children)) {
      config.children.forEach((child) => translateField(child));
    }
  }
  TEXT_ATTRS.forEach((attr) => {
    if (typeof field[attr] === 'string') field[attr] = translateText(field[attr]);
  });
  const slot = field.__slot__;
  if (slot && typeof slot === 'object') {
    if (Array.isArray(slot.options)) {
      slot.options.forEach((option) => {
        if (option && typeof option.label === 'string') option.label = translateText(option.label);
      });
    }
    ['prepend', 'append', 'default'].forEach((key) => {
      if (typeof slot[key] === 'string') slot[key] = translateText(slot[key]);
    });
  }
  if (Array.isArray(field.options)) {
    const walkOpts = (list) => {
      list.forEach((option) => {
        if (!option || typeof option !== 'object') return;
        if (typeof option.label === 'string') option.label = translateText(option.label);
        if (Array.isArray(option.children)) walkOpts(option.children);
      });
    };
    walkOpts(field.options);
  }
}

/**
 * 翻译动态表单配置中的中文文案（label/placeholder/tips/选项等）。
 */
export function translateFormConfig(formConf) {
  localeIndexCache = {};
  dictReverse = null;
  if (!formConf || !Array.isArray(formConf.fields)) return formConf;
  try {
    formConf.fields.forEach((field) => translateField(field));
  } catch (e) {
    // 翻译失败时忽略，保证表单仍能正常渲染
    console.warn('[i18nText] translateFormConfig error:', e);
  }
  return formConf;
}

/** 翻译单个表单控件配置（设计器画布预览用克隆对象，不改原始中文） */
export function translateFormField(field) {
  if (!field || typeof field !== 'object') return field;
  try {
    translateField(field);
  } catch (e) {
    // ignore
  }
  return field;
}

export default translateFormConfig;
