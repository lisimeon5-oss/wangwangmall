<template>
  <div class="divBox relative">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-button v-hasPermi="['platform:merchant:type:add']" type="primary" size="small" @click="handlerOpenEdit(0)"
        >{{ $t('merchant.addStoreType') }}</el-button
      >
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        size="small"
        height="500px"
        :highlight-current-row="true"
        class="mt20"
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('merchant.storeTypeName')" min-width="150">
          <template slot-scope="scope">{{ getLocalizedTypeName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('merchant.storeTypeRequirement')" min-width="200" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ getLocalizedTypeInfo(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('merchant.addTime')" min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <a @click="handlerOpenEdit(1, scope.row)" v-hasPermi="['platform:merchant:type:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handlerOpenDel(scope.row)" v-hasPermi="['platform:merchant:type:delete']">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="tableFrom.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <el-dialog
      :title="formData.id ? $t('merchant.editStoreType') : $t('merchant.addStoreType')"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="dataForm" :model="formData" :rules="rules" label-width="140px">
        <el-form-item :label="$t('merchant.storeTypeName')" prop="name">
          <div class="lang-name-switch">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model.trim="formData.name"
              maxlength="50"
              :placeholder="$t('merchant.pleaseEnterStoreTypeName')"
              class="lang-name-input"
            />
            <el-input
              v-else
              v-model.trim="nameJsonForm[activeLang]"
              maxlength="50"
              :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
              class="lang-name-input"
            />
          </div>
        </el-form-item>
        <el-form-item :label="$t('merchant.storeTypeRequirement')" prop="info">
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="formData.info"
            type="textarea"
            maxlength="500"
            :rows="4"
            :placeholder="$t('merchant.pleaseEnterStoreTypeRequirement')"
          />
          <el-input
            v-else
            v-model.trim="infoJsonForm[activeLang]"
            type="textarea"
            maxlength="500"
            :rows="4"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">{{ $t('common.save') }}</el-button>
      </span>
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
import * as merchant from '@/api/merchant';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { getLocalizedName, getLocalizedText, resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  data() {
    return {
      tableFrom: {},
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: false,
      dialogVisible: false,
      loading: false,
      formData: {
        id: 0,
        name: '',
        info: '',
        nameJson: '',
        infoJson: '',
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
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
    rules() {
      return {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('merchant.pleaseEnterStoreTypeName')));
          },
          trigger: 'blur',
        }],
        info: [{ required: true, message: this.$t('merchant.pleaseEnterStoreTypeRequirement'), trigger: 'blur' }],
      };
    },
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
  },
  mounted() {
    this.getLanguageList();
    if (checkPermi(['platform:merchant:type:all'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedTypeName(row) {
      return getLocalizedName(row, this.currentLocale);
    },
    getLocalizedTypeInfo(row) {
      return getLocalizedText(row ? row.info : '', row ? row.infoJson : '', this.currentLocale);
    },
    emptyLangForm() {
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
          this.nameJsonForm = this.parseJson(this.formData && this.formData.nameJson);
          this.infoJsonForm = this.parseJson(this.formData && this.formData.infoJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseJson(this.formData && this.formData.nameJson);
          this.infoJsonForm = this.parseJson(this.formData && this.formData.infoJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    parseJson(json) {
      const form = this.emptyLangForm();
      if (!json) return form;
      try {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    buildJson(form, defaultName) {
      return buildI18nNameJson(this.langOptions, form, this.defaultLangCode, defaultName);
    },
    getList() {
      this.listLoading = true;
      merchant
        .merchantTypeListApi()
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
          this.$message.error(res.message);
        });
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList();
    },
    handlerOpenEdit(isCreate, editDate) {
      if (isCreate === 0) {
        this.formData = { id: 0, name: '', info: '', nameJson: '', infoJson: '' };
        this.nameJsonForm = this.emptyLangForm();
        this.infoJsonForm = this.emptyLangForm();
      } else {
        this.formData = {
          id: editDate.id,
          name: editDate.name,
          info: editDate.info,
          nameJson: editDate.nameJson || '',
          infoJson: editDate.infoJson || '',
        };
        this.nameJsonForm = this.parseJson(editDate.nameJson);
        this.infoJsonForm = this.parseJson(editDate.infoJson);
      }
      this.activeLang = resolveFormActiveLang(this);
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate();
      });
    },
    resetForm() {
      this.formData = { id: 0, name: '', info: '', nameJson: '', infoJson: '' };
      this.nameJsonForm = this.emptyLangForm();
      this.infoJsonForm = this.emptyLangForm();
      this.activeLang = resolveFormActiveLang(this);
      this.loading = false;
    },
    submitForm() {
      this.$refs.dataForm.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        const data = {
          id: this.formData.id,
          name: this.formData.name,
          info: this.formData.info,
          nameJson: this.buildJson(this.nameJsonForm, this.formData.name),
          infoJson: this.buildJson(this.infoJsonForm, this.formData.info),
        };
        const req = !data.id ? merchant.merchantTypeAddApi(data) : merchant.merchantTypeUpdateApi(data);
        req
          .then(() => {
            this.$message.success(this.$t('product.operateSuccess'));
            this.dialogVisible = false;
            this.$store.commit('merchant/SET_MerchantType', []);
            this.getList();
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    handlerOpenDel(rowData) {
      this.$modalSure(this.$t('merchant.deleteStoreTypeConfirm')).then(() => {
        merchant.merchantTypeDeleteApi(rowData.id).then((data) => {
          this.$message.success(this.$t('merchant.deleteStoreTypeSuccess'));
          this.getList();
          this.$store.commit('merchant/SET_MerchantType', []);
        });
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
