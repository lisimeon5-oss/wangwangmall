<template>
  <div class="divBox relative">
    <!--搜索条件-->
    <el-card
      v-if="checkPermi(['merchant:cdkey:library:page:list'])"
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form inline size="small">
          <el-form-item :label="$t('product.cdkeyName')">
            <el-input
              v-model.trim="name"
              :placeholder="$t('product.cdkeyLibraryNamePlaceholder')"
              class="selWidth"
              size="small"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('product.productName')">
            <el-input
              v-model.trim="productName"
              :placeholder="$t('product.productNamePlaceholder')"
              class="selWidth"
              size="small"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('product.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('product.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!--列表-->
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-button
        size="small"
        type="primary"
        class="mb20"
        v-hasPermi="['merchant:cdkey:library:add']"
        @click="handleAdd()"
        >{{ $t('product.addCdkeyLibrary') }}</el-button
      >
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="small" highlight-current-row>
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('product.cdkeyLibraryName')" min-width="200" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ getLocalizedName(scope.row, uiLocale) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.relatedProduct')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.productName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.relatedProductSpec')" prop="productAttrValueName" min-width="200" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.productAttrValueName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.unusedTotal')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ Number(scope.row.totalNum) - Number(scope.row.usedNum) + ' / ' + scope.row.totalNum }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.remark')" min-width="250" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ getLocalizedText(scope.row.remark, scope.row.remarkJson, uiLocale) | filterEmpty }}</span>
          </template></el-table-column
        >
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="200" />
        <el-table-column :label="$t('product.operate')" width="180" fixed="right">
          <template slot-scope="scope">
            <a @click="handleAdd(scope.row)" v-hasPermi="['merchant:cdkey:library:update']">{{ $t('product.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <router-link :to="{ path: `/product/cdkey/creatCdkey/${scope.row.id}/${getLocalizedName(scope.row, uiLocale) || scope.row.name}` }">
              <a type="text" v-hasPermi="['merchant:card:secret:page:list']">{{ $t('product.manageCdkey') }}</a>
            </router-link>
            <template
              v-if="
                checkPermi(['merchant:cdkey:library:delete']) &&
                !scope.row.productAttrValueName &&
                !scope.row.productName
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDelete(scope.row.id)">{{ $t('product.delete') }}</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="$constants.page.limit"
          :page-size="tableFrom.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        /></div
    ></el-card>
    <el-dialog
      :visible.sync="dialogVisible"
      :title="formValidate.id === 0 ? $t('product.addCdkeyLibraryTitle') : $t('product.editCdkeyLibrary')"
      destroy-on-close
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="formValidate"
        class="formValidate"
        :rules="nameRules"
        :model="formValidate"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item :label="$t('common.language')">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('product.cdkeyLibraryNameLabel')" prop="name">
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="formValidate.name"
            :placeholder="$t('product.cdkeyLibraryNamePlaceholder32')"
            maxlength="32"
            size="small"
            clearable
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            :placeholder="$t('product.inputNameInLang', { lang: activeLangLabel })"
            maxlength="32"
            size="small"
            clearable
          />
        </el-form-item>
        <el-form-item :label="$t('product.remarkLabel')">
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="formValidate.remark"
            :placeholder="$t('product.remarkPlaceholder200')"
            maxlength="200"
            type="textarea"
            size="small"
            clearable
          />
          <el-input
            v-else
            v-model.trim="remarkJsonForm[activeLang]"
            :placeholder="$t('product.inputRemarkInLang', { lang: activeLangLabel })"
            maxlength="200"
            type="textarea"
            size="small"
            clearable
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('product.cancel') }}</el-button>
        <el-button
          type="primary"
          class="submission"
          @click="handleSubmit('formValidate')"
          :loading="loadingBtn"
          v-if="checkPermi(['merchant:product:update'])"
          >{{ $t('product.confirm') }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { checkPermi } from '@/utils/permission';
import {
  productCdkeyDeleteApi,
  productCdkeyListApi,
  productCdkeysaveApi,
  productUnrelatedUpdateApi,
} from '@/api/productCdkey';
import { Debounce } from '@/utils/validate';
import * as $constants from '@/utils/constants';
import { handleDeleteTable } from '@/libs/public';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
  parseLangJsonMap,
  getLocalizedName,
  getLocalizedText,
  getUiLocale,
} from '@/utils/localizedName';
const tableFroms = {
  page: 1,
  limit: $constants.page.limit[0],
  name: '',
  productName: '',
};
export default {
  name: 'cdkey',
  data() {
    return {
      productName: '',
      name: '',
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: Object.assign({}, tableFroms),
      dialogVisible: false,
      formValidate: {
        name: '',
        remark: '',
        id: 0,
      },
      loadingBtn: false,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: {},
      remarkJsonForm: {},
    };
  },
  computed: {
    uiLocale() {
      return (this.$i18n && this.$i18n.locale) || getUiLocale(this);
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    nameRules() {
      this.$i18n.locale;
      return {
        name: [
          {
            validator: (rule, value, callback) => {
              if (hasI18nNameContent(this.formValidate.name, this.nameJsonForm)) {
                callback();
              } else {
                callback(new Error(this.$t('product.cdkeyLibraryNameRequired')));
              }
            },
            trigger: ['blur', 'change'],
          },
        ],
      };
    },
  },
  created() {
    this.getLanguageList();
  },
  mounted() {
    if (checkPermi(['merchant:cdkey:library:page:list'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedName,
    getLocalizedText,
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
          this.nameJsonForm = this.emptyLangForm();
          this.remarkJsonForm = this.emptyLangForm();
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.emptyLangForm();
          this.remarkJsonForm = this.emptyLangForm();
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    //重置
    handleReset() {
      this.tableFrom = Object.assign({}, tableFroms);
      this.productName = '';
      this.name = '';
      this.getList(1);
    },
    // 添加
    handleAdd(row) {
      if (row) {
        this.formValidate = {
          id: row.id,
          name: row.name || '',
          remark: row.remark || '',
        };
        this.nameJsonForm = this.parseLangForm(row.nameJson);
        this.remarkJsonForm = this.parseLangForm(row.remarkJson);
      } else {
        this.formValidate = {
          name: '',
          remark: '',
          id: 0,
        };
        this.nameJsonForm = this.emptyLangForm();
        this.remarkJsonForm = this.emptyLangForm();
      }
      this.activeLang = resolveFormActiveLang(this);
      this.dialogVisible = true;
    },
    //提交
    handleSubmit: Debounce(function (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loadingBtn = true;
          const payload = {
            id: this.formValidate.id,
            name: this.formValidate.name || '',
            remark: this.formValidate.remark || '',
            nameJson: buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, this.formValidate.name),
            remarkJson: buildI18nNameJson(this.langOptions, this.remarkJsonForm, this.defaultLangCode, this.formValidate.remark),
          };
          this.formValidate.id === 0
            ? productCdkeysaveApi(payload)
                .then((res) => {
                  this.$message.success(this.$t('product.addSuccess'));
                  this.dialogVisible = false;
                  this.getList(1);
                  this.loadingBtn = false;
                })
                .catch((res) => {
                  this.loadingBtn = false;
                })
            : productUnrelatedUpdateApi(payload)
                .then((res) => {
                  this.$message.success(this.$t('product.editSuccess'));
                  this.loadingBtn = false;
                  this.dialogVisible = false;
                  this.getList(1);
                })
                .catch((res) => {
                  this.loadingBtn = false;
                });
        }
      });
    }),
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableFrom.productName = encodeURIComponent(this.productName);
      this.tableFrom.name = encodeURIComponent(this.name);
      productCdkeyListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
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
    // 删除
    handleDelete(id) {
      this.$modalSure(this.$t('product.deleteCdkeyConfirm')).then(() => {
        productCdkeyDeleteApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList('');
        });
      });
    },
  },
};
</script>
<style scoped lang="scss"></style>
