<template>
  <div>
    <el-form
      ref="dataForm"
      class="tagForm"
      :model="dataForm"
      label-width="120px"
      :rules="rules"
      v-loading="loadingFrom"
    >
      <el-form-item :label="$t('product.tagName')" prop="tagName">
        <div class="lang-name-switch">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="dataForm.tagName"
            type="text"
            :placeholder="$t('product.pleaseEnterTagName')"
            maxLength="5"
            :disabled="dataForm.owner === 0"
            class="lang-name-input"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            type="text"
            :placeholder="$t('product.inputNameInLang', { lang: activeLangLabel })"
            maxLength="20"
            class="lang-name-input"
          />
        </div>
      </el-form-item>
      <el-form-item :label="$t('product.tagNote')" prop="tagNote">
        <el-input
          v-model.trim="dataForm.tagNote"
          type="textarea"
          :placeholder="$t('product.pleaseEnterTagNote')"
          :disabled="dataForm.owner === 0"
        />
      </el-form-item>
      <el-form-item :label="$t('product.sort')" prop="sort">
        <el-input-number v-model.trim="dataForm.sort" :min="1" :max="99999" :step="1"></el-input-number>
      </el-form-item>
      <el-form-item :label="$t('product.effectiveTime')" prop="timerange">
        <el-date-picker
          v-model="dataForm.timerange"
          size="small"
          class="selWidth"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          :start-placeholder="$t('product.startDate')"
          :end-placeholder="$t('product.endDate')"
          align="right"
          @change="onchangeTime"
          :picker-options="pickerOptionsForEditCoupon"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-switch
          v-model="dataForm.status"
          :active-value="1"
          :inactive-value="0"
          :active-text="$t('product.show')"
          :inactive-text="$t('product.hide')"
          @change="handleStatusChange"
        >
        </el-switch>
      </el-form-item>
      <el-form-item :label="$t('product.mallPosition')" prop="position">
        <el-radio v-model="dataForm.position" :label="0">{{ $t('product.belowTitle') }}</el-radio>
        <el-radio v-model="dataForm.position" :label="1">{{ $t('product.beforeTitle') }}</el-radio>
        <div class="from-tips">{{ $t('product.positionTip') }}</div>
      </el-form-item>
      <!--      系统标签规则-->
      <div v-if="dataForm.owner === 0">
        <el-form-item :label="$t('product.displayRule')" prop="playProducts">
          <div v-if="dataForm.tagName === '新品'">
            {{ $t('product.afterProductCreated') }}
            <el-input-number :min="1" :max="30" :step="1" v-model.trim="dataForm.playProducts"></el-input-number>
            {{ $t('product.daysShowTag') }}
          </div>
          <div v-if="dataForm.tagName === '爆品'">
            {{ $t('product.recent30DaysSalesGreater') }}
            <el-input-number :min="1" :max="9999" :step="1" v-model.trim="dataForm.playProducts"></el-input-number>
            {{ $t('product.itemsShowTag') }}
          </div>
          <div v-if="dataForm.tagName === '自营'">{{ $t('product.selfOperatedTagTip') }}</div>
          <div v-if="dataForm.tagName === '热卖'">
            {{ $t('product.recent30DaysCommentsGreater') }}
            <el-input-number :min="1" :max="9999" :step="1" v-model.trim="dataForm.playProducts"></el-input-number>
            {{ $t('product.commentsShowTag') }}
          </div>
          <div v-if="dataForm.tagName === '优选'">
            {{ $t('product.recent30DaysFiveStarGreater') }}
            <el-input-number :min="1" :max="9999" :step="1" v-model.trim="dataForm.playProducts"></el-input-number>
            {{ $t('product.commentsShowTag') }}
          </div>
          <div v-if="dataForm.tagName === '包邮'">{{ $t('product.freeShippingTip') }}</div>
        </el-form-item>
      </div>
      <!--      自建标签规则可只用的条件-->
      <div v-if="dataForm.owner > 0 || !editData.id">
        <div>
          <!--商品参与类型 0=指定商品，1=指定品牌，2=指定商户，3=指定商品分类-->
          <el-form-item :label="$t('product.playType')" prop="playType">
            <el-radio-group v-model="dataForm.playType" @input="handlePlayTypeChange">
              <el-radio label="product">{{ $t('product.specifiedProductParticipation') }}</el-radio>
              <el-radio label="brand">{{ $t('product.specifiedBrandParticipation') }}</el-radio>
              <el-radio label="category">{{ $t('product.specifiedCategoryParticipation') }}</el-radio>
              <el-radio label="merchant">{{ $t('product.specifiedMerchantParticipation') }}</el-radio>
            </el-radio-group>
            <!-- 选择商品加载方式-->
            <product-association-form
              class="mt14"
              :productAssociationType="dataForm.playType"
              :formValidate="dataForm"
              :multipleBrand="true"
              :multipleCategory="true"
              :isBatchDelete="false"
              @getProductAssociationData="getProductAssociationData"
            ></product-association-form>
          </el-form-item>
        </div>
      </div>
      <el-form-item>
        <el-button @click="handleClose('dataForm')">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button
          type="primary"
          v-hasPermi="['platform:product:tag:save', 'platform:product:tag:update']"
          :loading="loading"
          @click="onsubmit('dataForm')"
          >{{ $t('common.save') }}
        </el-button>
        <!--        </span>-->
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
import * as storeApi from '@/api/product';
import { mapGetters } from 'vuex';
import merchantName from '@/components/merUseCategory/index.vue';
import productAssociationForm from '@/components/productAssociationForm/index.vue';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';


