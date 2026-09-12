// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import uploadFromComponent from './index.vue';
import store from '@/store';
import i18n from '@/i18n';
const goodListFrom = {};
goodListFrom.install = function (Vue, options) {
  const ToastConstructor = Vue.extend(uploadFromComponent);
  // 生成一个该子类的实例（独立挂载，需注入 store / i18n 才能用 $t 和 vuex）
  const instance = new ToastConstructor({
    store,
    i18n,
  });
  instance.$mount(document.createElement('div'));
  document.body.appendChild(instance.$el);
  Vue.prototype.$modalGoodList = function (callback, handleNum, row) {
    instance.visible = true;
    instance.callback = callback;
    instance.handleNum = handleNum;
    instance.checked = row;
  };
};
export default goodListFrom;
