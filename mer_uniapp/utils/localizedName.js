import { t } from '@/i18n'

function phraseOrText(text) {
  if (text == null || text === '') return '';
  const translated = t(String(text));
  return translated || String(text);
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

export function getAppLocale() {
  try {
    return uni.getStorageSync('locale') || uni.getStorageSync('lang') || 'zh-cn';
  } catch (e) {
    return 'zh-cn';
  }
}

export function getLocalizedText(defaultText, json, locale) {
  const lang = locale || getAppLocale();
  let parsed = null;
  if (json) {
    try {
      const obj = typeof json === 'string' ? JSON.parse(json) : json;
      if (obj && typeof obj === 'object') {
        parsed = obj;
        const keys = localeLookupKeys(lang);
        for (let i = 0; i < keys.length; i++) {
          const val = String(obj[keys[i]] || '').trim();
          if (val) return val;
        }
      }
    } catch (e) {
      // 解析失败时回退默认文案
    }
  }
  if (defaultText != null && String(defaultText).trim()) return String(defaultText);
  if (parsed) {
    const keys = Object.keys(parsed);
    for (let i = 0; i < keys.length; i++) {
      const val = String(parsed[keys[i]] || '').trim();
      if (val) return val;
    }
  }
  return defaultText || '';
}

function isBlankHtml(html) {
  if (html == null || String(html).trim() === '') return true;
  const raw = String(html);
  if (/<(img|video|iframe|embed|source)\b/i.test(raw)) return false;
  const text = raw
    .replace(/<[^>]+>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return !text;
}

export function getLocalizedHtml(defaultHtml, json, locale) {
  const lang = locale || getAppLocale();
  let parsed = null;
  if (json) {
    try {
      const obj = typeof json === 'string' ? JSON.parse(json) : json;
      if (obj && typeof obj === 'object') parsed = obj;
    } catch (e) {
      parsed = null;
    }
  }
  if (parsed) {
    const keys = localeLookupKeys(lang);
    for (let i = 0; i < keys.length; i++) {
      const val = parsed[keys[i]];
      if (!isBlankHtml(val)) return val;
    }
  }
  if (!isBlankHtml(defaultHtml)) return defaultHtml;
  if (parsed) {
    const keys = Object.keys(parsed);
    for (let i = 0; i < keys.length; i++) {
      const val = parsed[keys[i]];
      if (!isBlankHtml(val)) return val;
    }
  }
  return defaultHtml || '';
}

export function getLocalizedName(row, locale) {
  return phraseOrText(getLocalizedText(row ? row.name : '', row ? (row.nameJson || row.name_json) : '', locale));
}

export function diyInfoTitle(item) {
  const info = item && item.info && item.info[0];
  if (!info) return '';
  return getLocalizedText(info.value, info.valueJson);
}

export function getLocalizedDiyVal(item, locale) {
  if (!item) return '';
  return phraseOrText(getLocalizedText(item.val || item.value, item.valJson, locale));
}

export function getLocalizedDiyTitle(item, locale) {
  if (!item) return '';
  return phraseOrText(getLocalizedText(item.title, item.titleJson, locale));
}

export function getLocalizedDiyImg(item, locale) {
  if (!item) return '';
  return getLocalizedText(item.img, item.imgJson, locale);
}

export function getLocalizedDiyUrl(item, locale) {
  if (!item) return '';
  return getLocalizedText(item.url, item.urlJson, locale);
}
