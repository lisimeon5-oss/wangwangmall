<template>
  <div>
    <el-alert :title="$t('order.agreeRefundReturnTip')" type="warning" show-icon class="mb20"> </el-alert>
    <div>
      <div class="detail-term mb20">
        <span class="detail-infoTitle">{{ $t('order.returnMethod') }}</span
        ><span class="detail-info">{{ refundInfo.afterSalesType === 1 ? $t('order.onlyRefund') : $t('order.returnRefund') }}</span>
      </div>
      <div class="detail-term acea-row">
        <span class="detail-infoTitle">{{ $t('order.returnAddressLabel') }}</span>
        <div v-if="!addressList.length">{{ $t('order.addAfterSalesAddressFirst') }}</div>
        <div v-else v-loading="listLoading" class="h-82%">
          <div v-for="item in addressList" :key="item.id">
            <div v-if="item.isShow" class="">
              <el-card class="box-card" shadow="never" :bordered="false">
                <div class="acea-row row-between">
                  <div class="text-14 text-666 address">
                    <div class="mb10">
                      {{ item.province }}{{ item.city }}{{ item.district }}{{ item.street }}{{ item.detail }}
                      <span v-show="item.isDefault" style="color: #409eff" class="ml10">[{{ $t('order.defaultReturn') }}]</span>
                    </div>
                    <div class="">
                      <span class="w-70px inline-block mr15">{{ item.receiverName }}</span
                      >{{ item.receiverPhone }}
                    </div>
                  </div>
                  <div>
                    <el-radio-group v-model="defaultId" @change="handleChecked">
                      <el-radio :label="item.id" size="large">
                        <span class="text-14px text-#666">{{ $t('order.selectAddress') }}</span>
                      </el-radio>
                    </el-radio-group>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="dialog-footer-inner">
      <el-button @click="handleCancel">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">{{ $t('finance.confirmSpaced') }}</el-button>
    </div>
  </div>
</template>
<script>
import { merchantAddressListApi } from '@/api/systemSetting';
import { orderAuditApi, orderRefuseApi } from '@/api/order';

export default {
  name: 'agreeToReturn',
  props: {
    refundInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      listLoading: false,
      addressList: [],
      defaultId: 0,
      loading: false,
    };
  },
  mounted() {
    if (localStorage.getItem('merchantAddressList')) {
      this.addressList = JSON.parse(localStorage.getItem('merchantAddressList'));
      let data = this.addressList.find((item) => item.isDefault);
      if (data) {
        this.defaultId = data.id;
      }
    } else {
      this.getList();
    }
  },
  methods: {
    //确定提交
    handleSubmit() {
      this.submit();
    },
    // 提交方法
    submit() {
      this.loading = true;
      orderAuditApi({
        auditType: 'success',
        refundOrderNo: this.refundInfo.refundOrderNo,
        merAddressId: this.defaultId,
      })
        .then((res) => {
          this.loading = false;
          this.$message.success(this.$t('common.auditSuccess'));
          this.$emit('onHandleSuccess');
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    handleCancel() {
      this.$emit('onHandleCancel');
    },
    // 列表
    getList() {
      this.listLoading = true;
      merchantAddressListApi()
        .then((res) => {
          this.addressList = res;
          if (this.addressList.length) {
            localStorage.setItem('merchantAddressList', JSON.stringify(res));
            let data = this.addressList.find((item) => item.isDefault);
            this.defaultId = data.id;
          }
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    handleClose() {
      this.dialogVisible = false;
    },
    //选中地址
    handleChecked() {},
  },
};
</script>
<style scoped lang="scss">
.dialog-footer {
  text-align: right;
  padding-top: 20px;
}
.box-card {
  width: 675px;
}
.address {
  width: 450px;
}
::v-deep .el-card__body {
  padding: 0 15px 15px 0 !important;
}
</style>
