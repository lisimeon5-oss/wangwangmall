// +----------------------------------------------------------------------
// | 业务名称多语言：默认语言存在 name，其它语言存在 nameJson
// +----------------------------------------------------------------------

/**
 * 按当前语言取名称：先取 JSON 当前语言，没有值才回退默认 name
 */
export function getLocalizedName(row, locale) {
  if (!row) return '';
  return getLocalizedText(row.name, row.nameJson || row.name_json, locale);
}

/** 列表/下拉展示：当前语言 JSON -> 没有值才用默认 name */
export function getLocalizedText(defaultText, json, locale) {
  const obj = parseLangJsonMap(json);
  const keys = localeLookupKeys(locale);
  for (let i = 0; i < keys.length; i++) {
    const val = String(obj[keys[i]] || '').trim();
    if (val) return val;
  }
  return String(defaultText || '').trim();
}

function specOptionReplacements(attrList, locale) {
  const list = [];
  if (!Array.isArray(attrList)) return list;
  attrList.forEach((attr) => {
    const details = (attr && (attr.detail || attr.optionList)) || [];
    details.forEach((d) => {
      const from = String((d && (d.value || d.optionName)) || '').trim();
      if (!from) return;
      const to = getLocalizedText(from, d.valueJson || d.optionNameJson, locale) || from;
      list.push({ from, to });
    });
  });
  list.sort((a, b) => b.from.length - a.from.length);
  return list;
}

/** 规格 SKU：系统「默认」走文案；自定义值按 attrList.optionNameJson 取当前语言 */
export function localizeSpecSku(sku, t, attrList, locale) {
  const val = String(sku || '').trim();
  if (!val) return '';
  const replacements = specOptionReplacements(attrList, locale);
  return val
    .split(',')
    .map((part) => {
      let raw = String(part || '').trim();
      if (raw === '默认' || raw === 'Default' || raw === 'ค่าเริ่มต้น' || raw === 'ပုံသေ') {
        return typeof t === 'function' ? t('product.specDefault') : raw;
      }
      const exact = replacements.find((r) => r.from === raw);
      if (exact) return exact.to;
      replacements.forEach((r) => {
        if (r.from && r.from !== r.to && raw.indexOf(r.from) !== -1) {
          raw = raw.split(r.from).join(r.to);
        }
      });
      return raw;
    })
    .join(',');
}

function localeLookupKeys(lang) {
  const raw = String(lang || 'zh-cn');
  const lower = raw.toLowerCase();
  const keys = [raw, lower];
  if (lower.startsWith('en')) keys.push('en', 'en-us', 'en-US');
  if (lower.startsWith('zh')) keys.push('zh-cn', 'zh-CN', 'zh_cn');
  if (lower.startsWith('my') || lower.startsWith('mm')) keys.push('my', 'mm');
  if (lower.startsWith('th')) keys.push('th');
  return keys.filter((item, idx) => item && keys.indexOf(item) === idx);
}

