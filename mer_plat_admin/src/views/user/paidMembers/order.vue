<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:paid:member:order:page:list']"
    >
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('order.payTime')">
            <el-date-picker
              v-model="timeVal"
              size="small"
              type="daterange"
              :placeholder="$t('user.chooseDate')"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              range-separator="-"
              :start-placeholder="$t('user.startDate')"
              :end-placeholder="$t('user.endDate')"
              @change="onchangeTime"
              class="selWidth"
            />
          </el-form-item>
          <el-form-item :label="$t('user.payMethodLabel')">
            <el-select
              v-model.trim="tableFrom.payType"
              clearable
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              class="selWidth"
              @change="getList(1)"
            >
              <el-option :label="$t('order.wechat')" value="weixin" />
              <el-option :label="$t('order.alipay')" value="alipay" />
              <el-option :label="$t('order.balance')" value="yue" />
              <el-option :label="$t('user.platformGift')" value="give" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('user.payStatusLabel')">
            <el-select
              v-model.trim="tableFrom.payStatus"
              clearable
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              class="selWidth"
              @change="getList(1)"
            >
              <el-option :label="$t('order.unpaid')" value="0" />
              <el-option :label="$t('order.paid')" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('order.orderNoLabel')">
            <el-input
              v-model.trim="orderNoSeach"
              @keyup.enter.native="getList(1)"
              size="small"
              clearable
              :placeholder="$t('order.pleaseEnterOrderNo')"
              class="selWidth"
            />
          </el-form-item>
          <el-form-item :label="$t('user.cardNameSearch')">
            <el-input
              v-model.trim="cardName"
              @keyup.enter.native="getList(1)"
              size="small"
              clearable
              :placeholder="$t('user.pleaseEnterCardName')"
              class="selWidth"
            />
          </el-form-item>
          <el-form-item :label="$t('order.userSearch')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        highlight-current-row
        class="mt20"
      >
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column prop="orderNo" :label="$t('user.orderNoCol')" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('user.nicknameId')" min-width="120">
          <template slot-scope="scope">
            <span class="spBlock">{{ scope.row.userNickname + '/' + scope.row.uid }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userPhone" :label="$t('user.phoneCol')" min-width="150" />
        <el-table-column prop="cardName" :label="$t('user.cardNameCol')" min-width="150" />
        <el-table-column prop="price" :label="$t('user.payAmount')" min-width="110" />
        <el-table-column prop="payType" :label="$t('user.payStatusCol')" min-width="110">
          <template slot-scope="scope">
            <span class="spBlock">{{ scope.row.paid | paidFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payType" :label="$t('user.payMethodCol')" min-width="110">
          <template slot-scope="scope">
            <span class="spBlock">{{ scope.row.payType | filterCardPayType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" :label="$t('user.payTimeCol')" min-width="150" />
        <el-table-column prop="cardExpirationTime" :label="$t('user.expireTime')" min-width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 2" class="spBlock">{{ $t('user.permanent') }}</span>
            <span v-else class="spBlock">{{ scope.row.cardExpirationTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="80" fixed="right">
          <template slot-scope="scope">
            <a @click="handleInfo(scope.row.orderNo)" v-hasPermi="['platform:paid:member:order:info']">{{ $t('common.detail') }} </a>
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
    <!-- 订单详情-->
    <order-detail ref="orderDetail"></order-detail>
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
import { memberOrderListApi } from '@/api/user';
import OrderDetail from '../components/OrderDetail.vue';
import { checkPermi } from '@/utils/permission';
import { paidFilter } from '@/filters';
export default {
  name: 'paidMembersOrder',
  components: { OrderDetail },
  data() {
    return {
      tableFrom: {
        cardName: '',
        dateLimit: '',
        page: 1,
        limit: 20,
        orderNo: '',
        payType: null,
        payStatus: null,
        userNickname: '',
        searchType: 'all',
        content: '',
      },
      cardName: '',
      userNickname: '',
      orderNoSeach: '',
      timeVal: [],
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
    };
  },
  mounted() {
    if (checkPermi(['platform:paid:member:order:page:list'])) this.getList();
  },
  methods: {
    paidFilter,
    //详情
    handleInfo(id) {
      this.$refs.orderDetail.getDetail(id);
      this.$refs.orderDetail.dialogVisible = true;
    },
    /**
     *  具体日期
     */
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = this.timeVal ? this.timeVal.join(',') : '';
      this.getList(1);
    },
    /**
     *  列表
     */
    getList(num) {
      this.listLoading = true;
      this.tableFrom.cardName = encodeURIComponent(this.cardName);
      this.tableFrom.userNickname = encodeURIComponent(this.userNickname);
      this.tableFrom.orderNo = encodeURIComponent(this.orderNoSeach);
      this.tableFrom.page = num ? num : this.tableFrom.page;
      memberOrderListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
          this.$message.error(res.message);
        });
    },
    reset() {
      this.tableFrom.content = '';
      this.tableFrom.searchType = 'all';
      this.tableFrom.cardName = '';
      this.tableFrom.dateLimit = '';
      this.tableFrom.page = 1;
      this.tableFrom.limit = 20;
      this.tableFrom.orderNo = '';
      this.tableFrom.payType = null;
      this.tableFrom.payStatus = null;
      this.tableFrom.userNickname = '';
      this.timeVal = [];
      this.cardName = '';
      this.orderNoSeach = '';
      this.userNickname = '';
      this.getList(1);
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList('');
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList(1);
    },
  },
};
</script>

<style scoped lang="scss"></style>
