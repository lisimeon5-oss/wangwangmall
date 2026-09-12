<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['merchant:pay:component:product:list']"
    >
      <div class="padding-add">
        <el-form size="small" inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.productIdLabel')">
            <el-input
              v-model="tableFrom.proId"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('videoChannel.pleaseEnterProductId')"
              class="selWidth"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('videoChannel.productNameLabel')">
            <el-input
              v-model="tableFrom.search"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('product.pleaseEnterProductName')"
              class="selWidth"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="mini" ref="multipleTable">
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('category.name')" prop="title" min-width="300">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="right" :open-delay="800">
              <div class="text_overflow" slot="reference">{{ scope.row.title }}</div>
              <div class="pup_card">{{ scope.row.title }}</div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column :label="$t('videoChannel.productImage')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="JSON.parse(scope.row.headImg)[0]" :preview-src-list="JSON.parse(scope.row.headImg)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="componentProductId" :label="$t('videoChannel.videoChannelProductId')" min-width="150" />
        <!--<el-table-column-->
        <!--label="品牌ID"-->
        <!--min-width="150"-->
        <!--prop="brandId"-->
        <!--/>-->
        <el-table-column :label="$t('videoChannel.category')" min-width="150" prop="thirdCatName" />
        <el-table-column :label="$t('videoChannel.earnPoints')" prop="giveIntegral" min-width="100" />
        <el-table-column prop="sales" :label="$t('product.sales')" min-width="90" />
        <el-table-column prop="stock" :label="$t('product.stock')" min-width="90" />
        <el-table-column prop="sales" :label="$t('common.status')" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.status | videoStatusFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.createTime')" prop="createTime" min-width="150" />
        <el-table-column :label="$t('common.operate')" width="120" fixed="right">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 11 && checkPermi(['merchant:pay:component:product:puton'])">
              <a @click="upChange(scope.row.id)">{{ $t('product.onShelf') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template v-if="scope.row.status === 5 && checkPermi(['merchant:pay:component:product:putdown'])">
              <a @click="downChange(scope.row.id)">{{ $t('product.offShelf') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <a @click="handleDelete(scope.row.id, scope.$index)" v-hasPermi="['merchant:pay:component:product:delete']"
              >{{ $t('common.delete') }}</a
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="block mb20">
        <el-pagination
          background
          :page-sizes="$constants.page.limit"
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
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import { videoProductListApi, videoDelApi, videoUpApi, videoDownApi } from '@/api/marketing';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'videoList',
  data() {
    return {
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: this.$constants.page.limit[0],
        proId: '',
        search: '',
      },
    };
  },
  mounted() {
    if (checkPermi(['merchant:pay:component:product:list'])) this.getList();
  },
  methods: {
    checkPermi,
    // 上架
    upChange(id) {
      videoUpApi(id).then(() => {
        this.$message.success(this.$t('user.shelfSuccess'));
        this.getList();
      });
    },
    // 下架
    downChange(id) {
      videoDownApi(id).then(() => {
        this.$message.success(this.$t('user.offShelfSuccess'));
        this.getList();
      });
    },
    // 订单删除
    handleDelete(id, idx) {
      this.$modalSure(this.$t('videoChannel.deleteIrreversibleConfirm')).then(() => {
        videoDelApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    handleReset() {
      this.tableFrom.proId = '';
      this.tableFrom.search = '';
      this.getList(1);
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      videoProductListApi(this.tableFrom)
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

<style scoped>
.el-table__body {
  width: 100%;
  table-layout: fixed !important;
}
.text_overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}
.pup_card {
  width: 200px;
  border-radius: 5px;
  padding: 5px;
  box-sizing: border-box;
  font-size: 12px;
  line-height: 16px;
}
</style>
