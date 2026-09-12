<template>
  <div>
    <el-form :model="editDataLocal" ref="editDataLocal" label-width="100px" class="demo-dynamic">
      <el-form-item
        :label="$t('systemSetting.configNameLabel')"
        prop="printName"
        :rules="{ required: true, message: $t('systemSetting.printerConfigNameRequired'), trigger: 'blur' }"
      >
        <el-input v-model="editDataLocal.printName" :placeholder="$t('systemSetting.printerConfigName')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('systemSetting.printerTypeLabel')">
        <el-radio-group v-model="editDataLocal.printType">
          <el-radio :label="0">{{ $t('systemSetting.yilianyun') }}</el-radio>
          <el-radio :label="1">{{ $t('systemSetting.feieyun') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <div v-if="editDataLocal.printType === 0">
        <el-form-item
          label="AppId："
          prop="printYlyAppid"
          :rules="{ required: true, message: $t('systemSetting.requiredField', { field: 'AppId' }), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printYlyAppid" placeholder="AppId"></el-input>
        </el-form-item>
        <el-form-item
          label="Userid："
          prop="printYlyUserid"
          :rules="{ required: true, message: $t('systemSetting.requiredField', { field: 'Userid' }), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printYlyUserid" placeholder="Userid"></el-input>
        </el-form-item>
        <el-form-item
          label="Sec："
          prop="printYlySec"
          :rules="{ required: true, message: $t('systemSetting.requiredField', { field: 'Sec' }), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printYlySec" placeholder="Sec"></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('systemSetting.printerCodeLabel')"
          prop="printYlyMerchineNo"
          :rules="{ required: true, message: $t('systemSetting.printerCodeRequired'), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printYlyMerchineNo" :placeholder="$t('systemSetting.printerCode')"></el-input>
        </el-form-item>
      </div>
      <div v-if="editDataLocal.printType === 1">
        <el-form-item
          label="Name："
          prop="printFeName"
          :rules="{ required: true, message: $t('systemSetting.requiredField', { field: 'Name' }), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printFeName" placeholder="Name"></el-input>
        </el-form-item>
        <el-form-item
          label="User："
          prop="printFeUser"
          :rules="{ required: true, message: $t('systemSetting.requiredField', { field: 'User' }), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printFeUser" placeholder="User"></el-input>
        </el-form-item>
        <el-form-item
          label="Ukey："
          prop="printFeUkey"
          :rules="{ required: true, message: $t('systemSetting.requiredField', { field: 'Ukey' }), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printFeUkey" placeholder="Ukey"></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('systemSetting.printerCodeLabel')"
          prop="printFeSn"
          :rules="{ required: true, message: $t('systemSetting.printerCodeRequired'), trigger: 'blur' }"
        >
          <el-input v-model="editDataLocal.printFeSn" :placeholder="$t('systemSetting.printerCode')"></el-input>
        </el-form-item>
      </div>
      <el-form-item :label="$t('user.statusColon')">
        <el-switch
          v-model="editDataLocal.status"
          :active-value="1"
          :active-text="$t('common.enable')"
          :inactive-value="0"
          :inactive-text="$t('common.disable')"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button @click="close">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmitClickUp('editDataLocal')">{{ $t('common.submit') }}</el-button>
    </div>
  </div>
</template>
<script>
import * as systemSetting from '@/api/systemSetting';
export default {
  name: 'editPrintReceipt',
  props: {
    isEdit: {
      type: Boolean,
      required: true,
      default: false,
    },
    editData: {
      type: Object,
      required: true,
      default: {},
    },
  },
  data() {
    return {
      editDataLocal: {
        id: 0, // 编辑时大于0
        merId: 0,
        printType: 0, // 0=易联云 1=飞蛾云
        printName: '',
        printYlyAppid: '',
        printYlyUserid: '',
        printYlySec: '',
        printYlyMerchineNo: '',
        printFeName: '',
        printFeUser: '',
        printFeUkey: '',
        printFeSn: '',
        status: 0, // 0未启用 1=启用
      },
    };
  },
  created() {
    this.initData();
  },
  methods: {
    close() {
      this.$emit('closeDialog');
    },
    initData() {
      if (this.isEdit) {
        const {
          id,
          merId,
          printType,
          printName,
          printYlyAppid,
          printYlyUserid,
          printYlySec,
          printYlyMerchineNo,
          printFeName,
          printFeUser,
          printFeUkey,
          printFeSn,
          status,
        } = this.editData;
        this.editDataLocal.id = id;
        this.editDataLocal.merId = merId;
        this.editDataLocal.printType = printType;
        this.editDataLocal.printName = printName;
        this.editDataLocal.printYlyAppid = printYlyAppid;
        this.editDataLocal.printYlyUserid = printYlyUserid;
        this.editDataLocal.printYlySec = printYlySec;
        this.editDataLocal.printYlyMerchineNo = printYlyMerchineNo;
        this.editDataLocal.printFeName = printFeName;
        this.editDataLocal.printFeUser = printFeUser;
        this.editDataLocal.printFeUkey = printFeUkey;
        this.editDataLocal.printFeUkey = printFeUkey;
        this.editDataLocal.printFeSn = printFeSn;
        this.editDataLocal.status = status;
      }
    },
    handleSubmitClickUp(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            this.handledEditPrintConfig(this.editDataLocal);
          } else {
            this.handledAddPrintConfig(this.editDataLocal);
          }
        } else {
          return false;
        }
      });
    },
    handledAddPrintConfig(param) {
      systemSetting.merchantPrintSave(param).then((data) => {
        this.$message.success(this.$t('common.addSuccess'));
        this.handledCloseDia();
      });
    },
    handledEditPrintConfig(param) {
      systemSetting.merchantPrintEdit(param).then((data) => {
        this.$message.success(this.$t('common.editSuccess'));
        this.handledCloseDia();
      });
    },
    handledCloseDia() {
      this.$emit('unVisible');
    },
  },
};
</script>

<style scoped></style>
