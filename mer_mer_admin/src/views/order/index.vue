<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-if="checkPermi(['merchant:order:page:list'])"
    >
      <div class="padding-add">
        <el-form inline label-position="right" @submit.native.prevent>
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
          <el-form-item :label="$t('order.orderType')">
            <el-select
              v-model="tableFrom.type"
              clearable
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              class="form_content_width"
              @change="handleSearchList"
            >
              <el-option v-for="(item, i) in fromType" :key="i" :label="item.text" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('order.timeSelect')">
            <el-date-picker
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('order.customTime')"
              @change="onchangeTime"
              class="form_content_width"
            />
          </el-form-item>
          <el-form-item :label="$t('order.userSearch')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearchList">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card
      shadow="never"
      :bordered="false"
      class="box-card mt16"
      :body-style="{ padding: '0 20px 20px' }"
      v-if="checkPermi(['merchant:order:status:num', 'merchant:order:page:list'])"
    >
      <el-tabs class="list-tabs" v-model="tableFrom.status" @tab-click="handleSearchList">
        <el-tab-pane name="all" :label="`${$t('common.all')}(${orderChartType.all || 0})`"></el-tab-pane>
        <el-tab-pane name="notShipped" :label="`${$t('order.notShipped')}(${orderChartType.notShipped || 0})`"></el-tab-pane>
        <el-tab-pane name="spike" :label="`${$t('order.waitingReceipt')}(${orderChartType.spike || 0})`"></el-tab-pane>
        <el-tab-pane name="awaitVerification" :label="`${$t('order.awaitingVerification')}(${orderChartType.verification || 0})`"></el-tab-pane>
        <el-tab-pane name="receiving" :label="`${$t('order.received')}(${orderChartType.receiving || 0})`"></el-tab-pane>
        <el-tab-pane name="complete" :label="`${$t('order.completed')}(${orderChartType.complete || 0})`"></el-tab-pane>
        <el-tab-pane name="refunded" :label="`${$t('order.refunded')}(${orderChartType.refunded || 0})`"></el-tab-pane>
        <el-tab-pane name="deleted" :label="`${$t('order.deleted')}(${orderChartType.deleted || 0})`"></el-tab-pane>
      </el-tabs>
      <div class="mt5">
        <el-button size="small" type="primary" @click="onWriteOff" v-hasPermi="['merchant:order:verification']"
          >{{ $t('order.writeOffOrder') }}</el-button
        >
        <el-button size="small" @click="exports" v-hasPermi="['merchant:export:order:excel']">{{ $t('common.export') }}</el-button>
      </div>
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
        <el-table-column :label="$t('common.orderNo')" min-width="220" v-if="checkedCities.includes('orderNo')">
          <template slot-scope="scope">
            <div class="acea-row">
              <font v-show="scope.row.type === 1" class="mr5">[{{ $t('order.spike') }}]</font>
              <font v-show="scope.row.type === 2" class="mr5">[{{ $t('order.groupBuy') }}]</font>
              <span style="display: block" v-text="scope.row.orderNo" />
            </div>
            <div class="flex">
              <span class="colorPrompt" v-show="parseInt(scope.row.refundStatus) > 0" style="display: block">{{
                scope.row.refundStatus | orderRefundStatusFilter
              }}</span>
              <span v-show="scope.row.refundStatus == 2" class="colorPrompt">{{
                $t('order.refundedDetail', { refundNum: scope.row.refundNum, totalNum: scope.row.totalNum })
              }}</span>
            </div>
            <span v-show="scope.row.isUserDel" class="colorPrompt" style="display: block">{{ $t('order.userDeleted') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('order.nickName')" min-width="150" v-if="checkedCities.includes('nickName')">
          <template slot-scope="scope">
            <span :class="scope.row.isLogoff == true ? 'colorPrompt' : ''">{{ scope.row.nickName }}</span>
            <span :class="scope.row.isLogoff == true ? 'colorPrompt' : ''" v-if="scope.row.isLogoff == true">|</span>
            <span v-if="scope.row.isLogoff == true" class="colorPrompt">{{ $t('order.loggedOff') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payPrice" :label="$t('order.payPrice')" min-width="80" v-if="checkedCities.includes('payPrice')" />
        <el-table-column :label="$t('order.payType')" min-width="80" v-if="checkedCities.includes('payType')">
          <template slot-scope="scope">
            <span>{{ scope.row.payType | payTypeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('order.orderStatus')" min-width="100" v-if="checkedCities.includes('orderStatus')">
          <template slot-scope="scope">
            <span class="textE93323 tag-background notStartTag tag-padding" v-if="scope.row.refundStatus === 3"
              >{{ $t('order.refunded') }}</span
            >
            <span
              :class="scope.row.status < 5 ? 'doingTag' : 'endTag'"
              class="tag-background tag-padding"
              v-else-if="
                scope.row.groupBuyRecordStatus == 99 || scope.row.status == 9 || scope.row.groupBuyRecordStatus == 10
              "
              >{{ scope.row.status | orderStatusFilter }}</span
            >
            <span class="textE93323 tag-background notStartTag tag-padding" v-else>{{
              scope.row.groupBuyRecordStatus == 0 ? $t('order.groupBuying') : $t('order.groupBuyFailed')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.remark')" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.merchantRemark | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('order.orderTime')" min-width="150" v-if="checkedCities.includes('orderTime')" />
        <el-table-column width="180" fixed="right">
          <template slot="header">
            <p>
              <span style="padding-right: 5px">{{ $t('common.operate') }}</span>
              <i class="el-icon-setting" @click="handleAddItem"></i>
            </p>
          </template>
          <template slot-scope="scope">
            <a
              @click="onOrderDetails(scope.row.orderNo)"
              v-if="checkPermi(['merchant:order:info']) && scope.row.groupBuyRecordStatus != 0"
              >{{ $t('common.detail') }}
            </a>
            <el-divider direction="vertical" v-if="scope.row.groupBuyRecordStatus != 0"></el-divider>
            <template
              v-if="
                (scope.row.status === 1 || scope.row.status === 2) &&
                parseFloat(scope.row.refundStatus) < 3 &&
                checkPermi(['merchant:order:send']) &&
                scope.row.groupBuyRecordStatus != 0
              "
            >
              <a @click="sendOrder(scope.row)">{{ $t('order.ship') }} </a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <el-dropdown trigger="click" v-if="scope.row.groupBuyRecordStatus != 0">
              <span class="el-dropdown-link"> {{ $t('order.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  @click.native="onDirectRefund(scope.row)"
                  v-if="
                    scope.row.refundStatus == 0 &&
                    !scope.row.userRefundSign &&
                    checkPermi(['merchant:order:direct:refund'])
                  "
                  >{{ $t('order.directRefund') }}
                </el-dropdown-item>
                <!-- 打印小票订单状态  待发货/待核销/待收货/已收货/已核销/已完成/已退款 原始订单状态
       订单状态（0：待支付，1：待发货,2：部分发货， 3：待核销，4：待收货,5：已收货,6：已完成，9：已取消）-->
                <el-dropdown-item
                  @click.native="handlePrintReceipt(scope.row)"
                  v-if="
                    (parseFloat(scope.row.status) < 7 || scope.row.refundStatus == 3) &&
                    merPrintStatus !== 2 &&
                    checkPermi(['merchant:order:print'])
                  "
                  >{{ $t('order.printReceipt') }}
                </el-dropdown-item>
                <el-dropdown-item @click.native="onOrderMark(scope.row)" v-if="checkPermi(['merchant:order:mark'])"
                  >{{ $t('order.orderRemark') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="scope.row.isUserDel === 1 && checkPermi(['merchant:order:delete'])"
                  @click.native="handleDelete(scope.row, scope.$index)"
                  >{{ $t('order.deleteOrder') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
      <div class="card_abs" v-show="card_select_show">
        <template>
          <div class="cell_ht">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"
              >{{ $t('common.selectAll') }}
            </el-checkbox>
            <el-button size="small" type="text" @click="checkSave()">{{ $t('common.save') }}</el-button>
          </div>
          <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="item in columnData" :label="item" :key="item" class="check_cell">{{
              columnLabel(item)
            }}</el-checkbox>
          </el-checkbox-group>
        </template>
      </div>
    </el-card>

    <!--记录-->
    <el-dialog :title="$t('order.operationLog')" :visible.sync="dialogVisibleJI" width="700px">
      <el-table v-loading="LogLoading" border :data="tableDataLog.data" style="width: 100%">
        <el-table-column prop="oid" label="ID" min-width="80" />
        <el-table-column prop="changeMessage" :label="$t('order.operationLog')" min-width="280" />
        <el-table-column prop="createTime" :label="$t('order.operationTime')" min-width="280" />
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="$constants.page.limit"
          :page-size="tableFromLog.limit"
          :current-page="tableFromLog.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableDataLog.total"
          @size-change="handleSizeChangeLog"
          @current-change="pageChangeLog"
        />
      </div>
    </el-dialog>

    <!--详情-->
    <details-from ref="orderDetail" :orderNo="orderNo" />

    <!-- 发送货 -->
    <order-send ref="send" :orderNo="orderNo" :secondType="secondType" @submitFail="handleSearchList"></order-send>

    <!-- 直接退款 -->
    <direct-refund
      v-if="dialogVisibleDirectRefund"
      :dialogVisibleDirectRefund="dialogVisibleDirectRefund"
      :type="type"
      @handlerSuccessClose="handlerSuccessClose"
      @handlerSuccessSubmit="handlerSuccessSubmit"
      :orderNo="orderNo"
    ></direct-refund>
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

import {
  orderStatusNumApi,
  orderListApi,
  orderLogApi,
  orderMarkApi,
  orderDeleteApi,
  orderPrint,
  orderDetailApi,
  writeUpdateApi,
  orderExcelApi,
  orderPrintReceiptApi,
} from '@/api/order';
import detailsFrom from './components/orderDetail';
import orderSend from './orderSend';
import Cookies from 'js-cookie';
import { isWriteOff } from '@/utils';
import { checkPermi } from '@/utils/permission';
import DirectRefund from '@/views/order/components/directRefund.vue';
import * as $constants from '@/utils/constants';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
let tableFroms = {
  status: 'all',
  dateLimit: '',
  orderNo: '',
  page: 1,
  limit: $constants.page.limit[0],
  type: '',
  searchType: 'all',
  content: '',
};
export default {
  name: 'orderlistDetails',
  components: {
    DirectRefund,
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
      dialogVisibleJI: false,
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
      selectionList: [],
      ids: '',
      orderids: '',
      cardLists: [],
      isWriteOff: isWriteOff(),
      proType: 0,
      active: false,
      card_select_show: false,
      checkAll: false,
      checkedCities: ['orderNo', 'nickName', 'payPrice', 'payType', 'orderStatus', 'orderTime'],
      columnData: ['orderNo', 'nickName', 'payPrice', 'payType', 'orderStatus', 'orderTime'],
      isIndeterminate: true,
      orderDatalist: null,
      merPrintStatus: Cookies.get('merPrint'), // 商家小票打印开关状态
      dialogVisibleDirectRefund: false,
      secondType: 0, //订单二级类型:0-普通订单，1-积分订单，2-虚拟订单，4-视频号订单，5-云盘订单，6-卡密订单
      type: 0, //订单类型
    };
  },
  mounted() {
    if (checkPermi(['merchant:order:page:list'])) this.getList();
    if (checkPermi(['merchant:order:status:num'])) this.getOrderStatusNum();
  },
  computed: {
    fromType() {
      this.$i18n.locale;
      return [
        { value: '', text: this.$t('common.all') },
        { value: '0', text: this.$t('order.normal') },
        { value: '1', text: this.$t('order.spike') },
        { value: '2', text: this.$t('order.groupBuy') },
      ];
    },
  },
  methods: {
    checkPermi,
    columnLabel(key) {
      const labels = {
        orderNo: this.$t('common.orderNo'),
        nickName: this.$t('order.nickName'),
        payPrice: this.$t('order.payPrice'),
        payType: this.$t('order.payType'),
        orderStatus: this.$t('order.orderStatus'),
        orderTime: this.$t('order.orderTime'),
      };
      return labels[key] || key;
    },
    normalizeCheckedColumns(saved) {
      if (!Array.isArray(saved) || !saved.length) return this.columnData.slice();
      const aliases = {
        订单号: 'orderNo',
        用户昵称: 'nickName',
        实际支付: 'payPrice',
        支付方式: 'payType',
        订单状态: 'orderStatus',
        下单时间: 'orderTime',
      };
      const mapped = saved.map((item) => (this.columnData.includes(item) ? item : aliases[item])).filter(Boolean);
      return mapped.length ? Array.from(new Set(mapped)) : this.columnData.slice();
    },
    //直接退款
    onDirectRefund(row) {
      this.orderNo = row.orderNo;
      this.type = row.type;
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
    // 核销订单
    onWriteOff(row) {
      this.$modalPrompt('text', this.$t('order.writeOffOrder'), null, this.$t('order.writeOffCode')).then((V) => {
        writeUpdateApi({ verifyCode: V }).then(() => {
          this.$message.success(this.$t('order.writeOffSuccess'));
          this.handleSearchList();
        });
      });
    },
    handleReset() {
      this.tableFrom.type = '';
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
        this.$modalSure(this.$t('order.userCancelledShipping')).then(() => {
          this.onSend(row);
        });
      } else {
        if (row.refundStatus == 1) return this.$message.error(this.$t('order.handleAfterSalesFirst'));
        this.onSend(row);
      }
    },
    handlePrintReceipt(row) {
      this.$modalSure(this.$t('order.confirmPrintReceipt')).then(() => {
        orderPrintReceiptApi(row.orderNo).then((data) => {
          this.$message.success(this.$t('order.receiptPrintSuccess'));
        });
      });
    },
    //发货操作
    onSend(row) {
      this.secondType = row.secondType;
      this.orderNo = row.orderNo;
      this.$refs.send.modals = true;
      //this.$refs.send.getList();
      this.$refs.send.orderProDetail(row.orderNo);
    },
    // 订单删除
    handleDelete(row, idx) {
      if (row.isDel) {
        this.$modalSure().then(() => {
          orderDeleteApi({ orderNo: row.orderNo }).then(() => {
            this.$message.success(this.$t('common.deleteSuccess'));
            handleDeleteTable(this.tableData.data.length, this.tableFrom);
            this.getList();
            this.getOrderStatusNum();
          });
        });
      } else {
        this.$confirm(this.$t('order.cannotDeleteUserOrders'), this.$t('common.tip'), {
          confirmButtonText: this.$t('common.confirmPrefix'),
          type: 'error',
        });
      }
    },
    // 详情
    onOrderDetails(id) {
      this.orderNo = id;
      this.$refs.orderDetail.getDetail(id);
      this.$refs.orderDetail.getOrderInvoiceList(id);
      this.$refs.orderDetail.dialogVisible = true;
    },
    getDetail(id) {
      this.loading = true;
      orderDetailApi(id)
        .then((res) => {
          this.orderDatalist = res;
          this.loading = false;
        })
        .catch(() => {
          this.orderDatalist = null;
          this.loading = false;
        });
    },
    // 订单记录
    onOrderLog(id) {
      this.dialogVisibleJI = true;
      this.LogLoading = true;
      this.tableFromLog.orderNo = id;
      orderLogApi(this.tableFromLog)
        .then((res) => {
          this.tableDataLog.data = res.list;
          this.tableDataLog.total = res.total;
          this.LogLoading = false;
        })
        .catch(() => {
          this.LogLoading = false;
        });
    },
    pageChangeLog(page) {
      this.tableFromLog.page = page;
      this.onOrderLog();
    },
    handleSizeChangeLog(val) {
      this.tableFromLog.limit = val;
      this.onOrderLog();
    },
    handleClose() {
      this.dialogVisible = false;
    },
    // 备注
    onOrderMark(row) {
      this.$modalPrompt('textarea', this.$t('common.remark'), row.merchantRemark, this.$t('order.orderRemark')).then((V) => {
        orderMarkApi({ remark: V, orderNo: row.orderNo }).then(() => {
          this.$message.success(this.$t('order.operationSuccess'));
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
      orderListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list || [];
          this.tableData.total = res.total;
          this.listLoading = false;
          this.checkedCities = this.normalizeCheckedColumns(
            this.$cache.local.has('order_stroge') ? this.$cache.local.getJSON('order_stroge') : this.checkedCities,
          );
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
      orderStatusNumApi(data).then((res) => {
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
    exports() {
      let data = {
        dateLimit: this.tableFrom.dateLimit,
        orderNo: this.tableFrom.orderNo,
        status: this.tableFrom.status,
        type: this.tableFrom.type,
      };
      orderExcelApi(data).then((res) => {
        window.open(res.fileName);
      });
    },
    handleAddItem() {
      if (this.card_select_show) {
        this.$set(this, 'card_select_show', false);
      } else if (!this.card_select_show) {
        this.$set(this, 'card_select_show', true);
      }
    },
    handleCheckAllChange(val) {
      this.checkedCities = val ? this.columnData.slice() : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.columnData.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnData.length;
    },
    checkSave() {
      this.$set(this, 'card_select_show', false);
      this.$modal.loading(this.$t('order.savingToLocal'));
      this.$cache.local.setJSON('order_stroge', this.checkedCities);
      setTimeout(this.$modal.closeLoading(), 1000);
    },
    //打印小票
    onOrderPrint(data) {
      orderPrint(data.orderNo)
        .then((res) => {
          this.$modal.msgSuccess(this.$t('order.printSuccess'));
        })
        .catch((error) => {
          this.$modal.msgError(error.message);
        });
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
  ::v-deep .label {
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

.card_abs {
  position: absolute;
  padding-bottom: 15px;
  top: 340px;
  right: 40px;
  width: 200px;
  background: #fff;
  z-index: 99999;
  box-shadow: 0px 0px 14px 0px rgba(0, 0, 0, 0.1);
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
