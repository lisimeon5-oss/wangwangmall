<template>
  <div class="mobile-page" v-if="configObj">
    <div class="box" :style="boxStyle" v-html="richTextDisplay"></div>
  </div>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import { mapState, mapMutations } from 'vuex';
import { diyCname, mergeDiyUiLabels } from '@/utils/diyCname';
import { getFormLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'z_ueditor',
  ...diyCname('pagediy.richText'),
  configName: 'c_ueditor_box',
  icon: 't-icon-zujian-fuwenben',
  type: 2, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'richTextEditor', // 外面匹配名称
  props: {
    index: {
      type: null,
      default: -1,
    },
    num: {
      type: null,
    },
  },
  computed: {
    ...mapState('mobildConfig', ['defaultArray']),
    //外部盒子
    boxStyle() {
      return [
        { 'border-radius': this.configObj.bgStyle.val ? this.configObj.bgStyle.val + 'px' : '0' },
        {
          background: `linear-gradient(${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`,
        },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
      ];
    },
    previewLang() {
      return (this.configObj && this.configObj.diyMediaLang) || getUiLocale(this);
    },
    richTextDisplay() {
      if (!this.configObj || !this.configObj.richText) return '';
      return getFormLocalizedText(this.configObj.richText.val, this.configObj.richText.valJson, this.previewLang);
    },
  },
  watch: {
    pageData: {
      handler(nVal, oVal) {
        this.setConfig(nVal);
      },
      deep: true,
    },
    num: {
      handler(nVal, oVal) {
        let data = this.$store.state.mobildConfig.defaultArray[nVal];
        this.setConfig(data);
      },
      deep: true,
    },
    defaultArray: {
      handler(nVal, oVal) {
        let data = this.$store.state.mobildConfig.defaultArray[this.num];
        this.setConfig(data);
      },
      deep: true,
    },
  },
  data() {
    return {
      // 默认初始化数据禁止修改
      defaultConfig: {
        name: 'richTextEditor',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.richText'),
        },
        // 背景颜色
        bgColor: {
          title: this.$t('pagediy.backgroundColor'),
          tabTitle: this.$t('pagediy.colorSettings'),
          color: [
            {
              item: '#FFFFFF',
            },
            {
              item: '#FFFFFF',
            },
          ],
          default: [
            {
              item: '#FFFFFF',
            },
            {
              item: '#FFFFFF',
            },
          ],
        },
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          tabTitle: this.$t('pagediy.marginSettings'),
          val: 12,
          min: 0,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 10,
          min: 0,
        },
        bgStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.backgroundCircle'),
          name: 'bgStyle',
          val: 0,
          min: 0,
          max: 30,
        },
        richText: {
          tabTitle: this.$t('pagediy.richTextContent'),
          val: '',
          valJson: '',
        },
      },
      pageData: {},
      configObj: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.num) {
        this.pageData = this.$store.state.mobildConfig.defaultArray[this.num];
        this.setConfig(this.pageData);
      }
    });
  },
  methods: {
    setConfig(data) {
      if (!data) return;
      if (data) {
        this.configObj = mergeDiyUiLabels(data, this.defaultConfig);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.mobile-page ::v-deep video {
  width: 100% !important;
}
.box {
  min-height: 100px;
  padding: 10px;
  background: #f5f5f5;
  ::v-deep img {
    max-width: 100%;
    height: auto;
  }
}
</style>
