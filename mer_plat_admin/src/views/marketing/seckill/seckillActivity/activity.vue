<template>
  <el-dialog
    :before-close="onClose"
    :title="type == 1 ? $t('marketing.setActivityPrice') : $t('marketing.setLimit')"
    :visible.sync="showStatus"
    width="470px"
    :close-on-click-modal="false"
  >
    <el-form ref="form" size="small" :model="form" label-width="100px">
      <template v-if="type == 1">
        <el-form-item :label="$t('marketing.activityMethodLabel')" required>
          <el-radio-group v-model="form.type">
            <el-radio label="0">{{ $t('marketing.activityPrice') }}</el-radio>
            <el-radio label="1">{{ $t('marketing.activityDiscount') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type == 0">
          <el-input-number
            v-model="form.price"
            type="number"
            :precision="2"
            :min="0"
            :max="99999"
            :controls="false"
            class="input_width"
          >
          </el-input-number>
        </el-form-item>
        <el-form-item v-if="form.type == 1">
          <el-input-number
            v-model="form.discount"
            type="number"
            :step="1"
            step-strictly
            :min="0"
            :max="100"
            :controls="false"
            class="input_width"
          >
          </el-input-number>
          <!--<span>%</span>-->
        </el-form-item>
      </template>
      <template v-if="type == 2">
        <el-form-item :label="$t('marketing.setLimitLabel')" required>
          <el-input-number
            v-model="form.activity_stock"
            :step="1"
            step-strictly
            type="number"
            :min="1"
            :max="99999"
            class="input_width"
          >
          </el-input-number>
        </el-form-item>
      </template>
    </el-form>
    <div class="acea-row row-right" slot="footer">
      <el-button size="small" @click="onClose">{{ $t('videoChannel.cancelSpaced') }}</el-button>
      <el-button size="small" type="primary" @click="confirmSet">{{ $t('finance.confirmSpaced') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      showStatus: false,
      type: 1,
      form: {
        type: '0',
        price: '',
        discount: '',
        activity_stock: '',
      },
    };
  },
  methods: {
    onClose() {
      this.showStatus = false;
      setTimeout(
        (this.form = {
          type: '0',
          price: '',
          discount: '',
          activity_stock: '',
        }),
        500,
      );
    },
    confirmSet() {
      this.$emit('onChange', this.form, this.type);
      this.onClose();
    },
  },
};
</script>

<style lang="scss" scoped>
.input_width {
  width: 330px;
}
</style>
