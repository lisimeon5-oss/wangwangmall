<template>
  <div>
    <el-form
      ref="formDynamic"
      size="small"
      :model="formDynamic"
      v-loading="loading"
      :rules="nameRules"
      class="attrFrom mb20"
      label-width="90px"
      @submit.native.prevent
    >
      <el-form-item :label="$t('product.specName')" prop="ruleName">
        <div class="lang-name-switch">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            maxlength="32"
            class="selWidth lang-name-input"
            v-model.trim="formDynamic.ruleName"
            :placeholder="$t('product.specNamePlaceholder')"
          />
          <el-input
            v-else
            maxlength="32"
            class="selWidth lang-name-input"
            v-model.trim="nameJsonForm[activeLang]"
            :placeholder="$t('product.inputNameInLang', { lang: activeLangLabel })"
          />
        </div>
      </el-form-item>
      <div v-for="(item, index) in formDynamic.ruleValue || []" :key="index" class="noForm acea-row">
        <el-form-item>
          <div class="acea-row row-middle">
            <el-input
              v-if="isDefaultLang"
              v-model.trim="item.value"
              size="small"
              class="spec-name-edit mr5"
              maxlength="32"
              :placeholder="$t('product.pleaseEnterSpecification')"
            />
            <el-input
              v-else
              size="small"
              class="spec-name-edit mr5"
              maxlength="32"
              :value="specLabel(item)"
              :placeholder="$t('product.inputSpecInLang', { lang: activeLangLabel })"
              @input="setSpecName(item, $event)"
            />
            <i class="el-icon-circle-close pointer" @click="handleRemove(index)" />
          </div>
          <div class="rulesBox mt14">
            <el-tag
              v-for="(j, indexn) in item.detail"
              :key="indexn"
              closable
              size="medium"
              :disable-transitions="false"
              class="mb5 mr10 spec-val-tag"
              @close="handleClose(item, indexn)"
            >
              <el-input
                v-if="isDefaultLang"
                size="mini"
                class="spec-val-edit"
                maxlength="32"
                :value="item.detail[indexn]"
                :placeholder="$t('product.pleaseEnterSpecValue')"
                @input="setDefaultDetail(item, indexn, $event)"
              />
              <el-input
                v-else
                size="mini"
                class="spec-val-edit"
                maxlength="32"
                :value="specDetailLabel(item, indexn)"
                :placeholder="$t('product.inputSpecValueInLang', { lang: activeLangLabel })"
                @input="setSpecDetail(item, indexn, $event)"
              />
            </el-tag>
            <el-input
              v-if="item.inputVisible"
              ref="saveTagInput"
              v-model.trim="item.attrsVal"
              class="input-new-tag"
              size="small"
              @keyup.enter.native="$event.target.blur"
              @blur="createAttr(item.attrsVal, index)"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput(item)">{{ translateText("+ 添加") }}</el-button>
          </div>
        </el-form-item>
      </div>
      <div v-if="isBtn" class="acea-row attr-add-row">
        <el-form-item :label="$t('product.specLabel')" label-width="72px">
          <el-input
            v-model.trim="attrsName"
            class="selWidth"
            :placeholder="isDefaultLang ? $t('product.pleaseEnterSpecification') : $t('product.inputSpecInLang', { lang: activeLangLabel })"
          />
        </el-form-item>
        <el-form-item :label="$t('product.specValueLabel')" label-width="80px">
          <el-input
            v-model.trim="attrsVal"
            class="selWidth"
            :placeholder="isDefaultLang ? $t('product.pleaseEnterSpecValue') : $t('product.inputSpecValueInLang', { lang: activeLangLabel })"
          />
        </el-form-item>
        <el-button type="primary" class="ml30" @click="createAttrName">{{ translateText("确定") }}</el-button>
        <el-button @click="offAttrName">{{ translateText("取消") }}</el-button>
      </div>
      <Spin v-if="spinShow" size="large" fix />
      <el-form-item v-if="!isBtn">
        <el-button type="primary" icon="md-add" @click="addBtn">{{ translateText("添加新规格") }}</el-button>
      </el-form-item>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ translateText("取 消") }}</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">{{ translateText("确 定") }}</el-button>
      </div>
    </el-form>
    <div class="row-right acea-row">
      <el-button @click="resetForm('formDynamic')">{{ translateText("取消") }}</el-button>
      <el-button type="primary" :loading="loadingBtn" @click="handleSubmit('formDynamic')">{{ translateText("确 定") }}</el-button>
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

