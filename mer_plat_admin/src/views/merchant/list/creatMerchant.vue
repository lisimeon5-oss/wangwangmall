<template>
  <div>
    <div class="detailHead bdbtmSolid">
      <div class="acea-row row-between headerBox">
        <div class="full">
          <div class="order_icon"><span class="iconfont icon-shanghuliebiao"></span></div>
          <div class="text">
            <div class="acea-row">
              <div class="title mr10">{{ displayMerchantName }}</div>
              <div v-show="dataForm.isSelf" class="isSelf bg-prompt-color">{{ $t('product.selfOperated') }}</div>
              <div v-show="dataForm.typeId" class="ml8 bg-warning-color isSelf">
                {{ dataForm.typeId | merchantTypeFilter }}
              </div>
            </div>
            <div v-if="dataForm.addressDetail">
              <span class="mr20">{{ dataForm.addressDetail }}</span>
            </div>
          </div>
        </div>
        <div class="dialog-footer" v-if="!isDisabled">
          <el-button size="small" @click="handleClose">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button
            type="primary"
            size="small"
            v-hasPermi="['platform:merchant:add', 'platform:merchant:update']"
            :loading="loading"
            @click="onsubmit('dataForm')"
            >{{ $t('common.save') }}</el-button
          >
        </div>
        <div v-show="isDisabled" class="right-align">
          <el-button
            type="primary"
            size="small"
            v-hasPermi="['platform:merchant:update']"
            :loading="loading"
            @click="handleChangeEdit"
            >{{ $t('common.edit') }}</el-button
          >
        </div>
      </div>
    </div>
    <div class="prompt">
      <el-alert :title="$t('merchant.merchantLoginTip')" type="warning" effect="light">
      </el-alert>
    </div>
    <el-form v-loading="loadingFrom" ref="dataForm" :model="dataForm" label-width="100px" :rules="rules">
      <el-form-item :label="$t('product.merchantNameLabel')" prop="name">
        <div class="lang-name-switch from-ipt-width">
          <el-radio-group v-model="activeLang" size="small" :disabled="isDisabled">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="dataForm.name"
            maxlength="50"
            :disabled="isDisabled"
            :placeholder="$t('merchant.pleaseEnterMerchantName')"
            class="lang-name-input"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            maxlength="50"
            :disabled="isDisabled"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
            class="lang-name-input"
          />
        </div>
      </el-form-item>
      <el-form-item v-if="merId > 0 || isDisabled" :label="$t('merchant.merchantAccountLabel')" required>
        <el-input
          v-model.trim="dataForm.account"
          :disabled="isDisabled || merId > 0"
          :placeholder="$t('merchant.pleaseEnterMerchantAccount')"
          class="from-ipt-width"
        />
      </el-form-item>
      <el-form-item :label="$t('merchant.merchantPhoneLabel')" prop="phone">
        <el-input
          v-model.trim="dataForm.phone"
          :disabled="isDisabled || merId > 0"
          :placeholder="$t('merchant.pleaseEnterMerchantPhone')"
          class="from-ipt-width"
        />
      </el-form-item>
      <el-form-item :label="$t('merchant.merchantRealNameLabel')" prop="realName">
        <el-input
          v-model.trim="dataForm.realName"
          :disabled="isDisabled"
          :placeholder="$t('merchant.pleaseEnterMerchantRealName')"
          class="from-ipt-width"
        />
      </el-form-item>
      <el-form-item :label="$t('merchant.merchantCategoryLabel')" prop="categoryId">
        <el-select
          class="from-ipt-width"
          v-model="dataForm.categoryId"
          :placeholder="$t('merchant.pleaseSelectMerchantCategory')"
          :disabled="isDisabled"
          @change="onChange(dataForm.categoryId)"
        >
          <el-option v-for="item in merchantClassify" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('merchant.handlingFeePercentLabel')" prop="handlingFee">
        <el-input-number
          :disabled="isDisabled"
          v-model.trim="dataForm.handlingFee"
          :min="0"
          :precision="2"
        ></el-input-number>
      </el-form-item>
      <el-form-item :label="$t('merchant.storeTypeLabel')" prop="typeId">
        <el-select v-model="dataForm.typeId" :placeholder="$t('merchant.pleaseSelectStoreType')" :disabled="isDisabled" class="from-ipt-width">
          <el-option v-for="(item, index) in merchantType" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('merchant.merchantKeywordLabel')" prop="labelarr">
        <Keyword @getLabelarr="getLabelarr" :isDisabled="isDisabled" :labelarr="labelarr"></Keyword>
      </el-form-item>
      <el-form-item :label="$t('merchant.qualificationLabel')" prop="sliderImages">
        <div class="acea-row">
          <div
            v-for="(item, index) in dataForm.sliderImages"
            :key="index"
            class="pictrue"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragover.prevent="handleDragOver($event, item)"
            @dragenter="handleDragEnter($event, item)"
            @dragend="handleDragEnd($event, item)"
          >
            <img :src="item" />
            <i v-if="!isDisabled" class="el-icon-error btndel" @click="handleRemove(index)" />
          </div>
          <div v-if="dataForm.sliderImages.length < 10 && !isDisabled" class="upLoadPicBox" @click="modalPicTap(true)">
            <div class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item :label="$t('user.remarkLabel')" prop="remark">
        <el-input
          v-model.trim="dataForm.remark"
          :disabled="isDisabled"
          type="textarea"
          :placeholder="$t('merchant.pleaseEnterRemark')"
          class="from-ipt-width"
        />
      </el-form-item>
      <el-form-item :label="$t('product.sortLabel')" prop="sort">
        <el-input-number
          v-model.trim="dataForm.sort"
          :disabled="isDisabled"
          :min="$constants.NUM_Range.min"
          :max="$constants.NUM_Range.max"
        ></el-input-number>
      </el-form-item>
      <el-form-item :label="$t('merchant.starRatingLabel')" v-if="merId > 0" class="inline">
        <el-rate :disabled="merId > 0 && isDisabled" v-model="dataForm.starLevel" style="margin-top: 8px"></el-rate>
      </el-form-item>
      <el-form-item :label="$t('merchant.enableLabel')" v-if="dataForm.isSwitch" class="inline">
        <el-switch
          v-model="dataForm.isSwitch"
          :disabled="isDisabled"
          :active-value="true"
          :inactive-value="false"
          :active-text="$t('common.show')"
          :inactive-text="$t('menu.hide')"
        ></el-switch>
      </el-form-item>
      <el-form-item :label="$t('merchant.recommendLabel')" class="inline">
        <el-switch
          v-model="dataForm.isRecommend"
          :disabled="isDisabled"
          :active-value="true"
          :inactive-value="false"
          :active-text="$t('common.yes')"
          :inactive-text="$t('common.no')"
        ></el-switch>
      </el-form-item>
      <el-form-item :label="$t('merchant.selfOperatedLabel')" class="inline">
        <el-switch
          v-model="dataForm.isSelf"
          :disabled="isDisabled"
          :active-value="true"
          :inactive-value="false"
          :active-text="$t('common.yes')"
          :inactive-text="$t('common.no')"
        ></el-switch>
      </el-form-item>
      <el-form-item :label="$t('merchant.productAuditLabel')" class="inline">
        <el-switch
          v-model="dataForm.productSwitch"
          :disabled="isDisabled"
          :active-value="true"
          :inactive-value="false"
          :active-text="$t('common.open')"
          :inactive-text="$t('common.close')"
        ></el-switch>
      </el-form-item>
    </el-form>
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
import * as merchant from '@/api/merchant';
import { mapGetters } from 'vuex';
import Keyword from '../../../components/base/keyword';
import { validatePhone } from '@/utils/toolsValidate';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';


