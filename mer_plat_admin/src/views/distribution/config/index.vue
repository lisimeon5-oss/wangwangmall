<template>
  <div class="divBox">
    <el-card class="box-card" :bordered="false" shadow="never" :body-style="{ padding: '40px 50px' }">
      <el-form
        ref="promoterForm"
        :model="promoterForm"
        :rules="rules"
        label-width="200px"
        class="demo-promoterForm"
        v-loading="loading"
      >
        <el-form-item prop="retailStoreSwitch">
          <span slot="label">
            <span>{{ $t('distribution.distributionEnabledLabel') }}</span>
            <el-tooltip class="item" effect="dark" :content="$t('distribution.mallDistributionToggle')" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-radio-group v-model="promoterForm.retailStoreSwitch">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="retailStoreLine">
          <span slot="label">
            <span>{{ $t('distribution.fullAmountDistributionMinLabel') }}</span>
            <el-tooltip class="item" effect="dark" :content="$t('distribution.fullAmountDistributionTip')" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-input-number
            v-model.trim="promoterForm.retailStoreLine"
            :placeholder="$t('distribution.fullAmountDistributionTip')"
            :min="-1"
            :step="1"
            class="selWidth"
            @keydown.native="channelInputLimit"
          ></el-input-number>
        </el-form-item>
        <el-form-item prop="retailStoreBindingType">
          <span slot="label">
            <span>{{ $t('distribution.distributionRelationLabel') }}</span>
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('distribution.allUsersTip')"
              placement="top-start"
            >
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-radio-group v-model="promoterForm.retailStoreBindingType">
            <el-radio :label="0">{{ $t('distribution.allUsers') }}</el-radio>
            <el-radio :label="1">{{ $t('distribution.newUser') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="retailStoreBrokerageFirstRatio">
          <span slot="label">
            <span>{{ $t('distribution.firstCommissionRateLabel') }}</span>
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('distribution.commissionRateTip2')"
              placement="top-start"
            >
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-input-number
            v-model.trim="promoterForm.retailStoreBrokerageFirstRatio"
            step-strictly
            :min="0"
            :max="100"
            class="selWidth"
            :placeholder="$t('distribution.commissionRateTip2')"
          ></el-input-number>
          <span>%</span>
        </el-form-item>
        <el-form-item prop="retailStoreBrokerageSecondRatio">
          <span slot="label">
            <span>{{ $t('distribution.secondCommissionRateLabel') }}</span>
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('distribution.commissionRateTip1')"
              placement="top-start"
            >
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-input-number
            v-model.trim="promoterForm.retailStoreBrokerageSecondRatio"
            step-strictly
            :min="0"
            :max="100"
            class="selWidth"
            :placeholder="$t('distribution.commissionRateTip1')"
          ></el-input-number>
          <span>%</span>
        </el-form-item>
        <el-form-item prop="retailStoreExtractMinPrice">
          <span slot="label">
            <span>{{ $t('distribution.withdrawMinAmountLabel') }}</span>
            <el-tooltip class="item" effect="dark" :content="$t('distribution.userMinWithdrawAmount')" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-input-number
            v-model.trim="promoterForm.retailStoreExtractMinPrice"
            :min="0"
            :step="1"
            class="selWidth"
            :placeholder="$t('distribution.userMinWithdrawAmount')"
          ></el-input-number>
        </el-form-item>
        <el-form-item prop="retailStoreExtractBank">
          <span slot="label">
            <span>{{ $t('distribution.withdrawBankCardLabel') }}</span>
            <el-tooltip class="item" effect="dark" :content="$t('distribution.withdrawBankCards')" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <keyword @getLabelarr="getLabelarr" :labelarr="labelarr" style="width: 600px" :type="keywordType"></keyword>
        </el-form-item>
        <el-form-item prop="retailStoreBrokerageFreezingTime">
          <span slot="label">
            <span>{{ $t('distribution.freezeStartRuleLabel') }}</span>
            <el-tooltip class="item" effect="dark" :content="$t('distribution.freezeStartStatus')" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-select
            :key="'freeze-node-' + ($i18n.locale || '')"
            v-model="promoterForm.retailStoreBrokerageShareNode"
            :placeholder="$t('el.select.placeholder')"
          >
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="retailStoreBrokerageFreezingTime">
          <span slot="label">
            <span>{{ $t('distribution.freezeDurationLabel') }}</span>
            <el-tooltip class="item" effect="dark" :content="$t('distribution.freezeDuration')" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
          <el-input-number
            v-model.trim="promoterForm.retailStoreBrokerageFreezingTime"
            :min="0"
            :max="30"
            :step="1"
            step-strictly
            class="selWidth"
            :placeholder="$t('distribution.commissionFreezeDays')"
          ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="submitForm('promoterForm')"
            v-hasPermi="['platform:retail:store:config:save']"
            >{{ $t('common.submit') }}</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
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
import { configApi, configUpdateApi, productCheckApi } from '@/api/distribution';
import * as selfUtil from '@/utils/ZBKJIutil.js';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { Debounce } from '@/utils/validate';
export default {
  name: 'Index',
  data() {
    return {
      keywordType: 'textarea',
      labelarr: [],
      promoterForm: {
        retailStoreBrokerageShareNode: 'complete',
        retailStoreBrokerageFreezingTime: 7,
      },
      loading: false,
    };
  },
  computed: {
    options() {
      return [
        { value: 'pay', label: this.$t('distribution.afterOrderPaid') },
        { value: 'receipt', label: this.$t('distribution.afterOrderReceived') },
        { value: 'complete', label: this.$t('distribution.afterOrderCompleted') },
      ];
    },
    rules() {
      return {
        retailStoreSwitch: [{ required: true, message: this.$t('distribution.pleaseSelectEnableDistribution'), trigger: 'change' }],
        retailStoreBrokerageFirstRatio: [{ required: true, message: this.$t('distribution.pleaseEnterFirstCommissionRate'), trigger: 'blur' }],
        retailStoreBrokerageSecondRatio: [{ required: true, message: this.$t('distribution.pleaseEnterSecondCommissionRate'), trigger: 'blur' }],
        merchantShareFreezeTime: [{ required: true, message: this.$t('distribution.pleaseEnterFreezeTime'), trigger: 'blur' }],
      };
    },
  },
  mounted() {
    if (checkPermi(['platform:retail:store:config:get'])) this.getDetal();
  },
  methods: {
    checkPermi,
    getLabelarr(attr) {
      this.labelarr = attr;
    },
    channelInputLimit(e) {
      let key = e.key;
      // 不允许输入'ethis.$t('distribution.and').'
      if (key === 'e' || key === '.') {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    getDetal() {
      this.loading = true;
      configApi()
        .then((res) => {
          this.loading = false;
          this.promoterForm = res;
          this.labelarr = res.retailStoreExtractBank ? res.retailStoreExtractBank.split(',') : [];
        })
        .catch((res) => {
          this.$message.error(res.message);
        });
    },
    submitForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (
            selfUtil.Add(
              this.promoterForm.retailStoreBrokerageFirstRatio,
              this.promoterForm.retailStoreBrokerageSecondRatio,
            ) > 100
          )
            return this.$message.warning(this.$t('distribution.commissionRateLimit'));
          this.loading = true;
          this.promoterForm.retailStoreExtractBank = this.labelarr.join(',');
          configUpdateApi(this.promoterForm)
            .then((res) => {
              this.loading = false;
              this.$message.success(this.$t('user.submitSuccess'));
            })
            .catch((err) => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    }),
  },
};
</script>

<style scoped lang="scss"></style>
