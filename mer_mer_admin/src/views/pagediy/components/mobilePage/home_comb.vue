<template>
  <div class="page-container" v-if="configObj">
    <div class="bg-img">
      <img :src="imgSrcList.length && slideImg(imgSrcList[0])" alt="" />
      <div class="mask" :style="maskStyle"></div>
    </div>
    <div class="search-box">
      <img src="../../images/leftMenu.png" alt="" mode="widthFix" />
      <div :style="contentStyle" class="box line1"><i class="el-icon-search" />{{ displayHotWord }}</div>
    </div>
    <!--店铺信息-->
    <div id="store" class="diyStore">
      <div class="pictrue overflow" :style="logoStyleRadius">
        <img :src="JavaMerchantConfigInfo.avatar" class="" />
      </div>
      <div class="text">
        <div class="acea-row row-middle">
          <div class="name">{{ JavaMerchantBaseInfo.name }}</div>
          <div class="iconfont icon-xuanze"></div>
        </div>
        <div class="merchantInfo flex mt5">
          <div class="mr6 self_min merType bg-color">{{ $t('merchant.selfOperated') }}</div>
          <div class="mr10 merType color-FAAD14">{{ JavaMerchantBaseInfo.merType }}</div>
          <div class="score">
            <div class="starsList flex">
              <div v-for="(itemn, indexn) in JavaMerchantBaseInfo.starLevel" :key="indexn">
                <span class="iconfont icon-pingfen textE93323"></span>
              </div>
              <div class="flex" v-show="Number(JavaMerchantBaseInfo.starLevel) < 5">
                <span v-for="(itemn, indexn) in noStarLevel" :key="indexn" class="iconfont icon-pingfen noCheck"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button hover-class="none" class="merCollect" :style="followColor">
        <span class="iconfont icon-guanzhu"></span>{{ JavaMerchantBaseInfo.isCollect ? '已关注' : '关注' }}
      </button>
    </div>
    <!--轮播图-->
    <div class="banner-two">
      <div class="img-box">
        <div class="img-item item-left" v-if="swiperType == 0">
          <img
            class="img-left"
            :style="contentStyleBanner"
            :src="slideImg(imgSrcList[1])"
            alt=""
            v-if="imgSrcList.length > 1 && slideImg(imgSrcList[1])"
          />
          <div :style="contentStyleBanner" class="empty-box empty-left" v-else>
            <span class="iconfont iconfont icontupian"></span>
          </div>
        </div>
        <div class="img-item" :class="swiperType == 0 ? 'item-middle' : 'item-middle-2'">
          <img
            class="img-middle"
            :style="contentStyleBanner"
            :src="slideImg(imgSrcList[0])"
            alt=""
            v-if="imgSrcList.length && slideImg(imgSrcList[0])"
          />
          <div :style="contentStyleBanner" class="empty-box empty-middle" v-else>
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
            :style="contentStyleBanner"
            :src="slideImg(imgSrcList[2])"
            alt=""
            v-if="imgSrcList.length > 2 && slideImg(imgSrcList[2])"
          />
          <div :style="contentStyleBanner" class="empty-box empty-right" v-else>
            <span class="iconfont iconfont icontupian"></span>
          </div>
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
import { getLocalizedDiyVal, getLocalizedDiyImg, getUiLocale } from '@/utils/localizedName';
import { diyCname, mergeDiyUiLabels } from '@/utils/diyCname';
export default {
  name: 'home_comb',
  ...diyCname('pagediy.headerComponent'),
  icon: 't-icon-zujian-zuhezujian',
  configName: 'c_home_comb',
  type: 0, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'homeComb', // 外面匹配名称
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
    //关注颜色
    followColor() {
      return [
        {
          color: this.configObj.followColor.color[0].item,
        },
        {
          border: `1px solid ${this.configObj.followColor.color[0].item}`,
        },
      ];
    },
    //指示器样式
    dotStyle() {
      return [
        { padding: '0 22px' },
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
    maskStyle() {
      return {
        background: this.$store.state.mobildConfig.pageColor
          ? `linear-gradient(180deg, rgba(245, 245, 245, 0) 0%, ${this.$store.state.mobildConfig.pageColorPicker} 100%)`
          : `linear-gradient(180deg, rgba(245, 245, 245, 0) 0%, #f5f5f5 100%)`,
      };
    },
    //搜索框样式
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
    //轮播图圆角
    //内容圆角
    contentStyleBanner() {
      return [
        { 'border-radius': this.configObj.contentStyleBanner.val ? this.configObj.contentStyleBanner.val + 'px' : '0' },
      ];
    },
    //logo圆角
    logoStyleRadius() {
      return [
        { 'border-radius': this.configObj.logoStyleRadius.val ? this.configObj.logoStyleRadius.val + 'px' : '0' },
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
        name: 'homeComb',
        timestamp: this.num,
        setUp: {
          cname: this.$t('pagediy.headerComponent'),
        },
        tabConfig: {
          title: this.$t('pagediy.selectComponent'),
          tabTitle: this.$t('pagediy.setContent'),
          tabVal: 0,
          type: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.searchBox'),
              icon: 'icon-zuhe-sousuokuang',
              count: 1,
            },
            {
              val: this.$t('pagediy.storeInfo'),
              icon: 'icon-zuhe-fenlei',
              count: 2,
            },
            {
              val: this.$t('pagediy.carousel'),
              icon: 'icon-zuhe-lunbotu',
              count: 3,
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
          value: this.$t('pagediy.searchProductName'),
          val: this.$t('pagediy.searchProductName'),
          isShow: 1,
        },
        titleConfig: {
          title: this.$t('pagediy.switchTime'),
          val: 3,
          place: this.$t('pagediy.setHotWordDisplayTime'),
          max: 100,
          unit: this.$t('pagediy.second'),
          isShow: 1,
        },
        textPosition: {
          title: this.$t('pagediy.textPosition'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.alignLeft'),
              style: 'left',
              icon: 'icon-juzuo',
            },
            {
              val: this.$t('pagediy.alignCenter'),
              style: 'center',
              icon: 'icon-juzhong',
            },
            {
              val: this.$t('pagediy.alignRight'),
              style: 'right',
              icon: 'icon-juyou',
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
          tabTitle: this.$t('pagediy.styleSettings'),
          title: this.$t('pagediy.textColor'),
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
        // 关注按钮颜色
        followColor: {
          tabTitle: this.$t('pagediy.styleSettings'),
          title: this.$t('pagediy.followButtonColor'),
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
        logoStyleRadius: {
          title: this.$t('pagediy.logoRadius'),
          name: 'logoStyleRadius',
          val: 7,
          min: 0,
          max: 30,
        },
        contentStyle: {
          title: this.$t('pagediy.contentRadius'),
          name: 'contentStyle',
          val: 30,
          min: 0,
          max: 30,
        },
        contentStyleBanner: {
          title: this.$t('pagediy.contentRadius'),
          name: 'contentStyleBanner',
          val: 7,
          min: 0,
          max: 30,
        },
        // 轮播图 图片列表
        swiperConfig: {
          tabTitle: this.$t('pagediy.contentSettings'),
          tips: this.$t('pagediy.bannerImageTip'),
          title: this.$t('pagediy.bannerImageTip'),
          maxList: 10,
          isSmall: true,
          list: [
            {
              img: '',
              imgJson: '',
              info: [
                {
                  title: this.$t('pagediy.titleComponent'),
                  value: '',
                  tips: this.$t('pagediy.optionalMax10'),
                  max: 10,
                },
                {
                  title: this.$t('pagediy.link'),
                  value: '',
                  tips: this.$t('pagediy.pleaseEnterLink'),
                  max: 100,
                },
              ],
            },
          ],
        },
        swiperStyleConfig: {
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
        //色调
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
        // 指示器颜色
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
        // 轮播图点样式
        docConfig: {
          cname: 'swiper',
          title: this.$t('pagediy.indicatorStyle'),
          tabTitle: this.$t('pagediy.styleSettings'),
          isShow: 1,
          tabVal: 0,
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
      // tabVal: '',
      pageData: {},
      logoUrl: '',
      hotWord: '',
      imgSrc: '',
      style: 0,
      list: [],
      curIndex: 0,
      bgUrl: '',
      docType: 0,
      configObj: null,
      JavaMerchantBaseInfo: {}, //商户信息
      JavaMerchantConfigInfo: {}, //商户头像、背景图信息
      noStarLevel: 0,
      imgSrcList: [],
      swiperType: 0,
      themeStyle: 0,
      themeColor: '',
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.pageData = this.$store.state.mobildConfig.defaultArray[this.num];
      this.setConfig(this.pageData);
    });
    this.JavaMerchantBaseInfo = JSON.parse(localStorage.getItem('JavaMerchantBaseInfo'));
    this.JavaMerchantConfigInfo = JSON.parse(localStorage.getItem('JavaMerchantConfigInfo'));
    if (parseInt(this.JavaMerchantBaseInfo.starLevel) < 5)
      this.noStarLevel = 5 - parseInt(this.JavaMerchantBaseInfo.starLevel);
  },
  methods: {
    slideImg(item) {
      return getLocalizedDiyImg(item, getUiLocale(this));
    },
    getConfig(data) {},
    setConfig(data) {
      if (!data) return;
      if (data) {
        this.configObj = mergeDiyUiLabels(data, this.defaultConfig);
        // this.list = data.listConfig.list;
        this.logoUrl = localStorage.getItem('mediaDomain') + '/crmebimage/presets/shoplogo.png';
        this.docType = data.docConfig.tabVal;
        this.hotWord = data.hotWords.list.length > 0 ? data.hotWords.list[0].val : data.placeWords.val;
        this.imgSrcList = data.swiperConfig.list;
        //this.style = data.tabConfig.tabVal;
        this.swiperType = data.swiperStyleConfig.tabVal;
        this.themeStyle = data.themeStyleConfig.tabVal;
        this.themeColor = this.$options.filters.filterTheme(this.mobileTheme - 1);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.dot {
  position: absolute;
  left: 0;
  bottom: 20px;
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
    bottom: 20px;

    .line_dot-item {
      width: 8px;
      height: 2px;
      background: #aaaaaa;
      margin: 0 3px;
    }
  }
}

.page-container {
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  backdrop-filter: blur(95px);
  filter: blur(30rpx);
  padding-bottom: 10px;

  .bg-img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    z-index: -1;
    filter: blur(30rpx);
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      transform: scale(1.2);
      filter: blur(30px);
    }
    .mask {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 68px;
      // background: linear-gradient(180deg, rgba(245, 245, 245, 0) 0%, #f5f5f5 100%);
    }
  }
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  /*height: 27px;*/
  padding: 10px 10px 0;
  cursor: pointer;

  img {
    width: 66px;
    margin-right: 10px;
  }

  .iconfont {
    margin-left: 13px;
    font-size: 18px;
    position: relative;
    color: #fff;

    &::after {
      content: '8';
      width: 11px;
      height: 11px;
      background: #fff;
      color: #e93323;
      border-radius: 50%;
      text-align: center;
      position: absolute;
      top: -3px;
      right: -3px;
      font-size: 1px;
    }
  }

  .box {
    flex: 1;
    height: 30px;
    line-height: 30px;
    color: #999;
    font-size: 12px;
    // padding-left: 10px;
    background: #fff;
    border-radius: 15px;
    position: relative;
    padding: 0 10px 0 25px;

    i {
      font-size: 14px;
      margin-right: 6px;
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

.banner-two {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 100%;
  height: 150px;
  padding: 0 10px;

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
    background-repeat: no-repeat;
    width: 100%;
    height: 150px;
    background-position: center center;
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

  .img-item {
    position: absolute;
    display: inline-block;
    width: 69%;
  }

  .item-middle {
    left: 28px;
    width: 85%;
    height: 150px;
  }
  .item-middle-2 {
    left: 9px;
    width: 95%;
    height: 150px;
  }
  .img-box {
    width: 100%;
    height: 100%;
  }

  .item-left {
    top: 5px;
    left: -243px;
    height: 140px;
  }

  .item-right {
    top: 5px;
    left: 360px;
    height: 140px;
  }
}

.bg {
  width: 100%;
  height: 160px;
}
.pictrue {
  margin-right: 6px !important;
}
.mr6 {
  margin-right: 8px !important;
}
.icon-pingfen {
  font-size: 13px !important;
}
</style>
