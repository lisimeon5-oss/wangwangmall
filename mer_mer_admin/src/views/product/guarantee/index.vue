<template>
  <div class="divBox relative">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '20px' }">
      <el-button
        type="primary"
        size="small"
        v-hasPermi="['merchant:product:guarantee:group:add']"
        @click="handlerOpenEdit(0)"
        >{{ $t('product.addGuarantee') }}</el-button
      >
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        :key="'guarantee-group-' + uiLocale"
        style="width: 100%"
        size="small"
        class="mt20"
        :highlight-current-row="true"
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('product.groupName')">
          <template slot-scope="scope">
            {{ displayGroupName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.createTime')">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.operate')" fixed="right" width="150">
          <template slot-scope="scope">
            <a
              @click="handlerOpenEdit(1, scope.row)"
              v-hasPermi="['merchant:product:guarantee:group:edit', 'merchant:product:guarantee:group:edit']"
              >{{ $t('product.edit') }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <a @click="handlerOpenEdit(1, scope.row, 'info')" v-hasPermi="['merchant:product:guarantee:group:edit']"
              >{{ $t('product.detail') }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <a @click="handlerOpenDel(scope.row)" v-hasPermi="['merchant:product:guarantee:group:delete']">{{ $t('product.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      :title="guaranteeForm.id === 0 ? $t('product.addGuarantee') : isDisabled ? $t('product.guaranteeDetail') : $t('product.editGuarantee')"
      :visible.sync="dialogVisible"
      width="1000px"
      :before-close="handleClose"
    >
      <el-form :model="guaranteeForm" :rules="nameRules" ref="guaranteeForm" @submit.native.prevent class="demo-ruleForm">
        <el-form-item :label="$t('common.language')">
          <el-radio-group v-model="activeLang" size="small" :disabled="isDisabled">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('product.groupName')" prop="name">
          <el-input
            v-model="groupNameInput"
            :disabled="isDisabled"
            :placeholder="
              isDefaultLang
                ? $t('product.groupNameRequired')
                : $t('product.inputNameInLang', { lang: activeLangLabel })
            "
          />
        </el-form-item>
        <el-form-item :label="$t('product.serviceList')" prop="guaranteeList">
          <el-table
            border
            ref="multipleTable"
            :data="guaranteeListNew"
            tooltip-effect="dark"
            style="width: 100%"
            class="tableSelection"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" :selectable="selectable" width="55"></el-table-column>
            <el-table-column prop="id" label="ID" min-width="50" />
            <el-table-column :label="$t('product.serviceTerms')" min-width="150">
              <template slot-scope="scope">
                <div>{{ getLocalizedName(scope.row, uiLocale) || scope.row.name }}</div>
                <div v-show="!scope.row.isShow" class="color-red">{{ $t('product.dataInvalid') }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="content" :label="$t('product.serviceContentDesc')" min-width="200" />
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('product.cancel') }}</el-button>
        <el-button
          type="primary"
          v-hasPermi="['merchant:product:guarantee:group:edit', 'merchant:product:guarantee:group:add']"
          @click="submitForm('guaranteeForm')"
          :disabled="isDisabled"
        >
          {{ $t('product.confirm') }}</el-button
        >
      </div>
    </el-dialog>
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

import * as store from '@/api/product';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
  parseLangJsonMap,
  getLocalizedName,
  getUiLocale,
} from '@/utils/localizedName';
export default {
  data() {
    var validateGuarantee = (rule, value, callback) => {
      if (this.guaranteeChanged.length === 0) {
        callback(new Error(this.$t('product.selectAtLeastOneService')));
      } else {
        callback();
      }
    };
    return {
      listLoading: false,
      keyNum: 0,
      dialogVisible: false,
      guaranteeForm: {
        name: '',
        id: 0,
        gids: '',
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: {},
      guaranteeList: [],
      guaranteeListNew: [],
      tableData: {
        data: [],
      },
      extraRules: {
        guaranteeList: [{ required: true, validator: validateGuarantee, trigger: 'change' }],
      },
      guaranteeChanged: [],
      isDisabled: false,
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
    isDefaultLang() {
      return this.activeLang === this.defaultLangCode;
    },
    groupNameInput: {
      get() {
        if (this.activeLang === this.defaultLangCode) return this.guaranteeForm.name || '';
        return this.nameJsonForm[this.activeLang] || '';
      },
      set(val) {
        const text = val == null ? '' : String(val);
        if (this.activeLang === this.defaultLangCode) {
          this.$set(this.guaranteeForm, 'name', text);
        } else {
          this.$set(this.nameJsonForm, this.activeLang, text);
        }
      },
    },
    nameRules() {
      this.$i18n.locale;
      return {
        name: [
          {
            validator: (rule, value, callback) => {
              if (hasI18nNameContent(this.guaranteeForm.name, this.nameJsonForm)) {
                callback();
              } else {
                callback(new Error(this.$t('product.groupNameRequired')));
              }
            },
            trigger: ['blur', 'change'],
          },
        ],
        guaranteeList: this.extraRules.guaranteeList,
      };
    },
  },
  created() {
    this.getLanguageList();
  },
  watch: {
    '$i18n.locale'() {
      this.activeLang = resolveFormActiveLang(this);
    },
  },
  mounted() {
    if (checkPermi(['merchant:product:guarantee:group:list'])) this.getList();
    if (checkPermi(['merchant:plat:product:guarantee:list'])) this.getProductGuarantee();
  },
  methods: {
    checkPermi,
    getLocalizedName,
    displayGroupName(row) {
      this.$i18n.locale;
      return getLocalizedName(row, getUiLocale(this)) || '-';
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
          this.nameJsonForm = this.parseLangForm(this.guaranteeForm && this.guaranteeForm.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.emptyLangForm();
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    selectable(row, index) {
      if (this.isDisabled) return false;
      if (row.isShow) {
        return true;
      } else {
        return false;
      }
    },
    handleSelectionChange(val) {
      this.guaranteeChanged = val;
    },
    // 保障服务列表
    getProductGuarantee() {
      store.productGuaranteeApi().then((res) => {
        this.guaranteeList = res;
      });
    },
    handleClose() {
      this.dialogVisible = false;
      this.guaranteeForm = {
        name: '',
        id: 0,
        gids: '',
      };
      this.nameJsonForm = this.emptyLangForm();
      this.activeLang = resolveFormActiveLang(this);
      this.guaranteeChanged = [];
      this.$refs.multipleTable.clearSelection();
      this.$refs['guaranteeForm'].resetFields();
    },
    // 列表
    getList() {
      this.listLoading = true;
      store
        .guaranteeListApi()
        .then((res) => {
          this.tableData.data = res;
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
    handlerOpenEdit(isCreate, editDate, info) {
      let list = [];
      this.guaranteeListNew = [...this.guaranteeList];
      this.isDisabled = !!info;
      if (isCreate === 1) {
        this.guaranteeForm = Object.assign({ name: '', id: 0, gids: '' }, editDate);
        this.nameJsonForm = this.parseLangForm(editDate.nameJson);
        this.guaranteeListNew.map((item) => {
          editDate.guaranteeList.map((obj) => {
            if (obj.gid === item.id && obj.isShow) list.push(item);
          });
        });
        if (list) {
          list.forEach((row) => {
            this.$nextTick(() => {
              this.$refs.multipleTable.toggleRowSelection(row, true);
            });
          });
        }
      } else {
        this.guaranteeForm.id = 0;
        this.guaranteeForm.name = '';
        this.nameJsonForm = this.emptyLangForm();
        list = this.guaranteeListNew.filter((item) => item.isShow);
        this.guaranteeListNew = list;
      }
      this.activeLang = resolveFormActiveLang(this);
      this.dialogVisible = true;
    },
    close() {
      this.dialogVisible = false;
      this.guaranteeForm.name = '';
      this.getList();
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let ids = [];
          this.guaranteeChanged.map((item) => {
            ids.push(item.id);
          });
          const nameJsonStr = buildI18nNameJson(
            this.langOptions,
            this.nameJsonForm,
            this.defaultLangCode,
            this.guaranteeForm.name,
          );
          const payload = {
            id: this.guaranteeForm.id || 0,
            name: this.guaranteeForm.name || '',
            nameJson: nameJsonStr ? JSON.parse(nameJsonStr) : {},
            gids: ids.toString(),
          };
          payload.id === 0
            ? store
                .guaranteeAddApi(payload)
                .then((res) => {
                  this.$message.success(this.$t('product.operateSuccess'));
                  this.close();
                })
                .catch(() => {
                  this.loading = false;
                })
            : store
                .guaranteeUpdateApi(payload)
                .then((res) => {
                  this.$message.success(this.$t('product.operateSuccess'));
                  this.close();
                })
                .catch(() => {
                  this.loading = false;
                });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    handlerOpenDel(rowData) {
      this.$modalSure(this.$t('product.deleteGuaranteeConfirm')).then(() => {
        store.guaranteeDeleteApi(rowData.id).then((data) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getList();
        });
      });
    },
  },
};
</script>
