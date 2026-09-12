<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-table size="small" :data="tableData.list" style="width: 100%" v-loading="listLoading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="adminId" :label="$t('maintain.adminId')" width="80"></el-table-column>
        <el-table-column prop="adminAccount" :label="$t('maintain.adminAccount')" width="120"></el-table-column>
        <el-table-column prop="status" :label="$t('maintain.operateStatus')" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status ? 'danger' : ''">{{ scope.row.status ? $t('product.abnormal') : $t('maintain.normal') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          :label="$t('maintain.interfaceDescription')"
          width="140"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column prop="createTime" :label="$t('maintain.operateTime')" width="120" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="ip" :label="$t('maintain.hostAddress')" width="120" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="method" :label="$t('maintain.methodNameFull')" width="180" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="url" :label="$t('maintain.requestUrl')" width="180" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="methodType" :label="$t('maintain.requestType')" width="100"></el-table-column>
        <el-table-column prop="requestMethod" :label="$t('maintain.requestMethod')" width="100"></el-table-column>
        <el-table-column
          prop="requestParam"
          :label="$t('maintain.requestParameter')"
          width="150"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column prop="result" :label="$t('maintain.returnParameter')" width="180" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="errorMsg" :label="$t('maintain.errorMessage')" width="180" :show-overflow-tooltip="true"></el-table-column>
      </el-table>
      <el-pagination
        background
        :page-sizes="[20, 30, 40, 60]"
        :page-size="tableFrom.limit"
        :current-page="tableFrom.page"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.total"
        @size-change="handleSizeChange"
        @current-change="pageChange"
      />
    </el-card>
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
import { sensitiveListApi } from '@/api/systemadmin';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  data() {
    return {
      tableData: {},
      tableFrom: {
        page: 1,
        limit: 20,
      },
      listLoading: false,
    };
  },
  mounted() {
    if (checkPermi(['platform:log:sensitive:list'])) this.getLogList();
  },
  methods: {
    checkPermi,
    getLogList() {
      this.listLoading = true;
      sensitiveListApi(this.tableFrom).then((res) => {
        this.tableData = res;
        this.listLoading = false;
      });
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getLogList();
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getLogList();
    },
  },
};
</script>
