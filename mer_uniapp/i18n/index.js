import zhCN from './langs/zh-cn.js'
import en from './langs/en.js'
import th from './langs/th.js'
import my from './langs/my.js'
import { PAGE_TITLES } from './pageTitles.js'
import phrasesZh from './phrases/zh-cn.js'
import phrasesEn from './phrases/en.js'
import phrasesTh from './phrases/th.js'
import phrasesMy from './phrases/my.js'

export const LANG_PACKS = {
  'zh-cn': zhCN,
  en,
  th,
  my
}

export const PHRASES = {
  'zh-cn': phrasesZh,
  en: phrasesEn,
  th: phrasesTh,
  my: phrasesMy
}

export const DEFAULT_LANG_LIST = [
  { name: '中文', code: 'zh-cn' },
  { name: 'English', code: 'en' },
  { name: 'ไทย', code: 'th' },
  { name: 'မြန်မာ', code: 'my' }
]

export function normalizeLang(code) {
  const raw = String(code || 'zh-cn').toLowerCase()
  if (raw.startsWith('zh')) return 'zh-cn'
  if (raw.startsWith('en')) return 'en'
  if (raw.startsWith('th')) return 'th'
  if (raw.startsWith('my') || raw.startsWith('mm')) return 'my'
  return raw
}

export function getLocale() {
  try {
    return normalizeLang(uni.getStorageSync('locale') || uni.getStorageSync('lang') || 'zh-cn')
  } catch (e) {
    return 'zh-cn'
  }
}

export function toUniFrameworkLocale(code) {
  const lang = normalizeLang(code)
  if (lang === 'zh-cn') return 'zh-Hans'
  if (lang === 'en') return 'en'
  if (lang === 'th') return 'th'
  if (lang === 'my') return 'my'
  return 'en'
}

/** Keep uni-app picker/modal chrome (Cancel/Done) in sync with in-app language, not Windows/browser locale. */
export function applyUniFrameworkLocale(code) {
  const uniLocale = toUniFrameworkLocale(code)
  try {
    if (typeof uni !== 'undefined' && typeof uni.setLocale === 'function') {
      uni.setLocale(uniLocale)
    }
  } catch (e) {
    // ignore
  }
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('lang', uniLocale === 'zh-Hans' ? 'zh-CN' : uniLocale)
    }
  } catch (e) {
    // ignore
  }
}

export function persistLocale(code) {
  const locale = normalizeLang(code)
  try {
    uni.setStorageSync('locale', locale)
    uni.setStorageSync('lang', locale)
  } catch (e) {
    // ignore
  }
  applyUniFrameworkLocale(locale)
  return locale
}

function lookup(obj, key) {
  if (!obj || !key) return ''
  const parts = String(key).split('.')
  let cur = obj
  for (let i = 0; i < parts.length; i++) {
    if (!cur || typeof cur !== 'object') return ''
    cur = cur[parts[i]]
  }
  return typeof cur === 'string' ? cur : ''
}

function phraseLooksEnglishCopy(locale, key, str) {
  if (!str || locale === 'en' || locale === 'zh-cn') return false
  const enVal = PHRASES.en && PHRASES.en[key]
  if (enVal && str === enVal && /[A-Za-z]{8,}/.test(str)) return true
  // Keep short Latin tokens (EXP / XP / SVIP); only reject copied English sentences.
  if (str.length <= 8 && !/\s/.test(str)) return false
  if (locale === 'th' && !/[\u0E00-\u0E7F]/.test(str) && /[A-Za-z]/.test(str)) return true
  if (locale === 'my' && !/[\u1000-\u109F]/.test(str) && /[A-Za-z]/.test(str)) return true
  return false
}

