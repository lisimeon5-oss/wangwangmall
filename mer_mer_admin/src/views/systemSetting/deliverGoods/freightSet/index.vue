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
          <el-form-item :label="$t('systemSetting.templateNameLabel')">
            <el-input
              @keyup.enter.native="handleSearchList"
              v-model="form.keywords"
              :placeholder="$t('systemSetting.pleaseEnterTemplateName')"
              class="selWidth"
              size="small"
              clearable
            >
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearchList">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card shadow="never" :bordered="false" class="box-card mt14" :body-style="{ padding: '20px' }">
      <el-button type="primary" size="small" @click="handleSubmit()" v-hasPermi="['merchant:shipping:templates:save']"
        >{{ $t('systemSetting.addFreightTemplate') }}</el-button
      >
      <el-table v-loading="loading" :data="tableData.list" class="mt20" size="small">
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column :label="$t('systemSetting.templateName')" min-width="200" :show-overflow-tooltip="true">
          <template slot-scope="{ row }">{{ getLocalizedName(row, getUiLocale()) }}</template>
        </el-table-column>
        <el-table-column min-width="100" :label="$t('systemSetting.billingMethod')" prop="type">
          <template slot-scope="{ row }">
            <p>{{ formatBillingMethod(row.type) }}</p>
          </template>
        </el-table-column>
        <el-table-column min-width="100" :label="$t('systemSetting.freeShippingMethod')" prop="appoint">
          <template slot-scope="{ row }">
            <p>{{ formatFreeShippingMethod(row.appoint) }}</p>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.sort')" min-width="100" prop="sort" />
        <el-table-column :label="$t('systemSetting.addTime')" min-width="150" prop="createTime" />
        <el-table-column prop="address" fixed="right" width="100" :label="$t('common.operate')">
          <template slot-scope="scope">
            <a @click="bindEdit(scope.row)" v-hasPermi="['merchant:shipping:templates:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="bindDelete(scope.row)" v-hasPermi="['merchant:shipping:templates:delete']">{{ $t('common.delete') }}</a>
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
    <CreatTemplates ref="addTemplates" @getList="getList" />
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

import CreatTemplates from './creatTemplates';
import * as logistics from '@/api/logistics.js';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'ShippingTemplates',
  components: { CreatTemplates },
  data() {
    return {
      isShow: false,
      dialogVisible: false,
      form: {
        keywords: '',
      },
      tableData: '',
      page: 1,
      limit: this.$constants.page.limit[0],
      loading: false,
    };
  },
  created() {
    if (checkPermi(['merchant:shipping:templates:list'])) this.getDataList();
  },
  methods: {
    checkPermi,
    getLocalizedName,
    getUiLocale() {
      return getUiLocale(this);
    },
    formatFreeShippingMethod(status) {
      return [this.$t('systemSetting.nationwideFreeShipping'), this.$t('systemSetting.partialFreeShipping'), this.$t('systemSetting.custom')][status];
    },
    formatBillingMethod(status) {
      return [
        this.$t('common.none'),
        this.$t('systemSetting.byItemCount'),
        this.$t('systemSetting.byWeight'),
        this.$t('systemSetting.byVolume'),
      ][status];
    },
    // 添加
    handleSubmit() {
      this.$refs.addTemplates.dialogVisible = true;
      if (!localStorage.getItem('cityList')) this.$refs.addTemplates.getCityList();
      this.$refs.addTemplates.changType(0);
    },
    handleSearchList() {
      this.page = 1;
      this.getDataList();
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
    // 数据列表
    getDataList() {
      this.loading = true;
      logistics
        .shippingTemplatesList({
          keywords: encodeURIComponent(this.form.keywords),
          page: this.page,
          limit: this.limit,
        })
        .then((res) => {
          this.loading = false;
          this.tableData = res;
        });
    },
    // 编辑
    bindEdit(item) {
      if (!localStorage.getItem('cityList')) this.$refs.addTemplates.getCityList();
      this.$refs.addTemplates.getInfo(item.id, item.appoint);
      this.$refs.addTemplates.changType(1);
    },
    // 删除
    bindDelete(item) {
      this.$modalSure().then(() => {
        logistics.shippingDetete({ id: item.id }).then((res) => {
          this.$message.success(this.$t('common.deleteSuccess'));
          this.$store.commit('product/SET_ShippingTemplates', []);
          this.getDataList();
        });
      });
      // logistics.shippingDetete()
    },
    getList() {
      this.getDataList();
    },
  },
};
</script>

<style scoped lang="scss"></style>
