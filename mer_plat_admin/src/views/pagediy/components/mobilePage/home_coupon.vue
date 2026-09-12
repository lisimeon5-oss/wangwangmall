<template>
  <div v-if="configObj">
    <div :style="boxStyle">
      <template v-if="listStyle == 0">
        <div class="scroll_box">
          <div
            class="couponBg acea-row row-middle"
            v-for="(item, index) in numShow"
            :key="index"
            :style="contentConfig"
          >
            <div class="left">
              <div :style="priceColorStyle"><span class="price-icon">฿</span><span class="price">80</span></div>
              <div class="title">{{ $t('pagediy.couponMinSpendYuan', { amount: 500 }) }}</div>
            </div>
            <div class="right">{{ $t('pagediy.receive') }}</div>
          </div>
        </div>
      </template>
      <template v-if="listStyle == 1">
        <div class="scroll_box">
          <div class="coupon1 acea-row row-middle">
            <div class="list acea-row row-middle">
              <div class="item" v-for="(item, index) in numShow" :key="index" :style="contentConfig">
                <div class="money" :style="priceColorStyle">
                  <div><span class="lable">฿</span>70</div>
                  <div class="tips">{{ $t('pagediy.couponMinSpend', { amount: 500 }) }}</div>
                </div>
                <div class="sill" :style="btnColorStyle">{{ $t('pagediy.goReceive') }}</div>
                <img src="../../../../assets/imgs/newVip02.png" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="listStyle == 2">
        <div class="scroll_box">
          <div
            class="couponBg acea-row row-middle couponBg-new"
            v-for="(item, index) in numShow"
            :key="index"
            :style="contentConfig"
          >
            <div class="left">
              <div :style="priceColorStyle"><span class="price-icon">฿</span><span class="price">80</span></div>
              <div class="title">{{ $t('pagediy.couponMinSpendYuan', { amount: 500 }) }}</div>
            </div>
            <div class="right">{{ $t('pagediy.claimImmediately') }}</div>
          </div>
        </div>
      </template>
      <template v-if="listStyle == 3">
        <div class="scroll_box">
          <div class="coupon5 acea-row row-middle" :style="boxBg">
            <div class="list acea-row row-middle">
              <div
                class="item acea-row row-middle"
                v-for="(item, index) in numShow"
                :key="index"
                :style="contentConfig"
              >
                <div class="left">
                  <div :style="priceColorStyle" class="money"><span class="label">฿</span>50</div>
                  <div class="tips">{{ $t('pagediy.couponMinSpend', { amount: 5000 }) }}</div>
                </div>
                <div class="right acea-row row-center">
                  <div class="rightCon">{{ $t('pagediy.receive') }}</div>
                </div>
                <div class="roll" :style="boxBg"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
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
export default {
  name: 'home_coupon',
  ...diyCname('pagediy.couponComponent'),
  icon: 't-icon-zujian-youhuiquan',
  configName: 'c_home_coupon',
  type: 1, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'homeCoupon', // 外面匹配名称
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
    ...mapGetters(['mediaDomain', 'mobileTheme']),
    //最外层盒子的样式
    boxStyle() {
      return [
        { 'border-radius': this.configObj.bgStyle.val ? this.configObj.bgStyle.val + 'px' : '0' },
        {
          background:
            this.listStyle != 3
              ? `linear-gradient(to right,${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`
              : this.configObj.bgColorNew.color[0].item,
        },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
        { padding: this.configObj.upConfig.val + 'px' + ' ' + '10px' + ' ' + this.configObj.downConfig.val + 'px' },
      ];
    },
    boxBg() {
      return [
        {
          background: this.configObj.bgColorNew.color[0].item,
        },
      ];
    },
    //内容边距
    contentConfig() {
      return [
        { 'margin-right': this.configObj.contentConfig.val ? this.configObj.contentConfig.val + 'px' : '0' },
        {
          background:
            this.listStyle == 1
              ? this.themeStyle
                ? this.configObj.itemBgColor.color[0].item
                : this.themeColor
              : this.listStyle == 3
              ? `linear-gradient(180deg,${this.configObj.btnColor.color[0].item}, ${
                  this.themeStyle ? this.configObj.btnColor.color[1].item : this.themeColor
                })`
              : '',
        },
      ];
    },
    //优惠金额颜色
    priceColorStyle() {
      return [{ color: this.themeStyle ? this.configObj.priceColor.color[0].item : this.themeColor }];
    },
    //领取按钮
    btnColorStyle() {
      return [
        {
          background: `linear-gradient(90deg,${this.configObj.btnColor.color[0].item}, ${
            this.themeStyle ? this.configObj.btnColor.color[1].item : this.themeColor
          })`,
        },
      ];
    },
    //展示数量
    numShow() {
      return Math.floor(this.configObj.numConfig.val);
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
    listStyle(nVal, oVal) {
      if (this.configObj.themeStyleConfig.tabVal == 1) {
        if (nVal == 0 || nVal == 2) {
          this.configObj.btnColor.isShow = 0;
        } else {
          this.configObj.btnColor.isShow = 1;
        }
        if (nVal == 1) {
          this.configObj.itemBgColor.isShow = 1;
        } else {
          this.configObj.itemBgColor.isShow = 0;
        }
      }
      if (nVal == 1 || nVal == 2 || nVal == 3) {
        this.configObj.priceColor.color[0].item = '#E93323';
        this.configObj.priceColor.default[0].item = '#E93323';
      } else {
        this.configObj.priceColor.color[0].item = '#FFFFFF';
        this.configObj.priceColor.default[0].item = '#FFFFFF';
      }
      if (nVal == 3) {
        this.configObj.bgColor.isShow = 0;
        this.configObj.bgColorNew.isShow = 1;
      } else {
        this.configObj.bgColor.isShow = 1;
        this.configObj.bgColorNew.isShow = 0;
      }
    },
    themeStyle: {
      handler(nVal, oVal) {
        if (this.configObj.themeStyleConfig.tabVal == 0) {
          this.configObj.btnColor.isShow = 0;
          this.configObj.itemBgColor.isShow = 0;
          this.configObj.priceColor.isShow = 0;
        }
        if (this.listStyle == 0 || this.listStyle == 2) {
          this.configObj.btnColor.isShow = 0;
        } else {
          this.configObj.btnColor.isShow = this.configObj.themeStyleConfig.tabVal;
        }
        if (this.listStyle == 1) {
          this.configObj.itemBgColor.isShow = this.configObj.themeStyleConfig.tabVal;
        } else {
          this.configObj.itemBgColor.isShow = 0;
        }
        this.configObj.priceColor.isShow = this.configObj.themeStyleConfig.tabVal;
      },
      deep: true,
    },
  },
  data() {
    return {
      defaultConfig: {
        name: 'homeCoupon',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.couponComponent'),
        },
        tabConfig: {
          title: this.$t('pagediy.displayStyle'),
          tabTitle: this.$t('pagediy.layoutSettings'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.styleOne'),
              icon: 'icon-pintuanyangshiyi',
            },
            {
              val: this.$t('pagediy.styleTwo'),
              icon: 'icon-youhuiquanyangshier',
            },
            {
              val: this.$t('pagediy.styleThree'),
              icon: 'icon-youhuiquanyangshisan',
            },
            {
              val: this.$t('pagediy.styleFour'),
              icon: 'icon-youhuiquanyangshisi',
            },
          ],
        },
        logoConfig: {
          isShow: 1,
          tabTitle: this.$t('pagediy.iconSettings'),
          title: this.$t('pagediy.uploadIcon'),
          tips: this.$t('pagediy.suggestIconSize124'),
          url: localStorage.getItem('mediaDomain') + '/crmebimage/perset/202412/yhq.png',
        },
        linkConfig: {
          title: this.$t('pagediy.moreLink'),
          val: '/pages/activity/couponList/index',
          place: this.$t('pagediy.pleaseSelectLink'),
          isShow: 1,
          max: 100,
        },
        //数量
        numConfig: {
          tabTitle: this.$t('pagediy.displayContent'),
          title: this.$t('pagediy.displayQuantity'),
          strictly: 1,
          val: 5,
          isShow: 1,
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
        // 背景颜色
        bgColorNew: {
          tabTitle: this.$t('pagediy.colorSettings'),
          title: this.$t('pagediy.backgroundColor'),
          isShow: 0,
          color: [
            {
              item: '#FFFFFF',
            },
          ],
          default: [
            {
              item: '#FFFFFF',
            },
          ],
        },
        priceColor: {
          title: this.$t('pagediy.discountAmountColor'),
          isShow: 0,
          color: [
            {
              item: '#FFFFFF',
            },
          ],
          default: [
            {
              item: '#FFFFFF',
            },
          ],
        },
        btnColor: {
          isShow: 0,
          title: this.$t('pagediy.receiveButtonColor'),
          color: [
            {
              item: '#FF7931',
            },
            {
              item: '#E93323',
            },
          ],
          default: [
            {
              item: '#FF7931',
            },
            {
              item: '#E93323',
            },
          ],
        },
        //优惠券背景
        itemBgColor: {
          isShow: 0,
          title: this.$t('pagediy.couponBackground'),
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
        bgStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.backgroundCircle'),
          name: 'bgStyle',
          val: 0,
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
        contentConfig: {
          title: this.$t('pagediy.contentSpacing'),
          val: 5,
          min: 0,
          max: 30,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 10,
          min: 0,
        },
      },
      configObj: null,
      listStyle: 0,
      themeStyle: 0,
      themeColor: '',
    };
  },
  mounted() {
    this.$nextTick(() => {
      let pageData = this.$store.state.mobildConfig.defaultArray[this.num];
      this.setConfig(pageData);
    });
  },
  methods: {
    setConfig(data) {
      if (!data) return;
      if (data) {
        this.configObj = mergeDiyUiLabels(data, this.defaultConfig);
        this.listStyle = this.configObj.tabConfig.tabVal;
        this.themeStyle = data.themeStyleConfig.tabVal;
        this.themeColor = this.$options.filters.filterTheme(this.mobileTheme - 1);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.scroll_box {
  display: flex;
  overflow: hidden;
}
.couponBg {
  width: 127px;
  height: 72px;
  background: url('../../../../assets/imgs/couponBg.png');
  background-size: contain;
  background-repeat: no-repeat;
  flex-shrink: 0;
  color: #fff;
  .left {
    width: 80%;
    text-align: center;
    .price-icon {
      font-weight: 500;
      font-size: 15px;
    }
    .price {
      font-weight: 500;
      font-size: 26px;
    }
    .title {
      font-weight: 400;
      font-size: 13px;
    }
  }
  .right {
    width: 20%;
    font-size: 13px;
    text-align: center;
  }
}
.couponBg-new {
  width: 137px;
  height: 75px;
  background: url('../../../../assets/imgs/couponBg2.png');
  .right {
    width: 13%;
    color: #e93323;
    font-weight: 400;
    font-size: 11px;
    writing-mode: vertical-rl;
    letter-spacing: 1px;
  }
  .title {
    color: #e93323;
  }
}
.coupon1 {
  flex-shrink: 0;
  overflow: hidden;
  .list {
    margin-top: 8px;
    display: inline-flex;
    flex-wrap: nowrap;

    .item {
      width: 78px;
      height: 76px;
      background: #f12a13;
      position: relative;
      border-radius: 6px 6px 15px 15px;
      .money {
        width: 72px;
        height: 53px;
        background: #ffffff;
        border: 1px solid #fceae9;
        position: absolute;
        left: 3px;
        top: -8px;
        text-align: center;
        font-size: 20px;
        font-family: D-DIN-PRO, D-DIN-PRO;
        font-weight: 600;
        color: #e93323;
        padding-top: 6px;
        border-radius: 6px 6px 0 0;
        .lable {
          font-size: 14px;
        }
        .tips {
          font-size: 9px;
          color: #999999;
          font-weight: 500;
        }
      }
      .sill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 39px;
        // background: linear-gradient(90deg, #e93323 0%, #ff7931 100%);
        color: #fff;
        line-height: 46px;
        border-radius: 0 0 15px 15px;
        font-size: 10px;
        text-align: center;
      }
      img {
        position: absolute;
        left: 0;
        width: 78px;
        height: 10px;
        bottom: 32px;
      }
    }
  }
}
.coupon5 {
  flex-shrink: 0;
  // background: #ffffff;
  border-radius: 8px;
  width: 100%;
  overflow: hidden;
  .list {
    flex-wrap: nowrap;
    .item {
      width: 114px;
      height: 54px;
      border-radius: 6px;
      position: relative;

      .roll {
        width: 8px;
        height: 8px;
        background: #fff;
        border-radius: 50%;
        position: absolute;
        left: -4px;
      }
      .right {
        flex: 1;
        .rightCon {
          width: 20px;
          font-size: 12px;
          color: #fff;
          text-align: center;
          line-height: 1.2;
        }
      }
      .left {
        width: 86px;
        height: 100%;
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
        border-radius: 6px;
        text-align: center;
        color: #e93323;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .money {
          font-size: 21px;
          font-family: D-DIN-PRO, D-DIN-PRO;
          font-weight: 600;

          .label {
            font-size: 14px;
          }
        }
        .tips {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
