<template>
  <div class="infoBox">
    <el-drawer
      :visible.sync="dialogVisibleInfoData"
      :title="isAtud ? $t('product.auditTitle') : $t('product.productDetail')"
      :direction="direction"
      custom-class="demo-drawer"
      size="1000px"
      ref="drawer"
      class="infoBox"
      @close="onClose"
      :before-close="onClose"
    >
      <div v-loading="loading">
        <div class="detailHead">
          <div class="acea-row row-between headerBox">
            <div class="full">
              <img class="order_icon" :src="formValidate.image" alt="" />
              <div class="text">
                <div class="lang-name-switch mb8">
                  <el-radio-group v-model="activeLang" size="mini">
                    <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                      {{ lang.label }}
                    </el-radio-button>
                  </el-radio-group>
                </div>
                <div class="title">{{ displayName }}</div>
                <div>
                  <span class="mr20">{{ $t('product.productIdLabel') }}{{ formValidate.id }}</span>
                </div>
              </div>
            </div>
            <div v-if="isAtud" class="acea-row justify-content">
              <el-button
                size="small"
                v-debounceClick="
                  () => {
                    onSubmit('fail');
                  }
                "
                style="margin-left: 0"
                >{{ loadingBtn ? $t('common.submitting') : $t('product.auditRejected') }}</el-button
              >
              <el-button
                size="small"
                type="primary"
                v-debounceClick="
                  () => {
                    onSubmit('success');
                  }
                "
                >{{ loadingBtn ? $t('common.submitting') : $t('finance.auditPassed') }}</el-button
              >
            </div>
          </div>
          <ul class="list">
            <li v-show="formValidate.type >= 0" class="item">
              <div class="title">{{ $t('product.productType') }}</div>
              <div>{{ formValidate.type | productTpyeFilter }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('product.productStatus') }}</div>
              <div class="color-warning">{{ formValidate.isShow ? $t('product.onShelf') : $t('product.offShelf') }}</div>
            </li>
            <li v-show="!formValidate.type && formValidate.type !== 0" class="item">
              <div class="title">{{ $t('marketing.exchangePoints') }}</div>
              <div>{{ formValidate.redeemIntegral }}</div>
            </li>
            <li class="item">
              <div class="title">
                {{ !formValidate.type && formValidate.type !== 0 ? $t('marketing.exchangeAmount') : $t('product.productPrice') }}
              </div>
              <div>{{ formValidate.price }}{{ $t('product.yuan') }}</div>
            </li>
            <li class="item">
              <div class="title">{{ !formValidate.type && formValidate.type !== 0 ? $t('marketing.exchangedCount') : $t('product.sales') }}</div>
              <div>{{ formValidate.sales }}</div>
            </li>
            <li class="item">
              <div class="title">{{ formValidate.type >= 0 ? $t('product.stock') : $t('marketing.remainingStock') }}</div>
              <div>{{ formValidate.stock }}</div>
            </li>
            <li v-show="formValidate.type >= 0" class="item">
              <div class="title">{{ $t('product.createTime') }}</div>
              <div></div>
            </li>
          </ul>
        </div>
        <el-tabs type="border-card" v-model="currentTab" v-if="formValidate.id && isShow">
          <el-tab-pane :label="$t('product.basicInfo')" name="0">
            <div class="detailSection divBox">
              <ul class="list mt-16">
                <li v-show="formValidate.categoryId" class="item">
                  <div class="lang">{{ $t('product.platformCategoryLabel') }}</div>
                  <div class="value">
                    <el-cascader
                      v-model="formValidate.categoryId"
                      :options="merPlatProductClassify"
                      :props="props1"
                      :show-all-levels="false"
                      :disabled="isDisabled"
                    />
                  </div>
                </li>
                <li v-show="formValidate.type >= 0" class="item">
                  <div class="lang">{{ $t('product.brandLabel') }}</div>
                  <div class="value">
                    {{ getLocalizedName(getBrandRow(formValidate.brandId), activeLang) || getListName(brandList, formValidate.brandId) }}
                  </div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('product.unitNameLabel') }}</div>
                  <div class="value">{{ displayUnitName }}</div>
                </li>
                <li v-show="!formValidate.type && formValidate.type !== 0" class="item">
                  <div class="lang">{{ $t('marketing.exchangeCountLimitLabel') }}</div>
                  <div class="value">{{ formValidate.exchangeNum }}</div>
                </li>
                <li v-show="!formValidate.type && formValidate.type !== 0" class="item">
                  <div class="lang">{{ $t('product.hotRecommendLabel') }}</div>
                  <div class="value">{{ formValidate.isHot == 1 ? $t('common.open') : $t('common.close') }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('product.sortLabel') }}</div>
                  <div class="value">{{ formValidate.sort }}</div>
                </li>
                <li v-show="formValidate.type === 2" class="item">
                  <div class="lang">{{ $t('product.userRefundApplyLabel') }}</div>
                  <div class="value">{{ formValidate.refundSwitch ? $t('common.open') : $t('common.close') }}</div>
                </li>
                <li v-if="(formValidate.type && formValidate.type !== 2) || formValidate.type === 0" class="item">
                  <div class="lang">{{ $t('order.deliveryMethod') }}</div>
                  <template v-if="Number(formValidate.type) > 4">
                    <div class="value">{{ $t('product.autoShip') }}</div>
                  </template>
                  <template v-else>
                    <div v-show="formValidate.deliveryMethod.includes('1')" style="color: #303133">{{ $t('order.merchantDelivery') }}</div>
                    <div
                      v-show="formValidate.deliveryMethod.includes('1') && formValidate.deliveryMethod.includes('2')"
                      style="color: #303133"
                    >
                      、
                    </div>
                    <div v-show="formValidate.deliveryMethod.includes('2')" style="color: #303133">{{ $t('order.storePickup') }}</div>
                  </template>
                </li>
              </ul>
              <div class="list" style="display: block">
                <div class="item">
                  <div class="lang">{{ $t('product.keywordLabel') }}</div>
                  <div class="value">{{ formValidate.keyword }}</div>
                </div>
                <div v-show="formValidate.guaranteeList" class="item">
                  <div class="lang line-heightOne">{{ $t('product.guaranteeServiceLabel') }}</div>
                  <div class="value acea-row">
                    <div v-for="item in formValidate.guaranteeList" :key="item.id" class="mr20">
                      <span class="iconfont icon-ic-complete1 mr5 font14"></span>{{ getLocalizedName(item, activeLang) }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="lang">{{ $t('product.productIntroLabel') }}</div>
                  <div class="value">{{ displayIntro }}</div>
                </div>
                <div class="item">
                  <div class="acea-row row-middle">
                    <div class="lang">{{ $t('product.coverLabel') }}</div>
                    <div class="upLoadPicBox">
                      <el-image class="pictrue" :src="formValidate.image" :preview-src-list="[formValidate.image]" />
                    </div>
                  </div>
                </div>
                <div v-show="videoLink" class="item">
                  <div class="acea-row row-middle">
                    <div class="lang">{{ $t('marketing.mainVideoLabel') }}</div>
                    <div class="upLoadPicBox">
                      <video class="pictrue" :src="videoLink" controls="controls">{{ $t('product.videoNotSupported') }}</video>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="acea-row row-middle">
                    <div class="lang">{{ $t('product.sliderImagesLabel') }}</div>
                    <div v-for="(item, index) in formValidate.sliderImages" :key="index" class="pictrue">
                      <el-image class="pictrue" :src="item" :preview-src-list="formValidate.sliderImages" />
                    </div>
                  </div>
                </div>
                <div v-if="formValidate.couponList && formValidate.couponList.length" class="item">
                  <div class="acea-row row-middle">
                    <div class="lang">{{ $t('product.purchaseFeedbackCoupon') }}</div>
                    <div class="acea-row" style="margin-top: -10px">
                      <el-tag
                        v-for="(tag, index) in formValidate.couponList"
                        :key="index"
                        class="mr10 mt10"
                        :closable="!isDisabled"
                        :disable-transitions="false"
                        effect="plain"
                      >
                        {{ tag.name }}
                      </el-tag>
                      <span v-if="formValidate.couponList.length === 0" class="mt10">{{ $t('finance.none') }}</span>
                    </div>
                  </div>
                </div>
                <div class="item" v-if="formValidate.systemFormValue">
                  <div class="acea-row row-middle">
                    <div class="lang">{{ $t('product.relatedForm') }}</div>
                    <div>
                      <iframe
                        :src="`${getFrontDomainUrl()}/pages/goods/systemIframe/index?id=${formValidate.systemFormId}`"
                        style="width: 350px; height: 500px"
                        frameborder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('product.specStockTab')" name="1">
            <div class="detailSection divBox">
              <ul class="spec-meta">
                <li class="item">
                  <div class="tips">{{ $t('product.productSpecLabel') }}</div>
                  <div class="value">{{ formValidate.specType ? $t('product.multiSpec') : $t('product.singleSpec') }}</div>
                </li>
                <li v-show="formValidate.type >= 0" class="item">
                  <div class="tips">{{ $t('product.commissionSettingLabel') }}</div>
                  <div class="value">{{ formValidate.isSub ? $t('product.separateSetting') : $t('product.defaultSetting') }}</div>
                </li>
                <li v-show="formValidate.type >= 0" class="item">
                  <div class="tips">{{ $t('product.memberProductLabel') }}</div>
                  <div class="value">{{ formValidate.isPaidMember ? $t('common.yes') : $t('common.no') }}</div>
                </li>
              </ul>
              <div class="spec-table-wrap">
                <div class="tips mb10">{{ $t('product.productAttrLabel') }}</div>
                <el-table :data="AttrValueList" size="small">
                    <el-table-column
                      v-for="(item, iii) in manyTabDate"
                      :key="'spec-' + iii + '-' + activeLang"
                      :label="specColumnTitle(iii)"
                      min-width="140"
                      show-overflow-tooltip
                    >
                      <template slot-scope="scope">
                        <span class="priceBox">{{ localizeSpecCell(iii, scope.row[iii]) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('product.image')" width="70">
                      <template slot-scope="scope">
                        <img v-if="scope.row.image" :src="scope.row.image" class="spec-thumb" alt="" />
                      </template>
                    </el-table-column>
                    <el-table-column
                      v-for="key in attrValueColumns"
                      :key="'attr-' + key"
                      :label="localizedFormThead[key] && localizedFormThead[key].title"
                      min-width="130"
                      show-overflow-tooltip
                    >
                      <template slot-scope="scope">
                        <span>{{ scope.row[key] || '-' }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-if="formValidate.type >= 0" :label="$t('product.barcode')" width="100">
                      <template slot-scope="scope">
                        <span>{{ scope.row.itemNumber }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-if="formValidate.specType" :label="$t('product.defaultSelected')" width="100">
                      <template slot-scope="scope">
                        <span>{{ scope.row.isDefault ? $t('common.yes') : $t('common.no') }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-if="formValidate.specType" :label="$t('product.isShow')" width="100">
                      <template slot-scope="scope">
                        <span>{{ scope.row.isShow ? $t('product.show') : $t('product.hide') }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('product.productDetail')" name="2">
            <div class="detailSection divBox">
              <div class="contentPic" v-html="formValidate.content || $t('finance.none')"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import Tinymce from '@/components/Tinymce/index';
import { productAuditApi } from '@/api/product';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { getListName, getFrontDomainUrl } from '@/utils/ZBKJIutil';
import { getLocalizedName, getLocalizedText, resolveFormActiveLang, localizeProductSpecName, localizeProductSpecValue } from '@/utils/localizedName';
import product from '@/mixins/product';
import { defaultObj, objTitle } from '@/views/marketing/pointsMall/default';

export default {
  name: 'ProductProductAdd',
  props: {
    isShow: {
      type: Boolean,
      default: true,
    },
    isAtud: {
      type: Boolean,
      default: false,
    },
    productId: {
      type: [Number, String],
      default: () => null,
    },
    componentKey: {
      type: Number,
      default: () => 0,
    },
    dialogVisibleInfoData: {
      type: Boolean,
      default: false,
    },
    fromType: {
      type: String,
      default: () => '',
    },
  },
  components: { Tinymce },
  mixins: [product],
  watch: {
    'formValidate.attrList': {
      handler: function (val) {
        //  if (this.formValidate.specType) this.watCh(val); //重要！！！
      },
      immediate: false,
      deep: true,
    },
    componentKey: {
      handler: function (val) {
        this.currentTab = '0';
        this.dialogVisible = true;
      },
      immediate: false,
      deep: true,
    },
    dialogVisibleInfoData: {
      handler: function (val) {
        this.loading = true;
        this.AttrValueList = [];
        if (val) {
          this.activeLang = resolveFormActiveLang(this);
          if (this.fromType === 'product') {
            //普通商品详情
            this.getProductInfo(this.productId);
            setTimeout(() => {
              this.getTableAttrValue();
            }, 500);
          } else {
            //积分商品详情
            this.getPointsProductInfo(this.productId);
          }
        }
        this.loading = false;
      },
      immediate: false,
      deep: true,
    },
  },
  data() {
    return {
      manyTabTit: {},
      manyTabDate: {}, // 生成规格表格中的头部标题
      formThead: Object.assign({}, objTitle),
      OneattrValue: [Object.assign({}, defaultObj.attrValueList[0])], // 单规格
      ManyAttrValue: [Object.assign({}, defaultObj.attrValueList[0])], // 多规格
      tableAttrValue: {}, //商品规格
      rules: {
        auditStatus: [{ required: true, message: this.$t('product.pleaseSelectAuditStatus'), trigger: 'change' }],
        reason: [{ required: true, message: this.$t('product.pleaseEnterRejectReason'), trigger: 'blur' }],
      },
      ruleForm: {
        reason: '',
        auditStatus: 'success',
        id: '',
      },
      direction: 'rtl',
      dialogVisible: false,
      isDisabled: true,
      props1: {
        children: 'childList',
        label: 'name',
        value: 'id',
        multiple: false,
        emitPath: false,
      },
      tabs: [],
      props: { multiple: true },
      currentTab: '0',
      isAttr: false,
      loadingBtn: false,
      frontDomain: localStorage.getItem('frontDomain'),
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
    };
  },
  computed: {
    displayName() {
      return getLocalizedText(this.formValidate.name, this.formValidate.nameJson, this.activeLang);
    },
    displayUnitName() {
      return getLocalizedText(this.formValidate.unitName, this.formValidate.unitNameJson, this.activeLang);
    },
    displayIntro() {
      return getLocalizedText(this.formValidate.intro, this.formValidate.introJson, this.activeLang);
    },
    localizedFormThead() {
      const map = {
        price: this.$t('product.attrPrice'),
        vipPrice: this.$t('product.attrVipPrice'),
        cost: this.$t('product.attrCost'),
        otPrice: this.$t('product.attrOtPrice'),
        stock: this.$t('product.stock'),
        weight: this.$t('product.attrWeight'),
        volume: this.$t('product.attrVolume'),
        brokerage: this.$t('product.attrBrokerage1'),
        brokerageTwo: this.$t('product.attrBrokerage2'),
        barCode: this.$t('product.attrBarCode'),
      };
      const out = {};
      Object.keys(this.formThead || {}).forEach((key) => {
        out[key] = { title: map[key] || (this.formThead[key] && this.formThead[key].title) };
      });
      return out;
    },
    attrValueColumns() {
      return Object.keys(this.tableAttrValue || {}).filter((key) => this.localizedFormThead[key]);
    },
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route);
    this.currentTab = '0';
    if (this.$route.params.id && this.formValidate.specType) {
      //    this.$watch(this.formValidate.attrList, this.watCh);
    }
    if (!localStorage.getItem('merPlatProductClassify')) this.$store.dispatch('product/getAdminProductClassify');
    this.getLanguageList();
  },
  mounted() {
    this.getTableAttrValue();
    if (this.productId) {
      this.currentTab = '0';
      this.setTagsViewTitle();
    }
  },
  methods: {
    getListName,
    getFrontDomainUrl,
    getLocalizedName,
    getLanguageList() {
      systemLanguageList()
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
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    getBrandRow(brandId) {
      return (this.brandList || []).find((item) => item.id === brandId) || {};
    },
    specColumnTitle(key) {
      const attr = (this.formValidate.attrList || []).find((item) => item.attributeName === key);
      const title = localizeProductSpecName(attr, this.activeLang) || (this.manyTabTit[key] && this.manyTabTit[key].title) || key;
      return this.localizeSpecText(title);
    },
    localizeSpecCell(specKey, text) {
      const attr = (this.formValidate.attrList || []).find((item) => item.attributeName === specKey);
      const localized = localizeProductSpecValue(attr, text, this.activeLang);
      return this.localizeSpecText(localized || text);
    },
    localizeSpecText(text) {
      if (!text) return text;
      if (text === '规格') return this.tByLang('product.specName');
      if (text === '默认') return this.tByLang('product.specDefault');
      return text;
    },
    tByLang(key) {
      const lang = this.activeLang || this.$i18n.locale || 'zh-cn';
      const messages = this.$i18n.messages[lang] || this.$i18n.messages['zh-cn'] || {};
      const val = key.split('.').reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : undefined), messages);
      return typeof val === 'string' ? val : this.$t(key);
    },
    //表格内的数据
    getTableAttrValue() {
      let obj = Object.assign({}, defaultObj.attrValueList[0]);
      delete obj.image;
      delete obj.isShow;
      //普通商品去掉兑换积分
      if (this.fromType === 'product') {
        delete obj.redeemIntegral;
      } else {
        // 积分金额去掉otPrice
        delete obj.otPrice;
      }
      if (!this.formValidate.isSub) {
        delete obj.brokerage;
        delete obj.brokerageTwo;
      }
      if (!this.formValidate.isPaidMember) {
        delete obj.vipPrice;
      } else {
        obj.vipPrice = Object.assign({}, defaultObj.attrValueList[0]).vipPrice;
      }
      this.tableAttrValue = obj;
    },
    close() {
      this.dialogVisible = false;
      this.currentTab = '0';
    },
    //审核拒绝
    cancelForm() {
      this.$modalPrompt('textarea', this.$t('product.rejectReason')).then((V) => {
        this.ruleForm.reason = V;
        this.submit();
      });
    },
    // 审核提交
    onSubmit(type) {
      this.ruleForm.auditStatus = type;
      if (type === 'success') {
        this.$modalSure(this.$t('product.approveProductConfirm')).then(() => {
          this.submit();
        });
      } else {
        this.cancelForm();
      }
    },
    submit() {
      this.loadingBtn = true;
      this.ruleForm.id = this.productId;
      productAuditApi(this.ruleForm)
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          //this.dialogVisible = false;
          this.currentTab = '0';
          this.$emit('subSuccess');
          this.loadingBtn = false;
        })
        .catch((res) => {
          this.loadingBtn = false;
        });
    },
    changeNodes(data) {
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          if (!data[i].childList || data[i].childList.length < 1) {
            data[i].childList = undefined;
          } else {
            this.changeNodes(data[i].childList);
          }
        }
      }
      return data;
    },
    setTagsViewTitle() {
      const title = this.isDisabled ? this.$t('product.productDetail') : this.$t('product.editProduct');
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.$route.params.id}` });
      this.$store.dispatch('tagsView/updateVisitedView', route);
    },
    // 表单验证
    validate(prop, status, error) {
      if (status === false) {
        this.$message.warning(error);
      }
    },
    onClose() {
      this.ruleForm.auditStatus = 'success';
      this.ruleForm.reason = '';
      this.$emit('onCloseInfo');
    },
  },
};
</script>
<style scoped lang="scss">
::v-deep .el-table th.el-table__cell > .cell,
::v-deep.el-table .cell,
.el-table--border .el-table__cell:first-child .cell {
  padding-left: 15px;
}

.detailSection {
  border: none !important;
}

.mb8 {
  margin-bottom: 8px;
}

.lang-name-switch {
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}

.tipsWidth {
  width: auto !important;
  min-width: 110px;
}

.spec-meta {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  gap: 12px 32px;

  .item {
    flex: 0 1 auto;
    display: flex;
    align-items: flex-start;
    margin-top: 0;
    min-width: 220px;
  }

  .tips {
    width: auto !important;
    min-width: 110px;
    text-align: left;
    flex-shrink: 0;
    margin-right: 8px;
  }
}

.spec-table-wrap {
  margin-top: 8px;
}

.spec-thumb {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.tabNumWidth {
  margin-left: 0;
}

.contentPic {
  ::v-deep img {
    max-width: 100% !important;
    height: auto;
  }
}

.demo-drawer__content {
  padding-bottom: 86px;
}

.spfont {
  color: #606266;
}

.from-foot-btn {
  width: 100%;
  padding: 20px;
}

.fix {
  z-index: 10;
  position: absolute;
  left: 0;
  bottom: 0px;
  padding-bottom: 10px;
  background: #fff;
}

.btn-shadow {
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.05);
}

.infoBox {
  ::v-deep.el-select__tags {
    line-height: inherit;
    left: -6px;
    top: 37%;
  }

  ::v-deep.el-tag.el-tag--info {
    background: none;
    border: none;
    color: #303133 !important;
    height: auto;
    line-height: inherit;
    cursor: none;
    font-size: 13px !important;
  }

  ::v-deep.el-input--medium {
    font-size: 13px;
  }

  ::v-deep.el-drawer__header {
    margin-bottom: 0;
    font-size: 20px;
  }

  ::v-deep .el-input.is-disabled .el-input__inner,
  ::v-deep .el-cascader {
    font-size: 13px;
    height: auto;
    background: none;
    cursor: none;
    color: #303133;
    display: inline-block;
    line-height: inherit;
  }

  ::v-deep.el-icon-arrow-down,
  ::v-deep .el-icon-arrow-up {
    display: none;
  }
}

.divBox {
  ::v-deep .el-input__inner:hover,
  ::v-deep.el-input > input,
  ::v-deep.el-textarea > textarea {
    border: none;
    padding: 0;
  }

  ::v-deep.el-card__body {
    padding: 5px;
  }
}

.disLabel {
  ::v-deep .el-form-item__label {
    margin-left: 36px !important;
  }
}

.disLabelmoren {
  ::v-deep.el-form-item__label {
    margin-left: 120px !important;
  }
}

.priamry_border {
  border: 1px solid var(--prev-color-primary);
  color: var(--prev-color-primary);
}

.color-item {
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  color: #fff;
  margin-right: 10px;
}

.color-list .color-item.blue {
  background-color: #1e9fff;
}

.color-list .color-item.yellow {
  background-color: rgb(254, 185, 0);
}

.color-list .color-item.green {
  background-color: #009688;
}

.color-list .color-item.red {
  background-color: #ed4014;
}

.proCoupon {
  ::v-deep .el-form-item__content {
    margin-top: 5px;
  }
}

.tabPic {
  width: 40px !important;
  height: 40px !important;

  img {
    width: 100%;
    height: 100%;
  }
}

.noLeft {
  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}

.selWidth {
  width: 100%;
}

.selWidthd {
  width: 100px;
}

.button-new-tag {
  height: 28px;
  line-height: 26px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.labeltop {
  ::v-deep .el-form-item__label {
    float: none !important;
    display: inline-block !important;
    width: auto !important;
  }
}

.iview-video-style {
  width: 300px;
  height: 180px;
  border-radius: 10px;
  background-color: #707070;
  margin: 0 120px 20px;
  position: relative;
  overflow: hidden;
}

.iview-video-style .iconv {
  color: #fff;
  line-height: 180px;
  width: 50px;
  height: 50px;
  display: inherit;
  font-size: 26px;
  position: absolute;
  top: -74px;
  left: 50%;
  margin-left: -25px;
}

.iview-video-style .mark {
  position: absolute;
  width: 100%;
  height: 30px;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
}
</style>