import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'creatClassify',
  components: { Keyword },
  computed: {
    ...mapGetters(['merchantClassify', 'merchantType']),
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    currentLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
    displayMerchantName() {
      if (this.currentLocale !== this.defaultLangCode) {
        const typed = (this.nameJsonForm[this.currentLocale] || '').trim();
        if (typed) return typed;
      }
      return this.dataForm.name || this.$t('merchant.newMerchant');
    },
  },
  props: {
    merId: {
      type: Number,
      default: 0,
    },
    //true是详情，false是编辑
    isDisabled: {
      type: Boolean,
      default: false,
    },
    //操作类型，编辑、详情
    handleType: {
      type: String,
      default: '',
    },
    indexKey: {
      type: Number,
      default: 0,
    },
  },
  data() {
    const validateVal = (rule, value, callback) => {
      if (this.labelarr.length === 0) {
        callback(new Error(this.$t('merchant.pleaseEnterThenPressEnter')));
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      loading: false,
      loadingFrom: false,
      rules: {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('merchant.pleaseEnterMerchantName')));
          },
          trigger: 'blur',
        }],
        categoryId: [{ required: true, message: this.$t('merchant.pleaseSelectMerchantCategory'), trigger: 'change' }],
        typeId: [{ required: true, message: this.$t('merchant.pleaseSelectStoreType'), trigger: 'change' }],
        realName: [{ required: true, message: this.$t('merchant.pleaseEnterMerchantRealName'), trigger: 'blur' }],
        labelarr: [{ required: true, validator: validateVal, trigger: 'blur' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        handlingFee: [{ required: true, message: this.$t('merchant.pleaseEnterHandlingFee'), trigger: 'blur' }],
        sliderImages: [{ required: true, message: this.$t('merchant.pleaseUploadQualification'), type: 'array', trigger: 'change' }],
      },
      dataForm: {
        categoryId: null,
        handlingFee: 0,
        isRecommend: false,
        isSelf: false,
        isSwitch: false,
        keywords: '',
        name: '',
        phone: '',
        productSwitch: false,
        qualificationPicture: '',
        realName: '',
        remark: '',
        sort: 0,
        typeId: null,
        sliderImages: [],
        id: 0,
        nameJson: '',
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      labelarr: [],
      merImg: require('@/assets/imgs/dianpu.png'),
    };
  },
  watch: {
    merId: {
      handler: function (val) {
        if (val > 0) this.onInfo();
      },
      deep: true,
    },
  },
  mounted() {
    this.getLanguageList();
    if (!this.merchantClassify.length) this.$store.dispatch('merchant/getMerchantClassify');
    if (!this.merchantType.length) this.$store.dispatch('merchant/getMerchantType');
    if (this.merId > 0) this.onInfo();
  },
  methods: {
    emptyNameJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
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
          this.nameJsonForm = this.parseNameJson(this.dataForm && this.dataForm.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.dataForm && this.dataForm.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    parseNameJson(nameJson) {
      const form = this.emptyNameJsonForm();
      if (!nameJson) return form;
      try {
        const obj = typeof nameJson === 'string' ? JSON.parse(nameJson) : nameJson;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    buildNameJson() {
      return buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, pickFormName(this));
    },
    //详情中点击编辑按钮
    handleChangeEdit() {
      this.$emit('onChangeEdit');
      this.loading = false;
    },
    getLabelarr(attr) {
      this.labelarr = attr;
    },
    onChange(id) {
      this.dataForm.handlingFee = this.merchantClassify.find((item) => item.id === id).handlingFee;
    },
    // 详情
    onInfo() {
      if (!this.merchantClassify.length) this.$store.dispatch('merchant/getMerchantClassify');
      if (!this.merchantType.length) this.$store.dispatch('merchant/getMerchantType');
      this.loadingFrom = true;
      merchant.merchantDetailApi(this.merId).then((res) => {
        this.$set(res, 'sliderImages', res.qualificationPicture ? JSON.parse(res.qualificationPicture) : []);
        this.dataForm = res;
        this.nameJsonForm = this.parseNameJson(res.nameJson);
        this.activeLang = resolveFormActiveLang(this);
        this.labelarr = res.keywords.split(',') || [];
        this.loadingFrom = false;
      });
    },
    // 点击商品图
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (img.length > 10) return this.$message.warning(this.$t('merchant.maxTenImages'));
          if (img.length + _this.dataForm.sliderImages.length > 10) return this.$message.warning(this.$t('merchant.maxTenImages'));
          img.map((item) => {
            _this.dataForm.sliderImages.push(item.sattDir);
          });
        },
        multiple,
        'store',
      );
    },
    handleRemove(i) {
      this.dataForm.sliderImages.splice(i, 1);
    },
    //取消
    handleClose() {
      if (this.merId > 0) {
        if (this.handleType === 'edit') {
          this.$emit('closeModel');
        } else {
          this.onInfo();
          this.handleChangeEdit();
        }
      } else {
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields();
        });
        this.$emit('closeModel');
      }
    },
    //编辑、添加回调
    onClose() {
      this.$refs['dataForm'].resetFields();
      this.$emit('getList');
      this.loading = false;
    },
    onsubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.dataForm.qualificationPicture = JSON.stringify(this.dataForm.sliderImages);
          this.dataForm.keywords = this.labelarr.join(',');
          this.dataForm.nameJson = this.buildNameJson();
          this.dataForm.id === 0
            ? merchant
                .merchantAddApi(this.dataForm)
                .then((res) => {
                  this.$message.success(this.$t('merchant.addMerchantSuccess'));
                  this.onClose();
                })
                .catch(() => {
                  this.loading = false;
                })
            : merchant
                .merchantUpdateApi(this.dataForm)
                .then((res) => {
                  this.$message.success(this.$t('product.operateSuccess'));
                  if (this.handleType === 'edit') {
                    this.onClose();
                  } else {
                    this.onInfo();
                    this.handleChangeEdit();
                  }
                })
                .catch(() => {
                  this.loading = false;
                });
        } else {
          return false;
        }
      });
    },
    // 移动
    handleDragStart(e, item) {
      this.dragging = item;
    },
    handleDragEnd(e, item) {
      this.dragging = null;
    },
    handleDragOver(e) {
      e.dataTransfer.dropEffect = 'move';
    },
    handleDragEnter(e, item) {
      e.dataTransfer.effectAllowed = 'move';
      if (item === this.dragging) {
        return;
      }
      const newItems = [...this.dataForm.sliderImages];
      const src = newItems.indexOf(this.dragging);
      const dst = newItems.indexOf(item);
      newItems.splice(dst, 0, ...newItems.splice(src, 1));
      this.dataForm.sliderImages = newItems;
    },
  },
};
</script>

<style scoped lang="scss">
.lang-name-switch {
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.lang-name-input {
  margin-top: 10px;
}
.isSelf {
  padding: 2px 4px;
  height: 16px;
  border-radius: 2px 2px 2px 2px;
  font-size: 13px;
  color: #ffffff;
  text-align: center;
  line-height: 1;
}
::v-deep .el-form {
  padding-left: 30px;
}
.right-align {
  text-align: right;
  box-sizing: border-box;
}
.prompt {
  width: 100%;
  padding: 20px 25px;
}
.el-alert {
  width: 100%;
  ::v-deep.el-form-item__content {
    width: 100%;
  }
}
.inline {
  ::v-deep.el-form-item__content,
  ::v-deep.el-input-number {
    width: 228px;
  }
  ::v-deep.el-select {
    width: 100%;
  }
}
</style>
