<template>
  <div class="components-container">
    <el-form ref="editPram" :model="editPram" :rules="rules" label-width="100px" class="demo-ruleForm">
      <el-form-item>
        <el-radio-group v-model="activeLang" size="small">
          <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
            {{ lang.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('maintain.parentColon')">
        <el-cascader
          v-model="editPram.pid"
          :options="allTreeList"
          :props="categoryProps"
          disabled
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="$t('maintain.categoryNameColon')" prop="name">
        <el-input
          v-if="activeLang === defaultLangCode"
          v-model.trim="editPram.name"
          maxlength="50"
          :placeholder="$t('category.categoryNamePlaceholder')"
          clearable
        />
        <el-input
          v-else
          v-model.trim="nameJsonForm[activeLang]"
          maxlength="50"
          :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
          clearable
        />
      </el-form-item>
      <el-form-item :label="$t('maintain.sortColon')">
        <el-input-number v-model.trim="editPram.sort" :min="1" :max="10" />
      </el-form-item>
      <el-form-item :label="$t('user.statusLabel')">
        <el-switch
          v-model="editPram.status"
          :active-text="$t('common.show')"
          :inactive-text="$t('menu.hide')"
          :active-value="true"
          :inactive-value="false"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button size="mini" @click="close">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button size="mini" type="primary" @click="handlerSubmit('editPram')">{{ $t('el.messagebox.confirm') }}</el-button>
    </div>
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
import * as categoryApi from '@/api/categoryApi.js';
import { Debounce } from '@/utils/validate';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName, parseLangJsonMap } from '@/utils/localizedName';
export default {
  props: {
    prent: {
      type: Object,
      default: 0,
    },
    isCreate: {
      type: Number,
      default: 0,
    },
    editData: {
      type: Object,
    },
    allTreeList: {
      type: Array,
    },
  },
  data() {
    return {
      constants: this.$constants,
      editPram: {
        extra: null,
        name: '',
        nameJson: '',
        pid: null,
        sort: 0,
        status: true,
        type: this.$constants.categoryType[5].value,
        url: null,
        id: 0,
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      categoryProps: {
        value: 'id',
        label: 'label',
        children: 'child',
        expandTrigger: 'hover',
        checkStrictly: true,
        emitPath: false,
      },
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
            else callback(new Error(this.$t('category.pleaseEnterCategoryName')));
          },
          trigger: ['blur', 'change'],
        }],
      };
    },
  },
  mounted() {
    this.initEditData();
    this.getLanguageList();
  },
  methods: {
    close() {
      this.$emit('hideEditDialog');
    },
    emptyLangForm() {
      const form = {};
      (this.langOptions || []).forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseLangForm(json, url, name) {
      const form = this.emptyLangForm();
      const obj = parseLangJsonMap(json);
      Object.keys(form).forEach((key) => {
        form[key] = obj[key] || '';
      });
      const legacyEn = String(url || '').trim();
      if (
        !form.en &&
        legacyEn &&
        legacyEn !== name &&
        legacyEn !== 'url' &&
        !/^https?:\/\//i.test(legacyEn) &&
        !legacyEn.startsWith('/')
      ) {
        form.en = legacyEn;
      }
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
          this.nameJsonForm = this.parseLangForm(this.editPram.nameJson, this.editPram.url, this.editPram.name);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseLangForm(this.editPram.nameJson, this.editPram.url, this.editPram.name);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    initEditData() {
      if (this.isCreate !== 1) {
        const { id } = this.prent;
        this.editPram.pid = id;
        return;
      }
      const { extra, name, nameJson, pid, sort, status, type, url, id } = this.editData;
      this.editPram.name = name || '';
      this.editPram.nameJson = nameJson || '';
      this.editPram.pid = pid;
      this.editPram.sort = sort;
      this.editPram.status = status;
      this.editPram.type = type;
      this.editPram.url = url;
      this.editPram.id = id;
      this.editPram.extra = extra;
      this.nameJsonForm = this.parseLangForm(nameJson, url, name);
    },
    handlerSubmit: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        this.editPram.nameJson = buildI18nNameJson(
          this.langOptions,
          this.nameJsonForm,
          this.defaultLangCode,
          pickFormName(this),
        );
        this.handlerSaveOrUpdate(this.isCreate === 0);
      });
    }),
    handlerSaveOrUpdate(isSave) {
      if (isSave) {
        this.editPram.pid = this.prent.id;
        categoryApi.addCategroy(this.editPram).then(() => {
          this.$emit('hideEditDialog');
          this.$message.success(this.$t('maintain.createCategorySuccess'));
        });
      } else {
        this.editPram.pid = Array.isArray(this.editPram.pid) ? this.editPram.pid[0] : this.editPram.pid;
        categoryApi.updateCategroy(this.editPram).then(() => {
          this.$emit('hideEditDialog');
          this.$message.success(this.$t('maintain.updateCategorySuccess'));
        });
      }
    },
  },
};
</script>

<style></style>
