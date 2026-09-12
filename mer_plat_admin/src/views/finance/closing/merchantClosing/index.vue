<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:finance:merchant:closing:page:list']"
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
              style="width: 260px"
              @change="onchangeTime"
            />
          </el-form-item>
          <el-form-item :label="$t('product.merchantNameLabel')" v-hasPermi="['platform:merchant:page:list']">
            <merchant-name @getMerId="getMerId" :mer-id-checked="tableFrom.merId"></merchant-name>
          </el-form-item>
          <el-form-item :label="$t('finance.auditStatusLabel')">
            <el-select
              v-model="tableFrom.auditStatus"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('order.pendingAudit')" value="0" />
              <el-option :label="$t('finance.auditPassed')" value="1" />
              <el-option :label="$t('common.auditFailed')" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('finance.accountStatusLabel')">
            <el-select
              v-model="tableFrom.accountStatus"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option v-for="item in arrivalStatusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('finance.closingTypeLabel')">
            <el-select
              v-model="tableFrom.closingType"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
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
            >
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('common.reset') }}</el-button>
          </el-form-item>
          <br />
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-table
        v-loading="listLoading"
        size="small"
        tooltip-effect="dark"
        :data="tableData.data"
        style="width: 100%"
        class="table"
      >
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column prop="closingNo" :label="$t('finance.closingNo')" min-width="180" />
        <el-table-column prop="merName" :label="$t('product.merchantName')" min-width="160" :show-overflow-tooltip="true" />
        <el-table-column prop="amount" :label="$t('finance.amount')" min-width="120" />
        <el-table-column :label="$t('finance.auditorName')" min-width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.auditName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('finance.closingType')" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.closingType | closingTypeFilter }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('product.auditStatus')" min-width="120">
          <template slot-scope="scope">
            <span>{{
              scope.row.auditStatus == 0 ? $t('order.pendingAudit') : scope.row.auditStatus == 1 ? $t('finance.auditPassed') : $t('common.auditFailed')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('finance.accountStatus')" min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.accountStatus == 1 ? $t('finance.transferred') : $t('finance.notTransferred') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('order.platformRemark')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.platformMark | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('finance.applyTime')" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('common.operate')" width="170" fixed="right">
          <template slot-scope="scope">
            <a @click="closingDetail(scope.row.closingNo, 1)" v-hasPermi="['platform:finance:merchant:closing:detail']"
              >{{ $t('finance.transferDetail') }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <template v-if="scope.row.auditStatus === 0 && checkPermi(['platform:finance:merchant:closing:audit'])">
              <a @click="closingDetail(scope.row.closingNo, 2)">{{ $t('finance.audit') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template
              v-if="
                scope.row.auditStatus === 1 &&
                scope.row.accountStatus === 0 &&
                checkPermi(['platform:finance:merchant:closing:proof'])
              "
            >
              <a @click="closingDetail(scope.row.closingNo, 3)">{{ $t('finance.transfer') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <a v-hasPermi="['platform:finance:merchant:closing:remark']" @click="onRemark(scope.row)">{{ $t('common.remark') }}</a>
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
    <!--转账凭证 审核 详情-->
    <el-drawer direction="rtl" :visible.sync="dialogVisible" size="700px" @close="close('ruleForm')" :title="$t('finance.closingDetail')">
      <div class="detailHead">
        <div class="acea-row row-between headerBox">
          <div class="full">
            <div class="order_icon"><span class="iconfont icon-caiwuchazhang"></span></div>
            <div class="text">
              <div class="title">{{ $t('finance.closingDetail') }}</div>
            </div>
          </div>
          <div v-if="isShow === 2 && closingData.auditStatus == 0" class="acea-row justify-content">
            <el-button
              size="small"
              v-debounceClick="
                () => {
                  onSubmit('fail');
                }
              "
              style="margin-left: 0"
              >{{ loadingBtn ? $t('finance.submitting') : $t('product.auditRejected') }}</el-button
            >
            <el-button
              size="small"
              type="primary"
              v-debounceClick="
                () => {
                  onSubmit('success');
                }
              "
              >{{ loadingBtn ? $t('finance.submitting') : $t('finance.auditPassed') }}</el-button
            >
          </div>
        </div>
      </div>
      <div class="box-container detailSection" v-loading="loading">
        <div class="acea-row">
          <div class="list sp100"><label class="name">{{ $t('product.merchantNameLabel') }}</label>{{ closingData.merName }}</div>
          <div class="list sp100"><label class="name">{{ $t('finance.merchantFlowAmountLabel') }}</label>{{ closingData.amount }}</div>
          <div class="list sp100"><label class="name">{{ $t('finance.merchantBalanceLabel') }}</label>{{ closingData.balance }}</div>
          <div class="list sp100">
            <label class="name">{{ $t('finance.merchantCollectionMethodLabel') }}</label>{{ closingData.closingType | closingTypeFilter }}
          </div>
          <template v-if="closingData.closingType === 'bank'">
            <div class="list sp100"><label class="name">{{ $t('finance.bankNameLabel') }}</label>{{ closingData.closingBank }}</div>
            <div class="list sp100"><label class="name">{{ $t('finance.bankAccountLabel') }}</label>{{ closingData.closingBankCard }}</div>
            <div class="list sp100"><label class="name">{{ $t('finance.accountHolderLabel') }}</label>{{ closingData.closingName }}</div>
          </template>
          <div v-if="closingData.closingType === 'wechat'" class="list sp100">
            <label class="name">{{ $t('finance.wechatNoLabel') }}</label>{{ closingData.wechatNo }}
          </div>
          <div v-if="closingData.closingType === 'alipay'" class="list sp100">
            <label class="name">{{ $t('finance.alipayAccountLabel') }}</label>{{ closingData.alipayAccount }}
          </div>
          <div v-if="closingData.closingType === 'wechat' || closingData.closingType === 'alipay'" class="list sp100">
            <label class="name">{{ $t('finance.realNameLabel') }}</label>{{ closingData.realName }}
          </div>
          <div v-if="closingData.closingType !== 'bank'" class="list sp100 acea-row">
            <label class="name">{{ $t('finance.collectionQrCodeLabel') }}</label>
            <div class="demo-image__preview">
              <el-image :src="closingData.paymentCode" :preview-src-list="[closingData.paymentCode]" />
            </div>
          </div>

          <div class="list sp100">
            <label class="name">{{ $t('finance.auditStatusLabel') }}</label
            >{{ closingData.auditStatus == 0 ? $t('order.pendingAudit') : closingData.auditStatus == 1 ? $t('finance.audited') : $t('common.auditFailed') }}
          </div>
          <div v-if="closingData.auditStatus == 1" class="list sp100">
            <label class="name">{{ $t('finance.auditTimeLabel') }}</label>{{ closingData.auditTime | filterEmpty }}
          </div>
          <div v-if="closingData.closingProof" class="list sp100">
            <label class="name">{{ $t('finance.closingVoucherLabel') }}</label>
            <div class="acea-row">
              <div v-for="(item, index) in JSON.parse(closingData.closingProof)" :key="index" class="pictrue">
                <img @click="getPicture(item)" :src="item" />
              </div>
            </div>
          </div>
          <div v-if="closingData.auditStatus == 1 && closingData.closingTime" class="list sp100">
            <label class="name">{{ $t('finance.closingTimeLabel') }}</label>{{ closingData.closingTime }}
          </div>
          <div v-if="closingData.auditStatus == 2 && closingData.refusalReason" class="list sp100">
            <label class="name">{{ $t('finance.rejectReasonLabel') }}</label>{{ closingData.refusalReason }}
          </div>
          <div class="list sp100">
            <label class="name">{{ $t('finance.platformRemarkLabel') }}</label>{{ closingData.platformMark | filterEmpty }}
          </div>
          <div class="list sp100"><label class="name">{{ $t('finance.merchantRemarkLabel') }}</label>{{ closingData.mark | filterEmpty }}</div>
        </div>
        <div v-if="isShow !== 1">
          <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="demo-ruleForm">
            <template v-if="isShow === 3 && closingData.auditStatus === 1 && closingData.accountStatus === 0">
              <el-form-item :label="$t('finance.transferVoucherLabel')" prop="closingProof">
                <div class="acea-row">
                  <div class="acea-row" v-if="ruleForm.closingProof.length > 0">
                    <div v-for="(item, index) in ruleForm.closingProof" :key="index" class="pictrue">
                      <img :src="item" @click="getPicture(item)" />
                      <i class="el-icon-error btndel" @click="handleRemove(index)" />
                    </div>
                  </div>
                  <el-upload
                    v-show="ruleForm.closingProof.length < 6"
                    class="upload-demo"
                    action
                    :http-request="handleUploadForm"
                    :headers="myHeaders"
                    :show-file-list="false"
                    multiple
                  >
                    <div class="upLoadPicBox">
                      <div class="upLoad">
                        <i class="el-icon-upload2" />
                      </div>
                    </div>
                  </el-upload>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submit">{{ loadingBtn ? $t('finance.submitting') : $t('finance.confirmSpaced') }}</el-button>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </div>
    </el-drawer>
    <!--查看图片-->
    <el-dialog v-if="pictureVisible" :visible.sync="pictureVisible" width="700px">
      <img :src="pictureUrl" class="pictures" />
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
  merchantClosingListApi,
  transferProofApi,
  closingAuditApi,
  merClosingDetailApi,
  transferRecordsExportApi,
  merClosingRemarkApi,
} from '@/api/finance';
import merchantName from '@/components/merchantName';
import { getToken } from '@/utils/auth';
import { fileImageApi } from '@/api/systemSetting';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  name: 'transferAccount',
  data() {
    return {
      myHeaders: { 'X-Token': getToken() },
      isShow: 0,
      loadingBtn: false,
      rules: {
        auditStatus: [{ required: true, message: this.$t('product.pleaseSelectAuditStatus'), trigger: 'change' }],
        refusalReason: [{ required: true, message: this.$t('product.pleaseEnterRejectReason'), trigger: 'blur' }],
        closingProof: [{ required: true, message: this.$t('finance.pleaseUploadClosingVoucher'), type: 'array', trigger: 'change' }],
      },
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: true,
      tableFrom: {
        dateLimit: '',
        page: 1,
        limit: 20,
        closingNo: '',
        auditStatus: '',
        accountStatus: '',
        merId: null,
        closingType: '',
      },
      timeVal: [],
      fromList: this.$constants.fromList,
      loading: false,
      dialogVisible: false,
      pictureVisible: false,
      closingData: {},
      baseInfoform: {
        amount: 0,
        mark: '',
        transferType: '',
      },
      merchantList: [],
      search: {
        limit: 10,
        page: 1,
        keywords: '',
      },
      ruleForm: {
        refusalReason: '',
        auditStatus: 1,
        id: '',
        closingProof: [],
      },
      localImg: '',
      closingNo: '',
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
  components: { merchantName },
  mounted() {
    if (checkPermi(['platform:finance:merchant:closing:page:list'])) this.getList(1);
  },
  methods: {
    checkPermi,
    getMerId(id) {
      this.tableFrom.merId = id;
      this.getList(1);
    },
    onRemark(row) {
      this.$modalPrompt('textarea', this.$t('common.remark'), row.platformMark).then((V) => {
        merClosingRemarkApi({
          closingNo: row.closingNo,
          remark: V,
        }).then((res) => {
          this.$message({
            type: 'success',
            message: this.$t('user.submitSuccess'),
          });
          this.getList('');
        });
      });
    },
    // 审核提交
    onSubmit(type) {
      if (type === 'success') {
        this.$modalSure(this.$t('finance.approveSettlementConfirm')).then(() => {
          this.ruleForm.auditStatus = 1;
          this.submit();
        });
      } else {
        this.ruleForm.auditStatus = 2;
        this.cancelForm();
      }
    },
    //审核拒绝
    cancelForm() {
      this.$modalPrompt('textarea', this.$t('product.rejectReason')).then((V) => {
        this.ruleForm.refusalReason = V;
        this.submit();
      });
    },
    submit() {
      if (this.isShow === 2) {
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            this.loadingBtn = true;
            const data = {
              closingNo: this.closingNo,
              refusalReason: this.ruleForm.refusalReason,
              auditStatus: this.ruleForm.auditStatus,
            };
            // return;
            closingAuditApi(data)
              .then((res) => {
                this.$message.success(this.$t('product.operateSuccess'));
                this.dialogVisible = false;
                this.getList(1);
                this.close('ruleForm');
                this.loadingBtn = false;
              })
              .catch((res) => {
                this.loadingBtn = false;
              });
          } else {
            return false;
          }
        });
      } else {
        this.loadingBtn = true;
        const data = {
          closingNo: this.closingNo,
          closingProof: JSON.stringify(this.ruleForm.closingProof),
        };
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            transferProofApi(data)
              .then((res) => {
                this.$message.success(this.$t('product.operateSuccess'));
                this.dialogVisible = false;
                this.getList(1);
                this.close('ruleForm');
                this.loadingBtn = false;
              })
              .catch((res) => {
                this.loadingBtn = false;
              });
          }
        });
      }
    },
    handleUploadForm(param) {
      const formData = new FormData();
      const data = {
        model: 'finance',
        pid: 0,
      };
      formData.append('multipart', param.file);
      let loading = this.$loading({
        lock: true,
        text: this.$t('finance.uploading'),
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      });
      fileImageApi(formData, data)
        .then((res) => {
          loading.close();
          this.$message.success(this.$t('finance.uploadSuccess'));
          this.ruleForm.closingProof.push(res.url);
        })
        .catch((res) => {
          loading.close();
        });
    },
    handleRemove(i) {
      this.ruleForm.closingProof.splice(i, 1);
    },
    close(refName) {
      if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
      }
      this.dialogVisible = false;
      this.ruleForm.closingProof = [];
    },
    // 商户结算记录详情
    closingDetail(id, num) {
      this.closingNo = id;
      this.isShow = num;
      this.dialogVisible = true;
      this.loading = true;
      merClosingDetailApi(id)
        .then((res) => {
          this.closingData = res;
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
            confirmButtonText: this.$t('finance.iKnow'),
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
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      merchantClosingListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    reset() {
      this.tableFrom.dateLimit = '';
      this.tableFrom.closingNo = '';
      this.tableFrom.auditStatus = '';
      this.tableFrom.accountStatus = '';
      this.tableFrom.merId = null;
      this.tableFrom.closingType = '';
      this.timeVal = [];
      this.getList(1);
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
.detailHead .full{
  .text{
    width: auto !important;
  }
}
.demo-image__preview {
  width: 60px;
  height: 60px;

  .el-image {
    width: 100%;
    height: 100%;
  }
}

.title {
  font-size: 20px;
}

.wid100 {
  width: 100px;
}

.ml100 {
  margin-left: 100px;
}

.transferMinAmount {
  ::v-deep.el-form-item__content {
    line-height: normal;
  }
}

::v-deep .el-dialog__title {
  font-weight: bold;
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

.box-container {
  overflow: hidden;
  padding: 25px 35px;
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
  font-size: 13px;
  color: #303133;
  margin-bottom: 16px;

  .name {
    color: #606266;
    width: 110px;
    display: inline-block;
    text-align: right;
  }
}

.box-container .sp100 {
  width: 100%;
}

.pictures {
  width: 100%;
  height: 100%;
}
</style>
