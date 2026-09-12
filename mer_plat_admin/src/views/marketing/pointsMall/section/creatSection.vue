<template>
  <el-dialog
    v-if="dialogVisible"
    :title="dataForm.id ? $t('marketing.editPointsRange') : $t('marketing.addPointsRange')"
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
      <el-form-item :label="$t('marketing.intervalNameLabel')" prop="name">
        <div class="lang-name-switch">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="dataForm.name"
            maxlength="16"
            :placeholder="$t('marketing.pleaseEnterIntervalName')"
            class="lang-name-input"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            maxlength="16"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
            class="lang-name-input"
          />
        </div>
        <div class="from-tips">{{ $t('marketing.intervalNameTip') }}</div>
      </el-form-item>
      <div>
        <div class="app-container home flex">
          <el-form-item :label="$t('marketing.intervalRangeLabel')" prop="minNum">
            <el-input-number
              v-model.trim="dataForm.minNum"
              :min="0"
              :max="999998"
              :step="1"
              step-strictly
            ></el-input-number>
          </el-form-item>
          <div class="symbol">{{ $t('marketing.one') }}</div>
          <el-form-item prop="maxNum" label-width="0">
            <el-input-number
              v-model.trim="dataForm.maxNum"
              :min="1"
              :max="999999"
              :step="1"
              step-strictly
            ></el-input-number>
          </el-form-item>
        </div>
        <div class="from-tips symbol-tips">{{ $t('marketing.pointsRangeFilterTip') }}</div>
      </div>

      <el-form-item :label="$t('product.sortLabel')" prop="sort">
        <el-input-number v-model.trim="dataForm.sort" :min="0" :max="99" :step="1" step-strictly></el-input-number>
        <div class="from-tips">{{ $t('marketing.sortFrontTip99') }}</div>
      </el-form-item>
      <el-form-item :label="$t('marketing.intervalStatusLabel')">
        <el-switch
          v-model="dataForm.status"
          :active-text="$t('common.show')"
          :inactive-text="$t('menu.hide')"
          :active-value="true"
          :inactive-value="false"
        />
        <div class="from-tips">{{ $t('marketing.closeRangeTip') }}</div>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="handleClose('dataForm')">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button
        type="primary"
        v-hasPermi="['platform:integral:interval:save', 'platform:integral:interval:update']"
        :loading="loading"
        @click="onsubmit('dataForm')"
        >{{ $t('common.save') }}</el-button
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
import { intervalSaveApi, intervalUpdateApi } from '@/api/pointsMall';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
  pickFormName,
} from '@/utils/localizedName';
const defaultObj = {
  id: 0,
  name: '',
  nameJson: '',
  sort: 0,
  status: true,
  value: '',
};
export default {
  name: 'creatSection',
  props: {
    editData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      loadingFrom: false,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      dataForm: { ...this.editData },
      minNum: 0, //最小值
      maxNum: 999999, //最大值
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    rules() {
      return {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('marketing.pleaseEnterIntervalName')));
          },
          trigger: 'blur',
        }],
        minNum: [
          { required: true, message: this.$t('marketing.requiredPleaseMaintain'), trigger: 'blur' },
          { validator: this.validateCom, trigger: 'blur' },
          { validator: this.validateMin, trigger: 'blur' },
        ],
        maxNum: [
          { required: true, message: this.$t('marketing.requiredPleaseMaintain'), trigger: 'blur' },
          { validator: this.validateCom, trigger: 'blur' },
          { validator: this.validateMax, trigger: 'blur' },
        ],
      };
    },
  },
  mounted() {
    this.getLanguageList();
  },
  watch: {
    editData: {
      handler: function (val) {
        this.dataForm = {
          ...val,
          name: val.name || '',
          nameJson: val.nameJson || '',
          sort: val.sort ? val.sort : 0,
          minNum: val.value ? val.value.split('-')[0] : '',
          maxNum: val.value ? val.value.split('-')[1] : '',
        };
        this.nameJsonForm = this.parseNameJson(val && val.nameJson);
        this.activeLang = resolveFormActiveLang(this);
      },
      deep: true,
    },
  },
  methods: {
    // 基础判断：1、输入值符合 0<num<100,且为正整数的规则
    validateCom(rule, value, callback) {
      const num = Number(value);
      if (Number.isInteger(num)) {
        if (num < this.minNum) {
          return callback(new Error(this.$t('marketing.valueGreaterThan0')));
        } else if (num > this.maxNum) {
          return callback(new Error(this.$t('marketing.valueLessThan999999')));
        }
        return callback();
      }
      return callback(new Error(this.$t('marketing.valuePositiveInteger')));
    },
    // 最小值判断：不得大于最大值
    validateMin(rule, value, callback) {
      const num = Number(value);
      const max = Number(this.dataForm.maxNum);
      if (!max || num < max) {
        return callback();
      }
      return callback(new Error(this.$t('marketing.valueNotGreaterMax')));
    },
    // 最小值判断：不得小于最小值
    validateMax(rule, value, callback) {
      const num = Number(value);
      const min = Number(this.dataForm.minNum);
      if (!min || num > min) {
        return callback();
      }
      return callback(new Error(this.$t('marketing.valueNotLessMin')));
    },
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
    },
    onsubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.dataForm.value = `${this.dataForm.minNum}-${this.dataForm.maxNum}`;
          this.dataForm.nameJson = this.buildNameJson();
          !this.dataForm.id
            ? intervalSaveApi(this.dataForm)
                .then((res) => {
                  this.$message.success(this.$t('product.operateSuccess'));
                  this.onClose();
                })
                .catch(() => {
                  this.loading = false;
                })
            : intervalUpdateApi(this.dataForm)
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
.symbol-tips {
  margin-left: 90px;
  margin-top: -6px;
  margin-bottom: 21px;
}
.symbol {
  width: 100px;
  line-height: 31px;
  text-align: center;
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
