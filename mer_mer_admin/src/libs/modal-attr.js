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
import attrFrom from '@/components/base/attrFrom.vue';

/**
 * 商品规格弹窗：用 el-dialog 挂载表单，避免 MessageBox 把组件 VNode 置空
 */
export default function modalAttr(val, callback, keyNum) {
  const parent = this;
  const inst = new Vue({
    parent,
    i18n: parent.$i18n,
    store: parent.$store,
    components: { attrFrom },
    data() {
      return {
        visible: true,
        currentRow: val || { ruleName: '', ruleValue: [] },
        formKey: keyNum || Date.now(),
      };
    },
    methods: {
      onGetList() {
        if (typeof callback === 'function') callback();
        this.visible = false;
      },
      onClose() {
        this.visible = false;
      },
      onClosed() {
        this.$destroy();
        if (this.$el && this.$el.parentNode) {
          this.$el.parentNode.removeChild(this.$el);
        }
      },
    },
    render(h) {
      return h(
        'el-dialog',
        {
          props: {
            title: this.$t('product.attrSpecTitle'),
            visible: this.visible,
            width: '720px',
            appendToBody: true,
            closeOnClickModal: false,
            destroyOnClose: true,
          },
          on: {
            'update:visible': (v) => {
              this.visible = v;
            },
            closed: this.onClosed,
          },
        },
        [
          h('attrFrom', {
            key: this.formKey,
            props: {
              currentRow: this.currentRow,
              keyNum: this.formKey,
            },
            on: {
              getList: this.onGetList,
              close: this.onClose,
            },
          }),
        ],
      );
    },
  });
  inst.$mount();
  document.body.appendChild(inst.$el);
  return Promise.resolve();
}
