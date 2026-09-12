<template>
  <div class="components-container">
    <el-form ref="editPram" :model="editPram" :rules="rules" label-width="110px">
      <el-form-item>
        <el-radio-group v-model="activeLang" size="small">
          <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
            {{ lang.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('maintain.dataGroupNameLabel')" prop="name">
        <el-input
          v-if="activeLang === defaultLangCode"
          v-model.trim="editPram.name"
          maxlength="50"
          :placeholder="$t('maintain.dataGroupName')"
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
      <el-form-item :label="$t('maintain.dataIntroLabel')" prop="info">
        <el-input
          v-if="activeLang === defaultLangCode"
          v-model.trim="editPram.info"
          maxlength="256"
          :placeholder="$t('maintain.dataIntro')"
          clearable
        />
        <el-input
          v-else
          v-model.trim="infoJsonForm[activeLang]"
          maxlength="256"
          :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
          clearable
        />
      </el-form-item>
      <el-form-item
        :label="$t('maintain.formDataIdLabel')"
        prop="formId"
        :rules="[{ required: true, message: $t('maintain.pleaseSelectFormData'), trigger: ['change'] }]"
      >
        <span>{{ editPram.formId }}</span>
        <el-button type="primary" @click="selectFormDialogConfig.visible = true">{{ $t('maintain.selectTemplateData') }}</el-button>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button @click="close">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button type="primary" @click="handlerSubmit('editPram')">{{ $t('el.messagebox.confirm') }}</el-button>
    </div>
    <el-dialog style="width: 100%" :title="$t('maintain.selectFormTemplate')" :visible.sync="selectFormDialogConfig.visible" append-to-body>
      <form-config-list select-model @selectedRowData="handlerSelectedRowData" />
    </el-dialog>
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
import formConfigList from '@/views/maintain/formConfig';
import * as systemGroupApi from '@/api/systemGroup';
import { Debounce } from '@/utils/validate';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName, parseLangJsonMap } from '@/utils/localizedName';
export default {
  // name: "combinedDataEdit"
  components: { formConfigList },
  props: {
    isCreate: {
      type: Number,
      default: 0,
    },
    editData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      editPram: {
        formId: null,
        info: '',
        name: '',
        nameJson: '',
        infoJson: '',
        id: null,
      },
      selectedFormConfigData: {},
      selectFormDialogConfig: {
        visible: false,
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      infoJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
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
            else callback(new Error(this.$t('maintain.fillDataGroupName')));
          },
          trigger: ['blur', 'change'],
        }],
        info: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(this.editPram.info, this.infoJsonForm)) callback();
            else callback(new Error(this.$t('maintain.fillDataIntro')));
          },
          trigger: ['blur', 'change'],
        }],
        formId: [{ required: true, message: this.$t('maintain.pleaseSelectFormData'), trigger: ['change'] }],
      };
    },
  },
  mounted() {
    this.handlerInitEditData();
    this.getLanguageList();
  },
  methods: {
    close() {
      this.$emit('closeDialog', null);
    },
    emptyLangForm() {
      const form = {};
      (this.langOptions || []).forEach((lang) => {
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
          this.nameJsonForm = this.parseLangForm(this.editPram.nameJson);
          this.infoJsonForm = this.parseLangForm(this.editPram.infoJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseLangForm(this.editPram.nameJson);
          this.infoJsonForm = this.parseLangForm(this.editPram.infoJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    handlerInitEditData() {
      if (this.isCreate !== 1) return;
      const { id, name, info, formId, nameJson, infoJson } = this.editData;
      this.editPram.id = id;
      this.editPram.name = name || '';
      this.editPram.info = info || '';
      this.editPram.formId = formId;
      this.editPram.nameJson = nameJson || '';
      this.editPram.infoJson = infoJson || '';
      this.nameJsonForm = this.parseLangForm(nameJson);
      this.infoJsonForm = this.parseLangForm(infoJson);
    },
    handlerSelectedRowData(rowData) {
      this.selectedFormConfigData = rowData;
      this.editPram.formId = this.selectedFormConfigData.id;
      this.selectFormDialogConfig.visible = false;
    },
    handlerSubmit: Debounce(function (form) {
      this.$refs[form].validate((result) => {
        if (!result) return;
        const pram = {
          ...this.editPram,
          nameJson: buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, this.editPram.name),
          infoJson: buildI18nNameJson(this.langOptions, this.infoJsonForm, this.defaultLangCode, this.editPram.info),
        };
        this.isCreate === 0 ? this.handlerSave(pram) : this.handlerEdit(pram);
      });
    }),
    handlerSave(pram) {
      systemGroupApi.groupSave(pram).then((data) => {
        this.$message.success(this.$t('maintain.addGroupDataSuccess'));
        this.$emit('hideDialog');
      });
    },
    handlerEdit(pram) {
      systemGroupApi.groupEdit(pram).then((data) => {
        this.$message.success(this.$t('maintain.editGroupDataSuccess'));
        this.$emit('hideDialog');
      });
    },
  },
};
</script>

<style scoped>
::v-deep .el-dialog__wrapper {
  width: 100%;
}
.lang-name-switch {
  width: 100%;
}
</style>
