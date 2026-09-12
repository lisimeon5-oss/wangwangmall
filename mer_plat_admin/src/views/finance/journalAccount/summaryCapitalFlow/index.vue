<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:finance:summary:financial:statements']"
    >
      <div class="padding-add">
        <el-form size="small" inline @submit.native.prevent>
          <el-form-item :label="$t('product.timeSelectLabel')">
            <el-date-picker
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('product.customTime')"
              class="selWidth"
              @change="onchangeTime"
            />
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="getList(1)">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" shadow="never" :bordered="false">
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="small">
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column prop="incomeExpenditure" :label="$t('finance.dailyIncomeExpenseYuan')" min-width="100"></el-table-column>
        <el-table-column prop="incomeAmount" :label="$t('finance.platformIncomeAmountYuan')" min-width="100"></el-table-column>
        <el-table-column prop="payoutAmount" :label="$t('finance.platformExpenseAmountYuan')" min-width="100"></el-table-column>
        <el-table-column prop="rechargeAmount" :label="$t('finance.memberRechargeAmountYuan')" min-width="100"></el-table-column>
        <el-table-column prop="dataDate" :label="$t('finance.dateCol')" min-width="100" :show-overflow-tooltip="true" />
        <el-table-column
          :label="$t('common.operate')"
          width="70"
          fixed="right"
          v-hasPermi="['platform:finance:summary:financial:statements']"
        >
          <template slot-scope="scope">
            <a @click="onDetails(scope.row)">{{ $t('common.detail') }}</a>
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
    <el-dialog :title="$t('finance.financialFlowSummary')" :visible.sync="dialogVisible" width="1000px" :before-close="handleClose" center>
      <el-row align="middle" class="ivu-mt mt20">
        <el-col :span="3">
          <el-menu default-active="0" class="el-menu-vertical-demo">
            <el-menu-item :name="accountDetails.dataDate">
              <span>{{ accountDetails.dataDate }}</span>
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="21">
          <el-col :span="10">
            <div class="grid-content">
              <span class="card_title">{{ $t('finance.platformIncomeAmount') }}</span>
              <span class="card_title_price">฿{{ accountDetails.incomeAmount }}</span>
              <div class="list">
                <el-card
                  class="mb10"
                  body-style="background-color: #F9F9F9;padding: 20px 15px;"
                  shadow="never"
                  :bordered="false"
                >
                  <el-row class="item mb20">
                    <el-col :span="13" class="name">{{ $t('finance.memberRecharge') }}</el-col>
                    <el-col :span="11" class="cost mb10">
                      <span class="cost_price">฿{{ accountDetails.rechargeAmount }}</span>
                    </el-col>
                    <el-col :span="13" class="name">&nbsp;&nbsp;&nbsp;</el-col>
                    <el-col :span="11" class="cost">
                      <span class="cost_num">{{ accountDetails.rechargeNum }}{{ $t('finance.unitCount') }}</span>
                    </el-col>
                  </el-row>
                  <el-row class="item mb20">
                    <el-col :span="13" class="name">{{ $t('finance.wechatPay') }}</el-col>
                    <el-col :span="11" class="cost mb10">
                      <span class="cost_price">฿{{ accountDetails.wechatPayAmount }}</span>
                    </el-col>
                    <el-col :span="13" class="name">&nbsp;&nbsp;&nbsp;</el-col>
                    <el-col :span="11" class="cost">
                      <span class="cost_num">{{ accountDetails.wechatPayNum }}{{ $t('finance.unitCount') }}</span>
                    </el-col>
                  </el-row>
                  <el-row class="item">
                    <el-col :span="13" class="name">{{ $t('finance.alipayPay') }}</el-col>
                    <el-col :span="11" class="cost mb10">
                      <span class="cost_price">฿{{ accountDetails.aliPayAmount }}</span>
                    </el-col>
                    <el-col :span="13" class="name">&nbsp;&nbsp;&nbsp;</el-col>
                    <el-col :span="11" class="cost">
                      <span class="cost_num">{{ accountDetails.aliPayNum }}{{ $t('finance.unitCount') }}</span>
                    </el-col>
                  </el-row>
                </el-card>
              </div>
            </div>
            <el-divider direction="vertical" />
          </el-col>
          <el-col :span="10">
            <div class="grid-content">
              <span class="card_title">{{ $t('finance.platformExpenseAmount') }}</span>
              <span class="card_title_price">฿{{ accountDetails.payoutAmount }}</span>
              <div class="list">
                <el-card body-style="background-color: #F9F9F9;padding: 20px 15px;" shadow="never" :bordered="false">
                  <el-row class="item mb20">
                    <el-col :span="13" class="name">{{ $t('finance.merchantShareSettlement') }}</el-col>
                    <el-col :span="11" class="cost mb10">
                      <span class="cost_price">฿{{ accountDetails.merchantSplitSettlement }}</span>
                    </el-col>
                    <el-col :span="13" class="name">&nbsp;&nbsp;&nbsp;</el-col>
                    <el-col :span="11" class="cost">
                      <span class="cost_num">{{ accountDetails.merchantSplitSettlementNum }}{{ $t('finance.unitCount') }}</span>
                    </el-col>
                  </el-row>
                  <el-row class="item mb20">
                    <el-col :span="13" class="name">{{ $t('finance.commissionWithdrawSettlement') }}</el-col>
                    <el-col :span="11" class="cost mb10">
                      <span class="cost_price">฿{{ accountDetails.brokerageSettlement }}</span>
                    </el-col>
                    <el-col :span="13" class="name">&nbsp;&nbsp;&nbsp;</el-col>
                    <el-col :span="11" class="cost">
                      <span class="cost_num">{{ accountDetails.brokerageSettlementNum }}{{ $t('finance.unitCount') }}</span>
                    </el-col>
                  </el-row>
                  <el-row class="item">
                    <el-col :span="13" class="name">{{ $t('finance.orderRefund') }}</el-col>
                    <el-col :span="11" class="cost mb10">
                      <span class="cost_price">฿{{ accountDetails.orderRefundAmount }}</span>
                    </el-col>
                    <el-col :span="13" class="name">&nbsp;&nbsp;&nbsp;</el-col>
                    <el-col :span="11" class="cost">
                      <span class="cost_num">{{ accountDetails.orderRefundNum }}{{ $t('finance.unitCount') }}</span>
                    </el-col>
                  </el-row>
                </el-card>
              </div>
            </div>
            <el-divider direction="vertical" />
          </el-col>
          <el-col :span="4">
            <div class="grid-content center">
              <div class="card_title mb20">{{ $t('finance.dailyIncomeExpense') }}</div>
              <div class="color_gray">฿{{ accountDetails.incomeExpenditure }}</div>
            </div>
          </el-col>
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button type="primary" size="small" @click="dialogVisible = false">{{ $t('finance.iKnow') }}</el-button>
      </span>
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
import { statementsApi } from '@/api/finance';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'summaryCapitalFlow',
  data() {
    return {
      timeVal: [],
      listLoading: true,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        dateLimit: '',
      },
      dialogVisible: false,
      accountDetails: {},
      fromList: this.$constants.fromList,
    };
  },
  mounted() {
    if (checkPermi(['platform:finance:summary:financial:statements'])) this.getList(1);
  },
  methods: {
    checkPermi,
    // 选择时间
    selectChange(tab) {
      this.tableFrom.dateLimit = tab;
      this.timeVal = [];
      this.getList(1);
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = e ? this.timeVal.join(',') : '';
      this.getList(1);
    },
    handleClick() {
      this.tableFrom.dateLimit = '';
      this.timeVal = [];
      this.getList(1);
    },
    onDetails(date) {
      this.dialogVisible = true;
      this.accountDetails = date;
    },
    seachList() {
      this.handleClose();
      this.getList(1);
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      statementsApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
        });
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList(1);
    },
    handleClose() {
      this.dialogVisible = false;
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure().then(() => {
        storeApi.brandDeleteApi(id).then((res) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.$store.commit('merchant/SET_MerchantClassify', []);
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    onchangeIsShow(row) {
      activityApi.activitySwitchApi(row.id).then((res) => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep.el-divider {
  background-color: #f5f5f5;
}
.center {
  text-align: center;
  .color_gray {
    color: #e93323 !important;
    line-height: 20px;
    font-weight: 600;
    font-size: 20px;
  }
}
.card_title {
  padding: 3px 0;
  font-weight: 600;
  color: #606060;
  line-height: 15px;
  font-size: 15px;
}
.card_title_price {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  float: right;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.tabBox_tit {
  width: 60%;
  font-size: 12px !important;
  margin: 0 2px 0 10px;
  letter-spacing: 1px;
  padding: 5px 0;
  box-sizing: border-box;
}
.el-menu-item {
  font-weight: bold;
  color: #333;
}
//::v-deep.el-dialog__header {
//  text-align: left;
//}
.el-col {
  position: relative;
  .el-divider--vertical {
    position: absolute;
    height: 100%;
    right: 0;
    top: 0;
    margin: 0;
  }
}
.grid-content {
  padding: 0 15px;
  display: block;
  .title,
  .color_red,
  .color_gray {
    display: block;
    line-height: 20px;
  }
  .color_red {
    color: red;
    font-weight: bold;
  }
  .color_gray {
    color: #333;
    font-weight: bold;
  }
  .count {
    font-size: 12px;
  }
  .list {
    margin-top: 20px;
    .item {
      overflow: hidden;
    }
    .name {
      color: #909399;
    }
    .name,
    .cost {
      line-height: 20px;
    }
    .cost {
      text-align: right;
      span {
        display: block;
      }
    }
    .name,
    .cost_count {
      font-size: 12px;
    }
    .cost_price,
    .cost_num {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
