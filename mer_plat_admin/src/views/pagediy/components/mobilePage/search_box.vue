<template>
  <div class="search-box" :style="boxStyle" v-if="configObj">
    <img class="logo-img" :src="logoUrl" alt="" v-if="configObj.logoConfig.isShow === 1 && logoUrl" />
    <div :style="contentStyle" class="box">
      <span class="line1"
        ><i class="el-icon-search" /><span>{{ displayHotWord }}</span></span
      >
    </div>
    <div class="capsule"><img src="@/assets/imgs/capsule.png" alt="" /></div>
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
import { diyCname } from '@/utils/diyCname';
import { getLocalizedDiyVal, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'search_box',
  ...diyCname('pagediy.searchBox'),
  icon: 't-icon-zujian-sousuokuang',
  configName: 'c_search_box',
  type: 0, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'headerSerch', // 外面匹配名称
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
    //最外层盒子的样式
    boxStyle() {
      return [
        { 'border-radius': this.configObj.bgStyle.val ? this.configObj.bgStyle.val + 'px' : '0' },
        {
          background: `linear-gradient(${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`,
        },
        { margin: 0 + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
        { padding: '12px' + ' ' + '12px' + ' ' + '12px' },
      ];
    },
    //内容圆角
    contentStyle() {
      return [
        { 'border-radius': this.configObj.contentStyle.val ? this.configObj.contentStyle.val + 'px' : '0' },
        {
          background: this.configObj.borderColor.color[0].item,
        },
        {
          color: this.configObj.textColor.color[0].item,
        },
        {
          'text-align': this.configObj.textPosition.list[this.configObj.textPosition.tabVal].style,
        },
      ];
    },
    displayHotWord() {
      const data = this.configObj;
      if (!data) return this.hotWord;
      const locale = getUiLocale(this);
      if (data.hotWords && data.hotWords.list && data.hotWords.list.length > 0) {
        return getLocalizedDiyVal(data.hotWords.list[0], locale);
      }
      return getLocalizedDiyVal(data.placeWords, locale);
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
        name: 'headerSerch',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.searchBox'),
        },
        textPosition: {
          title: this.$t('pagediy.textPosition'),
          tabTitle: this.$t('pagediy.textPosition'),
          name: 'textPosition',
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.alignLeft'),
              icon: 'icon-juzuo',
              style: 'left',
            },
            {
              val: this.$t('pagediy.alignCenter'),
              icon: 'icon-juzhong',
              style: 'center',
            },
          ],
        },
        bgStyle: {
          title: this.$t('pagediy.backgroundCircle'),
          tabTitle: this.$t('pagediy.radiusSettings'),
          name: 'bgStyle',
          val: 0,
          min: 0,
          max: 30,
        },
        contentStyle: {
          title: this.$t('pagediy.contentRadius'),
          name: 'contentStyle',
          val: 15,
          min: 0,
          max: 30,
        },
        // 背景颜色
        bgColor: {
          title: this.$t('pagediy.backgroundColor'),
          tabTitle: this.$t('pagediy.colorSettings'),
          color: [
            {
              item: '#E93323',
            },
            {
              item: '#E93323',
            },
          ],
          default: [
            {
              item: '#E93323',
            },
            {
              item: '#E93323',
            },
          ],
        },
        // 框体颜色
        borderColor: {
          title: this.$t('pagediy.frameColor'),
          color: [
            {
              item: '#fff',
            },
          ],
          default: [
            {
              item: '#fff',
            },
          ],
        },
        textColor: {
          title: this.$t('pagediy.inputTextColor'),
          default: [
            {
              item: '#303133',
            },
          ],
          color: [
            {
              item: '#303133',
            },
          ],
        },
        hotWords: {
          title: this.$t('pagediy.searchHotWords'),
          tabTitle: this.$t('pagediy.searchHotWords'),
          tips: this.$t('pagediy.searchHotWordsTip'),
          list: [
            {
              val: '兰蔻小黑瓶',
              valJson: '',
            },
          ],
        },
        placeWords: {
          title: this.$t('pagediy.hintText'),
          tabTitle: this.$t('pagediy.hintTextSettings'),
          val: this.$t('pagediy.searchProductName'),
          isShow: 1,
        },
        // prConfig: {
        //   title: this.$t('pagediy.backgroundMargin'),
        //   val: 15,
        //   min: 0,
        // },
        titleConfig: {
          title: this.$t('pagediy.switchTime'),
          val: 3,
          place: this.$t('pagediy.setHotWordDisplayTime'),
          max: 100,
          unit: this.$t('pagediy.second'),
          isShow: 1,
        },
        // 左右间距
        lrConfig: {
          tabTitle: this.$t('pagediy.marginSettings'),
          title: this.$t('pagediy.leftRightMargin'),
          val: 12,
          min: 0,
          max: 20,
        },
        searConfig: {
          title: this.$t('pagediy.selectTemplate'),
          tabTitle: this.$t('pagediy.layoutSettings'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.fullWidth'),
              icon: 'icon-tonglan',
              count: 1,
            },
            {
              val: 'logo',
              icon: 'icon-logo',
              count: 2,
            },
          ],
        },
        logoConfig: {
          isShow: 0,
          title: this.$t('pagediy.defaultLogo'),
          tips: this.$t('pagediy.suggestLogoSize'),
          header: this.$t('pagediy.setLogo'),
          url: '',
        },
        logoFixConfig: {
          isShow: 0,
          title: this.$t('pagediy.stickyLogo'),
          tips: this.$t('pagediy.suggestLogoSize'),
          header: this.$t('pagediy.setLogo'),
          url: '',
        },
      },
      // tabVal: '',
      bgColor: [],
      pageData: {},
      logoUrl: '',
      hotWord: '',
      slider: 0,
      prConfig: 0,
      configObj: null,
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
      if (data) {
        this.configObj = data;
        this.bgColor = data.bgColor.color;
        this.logoUrl = data.logoConfig.url;
        this.prConfig = data.lrConfig.val;
        this.hotWord = data.hotWords.list.length > 0 ? data.hotWords.list[0].val : data.placeWords.val;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.search-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  backdrop-filter: blur(15px);
  img {
    width: 70px;
    height: 30px !important;
    margin-right: 10px;
  }
  .box {
    display: flex;
    align-items: center;
    flex: 1;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    padding-left: 10px;
    background: rgba(228, 228, 228, 0.9);
    position: relative;
    i {
      font-size: 14px;
      margin-right: 6px;
    }
    .line1 {
      display: inline-block;
      width: 150px;
    }
  }
}
.capsule {
  width: 80px;
  height: 30px;
  margin-left: 7px;
  opacity: 0.8;
  img {
    width: 80px;
    height: 30px;
  }
}
.logo-img {
  height: 30px !important;
}
</style>
