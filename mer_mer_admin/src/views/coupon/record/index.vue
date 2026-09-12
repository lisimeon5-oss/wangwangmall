<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['merchant:coupon:user:page:list']"
    >
      <div class="padding-add">
        <el-form :inline="true" @submit.native.prevent>
          <el-form-item :label="$t('marketing.useStatusLabel')">
            <el-select
              v-model="tableFromIssue.status"
              :placeholder="$t('marketing.pleaseSelectUseStatus')"
              clearable
              class="selWidth"
              @change="handleSearchList"
            >
              <el-option :label="$t('marketing.used')" value="1" />
              <el-option :label="$t('marketing.unused')" value="0" />
              <el-option :label="$t('product.expiredOver')" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('coupon.couponNameShortLabel')">
            <el-input v-model.trim="name" :placeholder="$t('coupon.pleaseEnterCouponShort')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearchList">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-table v-loading="Loading" :data="issueData.data" style="width: 100%">
        <el-table-column prop="id" :label="$t('marketing.couponId')" min-width="80" />
        <el-table-column prop="name" :label="$t('product.couponName')" min-width="150" />
        <el-table-column prop="user" :label="$t('user.userInfoTab')" min-width="140">
          <template slot-scope="scope">
            <div>{{ scope.row.nickname }}/{{ scope.row.uid }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="money" :label="$t('marketing.faceValueCol')" min-width="100" />
        <el-table-column prop="minPrice" :label="$t('marketing.minConsumption')" min-width="120" />
        <el-table-column prop="startTime" :label="$t('marketing.useValidity')" min-width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.startTime">
              {{ scope.row.startTime }} -<br />
              {{ scope.row.endTime }}
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.usageScope')" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.category | couponCategoryFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.receiveTime')" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.useStatus')" min-width="100">
          <template slot-scope="scope">
            <el-tag class="endTag tag-background" v-if="scope.row.status == 1">{{ $t('marketing.used') }}</el-tag>
            <el-tag class="doingTag tag-background" v-else-if="scope.row.status == 0">{{ $t('marketing.unused') }}</el-tag>
            <el-tag class="notStartTag tag-background" v-else>{{ $t('marketing.invalidated') }}</el-tag>
          </template>
          <!--<template slot-scope="scope">-->
          <!--<span>{{ scope.row.status | statusFilter }}</span>-->
          <!--</template>-->
        </el-table-column>
        <el-table-column :label="$t('marketing.useTime')" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.useTime | filterEmpty }}</span>
          </template>
        </el-table-column>
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

import { couponUserListApi } from '@/api/marketing';
import { roterPre } from '@/settings';
import { checkPermi } from '@/utils/permission';
import * as $constants from '@/utils/constants'; // 权限判断函数
const tableFroms = {
  page: 1,
  limit: $constants.page.limit[0],
  name: '',
  status: '',
};
export default {
  name: 'CouponUser',
  filters: {
    failFilter(status) {
      const statusMap = {
        receive: this.$t('coupon.selfClaim'),
        send: this.$t('coupon.backendSend'),
        give: this.$t('coupon.fullGift'),
        new: this.$t('coupon.newUser'),
        buy: this.$t('coupon.buyGift'),
      };
      return statusMap[status];
    },
    statusFilter(status) {
      const statusMap = {
        0: this.$t('marketing.unused'),
        1: this.$t('marketing.used'),
        2: this.$t('product.expiredOver'),
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      Loading: false,
      roterPre: roterPre,
      imgList: [],
      tableFromIssue: Object.assign({}, tableFroms),
      issueData: {
        data: [],
        total: 0,
      },
      name: '',
      loading: false,
      options: [],
    };
  },
  mounted() {
    if (checkPermi(['merchant:coupon:user:page:list'])) this.getIssueList();
  },
  methods: {
    checkPermi,
    handleSearchList() {
      this.tableFromIssue.page = 1;
      this.getIssueList();
    },
    //重置
    handleReset() {
      this.tableFromIssue = Object.assign({}, tableFroms);
      this.name = '';
      this.handleSearchList();
    },
    // 列表
    getIssueList() {
      this.Loading = true;
      this.tableFromIssue.name = encodeURIComponent(this.name);
      couponUserListApi(this.tableFromIssue)
        .then((res) => {
          this.issueData.data = res.list;
          this.issueData.total = res.total;
          // this.issueData.data.map((item) => {
          //   this.imgList.push(item.user.avatar)
          // })
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
  },
};
</script>

<style scoped lang="scss">
.seachTiele {
  line-height: 35px;
}
.fa {
  color: #0a6aa1;
  display: block;
}
.sheng {
  color: #ff0000;
  display: block;
}
</style>
