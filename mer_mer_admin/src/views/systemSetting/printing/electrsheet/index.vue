<template>
  <div class="divBox">
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
    <el-form :model="editDataLocal" ref="editDataLocal" :key="'elect-' + uiLocale" label-width="140px" class="demo-dynamic">
      <el-form-item :label="$t('systemSetting.printerSelectionLabel')">
        <el-radio-group v-model="editDataLocal.op">
          <el-radio :label="0">{{ $t('systemSetting.generalPrinter') }}</el-radio>
          <el-radio :label="1">{{ $t('systemSetting.kuaidi100Printer') }}</el-radio>
        </el-radio-group>
        <div class="line-heightOne from-tips">{{ $t('systemSetting.printerSelectionTip') }}</div>
      </el-form-item>
      <div v-if="editDataLocal.op === 1">
        <el-form-item
          :label="$t('systemSetting.cloudPrinterNumberLabel')"
          prop="cloudPrintNo"
          :rules="cloudPrintRules"
        >
          <el-input v-model="editDataLocal.cloudPrintNo" :placeholder="$t('systemSetting.cloudPrinterNumber')"></el-input>
          <div class="line-heightOne from-tips">{{ $t('systemSetting.cloudPrinterNumberTip') }}</div>
        </el-form-item>
      </div>
        <el-form-item
          :label="$t('systemSetting.shippingAddressLabel')"
          prop="senderAddr"
          :rules="senderAddrRules"
        >
          <el-input v-model="editDataLocal.senderAddr" :placeholder="$t('order.pleaseEnterSenderAddress')"></el-input>
          <div class="line-heightOne from-tips">{{ $t('systemSetting.defaultWaybillShippingAddress') }}</div>
        </el-form-item>
        <el-form-item
          :label="$t('systemSetting.senderNameLabel')"
          prop="senderUsername"
          :rules="senderNameRules"
        >
          <el-input v-model="editDataLocal.senderUsername" :placeholder="$t('order.pleaseEnterSenderName')"></el-input>
          <div class="line-heightOne from-tips">{{ $t('systemSetting.defaultWaybillSenderName') }}</div>
        </el-form-item>
        <el-form-item
          :label="$t('systemSetting.senderPhoneLabel')"
          prop="senderPhone"
          :rules="senderPhoneRules"
        >
          <el-input v-model="editDataLocal.senderPhone" :placeholder="$t('order.pleaseEnterSenderPhone')"></el-input>
          <div class="line-heightOne from-tips">{{ $t('systemSetting.defaultWaybillSenderPhone') }}</div>
        </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmitClickUp('editDataLocal')">{{ $t('common.submit') }}</el-button>
      </el-form-item>
    </el-form>
    </el-card>
  </div>
</template>
<script>
import {
  merchantElectrSheetEdit,
  merchantElectrSheetInfo
} from '@/api/systemSetting';
import {validatePhone} from "@/utils/toolsValidate";
export default {
  name: 'editElectrSheet',
  data() {
    return {
      editDataLocal: {
        id: 0, // 编辑时大于0
        cloudPrintNo: "",
        op: 0, // 0=通用打印机 1=快递100打印机
        senderAddr: "",
        senderPhone: "",
        senderUsername: ""
      },
      validatePhone:validatePhone
    };
  },
  computed: {
    uiLocale() {
      return (this.$i18n && this.$i18n.locale) || 'zh-cn';
    },
    cloudPrintRules() {
      this.uiLocale;
      return [{ required: true, message: this.$t('systemSetting.cloudPrinterNumber'), trigger: 'blur' }];
    },
    senderAddrRules() {
      this.uiLocale;
      return [{ required: true, message: this.$t('order.pleaseEnterSenderAddress'), trigger: 'blur' }];
    },
    senderNameRules() {
      this.uiLocale;
      return [{ required: true, message: this.$t('order.pleaseEnterSenderName'), trigger: 'blur' }];
    },
    senderPhoneRules() {
      this.uiLocale;
      return [{ required: true, validator: this.validatePhone, message: this.$t('systemSetting.invalidPhone'), trigger: 'blur' }];
    },
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.handledGetElectrInfo();
    },
    handleSubmitClickUp(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
            this.handledEditElectrConfig(this.editDataLocal);
        } else {
          return false;
        }
      });
    },
    handledEditElectrConfig(param) {
      merchantElectrSheetEdit(param).then((data) => {
        this.$message.success(this.$t('user.saveSuccess'));
        this.handledGetElectrInfo();
      });
    },
    handledGetElectrInfo(){
      merchantElectrSheetInfo().then((data) => {
        if(data){
          this.editDataLocal = data;
        }
      });
    }
  },
};
</script>

<style scoped></style>
