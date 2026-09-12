<template>
  <div class="news-box" :style="boxStyle" v-if="configObj">
    <div class="item" :style="textColor">
      <div class="img-box"><img :src="iconSrc" alt="" /></div>
      <div class="right-box" :style="textPosition">{{ displayNewsTitle }}</div>
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

import { diyCname } from '@/utils/diyCname';
import { getLocalizedDiyVal, getLocalizedDiyUrl, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'home_news_roll',
  ...diyCname('pagediy.newsBroadcast'),
  configName: 'c_news_roll',
  type: 0, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'news', // 外面匹配名称
  icon: 't-icon-zujian-xinwenbobao',
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
    //外部盒子
    boxStyle() {
      return [
        { 'border-radius': this.configObj.bgStyle.val ? this.configObj.bgStyle.val + 'px' : '0' },
        {
          background: `linear-gradient(${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`,
        },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
        { padding: this.configObj.upConfig.val + 'px' + ' ' + 0 + ' ' + this.configObj.downConfig.val + 'px' },
      ];
    },
    //文字位置
    textPosition() {
      return {
        'text-align': this.configObj.textPosition.list[this.configObj.textPosition.tabVal].style,
      };
    },
    //文字颜色
    textColor() {
      return {
        color: this.configObj.textColor.color[0].item,
      };
    },
    displayNewsTitle() {
      const row = this.list && this.list[0] && this.list[0].chiild && this.list[0].chiild[0];
      return getLocalizedDiyVal(row, getUiLocale(this));
    },
    iconSrc() {
      return (
        getLocalizedDiyUrl(this.configObj && this.configObj.logoConfig, getUiLocale(this)) ||
        (this.configObj && this.configObj.logoConfig && this.configObj.logoConfig.url) ||
        ''
      );
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
        name: 'news',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.newsBroadcast'),
        },
        directionConfig: {
          title: this.$t('pagediy.scrollDirection'),
          tabTitle: this.$t('pagediy.textSettings'),
          name: 'directionConfig',
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.upDown'),
              icon: 'icon-shangxia',
              style: 'left',
            },
            {
              val: this.$t('pagediy.leftRightScroll'),
              icon: 'icon-zuoyou',
              style: 'center',
            },
          ],
        },
        textPosition: {
          title: this.$t('pagediy.textPosition'),
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
            {
              val: this.$t('pagediy.alignRight'),
              icon: 'icon-juyou',
              style: 'right',
            },
          ],
        },
        textColor: {
          title: this.$t('pagediy.textColor'),
          color: [
            {
              item: '#333',
            },
          ],
          default: [
            {
              item: '#333',
            },
          ],
        },
        // 背景颜色
        bgColor: {
          title: this.$t('pagediy.backgroundColor'),
          tabTitle: this.$t('pagediy.colorSettings'),
          default: [
            {
              item: '#FFFFFF',
            },
            {
              item: '#FFFFFF',
            },
          ],
          color: [
            {
              item: '#FFFFFF',
            },
            {
              item: '#FFFFFF',
            },
          ],
        },
        listConfig: {
          title: this.$t('pagediy.newsSectionTip'),
          tabTitle: this.$t('pagediy.announcementSettings'),
          max: 10,
          list: [
            {
              status: true,
              chiild: [
                {
                  title: this.$t('content.title'),
                  val: this.$t('content.title'),
                  valJson: '',
                  max: 30,
                  pla: this.$t('pagediy.optionalMax30'),
                  empty: true,
                },
                {
                  title: this.$t('pagediy.link'),
                  val: '',
                  max: 200,
                  pla: this.$t('application.pleaseSelectLink'),
                  status: true,
                },
              ],
            },
          ],
        },
        // 上间距
        upConfig: {
          tabTitle: this.$t('pagediy.marginSettings'),
          title: this.$t('pagediy.topMargin'),
          val: 0,
          min: 0,
          max: 100,
        },
        // 下间距
        downConfig: {
          title: this.$t('pagediy.bottomMargin'),
          val: 0,
          min: 0,
          max: 100,
        },
        // 左右间距
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          val: 12,
          min: 0,
          max: 30,
        },
        // 页面间距
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          tabTitle: this.$t('pagediy.marginSettings'),
          val: 10,
          min: 0,
        },
        logoConfig: {
          tabTitle: this.$t('pagediy.iconSettings'),
          header: this.$t('pagediy.uploadIcon'),
          title: this.$t('pagediy.uploadIcon'),
          tips: this.$t('pagediy.newsIconTip'),
          isShow: 1,
          url: require('@/assets/imgs/new_header.png'),
          urlJson: '',
        },
        bgStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.backgroundCircle'),
          name: 'bgStyle',
          val: 0,
          min: 0,
          max: 30,
        },
      },
      pageData: {},
      list: [],
      imgUrl: '',
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
        this.list = data.listConfig.list;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.pageOn {
  border-radius: 6px !important;
}
.news-box {
  .item {
    display: flex;
    align-items: center;
    margin: 0 10px;
    height: 39px;
    .img-box {
      width: 75px;
      height: 18px;
      border-right: 1px solid #ddd;
      padding-right: 10px;
      img {
        width: 100%;
        height: 100%;
      }
    }

    .right-box {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-left: 8px;
      margin-top: 3px;
      background-size: 20px 20px;
      background-position: right center;
      background-repeat: no-repeat;
    }
  }
}
</style>
