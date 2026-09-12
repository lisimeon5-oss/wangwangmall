<template>
  <div class="mobile-page" :style="boxStyle" v-if="configObj">
    <div class="box" :style="textStyle"></div>
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
import { diyCname } from '@/utils/diyCname';
export default {
  name: 'z_auxiliary_line',
  ...diyCname('pagediy.guideLine'),
  configName: 'c_auxiliary_line',
  icon: 't-icon-zujian-fuzhuxian',
  type: 2, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'guide', // 外面匹配名称
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
        {
          background: `linear-gradient(${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`,
        },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
      ];
    },
    //线条样式
    textStyle() {
      return [
        {
          borderBottomWidth: this.configObj.heightConfig.val + 'px',
        },
        {
          borderBottomColor: this.configObj.lineColor.color[0].item,
        },
        {
          borderBottomStyle: this.configObj.lineStyle.list[this.configObj.lineStyle.tabVal].style,
        },
      ];
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
        name: 'guide',
        setUp: {
          cname: this.$t('pagediy.guideLine'),
        },
        timestamp: this.num,
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
        lineColor: {
          title: this.$t('pagediy.lineColor'),
          color: [
            {
              item: '#979797',
            },
          ],
          default: [
            {
              item: '#979797',
            },
          ],
        },
        lineStyle: {
          tabTitle: this.$t('pagediy.styleSettings'),
          title: this.$t('pagediy.lineStyle'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.dashedLine'),
              style: 'dashed',
              icon: 'icon-xuxian',
            },
            {
              val: this.$t('pagediy.solidLine'),
              style: 'solid',
              icon: 'icon-shixian',
            },
            {
              val: this.$t('pagediy.dottedLine'),
              style: 'dotted',
              icon: 'icon-dianzhuangxian',
            },
          ],
        },
        heightConfig: {
          title: this.$t('pagediy.guideLineHeight'),
          val: 1,
          min: 1,
        },
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          val: 0,
          min: 0,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 10,
          min: 0,
        },
      },
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
        this.configObj = data;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.mobile-page {
  padding: 10px;
}
</style>
