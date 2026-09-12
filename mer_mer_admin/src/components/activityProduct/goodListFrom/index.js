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
  const instance = new ToastConstructor({
    store,
    i18n,
  });
  instance.$mount(document.createElement('div'));
  document.body.appendChild(instance.$el);
  Vue.prototype.$modalActivityProduct = function (callback, handleNum, row, activityId, marketingType) {
    instance.callback = callback;
    instance.handleNum = handleNum;
    instance.checked = row || [];
    instance.activityId = activityId;
    instance.marketingType = marketingType;
    instance.visible = true;
  };
};
export default goodListFrom;
