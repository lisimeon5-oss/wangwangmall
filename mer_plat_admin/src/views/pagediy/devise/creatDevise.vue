<template>
  <!--diy组件在文件夹design-components中-->
  <!--mobilePage文件夹中是生成左侧菜单的页面，也是中间样式展示的页面，添加左侧新组件名称在此文件夹添加-->
  <!--mobileConfigRight文件夹是右侧页面中所用到的组件，添加新组件中用到的标签在此文件夹添加-->
  <!--mobileConfig文件夹是生成右侧配置项的页面，展示出右侧的配置项在此文件夹中修改-->
  <div class="deviseBox">
    <div class="devise_head acea-row row-between-wrapper">
      <div class="acea-row row-baseline">
        <div class="title">{{ $t('pagediy.currentPageColon') }}{{ nameTop }}</div>
        <el-popover placement="bottom" width="480" trigger="click" v-model="visible">
          <div>
            <div class="mb10">
              <el-radio-group v-model="nameActiveLang" size="mini">
                <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                  {{ lang.label }}
                </el-radio-button>
              </el-radio-group>
            </div>
            <div class="acea-row row-middle">
              <el-input
                :value="namePopoverInput"
                :placeholder="namePopoverPlaceholder"
                maxlength="15"
                size="small"
                style="width: 237px"
                class="mr20"
                @input="onNamePopoverInput"
              />
              <el-button size="small" @click="visible = false">{{ $t('el.messagebox.cancel') }}</el-button>
              <el-button
                v-hasPermi="['platform:pagediy:update', 'platform:pagediy:save']"
                type="primary"
                size="small"
                @click="saveName(nameTopFrom, 0)"
                >{{ $t('el.messagebox.confirm') }}</el-button
              >
            </div>
          </div>
          <i slot="reference" class="edit el-icon-edit-outline"></i>
        </el-popover>
      </div>
      <div class="acea-row preview">
        <el-popover placement="top-start" trigger="hover" :disabled="Number(pageId) === 0">
          <div id="diyQrcode"></div>
          <el-button :disabled="Number(pageId) === 0" class="ht_btn" slot="reference" style="line-height: 9px"
            ><i class="iconfont icon-caozuo-xianshi"></i>{{ $t('user.preview') }}</el-button
          >
        </el-popover>
        <button
          v-hasPermi="['platform:pagediy:update', 'platform:pagediy:save']"
          class="ht_btn mx_12"
          v-debounceClick="saveConfig"
        >
          {{ $t('pagediy.saveOnly') }}
        </button>
        <el-button
          v-hasPermi="['platform:pagediy:update', 'platform:pagediy:save']"
          size="small"
          style="color: #2d8cf0"
          v-debounceClick="
            () => {
              saveConfig(1);
            }
          "
          :loading="loading"
          >{{ $t('pagediy.saveClose') }}</el-button
        >
      </div>
    </div>
    <div style="height: 66px"></div>
    <el-card :bordered="false" :body-style="{ padding: '0' }">
      <div class="diy-wrapper" :style="'height:' + (clientHeight + 9) + 'px;'">
        <!-- 左侧 -->
        <div class="left">
          <div class="wrapper" :style="'height:' + clientHeight + 'px;'" v-if="tabCur == 0">
            <div v-for="(item, index) in leftMenu" :key="index">
              <div class="tips" @click="item.isOpen = !item.isOpen">
                {{ item.title }}

                <i class="el-icon-arrow-right icon" size="16" v-if="!item.isOpen"></i>
                <i class="el-icon-arrow-down icon" size="16" v-else></i>
              </div>
              <draggable
                id="dragArea"
                class="dragArea list-group"
                :list="item.list"
                :group="{ name: 'people', pull: 'clone', put: false }"
                :clone="cloneDog"
                dragClass="dragClass"
                filter=".search, .comb, .bar"
              >
                <div
                  class="list-group-item"
                  :class="{
                    search: element.cname == $t('pagediy.searchBox'),
                    comb: element.cname == $t('pagediy.combComponent'),
                    bar: element.cname == $t('marketing.productCategory'),
                  }"
                  v-for="element in item.list"
                  :key="element.id"
                  @click="addDom(element, 1)"
                  v-show="item.isOpen"
                >
                  <div>
                    <div class="position" style="display: none">{{ $t('pagediy.dropComponentHere') }}</div>
                    <span class="conter t-icon" :class="element.icon"></span>
                    <p class="conter">{{ element.cname }}</p>
                  </div>
                </div>
              </draggable>
            </div>
          </div>
          <div class="wrapper" v-else :style="'height:' + clientHeight + 'px;'">
            <div class="link-item" v-for="(item, index) in urlList" :key="index">
              <div class="name">{{ item.name }}</div>
              <div class="link-txt">{{ $t('pagediy.addressColon') }}{{ item.url }}</div>
              <div v-if="item.parameter" class="params">
                <span class="txt">{{ $t('pagediy.paramColon') }}</span>
                <span>{{ item.parameter }}</span>
              </div>
              <div v-if="item.example" class="lable">
                <p class="txt">{{ $t('pagediy.exampleColon') }}{{ item.example }}</p>
                <el-button size="small" class="copy copy-data" :data-clipboard-text="item.example">{{ $t('marketing.copy') }} </el-button>
              </div>
            </div>
          </div>
        </div>
        <!-- 中间 -->
        <div class="wrapper-con">
          <div class="content">
            <div
              ref="wrapperCon"
              class="contxt"
              :style="'height:' + clientHeight + 'px;overflow: scroll;'"
              style="display: flex; flex-direction: column; overflow: hidden; height: 100%"
            >
              <div class="border-box">
                <div class="overflowy">
                  <div class="picture"><img src="@/assets/imgs/electric.png" /></div>
                  <div class="page-title" :style="pageTitle" :class="{ on: activeIndex == -100 }" @click="showTitle">
                    {{ titleTxt }}
                    <!--<div class="delete-box"></div>-->
                    <!--<div class="handle"></div>-->
                  </div>
                </div>
                <!--:style="'height:' + rollHeight + 'px;'"-->
                <div class="scrollCon">
                  <div style="margin: 0 auto; position: relative; height: auto">
                    <div
                      class="scroll-box"
                      ref="imgContainer"
                      :style="
                        'background-color:' +
                        (colorTxt ? colorPickerTxt : '') +
                        ';background-image: url(' +
                        (picTxt ? picUrlTxt : '') +
                        ');'
                      "
                    >
                      <draggable
                        style="padding-bottom: 122px"
                        class="dragArea list-group"
                        :list="mConfig"
                        group="people"
                        @change="onLog"
                        filter=".top"
                        :move="onMove"
                        animation="300"
                      >
                        <div
                          :style="
                            (item.name === 'home_footer'
                              ? ' position: fixed; z-index: 1;width: 378px;bottom:-45px;'
                              : '') +
                            'background-color:' +
                            (colorTxt ? colorPickerTxt : '') +
                            ';background-image: url(' +
                            (picTxt ? picUrlTxt : '') +
                            ');'
                          "
                          ref="mConfigItem"
                          class="mConfig-item content-color"
                          :class="{
                            on: activeIndex == key,
                            top:
                              item.name === 'search_box' ||
                              item.name === 'nav_bar' ||
                              item.name === 'home_footer' ||
                              item.name === 'home_comb',
                          }"
                          v-for="(item, key) in mConfig"
                          :key="key"
                          @click.stop="bindconfig(item, key)"
                        >
                          <component
                            :is="item.name"
                            ref="getComponentData"
                            :configData="propsObj"
                            :index="key"
                            @onChange="onChange"
                            :num="item.num"
                          ></component>
                          <div class="delete-box">
                            <div class="handleType" :style="item.name === 'home_footer' ? 'top: -94px; ' : ''">
                              <div
                                class="iconfont icon-caozuo-shang"
                                :class="key === 0 ? 'on' : ''"
                                @click.stop="movePage(item, key, 1)"
                              ></div>
                              <div
                                class="iconfont icon-caozuo-xia"
                                :class="key === mConfig.length - 1 ? 'on' : ''"
                                @click.stop="movePage(item, key, 0)"
                              ></div>
                              <div class="iconfont icon-caozuo-fuzhi1" @click.stop="bindAddDom(item, 0, key)"></div>
                              <div class="iconfont icon-caozuo-shanchu" @click.stop="bindDelete(item, key)"></div>
                            </div>
                          </div>
                          <div class="handle"></div>
                          <div class="page-name">{{ item.cname }}</div>
                        </div>
                      </draggable>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt20 btn">
            <el-button plain @click="showTitle" class="mb15">{{ $t('pagediy.pageSettings') }}</el-button>
            <el-tooltip
              class="item"
              effect="dark"
              :content="pageId === 0 ? $t('pagediy.noHistoryVersion') : $t('pagediy.clickToSaveTemplate')"
              placement="left-start"
            >
              <el-popover placement="bottom" trigger="click" v-model="isShow">
                <div class="acea-row row-between row-middle">
                  <el-input
                    v-model="nameContent"
                    :placeholder="$t('pagediy.requiredMax15')"
                    maxlength="15"
                    size="small"
                    style="width: 260px"
                  />
                  <el-button type="text" size="small" @click="isShow = false">{{ $t('el.messagebox.cancel') }}</el-button>
                  <el-button type="primary" size="small" @click="saveName(nameContent, 1)">{{ $t('el.messagebox.confirm') }}</el-button>
                </div>
                <el-button
                  v-hasPermi="['platform:pagediy:save']"
                  slot="reference"
                  :disabled="pageId === 0"
                  plain
                  class="mb15"
                  @click="onClick"
                  >{{ $t('pagediy.saveTemplate') }}</el-button
                >
              </el-popover>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              :content="pageId === 0 ? $t('pagediy.noHistoryVersion') : $t('pagediy.clickToResetTemplate')"
              placement="left-start"
            >
              <el-popover placement="bottom" width="400" trigger="click" v-model="isReast">
                <div class="acea-row row-between row-middle">
                  <p>{{ $t('pagediy.resetPageDataConfirm') }}</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="isReast = false">{{ $t('el.messagebox.cancel') }}</el-button>
                    <el-button type="primary" size="mini" @click="reast">{{ $t('el.messagebox.confirm') }}</el-button>
                  </div>
                </div>
                <el-button slot="reference" :disabled="pageId === 0" plain class="mb15">{{ $t('el.table.resetFilter') }}</el-button>
              </el-popover>
            </el-tooltip>
          </div>
        </div>
        <!-- 右侧 -->
        <div class="right-box" :style="'height:' + clientHeight + 'px;'">
          <div class="mConfig-item" style="background-color: #fff" v-for="(item, key) in rConfig" :key="key">
            <component
              :is="item.configName"
              @config="config"
              :activeIndex="activeIndex"
              :num="item.num"
              :index="key"
            ></component>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script crossorigin="anonymous">
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import { pagediySaveApi, pagediyInfoApi, pagediyUpdateApi } from '@/api/devise';
import { mediadomainApi } from '@/api/systemConfig';
import vuedraggable from 'vuedraggable';
import ClipboardJS from 'clipboard';
import mPage from '../components/mobilePage/index.js';
import mConfig from '../components/mobileConfig/index.js';
import QRcode from 'qrcodejs2';
import { mapGetters, mapState } from 'vuex';
import { getLocalizedName, getLocalizedText, getUiLocale, hasI18nNameContent, parseLangJsonMap, buildI18nNameJson, resolveFormActiveLang } from '@/utils/localizedName';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
let idGlobal = 0;
export default {
  //inject: ['reload'],
  name: 'creatDevise.vue',
  data() {
    return {
      footerTop: 0, //底部导航top值
      clientHeight: '', //页面动态高度
      rollHeight: '',
      leftMenu: [], // 左侧菜单
      lConfig: [], // 左侧组件
      mConfig: [], // 中间组件渲染
      rConfig: [], // 右侧组件配置
      activeConfigName: '',
      propsObj: {}, // 组件传递的数据,
      activeIndex: -100, // 选中的下标
      number: 0,
      pageId: 0,
      category: [],
      tabList: [
        {
          title: '组件库',
          key: 0,
        },
      ],
      tabCur: 0,
      urlList: [],
      footActive: false,
      loading: false,
      isSearch: false,
      isFooter: false,
      isTab: false,
      isComb: false,
      isFllow: false,
      is_diy: 0,
      name: '', //模板名称
      nameTopFrom: '', //头部模板名称表单提交
      nameContent: '', //另存模板名称
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      nameActiveLang: 'zh-cn',
      nameJsonForm: {},
      isShow: false,
      visible: false,
      isReast: false,
      pageType: '', //操作类型，add新增，edit编辑，copy复制
      pageFooter: {
        name: 'pageFoot',
        setUp: {
          tabVal: '0',
        },
        status: {
          title: '是否自定义',
          name: 'status',
          status: false,
        },
        txtColor: {
          title: '文字颜色',
          name: 'txtColor',
          default: [{ item: '#282828' }],
          color: [{ item: '#282828' }],
        },
        activeTxtColor: {
          title: '选中文字颜色',
          name: 'txtColor',
          default: [{ item: '#F62C2C' }],
          color: [{ item: '#F62C2C' }],
        },
        bgColor: {
          title: '背景颜色',
          name: 'bgColor',
          default: [{ item: '#fff' }],
          isFoot: true,
          color: [{ item: '#fff' }],
        },
        menuList: [
          {
            imgList: [require('@/assets/imgs/foot-002.png'), require('@/assets/imgs/foot-001.png')],
            name: '首页',
            link: '/pages/index/index',
          },
          {
            imgList: [require('@/assets/imgs/foot-004.png'), require('@/assets/imgs/foot-003.png')],
            name: this.$t('community.category'),
            link: '/pages/goods_cate/index',
          },
          {
            imgList: [require('@/assets/imgs/foot-006.png'), require('@/assets/imgs/foot-005.png')],
            name: '逛逛',
            link: '/pages/discover_index/index',
          },
          {
            imgList: [require('@/assets/imgs/foot-008.png'), require('@/assets/imgs/foot-007.png')],
            name: this.$t('pagediy.cart'),
            link: '/pages/order_addcart/order_addcart',
          },
          {
            imgList: [require('@/assets/imgs/foot-0010.png'), require('@/assets/imgs/foot-009.png')],
            name: '我的',
            link: '/pages/user/index',
          },
        ],
      },
    };
  },
  components: {
    draggable: vuedraggable,
    ...mPage,
    ...mConfig,
  },
  watch: {
    nameTop(val) {
      //直接赋值给本地data中的属性，就不会报错啦
      this.name = val;
    },
    visible(val) {
      if (val) this.hydrateNamePopover();
    },
  },
  computed: {
    ...mapState({
      pageTitleRaw: (state) => state.mobildConfig.pageTitle || '',
      pageTitleJson: (state) => state.mobildConfig.pageTitleJson || '',
      pageNameRaw: (state) => state.mobildConfig.pageName,
      pageNameJson: (state) => state.mobildConfig.pageNameJson || '',
      showTxt: (state) => state.mobildConfig.pageShow,
      colorTxt: (state) => state.mobildConfig.pageColor,
      picTxt: (state) => state.mobildConfig.pagePic,
      colorPickerTxt: (state) => state.mobildConfig.pageColorPicker,
      tabValTxt: (state) => state.mobildConfig.pageTabVal,
      picUrlTxt: (state) => state.mobildConfig.pagePicUrl,
      returnAddress: (state) => state.mobildConfig.returnAddress,
      titleColor: (state) => state.mobildConfig.titleColor, //标题字体颜色
      titleBgColor: (state) => state.mobildConfig.titleBgColor, //标题背景色
    }),
    ...mapGetters(['frontDomain']),
    titleTxt() {
      return getLocalizedText(this.pageTitleRaw, this.pageTitleJson, getUiLocale(this)) || this.$t('pagediy.homeTag');
    },
    nameTop() {
      return getLocalizedName({ name: this.pageNameRaw, nameJson: this.pageNameJson }, getUiLocale(this));
    },
    nameActiveLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.nameActiveLang);
      return lang ? lang.label : this.nameActiveLang;
    },
    namePopoverInput() {
      if (this.nameActiveLang === this.defaultLangCode) return this.nameTopFrom;
      return this.nameJsonForm[this.nameActiveLang] || '';
    },
    namePopoverPlaceholder() {
      if (this.nameActiveLang === this.defaultLangCode) return this.$t('pagediy.requiredMax15');
      return this.$t('pagediy.inputTemplateNameInLang', { lang: this.nameActiveLangLabel });
    },
    //标题样式
    pageTitle() {
      return [{ backgroundColor: this.titleBgColor }, { color: this.titleColor }];
    },
  },
  created() {
    this.lConfig = this.objToArr(mPage);
  },
  mounted() {
    //监听事件
    document.addEventListener('keydown', this.saveDiy, { passive: true });
    this.pageId = Number(this.$route.params.id);
    this.pageType = this.$route.params.type;
    this.nameTopFrom = this.pageType !== 'copy' ? this.nameTop : this.nameTop + this.$t('pagediy.copySuffix');
    this.name = this.pageType !== 'copy' ? this.nameTop : this.nameTop + this.$t('pagediy.copySuffix');
    this.getNameLanguageList();
    this.$nextTick(() => {
      this.arraySort();
      if (this.pageId != 0) {
        //this.getDefaultConfig();
      } else {
        this.showTitle();
      }
      //this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      this.clientHeight = `${document.documentElement.clientHeight}` - 76; //获取浏览器可视区域高度
      let H = `${document.documentElement.clientHeight}` - 180;
      this.rollHeight = H > 650 ? 650 : H;
      let that = this;
      window.onresize = function () {
        that.clientHeight = `${document.documentElement.clientHeight}` - 76;
        let H = `${document.documentElement.clientHeight}` - 180;
        that.rollHeight = H > 650 ? 650 : H;
        that.footerTop = that.rollHeight + 196;
      };
      //66+75+55=196
      this.footerTop = this.rollHeight + 196;
    });
    this.$nextTick(function () {
      const clipboard = new ClipboardJS('.copy-data');
      clipboard.on('success', () => {
        this.$message.success(this.$t('application.copySuccess'));
      });
    });
    if (this.$route.params.id !== '0') this.getInfo();
    if (!localStorage.getItem('mediaDomain')) this.getMediadomain();
    this.getQRcode();
  },
  beforeDestroy() {
    //销毁时移除监听
    document.removeEventListener('keydown', this.saveDiy);
    this.$store.commit('mobildConfig/titleUpdata', '');
    this.$store.commit('mobildConfig/nameUpdata', '');
    this.$store.commit('mobildConfig/showUpdata', 1);
    this.$store.commit('mobildConfig/colorUpdata', 0);
    this.$store.commit('mobildConfig/picUpdata', 0);
    this.$store.commit('mobildConfig/pickerUpdata', '#f5f5f5');
    this.$store.commit('mobildConfig/radioUpdata', 0);
    this.$store.commit('mobildConfig/picurlUpdata', '');
    this.$store.commit('mobildConfig/SETEMPTY');
  },
  destroyed() {
    this.$store.commit('mobildConfig/titleUpdata', '');
    this.$store.commit('mobildConfig/nameUpdata', '');
    this.$store.commit('mobildConfig/showUpdata', 1);
    this.$store.commit('mobildConfig/colorUpdata', 0);
    this.$store.commit('mobildConfig/picUpdata', 0);
    this.$store.commit('mobildConfig/pickerUpdata', '#f5f5f5');
    this.$store.commit('mobildConfig/radioUpdata', 0);
    this.$store.commit('mobildConfig/picurlUpdata', '');
    this.$store.commit('mobildConfig/SETEMPTY');
  },
  methods: {
    //ctrl+s保存
    saveDiy(e) {
      var key = window.event.keyCode ? window.event.keyCode : window.event.which;
      if (key === 83 && e.ctrlKey) {
        this.saveConfig();
        e.preventDefault(); //阻止浏览器默认事件
      }
    },
    onChange() {},
    onClick() {
      // this.isShow = true
    },
    //取消
    onCancel() {
      this.isShow = false;
      this.visible = false;
      //this.nameTopFrom = ''
    },
    //模板名称
    changName(val) {
      //this.$store.commit('mobildConfig/UPNAME', val);
    },
    //预览二维码
    getQRcode() {
      const el = document.getElementById('diyQrcode');
      if (!el) return;
      el.innerHTML = '';
      const text = this.frontDomain ? this.frontDomain + '?id=' + this.pageId : '';
      if (!text) return;
      new QRcode('diyQrcode', { width: 135, height: 135, text });
    },
    //diy详情
    getInfo() {
      pagediyInfoApi(this.$route.params.id).then((res) => {
        let data = res;
        //更新页面设置中的参数
        this.$store.commit('mobildConfig/titleUpdata', data.title);
        this.$store.commit('mobildConfig/titleJsonUpdata', data.titleJson || '');
        this.$store.commit('mobildConfig/nameUpdata', this.pageType !== 'copy' ? data.name : data.name + this.$t('pagediy.copySuffix'));
        this.$store.commit('mobildConfig/nameJsonUpdata', data.nameJson || '');
        this.$store.commit('mobildConfig/showUpdata', data.isShow);
        this.$store.commit('mobildConfig/colorUpdata', data.isBgColor || 0);
        this.$store.commit('mobildConfig/picUpdata', data.isBgPic || 0);
        this.$store.commit('mobildConfig/pickerUpdata', data.colorPicker || '#f5f5f5');
        this.$store.commit('mobildConfig/radioUpdata', data.bgTabVal || 0);
        this.$store.commit('mobildConfig/picurlUpdata', data.bgPic || '');
        this.$store.commit('mobildConfig/returnAddressUpdata', data.returnAddress);
        this.$store.commit('mobildConfig/titleBgColorUpdata', data.titleBgColor);
        this.$store.commit('mobildConfig/titleColorUpdata', data.titleColor);
        this.nameTopFrom = this.pageType !== 'copy' ? data.name : data.name + this.$t('pagediy.copySuffix');
        this.hydrateNamePopover();
        this.defaultData(data.value);
      });
    },
    //详情接口请求后，详情数据
    defaultData(data) {
      let obj = {};
      let tempARR = [];
      let newArr = this.objToArr(data);
      function sortNumber(a, b) {
        return a.timestamp - b.timestamp;
      }
      newArr.sort(sortNumber);
      newArr.map((el, index) => {
        if (el.name == 'home_footer') {
          this.isFooter = true;
        }
        if (el.name == 'headerSerch') {
          this.isSearch = true;
        }
        if (el.name == 'tabNav') {
          this.isTab = true;
        }
        if (el.name == 'homeComb') {
          this.isComb = true;
        }
        if (el.name == 'goodList') {
          let storage = window.localStorage;
          storage.setItem(el.timestamp, el.selectConfig.activeValue);
        }
        el.id = 'id' + el.timestamp;
        this.lConfig.map((item, j) => {
          if (el.name == item.defaultName) {
            item.num = el.timestamp;
            item.id = 'id' + el.timestamp;
            let tempItem = JSON.parse(JSON.stringify(item));
            tempARR.push(tempItem);
            obj[el.timestamp] = el;
            this.mConfig.push(tempItem);
            // 保存默认组件配置
            this.$store.commit('mobildConfig/ADDARRAY', {
              num: el.timestamp,
              val: el,
            });
          }
        });
      });
      this.showTitle();
    },
    //图片域名
    getMediadomain() {
      mediadomainApi().then((res) => {
        localStorage.setItem('mediaDomain', res);
        this.$store.commit('settings/SET_mediaDomain', res);
      });
    },
    cloneDog(data) {
      return {
        ...data,
      };
    },
    // 点击显示相应的配置
    bindconfig(item, index) {
      this.rConfig = [];
      let tempItem = JSON.parse(JSON.stringify(item));
      this.rConfig.push(tempItem);
      this.activeIndex = index;
      this.$store.commit('mobildConfig/SETCONFIGNAME', item.name);
    },
    hydrateNamePopover() {
      this.nameTopFrom = this.pageNameRaw || this.nameTopFrom || '';
      this.nameJsonForm = this.parseNameJsonForm(this.pageNameJson);
    },
    parseNameJsonForm(json) {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      const map = parseLangJsonMap(json);
      Object.keys(map).forEach((key) => {
        if (key !== this.defaultLangCode) form[key] = map[key] || '';
      });
      return form;
    },
    onNamePopoverInput(val) {
      if (this.nameActiveLang === this.defaultLangCode) {
        this.nameTopFrom = val;
      } else {
        this.$set(this.nameJsonForm, this.nameActiveLang, val);
      }
      this.syncNamePopoverToStore();
    },
    syncNamePopoverToStore() {
      const json = buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, this.nameTopFrom);
      this.$store.commit('mobildConfig/nameUpdata', this.nameTopFrom);
      this.$store.commit('mobildConfig/nameJsonUpdata', json);
      return json;
    },
    getNameLanguageList() {
      return systemLanguageList()
        .then((list) => {
          if (!list || list.length === 0) {
            this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          } else {
            this.langOptions = list.map((item) => ({
              code: item.code,
              label: item.name,
              isDefault: item.isDefault,
            }));
            const defaultLang = list.find((item) => item.isDefault);
            this.defaultLangCode = defaultLang ? defaultLang.code : 'zh-cn';
          }
          this.nameActiveLang = resolveFormActiveLang(this, this.langOptions, this.defaultLangCode);
          this.hydrateNamePopover();
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameActiveLang = resolveFormActiveLang(this);
          this.hydrateNamePopover();
        })
        .finally(() => {
          if (this.pageId === 0) this.visible = true;
        });
    },
    // 模板名称保存
    saveName(n, j) {
      const json = this.syncNamePopoverToStore();
      if (!hasI18nNameContent(this.nameTopFrom, parseLangJsonMap(json))) {
        return this.$message.warning(this.$t('pagediy.templateNameRequired'));
      }
      if (j === 1) {
        //this.$store.commit('mobildConfig/UPNAME', this.nameContent);
      } else {
        this.$store.commit('mobildConfig/UPNAME', this.nameTopFrom);
      }
      this.saveConfig(0, j);
    },
    /**
     * 保存配置
     * @param n 是否关闭页面，1是
     * @param j 是否是另存模板，1是,0只编辑模板名称
     */
    saveConfig(n, j) {
      this.loading = false;
      let val = this.$store.state.mobildConfig.defaultArray;
      this.$nextTick(function () {
        this.diySaveDate(val, n, j);
      });
    },
    //提交数据
    diySaveDate(val, n, j) {
      let data = {
        value: val,
        title: this.pageTitleRaw,
        titleJson: this.pageTitleJson,
        name: j === 1 ? this.nameContent : j === 0 ? this.nameTopFrom : this.pageNameRaw,
        nameJson: this.pageNameJson,
        isShow: this.showTxt ? 1 : 0,
        isBgColor: this.colorTxt ? 1 : 0,
        colorPicker: this.colorPickerTxt,
        bgPic: this.picUrlTxt,
        bgTabVal: this.tabValTxt,
        isBgPic: this.picTxt ? 1 : 0,
        returnAddress: this.returnAddress,
        titleColor: this.titleColor,
        titleBgColor: this.titleBgColor,
        id: this.pageId ? this.pageId : null,
      };
      if (!hasI18nNameContent(data.name, parseLangJsonMap(data.nameJson))) {
        return this.$message.warning(this.$t('pagediy.templateNameRequired'));
      }
      this.pageId === 0 || j === 1 || (this.pageType === 'copy' && Number(this.$route.params.id) === this.pageId)
        ? pagediySaveApi(data)
            .then((res) => {
              this.loading = false;
              if (j !== 1) {
                this.pageId = res.id; //id
              }
              this.$message.success(this.$t('product.addSuccess'));
              this.getQRcode();
              this.onCancel();
              this.close(n);
            })
            .catch(() => {
              this.loading = false;
            })
        : pagediyUpdateApi(data)
            .then((res) => {
              this.loading = false;
              this.$message.success(this.$t('product.editSuccess'));
              this.close(n);
              this.onCancel();
            })
            .catch(() => {
              this.loading = false;
            });
    },
    //保存关闭
    close(n) {
      if (n === 1) {
        var userAgent = navigator.userAgent;
        if (userAgent.indexOf('Firefox') != -1 || userAgent.indexOf('Chrome') != -1) {
          window.open('', '_self').close();
          window.location.href = 'about:blank';
        } else {
          window.opener = null;
          window.open('about:blank', '_self');
          window.close();
        }
      }
    },
    // 重置
    reast() {
      this.mConfig = [];
      this.rConfig = [];
      this.activeIndex = -99;
      this.getInfo();
      this.isSearch = false;
      this.isFooter = false;
      this.isTab = false;
      this.isComb = false;
      this.isReast = false;
    },
    // 组件返回
    config(data) {
      let propsObj = this.propsObj;
      propsObj.data = data;
      propsObj.name = this.activeConfigName;
    },
    // 对象转数组
    objToArr(data) {
      let obj = Object.keys(data);
      let m = obj.map((key) => data[key]);
      return m;
    },
    // 数组排序
    arraySort() {
      let tempArr = [];
      let basis = {
        title: this.$t('pagediy.baseComponent'),
        list: [],
        isOpen: true,
      };
      let marketing = {
        title: this.$t('pagediy.marketingComponent'),
        list: [],
        isOpen: true,
      };
      let tool = {
        title: this.$t('pagediy.toolComponent'),
        list: [],
        isOpen: true,
      };
      this.lConfig.map((el, index) => {
        if (el.type == 0) {
          basis.list.push(el);
        }
        if (el.type == 1) {
          marketing.list.push(el);
        }
        if (el.type == 2) {
          tool.list.push(el);
        }
      });
      tempArr.push(basis, marketing, tool);
      this.leftMenu = tempArr;
    },
    // 组件删除
    bindDelete(item, key) {
      if (item.name == 'search_box') {
        this.isSearch = false;
      }
      if (item.name == 'home_footer') {
        this.isFooter = false;
      }
      if (item.name == 'nav_bar') {
        this.isTab = false;
      }
      if (item.name == 'home_comb') {
        this.isComb = false;
      }
      this.mConfig.splice(key, 1);
      this.rConfig.splice(0, 1);
      if (this.mConfig.length != key) {
        this.rConfig.push(this.mConfig[key]);
      } else {
        if (this.mConfig.length) {
          this.activeIndex = key - 1;
          this.rConfig.push(this.mConfig[key - 1]);
        } else {
          this.showTitle();
        }
      }
      // 删除第几个配置
      this.$store.commit('mobildConfig/DELETEARRAY', item);
    },
    //左边配置模块点击添加；
    addDom(item, type) {
      this.addDomCon(item, type);
    },
    //中间页点击隐藏模块；
    bindHide(item, key) {
      this.$nextTick(() => {
        this.$set(this.mConfig[key], 'isShow', !this.mConfig[key].isShow);
      });

      //this.mConfig[key].isShow = !this.mConfig[key].isShow
      this.$store.commit('mobildConfig/UPDATESHOW', item);
    },
    //中间页点击添加模块；
    bindAddDom(item, type, index) {
      if (item.name === 'home_footer') return this.$message.warning(this.$t('pagediy.componentOnceOnly'));
      let i = item;
      this.lConfig.forEach((j) => {
        if (item.name == j.name) {
          i = j;
        }
      });
      this.addDomCon(i, type, index);
    },
    //数组元素互换位置
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
    //点击上下移动；
    movePage(item, index, type) {
      if (type) {
        if (index == 0) {
          return;
        }
      } else {
        if (index == this.mConfig.length - 1) {
          return;
        }
      }
      if (
        item.name == 'search_box' ||
        item.name == 'nav_bar' ||
        item.name == 'home_comb' ||
        item.name == 'home_footer'
      ) {
        return this.$message.warning(this.$t('pagediy.componentNoMove'));
      }
      if (type) {
        if (
          this.mConfig[index - 1].name == 'search_box' ||
          this.mConfig[index - 1].name == 'nav_bar' ||
          this.mConfig[index - 1].name == 'home_comb'
        ) {
          return this.$message.warning('搜索框或分类必须为顶部');
        }
        this.swapArray(this.mConfig, index - 1, index);
      } else {
        this.swapArray(this.mConfig, index, index + 1);
      }
      let obj = {};
      this.rConfig = [];
      obj.oldIndex = index;
      if (type) {
        obj.newIndex = index - 1;
      } else {
        obj.newIndex = index + 1;
      }
      this.mConfig.forEach((el, index) => {
        el.num = new Date().getTime() * 1000 + index;
        el.isShow = true;
      });
      let tempItem = JSON.parse(JSON.stringify(item));
      this.rConfig.push(tempItem);
      obj.element = item;
      obj.list = this.mConfig;
      if (type) {
        this.activeIndex = index - 1;
      } else {
        this.activeIndex = index + 1;
      }
      this.$store.commit('mobildConfig/SETCONFIGNAME', item.name);
      this.$store.commit('mobildConfig/defaultArraySort', obj);
    },
    // 页面标题点击
    showTitle() {
      this.activeIndex = -100;
      let obj = {};
      for (var i in mConfig) {
        if (i == 'pageTitle') {
          obj = mConfig[i];
          obj.configName = mConfig[i].name;
          obj.cname = '页面设置';
        }
      }
      let abc = obj;
      this.rConfig = [];
      this.rConfig[0] = JSON.parse(JSON.stringify(obj));
    },
    // 组件添加
    addDomCon(item, type, index) {
      if (item.name === 'home_footer') {
        if (this.isFooter) return this.$message.warning(this.$t('pagediy.componentOnceOnly'));
        this.isFooter = true;
      }
      if (item.name === 'search_box') {
        if (this.isSearch) return this.$message.warning(this.$t('pagediy.componentOnceOnly'));
        if (this.isComb) return this.$message.warning(this.$t('pagediy.componentConflictTip'));
        this.isSearch = true;
      }
      if (item.name === 'nav_bar') {
        if (this.isTab) return this.$message.warning(this.$t('pagediy.componentOnceOnly'));
        if (this.isComb) return this.$message.warning(this.$t('pagediy.componentConflictTip'));
        this.isTab = true;
      }
      if (item.name === 'home_comb') {
        if (this.isComb) return this.$message.warning(this.$t('pagediy.componentOnceOnly'));
        if (this.isSearch || this.isTab) return this.$message.warning('组合组件不能和搜索框或者商品分类同时存在');
        this.isComb = true;
      }
      idGlobal += 1;
      let obj = {};
      let timestamp = new Date().getTime() * 1000;
      item.num = `${timestamp}`;
      item.id = `id${timestamp}`;
      this.activeConfigName = item.name;
      let tempItem = JSON.parse(JSON.stringify(item));
      if (item.name == 'search_box' || item.name == 'home_comb') {
        this.rConfig = [];
        this.mConfig.unshift(tempItem);
        this.activeIndex = 0;
        this.rConfig.push(tempItem);
      } else if (item.name == 'nav_bar') {
        this.rConfig = [];
        if (this.mConfig[0] && this.mConfig[0].name === 'search_box') {
          this.mConfig.splice(1, 0, tempItem);
          this.activeIndex = 1;
        } else {
          this.mConfig.splice(0, 0, tempItem);
          this.activeIndex = 0;
        }
        this.rConfig.push(tempItem);
      } else {
        if (type) {
          this.rConfig = [];
          if (this.activeIndex == 0 && this.mConfig[1] && this.mConfig[1].name == 'nav_bar') {
            this.activeIndex = 2;
          } else {
            this.activeIndex = this.activeIndex >= 0 ? this.activeIndex + 1 : this.mConfig.length;
          }
          this.mConfig.splice(this.activeIndex, 0, tempItem);
          this.rConfig.push(tempItem);
        } else {
          this.mConfig.splice(index + 1, 0, tempItem);
          this.activeIndex = index;
        }
      }
      this.mConfig.forEach((el, i) => {
        el.num = new Date().getTime() * 1000 + i;
      });
      // 保存组件名称
      obj.element = item;
      obj.list = this.mConfig;
      this.$nextTick(() => {
        let middle = this.$refs['wrapperCon'];
        if (item.name === 'search_box' || item.name === 'nav_bar' || item.name === 'home_comb') {
          middle.scrollTop = 0;
        }
      });
      this.$store.commit('mobildConfig/SETCONFIGNAME', item.name);
      this.$store.commit('mobildConfig/defaultArraySort', obj);
      if (type === 0) return this.$message.success(this.$t('application.copySuccess'));
    },
    //移动事件
    onMove(e) {
      const name = e.relatedContext && e.relatedContext.element && e.relatedContext.element.name;
      if (name == 'search_box') return false;
      if (name == 'nav_bar') return false;
      if (name == 'home_comb') return false;
      return true;
    },
    //组件拖拽事件
    onLog(evt) {
      // 中间拖拽排序
      if (evt.moved) {
        if (evt.moved.element.name == 'search_box') {
          return this.$message.warning(this.$t('pagediy.componentNoDrag'));
        }
        if (evt.moved.element.name == 'nav_bar') {
          return this.$Message.warning(this.$t('pagediy.componentNoDrag'));
        }
        if (evt.moved.element.name == 'home_comb') {
          return this.$Message.warning(this.$t('pagediy.componentNoDrag'));
        }
        evt.moved.oldNum = this.mConfig[evt.moved.oldIndex].num;
        evt.moved.newNum = this.mConfig[evt.moved.newIndex].num;
        evt.moved.status = evt.moved.oldIndex > evt.moved.newIndex;
        this.mConfig.forEach((el, index) => {
          el.num = new Date().getTime() * 1000 + index;
          el.isShow = true;
        });
        evt.moved.list = this.mConfig;
        this.rConfig = [];
        let item = evt.moved.element;
        let tempItem = JSON.parse(JSON.stringify(item));
        this.rConfig.push(tempItem);
        this.activeIndex = evt.moved.newIndex;
        this.$store.commit('mobildConfig/SETCONFIGNAME', item.name);
        this.$store.commit('mobildConfig/defaultArraySort', evt.moved);
      }
      // 从左向右拖拽排序
      if (evt.added) {
        let data = evt.added.element;
        let obj = {};
        let timestamp = new Date().getTime() * 1000;
        data.num = timestamp;
        this.activeConfigName = data.name;
        let tempItem = JSON.parse(JSON.stringify(data));
        tempItem.id = 'id' + tempItem.num;
        this.mConfig[evt.added.newIndex] = tempItem;
        this.rConfig = [];
        this.rConfig.push(tempItem);
        this.mConfig.forEach((el, index) => {
          el.num = new Date().getTime() * 1000 + index;
          el.isShow = true;
        });
        evt.added.list = this.mConfig;
        this.activeIndex = evt.added.newIndex;
        // 保存组件名称
        this.$store.commit('mobildConfig/SETCONFIGNAME', data.name);
        this.$store.commit('mobildConfig/defaultArraySort', evt.added);
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '../styles/index.scss';
.page-name {
  position: absolute;
  top: 0;
  background: #fff;
  left: -100px;
  width: 86px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  font-size: 13px;
  color: #666;
  border-radius: 3px;
  &:before {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background: #fff;
    transform: rotate(45deg);
    top: 50%;
    right: -5px;
    margin-top: -5px;
  }
}

.preview {
  ::v-deep .el-button.is-disabled,
  .el-button.is-disabled:hover,
  .el-button.is-disabled:focus {
    cursor: not-allowed !important;
  }
}

::v-deep.el-button--medium {
  font-size: 13px !important;
}
.deviseBox {
  padding: 0 !important;
  ::v-depp .el-card__body {
    padding: 0 !important;
  }
}
.border {
  border: 2px solid var(--prev-color-primary);
  width: 385px;
  margin: 0 auto;
}
.border-box {
  transform: translateZ(0);
}
.noStyle {
  margin: initial !important;
  padding-top: 0 !important;
}
.wrapper-con {
  flex: 1;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  height: 100%;
  .btn {
    display: flex;
    flex-direction: column;
    margin-right: 20px;
    ::v-deep.el-button + .el-button {
      margin-left: 0 !important;
    }
  }
}
.ysize {
  background-size: 100%;
}
.fullsize {
  background-size: 100% 100%;
}
.repeat {
  background-repeat: repeat;
}
.noRepeat {
  background-repeat: no-repeat;
}
::v-depp.el-input__inner {
  font-size: 13px;
}
.defaultData {
  cursor: pointer;
  position: absolute;
  left: 50%;
  margin-left: 245px;
  .data {
    margin-top: 20px;
    color: #282828;
    background-color: #fff;
    width: 94px;
    text-align: center;
    height: 32px;
    line-height: 32px;
    border-radius: 3px;
    font-size: 12px;
  }
  .data:hover {
    background-color: #2d8cf0;
    color: #fff;
    border: 0;
  }
}
.overflowy {
  /*overflow-y: scroll;*/
  .picture {
    width: 377px;
    height: 20px;
    margin: 0 auto;
    background-color: #fff;
  }
}
.bnt {
  width: 80px !important;
}
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px #fff;
  display: none;
}

.left:hover::-webkit-scrollbar-thumb,
.right-box:hover::-webkit-scrollbar-thumb {
  display: block;
}

.contxt:hover ::-webkit-scrollbar-thumb {
  display: block;
}

::-webkit-scrollbar {
  width: 4px !important; /*对垂直流动条有效*/
}
.scrollCon {
  overflow-y: scroll;
}
.scrollCon::-webkit-scrollbar {
  display: none;
}
.scroll-box {
  height: 100%;
}
.scroll-box .position {
  display: block !important;
  height: 40px;
  text-align: center;
  line-height: 40px;
  border: 1px dashed var(--prev-color-primary);
  color: var(--prev-color-primary);
  /*background-color: #edf4fb;*/
}

.scroll-box .conter {
  display: none !important;
}

.dragClass {
  background-color: #fff;
}

.ivu-mt {
  display: flex;
  justify-content: space-between;
}

.iconfont-diy,
.iconfont {
  font-size: 24px;
  color: var(--prev-color-primary);
}

.diy-wrapper {
  max-width: 100%;
  min-width: 1100px;
  display: flex;
  justify-content: space-between;
  .left {
    min-width: 300px;
    max-width: 300px;
    border-radius: 4px;
    height: 100%;
    .wrapper {
      padding-left: 15px;
      padding-right: 15px;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;

      .tips {
        height: 63px;
        line-height: 63px;
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #000;
        cursor: pointer;
        .icon {
          line-height: 63px;
        }
        .ivu-icon {
          color: #000;
        }
      }
    }

    .link-item {
      padding: 10px;
      border-bottom: 1px solid #f5f5f5;
      font-size: 12px;
      color: #323232;

      .name {
        font-size: 14px;
        color: var(--prev-color-primary);
      }

      .link-txt {
        margin-top: 2px;
        word-break: break-all;
      }

      .params {
        margin-top: 5px;
        color: #1cbe6b;
        word-break: break-all;

        .txt {
          color: #323232;
        }

        span {
          &:last-child i {
            display: none;
            color: red;
          }
        }
      }

      .lable {
        display: flex;
        margin-top: 5px;
        color: #999;
        align-items: center;
        p {
          flex: 1;
          word-break: break-all;
        }

        button {
          margin-left: 30px;
        }
      }
    }

    .dragArea.list-group {
      display: flex;
      flex-wrap: wrap;
      overflow-y: scroll;
      overflow-x: hidden;
      min-height: max-content;
      .list-group-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 74px;
        margin-right: 17px;
        margin-bottom: 34px;
        font-size: 12px;
        color: #666;
        cursor: pointer;
        border-radius: 5px;
        text-align: center;
        height: 66px;
        &:hover {
          box-shadow: 0 0 5px 0 rgba(24, 144, 255, 0.3);
          border-right: 5px;
        }

        &:nth-child(3n) {
          margin-right: 0;
        }
      }
    }
  }

  .content {
    position: relative;
    height: 650px;
    width: 100%;
    padding-top: 40px;
    .page-foot {
      position: relative;
      width: 375px;
      margin: 0 auto 20px auto;

      .delete-box {
        display: none;
        position: absolute;
        left: -2px;
        top: 0;
        width: 383px;
        height: 100%;
        border: 2px dashed var(--prev-color-primary);
        padding: 10px 0;
      }

      &:hover,
      &.on {
        /*cursor: move;*/

        .delete-box {
          /*display: block;*/
        }
      }

      &.on {
        cursor: move;
        .delete-box {
          display: block;
          border: 2px solid var(--prev-color-primary);
          box-shadow: 0 0 10px 0 rgba(24, 144, 255, 0.3);
        }
      }
    }

    .page-title {
      position: relative;
      height: 35px;
      line-height: 35px;
      background: #fff;
      font-size: 15px;
      color: #333333;
      text-align: center;
      width: 377px;
      margin: 0 auto;

      .delete-box {
        display: none;
        position: absolute;
        left: -2px;
        top: 0;
        width: 383px;
        height: 100%;
        border: 2px dashed var(--prev-color-primary);
        padding: 10px 0;

        span {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 32px;
          height: 16px;
          line-height: 16px;
          display: inline-block;
          text-align: center;
          font-size: 10px;
          color: #fff;
          background: rgba(0, 0, 0, 0.4);
          margin-left: 2px;
          cursor: pointer;
          z-index: 11;
        }
      }

      &:hover,
      &.on {
        /*cursor: move;*/

        .delete-box {
          /*display: block;*/
        }
      }

      &.on {
        cursor: move;
        .delete-box {
          display: block;
          border: 2px solid var(--prev-color-primary);
          box-shadow: 0 0 10px 0 rgba(24, 144, 255, 0.3);
        }
      }
    }

    .scroll-box {
      flex: 1;
      width: 379px;
      height: 68vh;
      margin: 0 auto;
      padding-top: 1px;
    }

    .dragArea.list-group {
      width: 100%;
      height: 100%;

      .mConfig-item {
        position: relative;
        cursor: move;

        .delete-box {
          display: none;
          position: absolute;
          left: -2px;
          top: 0;
          width: 383px;
          height: 100%;
          border: 2px dashed var(--prev-color-primary);
          /*padding: 10px 0;*/

          .handleType {
            position: absolute;
            right: -43px;
            top: 0;
            width: 30px;
            height: 136px;
            border-radius: 4px;
            background: #666666;
            cursor: pointer;
            color: #fff !important;
            text-align: center;
            padding: 4px 0;
            .iconfont {
              padding: 5px 0;
              color: #fff !important;
              font-size: 20px !important;
              &.on {
                opacity: 0.4;
              }
            }
          }
        }
        &.on {
          cursor: move;
          .delete-box {
            display: block;
            border: 2px solid var(--prev-color-primary);
            box-shadow: 0 0 10px 0 rgba(24, 144, 255, 0.3);
          }
        }
      }
    }
  }

  .right-box {
    min-width: 570px;
    max-width: 570px;
    border-radius: 4px;
    overflow: scroll;
    -webkit-overflow-scrolling: touch;
  }

  ::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
  }

  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #bfc1c4;
  }
}

.foot-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: #fff;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.03);

  button {
    width: 100px;
    height: 32px;
    font-size: 13px;

    &:first-child {
      margin-right: 20px;
    }
  }
}

::v-depp .ivu-scroll-loader {
  display: none;
}

::v-depp .el-card {
  bordr: none;
  box-shadow: none;
}
.dragArea.list-group .list-group-item {
  margin-top: 1px;
  margin-left: 1px;
}
.content-color {
  background-color: #f5f5f5;
}
</style>
