<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:sign:user:record:list']"
    >
      <div class="padding-add">
        <el-form size="small" inline @submit.native.prevent>
          <el-form-item :label="$t('product.timeSelectLabel')">
            <el-date-picker
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('product.customTime')"
              style="width: 260px"
              @change="onchangeTime"
            />
          </el-form-item>
          <el-form-item :label="$t('product.userSearchLabel')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt20" :bordered="false" shadow="never">
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        :highlight-current-row="true"
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('user.avatar')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user.nickname')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.nickname }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user.phoneCol')" prop="phone" min-width="100" :show-overflow-tooltip="true"> </el-table-column>
        <el-table-column :label="$t('marketing.continuousSignDays')" prop="day" min-width="100" :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column prop="experience" :label="$t('marketing.signExperience')" min-width="100" />
        <el-table-column prop="integral" :label="$t('marketing.signPoints')" min-width="100" />
        <el-table-column prop="awardExperience" :label="$t('marketing.continuousSignExp')" min-width="100" />
        <el-table-column prop="awardIntegral" :label="$t('marketing.continuousSignPoints')" min-width="100" />
        <el-table-column :label="$t('marketing.signDate')" min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.date }}</span>
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
import { signeRecordListApi } from '@/api/marketing';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  data() {
    return {
      tableFrom: {
        page: 1,
        limit: 20,
        dateLimit: '',
        searchType: 'all',
        content: '',
      },
      timeVal: [],
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: false,
    };
  },
  mounted() {
    if (checkPermi(['platform:sign:user:record:list'])) this.getList();
  },
  methods: {
    checkPermi,
    reset() {
      this.tableFrom.dateLimit = '';
      this.tableFrom.searchType = 'all';
      this.tableFrom.content = '';
      this.timeVal = [];
      this.getList(1);
    },
    // 选择时间
    selectChange(tab) {
      this.tableFrom.dateLimit = tab;
      this.tableFrom.page = 1;
      this.timeVal = [];
      this.getList();
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = e ? this.timeVal.join(',') : '';
      this.tableFrom.page = 1;
      this.getList();
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      signeRecordListApi(this.tableFrom)
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
  },
};
</script>
