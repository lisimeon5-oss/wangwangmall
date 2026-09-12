<!-- 拼团 -->
<template>
  <div class="groupBox" v-if="configObj" :style="boxPadding">
    <div class="group" :style="boxStyle">
      <div class="group-top acea-row row-middle row-between" :style="selectBgImg == 0 ? bgImgStyle : headerBgStyle">
        <div class="group-top-left acea-row">
          <img v-if="selectStyle == 0" :src="logoUrl" alt="" class="group_logo" />
          <div v-else class="titleFont" :style="headerTitleConfig">{{ titleConfig }}</div>
          <div class="interval" :style="lineColor"></div>
          <img src="@/assets/imgs/pinkHead.png" alt="" class="pinkHead" :style="contentStyle" />
          <div class="num" :style="titleColor">{{ $t('pagediy.peopleGroupSuccess', { count: 134 }) }}</div>
        </div>
        <div class="group-top-right" :style="headerBtnColor">
          {{ $t('pagediy.more') }}
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
      <!-- 样式一 -->
      <div v-if="listStyle == 0" :style="boxBgStyle" class="group-bottom">
        <div v-for="(item, index) in 2" :key="index" :style="index > 0 ? contentConfig : {}">
          <div class="acea-row row-between">
            <div class="group-bottom-left">
              <div class="img acea-row row-center row-middle" :style="contentStyle">
                <img src="@/assets/imgs/shan.png" alt="" class="shan" />
              </div>
            </div>
            <div class="group-bottom-right acea-row row-column row-between">
              <div class="right-top">
                <div class="title line2" v-if="typeShow.includes(0)" :style="nameColor">
                  {{ $t('pagediy.previewProductName') }}
                </div>
                <div class="pink acea-row" v-if="typeShow.includes(1)">
                  <div class="people-box acea-row" :style="groupTitleColor">
                    <div class="people" :style="groupTitleColor">{{ $t('marketing.peopleGroup', { count: 2 }) }}</div>
                    <div class="groupNum" :style="groupTitleFontColor">{{ $t('pagediy.joinedCopies', { count: 3 }) }}</div>
                  </div>
                </div>
              </div>
              <div class="right-bottom acea-row row-between">
                <div class="price">
                  <div class="pinkNum" v-if="typeShow.includes(2)" :style="priceColor">
                    <span class="pinkNum-title">{{ $t('pagediy.previewGroupPrice') }}</span><span class="pinkNum-icon">฿</span
                    ><span class="pinkNum-num semiBold">3200.00</span>
                  </div>
                  <div class="num" v-if="typeShow.includes(3)" :style="originalColor">
                    <span class="num-title">{{ $t('pagediy.previewSinglePrice') }}</span><span class="num-icon">฿</span
                    ><span class="icon-num semiBold">4233.00</span>
                  </div>
                </div>
                <div class="btnBox" v-if="groupBtnShow">
                  <div class="btn" :style="btnColor">{{ $t('pagediy.goGroupBuy') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 样式二 -->
      <div class="group-bottom two acea-row row-between grid-list" v-if="listStyle == 1" :style="boxBgStyle">
        <div v-for="(item, index) in 4" :key="index">
          <div class="group-bottom-left">
            <div class="img acea-row row-center row-middle big-img" :style="contentStyle">
              <img src="@/assets/imgs/shan.png" alt="" class="shan" />
            </div>
          </div>
          <div class="two-item">
            <div class="title acea-row">
              <div :style="groupTitleColor" class="numPink-box">
                <div class="numPink" v-if="typeShow.includes(1)" :style="groupTitleFontColor">{{ $t('marketing.peopleGroup', { count: 5 }) }}</div>
              </div>
              <span
                :class="typeShow.includes(1) ? 'line1-show' : 'line1-hidden'"
                class="line1"
                v-if="typeShow.includes(0)"
                :style="nameColor"
                >{{ $t('pagediy.previewProductName') }}
              </span>
            </div>
            <div class="two-item-bottom acea-row row-between">
              <div class="price">
                <div class="pinkNum" v-if="typeShow.includes(2)" :style="priceColor">
                  <span>฿</span><span class="num semiBold">3200.00</span>
                </div>
                <div class="otNum" v-if="typeShow.includes(3)" :style="originalColor">
                  <span>฿</span><span class="semiBold">3699.00</span>
                </div>
              </div>
              <div class="btnBox" v-if="groupBtnShow">
                <div class="btn" :style="btnColor">{{ $t('pagediy.goGroupBuy') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 样式三 -->
      <div class="group-bottom three acea-row grid-three" v-if="listStyle == 2" :style="boxBgStyle">
        <div v-for="(item, index) in 6" :key="index" class="three-box">
          <div class="group-bottom-left">
            <div class="img acea-row row-center row-middle three-img" :style="contentStyle">
              <img src="@/assets/imgs/shan.png" alt="" class="shan" />
            </div>
          </div>
          <div class="two-item">
            <div class="title acea-row">
              <div :style="groupTitleColor" class="numPink-box numPink-box-special">
                <div class="numPink" v-if="typeShow.includes(1)" :style="groupTitleFontColor">{{ $t('marketing.peopleGroup', { count: 5 }) }}</div>
              </div>
              <span class="line1" v-if="typeShow.includes(0)" :style="nameColor"
                >{{ $t('pagediy.previewProductName') }}
              </span>
            </div>
            <div class="two-item-bottom">
              <div class="price">
                <div class="pinkNum" v-if="typeShow.includes(2)" :style="priceColor">
                  <span>฿</span><span class="num semiBold">3200.00</span>
                </div>
                <div class="otNum" v-if="typeShow.includes(3)" :style="originalColor">
                  <span>฿</span><span class="semiBold">3699.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 样式四 -->
      <div class="group-bottom four acea-row" v-if="listStyle == 3" :style="boxBgStyle">
        <div v-for="(item, index) in 6" :key="index" class="four-item">
          <div class="group-bottom-left">
            <div class="img acea-row row-center row-middle four-img" :style="contentStyle">
              <img src="@/assets/imgs/shan.png" alt="" class="shan" />
            </div>
          </div>
          <div class="two-item">
            <div class="title acea-row" :style="nameColor">
              <div :style="groupTitleColor" class="numPink-box numPink-box-special">
                <div class="numPink" v-if="typeShow.includes(1)" :style="groupTitleFontColor">{{ $t('marketing.peopleGroup', { count: 5 }) }}</div>
              </div>
              <span class="line1" v-if="typeShow.includes(0)"
                >{{ $t('pagediy.previewProductName') }}
              </span>
            </div>
            <div class="two-item-bottom">
              <div class="price">
                <div class="pinkNum" v-if="typeShow.includes(2)" :style="priceColor">
                  <span>฿</span><span class="num semiBold">3200.00</span>
                </div>
                <div class="otNum" v-if="typeShow.includes(3)" :style="originalColor">
                  <span>฿</span><span class="semiBold">3699.00</span>
                </div>
              </div>
            </div>
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
// import { backgroundColor } from 'echarts/lib/theme/dark';
import { mapState, mapGetters } from 'vuex';
import { diyCname, mergeDiyUiLabels } from '@/utils/diyCname';
import { getFormLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'home_group',
  ...diyCname('order.groupBuy'),
  icon: 't-icon-zujian-pintuan',
  configName: 'c_home_group',
  type: 1, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'group', // 外面匹配名称
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
    previewLang() {
      return (this.configObj && this.configObj.diyMediaLang) || getUiLocale(this);
    },
    logoUrl() {
      if (!this.configObj || !this.configObj.logoConfig) return '';
      const picked = getFormLocalizedText(
        this.configObj.logoConfig.url,
        this.configObj.logoConfig.urlJson,
        this.previewLang,
      );
      if (picked) return picked;
      if (this.previewLang === 'zh-cn') return this.configObj.logoConfig.url || '';
      return '';
    },
    titleConfig() {
      if (!this.configObj || !this.configObj.titleConfig) return '';
      return getFormLocalizedText(this.configObj.titleConfig.val, this.configObj.titleConfig.valJson, this.previewLang);
    },
    //容器样式
    //最外层盒子的样式
    boxStyle() {
      return [
        { 'border-radius': this.configObj.bgStyle.val ? this.configObj.bgStyle.val + 'px' : '0' },
        { margin: 0 + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
      ];
    },
    headerBgStyle() {
      return [
        {
          background: `linear-gradient(to right,${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`,
        },
      ];
    },
    //边距
    boxPadding() {
      return [
        {
          padding: this.configObj.upConfig.val + 'px' + ' ' + '0px' + ' ' + this.configObj.downConfig.val + 'px',
        },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + 0 + ' ' + 0 },
      ];
    },
    //背景颜色
    boxBgStyle() {
      return [
        {
          gap: `${this.configObj.contentConfig.val}px`,
        },
        {
          background: `linear-gradient(to right,${this.configObj.contentBgColor.color[0].item}, ${this.configObj.contentBgColor.color[1].item})`,
        },
      ];
    },
    //标题颜色
    titleColor() {
      return {
        color: this.configObj.titleColor.color[0].item,
      };
    },
    //分割线颜色
    lineColor() {
      return {
        border: `0.5px solid ${this.configObj.lineColor.color[0].item}`,
      };
    },
    //头部按钮颜色
    headerBtnColor() {
      return {
        color: this.configObj.headerBtnColor.color[0].item,
      };
    },
    //商品名称颜色
    nameColor() {
      return {
        color: this.configObj.nameColor.color[0].item,
      };
    },
    //商品原价颜色
    originalColor() {
      return {
        color: this.configObj.originalColor.color[0].item,
      };
    },
    //拼团价格颜色
    priceColor() {
      return {
        color: this.themeStyle ? this.configObj.priceColor.color[0].item : this.themeColor,
      };
    },
    //标签颜色
    groupTitleColor() {
      return {
        backgroundColor: this.themeStyle ? this.configObj.groupTitleColor.color[0].item : this.themeColor,
      };
    },
    //已拼颜色
    groupTitleFontColor() {
      return [
        {
          color: this.themeStyle ? this.configObj.groupTitleColor.color[0].item : this.themeColor,
        },
      ];
    },
    //按钮颜色
    btnColor() {
      return [
        {
          background: `linear-gradient(to right,${
            this.themeStyle ? this.configObj.btnColor.color[0].item : '#FF7931'
          }, ${this.themeStyle ? this.configObj.btnColor.color[1].item : this.themeColor})`,
        },
        {
          color: this.configObj.btnFontColor.color[0].item,
        },
      ];
    },
    //图片圆角
    contentStyle() {
      return {
        'border-radius': this.configObj.contentStyle.val ? this.configObj.contentStyle.val + 'px' : '0',
      };
    },
    //样式一内容边距
    contentConfig() {
      return {
        'margin-top': this.configObj.contentConfig.val + 'px',
      };
    },
    //背景图片
    bgImgStyle() {
      return {
        'background-image': `url(${this.bgImgUrl})`,
      };
    },
    //标题文字格式
    headerTitleConfig() {
      return [
        {
          'font-weight': this.headerTitleStyle == 0 ? 600 : '',
        },
        {
          'font-style': this.headerTitleStyle == 2 ? 'italic' : 'normal',
        },
        {
          color: this.configObj.headerTitleColor.color[0].item,
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
    listStyle(nVal, oVal) {
      if (this.configObj.themeStyleConfig.tabVal == 1) {
        if (nVal == 2 || nVal == 3) {
          this.configObj.groupBtnConfig.isShow = 0;
          this.configObj.btnColor.isShow = 0;
          this.configObj.btnFontColor.isShow = 0;
        } else {
          this.configObj.groupBtnConfig.isShow = 1;
          this.configObj.btnColor.isShow = 1;
          this.configObj.btnFontColor.isShow = 1;
        }
      }
    },
    selectStyle(nVal, oVal) {
      if (nVal == 0) {
        this.configObj.logoConfig.isShow = 1;
        this.configObj.titleConfig.isShow = 0;
        this.configObj.headerTitleStyle.isShow = 0;
        this.configObj.headerTitleColor.isShow = 0;
      } else {
        this.configObj.logoConfig.isShow = 0;
        this.configObj.titleConfig.isShow = 1;
        this.configObj.headerTitleStyle.isShow = 1;
        this.configObj.headerTitleColor.isShow = 1;
      }
    },
    selectBgImg(nVal, oVal) {
      if (nVal == 0) {
        this.configObj.bgImg.isShow = 1;
        this.configObj.bgColor.isShow = 0;
      } else {
        this.configObj.bgImg.isShow = 0;
        this.configObj.bgColor.isShow = 1;
      }
    },
    themeStyle: {
      handler(nVal, oVal) {
        if (this.listStyle == 2 || this.listStyle == 3) {
          this.configObj.btnColor.isShow = 0;
          this.configObj.priceColor.isShow = this.configObj.themeStyleConfig.tabVal;
          this.configObj.groupTitleColor.isShow = this.configObj.themeStyleConfig.tabVal;
        } else {
          this.configObj.priceColor.isShow = this.configObj.themeStyleConfig.tabVal;
          this.configObj.groupTitleColor.isShow = this.configObj.themeStyleConfig.tabVal;
          this.configObj.btnColor.isShow = this.configObj.themeStyleConfig.tabVal;
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      defaultConfig: {
        name: 'group',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('order.groupBuy'),
        },
        tabConfig: {
          title: this.$t('pagediy.displayStyle'),
          tabTitle: this.$t('pagediy.layoutSettings'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.styleOne'),
              icon: 'icon-yangshier',
            },
            {
              val: this.$t('pagediy.styleTwo'),
              icon: 'icon-yangshisan',
            },
            {
              val: this.$t('pagediy.styleThree'),
              icon: 'icon-dianpujie-yangshiyi',
            },
            {
              val: this.$t('pagediy.styleFour'),
              icon: 'icon-ic_layout4',
            },
          ],
        },
        selectStyle: {
          cname: 'selectStyle',
          title: this.$t('pagediy.titleType'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.asImage'),
            },
            {
              val: this.$t('pagediy.asText'),
            },
          ],
        },
        logoConfig: {
          isShow: 1,
          tabTitle: this.$t('pagediy.headerSettings'),
          title: this.$t('pagediy.titleImage'),
          tips: this.$t('pagediy.suggestSize', { size: '154px*32px' }),
          url: localStorage.getItem('mediaDomain') + '/crmebimage/presets/groupTitle.png',
          urlJson: '',
        },
        selectBgImg: {
          cname: 'selectBgImg',
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
        bgImg: {
          isShow: 1,
          title: this.$t('pagediy.backgroundImg'),
          tips: this.$t('pagediy.suggestSize', { size: '710px*96px' }),
          url: localStorage.getItem('mediaDomain') + '/crmebimage/presets/groupBg.png',
        },
        titleConfig: {
          title: this.$t('pagediy.titleText'),
          val: this.$t('pagediy.superValueGroup'),
          valJson: '',
          place: this.$t('pagediy.pleaseEnterTitle'),
          isShow: 1,
          max: 6,
        },
        //显示内容
        typeConfig: {
          tabTitle: this.$t('pagediy.displayContent'),
          name: 'rowsNum',
          title: this.$t('pagediy.displayInfo'),
          activeValue: [0, 1, 2, 3],
          list: [
            {
              val: this.$t('pagediy.productName'),
            },
            {
              val: this.$t('pagediy.activityTag'),
            },
            {
              val: this.$t('pagediy.productPriceLabel'),
            },
            {
              val: this.$t('pagediy.productOriginalPrice'),
            },
          ],
        },
        groupBtnConfig: {
          cname: 'groupBtnConfig',
          title: this.$t('pagediy.groupButton'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.show'),
            },
            {
              val: this.$t('pagediy.hide'),
            },
          ],
        },
        // 背景颜色
        bgColor: {
          tabTitle: this.$t('pagediy.headerSettings'),
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
        // 内容背景颜色
        contentBgColor: {
          tabTitle: this.$t('pagediy.colorSettings'),
          title: this.$t('pagediy.contentBackground'),
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
        headerTitleStyle: {
          cname: 'headerTitleStyle',
          title: this.$t('pagediy.titleText'),
          tabVal: 0,
          isShow: 1,
          list: [
            {
              val: this.$t('pagediy.bold'),
            },
            {
              val: this.$t('pagediy.normal'),
            },
            {
              val: this.$t('pagediy.italic'),
            },
          ],
        },
        headerTitleColor: {
          title: this.$t('pagediy.titleColor'),
          isShow: 1,
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
        lineColor: {
          title: this.$t('pagediy.dividerColor'),
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
        titleColor: {
          title: this.$t('pagediy.hintTextColor'),
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
        headerBtnColor: {
          title: this.$t('pagediy.headerButtonColor'),
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
        nameColor: {
          tabTitle: this.$t('pagediy.productSettings'),
          title: this.$t('pagediy.productNameColor'),
          color: [
            {
              item: '#000000',
            },
          ],
          default: [
            {
              item: '#000000',
            },
          ],
        },
        originalColor: {
          title: this.$t('pagediy.originalPriceColor'),
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
        priceColor: {
          title: this.$t('pagediy.groupPriceColor'),
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
        groupTitleColor: {
          title: this.$t('pagediy.tagColor'),
          isShow: 0,
          color: [
            {
              item: 'rgba(233, 51, 35, 1)',
            },
          ],
          default: [
            {
              item: 'rgba(233, 51, 35, 1)',
            },
          ],
        },
        btnColor: {
          title: this.$t('pagediy.buttonColor'),
          isShow: 0,
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
        btnFontColor: {
          title: this.$t('pagediy.buttonTextColor'),
          isShow: 1,
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
          name: 'contentStyle',
          val: 5,
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
          max: 15,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 0,
          min: 0,
        },
        contentConfig: {
          title: this.$t('pagediy.contentSpacing'),
          val: 5,
          min: 0,
          max: 20,
        },
      },
      listStyle: 0,
      configObj: null,
      typeShow: [0, 1, 2, 3],
      groupBtnShow: true,
      selectStyle: '',
      selectBgImg: '',
      bgImgUrl: '',
      headerTitleStyle: 0,
      themeStyle: 0,
      themeColor: '',
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.num) {
        let pageData = this.$store.state.mobildConfig.defaultArray[this.num];
        this.setConfig(pageData);
      }
    });
  },
  methods: {
    setConfig(data) {
      if (!data) return;
      if (data) {
        this.configObj = mergeDiyUiLabels(data, this.defaultConfig);
        this.listStyle = this.configObj.tabConfig.tabVal;
        this.typeShow = this.configObj.typeConfig.activeValue;
        this.groupBtnShow = this.configObj.groupBtnConfig.tabVal == 0 ? true : false;
        this.selectStyle = this.configObj.selectStyle.tabVal;
        this.selectBgImg = this.configObj.selectBgImg.tabVal;
        this.bgImgUrl = this.configObj.bgImg.url;
        this.headerTitleStyle = this.configObj.headerTitleStyle.tabVal;
        this.themeStyle = data.themeStyleConfig.tabVal;
        this.themeColor = this.$options.filters.filterTheme(this.mobileTheme - 1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.groupBox {
  overflow: hidden;

  .group {
    overflow: hidden;

    .group-top {
      width: 100%;
      height: 50px;
      background-repeat: no-repeat;
      background-size: cover;
      padding: 0 12px;

      .group-top-left {
        .group_logo {
          width: 70px;
          height: 16px;
        }

        .interval {
          width: 0px;
          height: 14px;
          margin: 2px 10px 0;
          opacity: 0.6;
        }

        .pinkHead {
          width: 54px;
          height: 18px;
        }

        .num {
          height: 16px;
          line-height: 16px;
          font-size: 13px;
          color: #ffffff;
          margin-top: 2px;
        }
      }

      .group-top-right {
        height: 16px;
        line-height: 16px;
        font-size: 12px;

        .icon-xuanze {
          font-size: 12px;
        }
      }
    }

    .group-bottom {
      width: 100%;
      padding: 10px;

      .img {
        width: 120px;
        height: 120px;
        background: #f3f9ff;

        .shan {
          width: 65px;
          height: 50px;
        }
      }

      .big-img.img {
        width: 100%;
        height: 162px;
      }

      .three-img.img {
        width: 100%;
        height: 105px;
      }

      .four-img {
        width: 120px;
        height: 120px;
      }

      .group-bottom-right {
        flex: 1;
        margin-left: 10px;

        .right-top {
          .title {
            font-size: 14px;
            color: #333333;
          }

          .people-box {
            border-radius: 4px;
          }

          .pink {
            margin-top: 8px;
            font-size: 11px;
            border-radius: 4px;

            .people {
              color: #fff;
              padding: 2px 6px;
              border-radius: 4px;
            }

            .groupNum {
              padding: 2px 6px;
              border-radius: 0 3px 3px 0;
              background-color: rgba(255, 255, 255, 0.9);
              margin-left: 1px;
            }
          }
        }

        .right-bottom {
          .price {
            .pinkNum {
              .pinkNum-num {
                font-weight: 600;
                font-size: 18px;
              }
            }

            .num {
              color: #999999;
            }
          }

          .btnBox {
            margin-top: 8px;
            font-size: 11px;

            .btn {
              padding: 6px 10px;
              border-radius: 25px 25px 25px 25px;
            }
          }
        }
      }
    }

    .group-bottom.two {
      .two-item {
        width: 100%;

        .title {
          margin-top: 10px;

          .numPink {
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 2px;
            font-size: 11px;
            width: 41px;
          }

          .line1-show {
            width: 105px;
            margin-left: 5px;
          }
          .line1-hidden {
            width: 150px;
          }
        }

        .two-item-bottom {
          margin-top: 5px;

          .pinkNum {
            .num {
              font-weight: 600;
              font-size: 18px;
            }
          }

          .otNum {
            font-size: 13px;
            color: #999999;
            text-decoration-line: line-through;
          }

          .btnBox {
            margin-top: 8px;
            font-size: 11px;

            .btn {
              padding: 6px 12px;
              border-radius: 25px 25px 25px 25px;
            }
          }
        }
      }
    }

    .group-bottom.three {
      .three-box {
        position: relative;
      }

      .numPink {
        color: #ffffff;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 11px;
      }

      .two-item {
        width: 100%;

        .title {
          margin-top: 9px;

          .numPink {
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            width: 41px;
          }

          .line1 {
            width: 90px;
            margin-left: 5px;
          }
        }

        .two-item-bottom {
          margin-top: 5px;

          .pinkNum {
            .num {
              font-weight: 600;
              font-size: 18px;
            }
          }

          .otNum {
            font-size: 13px;
            color: #999999;
            text-decoration-line: line-through;
          }

          .btnBox {
            margin-top: 8px;
            font-size: 11px;

            .btn {
              padding: 6px 12px;
              border-radius: 25px 25px 25px 25px;
            }
          }
        }
      }
    }

    .group-bottom.four {
      overflow: hidden;
      flex-wrap: nowrap;

      .four-item {
        position: relative;
      }

      .numPink {
        color: #ffffff;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 11px;
      }

      .two-item {
        width: 105px;

        .title {
          margin-top: 9px;

          .line1 {
            width: 105px;
            margin-left: 5px;
          }
        }

        .two-item-bottom {
          margin-top: 5px;

          .pinkNum {
            .num {
              font-weight: 600;
              font-size: 18px;
            }
          }

          .otNum {
            font-size: 13px;
            text-decoration-line: line-through;
          }

          .btnBox {
            margin-top: 8px;
            font-size: 11px;

            .btn {
              padding: 6px 12px;
              border-radius: 25px 25px 25px 25px;
            }
          }
        }
      }
    }
  }

  .price {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .grid-list {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
    width: 100%;
  }

  .grid-three {
    width: 100%;
    display: grid !important;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
  }
}

.titleFont {
  font-size: 16px;
}

.pinkNum-icon,
.num-icon {
  font-size: 12px;
  font-weight: 600;
}
.numPink {
  background-color: rgba(255, 255, 255, 0.9);
}
.numPink-box {
  border-radius: 4px;
}
.numPink-box-special {
  position: absolute;
  left: 5px;
  top: 5px;
  border-radius: 8px;
}
</style>
