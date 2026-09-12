<template>
  <div class="text-box acea-row row-between-wrapper">
    <span class="title">{{ titleTxt }}</span>
    <div class="textVal">
      <span class="place">{{ tipVal }}</span>
      <span class="iconfont icon-xuanze"></span>
    </div>
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
import { mapState } from 'vuex';
export default {
  name: 'home_city',
  cname: 'maintain.city',
  icon: 'icon-biaodanzujian-chengshi',
  configName: 'c_home_city',
  type: 0, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'citys', // 外面匹配名称
  props: {
    index: {
      type: null,
    },
    num: {
      type: null,
    },
  },
  computed: {
    ...mapState('mobildConfig', ['defaultArray']),
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
      defaultConfig: {
        name: 'citys',
        timestamp: this.num,
        titleConfig: {
          title: this.$t('formGenerator.title'),
          val: this.$t('maintain.city'),
          place: this.$t('formGenerator.pleaseEnterTitle'),
          max: 10,
          type: 'form',
          isShow: 1,
        },
        valConfig: {
          title: this.$t('formGenerator.defaultValue'),
          tabVal: 1,
          type: 'form',
          list: [
            {
              name: this.$t('maintain.provinceCity'),
            },
            {
              name: this.$t('maintain.provinceCityDistrict'),
            },
            {
              name: this.$t('maintain.provinceCityDistrictStreet'),
            },
          ],
        },
        tipConfig: {
          title: this.$t('maintain.prompt'),
          val: this.$t('common.pleaseSelect'),
          place: this.$t('maintain.pleaseEnterPrompt'),
          max: 10,
          type: 'form',
          isShow: 1,
        },
        titleShow: {
          title: this.$t('formGenerator.required'),
          val: true,
          type: 'form',
        },
      },
      titleTxt: '',
      tipVal: '',
      pageData: {},
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.pageData = this.$store.state.mobildConfig.defaultArray[this.num];
      this.setConfig(this.pageData);
    });
  },
  methods: {
    setConfig(data) {
      if (!data) return;
      if (data.titleConfig) {
        this.titleTxt = data.titleConfig.val;
        this.tipVal = data.tipConfig.val;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.text-box {
  width: 100%;
  background: #fff;
  padding: 11px 10px 11px 12px;
  font-size: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  .title {
    width: 95px;
  }
  .textVal {
    width: 250px;
    text-align: right;
    .iconfont {
      color: #999;
      margin-left: 10px;
    }
    .place {
      font-weight: 400;
      color: #cccccc;
    }
  }
}
</style>
