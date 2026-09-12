<template>
  <div class="divBox">
    <el-card
      class="box-card"
      shadow="never"
      :bordered="false"
      v-hasPermi="['platform:express:list']"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form ref="form" inline :model="form" @submit.native.prevent>
          <el-form-item :label="$t('distribution.keywordLabel')">
            <el-input
              v-model.trim="form.keywords"
              @keyup.enter.native="handlerSearch"
              :placeholder="$t('application.pleaseEnterKeyword')"
              class="selWidth"
              size="small"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handlerSearch">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-button type="primary" size="small" @click="addExpress" v-hasPermi="['platform:express:sync']"
        >{{ $t('maintain.syncLogisticsCompany') }}</el-button
      >
      <el-table class="mt20" v-loading="loading" size="small" :data="tableData.list">
        <el-table-column prop="id" label="ID" min-width="180" />
        <el-table-column :label="$t('maintain.logisticsCompanyName')" min-width="150" prop="name" />
        <el-table-column min-width="200" :label="$t('maintain.code')" prop="code" />
        <el-table-column min-width="100" :label="$t('product.sort')" prop="sort" sortable />
        <el-table-column :label="$t('product.isShow')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isShow"
              class="demo"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @change="bindStatus(scope.row)"
              v-if="checkPermi(['platform:express:update:show'])"
            />
            <div v-else>{{ scope.row.isShow ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column v-hasPermi="['platform:express:update']" prop="address" fixed="right" width="70" :label="$t('common.operate')">
          <template slot-scope="scope">
            <a @click="bindEdit(scope.row)">{{ $t('common.edit') }}</a>
          </template>
        </el-table-column> </el-table
      >`
      <div class="block-pagination">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="tableData.limit"
          :current-page="tableData.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @current-change="pageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    <el-dialog :title="$t('maintain.editLogisticsCompany')" :visible.sync="dialogVisible" width="540px" :before-close="handleClose">
      <el-form :model="formData" :rules="rules" ref="formData" label-width="65px" class="demo-ruleForm">
        <el-form-item :label="$t('maintain.monthlyAccount')" prop="account" v-if="formData.partnerId">
          <el-input v-model.trim="formData.account" :placeholder="$t('maintain.pleaseEnterMonthlyAccount')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('maintain.monthlyPassword')" prop="password" v-if="formData.partnerKey">
          <el-input v-model.trim="formData.password" :placeholder="$t('maintain.pleaseEnterMonthlyPassword')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('maintain.branchName')" prop="netName" v-if="formData.net">
          <el-input v-model.trim="formData.netName" :placeholder="$t('maintain.pleaseEnterBranchName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('product.sort')" prop="sort">
          <el-input-number v-model.trim="formData.sort" :min="0" :max="9999" :label="$t('product.sort')"></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('maintain.isEnabled')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="false">{{ $t('common.close') }}</el-radio>
            <el-radio :label="true">{{ $t('common.open') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button type="primary" @click="submit('formData')" v-hasPermi="['platform:express:update']">{{ $t('el.messagebox.confirm') }}</el-button>
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
import parser from '@/components/FormGenerator/components/parser/Parser';
import * as logistics from '@/api/logistics.js';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { Debounce } from '@/utils/validate';
export default {
  name: 'CompanyList',
  components: { parser },
  data() {
    return {
      constants: this.$constants,
      // 表单
      formConf: { fields: [] },
      form: {
        keywords: '',
      },
      tableData: {},
      page: 1,
      limit: 20,
      loading: false,
      dialogVisible: false,
      fromType: 'add',
      formData: {
        status: false,
      },
      isCreate: 0,
      formShow: false,
      editId: 0,
      rules: {
        sort: [{ required: true, message: this.$t('user.pleaseEnterSort'), trigger: 'blur' }],
        account: [{ required: true, message: this.$t('maintain.pleaseEnterMonthlyAccount'), trigger: 'blur' }],
        password: [{ required: true, message: this.$t('maintain.pleaseEnterMonthlyPassword'), trigger: 'blur' }],
        netName: [{ required: true, message: this.$t('maintain.pleaseEnterBranchName'), trigger: 'blur' }],
      },
    };
  },
  created() {
    if (checkPermi(['platform:express:list'])) this.getExpressList();
  },
  methods: {
    checkPermi,
    handlerSearch() {
      this.page = 1;
      this.getExpressList();
    },
    //  获取物流公司列表
    getExpressList() {
      this.loading = true;
      logistics
        .expressList({
          page: this.page,
          limit: this.limit,
          keywords: this.form.keywords,
        })
        .then((res) => {
          this.loading = false;
          this.tableData = res;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 物流开关
    bindStatus(item) {
      logistics
        .expressUpdateShow({
          account: item.account,
          code: item.code,
          id: item.id,
          isShow: item.isShow,
          name: item.name,
          sort: item.sort,
        })
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          // this.getExpressList()
        })
        .catch(() => {
          item.isShow = !item.isShow;
        });
    },
    // 分页
    pageChange(e) {
      this.page = e;
      this.getExpressList();
    },
    handleSizeChange(e) {
      this.limit = e;
      this.getExpressList();
    },
    // 添加物流公司
    addExpress() {
      logistics.expressSyncApi().then((res) => {
        this.$message.success(this.$t('maintain.syncLogisticsSuccess'));
        this.page = 1;
        this.getExpressList();
      });
    },
    // 删除物流公司
    bindDelete(item) {
      this.$modalSure().then(() => {
        logistics.expressDelete({ id: item.id }).then((res) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getExpressList();
        });
      });
    },
    // 表单提交
    submit: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          logistics.expressUpdate(this.formData).then((res) => {
            this.$message.success(this.$t('product.operateSuccess'));
            this.handleClose();
            this.getExpressList();
          });
        } else {
          return false;
        }
      });
    }),
    //  关闭模态框
    handleClose(done) {
      this.formShow = false;
      // this.formData = {}
      this.formConf.fields = [];
      this.dialogVisible = false;
      this.isCreate = 0;
    },
    // 编辑
    bindEdit(item) {
      this.dialogVisible = true;
      this.editId = item.id;
      logistics.expressInfo({ id: item.id }).then((res) => {
        this.formData = res;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.el-icon-plus {
  margin-right: 5px;
}

.formBox {
  .el-input-number--medium {
    width: 100px;
  }
}
</style>
