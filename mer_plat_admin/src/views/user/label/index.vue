<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-button size="small" type="primary" @click="openAdd(null)" v-hasPermi="['platform:user:tag:save']">
        {{ $t('user.addUserTag') }}
      </el-button>
      <el-table v-loading="listLoading" :data="tableData.data" class="mt20" size="small">
        <el-table-column label="ID" min-width="80" prop="id" />
        <el-table-column :label="$t('user.tagName')" min-width="180">
          <template slot-scope="{ row }">
            <span>{{ getLocalizedTagName(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="120" fixed="right">
          <template slot-scope="scope">
            <a @click="openAdd(scope.row)" v-hasPermi="['platform:user:tag:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handleDelete(scope.row.id, scope.$index)" disable v-hasPermi="['platform:user:tag:delete']"
              >{{ $t('common.delete') }}</a
            >
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
      :title="labelPram.id ? $t('user.editTag') : $t('user.addTag')"
      :visible.sync="labelPram.dialogConfig.visible"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form :rules="rules" :model="labelPram" ref="ruleForm" label-width="90px" class="demo-dynamic">
        <el-form-item :label="$t('user.tagNameLabel')" class="mb30" prop="name">
          <div class="lang-name-switch">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model.trim="labelPram.name"
              maxlength="50"
              :placeholder="$t('user.pleaseFillTag')"
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
      </el-form>
      <div slot="footer">
        <el-button @click="resetForm">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="onAdd('ruleForm')" v-hasPermi="['platform:user:update']">{{ $t('common.confirm') }}</el-button>
      </div>
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

import { tagListApi, tagDeleteApi, tagSaveApi, tagUpdateApi } from '@/api/user';
import { checkPermi } from '@/utils/permission';
import { Debounce } from '@/utils/validate';
import { handleDeleteTable } from '@/libs/public';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { getLocalizedName, resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'UserGroup',
  data() {
    return {
      tableFrom: {
        page: 1,
        limit: 20,
      },
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: true,
      labelPram: {
        id: null,
        name: null,
        nameJson: '',
        dialogConfig: {
          visible: false,
        },
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
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
            else callback(new Error(this.$t('user.pleaseEnterUserTag')));
          },
          trigger: 'blur',
        }],
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
    if (checkPermi(['platform:user:tag:list'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedTagName(row) {
      return getLocalizedName(row, this.currentLocale);
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
          this.nameJsonForm = this.parseNameJson(this.labelPram && this.labelPram.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.labelPram && this.labelPram.nameJson);
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
    openAdd(row) {
      if (row) {
        this.labelPram.id = row.id;
        this.labelPram.name = row.name;
        this.labelPram.nameJson = row.nameJson || '';
        this.nameJsonForm = this.parseNameJson(row.nameJson);
      } else {
        this.labelPram.id = null;
        this.labelPram.name = null;
        this.labelPram.nameJson = '';
        this.nameJsonForm = this.emptyNameJsonForm();
      }
      this.activeLang = resolveFormActiveLang(this);
      this.labelPram.dialogConfig.visible = true;
      this.$nextTick(() => {
        this.$refs.ruleForm && this.$refs.ruleForm.clearValidate();
      });
    },
    onAdd: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        const data = {
          id: this.labelPram.id,
          name: this.labelPram.name,
          nameJson: this.buildNameJson(),
        };
        const req = data.id ? tagUpdateApi(data) : tagSaveApi(data);
        req.then(() => {
          this.$message.success(data.id ? this.$t('user.editSuccess') : this.$t('user.addTagSuccess'));
          this.labelPram.dialogConfig.visible = false;
          this.getList();
        });
      });
    }),
    getList() {
      this.listLoading = true;
      tagListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch(() => {
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
    handleDelete(id) {
      this.$modalSure(this.$t('user.deleteTagConfirm')).then(() => {
        tagDeleteApi(id).then(() => {
          this.$message.success(this.$t('user.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    resetForm() {
      this.labelPram.dialogConfig.visible = false;
      this.labelPram.id = null;
      this.labelPram.name = null;
      this.labelPram.nameJson = '';
      this.nameJsonForm = this.emptyNameJsonForm();
      this.activeLang = resolveFormActiveLang(this);
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
