// +----------------------------------------------------------------------
// | 业务名称多语言：默认语言存在 name，其它语言存在 nameJson
// +----------------------------------------------------------------------

/**
 * 按当前语言取文案：先取 JSON 当前语言，没有值才回退默认文本
 */
export function getLocalizedText(defaultText, json, locale) {
  const obj = parseLangJsonMap(json);
  const keys = localeLookupKeys(locale);
  for (let i = 0; i < keys.length; i++) {
    const val = String(obj[keys[i]] || '').trim();
    if (val) return val;
  }
  const objKeys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const want = String(keys[i] || '').toLowerCase();
    const found = objKeys.find((k) => String(k).toLowerCase() === want);
    if (found) {
      const val = String(obj[found] || '').trim();
      if (val) return val;
    }
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

/**
 * 按当前语言取名称：先取 JSON 当前语言，没有值才回退默认 name
 */
export function getLocalizedName(row, locale) {
  if (!row) return '';
  return getLocalizedText(
    row.name,
    row.nameI18n || row.nameJson || row.name_json || row.NameJson,
    locale,
  );
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

function localeLookupKeys(lang) {
  const raw = String(lang || 'zh-cn');
  const lower = raw.toLowerCase();
  const keys = [raw, lower];
  if (lower.startsWith('en')) keys.push('en', 'en-us', 'en-US', 'en_us', 'en_US');
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

/**
 * 复制分类树并把 name 替换为当前语言
 */
export function localizeNamedTree(nodes, locale, childrenKey = 'childList') {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    const item = { ...node, name: getLocalizedName(node, locale) };
    if (node[childrenKey] && node[childrenKey].length) {
      item[childrenKey] = localizeNamedTree(node[childrenKey], locale, childrenKey);
    }
    return item;
  });
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

/** 多语言输入框默认选中当前界面语言 */
export function resolveFormActiveLang(vm, langOptions, defaultLangCode) {
  const options = langOptions || (vm && vm.langOptions) || [];
  const fallback = defaultLangCode || (vm && vm.defaultLangCode) || 'zh-cn';
  const locale = getUiLocale(vm);
  const matched = options.some((item) => item.code === locale || item.value === locale);
  return matched ? locale : fallback;
}

/** 默认 name 或其它语言 JSON 中至少有一个非空文案 */
export function hasI18nNameContent(defaultName, nameJsonForm) {
  if (String(defaultName || '').trim()) return true;
  const form = nameJsonForm || {};
  return Object.keys(form).some((key) => String(form[key] || '').trim());
}

/** 从表单对象上取默认语言名称（name 或 tagName） */
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

/**
 * 组装 nameJson：包含默认语言（来自 name 字段）和其它语言
 */
export function buildI18nNameJson(langOptions, nameJsonForm, defaultLangCode, defaultName) {
  const obj = {};
  const form = nameJsonForm || {};
  const langs = langOptions || [];
  langs.forEach((lang) => {
    const code = lang.code || lang.value;
    if (!code) return;
    const value =
      code === defaultLangCode
        ? String(defaultName != null && defaultName !== '' ? defaultName : form[code] || '').trim()
        : String(form[code] || '').trim();
    if (value) obj[code] = value;
  });
  return Object.keys(obj).length ? JSON.stringify(obj) : '';
}

/** DIY 提示文字/热词：默认 val，其它语言 valJson */
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
