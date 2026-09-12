<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      v-hasPermi="['merchant:shipping:templates:list']"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form ref="form" inline :model="form" @submit.native.prevent label-position="right">
          <el-form-item :label="$t('systemSetting.keywordLabel')">
            <el-input
              @keyup.enter.native="getDataList(1)"
              v-model="form.keywords"
              :placeholder="$t('systemSetting.pleaseEnterKeyword')"
              class="selWidth"
              size="small"
              clearable
            >
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" v-debounceClick="2000" @click="getDataList(1)">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card shadow="never" :bordered="false" class="box-card mt14" :body-style="{ padding: '20px' }">
      <el-button type="primary" size="small" @click="handleCreat" v-hasPermi="['merchant:express:relate']"
        >{{ $t('common.add') }}</el-button
      >
      <el-table v-loading="loading" :data="tableData.data" class="mt20" size="small">
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column :label="$t('systemSetting.logisticsCompanyName')" min-width="200" prop="name" :show-overflow-tooltip="true">
          <template slot-scope="{ row }">
            <span v-if="row.isDefault" class="font-color">[{{ $t('common.default') }}]</span>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('systemSetting.code')" min-width="150" prop="code" />
        <el-table-column :label="$t('common.status')" min-width="150" prop="createTime">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:express:open:switch'])"
              v-model="scope.row.isOpen"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              v-throttle="1000"
              :disabled="scope.row.isDefault"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
            <div v-else>{{ scope.row.isOpen ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="address" fixed="right" width="220" :label="$t('common.operate')">
          <template slot-scope="scope">
            <a @click="handleDelete(scope.row)" v-hasPermi="['merchant:express:delete']">{{ $t('common.delete') }}</a>
            <template v-if="scope.row.isOpen && checkPermi(['merchant:express:default:switch'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="handleSetDefault(scope.row)">{{ scope.row.isDefault ? $t('systemSetting.cancelDefault') : $t('systemSetting.setDefault') }}</a>
            </template>
            <el-button
              v-if="scope.row.partnerId"
              type="text"
              size="small"
              @click="bindEdit(scope.row)"
              v-hasPermi="['admin:express:info']"
            >{{ $t('systemSetting.editMonthlyAccount') }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="block-pagination">
        <el-pagination
          background
          :page-sizes="$constants.page.limit"
          :page-size="tableData.limit"
          :current-page="tableData.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @current-change="pageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <creat-express ref="craetExpressRef" @handlerSuccessSubmit="getDataList(1)" :datekey="datekey"></creat-express>

    <el-dialog :title="$t('systemSetting.monthlyAccountConfig')" :visible.sync="dialogVisible" width="700px" :before-close="handleClose">
      <el-form :model="formData" :rules="rules" ref="formData" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="$t('systemSetting.monthlyAccount')" prop="account" v-if="formData.partnerId">
          <el-input v-model="formData.account" :placeholder="$t('systemSetting.pleaseEnterMonthlyAccount')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.monthlyPassword')" prop="password" v-if="formData.partnerKey">
          <el-input v-model="formData.password" :placeholder="$t('systemSetting.pleaseEnterMonthlyPassword')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.outletName')" prop="netName" v-if="formData.net">
          <el-input v-model="formData.netName" :placeholder="$t('systemSetting.pleaseEnterOutletName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.enabled')" prop="status">
          <el-radio-group v-model="formData.isOpen">
            <el-radio :label="false">{{ $t('common.close') }}</el-radio>
            <el-radio :label="true">{{ $t('common.open') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit('formData')" v-hasPermi="['admin:express:update']">{{ $t('common.confirm') }}</el-button>
      </span>
      <!--<parser v-if="formShow" ref="formBox" class="formBox" :form-conf="formConf" :form-edit-data="formData" :is-edit="isCreate === 1" @submit="submit" />-->
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

import * as logistics from '@/api/logistics.js';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public';
import CreatExpress from './creatExpress.vue';
import { useLogisticsAllList } from '@/hooks/use-order'; // 权限判断函数
import { Debounce } from '@/utils/validate';
export default {
  name: 'ShippingTemplates',
  components: { CreatExpress },
  data() {
    return {
      form: {
        keywords: '',
        page: 1,
        limit: this.$constants.page.limit[0],
      },
      tableData: {
        data: [],
        total: 0,
      },
      loading: false,
      expressAllList: [],
      datekey: 0,
      dialogVisible: false,
      formData: {
        status: false,
        sort:0,
      },
      isCreate: 0,
      editId: 0,
      rules: {
        sort: [{ required: true, message: this.$t('user.pleaseEnterSort'), trigger: 'blur' }],
        account: [{ required: true, message: this.$t('systemSetting.pleaseEnterMonthlyAccount'), trigger: 'blur' }],
        password: [{ required: true, message: this.$t('systemSetting.pleaseEnterMonthlyPassword'), trigger: 'blur' }],
        netName: [{ required: true, message: this.$t('systemSetting.pleaseEnterOutletName'), trigger: 'blur' }],
      },
    };
  },
  created() {
    if (checkPermi(['merchant:express:search:page'])) this.getDataList(1);
    if (!localStorage.getItem('expressAllList')) this.getExpressList();
  },
  methods: {
    checkPermi,
    // 物流公司列表
    async getExpressList() {
      this.expressAllList = await useLogisticsAllList();
    },
    // 添加
    handleCreat() {
      this.datekey = +new Date();
      //this.$refs.craetExpressRef.dialogVisible = true;
    },
    // 分页
    pageChange(e) {
      this.page = e;
      this.getDataList();
    },
    handleSizeChange(e) {
      this.limit = e;
      this.getDataList();
    },
    //修改状态
    handleStatusChange(row) {
      logistics.expressOpenSwitchApi(row.id).then((res) => {
        this.$message.success(this.$t('user.updateStatusSuccess'));
        this.getDataList();
      });
    },
    // 数据列表
    getDataList(num) {
      this.loading = true;
      this.form.page = num ? num : this.form.page;
      logistics
        .expressPageApi({
          keywords: encodeURIComponent(this.form.keywords),
          page: this.form.page,
          limit: this.form.limit,
        })
        .then((res) => {
          this.loading = false;
          this.tableData.data = res.list;
          this.tableData.total = res.total;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 默认操作
    handleSetDefault(item) {
      logistics.expressDefaultAwitchApi(item.id).then((res) => {
        this.$message.success(this.$t('user.operationSuccess'));
        this.getDataList(1);
      });
    },
    // 删除
    handleDelete(item) {
      this.$modalSure(this.$t('systemSetting.deleteLogisticsCompanyConfirm')).then(() => {
        logistics.expressDeleteApi(item.id).then((res) => {
          this.$message.success(this.$t('common.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.form);
          this.getDataList();
        });
      });
    },
    //  关闭模态框
    handleClose(done) {
      // this.formData = {}
      // this.formConf.fields = [];
      this.dialogVisible = false;
      this.isCreate = 0;
    },
    // 编辑
    bindEdit(item) {
      this.dialogVisible = true;
      this.editId = item.id;
      this.formData = item;
    },
    submit: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          logistics.expressUpdate(this.formData).then((res) => {
            this.$message.success(this.$t('user.operationSuccess'));
            this.handleClose();
            this.getExpressList();
          });
        } else {
          return false;
        }
      });
    }),
  },
};
</script>

<style scoped lang="scss"></style>
