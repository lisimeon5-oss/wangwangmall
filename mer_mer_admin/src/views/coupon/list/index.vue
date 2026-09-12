<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['merchant:coupon:page:list']"
    >
      <div class="padding-add">
        <el-form inline size="small" label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('coupon.discountNameLabel')">
            <el-input v-model.trim="name" :placeholder="$t('marketing.pleaseEnterCouponName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.openStatusLabel')">
            <el-select
              v-model="tableFrom.status"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              @change="handleSearchList"
              clearable
            >
              <el-option :label="$t('coupon.notEnabled')" :value="0" />
              <el-option :label="$t('common.open')" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.receiveMethodLabel')">
            <el-select
              v-model="tableFrom.receiveType"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              @change="handleSearchList"
              clearable
            >
              <el-option :label="$t('common.couponManual')" :value="1" />
              <el-option :label="$t('common.couponGift')" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('coupon.discountTypeLabel')">
            <el-select
              v-model="tableFrom.category"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              @change="handleSearchList"
              clearable
            >
              <el-option :label="$t('coupon.merchantCoupon')" :value="1" />
              <el-option :label="$t('coupon.productCoupon')" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearchList">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <router-link :to="{ path: '/coupon/list/save' }">
        <el-button size="small" type="primary" v-hasPermi="['merchant:coupon:save']">{{ $t('coupon.addCoupon') }}</el-button>
      </router-link>
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="mini" class="mt20">
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :show-overflow-tooltip="true" :label="$t('category.name')" min-width="180">
          <template slot-scope="scope">{{ getLocalizedName(scope.row, uiLocale) }}</template>
        </el-table-column>
        <el-table-column :label="$t('coupon.couponType')" min-width="80">
          <template slot-scope="{ row }">
            <span>{{ row.category | couponCategoryFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="money" :label="$t('marketing.faceValueCol')" min-width="100" />
        <el-table-column prop="name" :label="$t('user.receiveMethod')" min-width="100">
          <template slot-scope="{ row }">
            <span>{{ row.receiveType | couponUserTypeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="260" :label="$t('marketing.receiveDate')">
          <template slot-scope="{ row }">
            <div v-if="row.receiveEndTime">{{ row.receiveStartTime }} - {{ row.receiveEndTime }}</div>
            <span v-else>{{ $t('marketing.noTimeLimit') }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="260" :label="$t('marketing.useTime')">
          <template slot-scope="{ row }">
            <div v-if="row.day">{{ row.day }}{{ $t('marketing.daysUnit') }}</div>
            <span v-else> {{ row.useStartTime }} - {{ row.useEndTime }} </span>
          </template>
        </el-table-column>
        <el-table-column min-width="100" :label="$t('marketing.publishCount')">
          <template slot-scope="{ row }">
            <span v-if="!row.isLimited">{{ $t('product.unlimited') }}</span>
            <div v-else>
              <span class="fa">{{ $t('coupon.publishedPrefix') }}{{ row.total }}</span>
              <span class="sheng">{{ $t('coupon.remainingPrefix') }}{{ row.lastTotal }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('community.isEnabled')" min-width="100" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:coupon:update:status'])"
              v-model="scope.row.status"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.status ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <!--<el-button type="text" class="mr10" size="small" @click="receive(scope.row)" v-hasPermi="['admin:coupon:user:list']">{{ $t('coupon.receiveRecord') }}</el-button>-->
            <template v-if="scope.row.status && checkPermi(['merchant:coupon:info'])">
              <router-link :to="{ path: '/coupon/list/save/' + scope.row.id }">
                <a>{{ $t('marketing.copy') }}</a>
              </router-link>
              <el-divider direction="vertical"></el-divider>
            </template>

            <a @click="handleDelMenu(scope.row)" v-hasPermi="['merchant:coupon:delete']">{{ $t('common.delete') }}</a>

            <template v-if="scope.row.category === 2 && checkPermi(['merchant:coupon:product:join:edit'])">
              <el-divider direction="vertical"></el-divider>
              <router-link :to="{ path: '/coupon/list/save/' + scope.row.id + '/' + 'edit' }">
                <a>{{ $t('common.edit') }}</a>
              </router-link>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
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
    <!--领取记录-->
    <el-dialog :title="$t('coupon.receiveRecord')" :visible.sync="dialogVisible" width="500px" :before-close="handleClose">
      <el-table v-loading="Loading" :data="issueData.data" style="width: 100%">
        <el-table-column prop="nickname" :label="$t('login.username')" min-width="120" />
        <el-table-column :label="$t('marketing.userAvatar')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('marketing.receiveTime')" min-width="180" />
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="$constants.page.limit"
          :page-size="tableFromIssue.limit"
          :current-page="tableFromIssue.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="issueData.total"
          @size-change="handleSizeChangeIssue"
          @current-change="pageChangeIssue"
        />
      </div>
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

import { marketingListApi, couponIssueStatusApi, couponUserListApi, couponDeleteApi } from '@/api/product';
import { roterPre } from '@/settings';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { mapGetters } from 'vuex';
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';
import * as $constants from '@/utils/constants';
const tableFroms = {
  page: 1,
  limit: $constants.page.limit[0],
  status: '',
  name: '',
  type: '',
  useType: '',
};
export default {
  name: 'CouponList',
  data() {
    return {
      Loading: false,
      dialogVisible: false,
      roterPre: roterPre,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: Object.assign({}, tableFroms),
      name: '',
      tableFromIssue: {
        page: 1,
        limit: this.$constants.page.limit[0],
        couponId: '',
      },
      issueData: {
        data: [],
        total: 0,
      },
    };
  },
  mounted() {
    if (!this.merProductClassify.length) this.$store.dispatch('product/getMerProductClassify');
    if (checkPermi(['merchant:coupon:page:list'])) this.getList();
  },
  computed: {
    ...mapGetters(['merProductClassify']),
    uiLocale() {
      return getUiLocale(this);
    },
  },
  methods: {
    checkPermi,
    getLocalizedName,
    handleSearchList() {
      this.tableFrom.page = 1;
      this.getList();
    },
    //重置
    handleReset() {
      this.tableFrom = Object.assign({}, tableFroms);
      this.name = '';
      this.handleSearchList();
    },
    handleClose() {
      this.dialogVisible = false;
    },
    // 领取记录
    receive(row) {
      this.dialogVisible = true;
      this.tableFromIssue.couponId = row.id;
      this.getIssueList();
    },
    // 列表
    getIssueList() {
      this.Loading = true;
      couponUserListApi(this.tableFromIssue)
        .then((res) => {
          this.issueData.data = res.list;
          this.issueData.total = res.total;
          this.Loading = false;
        })
        .catch((res) => {
          this.Loading = false;
          this.$message.error(res.message);
        });
    },
    pageChangeIssue(page) {
      this.tableFromIssue.page = page;
      this.getIssueList();
    },
    handleSizeChangeIssue(val) {
      this.tableFromIssue.limit = val;
      this.getIssueList();
    },
    // 列表
    getList() {
      this.listLoading = true;
      this.tableFrom.name = encodeURIComponent(this.name);
      marketingListApi(this.tableFrom)
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
    // 修改状态
    onchangeIsShow(row) {
      couponIssueStatusApi(row.id)
        .then(() => {
          this.$message.success(this.$t('user.modifySuccess'));
          this.getList();
        })
        .catch(() => {
          row.status = !row.status;
        });
    },
    handleDelMenu(rowData) {
      this.$modalSure(this.$t('category.deleteCurrentDataConfirm')).then(() => {
        couponDeleteApi(rowData.id).then((data) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getList();
        });
      });
    },
  },
};
</script>

<style scoped lang="scss">
.fa {
  color: #0a6aa1;
  display: block;
}
.sheng {
  color: #ff0000;
  display: block;
}
</style>
