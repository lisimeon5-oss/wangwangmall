<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['merchant:pay:component:product:draft:list']"
    >
      <div class="padding-add">
        <el-form inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('videoChannel.productNameLabel')">
            <el-input
              v-model="search"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('product.pleaseEnterProductName')"
              class="selWidth"
              clearable
            >
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <router-link :to="{ path: '/videoChannel/creatVideoChannel' }">
        <el-button size="small" type="primary" class="mb20" v-hasPermi="['merchant:pay:component:product:draft:add']"
          >{{ $t('videoChannel.addVideoChannelProduct') }}</el-button
        >
      </router-link>
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="mini" ref="multipleTable">
        <el-table-column prop="id" label="Id" width="40" />
        <el-table-column :label="$t('category.name')" prop="title" min-width="300">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="right" :open-delay="800">
              <div class="text_overflow" slot="reference">{{ scope.row.title }}</div>
              <div class="pup_card">{{ scope.row.title }}</div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column :label="$t('videoChannel.productImage')" min-width="60">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="JSON.parse(scope.row.headImg)[0]" :preview-src-list="JSON.parse(scope.row.headImg)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('videoChannel.category')" min-width="150" prop="thirdCatName" />
        <el-table-column prop="sales" :label="$t('product.sales')" min-width="80" />
        <el-table-column prop="stock" :label="$t('product.stock')" min-width="80" />
        <el-table-column :label="$t('videoChannel.wechatAudit')" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.editStatus | editStatusFilter }}</span>
            <div v-show="scope.row.editStatus === 3" class="textE93323">
              {{ $t('product.rejectReason') }}：{{ scope.row.platformStatusReason }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('videoChannel.platformAudit')" min-width="140">
          <template slot-scope="scope">
            <span>{{ scope.row.platformEditStatus | platformStatusFilter }}</span>
            <div v-show="scope.row.platformEditStatus === 3" class="textE93323">
              {{ $t('product.rejectReason') }}：{{ scope.row.platformStatusReason }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.createTime')" prop="addTime" min-width="140" />
        <el-table-column :label="$t('common.operate')" width="130" fixed="right">
          <template slot-scope="scope">
            <router-link :to="{ path: '/videoChannel/creatVideoChannel/' + scope.row.id + '/1' }">
              <a v-hasPermi="['merchant:pay:component:product:draft:info']">{{ $t('common.detail') }}</a>
            </router-link>
            <template
              v-show="
                (scope.row.platformEditStatus === 1 ||
                  scope.row.platformEditStatus === 3 ||
                  scope.row.editStatus === 3) &&
                checkPermi(['merchant:pay:component:product:draft:update'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <router-link :to="{ path: '/videoChannel/creatVideoChannel/' + scope.row.id }">
                <a>{{ $t('common.edit') }}</a>
              </router-link>
            </template>
            <template
              v-show="scope.row.platformEditStatus !== 2 && checkPermi(['merchant:pay:component:product:draft:delete'])"
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handlerOpenDel(scope.row)">{{ $t('common.delete') }}</a>
            </template>
            <template
              v-show="
                scope.row.platformEditStatus === 1 ||
                (scope.row.platformEditStatus === 3 && checkPermi(['merchant:pay:component:product:draft:review']))
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handlerReview(scope.row, 2)">{{ $t('videoChannel.submitForReview') }}</a>
            </template>
            <template
              v-show="scope.row.platformEditStatus === 2 && checkPermi(['merchant:pay:component:product:draft:review'])"
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handlerReview(scope.row, 1)">{{ $t('videoChannel.withdrawApplication') }}</a>
            </template>
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

import { draftListApi, draftDelApi, draftReviewApi } from '@/api/marketing';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
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
      search: '',
    };
  },
  mounted() {
    if (checkPermi(['merchant:pay:component:product:draft:list'])) this.getList();
  },
  methods: {
    checkPermi,
    /**
     * 删除
     * @param rowData
     */
    handlerOpenDel(rowData) {
      this.$modalSure(this.$t('maintain.deleteCurrentDataConfirm')).then(() => {
        draftDelApi(rowData.id).then((data) => {
          this.$message.success(this.$t('content.deleteDataSuccess'));
          this.getList();
        });
      });
    },
    /**
     * 提审 platformStatus：2提审，1撤回
     */
    handlerReview(rowData, num) {
      this.$modalSure(num === 2 ? this.$t('videoChannel.submitProductReviewConfirm') : this.$t('videoChannel.withdrawApplicationConfirm')).then(() => {
        draftReviewApi({ draftProductId: rowData.id, platformEditStatus: num }).then((data) => {
          this.$message.success(this.$t('user.submitSuccess'));
          this.getList();
        });
      });
    },
    /**
     * 列表
     * @param num
     */
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
