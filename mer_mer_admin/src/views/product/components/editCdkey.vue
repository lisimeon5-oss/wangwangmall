<template>
  <el-dialog
    :visible.sync="cdkeyShow"
    :title="$t('product.editCdkey')"
    width="950px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="dialog-bottom"
  >
    <div class="carMywrapper">
      <div class="type-radio">
        <el-form label-width="80px" :model="carMyValidateForm" ref="carMyValidateForm" :inline="true">
          <el-form-item
            :label="$t('product.cardNumber')"
            prop="cardNumber"
            :rules="{
              required: true,
              message: $t('product.cardNumberRequired'),
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="carMyValidateForm.cardNumber"
              style="width: 300px"
              class="mr15"
              :placeholder="$t('product.cardNumberPlaceholder')"
            ></el-input>
          </el-form-item>
          <el-form-item
            :label="$t('product.cdkey')"
            prop="secretNum"
            :rules="{
              required: true,
              message: $t('product.cdkeyRequired'),
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="carMyValidateForm.secretNum"
              style="width: 300px"
              class="mr15"
              :placeholder="$t('product.cdkeyPlaceholder')"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog-footer-inner dialog-bottom-top">
        <el-button class="btns" size="small" @click="handleClose">{{ $t('product.cancel') }}</el-button>
        <el-button
          :loading="btnloading"
          type="primary"
          class="btns"
          size="small"
          @click="submitForm('carMyValidateForm')"
          >{{ $t('product.save') }}</el-button
        >
      </div>
    </div>
  </el-dialog>
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
import { getToken } from '@/utils/auth';
// import exportExcel from '@/utils/newToExcel.js';
import { importCard, exportProductCard } from '@/api/product';
import { cardSecretSaveApi, cardSecretUpdateApi } from '@/api/productCdkey';
import { Debounce } from '@/utils/validate';
export default {
  name: 'editCdkey',
  props: {
    cdkeyInfo: {
      type: Object,
      default: function () {
        return null;
      },
    },
  },
  data() {
    return {
      cdkeyShow: false,
      carMyValidateForm: {
        cardNumber: '',
        secretNum: '',
        id: 0,
      },
      btnloading: false,
    };
  },
  watch: {
    cdkeyInfo: {
      handler(nVal, oVal) {
        this.carMyValidateForm = JSON.parse(JSON.stringify(nVal));
        // Object.assign(this.carMyValidateForm, nVal);
      },
      deep: true,
    },
  },
  mounted() {},
  methods: {
    //添加行
    handleAddCard() {
      this.carMyValidateForm.carMyList.push({
        cardNumber: '',
        secretNum: '',
        key: Date.now(),
      });
    },
    handleClose() {
      this.cdkeyShow = false;
      this.$refs.carMyValidateForm.resetFields();
    },
    //保存
    submitForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.btnloading = true;
          cardSecretUpdateApi(this.carMyValidateForm)
            .then((res) => {
              this.$message.success(this.$t('product.editSuccess'));
              this.btnloading = false;
              this.handleClose();
              this.$emit('handlerEditSubSuccess');
            })
            .catch((res) => {
              this.btnloading = false;
            });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }),
  },
};
</script>

<style lang="scss" scoped>
.lable {
  text-align: right;
  margin-right: 12px;
}
.width15 {
  width: 150px;
}
::v-deep .el-radio__label {
  font-size: 13px;
}
.carMywrapper {
  .download {
    margin-left: 10px;
  }
  .stock-disk {
    margin: 10px 0 15px 0;
  }
  .scroll-virtual {
    max-height: 320px;
    overflow-y: auto;
    margin-top: 10px;
  }
  .virtual-title {
    width: 50px;
  }
  .deteal-btn {
    color: #5179ea;
    cursor: pointer;
  }
  .add-more {
    margin-top: 20px;
    line-height: 32px;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
    button {
      margin-left: 10px;
    }
  }
}
::v-deep .el-input-group--append .el-input__inner {
  padding-right: 0;
}
</style>
