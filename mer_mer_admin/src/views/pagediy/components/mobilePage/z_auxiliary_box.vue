<template>
  <div v-if="configObj" class="mobile-page">
    <div class="box" :style="boxStyle"></div>
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
  name: 'z_auxiliary_box',
  ...diyCname('pagediy.blankSpace'),
  configName: 'c_auxiliary_box',
  icon: 't-icon-zujian-fuzhukongbai',
  type: 2, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'blankPage', // 外面匹配名称
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
        { height: this.configObj.heightConfig.val + 'px' },
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
        name: 'blankPage',
        timestamp: this.num,
        setUp: {
          cname: this.$t('pagediy.blankSpace'),
        },
        bgColor: {
          title: this.$t('pagediy.backgroundColor'),
          tabTitle: this.$t('pagediy.colorSettings'),
          name: 'bgColor',
          color: [
            {
              item: '#f5f5f5',
            },
            {
              item: '#f5f5f5',
            },
          ],
          default: [
            {
              item: '#f5f5f5',
            },
            {
              item: '#f5f5f5',
            },
          ],
        },
        heightConfig: {
          title: this.$t('pagediy.blankHeight'),
          tabTitle: this.$t('pagediy.heightSettings'),
          val: 10,
          min: 1,
        },
        // 左右间距
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          tabTitle: this.$t('pagediy.marginSettings'),
          val: 0,
          min: 0,
          max: 30,
        },
        // 页面间距
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 10,
          min: 0,
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
        this.configObj = data;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.box {
  height: 20px;
  background: #f5f5f5;
}
</style>