import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'editProductCateTag',
  components: { productAssociationForm, merchantName },
  props: {
    editData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  computed: {
    ...mapGetters(['merPlatProductClassify']),
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
  },
  data() {
    // 自定义组件校验规则
    let validatePlayTypeAndPlayProducts = (rule, value, callback) => {
      if (value === '' || this.dataForm.playProducts.length === 0) {
        callback(new Error(this.$t('product.pleaseSelectParticipationType')));
      } else {
        callback();
      }
    };
    return {
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'childList',
        expandTrigger: 'hover',
        checkStrictly: false,
        emitPath: false,
        multiple: true,
      },
      treeList: [],
      loading: false,
      loadingFrom: false,
      rules: {
        // 表单验证参数
        tagName: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('product.pleaseEnterTagName')));
          },
          trigger: 'blur',
        }],
        timerange: [{ required: true, message: this.$t('product.pleaseSelectEffectiveTime'), trigger: 'change' }],
        sort: [{ required: true, message: this.$t('user.pleaseEnterSort'), trigger: 'blur' }],
        playType: [
          {
            required: true,
            message: this.$t('product.pleaseSelectParticipationType'),
            trigger: 'blur',
            validator: validatePlayTypeAndPlayProducts,
          },
        ],
      },
      // 初始化表单数据
      dataForm: {
        tagName: '',
        tagNameJson: '',
        timerange: [],
        sort: 0,
        playType: 'product',
        playProducts: '',
        position: 0,
        proBrandList: [],
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      pickerOptionsForEditCoupon: {
        // 时间有效校验
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
      formValidate: {
        products: null,
        proBrandList: [],
        proCategorylist: [],
        merIds: [],
      },
      playValues: null, // 待添加的商品参与类型
    };
  },
  created() {
    this.getLanguageList();
    this.initEditData();
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
          this.nameJsonForm = this.parseNameJson(this.dataForm && this.dataForm.tagNameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.dataForm && this.dataForm.tagNameJson);
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
    initEditData() {
      if (this.editData.id) {
        this.dataForm = { ...this.editData, timerange: [] };
        this.nameJsonForm = this.parseNameJson(this.editData.tagNameJson);
        this.activeLang = resolveFormActiveLang(this);
        if (this.editData.startTime && this.editData.endTime) {
          this.dataForm.timerange = [new Date(this.editData.startTime), new Date(this.editData.endTime)];
        }
        // 初始化根据条件加载对应商品的条件
        this.getRecommendedInfo();
      }
    },
    // 点击商品图
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.dataForm.icon = img[0].sattDir;
        },
        multiple,
        'product',
      );
    },
    handleClose() {
      this.$refs['dataForm'].resetFields();
      this.$emit('onCloseHandle');
    },
    onClose() {
      this.$emit('onCloseHandle');
    },
    handleStatusChange(op) {},
    onchangeTime(e) {
      this.dataForm.startTime = e ? e[0] : '';
      this.dataForm.endTime = e ? e[1] : '';
    },
    onsubmit(formName) {
      // 组装当前根据类型参数的业务id
      if (!this.dataForm.owner || this.dataForm.owner > 0) {
        if (this.playValues) {
          // 如果编辑过数据那么再转换格式
          if (this.dataForm.playType === 'product') {
            this.dataForm.playProducts = this.playValues.map((item) => item.id).join(',');
          } else {
            this.dataForm.playProducts = this.playValues.join(',');
          }
        }
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.dataForm.tagNameJson = this.buildNameJson();
          if (this.dataForm.id) {
            storeApi
              .productTagUpdateApi(this.dataForm)
              .then(() => {
                this.$message.success(this.$t('product.operateSuccess'));
                this.onClose();
              })
              .catch((err) => {})
              .finally(() => {
                this.loading = false;
              });
          } else {
            storeApi
              .productTagAddApi(this.dataForm)
              .then(() => {
                this.$message.success(this.$t('product.operateSuccess'));
                this.onClose();
              })
              .catch((err) => {})
              .finally(() => {
                this.loading = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    //模板数据
    getRecommendedInfo() {
      switch (this.dataForm.playType) {
        case 'product':
          this.dataForm.data = this.dataForm.playProducts;
          break;
        case 'brand':
          this.dataForm.proBrandList = this.dataForm.playProducts.includes(',')
            ? this.dataForm.playProducts.split(',').map((item) => Number(item))
            : [Number(this.dataForm.playProducts)];
          break;
        case 'category':
          this.dataForm.proCategorylist = this.dataForm.playProducts.split(',').map((item) => Number(item));
          break;
        case 'merchant':
          if (this.dataForm.playProducts) {
            this.dataForm.merIds = this.dataForm.playProducts.split(',').map((item) => Number(item));
          }
          break;
      }
    },
    getProductAssociationData(res) {
      this.playValues = res;
      this.dataForm.playProducts = this.playValues.join(',');
      this.dataForm.proBrandList = JSON.parse(JSON.stringify(this.playValues));
    },
    handlePlayTypeChange() {
      this.playValues = '';
      this.dataForm.playProducts = '';
      this.dataForm.data = '';
      this.dataForm.proBrandList = [];
      this.dataForm.proCategorylist = [];
      this.dataForm.merIds = [];
    },
  },
};
</script>

<style scoped lang="scss">
.lang {
  width: 100%;

  ::v-deep.el-form-item__content {
    width: 79%;
  }
}

.tagForm {
  margin: 20px;
}
.lang-name-switch {
  width: 100%;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.lang-name-input {
  margin-top: 10px;
}
</style>
