<template>
  <div class="divBox">
    <el-card shadow="never" :bordered="false" class="box-card mt14" :body-style="{ padding: '20px' }">
      <el-button size="small" type="primary" @click="handleAddAddress" v-hasPermi="['merchant:address:add']"
        >{{ $t('systemSetting.addAddress') }}</el-button
      >
      <el-table v-loading="listLoading" :data="tableData.data" class="mt20" size="small">
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :show-overflow-tooltip="true" :label="$t('systemSetting.merchantAddress')" min-width="280">
          <template slot-scope="scope">
            <span v-show="scope.row.isDefault" style="color: #409eff" class="mr5">[{{ $t('systemSetting.defaultReturn') }}]</span>
            <span>{{ scope.row.detail }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="receiverName" :label="$t('systemSetting.merchantName')" min-width="100" />
        <el-table-column prop="receiverPhone" :label="$t('systemSetting.merchantPhone')" min-width="100" />
        <el-table-column :label="$t('systemSetting.enabled')" min-width="100" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:address:update:show'])"
              v-model="scope.row.isShow"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              :disabled="scope.row.isDefault"
              @click.native="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.isShow ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="180" fixed="right">
          <template slot-scope="scope">
            <a @click="handleEditAddress(scope.row)" v-hasPermi="['merchant:address:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <template v-if="!scope.row.isDefault && checkPermi(['merchant:address:set:default']) && scope.row.isShow">
              <a @click="handleSetIsDefault(scope.row)">{{ $t('systemSetting.setDefault') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <a @click="handleDelAddress(scope.row)" v-hasPermi="['merchant:address:delete']">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加-->
    <el-dialog
      :title="formData.id === 0 ? $t('systemSetting.addAddress') : $t('systemSetting.editAddress')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="540px"
      :before-close="handleClose"
    >
      <el-form
        v-if="dialogVisible"
        :model="formData"
        :rules="rules"
        ref="formData"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="$t('systemSetting.merchantAddressLabel')" prop="detail">
          <el-input type="textarea" v-model.trim="formData.detail" :placeholder="$t('systemSetting.pleaseEnterMerchantAddress')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.merchantNameLabel')" prop="receiverName">
          <el-input v-model.trim="formData.receiverName" :placeholder="$t('systemSetting.pleaseEnterMerchantName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.merchantPhoneLabel')" prop="receiverPhone">
          <el-input
            v-model.trim="formData.receiverPhone"
            maxlength="11"
            class="width100"
            :placeholder="$t('systemSetting.pleaseEnterMerchantPhone')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.enabledStatusLabel')">
          <el-switch v-model="formData.isShow" class="mr20" :active-text="$t('common.open')" :inactive-text="$t('common.close')"></el-switch>
          <el-checkbox v-show="formData.isShow" v-model="formData.isDefault">{{ $t('systemSetting.setDefaultShippingAddress') }}</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="btnLoading" @click="submitForm('formData')">{{ $t('common.save') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import {
  merchantAddressDeleteApi,
  merchantAddressListApi,
  merchantAddressSaveApi,
  merchantAddressSetDefaultApi,
  merchantAddressUpdateApi,
  merchantAddressUpdateShowApi,
} from '@/api/systemSetting';
import { roterPre } from '@/settings';
import { checkPermi } from '@/utils/permission';
import { Debounce } from '@/utils/validate';
import { validatePhone } from '@/utils/toolsValidate';
const defaultFormData = {
  detail: '',
  id: 0,
  isDefault: false,
  isShow: false,
  receiverName: '',
  receiverPhone: '',
};
export default {
  name: 'BusinessAddress',
  data() {
    return {
      dialogVisible: false,
      btnLoading: false,
      roterPre: roterPre,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: this.$constants.page.limit[0],
        status: '',
        name: '',
        type: '',
        useType: '',
      },
      formData: Object.assign({}, defaultFormData),
      rules: {
        detail: [{ required: true, message: this.$t('systemSetting.pleaseEnterMerchantAddress'), trigger: 'blur' }],
        receiverName: [{ required: true, message: this.$t('systemSetting.pleaseEnterMerchantName'), trigger: 'blur' }],
        receiverPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
      },
    };
  },
  mounted() {
    if (checkPermi(['merchant:address:list'])) this.getList();
  },
  methods: {
    checkPermi,
    handleClose() {
      this.dialogVisible = false;
    },
    //添加
    handleAddAddress() {
      this.formData = Object.assign({}, defaultFormData);
      this.dialogVisible = true;
    },
    //编辑
    handleEditAddress(row) {
      this.formData = JSON.parse(JSON.stringify(row));
      this.dialogVisible = true;
    },
    submitForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (!this.formData.isShow) this.formData.isDefault = false;
          this.formData.id === 0
            ? merchantAddressSaveApi(this.formData)
                .then((res) => {
                  this.$message.success(this.$t('common.addSuccess'));
                  this.dialogVisible = false;
                  this.getList();
                })
                .catch(() => {
                  this.btnLoading = false;
                })
            : merchantAddressUpdateApi(this.formData)
                .then((res) => {
                  this.$message.success(this.$t('common.editSuccess'));
                  this.dialogVisible = false;
                  this.getList();
                })
                .catch(() => {
                  this.btnLoading = false;
                });
        } else {
          return false;
        }
      });
    }),
    // 列表
    getList() {
      this.listLoading = true;
      merchantAddressListApi()
        .then((res) => {
          this.tableData.data = res;
          localStorage.setItem('merchantAddressList', JSON.stringify(res));
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    // 修改状态
    onchangeIsShow(row) {
      if (row.isDefault) return;
      merchantAddressUpdateShowApi(row.id)
        .then(() => {
          this.$message.success(this.$t('user.modifySuccess'));
          this.getList();
        })
        .catch(() => {
          row.status = !row.status;
        });
    },
    // 设置默认地址
    handleSetIsDefault(rowData) {
      this.$modalSure(this.$t('systemSetting.setDefaultAddressConfirm')).then(() => {
        merchantAddressSetDefaultApi(rowData.id).then(() => {
          this.$message.success(this.$t('systemSetting.setSuccess'));
          this.getList();
        });
      });
    },
    handleDelAddress(rowData) {
      this.$modalSure(this.$t('systemSetting.confirmDeleteCurrentData')).then(() => {
        merchantAddressDeleteApi(rowData.id).then(() => {
          this.$message.success(this.$t('common.deleteSuccess'));
          this.getList();
        });
      });
    },
  },
};
</script>

<style scoped lang="scss">
.fa {
  color: #0a6aa1;
  display: block;
}
.sheng {
  color: #ff0000;
  display: block;
}
</style>
