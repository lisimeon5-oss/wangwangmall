<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-if="checkPermi(['platform:integral:order:invoice:list'])"
    >
      <div class="padding-add">
        <el-form inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.timeSelectLabel')">
            <el-date-picker
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('product.customTime')"
              @change="onchangeTime"
              class="form_content_width"
            />
          </el-form-item>
          <el-form-item :label="$t('order.orderNoLabel')" label-width="66px">
            <el-input
              v-model.trim="tableFrom.orderNo"
              :placeholder="$t('finance.pleaseEnterOrderNo')"
              class="form_content_width"
              size="small"
              @keyup.enter.native="handleSearchList"
              clearable
            >
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('product.userSearchLabel')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearchList">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card
      shadow="never"
      :bordered="false"
      class="box-card mt16"
      :body-style="{ padding: '0 20px 20px' }"
      v-if="checkPermi(['platform:integral:order:status:num', 'platform:integral:order:invoice:list'])"
    >
      <el-tabs class="list-tabs" v-model="tableFrom.status" @tab-click="handleSearchList">
        <el-tab-pane name="all" :label="$t('marketing.tabCount', { name: $t('common.all'), count: orderChartType.all || 0 })"></el-tab-pane>
        <el-tab-pane name="unPaid" :label="$t('marketing.tabCount', { name: $t('order.pendingPayment'), count: orderChartType.unPaid || 0 })"></el-tab-pane>
        <el-tab-pane name="notShipped" :label="$t('marketing.tabCount', { name: $t('order.pendingShipment'), count: orderChartType.notShipped || 0 })"></el-tab-pane>
        <el-tab-pane name="spike" :label="$t('marketing.tabCount', { name: $t('order.waitingReceipt'), count: orderChartType.spike || 0 })"></el-tab-pane>
        <el-tab-pane name="receiving" :label="$t('marketing.tabCount', { name: $t('order.received'), count: orderChartType.receiving || 0 })"></el-tab-pane>
        <el-tab-pane name="complete" :label="$t('marketing.tabCount', { name: $t('marketing.tradeComplete'), count: orderChartType.complete || 0 })"></el-tab-pane>
        <el-tab-pane name="cancel" :label="$t('marketing.tabCount', { name: $t('common.cancelled'), count: orderChartType.cancel || 0 })"></el-tab-pane>
        <el-tab-pane name="deleted" :label="$t('marketing.tabCount', { name: $t('order.deleted'), count: orderChartType.deleted || 0 })"></el-tab-pane>
      </el-tabs>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        size="mini"
        class="mt20"
        highlight-current-row
        :row-key="
          (row) => {
            return row.orderNo;
          }
        "
      >
        <el-table-column :label="$t('common.orderNo')" min-width="220">
          <template slot-scope="scope">
            <div class="acea-row">
              <span
                style="display: block"
                :class="parseInt(scope.row.refundStatus) > 0 ? 'colorPrompt' : ''"
                v-text="scope.row.orderNo"
              />
            </div>
            <span v-show="scope.row.isUserDel" class="colorPrompt" style="display: block">{{ $t('order.userDeleted') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.userNickname')" min-width="150">
          <template slot-scope="scope">
            <span :class="scope.row.isLogoff == true ? 'colorPrompt' : ''"
              >{{ scope.row.nickName }} | {{ scope.row.uid }}</span
            >
            <span :class="scope.row.isLogoff == true ? 'colorPrompt' : ''" v-if="scope.row.isLogoff == true">|</span>
            <span v-if="scope.row.isLogoff == true" class="colorPrompt">{{ $t('product.loggedOff') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payPrice" :label="$t('marketing.actualAmount')" min-width="80" />
        <el-table-column prop="redeemIntegral" :label="$t('marketing.usePoints')" min-width="80" />
        <el-table-column :label="$t('order.orderStatus')" min-width="100">
          <template slot-scope="scope">
            <span :class="scope.row.status < 5 ? 'doingTag' : 'endTag'" class="tag-background tag-padding">{{
              scope.row.status | orderStatusFilter
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('order.orderTime')" min-width="150" />
        <el-table-column width="180" fixed="right">
          <template slot-scope="scope">
            <a @click="onOrderDetails(scope.row.orderNo)" v-if="checkPermi(['platform:integral:order:detail'])"
              >{{ $t('common.detail') }}
            </a>
            <template
              v-if="scope.row.status === 1 || (scope.row.status === 2 && checkPermi(['platform:integral:order:send']))"
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="sendOrder(scope.row)">{{ $t('marketing.ship') }} </a>
            </template>
            <template v-if="scope.row.status > 0 && checkPermi(['platform:integral:order:mark'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="onOrderMark(scope.row)">{{ $t('common.remark') }} </a>
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
    <!--详情-->
    <details-from ref="orderDetail" :orderNo="orderNo" />

    <!-- 发送货 -->
    <order-send ref="send" :orderNo="orderNo" @submitFail="handleSearchList"></order-send>
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

import { intervalOrderNumApi, intervalOrderMarkApi, intervalOrderListApi } from '@/api/pointsMall';
import detailsFrom from '../components/orderDetail';
import orderSend from '../components/orderSend';
import Cookies from 'js-cookie';
import { checkPermi } from '@/utils/permission';
import * as $constants from '@/utils/constants'; // 权限判断函数
let tableFroms = {
  status: 'all',
  dateLimit: '',
  orderNo: '',
  page: 1,
  limit: $constants.page.limit[0],
  searchType: 'all',
  content: '',
};
export default {
  name: 'orderlistDetails',
  components: {
    detailsFrom,
    orderSend,
  },
  data() {
    return {
      RefuseVisible: false,
      RefuseData: {},
      orderNo: '',
      refundVisible: false,
      refundData: {},
      tableDataLog: {
        data: [],
        total: 0,
      },
      tableFromLog: {
        page: 1,
        limit: this.$constants.page.limit[0],
        orderNo: 0,
      },
      LogLoading: false,
      isCreate: 1,
      editData: null,
      dialogVisible: false,
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: false,
      tableFrom: Object.assign({}, tableFroms),
      orderChartType: {},
      timeVal: [],
      fromList: this.$constants.fromList,
      fromType: [
        { value: '', text: this.$t('el.table.clearFilter') },
        { value: '0', text: this.$t('order.normal') },
        { value: '1', text: this.$t('order.spike') },
        { value: '2', text: this.$t('order.groupBuy') },
      ],
      selectionList: [],
      ids: '',
      orderids: '',
      cardLists: [],
      proType: 0,
      active: false,
      checkAll: false,
      checkedCities: [this.$t('common.orderNo'), this.$t('product.userNickname'), this.$t('order.payPrice'), this.$t('order.payType'), this.$t('order.orderStatus'), this.$t('order.orderTime')],
      columnData: [this.$t('common.orderNo'), this.$t('product.userNickname'), this.$t('order.payPrice'), this.$t('order.payType'), this.$t('order.orderStatus'), this.$t('order.orderTime')],
      isIndeterminate: true,
      orderDatalist: null,
      merPrintStatus: Cookies.get('merPrint'), // 商家小票打印开关状态
      dialogVisibleDirectRefund: false,
    };
  },
  mounted() {
    if (checkPermi(['platform:integral:order:invoice:list'])) this.getList();
    if (checkPermi(['platform:integral:order:status:num'])) this.getOrderStatusNum();
  },
  methods: {
    checkPermi,
    //直接退款
    onDirectRefund(row) {
      this.orderNo = row.orderNo;
      this.dialogVisibleDirectRefund = true;
    },
    //直接退款关闭
    handlerSuccessClose() {
      this.dialogVisibleDirectRefund = false;
    },
    //直接退款成功回调
    handlerSuccessSubmit() {
      this.dialogVisibleDirectRefund = false;
      this.getList();
    },
    handleReset() {
      this.tableFrom.dateLimit = '';
      this.tableFrom.orderNo = '';
      this.tableFrom.page = 1;
      this.tableFrom.content = '';
      this.tableFrom.searchType = 'all';
      this.selectChange();
    },
    resetFormRefundhandler() {
      this.refundVisible = false;
    },
    resetFormRefusehand() {
      this.RefuseVisible = false;
    },
    resetForm(formValue) {
      this.dialogVisible = false;
    },
    handleSearchList() {
      this.tableFrom.page = 1;
      this.getList();
      this.getOrderStatusNum();
    },
    // 发送
    sendOrder(row) {
      if (row.isLogoff) {
        this.$modalSure(this.$t('marketing.userCancelledShipping')).then(() => {
          this.onSend(row);
        });
      } else {
        this.onSend(row);
      }
    },
    //发货操作
    onSend(row) {
      this.orderNo = row.orderNo;
      this.$refs.send.modals = true;
    },
    // 详情
    onOrderDetails(id) {
      this.orderNo = id;
      this.$refs.orderDetail.getDetail(id);
      this.$refs.orderDetail.getOrderInvoiceList(id);
      this.$refs.orderDetail.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
    },
    // 备注
    onOrderMark(row) {
      this.$modalPrompt('textarea', this.$t('common.remark'), row.merchantRemark ? row.merchantRemark : '', this.$t('order.orderRemark')).then((V) => {
        intervalOrderMarkApi({ remark: V, orderNo: row.orderNo }).then(() => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.getList();
        });
      });
    },
    handleSelectionChange(val) {
      this.selectionList = val;
      const data = [];
      this.selectionList.map((item) => {
        data.push(item.orderNo);
      });
      this.ids = data.join(',');
    },
    // 选择时间
    selectChange(tab) {
      this.timeVal = [];
      this.tableFrom.page = 1;
      this.getList();
      this.getOrderStatusNum();
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = e ? this.timeVal.join(',') : '';
      this.tableFrom.page = 1;
      this.getList();
      this.getOrderStatusNum();
    },
    // 列表
    getList() {
      this.listLoading = true;
      intervalOrderListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list || [];
          this.tableData.total = res.total;
          this.listLoading = false;
          this.checkedCities = this.$cache.local.has('order_stroge')
            ? this.$cache.local.getJSON('order_stroge')
            : this.checkedCities;
        })
        .catch(() => {
          this.listLoading = false;
        });
    },
    // 获取各状态数量
    getOrderStatusNum() {
      let data = Object.assign({}, this.tableFrom);
      delete data.page;
      delete data.limit;
      delete data.status;
      intervalOrderNumApi(data).then((res) => {
        this.orderChartType = res;
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
    handleCheckAllChange(val) {
      this.checkedCities = val ? this.columnData : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.columnData.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnData.length;
    },
  },
};
</script>
<style lang="scss" scoped>
font {
  color: var(--prev-color-primary);
}
.el-table__body {
  width: 100%;
  table-layout: fixed !important;
}

.demo-table-expand {
  ::v-deeplabel {
    width: 83px !important;
  }
}

.refunding {
  span {
    display: block;
  }
}

.el-icon-arrow-down {
  font-size: 12px;
}

.tabBox_tit {
  font-size: 12px !important;
  /*margin: 0 2px 0 10px;*/
  letter-spacing: 1px;
  /*padding: 5px 0;*/
  box-sizing: border-box;
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

.flex-column {
  display: flex;
  flex-direction: column;
}

.relative {
  position: relative;
}

.cell_ht {
  height: 50px;
  padding: 15px 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #eeeeee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check_cell {
  width: 100%;
  padding: 15px 20px 0;
}

::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #606266;
}
</style>
