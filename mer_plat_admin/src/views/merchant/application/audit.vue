<template>
  <div class="box">
    <el-drawer
      :visible.sync="dialogVisible"
      :title="isSHOW ? $t('merchant.merchantOnboardingAudit') : $t('merchant.merchantDetail')"
      :direction="direction"
      @close="close"
      size="1000px"
    >
      <div v-if="dialogVisible">
        <div class="detailHead bdbtmSolid">
          <div class="acea-row row-between headerBox">
            <div class="full">
              <div class="order_icon"><span class="iconfont icon-shanghuliebiao"></span></div>
              <div class="text">
                <div class="title">{{ $t('merchant.merchant') }}</div>
                <span class="mr20">{{ dataForm.name }}</span>
              </div>
            </div>
            <div v-if="isSHOW">
              <el-button
                v-debounceClick="
                  () => {
                    onSubmit(3);
                  }
                "
                style="margin-left: 0"
                >{{ loadingBtn ? $t('finance.submitting') : $t('product.auditRejected') }}</el-button
              >
              <el-button
                type="primary"
                v-debounceClick="
                  () => {
                    onSubmit(2);
                  }
                "
                >{{ loadingBtn ? $t('finance.submitting') : $t('finance.auditPassed') }}</el-button
              >
            </div>
          </div>
        </div>
        <div class="detailSection padBox">
          <div class="title">{{ $t('merchant.merchantDetail') }}</div>
          <ul class="list">
            <li class="item">
              <div class="tips">{{ $t('merchant.merchantAccountLabel') }}</div>
              <div class="value">{{ dataForm.phone }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('merchant.merchantCategoryLabel') }}</div>
              <div class="value">{{ dataForm.categoryId | merCategoryFilter }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('merchant.storeTypeLabel') }}</div>
              <div class="value">{{ dataForm.typeId | merchantTypeFilter }}</div>
            </li>
            <li v-show="dataForm.password" class="item">
              <div class="tips">{{ $t('merchant.loginPassword') }}</div>
              <div class="value">{{ dataForm.password }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('merchant.merchantRealNameLabel') }}</div>
              <div class="value">{{ dataForm.realName }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('merchant.merchantPhoneLabel') }}</div>
              <div class="value">{{ dataForm.phone | filterEmpty }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('merchant.handlingFeePercentLabel') }}</div>
              <div class="value">{{ dataForm.handlingFee }}</div>
            </li>
          </ul>
          <div class="ivu-mt-16 acea-row">
            <div class="tips">{{ $t('merchant.introLabel') }}</div>
            <div class="value">{{ dataForm.keywords || $t('finance.none') }}</div>
          </div>
          <div class="ivu-mt-16 acea-row">
            <div class="tips">{{ $t('user.remarkLabel') }}</div>
            <div class="value">{{ dataForm.remark || $t('finance.none') }}</div>
          </div>
          <div class="ivu-mt-16 acea-row">
            <div class="tips">{{ $t('merchant.qualificationLabel') }}</div>
            <div class="acea-row">
              <div v-for="(item, index) in dataForm.qualificationPictureData" :key="index" class="pictrue">
                <el-image :src="item" :preview-src-list="dataForm.qualificationPictureData"> </el-image>
              </div>
            </div>
          </div>
        </div>
        <!--        <div class="demo-drawer__footer">-->
        <!--          <div v-if="isSHOW" class="from-foot-btn drawer_fix">-->
        <!--            <div class="acea-row justify-content">-->
        <!--              <el-button-->
        <!--                v-debounceClick="-->
        <!--                  () => {-->
        <!--                    onSubmit(3);-->
        <!--                  }-->
        <!--                "-->
        <!--                style="margin-left: 0"-->
        <!--                >{{ loadingBtn ? $t('finance.submitting') : $t('product.auditRejected') }}</el-button-->
        <!--              >-->
        <!--              <el-button-->
        <!--                type="primary"-->
        <!--                v-debounceClick="-->
        <!--                  () => {-->
        <!--                    onSubmit(2);-->
        <!--                  }-->
        <!--                "-->
        <!--                >{{ loadingBtn ? $t('finance.submitting') : $t('finance.auditPassed') }}</el-button-->
        <!--              >-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
    </el-drawer>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import { merApplyAuditApi } from '@/api/merchant';
import { mapGetters } from 'vuex';
import { filterEmpty } from '@/filters';
export default {
  name: 'audit',
  data() {
    return {
      merImg: require('@/assets/imgs/dianpu.png'),
      dialogVisible: false,
      direction: 'rtl',
      isDisabled: true,
      rules: {
        auditStatus: [{ required: true, message: this.$t('product.pleaseSelectAuditStatus'), trigger: 'change' }],
        denialReason: [{ required: true, message: this.$t('product.pleaseEnterRejectReason'), trigger: 'blur' }],
      },
      ruleForm: {
        denialReason: '',
        auditStatus: 2,
        id: '',
      },
      loadingBtn: false,
    };
  },
  props: {
    merData: {
      type: Object,
      default: () => null,
    },
    isSHOW: {
      type: String,
      default: () => '',
    },
  },
  computed: {
    ...mapGetters(['merchantClassify', 'merchantType']),
  },
  watch: {
    merData: {
      handler: function (val) {
        if (val.qualificationPicture) val.qualificationPictureData = JSON.parse(val.qualificationPicture);
        this.dataForm = { ...val };
      },
      deep: true,
    },
  },
  methods: {
    filterEmpty,
    close() {
      this.dialogVisible = false;
      this.ruleForm = {
        denialReason: '',
        auditStatus: 2,
      };
    },
    //审核拒绝
    cancelForm() {
      this.$modalPrompt('textarea', this.$t('product.rejectReason')).then((V) => {
        this.ruleForm.denialReason = V;
        this.submit();
      });
    },
    // 审核提交
    onSubmit(type) {
      this.ruleForm.auditStatus = type;
      if (type === 2) {
        this.$modalSure(this.$t('merchant.approveMerchantConfirm')).then(() => {
          this.submit();
        });
      } else {
        this.cancelForm();
      }
    },
    submit() {
      this.loadingBtn = true;
      this.ruleForm.id = this.dataForm.id;
      merApplyAuditApi(this.ruleForm)
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.dialogVisible = false;
          this.$emit('subSuccess');
          this.loadingBtn = false;
        })
        .catch((res) => {
          this.loadingBtn = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.demo-drawer__content {
  padding-bottom: 86px;
}
.box {
  ::v-deep.el-drawer__header {
    margin-bottom: 0 !important;
    font-size: 20px;
  }
}
.demo-drawer__content {
  min-height: 600px;
}
.widths {
  width: 169px;
  display: inline-block;
  color: #606266;
}
.langcent {
  display: inline-block;
  color: #606266;
  width: 100%;
}
.lang {
  width: 100%;
  ::v-deep.el-form-item__content {
    width: 79%;
  }
}
.divBox {
  ::v-deep .el-input__inner:hover,
  ::v-deep.el-input > input,
  ::v-deep.el-textarea > textarea {
    border: none;
    padding: 0;
  }
  ::v-deep.el-card__body {
    padding: 5px;
  }
  ::v-deep .el-input.is-disabled .el-input__inner {
    background: none;
    cursor: none;
    color: #606266;
  }
}
::v-deep .el-image {
  width: 60px;
  height: 60px;
}
</style>
