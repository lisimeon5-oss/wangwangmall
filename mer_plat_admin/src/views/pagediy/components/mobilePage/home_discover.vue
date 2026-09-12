<template>
  <div v-if="configObj">
    <div class="home_plant indexList" :style="boxStyle">
      <div class="bg_box" :style="boxBgStyle"></div>
      <div class="title acea-row row-between-wrapper">
        <div class="text line1 tui-skeleton-rect acea-row">
          <el-image class="image" :src="logoSrc"></el-image>
          <span class="label" :style="titleColor">{{ titleText }}</span>
        </div>
        <div class="more tui-skeleton-rect" :style="moreColor">
          MORE
          <span class="iconfont icon-xuanze"></span>
        </div>
      </div>
      <div class="tips mb10">Strolling the community</div>
      <div class="list-wrapper" :class="'colum' + listStyle" :style="contentConfig">
        <div class="item" :style="contentConfig" v-for="(item, index) in list" :index="index">
          <div class="img-box">
            <div class="mask"></div>
            <img v-if="item.image" :src="item.image" alt="" />
            <div class="empty-box" :style="contentStyle">
              <span class="iconfont icon-tu"></span>
            </div>
          </div>
          <div class="info">
            <template v-if="listStyle === 0">
              <div class="author">
                <div class="acea">
                  <img v-show="avatarShow" src="@/assets/imgs/ren1.png" alt="" />
                  <span :style="nameColor" v-show="nicknameShow">{{ item.nickname }}</span>
                </div>
              </div>
              <div class="title line1" style="margin-top: 5px" :style="laberColor" v-if="titleShow">
                {{ item.store_name }}
              </div>
            </template>
            <template v-else>
              <div class="title line1" :style="laberColor" v-if="titleShow">{{ item.store_name }}</div>
              <div class="author">
                <div class="acea">
                  <img v-show="avatarShow" src="@/assets/imgs/ren1.png" alt="" />
                  <span :style="nameColor" v-show="nicknameShow">{{ item.nickname }}</span>
                </div>
                <div class="likes">
                  <span class="iconfont-h5" :class="item.iconfont"></span>
                  {{ item.likes }}
                </div>
              </div>
            </template>
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
import { diyCname, mergeDiyUiLabels } from '@/utils/diyCname';
import { getFormLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'home_discover',
  ...diyCname('pagediy.plantingCommunity'),
  configName: 'c_home_discover',
  icon: 't-icon-zujian-zhongcaoshequ',
  type: 1, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'homeDiscover', // 外面匹配名称
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
    ...mapGetters(['mediaDomain']),
    previewLang() {
      return (this.configObj && this.configObj.diyMediaLang) || getUiLocale(this);
    },
    titleText() {
      if (!this.configObj || !this.configObj.titleConfig) return '';
      return getFormLocalizedText(this.configObj.titleConfig.val, this.configObj.titleConfig.valJson, this.previewLang);
    },
    logoSrc() {
      if (!this.configObj || !this.configObj.logoConfig) return '';
      const picked = getFormLocalizedText(
        this.configObj.logoConfig.url,
        this.configObj.logoConfig.urlJson,
        this.previewLang,
      );
      if (picked) return picked;
      if (this.previewLang === 'zh-cn') {
        return (
          this.configObj.logoConfig.url ||
          localStorage.getItem('mediaDomain') + '/crmebimage/presets/guangguang.png'
        );
      }
      return '';
    },
    //最外层盒子的样式
    boxStyle() {
      return [
        { 'border-radius': this.configObj.bgStyle.val ? this.configObj.bgStyle.val + 'px' : '0' },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
        { padding: this.configObj.upConfig.val + 'px' + ' ' + '10px' + ' ' + this.configObj.downConfig.val + 'px' },
      ];
    },
    //图片背景
    boxBgStyle() {
      return {
        backgroundImage: `url(${this.mediaDomain}/crmebimage/presets/discoverbj.png),linear-gradient(${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`,
      };
    },
    //内容边距
    contentConfig() {
      if (this.listStyle === 0) {
        return [
          { 'margin-right': this.configObj.contentConfig.val ? this.configObj.contentConfig.val + 'px' : '0' },
          { 'border-radius': this.configObj.contentStyle.val + 'px' },
        ];
      } else {
        return [
          { 'grid-gap': this.configObj.contentConfig.val ? this.configObj.contentConfig.val + 'px' : '0' },
          { 'border-radius': this.configObj.contentStyle.val + 'px' },
        ];
      }
    },
    //作者昵称
    nameColor() {
      return { color: this.configObj.nameColor.color[0].item };
    },
    //标题颜色
    titleColor() {
      return { color: this.configObj.titleColor.color[0].item };
    },
    //文章标题颜色
    laberColor() {
      return { color: this.configObj.laberColor.color[0].item };
    },
    //更多颜色
    moreColor() {
      return { color: this.configObj.moreColor.color[0].item };
    },
    //展示数量
    numConfig() {
      return this.configObj.numConfig.val;
    },
    //图片样式
    contentStyle() {
      return {
        'border-radius': this.configObj.contentStyle.val + 'px',
      };
    },
    //标题
    titleShow() {
      if (this.configObj.typeConfig.activeValue.indexOf(0) !== -1) {
        return true;
      } else {
        return false;
      }
    },
    //头像
    avatarShow() {
      if (this.configObj.typeConfig.activeValue.indexOf(1) !== -1) {
        return true;
      } else {
        return false;
      }
    },
    //昵称
    nicknameShow() {
      if (this.configObj.typeConfig.activeValue.indexOf(2) !== -1) {
        return true;
      } else {
        return false;
      }
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
        name: 'homeDiscover',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.plantingCommunity'),
        },
        productList: {
          title: this.$t('pagediy.recommendGroup'),
          list: [],
        },
        logoConfig: {
          isShow: 1,
          tabTitle: this.$t('pagediy.iconSettings'),
          title: this.$t('pagediy.uploadIcon'),
          tips: this.$t('pagediy.suggestIconSize124'),
          url: localStorage.getItem('mediaDomain') + '/crmebimage/presets/guangguang.png',
          urlJson: '',
        },
        titleConfig: {
          tabTitle: this.$t('pagediy.titleSettings'),
          title: this.$t('pagediy.titleContent'),
          val: this.$t('pagediy.lifeGoodsShare'),
          valJson: '',
          place: this.$t('pagediy.pleaseEnterTitle'),
          isShow: 1,
          max: 30,
        },
        linkConfig: {
          title: this.$t('pagediy.moreLink'),
          val: '/pages/discover_index/index',
          place: this.$t('pagediy.pleaseSelectLink'),
          isShow: 1,
          max: 100,
        },
        //数量
        numConfig: {
          tabTitle: this.$t('pagediy.displayContent'),
          title: this.$t('pagediy.displayQuantity'),
          val: 3,
          isShow: 1,
          max: 8,
        },
        //显示内容
        typeConfig: {
          tabTitle: this.$t('pagediy.displayContent'),
          title: this.$t('pagediy.displayContent'),
          name: 'typeConfig',
          activeValue: [0, 1, 2],
          list: [
            {
              val: this.$t('content.articleTitle'),
            },
            {
              val: this.$t('pagediy.authorAvatar'),
            },
            {
              val: this.$t('pagediy.authorNickname'),
            },
          ],
        },
        tabConfig: {
          tabTitle: this.$t('pagediy.layoutSettings'),
          title: this.$t('pagediy.displayStyle'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.singleRowMode'),
              icon: 'icon-yangshiyi',
            },
            {
              val: this.$t('pagediy.dualRowMode'),
              icon: 'icon-yangshisan',
            },
          ],
        },
        bgColor: {
          tabTitle: this.$t('pagediy.colorSettings'),
          title: this.$t('pagediy.backgroundColor'),
          color: [
            {
              item: '#D2B0FF',
            },
            {
              item: '#FFFFFF',
            },
          ],
          default: [
            {
              item: '#D2B0FF',
            },
            {
              item: '#FFFFFF',
            },
          ],
        },
        laberColor: {
          name: 'laberColor',
          title: this.$t('pagediy.articleTitleColor'),
          color: [
            {
              item: '#282828',
            },
          ],
          default: [
            {
              item: '#282828',
            },
          ],
        },
        nameColor: {
          name: 'nameColor',
          title: this.$t('pagediy.authorNickname'),
          color: [
            {
              item: '#282828',
            },
          ],
          default: [
            {
              item: '#282828',
            },
          ],
        },
        titleColor: {
          title: this.$t('pagediy.titleColor'),
          color: [
            {
              item: '#999999',
            },
          ],
          default: [
            {
              item: '#999999',
            },
          ],
        },
        moreColor: {
          title: this.$t('pagediy.moreButtonColor'),
          color: [
            {
              item: '#282828',
            },
          ],
          default: [
            {
              item: '#282828',
            },
          ],
        },
        bgStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.backgroundCircle'),
          name: 'bgStyle',
          val: 7,
          min: 0,
          max: 30,
        },
        contentStyle: {
          title: this.$t('pagediy.imageRadius'),
          name: 'bgStyle',
          val: 7,
          min: 0,
          max: 30,
        },
        // 上间距
        upConfig: {
          tabTitle: this.$t('pagediy.marginSettings'),
          title: this.$t('pagediy.topMargin'),
          val: 10,
          min: 0,
          max: 100,
        },
        // 下间距
        downConfig: {
          title: this.$t('pagediy.bottomMargin'),
          val: 10,
          min: 0,
        },
        // 左右间距
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          val: 12,
          min: 0,
          max: 25,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 10,
          min: 0,
        },
        contentConfig: {
          title: this.$t('pagediy.contentSpacing'),
          val: 10,
          min: 0,
          max: 30,
        },
      },
      navlist: [],
      list: [
        {
          image: '',
          store_name: this.$t('pagediy.previewDiscoverStore'),
          nickname: this.$t('pagediy.previewDiscoverAuthor'),
          avatar: '',
          iconfont: 'icon-shoucang',
          likes: '1.5w',
        },
        {
          image: '',
          store_name: this.$t('pagediy.previewDiscoverStore'),
          nickname: this.$t('pagediy.previewDiscoverAuthor'),
          avatar: '',
          iconfont: 'icon-shoucang1',
          likes: '215',
        },
        {
          image: '',
          store_name: this.$t('pagediy.previewDiscoverStore'),
          nickname: this.$t('pagediy.previewDiscoverAuthor'),
          avatar: '',
          iconfont: 'icon-shoucang1',
          likes: '1.5w',
        },
      ],
      discoverList: [],
      pageData: {},
      listStyle: 0,
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
        if (!Object.prototype.hasOwnProperty.call(this.configObj.titleConfig || {}, 'valJson')) {
          this.$set(this.configObj.titleConfig, 'valJson', '');
        }
        if (!Object.prototype.hasOwnProperty.call(this.configObj.logoConfig || {}, 'urlJson')) {
          this.$set(this.configObj.logoConfig, 'urlJson', '');
        }
        this.navlist = this.configObj.tabConfig.list;
        this.listStyle = this.configObj.tabConfig.tabVal;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.more {
  position: relative;
}
.tips {
  position: relative;
}
.title {
  .pictrue {
    width: 62px;
    height: 16px;

    el-image {
      width: 100%;
      height: 100%;
    }
  }

  .lines {
    width: 1px;
    height: 12px;
    background-color: #fff;
    opacity: 0.6;
    margin-left: 8px;
  }

  .point {
    font-size: 10px;
    color: #fff;
    margin-left: 10px;
    margin-right: 2px;
    z-index: 9;
  }
  .styleAll {
    width: 17px;
    height: 17px;
    background-color: #2f2f2f;
    border-radius: 3px;
    color: #fff;
    text-align: center;
  }
}
p {
  margin: 0;
  padding: 0;
  line-height: 1.5;
}
.line1 {
  white-space: nowrap;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
}
.home_plant {
  width: auto;
  background: #fff;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  .bg_box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 128px;
    background-repeat: no-repeat;
    background-size: cover;
  }
  .title-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 13px;
    background: linear-gradient(
      180deg,
      rgba(249, 126, 59, 0.2) 0%,
      rgba(249, 126, 59, 0.2) 1%,
      rgba(249, 126, 59, 0) 100%
    );
    // background-image: url("../../assets/images/plant_bg.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    border-radius: 10px 10px 0 0;
    img {
      width: 60px;
      height: 15px;
    }
    .right {
      font-size: 12px;
      color: #282828;
      span {
        font-size: 8px;
      }
    }
  }
  .list-wrapper {
    display: flex;
    background-color: #fff;
    .item {
      width: 140px;
      position: relative;
      .img-box {
        position: relative;
        width: 140px;
        height: 140px;
        .mask {
          display: block;
          width: 140px;
          height: 140px;
          // background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
          // border-radius: 6px;
        }
        img,
        .box {
          width: 100%;
          height: 100%;
          border-radius: 10px 10px 0px 0px;
        }
        .box {
          background: #d8d8d8;
        }
      }
      .info {
        padding: 0 0 8px 8px;
        color: #ffffff;
        font-size: 12px;
        border-radius: 0px 0px 10px 10px;
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0;
        z-index: 11;
        .author {
          margin-top: 5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .acea,
          .likes {
            display: flex;
            align-items: center;
            .icon-shoucang1 {
              color: #e93323;
              margin-right: 3px;
            }
          }
          .likes {
            color: #999;
          }
          img {
            width: 17px;
            height: 17px;
            border-radius: 100%;
          }
          span {
            margin-left: 3px;
          }
        }
      }
    }
    &.colum0 {
      overflow: hidden;
    }
    &.colum1 {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: auto;
      width: 100%;
      .item {
        width: auto;
        &:nth-child(2n) {
          margin-right: 0 !important;
        }
        .img-box {
          width: 100%;
          height: 160px;
          .mask {
            width: 100%;
            height: 160px;
          }
        }
        .info {
          padding: 14px 5px 0 5px;
          position: static;
          color: #282828;
          .title {
            font-weight: bold;
          }
          .avatar {
            margin-top: 8px;
            width: 23px;
            height: 23px;
          }
        }
      }
    }
  }
}
</style>
