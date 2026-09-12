<template>
  <div class="divBox relative">
    <el-card class="box-card" shadow="never" :bordered="false">
      <div class="clearfix">
        <el-button
          type="primary"
          size="small"
          v-hasPermi="['platform:product:guarantee:add']"
          @click="handlerOpenEdit(0)"
          >{{ $t('product.addGuarantee') }}</el-button
        >
      </div>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        class="mt20"
        size="small"
        :highlight-current-row="true"
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('product.serviceTerm')" min-width="150">
          <template slot-scope="scope">{{ getLocalizedName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('product.serviceTermIcon')" min-width="120">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <img v-if="scope.row.icon" :src="scope.row.icon" class="icon-img" alt="" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" :label="$t('product.serviceContentDesc')" min-width="250" :show-overflow-tooltip="true" />
        <el-table-column prop="sort" :label="$t('product.sort')" min-width="80" />
        <el-table-column :label="$t('product.createTime')" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.isShow')" min-width="90" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:product:guarantee:show:status'])"
              v-model="scope.row.isShow"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('product.show')"
              :inactive-text="$t('product.hide')"
              @click.native="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.isShow ? $t('product.show') : $t('product.hide') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <a @click="handlerOpenEdit(1, scope.row)" v-hasPermi="['platform:product:guarantee:update']">{{ $t('product.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handlerOpenDel(scope.row)" v-hasPermi="['platform:product:guarantee:delete']">{{ $t('product.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="formData.id ? $t('product.editServiceTerm') : $t('product.addServiceTerm')"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="dataForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item :label="$t('product.serviceTerm')" prop="name">
          <div class="lang-name-switch">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model.trim="formData.name"
              maxlength="100"
              :placeholder="$t('product.pleaseEnterServiceTerm')"
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
        <el-form-item :label="$t('product.serviceTermIcon')" prop="icon">
          <div class="upLoadPicBox" @click="modalPicTap(false)">
            <div v-if="formData.icon" class="pictrue">
              <img :src="formData.icon" alt="" />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('product.serviceContentDesc')" prop="content">
          <el-input
            v-model.trim="formData.content"
            type="textarea"
            maxlength="100"
            :rows="3"
            :placeholder="$t('product.pleaseEnterServiceContent')"
          />
        </el-form-item>
        <el-form-item :label="$t('product.sort')" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('product.cancel') }}</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">{{ $t('product.save') }}</el-button>
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
import * as product from '@/api/product';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  data() {
    return {
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
        nameJson: '',
        icon: '',
        content: '',
        sort: 0,
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
            else callback(new Error(this.$t('product.pleaseEnterServiceTerm')));
          },
          trigger: 'blur',
        }],
        icon: [{ required: true, message: this.$t('product.pleaseUploadServiceIcon'), trigger: 'change' }],
        content: [{ required: true, message: this.$t('product.pleaseEnterServiceContent'), trigger: 'blur' }],
        sort: [{ required: true, message: this.$t('product.sort'), trigger: 'blur' }],
      };
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    currentLocale() {
      return this.$i18n.locale || 'zh-cn';
    },
  },
  created() {
    this.getLanguageList();
  },
  mounted() {
    if (checkPermi(['platform:product:guarantee:list'])) this.getList();
  },
  methods: {
    checkPermi,
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
          this.nameJsonForm = this.parseNameJson(this.formData.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.formData.nameJson);
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
    getLocalizedName(row) {
      const locale = this.currentLocale;
      if (row && row.nameJson) {
        try {
          const nameObj = typeof row.nameJson === 'string' ? JSON.parse(row.nameJson) : row.nameJson;
          const val = nameObj[locale];
          if (val) return val;
        } catch (e) {
          // 解析失败时回退默认名称
        }
      }
      return row ? row.name : '';
    },
    getList() {
      this.listLoading = true;
      product
        .guaranteeListApi()
        .then((res) => {
          this.tableData.data = res;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
          this.$message.error(res.message);
        });
    },
    handlerOpenEdit(isCreate, editDate) {
      if (isCreate === 0 || !editDate) {
        this.formData = { id: 0, name: '', nameJson: '', icon: '', content: '', sort: 0 };
        this.nameJsonForm = this.emptyNameJsonForm();
      } else {
        this.formData = {
          id: editDate.id,
          name: editDate.name,
          nameJson: editDate.nameJson || '',
          icon: editDate.icon,
          content: editDate.content,
          sort: editDate.sort || 0,
        };
        this.nameJsonForm = this.parseNameJson(editDate.nameJson);
      }
      this.activeLang = resolveFormActiveLang(this);
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate();
      });
    },
    resetForm() {
      this.formData = { id: 0, name: '', nameJson: '', icon: '', content: '', sort: 0 };
      this.nameJsonForm = this.emptyNameJsonForm();
      this.activeLang = resolveFormActiveLang(this);
      this.loading = false;
    },
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.formData.icon = img[0].sattDir;
          _this.$refs.dataForm && _this.$refs.dataForm.validateField('icon');
        },
        multiple,
        'product',
      );
    },
    submitForm() {
      this.$refs.dataForm.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        const data = {
          id: this.formData.id,
          name: this.formData.name,
          nameJson: this.buildNameJson(),
          content: this.formData.content,
          icon: this.formData.icon,
          sort: this.formData.sort,
        };
        const request = this.formData.id ? product.guaranteeUpdateApi(data) : product.guaranteeAddApi(data);
        request
          .then(() => {
            this.$message.success(this.$t('product.operateSuccess'));
            this.dialogVisible = false;
            this.getList();
          })
          .catch(() => {
            this.loading = false;
          });
      });
    },
    handlerOpenDel(rowData) {
      this.$modalSure(this.$t('product.deleteGuaranteeConfirm')).then(() => {
        product.guaranteeDeleteApi(rowData.id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getList();
        });
      });
    },
    onchangeIsShow(row) {
      product.guaranteeShowApi(row.id).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList();
      });
    },
  },
};
</script>
<style scoped lang="scss">
.icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
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