export function parseLangJsonMap(json) {
  if (!json) return {};
  if (typeof json === 'object' && !Array.isArray(json)) return { ...json };
  if (typeof json !== 'string') return {};
  try {
    let parsed = JSON.parse(json);
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}

export function getUiLocale(vm) {
  if (!vm) return 'zh-cn';
  return (
    (vm.$i18n && vm.$i18n.locale) ||
    (vm.$store &&
      vm.$store.state.themeConfig &&
      vm.$store.state.themeConfig.themeConfig &&
      vm.$store.state.themeConfig.themeConfig.globalI18n) ||
    'zh-cn'
  );
}

export function resolveFormActiveLang(vm, langOptions, defaultLangCode) {
  const options = langOptions || (vm && vm.langOptions) || [];
  const fallback = defaultLangCode || (vm && vm.defaultLangCode) || 'zh-cn';
  const locale = getUiLocale(vm);
  const matched = options.some((item) => item.code === locale || item.value === locale);
  return matched ? locale : fallback;
}

export function pickFormName(vm) {
  const d =
    (vm &&
      (vm.formData ||
        vm.dataForm ||
        vm.formValidate ||
        vm.form ||
        vm.ruleForm ||
        vm.editPram ||
        vm.labelPram ||
        vm.pram)) ||
    {};
  return d.name || d.tagName || d.groupName || d.roleName || '';
}

/** 默认 name，否则取语言表单里第一个非空值 */
export function pickI18nSubmitName(defaultName, nameJsonForm) {
  const fromDefault = String(defaultName || '').trim();
  if (fromDefault) return fromDefault;
  const form = nameJsonForm || {};
  const keys = Object.keys(form);
  for (let i = 0; i < keys.length; i++) {
    const val = String(form[keys[i]] || '').trim();
    if (val) return val;
  }
  return '';
}

/** 默认 name 或其它语言 JSON 中至少有一个非空文案 */
export function hasI18nNameContent(defaultName, nameJsonForm) {
  if (String(defaultName || '').trim()) return true;
  const form = nameJsonForm || {};
  return Object.keys(form).some((key) => String(form[key] || '').trim());
}

/**
 * 组装 nameJson：包含默认语言（来自 name 字段）和其它语言
 */
export function buildI18nNameJson(langOptions, nameJsonForm, defaultLangCode, defaultName) {
  const obj = {};
  const form = nameJsonForm || {};
  const codes = [];
  const pushCode = (code) => {
    if (code && codes.indexOf(code) < 0) codes.push(code);
  };
  (langOptions || []).forEach((lang) => pushCode(lang && (lang.code || lang.value)));
  Object.keys(form).forEach(pushCode);
  pushCode(defaultLangCode);
  codes.forEach((code) => {
    const value =
      code === defaultLangCode
        ? String(defaultName != null && defaultName !== '' ? defaultName : form[code] || '').trim()
        : String(form[code] || '').trim();
    if (value) obj[code] = value;
  });
  return Object.keys(obj).length ? JSON.stringify(obj) : '';
}

/**
 * 复制分类树并把 name 替换为当前语言
 */
export function localizeNamedTree(nodes, locale, childrenKey = 'childList') {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    const localized = getLocalizedName(node, locale) || node.name || node.label || String(node.id || '');
    const item = { ...node, name: localized, label: localized };
    const childKey =
      node[childrenKey] && node[childrenKey].length
        ? childrenKey
        : node.children && node.children.length
          ? 'children'
          : '';
    if (childKey) {
      item[childKey] = localizeNamedTree(node[childKey], locale, childrenKey);
      if (childKey !== childrenKey) item[childrenKey] = item[childKey];
    }
    return item;
  });
}

export function getLocalizedDiyVal(item, locale) {
  if (!item) return '';
  return getLocalizedText(item.val || item.value, item.valJson, locale);
}

export function getLocalizedDiyTitle(item, locale) {
  if (!item) return '';
  return getLocalizedText(item.title, item.titleJson, locale);
}

/** DIY 轮播图：默认 img，其它语言 imgJson，未配置回退默认图 */
export function getLocalizedDiyImg(item, locale) {
  if (!item) return '';
  return getLocalizedText(item.img, item.imgJson, locale);
}

export function getLocalizedDiyUrl(item, locale) {
  if (!item) return '';
  return getLocalizedText(item.url, item.urlJson, locale);
}

/** 装修编辑：默认语言读默认字段，其它语言只读 JSON，不回退 */
export function getFormLocalizedText(defaultText, json, locale, defaultLangCode = 'zh-cn') {
  if (!locale || locale === defaultLangCode) return String(defaultText || '');
  const obj = parseLangJsonMap(json);
  const keys = localeLookupKeys(locale);
  for (let i = 0; i < keys.length; i++) {
    const val = String(obj[keys[i]] || '').trim();
    if (val) return val;
  }
  return '';
}

/** 商品规格名：attrs.value + valueJson，或 attrList.attributeName + attributeNameJson */
export function localizeProductSpecName(attr, locale) {
  if (!attr) return '';
  return getLocalizedText(attr.value || attr.attributeName, attr.valueJson || attr.attributeNameJson, locale);
}

/** 商品规格值：按默认规格值匹配 option，再取当前语言 */
export function localizeProductSpecValue(attr, optionValue, locale) {
  const raw = String(optionValue || '').trim();
  if (!raw) return '';
  const details = (attr && (attr.detail || attr.optionList)) || [];
  const opt = details.find((d) => String(d.value || d.optionName || '') === raw);
  if (opt) {
    return getLocalizedText(opt.value || opt.optionName, opt.valueJson || opt.optionNameJson, locale) || raw;
  }
  return raw;
}
