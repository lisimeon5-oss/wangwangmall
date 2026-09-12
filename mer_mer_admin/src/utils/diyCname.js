import i18n from '@/i18n';
import zhCN from '@/i18n/langs/zh-cn';
import enUS from '@/i18n/langs/en';
import thTH from '@/i18n/langs/th';
import myMM from '@/i18n/langs/my';

/** DIY 组件选项里的 cname 不能写 this.$t（模块加载时 this 为空，装修页会白屏） */
export function diyCname(key) {
  return {
    get cname() {
      return i18n.t(key);
    },
  };
}

const EXTRA_LABEL_KEYS = {
  背景颜色: 'pagediy.backgroundColor',
  商品名称颜色: 'pagediy.productTitleColor',
  显示信息: 'pagediy.displayInfo',
  '建议：124px*32px': 'pagediy.suggestIconSize124',
  邀请你的好友来参与: 'pagediy.seckillInviteTitle',
  一家很有品的店: 'pagediy.demoShopName',
  图片间距: 'pagediy.imageSpacing',
};

function buildLabelMap() {
  const map = Object.assign({}, EXTRA_LABEL_KEYS);
  [zhCN, enUS, thTH, myMM].forEach((pack) => {
    ['pagediy', 'marketing', 'product', 'order', 'application'].forEach((ns) => {
      const obj = pack[ns];
      if (!obj) return;
      Object.keys(obj).forEach((k) => {
        const v = obj[k];
        if (typeof v === 'string' && v && !map[v]) {
          map[v] = ns + '.' + k;
        }
      });
    });
  });
  return map;
}

const LABEL_MAP = buildLabelMap();

/** 已保存装修 JSON 里的中文标签，按当前后台语言显示 */
export function diyUiText(text) {
  const raw = text == null ? '' : String(text);
  if (!raw) return raw;
  const key = LABEL_MAP[raw];
  if (!key) return raw;
  const out = i18n.t(key);
  return out && out !== key ? out : raw;
}

function resolveDataFn(element) {
  if (!element) return null;
  if (typeof element.data === 'function') return element.data;
  if (element.options && typeof element.options.data === 'function') return element.options.data;
  return null;
}

/** 拖入/点击添加时 vuex 会裸调 component.data()，此时没有 Vue 实例，this.$t 会报错 */
export function getDiyDefaultConfig(element) {
  const dataFn = resolveDataFn(element);
  if (!dataFn) return {};
  try {
    const result = dataFn.call({
      num: element.num,
      $t: (...args) => i18n.t(...args),
    });
    return (result && result.defaultConfig) || {};
  } catch (e) {
    return {};
  }
}

const UI_KEYS = ['title', 'tabTitle', 'tips', 'place', 'header', 'cname'];

/** 已保存模板里的中文标签覆盖为当前语言，保留用户填写的内容 */
export function mergeDiyUiLabels(saved, fresh) {
  if (!saved || !fresh) return saved;
  Object.keys(fresh).forEach((key) => {
    const src = fresh[key];
    const dst = saved[key];
    if (!src || !dst || typeof src !== 'object' || typeof dst !== 'object' || Array.isArray(src)) return;
    UI_KEYS.forEach((k) => {
      if (src[k] != null && src[k] !== '') dst[k] = src[k];
    });
    if (!Array.isArray(src.list) || !Array.isArray(dst.list) || !src.list.length) return;
    const first = src.list[0];
    if (
      first &&
      first.val != null &&
      first.title == null &&
      first.info == null &&
      !Object.prototype.hasOwnProperty.call(first, 'activeList') &&
      !Object.prototype.hasOwnProperty.call(first, 'valJson')
    ) {
      dst.list.forEach((item, i) => {
        if (item && src.list[i] && src.list[i].val != null) item.val = src.list[i].val;
      });
    }
    if (first && first.name != null && first.val == null && first.title == null && first.info == null) {
      dst.list.forEach((item, i) => {
        if (item && src.list[i] && src.list[i].name != null) item.name = src.list[i].name;
      });
    }
    if (first && first.chiild) {
      dst.list.forEach((item) => {
        if (!item || !item.chiild) return;
        item.chiild.forEach((child, i) => {
          const srcChild = first.chiild[i];
          if (!child || !srcChild) return;
          if (srcChild.title != null) child.title = srcChild.title;
          if (srcChild.pla != null) child.pla = srcChild.pla;
        });
      });
    }
    if (first && first.info) {
      dst.list.forEach((item) => {
        if (!item || !item.info) return;
        item.info.forEach((info, i) => {
          const srcInfo = first.info[i];
          if (!info || !srcInfo) return;
          if (srcInfo.title != null) info.title = srcInfo.title;
          if (srcInfo.tips != null) info.tips = srcInfo.tips;
        });
      });
    }
  });
  return saved;
}

export function applyDiyUiLabels(saved, element) {
  return mergeDiyUiLabels(saved, getDiyDefaultConfig(element));
}