import { attrCreatApi, attrEditApi } from '@/api/product';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
  parseLangJsonMap,
} from '@/utils/localizedName';
export default {
  name: 'attrFrom',
  props: {
    currentRow: {
      type: Object,
      default: null,
    },
    keyNum: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loadingBtn: false,
      loading: false,
      dialogVisible: false,
      inputVisible: false,
      inputValue: '',
      spinShow: false,
      grid: {
        xl: 3,
        lg: 3,
        md: 12,
        sm: 24,
        xs: 24,
      },
      modal: false,
      index: 1,
      formDynamic: {
        ruleName: '',
        ruleValue: [],
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: {},
      attrsName: '',
      attrsVal: '',
      isBtn: false,
      results: [],
      result: [],
      ids: 0,
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    nameRules() {
      this.$i18n.locale;
      return {
        ruleName: [
          {
            validator: (rule, value, callback) => {
              if (hasI18nNameContent(this.formDynamic.ruleName, this.nameJsonForm)) {
                callback();
              } else {
                callback(new Error(this.$t('product.specNamePlaceholder')));
              }
            },
            trigger: ['blur', 'change'],
          },
        ],
      };
    },
    isDefaultLang() {
      return this.activeLang === this.defaultLangCode;
    },
  },
  watch: {
    currentRow: {
      handler: function (val) {
        this.applyCurrentRow(val);
      },
      immediate: true,
    },
  },
  created() {
    this.getLanguageList();
  },
  mounted() {
    (this.formDynamic.ruleValue || []).forEach((item) => {
      this.$set(item, 'inputVisible', false);
    });
  },
  methods: {
    applyCurrentRow(val) {
      const row = val ? { ...val } : { ruleName: '', ruleValue: [] };
      if (!Array.isArray(row.ruleValue)) {
        try {
          row.ruleValue = row.ruleValue ? JSON.parse(row.ruleValue) : [];
        } catch (e) {
          row.ruleValue = [];
        }
      }
      this.formDynamic = {
        id: row.id || 0,
        ruleName: row.ruleName || '',
        ruleNameJson: row.ruleNameJson,
        ruleValue: this.normalizeRuleItems(row.ruleValue),
      };
      (this.formDynamic.ruleValue || []).forEach((item) => {
        this.$set(item, 'inputVisible', false);
        this.$set(item, 'attrsVal', '');
      });
      this.nameJsonForm = this.parseLangForm(row.ruleNameJson);
      this.activeLang = resolveFormActiveLang(this);
    },
    emptyLangForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseLangForm(json) {
      const form = this.emptyLangForm();
      const obj = parseLangJsonMap(json);
      Object.keys(form).forEach((key) => {
        form[key] = obj[key] || '';
      });
      return form;
    },
    normalizeRuleItems(list) {
      return (list || []).map((item) => {
        const detail = Array.isArray(item.detail) ? item.detail.map((d) => (d == null ? '' : String(d))) : [];
        let detailJson = Array.isArray(item.detailJson)
          ? item.detailJson.map((d) => (d && typeof d === 'object' ? { ...d } : parseLangJsonMap(d)))
          : [];
        while (detailJson.length < detail.length) detailJson.push({});
        return {
          value: item.value || '',
          valueJson: item.valueJson && typeof item.valueJson === 'object' && !Array.isArray(item.valueJson)
            ? { ...item.valueJson }
            : parseLangJsonMap(item.valueJson),
          detail,
          detailJson,
        };
      });
    },
    specLabel(item) {
      if (this.isDefaultLang) return item.value || '';
      return (item.valueJson && item.valueJson[this.activeLang]) || '';
    },
    specDetailLabel(item, idx) {
      if (this.isDefaultLang) return (item.detail && item.detail[idx]) || '';
      const map = item.detailJson && item.detailJson[idx];
      return (map && map[this.activeLang]) || '';
    },
    ensureSpecI18n(spec) {
      if (!spec.valueJson || typeof spec.valueJson !== 'object') this.$set(spec, 'valueJson', {});
      if (!Array.isArray(spec.detailJson)) this.$set(spec, 'detailJson', []);
      while (spec.detailJson.length < (spec.detail || []).length) spec.detailJson.push({});
    },
    setSpecName(spec, val) {
      this.ensureSpecI18n(spec);
      this.$set(spec.valueJson, this.activeLang, val);
    },
    setDefaultDetail(spec, idx, val) {
      this.$set(spec.detail, idx, val);
    },
    setSpecDetail(spec, idx, val) {
      this.ensureSpecI18n(spec);
      if (!spec.detailJson[idx] || typeof spec.detailJson[idx] !== 'object') {
        this.$set(spec.detailJson, idx, {});
      }
      this.$set(spec.detailJson[idx], this.activeLang, val);
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
          this.nameJsonForm = this.parseLangForm(this.formDynamic && this.formDynamic.ruleNameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseLangForm(this.formDynamic && this.formDynamic.ruleNameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    resetForm(formName) {
      this.$emit('close');
      this.clear();
      if (this.$refs[formName]) this.$refs[formName].resetFields();
    },
    // 添加按钮
    addBtn() {
      this.isBtn = true;
    },
    handleClose(spec, index) {
      spec.detail.splice(index, 1);
      if (spec.detailJson) spec.detailJson.splice(index, 1);
    },
    // 取消
    offAttrName() {
      this.isBtn = false;
    },
    // 删除
    handleRemove(index) {
      this.formDynamic.ruleValue.splice(index, 1);
    },
    // 添加规则名称
    createAttrName() {
      if (this.attrsName && this.attrsVal) {
        const data = this.isDefaultLang
          ? {
              value: this.attrsName,
              valueJson: {},
              detail: [this.attrsVal],
              detailJson: [{}],
            }
          : {
              value: '',
              valueJson: { [this.activeLang]: this.attrsName },
              detail: [''],
              detailJson: [{ [this.activeLang]: this.attrsVal }],
            };
        const exists = this.formDynamic.ruleValue.some((item) => {
          if (this.isDefaultLang) return item.value === data.value;
          return item.valueJson && item.valueJson[this.activeLang] === this.attrsName;
        });
        if (!exists) this.formDynamic.ruleValue.push(data);
        this.attrsName = '';
        this.attrsVal = '';
        this.isBtn = false;
      } else {
        this.$message.warning(this.translateText('请添加规格名称'));
      }
    },
    createAttr(num, idx) {
      const val = String(num || '').trim();
      const spec = this.formDynamic.ruleValue[idx];
      if (!spec) return;
      this.ensureSpecI18n(spec);
      if (val) {
        if (this.isDefaultLang) {
          if (!spec.detail.includes(val)) {
            spec.detail.push(val);
            spec.detailJson.push({});
          }
        } else {
          const exists = spec.detailJson.some((m) => m && m[this.activeLang] === val);
          if (!exists) {
            spec.detail.push('');
            spec.detailJson.push({ [this.activeLang]: val });
          }
        }
        spec.inputVisible = false;
        spec.attrsVal = '';
      } else {
        this.$message.warning(this.translateText('请添加属性'));
      }
    },
    showInput(item) {
      this.$set(item, 'inputVisible', true);
      this.$set(item, 'attrsVal', '');
    },
    // 提交
    handleSubmit(name) {
      const data = {
        id: (this.currentRow && this.currentRow.id) || this.formDynamic.id || 0,
        ruleName: this.formDynamic.ruleName || '',
        ruleNameJson: buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, this.formDynamic.ruleName),
        ruleValue: JSON.stringify(this.normalizeRuleItems(this.formDynamic.ruleValue)),
      };
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.formDynamic.ruleValue.length === 0) {
            return this.$message.warning(this.translateText('请至少添加一条属性规格！'));
          }
          this.loadingBtn = true;
          this.loading = true;
          setTimeout(() => {
            data.id
              ? attrEditApi(data)
                  .then((res) => {
                    this.$message.success(this.translateText('提交成功'));
                    this.$emit('getList');
                    this.$emit('close');
                    this.clear();
                    this.loading = false;
                    this.loadingBtn = false;
                  })
                  .catch(() => {
                    this.loading = false;
                    this.loadingBtn = false;
                  })
              : attrCreatApi(data)
                  .then((res) => {
                    this.$message.success(this.translateText('提交成功'));
                    this.$emit('getList');
                    this.$emit('close');
                    this.clear();
                    this.loading = false;
                    this.loadingBtn = false;
                  })
                  .catch(() => {
                    this.loading = false;
                    this.loadingBtn = false;
                  });
          }, 1200);
        } else {
          this.loading = false;
          this.loadingBtn = false;
          return false;
        }
      });
    },
    clear() {
      if (this.$refs.formDynamic) {
        this.$refs.formDynamic.resetFields();
      }
      this.formDynamic.ruleValue = [];
      this.formDynamic.ruleName = '';
      this.formDynamic.id = 0;
      this.nameJsonForm = this.emptyLangForm();
      this.isBtn = false;
      this.attrsName = '';
      this.attrsVal = '';
    },
    handleInputConfirm() {
      const inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
  },
};
</script>

<style scoped lang="scss">
[role='dialog'] .el-message-box__content .el-form > div:last-of-type {
  text-align: left;
}
[role='dialog'] .el-message-box__content .el-form > div:last-of-type {
  margin: 0;
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
.spec-name-edit {
  width: 180px;
}
.spec-val-tag {
  height: auto;
  padding: 0 4px 0 0;
}
.spec-val-edit {
  width: 110px;
  margin-right: 4px;
  vertical-align: middle;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.footer {
  justify-content: flex-end;
}
</style>
