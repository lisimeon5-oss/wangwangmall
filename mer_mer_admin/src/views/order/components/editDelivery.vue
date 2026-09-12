<template>
  <el-dialog
    :title="$t('order.modifyDeliveryInfo')"
    :visible.sync="visible"
    width="540px"
    :before-close="handleClose"
    class="dialog-bottom"
  >
    <el-form ref="formItem" :model="formItem" label-width="95px" @submit.native.prevent :rules="rules">
      <SendFrom :formItem="formItem" :isShowBtn="false"></SendFrom>
    </el-form>
    <div slot="footer">
      <el-button size="mini" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button
        :loading="loadingBtn"
        size="smalll"
        type="primary"
        @click="handleSubmit('formItem')"
        v-hasPermi="['merchant:order:invoice:update']"
        >{{ $t('common.submit') }}</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { useLogistics } from '@/hooks/use-order';
import { Debounce } from '@/utils/validate';
import { orderInvoiceUpdateApi } from '@/api/order';
import { getPostRules } from '@/views/order/default';
import SendFrom from './sendFrom';

export default {
  name: 'editDelivery',
  props: {
    visible: {
      type: Boolean,
      required: false,
    },
    editData: {
      type: Object,
      required: null,
    },
  },
  components: { SendFrom },
  data() {
    return {
      formItem: {
        carrierPhone: '',
        deliveryCarrier: '',
        deliveryMark: '',
        expressCode: '',
        expressNumber: '',
        id: 0,
      },
      logistics: [],
      loadingBtn: false,
    };
  },
  computed: {
    rules() {
      this.$i18n.locale;
      return getPostRules(this);
    },
  },
  watch: {
    visible: {
      handler: function (val) {
        if (val) this.getLogistics();
      },
      deep: true,
    },
    editData: {
      handler: function (val) {
        this.formItem = {
          ...this.editData,
          expressNumber: this.editData.expressNumber ? this.editData.expressNumber : this.editData.trackingNumber,
        };
      },
      deep: true,
    },
  },
  methods: {
    handleClose() {
      this.$emit('onCloseVisible');
      this.formItem = {
        ...this.editData,
        expressNumber: this.editData.expressNumber ? this.editData.expressNumber : this.editData.trackingNumber,
      };
      this.$refs.formItem.resetFields();
    },
    handleSubmitSuccess() {
      this.$emit('onSubmitSuccess');
      this.loadingBtn = false;
      this.$refs.formItem.resetFields();
    },
    //物流公司
    async getLogistics() {
      const params = {
        keywords: '',
        page: 1,
        limit: 50,
        openStatus: true,
      };
      this.logistics = await useLogistics(params);
    },
    //提交
    handleSubmit: Debounce(function (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const { carrierPhone, deliveryCarrier, deliveryMark, expressCode, expressNumber, id } = this.formItem;
          let data = {
            carrierPhone: carrierPhone,
            deliveryCarrier: deliveryCarrier,
            deliveryMark: deliveryMark,
            expressCode: expressCode,
            expressNumber: expressNumber,
            id: id,
            toAddr: this.formItem.toAddr,
            toTel: this.formItem.toTel,
            toName: this.formItem.toName,
            expressRecordType: this.formItem.expressRecordType,
          };
          if (this.formItem.expressRecordType == '2') {
            if (!this.formItem.toAddr) {
              this.$message.warning(this.$t('order.pleaseEnterSenderAddress'));
              return;
            }
            if (!this.formItem.toTel) {
              this.$message.warning(this.$t('order.pleaseEnterSenderPhone'));
              return;
            }
            if (!this.formItem.toName) {
              this.$message.warning(this.$t('order.pleaseEnterSenderName'));
              return;
            }
            if (!this.formItem.expressTempId) {
              this.$message.warning(this.$t('order.pleaseSelectElectronicWaybill'));
              return;
            }
          }
          orderInvoiceUpdateApi(data)
            .then((res) => {
              this.$message.success(this.$t('order.modifyDeliverySuccess'));
              this.handleSubmitSuccess();
            })
            .catch((res) => {
              this.loadingBtn = false;
            });
        }
      });
    }),
  },
};
</script>

<style scoped></style>
