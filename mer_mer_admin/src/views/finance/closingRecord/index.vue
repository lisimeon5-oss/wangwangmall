<template>
  <div class="divBox">
    <el-card
      v-hasPermi="['merchant:finance:closing:page:list']"
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form size="small" inline label-position="right" @submit.native.prevent>
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
              class="selWidth"
              @change="onchangeTime"
            />
          </el-form-item>
          <el-form-item :label="$t('finance.auditStatusLabel')">
            <el-select
              v-model="tableFrom.auditStatus"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option :label="$t('common.all')" value=""> </el-option>
              <el-option :label="$t('order.pendingAudit')" value="0"></el-option>
              <el-option :label="$t('finance.audited')" value="1"></el-option>
              <el-option :label="$t('common.auditFailed')" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('finance.accountStatusLabel')">
            <el-select
              v-model="tableFrom.accountStatus"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option v-for="item in arrivalStatusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('finance.closingTypeLabel')">
            <el-select
              v-model="tableFrom.closingType"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option v-for="item in closingTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('finance.closingNoLabel')">
            <el-input
              v-model.trim="tableFrom.closingNo"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('finance.pleaseEnterSettlementNo')"
              class="selWidth"
              size="small"
            ></el-input>
            <!--<el-button size="small" type="primary" icon="el-icon-top" @click="exportRecord">列表导出</el-button>-->
            <!--<el-button size="small" type="primary" @click="getExportFileList">{{ $t('finance.exportRecords') }}</el-button>-->
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-button
        size="small"
        type="primary"
        @click="applyTransfer"
        v-hasPermi="['merchant:finance:closing:base:info', 'merchant:finance:closing:apply']"
      >
        {{ $t('finance.applySettlement') }}
      </el-button>
      <el-table
        v-loading="listLoading"
        tooltip-effect="dark"
        :data="tableData.data"
        style="width: 100%"
        class="table mt20"
      >
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column prop="amount" :label="$t('finance.transferAmountYuan')" min-width="120" />
        <el-table-column :label="$t('finance.auditorName')" min-width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.auditName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('finance.closingType')" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.closingType | transferTypeFilter }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('finance.auditStatusLabel')" min-width="120">
          <template slot-scope="scope">
            <span
              class="tag-background tag-padding"
              :class="scope.row.auditStatus == 0 ? 'doingTag' : scope.row.auditStatus == 1 ? 'endTag' : 'notStartTag'"
              >{{ scope.row.auditStatus == 0 ? $t('order.pendingAudit') : scope.row.auditStatus == 1 ? $t('finance.auditPassed') : $t('common.auditFailed') }}</span
            >
            <span v-if="scope.row.auditStatus === 2 && scope.row.refusal" style="font-size: 12px">
              <br />
              {{ $t('common.reasonLabel') }}{{ scope.row.refusal }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('finance.accountStatus')" min-width="120">
          <template slot-scope="scope">
            <span class="tag-background tag-padding" :class="scope.row.accountStatus == 1 ? 'endTag' : 'notStartTag'">{{
              scope.row.accountStatus == 1 ? $t('finance.arrived') : $t('finance.notArrived')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('finance.auditTimeLabel')" min-width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.auditTime | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('finance.applyTime')" min-width="120" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('common.operate')" width="70" fixed="right">
          <template slot-scope="scope">
            <a v-hasPermi="['merchant:finance:transfer:base:info']" @click="transferDetail(scope.row.closingNo)"
              >{{ $t('finance.settlementInfo') }}</a
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
    <!--结算信息-->
    <el-dialog v-if="dialogVisible" :title="$t('finance.settlementInfo')" :visible.sync="dialogVisible" width="700px">
      <div class="box-container" v-loading="loading">
        <div class="acea-row">
          <div class="list sp100"><label class="name">{{ $t('finance.closingAmountLabel') }}</label>{{ closingData.amount || '-' }}</div>
          <div class="list sp100">
            <label class="name">{{ $t('finance.merchantCollectionMethodLabel') }}</label>{{ closingData.closingType | transferTypeFilter }}
          </div>
          <template v-if="closingData.closingType === 'bank'">
            <div class="list sp100"><label class="name">{{ $t('finance.bankNameLabel') }}</label>{{ closingData.closingBank || '-' }}</div>
            <div class="list sp100"><label class="name">{{ $t('finance.bankAccountLabel') }}</label>{{ closingData.closingBankCard || '-' }}</div>
            <div class="list sp100"><label class="name">{{ $t('finance.accountHolderLabel') }}</label>{{ closingData.closingName || '-' }}</div>
          </template>
          <div class="list sp100" v-if="closingData.closingType !== 'bank'">
            <label class="name">{{ $t('finance.realNameLabel') }}</label>{{ closingData.realName || '-' }}
          </div>
          <div class="list sp100" v-if="closingData.closingType === 'wechat'">
            <label class="name">{{ $t('finance.wechatNoLabel') }}</label>{{ closingData.wechatNo || '-' }}
          </div>
          <div class="list sp100" v-if="closingData.closingType === 'alipay'">
            <label class="name">{{ $t('finance.alipayAccountLabel') }}</label>{{ closingData.alipayAccount || '-' }}
          </div>
          <div v-if="closingData.closingType !== 'bank' && closingData.paymentCode" class="list sp100 acea-row">
            <label class="name">{{ $t('finance.collectionQrCodeLabel') }}</label>
            <div class="demo-image__preview">
              <el-image
                v-if="closingData.closingType !== 'bank'"
                :src="closingData.paymentCode"
                :preview-src-list="[closingData.paymentCode]"
              ></el-image>
            </div>
          </div>
          <div class="list sp100">
            <label class="name">{{ $t('finance.auditStatusLabel') }}</label
            >{{ closingData.auditStatus == 0 ? $t('order.pendingAudit') : closingData.auditStatus == 1 ? $t('finance.audited') : $t('common.auditFailed') }}
          </div>
          <div v-if="closingData.auditStatus == 1 && closingData.auditTime" class="list sp100">
            <label class="name">{{ $t('finance.auditTimeLabel') }}</label>{{ closingData.auditTime || '-' }}
          </div>
          <div v-if="closingData.closingProof" class="list sp100 acea-row">
            <label class="name">{{ $t('finance.closingVoucherLabel') }}</label>
            <div v-if="closingData.closingProof" class="acea-row">
              <div v-for="(item, index) in closingData.closingProof" :key="index" class="pictrue">
                <img @click="getPicture(item)" :src="item" />
              </div>
            </div>
          </div>
          <div v-if="closingData.auditStatus == 1 && closingData.transferTime" class="list sp100">
            <label class="name">{{ $t('finance.closingTimeLabel') }}</label>{{ closingData.closingTime || '-' }}
          </div>
          <div v-if="closingData.auditStatus == 2 && closingData.refusalReason" class="list sp100">
            <label class="name">{{ $t('finance.rejectReasonLabel') }}</label>{{ closingData.refusalReason || '-' }}
          </div>
          <div class="list sp100" v-show="closingData.mark">
            <label class="name">{{ $t('common.remark') }}：</label>{{ closingData.mark || '-' }}
          </div>
        </div>
      </div>
    </el-dialog>
    <!--申请结算-->
    <el-dialog v-if="transferDialogVisible" :title="$t('finance.applySettlement')" :visible.sync="transferDialogVisible" width="700px">
      <div class="box-container" v-loading="loadingBaseInfo">
        <div class="acea-row">
          <div class="list el-form-item el-form-item--mini sp100">
            <label class="el-form-item__label wid112">{{ $t('finance.merchantBalanceLabel') }}</label>
            <div class="el-form-item__content ml100">{{ transferBaseInfo.balance || '-' }}{{ $t('finance.yuan') }}</div>
          </div>
          <div class="list el-form-item el-form-item--mini sp100">
            <label class="el-form-item__label wid112">{{ $t('finance.withdrawableAmountLabel') }}</label>
            <div class="el-form-item__content ml100">{{ transferBaseInfo.transferBalance || '-' }}{{ $t('finance.yuan') }}</div>
          </div>
          <div class="list el-form-item el-form-item--mini sp100">
            <label class="el-form-item__label wid112">{{ $t('finance.frozenAmountLabel') }}</label>
            <div class="el-form-item__content ml100">{{ transferBaseInfo.freezeAmount || '-' }}{{ $t('finance.yuan') }}</div>
          </div>
          <div class="list el-form-item el-form-item--mini sp100">
            <label class="el-form-item__label wid112">{{ $t('finance.guaranteedAmountLabel') }}</label>
            <div class="el-form-item__content ml100">{{ transferBaseInfo.guaranteedAmount || '-' }}{{ $t('finance.yuan') }}</div>
          </div>
          <div class="list el-form-item el-form-item--mini sp100">
            <label class="el-form-item__label wid112">{{ $t('finance.closingTypeLabel') }}</label>
            <div class="el-form-item__content ml100">
              {{ transferBaseInfo.settlementType | transferTypeFilter }}
            </div>
          </div>
          <el-form ref="baseInfoform" :model="baseInfoform" label-width="112px" size="mini">
            <div class="sp100">
              <el-form-item :label="$t('finance.closingTypeLabel')">
                <el-radio-group v-model="transferBaseInfo.settlementType">
                  <el-radio label="bank">{{ $t('finance.bankCard') }}</el-radio>
                  <el-radio label="wechat">{{ $t('order.wechat') }}</el-radio>
                  <el-radio label="alipay">{{ $t('order.alipay') }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
            <div v-if="transferBaseInfo.settlementType !== 'bank'" class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.realNameLabel') }}</label>
              <div class="el-form-item__content ml100">
                {{ transferBaseInfo.realName || '-' }}
              </div>
            </div>
          </el-form>
          <template v-if="transferBaseInfo.settlementType === 'bank'">
            <div class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.accountHolderLabel') }}</label>
              <div class="el-form-item__content ml100">
                {{ transferBaseInfo.bankUserName || '-' }}
              </div>
            </div>
            <div class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.bankNameLabel') }}</label>
              <div class="el-form-item__content ml100">
                {{ transferBaseInfo.bankName || '-' }}
              </div>
            </div>
            <div class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.bankAccountLabel') }}</label>
              <div class="el-form-item__content ml100">
                {{ transferBaseInfo.bankCard || '-' }}
              </div>
            </div>
          </template>
          <template v-else-if="transferBaseInfo.settlementType === 'alipay'">
            <div class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.alipayAccountLabel') }}</label>
              <div class="el-form-item__content ml100">
                {{ transferBaseInfo.alipayCode || '-' }}
              </div>
            </div>
            <div class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.alipayQrLabel') }}</label>
              <div class="el-form-item__content ml100">
                <div class="demo-image__preview">
                  <el-image
                    style="width: 36px; height: 36px"
                    :src="transferBaseInfo.alipayQrcodeUrl"
                    :preview-src-list="[transferBaseInfo.alipayQrcodeUrl]"
                  />
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.wechatAccountLabel') }}</label>
              <div class="el-form-item__content ml100">
                {{ transferBaseInfo.wechatCode || '-' }}
              </div>
            </div>
            <div class="list el-form-item el-form-item--mini sp100">
              <label class="el-form-item__label wid112">{{ $t('finance.wechatQrLabel') }}</label>
              <div class="el-form-item__content ml100">
                <div class="demo-image__preview">
                  <el-image
                    style="width: 36px; height: 36px"
                    :src="transferBaseInfo.wechatQrcodeUrl"
                    :preview-src-list="[transferBaseInfo.wechatQrcodeUrl]"
                  />
                </div>
              </div>
            </div>
          </template>
          <el-form ref="baseInfoform" :model="baseInfoform" label-width="112px" size="mini">
            <div class="sp100">
              <el-form-item
                :label="$t('finance.applicationAmountLabel')"
                :rules="[{ required: true, message: $t('finance.pleaseEnterApplicationAmount'), trigger: 'blur' }]"
              >
                <el-input-number v-model.trim="baseInfoform.amount" :min="1" :max="99999"></el-input-number>
              </el-form-item>
            </div>
            <div class="sp100">
              <el-form-item :label="$t('finance.amountDescriptionLabel')" class="transferMinAmount">
                <el-alert
                  effect="dark"
                  :closable="false"
                  :title="
                    transferBaseInfo.transferMinAmount || transferBaseInfo.transferMaxAmount
                      ? $t('finance.withdrawalLimitRange', {
                          min: transferBaseInfo.transferMinAmount || 0,
                          max: transferBaseInfo.transferMaxAmount || 0,
                        })
                      : $t('finance.withdrawalLimitUnlimited')
                  "
                  type="warning"
                >
                </el-alert>
              </el-form-item>
            </div>
            <div class="sp100">
              <el-form-item :label="`${$t('common.remark')}: `" label-width="105px">
                <el-input
                  v-model.trim="baseInfoform.mark"
                  style="margin-left: 7px"
                  type="textarea"
                  :rows="2"
                ></el-input>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
      <div slot="footer">
        <el-button
          :disabled="parseFloat(transferBaseInfo.transferBalance) < parseFloat(transferBaseInfo.transferMinAmount)"
          type="primary"
          @click="submitForm('baseInfoform')"
          :loading="btnLoading"
          v-hasPermi="['merchant:finance:closing:apply']"
          >{{ $t('finance.applyNow') }}</el-button
        >
      </div>
    </el-dialog>
    <!--查看二维码-->
    <el-dialog v-if="pictureVisible" :visible.sync="pictureVisible" width="700px">
      <img :src="pictureUrl" style="width: 100%" />
    </el-dialog>
    <!--导出订单列表-->
    <!--<file-list ref="exportList" />-->
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
  closingRecordListApi,
  closingBaseInfoApi,
  closingApplyApi,
  closingDetailApi,
  transferRecordsExportApi,
} from '@/api/finance';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  name: 'transferAccount',
  data() {
    return {
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: false,
      tableFrom: {
        dateLimit: '',
        page: 1,
        limit: this.$constants.page.limit[0],
        closingNo: '',
        auditStatus: '',
        accountStatus: '',
        closingType: '',
      },
      timeVal: [],
      fromList: this.$constants.fromList,
      loading: false,
      dialogVisible: false,
      pictureVisible: false,
      closingData: {},
      transferDialogVisible: false,
      loadingBaseInfo: false,
      transferBaseInfo: {},
      baseInfoform: {
        amount: 1,
        mark: '',
        closingType: '',
      },
      btnLoading: false,
    };
  },
  computed: {
    arrivalStatusList() {
      return [
        { label: this.$t('finance.arrived'), value: 1 },
        { label: this.$t('finance.notArrived'), value: 0 },
      ];
    },
    closingTypeList() {
      return [
        { label: this.$t('finance.bankCard'), value: 'bank' },
        { label: this.$t('order.wechat'), value: 'wechat' },
        { label: this.$t('order.alipay'), value: 'alipay' },
      ];
    },
  },
  mounted() {
    if (checkPermi(['merchant:finance:closing:page:list'])) this.getList(1);
  },
  methods: {
    checkPermi,
    // 转账信息
    transferDetail(id) {
      this.dialogVisible = true;
      this.loading = true;
      closingDetailApi(id)
        .then((res) => {
          this.closingData = res;
          this.closingData.closingProof = JSON.parse(res.closingProof);
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    // 查看图片
    getPicture(url) {
      this.pictureVisible = true;
      this.pictureUrl = url;
    },
    submitForm(formName) {
      this.baseInfoform.closingType = this.transferBaseInfo.settlementType;
      if (parseFloat(this.baseInfoform.amount) < parseFloat(this.transferBaseInfo.transferMinAmount))
        return this.$message.warning(
          this.$t('finance.minWithdrawalWarning', { min: this.transferBaseInfo.transferMinAmount }),
        );
      if (parseFloat(this.baseInfoform.amount) > parseFloat(this.transferBaseInfo.transferMaxAmount))
        return this.$message.warning(
          this.$t('finance.maxWithdrawalWarning', { max: this.transferBaseInfo.transferMaxAmount }),
        );
      if (parseFloat(this.baseInfoform.amount) > parseFloat(this.transferBaseInfo.transferBalance)) {
        return this.$message.warning(this.$t('finance.exceedsWithdrawable'));
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          closingApplyApi(this.baseInfoform)
            .then((res) => {
              this.$message.success(this.$t('finance.applicationSuccess'));
              this.btnLoading = false;
              this.transferDialogVisible = false;
              this.closeFrom();
              this.getList(1);
            })
            .catch(() => {
              this.btnLoading = false;
            });
        } else {
          return false;
        }
      });
    },
    closeFrom() {
      this.baseInfoform = {
        amount: 1,
        mark: '',
        closingType: '',
      };
    },
    // 申请转账
    applyTransfer() {
      this.closeFrom();
      this.transferDialogVisible = true;
      this.loadingBaseInfo = true;
      closingBaseInfoApi()
        .then((res) => {
          this.transferBaseInfo = res;
          this.loadingBaseInfo = false;
        })
        .catch(() => {
          this.loadingBaseInfo = false;
        });
    },
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
    // 导出
    exportRecord() {
      transferRecordsExportApi(this.tableFrom)
        .then((res) => {
          const h = this.$createElement;
          this.$msgbox({
            title: this.$t('common.tip'),
            message: h('p', null, [
              h('span', null, this.$t('finance.fileGenerating')),
              h('span', { style: 'color: teal' }, this.$t('finance.exportRecords')),
              h('span', null, this.$t('finance.viewSuffix')),
            ]),
            confirmButtonText: this.$t('finance.gotIt'),
          }).then((action) => {});
        })
        .catch((res) => {
          this.$message.error(res.message);
        });
    },
    // 导出列表
    getExportFileList() {
      this.$refs.exportList.exportFileList();
    },
    handleReset() {
      this.timeVal = [];
      this.tableFrom.closingNo = '';
      this.tableFrom.auditStatus = '';
      this.tableFrom.accountStatus = '';
      this.tableFrom.closingType = '';
      this.getList(1);
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      closingRecordListApi(this.tableFrom)
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
      this.getList('');
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList('');
    },

    handleClose() {
      this.dialogLogistics = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.demo-image__preview {
  width: 60px;
  height: 60px;
  .el-image {
    width: 100%;
    height: 100%;
  }
}
.wid100 {
  width: 100px;
}
.wid112 {
  width: 112px;
}
.ml100 {
  margin-left: 100px;
}
.transferMinAmount {
  ::v-deep.el-form-item__content {
    line-height: normal;
  }
}
.el-icon-arrow-down {
  font-size: 12px;
}
.font-red {
  color: #ff4949;
}
.tabBox_tit {
  width: 60%;
  font-size: 12px !important;
  margin: 0 2px 0 10px;
  letter-spacing: 1px;
  padding: 5px 0;
  box-sizing: border-box;
}
.pictrue {
  width: 60px;
  height: 60px;
  border: 1px dotted rgba(0, 0, 0, 0.1);
  margin-right: 10px;
  position: relative;
  cursor: pointer;
  img {
    width: 100%;
  }
}
.box-container {
  overflow: hidden;
  padding: 0 10px;
}

.box-container .list.image {
  margin: 20px 0;
  position: relative;
}
.box-container .list.image img {
  position: absolute;
  top: -20px;
}
.box-container .list {
  float: left;
  line-height: 40px;
}
.box-container .sp100 {
  width: 100%;
}

.sp100 {
  padding-bottom: 20px !important;
}
::v-deep .el-dialog__footer {
  padding: 10px 24px 20px;
}
</style>
