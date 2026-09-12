<template>
  <!--v-if="isLogin"-->
  <div class="divBox" v-if="isLogin">
    <el-card v-loading="fullscreenLoading" class="box-card" shadow="never" :bordered="false">
      <div slot="header" class="clearfix">
        <div class="container">
          <router-link :to="{ path: '/operation/onePass/index' }">
            <el-button class="mb35" size="mini" icon="el-icon-arrow-left">{{ $t('common.back') }}</el-button>
          </router-link>
        </div>
        <div class="acea-row">
          <el-button
            v-hasPermi="['platform:one:pass:sms:temp:apply']"
            size="mini"
            type="primary"
            @click="add"
            class="mr20"
            >{{ $t('onePass.applySmsTemplate') }}</el-button
          >
          <el-alert
            style="width: 80%"
            :title="$t('onePass.smsTemplateTip')"
            type="warning"
            :closable="false"
            effect="light"
          >
          </el-alert>
        </div>
      </div>
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="small" highlight-current-row>
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column prop="temp_id" :label="$t('onePass.templateId')" min-width="80" />
        <el-table-column prop="title" :label="$t('onePass.templateName')" min-width="120" />
        <el-table-column prop="content" :label="$t('onePass.templateContent')" min-width="500" />
        <el-table-column :label="$t('onePass.templateType')" min-width="100">
          <template slot-scope="{ row }">
            <span>{{ row.temp_type | typesFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('onePass.templateStatus')">
          <template slot-scope="{ row }">
            <span>{{ row.status | statusFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mark" :label="$t('onePass.auditResult')" min-width="100" />
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
      :title="$t('onePass.applySmsTemplate')"
      :visible.sync="dialogVisible"
      width="560px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="dataForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item :label="$t('onePass.templateName')" prop="title">
          <el-input v-model.trim="formData.title" maxlength="50" :placeholder="$t('onePass.pleaseEnterTemplateName')" />
        </el-form-item>
        <el-form-item :label="$t('onePass.templateTypeLabel')" prop="type">
          <el-select v-model="formData.type" :placeholder="$t('el.select.placeholder')" class="selWidth">
            <el-option :label="$t('onePass.verificationCode')" :value="1" />
            <el-option :label="$t('onePass.notification')" :value="2" />
            <el-option :label="$t('onePass.promotion')" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('onePass.templateContent')" prop="content">
          <el-input
            v-model.trim="formData.content"
            type="textarea"
            :rows="4"
            maxlength="500"
            :placeholder="$t('onePass.pleaseEnterTemplateContent')"
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
import { smsTempLstApi, tempCreateApi } from '@/api/sms';
import { mapGetters } from 'vuex';
import { Debounce } from '@/utils/validate';
export default {
  name: 'SmsTemplate',
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: this.$t('onePass.unavailable'),
        1: this.$t('onePass.available'),
      };
      return statusMap[status];
    },
    typesFilter(status) {
      const statusMap = {
        1: this.$t('onePass.verificationCode'),
        2: this.$t('onePass.notification'),
        3: this.$t('onePass.promotion'),
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      isCreate: 0,
      fullscreenLoading: false,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
      },
      dialogVisible: false,
      loading: false,
      formData: {
        title: '',
        type: 1,
        content: '',
      },
    };
  },
  computed: {
    ...mapGetters(['isLogin']),
    rules() {
      return {
        title: [{ required: true, message: this.$t('onePass.pleaseEnterTemplateName'), trigger: 'blur' }],
        type: [{ required: true, message: this.$t('el.select.placeholder'), trigger: 'change' }],
        content: [{ required: true, message: this.$t('onePass.pleaseEnterTemplateContent'), trigger: 'blur' }],
      };
    },
  },
  mounted() {
    if (!this.isLogin) {
      this.$router.push('/operation/onePass/index?url=' + this.$route.path);
    } else {
      this.getList();
    }
  },
  methods: {
    submitForm: Debounce(function () {
      this.$refs.dataForm.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        tempCreateApi(this.formData)
          .then(() => {
            this.$message.success(this.$t('product.addSuccess'));
            this.dialogVisible = false;
            this.getList();
          })
          .finally(() => {
            this.loading = false;
          });
      });
    }),
    add() {
      this.formData = { title: '', type: 1, content: '' };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate();
      });
    },
    resetForm() {
      this.formData = { title: '', type: 1, content: '' };
      this.loading = false;
    },
    // 查看是否登录
    onIsLogin() {
      this.fullscreenLoading = true;
      this.$store
        .dispatch('user/isLogin')
        .then(async (res) => {
          const data = res;
          if (!data.status) {
            this.$message.warning(this.$t('onePass.pleaseLoginFirst'));
            this.$router.push('/operation/onePass/index?url=' + this.$route.path);
          } else {
            this.getList();
          }
          this.fullscreenLoading = false;
        })
        .catch((res) => {
          this.$router.push('/operation/onePass/index?url=' + this.$route.path);
          this.fullscreenLoading = false;
        });
    },
    // 列表
    getList() {
      this.listLoading = true;
      smsTempLstApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.data;
          this.tableData.total = res.count;
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
    // 表格搜索
    userSearchs() {
      this.tableFrom.page = 1;
      this.getList();
    },
  },
};
</script>

<style scoped lang="scss"></style>