/** Backend concatenates Chinese + numbers into one mark, e.g. 签到奖励17积分7经验 */
const DYNAMIC_ZH_TEMPLATES = [
  {
    re: /^签到奖励(\d+)积分(\d+)经验$/,
    key: '签到奖励{integral}积分{experience}经验',
    vars: (m) => ({ integral: m[1], experience: m[2] })
  },
  {
    re: /^签到奖励(\d+)积分$/,
    key: '签到奖励{integral}积分',
    vars: (m) => ({ integral: m[1] })
  },
  {
    re: /^签到奖励(\d+)经验$/,
    key: '签到奖励{experience}经验',
    vars: (m) => ({ experience: m[1] })
  },
  {
    re: /^订单使用(\d+)积分进行金额抵扣$/,
    key: '订单使用{integral}积分进行金额抵扣',
    vars: (m) => ({ integral: m[1] })
  },
  {
    re: /^积分订单使用(\d+)积分进行兑换$/,
    key: '积分订单使用{integral}积分进行兑换',
    vars: (m) => ({ integral: m[1] })
  },
  {
    re: /^订单取消，退回金额抵扣积分[:：](\d+)$/,
    key: '订单取消，退回金额抵扣积分：{integral}',
    vars: (m) => ({ integral: m[1] })
  },
  {
    re: /^积分订单取消，退回兑换积分[:：](\d+)$/,
    key: '积分订单取消，退回兑换积分：{integral}',
    vars: (m) => ({ integral: m[1] })
  },
  {
    re: /^用户订单付款成功[,，]扣余额(\d+(?:\.\d+)?)元$/,
    key: '用户订单付款成功,扣余额{amount}元',
    vars: (m) => ({ amount: m[1] })
  },
  {
    re: /^用户订单退款成功[,，]返还余额(\d+(?:\.\d+)?)元$/,
    key: '用户订单退款成功,返还余额{amount}元',
    vars: (m) => ({ amount: m[1] })
  },
  {
    re: /^后台操作[,，]添加余额(\d+(?:\.\d+)?)元$/,
    key: '后台操作,添加余额{amount}元',
    vars: (m) => ({ amount: m[1] })
  },
  {
    re: /^后台操作[,，]减少余额(\d+(?:\.\d+)?)元$/,
    key: '后台操作,减少余额{amount}元',
    vars: (m) => ({ amount: m[1] })
  },
  {
    re: /^充值成功[，,]余额增加(\d+(?:\.\d+)?)元$/,
    key: '充值成功，余额增加{amount}元',
    vars: (m) => ({ amount: m[1] })
  },
  {
    re: /^佣金转余额成功[，,]添加余额(\d+(?:\.\d+)?)元$/,
    key: '佣金转余额成功，添加余额{amount}元',
    vars: (m) => ({ amount: m[1] })
  },
  {
    re: /^购买SVIP成功[，,]余额赠送(\d+(?:\.\d+)?)元$/,
    key: '购买SVIP成功，余额赠送{amount}元',
    vars: (m) => ({ amount: m[1] })
  },
  {
    re: /^余额购买SVIP成功[，,]扣除余额(\d+(?:\.\d+)?)元$/,
    key: '余额购买SVIP成功，扣除余额{amount}元',
    vars: (m) => ({ amount: m[1] })
  }
]

export function t(key, vars) {
  if (key == null || key === '') return ''
  const raw = String(key)
  for (let i = 0; i < DYNAMIC_ZH_TEMPLATES.length; i++) {
    const item = DYNAMIC_ZH_TEMPLATES[i]
    const m = raw.match(item.re)
    if (m) return t(item.key, item.vars(m))
  }
  const locale = getLocale()
  let str = ''
  const isZhKey = /[\u4e00-\u9fff]/.test(String(key))
  if (!isZhKey && String(key).includes('.')) {
    str = lookup(LANG_PACKS[locale], key) || lookup(LANG_PACKS['zh-cn'], key)
  }
  if (!str) {
    const pack = PHRASES[locale] || {}
    let hit = pack[key] || ''
    if (phraseLooksEnglishCopy(locale, key, hit)) hit = ''
    if (locale === 'en') {
      str = hit || (PHRASES.en && PHRASES.en[key]) || (PHRASES['zh-cn'] && PHRASES['zh-cn'][key]) || String(key)
    } else {
      str = hit || (PHRASES['zh-cn'] && PHRASES['zh-cn'][key]) || String(key)
    }
  }
  if (vars && typeof vars === 'object') {
    Object.keys(vars).forEach((k) => {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k])
    })
  }
  return str
}

const MSG_FRAGMENTS = [
  '一号通平台接口',
  '接口请求失败',
  '请求失败',
  'accessKey或者secretKey',
  '短信业务未开通',
  '短信业务数量不足',
  '验证码不正确',
  '验证码已过期',
  '验证码校验失败',
  '验证码格式错误，验证码必须为6位数字',
  '手机号码格式错误',
  '格式错误',
  '手机号格式不正确，请重新输入',
  '系统异常，请稍后重试',
]

export function localizeMessage(text) {
  if (text == null || text === '') return ''
  let out = t(String(text))
  if (!/[\u4e00-\u9fff]/.test(out)) return out
  MSG_FRAGMENTS.forEach((zh) => {
    if (out.indexOf(zh) > -1) {
      out = out.split(zh).join(t(zh))
    }
  })
  return out
}

