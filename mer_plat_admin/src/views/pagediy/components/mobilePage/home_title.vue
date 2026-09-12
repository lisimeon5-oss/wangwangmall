<template>
  <div v-if="configObj" class="title-box acea-row row-between row-middle" :style="boxStyle">
    <div class="acea-row row-middle">
      <div :style="titleStyle">{{ titleTxt }}</div>
      <div class="ml6" :style="titleFuStyle">{{ titleFuTxt }}</div>
    </div>
    <div v-if="!selectShow" :style="titleRightStyle">{{ titleRightTxt }}<i class="el-icon-arrow-right"></i></div>
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
  name: 'home_title',
  ...diyCname('content.title'),
  icon: 't-icon-zujian-biaoti',
  configName: 'c_home_title',
  type: 2, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'titles', // 外面匹配名称
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
        {
          'border-radius':
            this.configObj.bgTopStyle.val +
            'px' +
            ' ' +
            this.configObj.bgTopStyle.val +
            'px' +
            ' ' +
            this.configObj.bgDownStyle.val +
            'px' +
            ' ' +
            this.configObj.bgDownStyle.val +
            'px',
        },
        {
          'background-image': this.selectStyle
            ? `linear-gradient(to right,${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`
            : `url(${this.bgImgUrl})`,
        },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
        { padding: this.configObj.upConfig.val + 'px' + ' ' + '10px' + ' ' + this.configObj.downConfig.val + 'px' },
      ];
    },
    titleStyle() {
      return [
        {
          'font-weight':
            this.configObj.textStyle.tabVal == 2
              ? this.configObj.textStyle.list[this.configObj.textStyle.tabVal].style
              : '',
        },
        {
          'font-style':
            this.configObj.textStyle.tabVal != 2
              ? this.configObj.textStyle.list[this.configObj.textStyle.tabVal].style
              : '',
        },
        {
          fontSize: this.configObj.fontSize.val + 'px',
        },
        { color: this.configObj.fontColor.color[0].item },
      ];
    },
    titleFuStyle() {
      return [
        {
          fontSize: this.configObj.fontFuSize.val + 'px',
        },
        { color: this.configObj.fontFuColor.color[0].item },
      ];
    },
    titleRightStyle() {
      return [
        {
          fontSize: this.configObj.fontRightSize.val + 'px',
        },
        { color: this.configObj.fontRightColor.color[0].item },
      ];
    },
    titleTxt() {
      if (!this.configObj || !this.configObj.titleConfig) return '';
      return getLocalizedDiyVal(this.configObj.titleConfig, getUiLocale(this));
    },
    titleFuTxt() {
      if (!this.configObj || !this.configObj.titleFuConfig) return '';
      return getLocalizedDiyVal(this.configObj.titleFuConfig, getUiLocale(this));
    },
    titleRightTxt() {
      if (!this.configObj || !this.configObj.titleRightConfig) return '';
      return getLocalizedDiyVal(this.configObj.titleRightConfig, getUiLocale(this));
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
    selectShow: {
      handler(nVal, oVal) {
        if (nVal == 0) {
          this.configObj.titleRightConfig.isShow = 1;
        } else {
          this.configObj.titleRightConfig.isShow = 0;
        }
      },
      deep: true,
    },
    selectStyle: {
      handler(nVal, oVal) {
        if (nVal == 0) {
          this.configObj.bgImg.isShow = 1;
          this.configObj.bgColor.isShow = 0;
        } else {
          this.configObj.bgImg.isShow = 0;
          this.configObj.bgColor.isShow = 1;
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      defaultConfig: {
        name: 'titles',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('content.title'),
        },
        titleConfig: {
          tabTitle: this.$t('pagediy.textTitle'),
          title: this.$t('pagediy.titleName'),
          val: this.$t('content.title'),
          valJson: '',
          place: this.$t('pagediy.enterTitleMax8'),
          max: 8,
          isShow: 1,
        },
        titleFuConfig: {
          tabTitle: this.$t('pagediy.textTitle'),
          title: this.$t('pagediy.subtitle'),
          val: this.$t('pagediy.subtitle'),
          valJson: '',
          place: this.$t('pagediy.enterSubtitleMax12'),
          max: 12,
          isShow: 1,
        },
        titleRightConfig: {
          tabTitle: this.$t('pagediy.rightSideText'),
          title: this.$t('pagediy.rightSideText'),
          val: this.$t('user.more'),
          valJson: '',
          place: this.$t('pagediy.enterRightTextMax4'),
          max: 4,
          isShow: 1,
        },
        bgImg: {
          isShow: 1,
          title: this.$t('pagediy.uploadBackgroundImage'),
          tips: this.$t('pagediy.suggest910x86'),
          url: '',
        },
        selectShow: {
          cname: 'selectShow',
          title: this.$t('pagediy.rightButton'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('common.show'),
            },
            {
              val: this.$t('menu.hide'),
            },
          ],
        },
        selectStyle: {
          cname: 'selectStyle',
          title: this.$t('pagediy.selectStyle'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.backgroundImg'),
            },
            {
              val: this.$t('pagediy.backgroundColor'),
            },
          ],
        },
        // 背景颜色
        bgColor: {
          tabTitle: this.$t('pagediy.colorSettings'),
          title: this.$t('pagediy.backgroundColor'),
          isShow: 1,
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
        linkConfig: {
          title: this.$t('pagediy.link'),
          val: '',
          place: this.$t('pagediy.pleaseEnterLink'),
          max: 100,
          isShow: 1,
        },
        fontColor: {
          title: this.$t('pagediy.titleColor'),
          tabTitle: this.$t('pagediy.textSettings'),
          name: 'fontColor',
          default: [
            {
              item: '#282828',
            },
          ],
          color: [
            {
              item: '#282828',
            },
          ],
        },
        bgTopStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.topRadius'),
          name: 'bgStyle',
          val: 0,
          min: 0,
          max: 30,
        },
        bgDownStyle: {
          title: this.$t('pagediy.bottomRadius'),
          name: 'bgStyle',
          val: 0,
          min: 0,
          max: 30,
        },
        textStyle: {
          title: this.$t('pagediy.textStyle'),
          isShow: 1,
          tabVal: 0,
          list: [
            {
              val: this.$t('maintain.normal'),
              style: 'normal',
              icon: 'icon-zhengchang',
            },
            {
              val: this.$t('pagediy.italic'),
              style: 'italic',
              icon: 'icon-qingxie',
            },
            {
              val: this.$t('pagediy.bold'),
              style: 'bold',
              icon: 'icon-jiacu',
            },
          ],
        },
        fontSize: {
          title: this.$t('pagediy.titleText'),
          val: 20,
          min: 12,
          max: 30,
        },
        fontFuColor: {
          title: this.$t('pagediy.subtitleColor'),
          tabTitle: this.$t('pagediy.textSettings'),
          name: 'fontFuColor',
          default: [
            {
              item: '#282828',
            },
          ],
          color: [
            {
              item: '#282828',
            },
          ],
        },
        fontFuSize: {
          title: this.$t('pagediy.subtitleText'),
          val: 14,
          min: 12,
          max: 20,
        },
        fontRightColor: {
          title: this.$t('pagediy.buttonColor'),
          tabTitle: this.$t('pagediy.textSettings'),
          name: 'fontFuColor',
          default: [
            {
              item: '#282828',
            },
          ],
          color: [
            {
              item: '#282828',
            },
          ],
        },
        fontRightSize: {
          title: this.$t('pagediy.buttonText'),
          val: 12,
          min: 12,
          max: 20,
        },
        // 上间距
        upConfig: {
          title: this.$t('pagediy.topMargin'),
          tabTitle: this.$t('pagediy.marginSettings'),
          val: 10,
          min: 0,
          max: 100,
        },
        // 下间距
        downConfig: {
          tabTitle: this.$t('pagediy.marginSettings'),
          title: this.$t('pagediy.bottomMargin'),
          val: 10,
          min: 0,
        },
        // 左右间距
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          val: 12,
          min: 0,
          max: 40,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 10,
          min: 0,
        },
      },
      configObj: null,
      link: '',
      txtPosition: '',
      txtStyle: '',
      fontSize: 0,
      mTOP: 0,
      titleColor: '',
      themeColor: '',
      prConfig: 0,
      bgStyle: 0,
      pageData: {},
      selectShow: '',
      selectStyle: '',
      bgImgUrl: '',
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
        this.link = data.linkConfig.val;
        this.selectShow = this.configObj.selectShow.tabVal;
        this.selectStyle = this.configObj.selectStyle.tabVal;
        this.bgImgUrl = this.configObj.bgImg.url;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.titleOn {
  border-radius: 10px !important;
}
.title-box {
  color: #282828;
  padding: 5px 10px;
  background-repeat: no-repeat;
}
.ml6 {
  margin-left: 6px;
}
</style>
