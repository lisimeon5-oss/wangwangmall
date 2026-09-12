<template>
  <el-dialog
    v-if="dialogVisible"
    :title="$t('product.auditTitle')"
    :visible.sync="dialogVisible"
    :append-to-body="isAppend"
    width="540px"
    :before-close="handleClose"
    class="projectInfo"
  >
    <el-form ref="formData" :model="formData" :rules="rules" label-width="80px" class="demo-formData">
      <el-form-item :label="$t('product.auditStatus')" prop="auditStatus">
        <el-radio-group v-model="formData.auditStatus">
          <el-radio label="success">{{ $t('product.pass') }}</el-radio>
          <el-radio label="fail">{{ $t('product.reject') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.auditStatus === 'fail'" :label="$t('product.reason')" prop="reason">
        <el-input v-model="formData.reason" type="textarea" :placeholder="$t('product.pleaseEnterReason')" />
      </el-form-item>
      <el-form-item>
        <div class="dialog-footer-inner">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitForm('formData')">{{ $t('common.submit') }}</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script setup>
import Debounce from '@/libs/debounce';
import { productBatchAuditApi, productBatchVirtualSalesApi } from '@/api/product';

export default {
  name: 'batchAudit',
  props: {
    idList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      formData: {
        reason: '',
        auditStatus: 'success',
        idList: [],
      },
      dialogVisible: false,
      rules: {
        auditStatus: [{ required: true, message: this.$t('product.pleaseSelectAuditStatus'), trigger: 'change' }],
        reason: [{ required: true, message: this.$t('product.pleaseEnterRejectReason'), trigger: 'blur' }],
      },
      isAppend: true,
    };
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.formData = {
        reason: '',
        auditStatus: 'success',
        idList: [],
      };
    },
    /** 提交按钮 */
    submitForm: Debounce(function (formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          this.formData.idList = this.idList;
          productBatchAuditApi(this.formData).then((response) => {
            this.$modal.msgSuccess(this.$t('product.operateSuccess'));
            this.handleClose();
            this.$emit('subBatchAuditSuccess');
          });
        }
      });
    }),
  },
};
</script>
<style scoped lang="scss"></style>
