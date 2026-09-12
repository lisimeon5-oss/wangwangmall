<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="540px" append-to-body :before-close="handleResetForm">
    <el-form
      v-if="dialogVisible && formValidate"
      ref="formValidate"
      class="formValidate"
      :model="formValidate"
      :rules="rules"
      @submit.native.prevent
      label-width="80px"
    >
      <el-form-item :label="$t('systemSetting.deliveryPersonnelLabel')" prop="personnelName">
        <el-input
          v-model.trim="formValidate.personnelName"
          :maxlength="16"
          :placeholder="$t('systemSetting.pleaseEnterDeliveryPersonnelName')"
          size="small"
          clearable
        >
        </el-input>
        <div class="from-tips mb5">{{ $t('systemSetting.deliveryPersonnelNameTip') }}</div>
      </el-form-item>
      <el-form-item :label="$t('user.phoneLabel')" prop="personnelPhone">
        <el-input v-model.trim="formValidate.personnelPhone" :placeholder="$t('systemSetting.pleaseEnterDeliveryPersonnelPhone')"></el-input>
        <div class="from-tips mb5">{{ $t('systemSetting.deliveryPersonnelPhoneTip') }}</div>
      </el-form-item>
      <el-form-item :label="$t('user.sortLabel')">
        <el-input-number
          v-model.trim="formValidate.sort"
          :min="0"
          :max="99"
          :step="1"
          step-strictly
          :placeholder="$t('user.pleaseEnterSort')"
          :label="$t('common.sort')"
        ></el-input-number>
        <div class="from-tips mb5">{{ $t('systemSetting.sort0To99Tip') }}</div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleResetForm">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSure" :loading="loadingBtn">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { expressRelateApi } from '@/api/logistics';
import { useLogisticsAllList } from '@/hooks/use-order';
import { validatePhone } from '@/utils/toolsValidate';
import { personnelEditApi, personnelSaveApi } from '@/api/deliveryPersonnel';
import { defaultData } from '@/views/systemSetting/deliveryPersonnel/default';
export default {
  name: 'CreatPersonnel',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: {},
    },
  },
  watch: {
    editData: {
      handler(nVal, oVal) {
        if (nVal) {
          this.formValidate = this.editData;
          this.title = this.formValidate.id
            ? this.$t('systemSetting.editDeliveryPersonnel')
            : this.$t('systemSetting.addDeliveryPersonnel');
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      title: '',
      formValidate: Object.assign({}, defaultData),
      loadingBtn: false,
      rules: {
        personnelName: [{ required: true, message: this.$t('systemSetting.pleaseEnterDeliveryPersonnelName'), trigger: 'blue' }],
        personnelPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
      },
    };
  },
  mounted() {},
  methods: {
    //取消
    handleResetForm() {
      this.$emit('handlerCloseFrom');
      this.$refs.formValidate.resetFields();
    },
    // 提交
    handleSure() {
      this.$refs.formValidate.validate(async (valid) => {
        if (valid) {
          try {
            this.loadingBtn = true;
            const data = this.formValidate.id
              ? await personnelEditApi(this.formValidate)
              : await personnelSaveApi(this.formValidate);
            if (data) this.$message.success(data);
            this.$emit('handlerSuccessSubmit');
            this.handleResetForm();
            this.loadingBtn = false;
          } catch (e) {
            this.loadingBtn = false;
          }
        }
      });
    },
  },
};
</script>

<style scoped lang="scss"></style>
