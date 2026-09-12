<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-if="checkPermi(['merchant:refund:order:page:list'])"
    >
      <div class="padding-add">
        <el-form size="small" inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('order.refundOrderNoLabel')">
            <el-input
              v-model.trim="tableFrom.refundOrderNo"
              :placeholder="$t('order.pleaseEnterRefundOrderNo')"
              class="form_content_width"
              size="small"
              clearable
              @keyup.enter.native="handleSearchList"
            >
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('order.orderNoLabel')" label-width="66px">
            <el-input
              v-model.trim="tableFrom.orderNo"
              :placeholder="$t('finance.pleaseEnterOrderNo')"
              class="form_content_width"
              size="small"
              clearable
            >
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('order.timeSelect')">
            <el-date-picker
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              range-separator="-"
              :start-placeholder="$t('finance.startDate')"
              :end-placeholder="$t('finance.endDate')"
              class="form_content_width"
              @change="onchangeTime"
            />
          </el-form-item>
          <el-form-item :label="$t('order.userSearch')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item :label="$t('order.returnLogistics')" label-width="66px">
            <el-input
              v-model.trim="tableFrom.trackingNumber"
              :placeholder="$t('order.pleaseEnterTrackingNo')"
              class="selWidth"
              size="small"
              clearable
              @keyup.enter.native="handleSearchList"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearchList">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs class="list-tabs" v-model="tableFrom.refundStatus" @tab-click="handleSearchList">
        <el-tab-pane name="9" :label="`${$t('common.all')}(${orderChartType.all || 0})`"></el-tab-pane>
        <el-tab-pane name="0" :label="`${$t('order.pendingAudit')}(${orderChartType.await || 0})`"></el-tab-pane>
        <el-tab-pane name="2" :label="`${$t('order.refunding')}(${orderChartType.refunding || 0})`"></el-tab-pane>
        <el-tab-pane name="4" :label="`${$t('order.userReturning')}(${orderChartType.awaitReturning || 0})`"></el-tab-pane>
        <el-tab-pane name="5" :label="`${$t('order.merchantAwaitingReceipt')}(${orderChartType.awaitReceiving || 0})`"></el-tab-pane>
        <el-tab-pane name="6" :label="`${$t('order.revoked')}(${orderChartType.revoke || 0})`"></el-tab-pane>
        <el-tab-pane name="1" :label="`${$t('order.auditRejected')}(${orderChartType.reject || 0})`"></el-tab-pane>
        <el-tab-pane name="3" :label="`${$t('order.refunded')}(${orderChartType.refunded || 0})`"></el-tab-pane>
      </el-tabs>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        size="small"
        class="table mt5"
        highlight-current-row
        :row-key="
          (row) => {
            return row.refundOrderNo;
          }
        "
      >
        <el-table-column :label="$t('order.refundOrderNo')" min-width="185" v-if="checkedCities.includes('refundOrderNo')">
          <template slot-scope="scope">
            <div class="acea-row">
              <span v-show="scope.row.type === 1" class="iconfont icon-shipinhao mr5" style="color: #f6ae02"></span>
              <span style="display: block" v-text="scope.row.refundOrderNo" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" :label="$t('common.orderNo')" min-width="180" v-if="checkedCities.includes('orderNo')" />
        <el-table-column
          prop="userNickName"
          :label="$t('order.nickName')"
          min-width="180"
          v-if="checkedCities.includes('nickName')"
        />
        <el-table-column
          prop="refundPrice"
          :label="$t('order.refundPrice')"
          min-width="100"
          v-if="checkedCities.includes('refundPrice')"
        />
        <el-table-column :label="$t('order.refundStatus')" min-width="100" v-if="checkedCities.includes('refundStatus')">
          <template slot-scope="scope">
            <span :class="tagClass[scope.row.refundStatus]" class="tag-padding">{{
              scope.row.refundStatus | refundStatusFilter
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('order.afterSalesType')" min-width="100" v-if="checkedCities.includes('afterSalesType')">
          <template slot-scope="scope">
            <span>{{ scope.row.afterSalesType === 1 ? $t('order.onlyRefund') : $t('order.returnRefund') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('order.returnType')" min-width="100" v-if="checkedCities.includes('returnType')">
          <template slot-scope="scope">
            <span>{{
              scope.row.returnGoodsType === 0 ? $t('order.noReturn') : scope.row.returnGoodsType === 1 ? $t('order.expressReturn') : $t('order.storeReturn')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('order.compulsoryRefund')" min-width="100" v-if="checkedCities.includes('compulsoryRefund')">
          <template slot-scope="scope">
            <span>{{ scope.row.isCompulsoryRefund ? $t('common.yes') : $t('order.notYes') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('order.createTime')" min-width="150" v-if="checkedCities.includes('createTime')" />
        <el-table-column width="190" fixed="right">
          <template slot="header">
            <p>
              <span style="padding-right: 5px">{{ $t('common.operate') }}</span>
              <i class="el-icon-setting" @click="handleAddItem"></i>
            </p>
          </template>
          <!--  售后状态：0:待审核 1:商家拒绝 2：退款中 3:已退款 4:用户退货 5:商家待收货 6:已撤销 9:全部-->
          <template slot-scope="scope">
            <a
              v-if="
                scope.row.refundStatus !== 0 &&
                scope.row.refundStatus !== 5 &&
                checkPermi(['merchant:refund:order:detail'])
              "
              @click="onOrderDetails(scope.row)"
              >{{ $t('common.detail') }}</a
            >
            <template v-if="scope.row.refundStatus === 0 && checkPermi(['merchant:refund:order:audit'])">
              <a @click="handleApprovedReview(scope.row)">{{ $t('order.agree') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template v-if="scope.row.refundStatus === 0 && checkPermi(['merchant:refund:order:audit'])">
              <a @click="handleOrderRefuse(scope.row)">{{ $t('order.reject') }}</a>
            </template>
            <template v-if="scope.row.refundStatus === 5 && checkPermi(['merchant:refund:order:receiving:reject'])">
              <a @click="handleRefuseReceipt(scope.row)">{{ $t('order.reject') }}</a>
            </template>
            <template v-if="scope.row.refundStatus === 5 && checkPermi(['merchant:refund:order:receiving'])">
              <el-divider direction="vertical"></el-divider>
              <a
                v-debounceClick="
                  () => {
                    handleConfirmReceipt(scope.row.refundOrderNo);
                  }
                "
                >{{ $t('order.confirmReceipt') }}</a
              >
            </template>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown trigger="click" v-if="scope.row.refundStatus === 0 || scope.row.refundStatus === 5">
              <span class="el-dropdown-link"> {{ $t('order.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-if="checkPermi(['merchant:refund:order:detail'])"
                  @click.native="onOrderDetails(scope.row)"
                  >{{ $t('common.detail') }}
                </el-dropdown-item>
                <el-dropdown-item
                  @click.native="onOrderMark(scope.row)"
                  v-if="checkPermi(['merchant:refund:order:mark'])"
                  >{{ $t('common.remark') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <a
              @click="onOrderMark(scope.row)"
              v-if="
                checkPermi(['merchant:refund:order:mark']) &&
                scope.row.refundStatus !== 0 &&
                scope.row.refundStatus !== 5
              "
              >{{ $t('common.remark') }}</a
            >
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
    <el-card class="box-card" shadow="never" :bordered="false"> </el-card>
    <div class="card_abs" v-show="card_select_show">
      <template>
        <div class="cell_ht">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"
            >{{ $t('common.selectAll') }}
          </el-checkbox>
          <el-button type="text" @click="checkSave()">{{ $t('common.save') }}</el-button>
        </div>
        <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="item in columnData" :label="item" :key="item" class="check_cell">{{ columnLabel(item) }}</el-checkbox>
        </el-checkbox-group>
      </template>
    </div>
    <!--退款详情-->
    <refund-order-detail
      ref="orderDetail"
      :drawerVisible="drawerVisible"
      :refundOrderNo="refundOrderNo"
      v-if="drawerVisible"
      @onClosedrawerVisible="onClosedrawerVisible"
      @getReviewSuccessful="getReviewSuccessful"
    ></refund-order-detail>

    <!-- 同意退款,退货退款-->
    <el-dialog
      :title="$t('order.agreeRefund')"
      :visible.sync="dialogVisibleAgreeToReturn"
      width="900px"
      :before-close="handleCloseAgreeToReturn"
      class="dialog-bottom"
    >
      <agree-to-return
        ref="agreeToReturn"
        @onHandleCancel="handleCloseAgreeToReturn"
        @onHandleSuccess="handleSuccess"
        :refundInfo="refundInfo"
        v-if="dialogVisibleAgreeToReturn"
      ></agree-to-return>
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

import {
  refundStatusNumApi,
  refundListApi,
  refundMarkApi,
  orderPrint,
  orderAuditApi,
  refundOrderReceivingRejectApi,
  orderExcelApi,
} from '@/api/order';
import { isWriteOff } from '@/utils';
import { checkPermi } from '@/utils/permission';
import RefundOrderDetail from '../components/refundOrderDetail.vue';
import { refundStatusFilter } from '@/filters';
import useRefundOrder from '@/libs/useRefundOrder';
import AgreeToReturn from '@/views/order/components/agreeToReturn.vue';
import * as $constants from '@/utils/constants';
const { onConfirmReceipt, onApprovedReview } = useRefundOrder();
const tableFroms = {
  refundStatus: '9',
  dateLimit: '',
  orderNo: '',
  refundOrderNo: '',
  page: 1,
  limit: $constants.page.limit[0],
  searchType: 'all',
  content: '',
  trackingNumber: '',
};
// 权限判断函数
export default {
  name: 'orderRefund',
  components: {
    AgreeToReturn,
    RefundOrderDetail,
  },
  data() {
    return {
      datekey: Date.now(),
      RefuseData: {},
      refundOrderNo: '', //退款单号
      refundData: {},
      tableDataLog: {
        data: [],
        total: 0,
      },
      LogLoading: false,
      isCreate: 1,
      editData: null,
      dialogVisible: false,
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: true,
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
      checkedCities: [
        'refundOrderNo',
        'orderNo',
        'nickName',
        'refundPrice',
        'refundStatus',
        'afterSalesType',
        'returnType',
        'compulsoryRefund',
        'createTime',
      ],
      columnData: [
        'refundOrderNo',
        'orderNo',
        'nickName',
        'refundPrice',
        'refundStatus',
        'afterSalesType',
        'returnType',
        'compulsoryRefund',
        'createTime',
      ],
      isIndeterminate: true,
      dialogVisibleAgreeToReturn: false,
      refundInfo: null,
      drawerVisible: false,
      tagClass: ['doingTag', 'notStartTag', 'doingTag', 'endTag', 'notStartTag', 'doingTag', 'endTag'],
    };
  },
  mounted() {
    if (checkPermi(['merchant:refund:order:page:list'])) this.getList();
    if (checkPermi(['merchant:refund:order:status:num'])) this.getOrderStatusNum();
  },
  methods: {
    checkPermi,
    columnLabel(key) {
      const labels = {
        refundOrderNo: this.$t('order.refundOrderNo'),
        orderNo: this.$t('common.orderNo'),
        nickName: this.$t('order.nickName'),
        refundPrice: this.$t('order.refundPrice'),
        refundStatus: this.$t('order.refundStatus'),
        afterSalesType: this.$t('order.afterSalesType'),
        returnType: this.$t('order.returnType'),
        compulsoryRefund: this.$t('order.compulsoryRefund'),
        createTime: this.$t('order.createTime'),
      };
      return labels[key] || key;
    },
    normalizeCheckedColumns(saved) {
      if (!Array.isArray(saved) || !saved.length) return this.columnData.slice();
      const aliases = {
        退款单号: 'refundOrderNo',
        订单号: 'orderNo',
        用户昵称: 'nickName',
        退款金额: 'refundPrice',
        退款状态: 'refundStatus',
        售后类型: 'afterSalesType',
        退货类型: 'returnType',
        强制退款: 'compulsoryRefund',
        创建时间: 'createTime',
      };
      const mapped = saved.map((item) => (this.columnData.includes(item) ? item : aliases[item])).filter(Boolean);
      return mapped.length ? Array.from(new Set(mapped)) : this.columnData.slice();
    },
    //商家确认收货
    handleConfirmReceipt(refundOrderNo) {
      onConfirmReceipt(refundOrderNo).then(() => {
        this.handleSearchList();
      });
    },
    //审核同意
    handleApprovedReview(row) {
      if (row.returnGoodsType !== 1) {
        onApprovedReview({
          auditType: 'success',
          refundOrderNo: row.refundOrderNo,
        }).then(() => {
          this.handleSearchList();
        });
      } else {
        //退货退款
        this.refundInfo = row;
        this.dialogVisibleAgreeToReturn = true;
      }
    },
    //审核成功回调
    handleSuccess() {
      this.dialogVisibleAgreeToReturn = false;
      this.handleSearchList();
    },
    //同意弹窗
    handleCloseAgreeToReturn() {
      this.dialogVisibleAgreeToReturn = false;
    },
    //审核拒绝
    handleOrderRefuse(row) {
      this.$modalPrompt('textarea', this.$t('order.rejectRefundReason'), null).then((V) => {
        orderAuditApi({ auditType: 'refuse', reason: V, refundOrderNo: row.refundOrderNo }).then(() => {
          this.$message.success(this.$t('common.auditSuccess'));
          this.handleSearchList();
        });
      });
    },
    //拒绝收货
    handleRefuseReceipt(row) {
      this.$modalPrompt('textarea', this.$t('order.rejectReceiptReason'), null).then((V) => {
        refundOrderReceivingRejectApi({ reason: V, refundOrderNo: row.refundOrderNo }).then(() => {
          this.$message.success(this.$t('order.rejectReceiptSuccess'));
          this.handleSearchList();
        });
      });
    },
    //重置
    handleReset() {
      this.tableFrom.dateLimit = '';
      this.tableFrom.orderNo = '';
      this.tableFrom.refundOrderNo = '';
      this.tableFrom.content = '';
      this.tableFrom.searchType = 'all';
      this.tableFrom.trackingNumber = '';
      this.selectChange();
    },
    //搜索
    handleSearchList() {
      this.tableFrom.page = 1;
      this.getList();
      this.getOrderStatusNum();
    },
    onClosedrawerVisible() {
      this.drawerVisible = false;
    },
    //详情中审核成功回调
    getReviewSuccessful() {
      this.handleSearchList();
    },
    // 详情
    onOrderDetails(row) {
      this.refundOrderNo = row.refundOrderNo;
      this.drawerVisible = true;
    },
    // 备注
    onOrderMark(row) {
      this.$modalPrompt('textarea', this.$t('common.remark'), row.merRemark, this.$t('order.refundOrderRemark')).then((V) => {
        refundMarkApi({ remark: V, refundOrderNo: row.refundOrderNo }).then(() => {
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
      this.handleSearchList();
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = e ? this.timeVal.join(',') : '';
      this.handleSearchList();
    },
    // 列表
    getList() {
      this.listLoading = true;
      refundListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list || [];
          this.tableData.total = res.total;
          this.listLoading = false;
          this.checkedCities = this.normalizeCheckedColumns(
            this.$cache.local.has('order_refund_stroge')
              ? this.$cache.local.getJSON('order_refund_stroge')
              : this.checkedCities,
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
      delete data.refundStatus;
      refundStatusNumApi(data).then((res) => {
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
        refundStatus: this.tableFrom.status,
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
      this.$cache.local.setJSON('order_refund_stroge', this.checkedCities);
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
.red {
  color: #ed4014;
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
  top: 255px;
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