/** Native H5 <picker> chrome ignores cancel-text; rewrite Cancel/Done after the sheet mounts. */
export function patchUniPickerChrome() {
  if (typeof document === 'undefined' || document.__i18nPickerPatched) return
  document.__i18nPickerPatched = true
  const HOST =
    '.uni-picker, .uni-system-picker, .uni-picker-container, uni-picker, .uni-picker-view-mask'
  const CANCEL_TEXTS = ['Cancel', 'cancel', '取消', 'ยกเลิก', 'ပယ်ဖျက်']
  const DONE_TEXTS = ['Done', 'done', '完成', 'OK', 'Confirm', 'เสร็จสิ้น', 'ပြီးဆုံး']
  function applyLabels() {
    const cancel = t('取消')
    const done = t('完成')
    document.querySelectorAll('.uni-picker-action-cancel').forEach((el) => {
      if ((el.textContent || '').trim() !== cancel) el.textContent = cancel
    })
    document.querySelectorAll('.uni-picker-action-confirm').forEach((el) => {
      if ((el.textContent || '').trim() !== done) el.textContent = done
    })
    document.querySelectorAll(HOST).forEach((box) => {
      const header =
        box.querySelector('.uni-picker-header, .uni-picker-hd, .uni-picker-action-box') ||
        box.firstElementChild
      if (!header) return
      const kids = header.querySelectorAll('div, span, button')
      kids.forEach((el, idx) => {
        const txt = (el.textContent || '').trim()
        if (!txt || txt.indexOf('\n') >= 0) return
        if (CANCEL_TEXTS.indexOf(txt) >= 0 || (idx === 0 && kids.length >= 2 && txt.length <= 12)) {
          if (CANCEL_TEXTS.indexOf(txt) >= 0 && txt !== cancel) el.textContent = cancel
        }
        if (DONE_TEXTS.indexOf(txt) >= 0 && txt !== done) el.textContent = done
      })
    })
  }
  const obs = new MutationObserver(() => applyLabels())
  const start = () => {
    if (!document.documentElement) return
    obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true })
    applyLabels()
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }
}

export function patchUniDialogs() {
  if (typeof uni === 'undefined' || uni.__i18nDialogPatched) return
  uni.__i18nDialogPatched = true
  patchUniPickerChrome()
  const rawModal = uni.showModal.bind(uni)
  uni.showModal = function (options) {
    const opt = Object.assign({}, options || {})
    if (opt.title) opt.title = localizeMessage(opt.title)
    if (opt.content) opt.content = localizeMessage(opt.content)
    opt.confirmText = t(opt.confirmText || '确定')
    if (opt.showCancel !== false) {
      opt.cancelText = t(opt.cancelText || '取消')
    }
    return rawModal(opt)
  }
  const rawToast = uni.showToast.bind(uni)
  uni.showToast = function (options) {
    const opt = Object.assign({}, options || {})
    if (opt.title) opt.title = localizeMessage(opt.title)
    return rawToast(opt)
  }
  const rawLoading = uni.showLoading.bind(uni)
  uni.showLoading = function (options) {
    const opt = Object.assign({}, options || {})
    if (opt.title) opt.title = localizeMessage(opt.title)
    return rawLoading(opt)
  }
  if (uni.setNavigationBarTitle && !uni.__i18nNavPatched) {
    uni.__i18nNavPatched = true
    const rawNav = uni.setNavigationBarTitle.bind(uni)
    uni.setNavigationBarTitle = function (options) {
      const opt = Object.assign({}, options || {})
      if (opt.title) opt.title = t(opt.title)
      return rawNav(opt)
    }
  }
}

export function applyTabBar() {
  const items = [
    t('tab.home'),
    t('tab.cate'),
    t('tab.discover'),
    t('tab.cart'),
    t('tab.user')
  ]
  items.forEach((text, index) => {
    try {
      uni.setTabBarItem({ index, text })
    } catch (e) {
      // ignore
    }
  })
}

export function applyPageTitle() {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1]
    if (!cur || !cur.route) return
    const key = PAGE_TITLES[cur.route]
    if (!key) return
    uni.setNavigationBarTitle({ title: t(key) })
  } catch (e) {
    // ignore
  }
}

export default {
  t,
  getLocale,
  persistLocale,
  applyUniFrameworkLocale,
  applyTabBar,
  applyPageTitle,
  DEFAULT_LANG_LIST
}
