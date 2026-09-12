<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:pay:component:product:draft:list']"
    >
      <div class="padding-add">
        <el-form inline @submit.native.prevent>
          <el-form-item :label="$t('videoChannel.productNameLabel')">
            <el-input
              v-model="search"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('product.pleaseEnterProductName')"
              class="selWidth"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" :bordered="false" shadow="never">
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="small" ref="multipleTable">
        <el-table-column prop="id" label="Id" min-width="80" />
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
        <el-table-column :label="$t('videoChannel.category')" min-width="150" prop="thirdCatName" />
        <el-table-column :label="$t('videoChannel.earnPoints')" prop="giveIntegral" min-width="100" />
        <el-table-column prop="sales" :label="$t('product.sales')" min-width="90" />
        <el-table-column prop="stock" :label="$t('product.stock')" min-width="90" />
        <el-table-column :label="$t('videoChannel.wechatAudit')" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.editStatus | editStatusFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('videoChannel.platformAudit')" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.platformEditStatus | platformStatusFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.createTime')" prop="addTime" min-width="150" />
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <template
              v-if="scope.row.platformEditStatus === 2 && checkPermi(['platform:pay:component:product:draft:review'])"
            >
              <a @click="handleAudit(scope.row.id, true)">{{ $t('finance.audit') }} </a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <a @click="handleAudit(scope.row.id, false)" v-hasPermi="['platform:pay:component:product:draft:info']"
              >{{ $t('common.detail') }}
            </a>
          </template>
        </el-table-column>
      </el-table>
      <div class="block mb20">
        <el-pagination
          background
          :page-sizes="[10, 20, 30, 40]"
          :page-size="tableFrom.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <info-from ref="infoFrom" :is-atud="isAtud" :productId="productId" @subSuccess="subSuccess" />
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
import { draftListApi, catListApi } from '@/api/videoChannel';
import { checkPermi } from '@/utils/permission';
import infoFrom from '../info';

export default {
  name: 'draftList',
  data() {
    return {
      isAtud: false,
      productId: 0,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        proId: '',
        search: '',
      },
      search: '',
    };
  },
  components: { infoFrom },
  mounted() {
    if (checkPermi(['platform:pay:component:product:draft:list'])) this.getList();
    let videoCategory = null;
    try {
      videoCategory = JSON.parse(sessionStorage.getItem('videoCategory') || 'null');
    } catch (e) {
      videoCategory = null;
    }
    if (!videoCategory) this.getCatList();
  },
  methods: {
    checkPermi,
    // 类目；
    getCatList() {
      catListApi().then((res) => {
        this.options = res;
        sessionStorage.setItem('videoCategory', JSON.stringify(res));
      });
    },
    subSuccess() {
      this.getList('');
    },
    // 审核
    handleAudit(id, c) {
      this.productId = id;
      this.$refs.infoFrom.dialogVisible = true;
      this.isAtud = c;
      this.$refs.infoFrom.getInfo(id);
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableFrom.search = encodeURIComponent(this.search);
      draftListApi(this.tableFrom)
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
