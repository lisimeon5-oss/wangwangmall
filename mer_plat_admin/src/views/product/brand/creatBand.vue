<template>
  <el-dialog
    v-if="dialogVisible"
    :title="$t('product.brand')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :closeOnClickModal="false"
    width="600px"
  >
    <el-form
      ref="dataForm"
      :model="dataForm"
      label-width="90px"
      v-if="dialogVisible"
      :rules="rules"
      v-loading="loadingFrom"
    >
      <el-form-item :label="$t('product.brandNameLabel')" prop="name">
        <div class="lang-name-switch">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="dataForm.name"
            maxlength="100"
            :placeholder="$t('product.pleaseEnterBrandName')"
            class="lang-name-input"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            maxlength="100"
            :placeholder="$t('product.inputNameInLang', { lang: activeLangLabel })"
            class="lang-name-input"
          />
        </div>
      </el-form-item>
      <el-form-item :label="$t('product.productCategoryLabel')" prop="categoryIdData">
        <el-cascader
          :key="classifyLocale"
          ref="cascader"
          v-model="dataForm.categoryIdData"
          :options="merPlatProductClassify"
          :props="categoryProps"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="$t('product.brandIconLabel')">
        <div class="upLoadPicBox" @click="modalPicTap(false)">
          <div v-if="dataForm.icon" class="pictrue">
            <img :src="dataForm.icon" />
          </div>
          <div v-else class="upLoad">
            <i class="el-icon-camera cameraIconfont" />
          </div>
          <div class="from-tips">{{ $t('product.suggestedSize') }}</div>
        </div>
      </el-form-item>
      <el-form-item :label="$t('product.sortLabel')" prop="sort">
        <el-input-number
          v-model.trim="dataForm.sort"
          :min="$constants.NUM_Range.min"
          :max="$constants.NUM_Range.max"
        ></el-input-number>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="handleClose('dataForm')">{{ $t('product.cancel') }}</el-button>
      <el-button
        type="primary"
        v-hasPermi="['platform:product:brand:add', 'platform:product:brand:update']"
        :loading="loading"
        @click="onsubmit('dataForm')"
        >{{ $t('product.save') }}</el-button
      >
    </span>
  </el-dialog>
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
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { mapGetters } from 'vuex';

import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'creatClassify',
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
    rules() {
      return {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('product.pleaseEnterBrandName')));
          },
          trigger: 'blur',
        }],
        categoryIdData: [{ required: true, message: this.$t('product.pleaseSelectCategory'), trigger: 'change' }],
      };
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    classifyLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
  },
  data() {
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
      dialogVisible: false,
      treeList: [],
      loading: false,
      loadingFrom: false,
      dataForm: { ...this.editData },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
    };
  },
  watch: {
    editData: {
      handler: function (val) {
        if (val.categoryIds) val.categoryIdData = val.categoryIds.split(',');
        val.sort = val.sort ? val.sort : 0;
        val.icon = val.icon ? val.icon : '';
        this.dataForm = { ...val };
        this.nameJsonForm = this.parseNameJson(val && val.nameJson);
        this.activeLang = resolveFormActiveLang(this);
      },
      deep: true,
    },
  },
  created() {
    this.getLanguageList();
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
          this.nameJsonForm = this.parseNameJson(this.editData && this.editData.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.editData && this.editData.nameJson);
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
      this.$nextTick(() => {
        this.dialogVisible = false;
      });
    },
    onClose() {
      this.$refs['dataForm'].resetFields();
      this.$nextTick(() => {
        this.dialogVisible = false;
      });
      this.loading = false;
      this.$emit('getList');
      localStorage.removeItem('productBrand');
    },
    onsubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.dataForm.categoryIds = this.dataForm.categoryIdData.toString();
          this.dataForm.nameJson = this.buildNameJson();
          !this.dataForm.id
            ? storeApi
                .brandAddApi(this.dataForm)
                .then((res) => {
                  this.$message.success(this.$t('product.operateSuccess'));
                  this.onClose();
                })
                .catch(() => {
                  this.loading = false;
                })
            : storeApi
                .brandUpdateApi(this.dataForm)
                .then((res) => {
                  this.$message.success(this.$t('product.operateSuccess'));
                  this.onClose();
                })
                .catch(() => {
                  this.loading = false;
                });
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
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
