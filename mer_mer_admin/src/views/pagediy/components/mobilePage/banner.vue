<template>
  <div class="mobile-page" :style="boxStyle" v-if="configObj">
    <div class="banner-two">
      <div class="img-box">
        <div class="img-item itemLeft" v-if="swiperType == 0">
          <img
            class="img-left"
            :style="contentStyleLeft"
            :src="slideImg(imgSrcList[1])"
            alt=""
            v-if="imgSrcList.length > 1 && slideImg(imgSrcList[1])"
          />
          <div :style="contentStyleLeft" class="empty-box empty-left" v-else></div>
        </div>
        <div class="img-item item-middle">
          <img
            class="img-middle"
            :style="contentStyleMiddle"
            :src="slideImg(imgSrcList[0])"
            alt=""
            v-if="imgSrcList.length && slideImg(imgSrcList[0])"
          />
          <div :style="contentStyleMiddle" class="empty-box empty-middle" v-else>
            <span class="iconfont iconfont icontupian"></span>
          </div>
          <div>
            <div class="dot more-dot" :style="dotStyle" v-if="docType === 0">
              <div
                class="dot-item"
                :style="{ background: themeStyle ? configObj.docColor.color[0].item : themeColor }"
              ></div>
              <div class="dot-item"></div>
              <div class="dot-item"></div>
            </div>
            <div class="dot more-dot line-dot" :style="dotStyle" v-if="docType === 1">
              <div
                class="line_dot-item"
                :style="{ background: themeStyle ? configObj.docColor.color[0].item : themeColor }"
              ></div>
              <div class="line_dot-item"></div>
              <div class="line_dot-item"></div>
            </div>
          </div>
        </div>
        <div class="img-item item-right" v-if="swiperType == 0">
          <img
            class="img-right"
            :style="contentStyleRight"
            :src="slideImg(imgSrcList[2])"
            alt=""
            v-if="imgSrcList.length > 2 && slideImg(imgSrcList[2])"
          />
          <div :style="contentStyleRight" class="empty-box empty-right" v-else></div>
        </div>
      </div>
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
import { mapState, mapGetters } from 'vuex';
import { diyCname, mergeDiyUiLabels } from '@/utils/diyCname';
import { getLocalizedDiyImg, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'banner', // 组件名称
  ...diyCname('pagediy.carousel'),
  icon: 't-icon-zujian-lunbotu',
  defaultName: 'swiperBg', // 外面匹配名称
  configName: 'c_banner', // 右侧配置名称
  type: 0, // 0 基础组件 1 营销组件 2工具组件
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
    ...mapGetters(['mobileTheme']),
    //最外层盒子的样式
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
    //内容圆角
    contentStyleLeft() {
      return [
        {
          'border-radius':
            0 + 'px ' + this.configObj.contentStyle.val + 'px ' + this.configObj.contentStyle.val + 'px ' + 0 + 'px',
        },
      ];
    },
    contentStyleMiddle() {
      return [
        {
          'border-radius': this.configObj.contentStyle.val + 'px ',
        },
      ];
    },
    contentStyleRight() {
      return [
        {
          'border-radius':
            this.configObj.contentStyle.val + 'px ' + 0 + 'px ' + 0 + 'px ' + this.configObj.contentStyle.val + 'px',
        },
      ];
    },
    //指示器样式
    dotStyle() {
      return [
        { 'padding-left': this.configObj.lrConfig.val ? this.configObj.lrConfig.val + 30 + 'px' : '40' + 'px' },
        { 'padding-right': this.configObj.lrConfig.val ? this.configObj.lrConfig.val + 30 + 'px' : '40' + 'px' },
        {
          'justify-content':
            this.configObj.txtStyle.tabVal === 1
              ? 'center'
              : this.configObj.txtStyle.tabVal === 2
              ? 'flex-end'
              : 'flex-start',
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
    themeStyle: {
      handler(nVal, oVal) {
        this.configObj.docColor.isShow = this.configObj.themeStyleConfig.tabVal;
      },
      deep: true,
    },
  },
  data() {
    return {
      // 默认初始化数据禁止修改
      defaultConfig: {
        name: 'swiperBg',
        isShow: true,
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.carousel'),
        },
        // 图片列表
        swiperConfig: {
          tabTitle: this.$t('pagediy.sectionSettings'),
          tips: this.$t('pagediy.carouselSectionTip'),
          title: this.$t('pagediy.carouselSectionTip'),
          maxList: 1000,
          list: [
            {
              img: '',
              imgJson: '',
              info: [
                {
                  title: this.$t('pagediy.titleComponent'),
                  value: '今日推荐',
                  tips: '选填，不超过8个字',
                  max: 8,
                },
                {
                  title: this.$t('pagediy.link'),
                  value: '',
                  tips: this.$t('pagediy.pleaseSelectLink'),
                  max: 100,
                },
              ],
            },
          ],
        },
        swiperStyleConfig: {
          tabTitle: this.$t('pagediy.displaySettings'),
          title: this.$t('pagediy.selectStyle'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.styleOne'),
            },
            {
              val: this.$t('pagediy.styleTwo'),
            },
          ],
        },
        // 上间距
        upConfig: {
          title: this.$t('pagediy.topMargin'),
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
        bgStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.backgroundCircle'),
          name: 'bgStyle',
          val: 0,
          min: 0,
          max: 30,
        },
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          val: 12,
          min: 0,
          max: 15,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 0,
          min: 0,
        },
        bgColor: {
          tabTitle: this.$t('pagediy.colorSettings'),
          title: this.$t('pagediy.backgroundColor'),
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
        themeStyleConfig: {
          title: this.$t('pagediy.colorTone'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.followTheme'),
            },
            {
              val: this.$t('pagediy.customStyle'),
            },
          ],
        },
        docColor: {
          title: this.$t('pagediy.indicatorColor'),
          name: 'docColor',
          isShow: 0,
          color: [
            {
              item: '#E93323',
            },
          ],
          default: [
            {
              item: '#E93323',
            },
          ],
        },
        docConfig: {
          cname: 'swiper',
          title: this.$t('pagediy.indicatorStyle'),
          tabTitle: this.$t('pagediy.indicatorSettings'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.circle'),
              icon: 'icon-yuandian',
            },
            {
              val: this.$t('pagediy.straightLine'),
              icon: 'icon-xiantiao',
            },
            {
              val: this.$t('pagediy.noIndicator'),
              icon: 'icon-buxianshi',
            },
          ],
        },
        contentStyle: {
          title: this.$t('pagediy.contentRadius'),
          name: 'contentStyle',
          val: 7,
          min: 0,
          max: 30,
        },
        txtStyle: {
          title: this.$t('pagediy.indicatorPosition'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.alignLeft'),
              icon: 'icon-juzuo',
            },
            {
              val: this.$t('pagediy.alignCenter'),
              icon: 'icon-juzhong',
            },
            {
              val: this.$t('pagediy.alignRight'),
              icon: 'icon-juyou',
            },
          ],
        },
      },
      configObj: null,
      pageData: {},
      imgSrcList: [],
      docType: 0,
      swiperType: 0,
      themeStyle: 0,
      themeColor: '',
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
    onChange() {},
    slideImg(item) {
      return getLocalizedDiyImg(item, getUiLocale(this));
    },
    setConfig(data) {
      if (!data) return;
      if (data) {
        this.configObj = mergeDiyUiLabels(data, this.defaultConfig);
        this.imgSrcList = data.swiperConfig.list;
        this.docType = data.docConfig.tabVal;
        this.swiperType = data.swiperStyleConfig.tabVal;
        this.themeStyle = data.themeStyleConfig.tabVal;
        this.themeColor = this.$options.filters.filterTheme(this.mobileTheme - 1);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.empty-box {
  height: 150px;
  flex: 1;
}

.mobile-page {
  position: relative;
  width: auto;

  .banner {
    width: 100%;
    height: 150px;
    margin-top: 0;
    position: relative;

    &.on {
      margin-top: -160px;
    }

    img {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      object-fit: cover;
      &.doc {
        border-radius: 0 !important;
      }
    }
  }

  .bg {
    width: 100%;
    height: 160px;
  }
}

.dot {
  position: absolute;
  left: 0;
  bottom: 12px;
  width: 100%;
  display: flex;
  align-items: center;

  &.number {
    bottom: 4px;
  }

  .num {
    width: 25px;
    height: 18px;
    line-height: 18px;
    background-color: #000;
    color: #fff;
    opacity: 0.3;
    border-radius: 8px;
    font-size: 12px;
    text-align: center;
  }

  .dot-item {
    width: 5px;
    height: 5px;
    background: #aaaaaa;
    border-radius: 50%;
    margin: 0 3px;
  }

  &.line-dot {
    bottom: 12px;

    .line_dot-item {
      width: 8px;
      height: 2px;
      background: #aaaaaa;
      margin: 0 3px;
    }
  }
}
.banner-two {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 100%;
  height: 150px;

  &.on {
    margin-top: -160px;
  }

  img {
    width: 100%;
    border-radius: 10px;
    // object-fit: contain;

    &.doc {
      border-radius: 0;
    }
  }

  .img-middle {
    height: 150px;
    background-position: center;
    object-fit: cover;
  }

  .img-left {
    height: 140px;
  }

  .img-right {
    height: 140px;
  }

  .empty-box {
    height: 150px;
    background: #f3f9ff;
  }

  .empty-left {
    height: 140px;
  }

  .empty-middle {
    height: 150px;
  }

  .empty-right {
    height: 140px;
  }

  .item-middle {
    flex: 1;
    margin: 0 10px;
  }

  .img-box {
    width: 100%;
    height: 100%;
    display: flex;
  }

  .itemLeft {
    width: 20px;
    height: 134px;
    margin-top: 5px;
  }

  .item-right {
    width: 20px;
    height: 134px;
    margin-top: 5px;
  }
}
.icontupian {
  font-size: 30px !important;
  color: #bbbfc8;
}
</style>
