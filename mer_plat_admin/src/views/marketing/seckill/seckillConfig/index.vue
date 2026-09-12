<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:seckill:time:interval:list']"
    >
      <div class="padding-add">
        <el-form inline @submit.native.prevent>
          <el-form-item :label="$t('marketing.isShowLabel')">
            <el-select v-model="tableFrom.status" :placeholder="$t('el.select.placeholder')" class="selWidth" @change="getList(1)" clearable>
              <el-option :label="$t('common.close')" :value="0" />
              <el-option :label="$t('common.open')" :value="1" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" :bordered="false" shadow="never">
      <el-button size="mini" type="primary" @click="add(0)" v-hasPermi="['platform:seckill:time:interval:add']"
        >{{ $t('marketing.addSpikeConfig') }}</el-button
      >
      <el-table v-loading="listLoading" :data="tableData.data" size="small" ref="multipleTable" class="mt20">
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('marketing.periodName')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="{ row }">
            {{ getLocalizedPeriodName(row) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.spikePeriod')" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.startTime + '-' + scope.row.endTime }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.status')" min-width="150">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:seckill:time:interval:switch'])"
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @change="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.status ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="130" />
        <el-table-column :label="$t('common.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <a @click="add(1, scope.row)" v-hasPermi="['platform:seckill:time:interval:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handleDelete(scope.row.id, scope.$index)" v-hasPermi="['platform:seckill:time:interval:delete']"
              >{{ $t('common.delete') }}</a
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      :title="formData.id ? $t('marketing.editSpikePeriod') : $t('marketing.addSpikePeriod')"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="dataForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item :label="$t('marketing.periodName')" prop="name">
          <div class="lang-name-switch">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model.trim="formData.name"
              maxlength="30"
              :placeholder="$t('marketing.pleaseEnterPeriodName')"
              class="lang-name-input"
            />
            <el-input
              v-else
              v-model.trim="nameJsonForm[activeLang]"
              maxlength="30"
              :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
              class="lang-name-input"
            />
          </div>
        </el-form-item>
        <el-form-item :label="$t('marketing.spikePeriod')" prop="timeData">
          <el-time-picker
            is-range
            v-model="formData.timeData"
            value-format="HH:mm"
            format="HH:mm"
            :start-placeholder="$t('product.startDate')"
            :end-placeholder="$t('product.endDate')"
            :placeholder="$t('marketing.pleaseSelectTimeRange')"
          />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('common.open')"
            :inactive-text="$t('common.close')"
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
import {
  seckillIntervalListApi,
  seckillIntervalAddApi,
  seckillIntervalUpdateApi,
  seckillIntervalDeleteApi,
  seckillIntervalSwitcheApi,
} from '@/api/marketing';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { getLocalizedName, resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'SeckillConfig',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      formData: {
        id: null,
        name: '',
        nameJson: '',
        timeData: [],
        status: 0,
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        status: '',
      },
      seckillId: null,
    };
  },
  computed: {
    rules() {
      return {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('marketing.pleaseEnterPeriodName')));
          },
          trigger: 'blur',
        }],
        timeData: [{ required: true, message: this.$t('marketing.pleaseSelectTimeRange'), trigger: 'change' }],
        status: [{ required: true, message: this.$t('el.select.placeholder'), trigger: 'change' }],
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
    if (checkPermi(['platform:seckill:time:interval:list'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedPeriodName(row) {
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
          this.nameJsonForm = this.parseNameJson(this.formData && this.formData.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.formData && this.formData.nameJson);
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
    resetForm() {
      this.formData = { id: null, name: '', nameJson: '', timeData: [], status: 0 };
      this.nameJsonForm = this.emptyNameJsonForm();
      this.activeLang = resolveFormActiveLang(this);
      this.seckillId = null;
      this.loading = false;
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure().then(() => {
        seckillIntervalDeleteApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.tableData.data.splice(idx, 1);
        });
      });
    },
    onchangeIsShow(row) {
      seckillIntervalSwitcheApi(row.id)
        .then(async () => {
          this.$message.success(this.$t('category.updateSuccess'));
          this.getList();
        })
        .catch(() => {
          row.status = !row.status;
        });
    },
    // 列表
    getList() {
      this.listLoading = true;
      seckillIntervalListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    submitForm() {
      this.$refs.dataForm.validate((valid) => {
        if (!valid) return;
        if (!this.formData.timeData || this.formData.timeData.length < 2) {
          this.$message.error(this.$t('marketing.pleaseSelectTimeRange'));
          return;
        }
        if (this.formData.timeData[0] >= this.formData.timeData[1]) {
          this.$message.error(this.$t('marketing.invalidTimeRange'));
          return;
        }
        this.loading = true;
        const toHHmm = (value) => (value && value.length >= 5 ? value.substring(0, 5) : value);
        const data = {
          id: this.seckillId,
          name: this.formData.name,
          nameJson: this.buildNameJson(),
          startTime: toHHmm(this.formData.timeData[0]),
          endTime: toHHmm(this.formData.timeData[1]),
          status: this.formData.status,
        };
        const req = !this.seckillId ? seckillIntervalAddApi(data) : seckillIntervalUpdateApi(data);
        req
          .then(() => {
            this.$message.success(this.$t('product.operateSuccess'));
            this.dialogVisible = false;
            this.getList(1);
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    add(isCreate, editDate) {
      this.seckillId = editDate ? editDate.id : null;
      if (isCreate === 0) {
        this.formData = { id: 0, name: '', nameJson: '', timeData: [], status: 0 };
        this.nameJsonForm = this.emptyNameJsonForm();
      } else {
        this.formData = {
          id: editDate.id,
          name: editDate.name,
          nameJson: editDate.nameJson || '',
          timeData: [editDate.startTime, editDate.endTime],
          status: editDate.status,
        };
        this.nameJsonForm = this.parseNameJson(editDate.nameJson);
      }
      this.activeLang = resolveFormActiveLang(this);
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate();
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-range-separator {
  width: 12%;
}

::v-deep .el-col-15:nth-of-type(1) {
  width: 100% !important;
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
