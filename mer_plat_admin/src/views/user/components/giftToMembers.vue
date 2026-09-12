<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="$t('user.giftMember')"
    :visible.sync="dialogVisibleMember"
    width="540px"
    :before-close="handleResetForm"
  >
    <el-form
      ref="formValidate"
      class="formValidate"
      :model="formValidate"
      :rules="rules"
      @submit.native.prevent
      label-width="80px"
    >
      <el-form-item :label="$t('user.memberCardLabel')" required prop="cardId">
        <el-select
          v-model="formValidate.cardId"
          :placeholder="$t('user.pleaseSelectSystemCard')"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option v-for="item in tableDataMember" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <div class="from-tips">{{ $t('user.giftCardTip') }}</div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleResetForm">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSure" :loading="loadingBtn">{{ $t('common.confirmPrefix') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { giftPaidMemberApi } from '@/api/user';

export default {
  props: {
    tableDataMember: {
      formData: {
        type: Array,
        required: [],
      },
    },
    dialogVisibleMember: {
      formData: {
        type: Boolean,
        required: false,
      },
    },
    checkedIds: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dialogVisible: false,
      formValidate: {
        cardId: null,
        ids: '',
      },
      loadingBtn: false,
      rules: {
        cardId: [{ required: true, message: this.$t('user.pleaseSelectSystemCard'), trigger: 'change' }],
      },
    };
  },
  mounted() {
    this.formValidate.ids = this.checkedIds;
  },
  methods: {
    //取消
    handleResetForm() {
      this.$emit('handlerSuccessClose');
      this.$refs.formValidate.resetFields();
    },
    // 提交
    handleSure() {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          this.formValidate.ids;
          giftPaidMemberApi(this.formValidate)
            .then(async (res) => {
              this.$message.success(this.$t('user.giftSuccess'));
              this.$emit('handlerSuccessSubmit');
              this.loadingBtn = false;
            })
            .catch((res) => {
              this.loadingBtn = false;
            });
        }
      });
    },
  },
};
</script>
<style scoped lang="scss"></style>
