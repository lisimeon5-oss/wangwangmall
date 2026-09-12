<template>
  <div>
    <el-form-item :label="$t('marketing.shipTypeLabel')" v-if="formItem.deliveryType === 'express'">
      <el-radio-group v-model="formItem.expressRecordType">
        <el-radio label="1">{{ $t('marketing.manualFill') }}</el-radio>
        <el-radio label="2" :disabled="true">{{ $t('common.electronicWaybill') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="formItem.deliveryType === 'express'" :label="$t('marketing.expressCompanyLabel')" prop="expressCode">
      <ChangeLogistics v-model="formItem.expressCode"></ChangeLogistics>
    </el-form-item>
    <el-form-item v-if="formItem.deliveryType === 'express'" :label="$t('marketing.expressNoLabel')" prop="expressNumber">
      <el-input v-model.trim="formItem.expressNumber" :placeholder="$t('marketing.pleaseEnterExpressNo')"></el-input>
    </el-form-item>
    <el-form-item v-if="formItem.deliveryType === 'noNeed'" :label="$t('marketing.shipRemarkLabel')">
      <el-input
        v-model.trim="formItem.deliveryMark"
        show-word-limit
        :autosize="{ minRows: 4 }"
        maxlength="200"
        type="textarea"
        :placeholder="$t('marketing.pleaseEnterRemarkMax250')"
      ></el-input>
    </el-form-item>
    <el-form-item v-if="formItem.deliveryType === 'merchant'" :label="$t('marketing.deliveryStaffLabel')" prop="deliveryCarrier">
      <el-input v-model.trim="formItem.deliveryCarrier" :placeholder="$t('marketing.pleaseEnterDeliveryStaff')"></el-input>
    </el-form-item>
    <el-form-item v-if="formItem.deliveryType === 'merchant'" :label="$t('marketing.phoneNumberLabel')" prop="carrierPhone">
      <el-input v-model.trim="formItem.carrierPhone" :placeholder="$t('marketing.pleaseEnterDeliveryPhone')"></el-input>
    </el-form-item>
  </div>
</template>

<script>
import { useLogistics } from '@/hooks/use-order';
import ChangeLogistics from '@/components/ChangeLogistics';
export default {
  name: 'sendFrom',
  components: {
    ChangeLogistics,
  },
  data() {
    return {
      express: [],
    };
  },
  props: {
    formItem: {
      type: Object,
      default: null,
    },
    isShowBtn: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
