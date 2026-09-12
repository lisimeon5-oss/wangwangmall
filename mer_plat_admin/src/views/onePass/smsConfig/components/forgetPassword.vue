<template>
  <div class="login-container">
    <el-steps :active="current" align-center>
      <el-step :title="$t('onePass.verifyAccountInfo')"></el-step>
      <el-step :title="$t('onePass.modifyAccountPassword')"></el-step>
      <el-step :title="$t('common.login')"></el-step>
    </el-steps>
    <el-form
      ref="formInline"
      :model="formInline"
      size="medium"
      :rules="ruleInline"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <template v-if="current === 0">
        <el-form-item prop="phone">
          <el-input
            type="text"
            v-model="formInline.phone"
            prefix="ios-contact-outline"
            :placeholder="$t('onePass.pleaseEnterPhone')"
            size="large"
            :readonly="infoData.phone ? true : false"
          />
        </el-form-item>
        <el-form-item prop="code" class="captcha">
          <div class="acea-row" style="flex-wrap: nowrap">
            <el-input
              ref="username"
              v-model="formInline.code"
              :placeholder="$t('onePass.verificationCode')"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="off"
              prefix-icon="el-icon-message"
              style="width: 90%"
            />
            <el-button
              size="mini"
              :disabled="!this.canClick"
              @click="cutDown"
              v-hasPermi="['platform:one:pass:send:code']"
              >{{ cutNUm }}</el-button
            >
          </div>
        </el-form-item>
      </template>
      <template v-if="current === 1">
        <el-form-item prop="password" class="maxInpt">
          <el-input
            type="password"
            v-model="formInline.password"
            prefix="ios-lock-outline"
            :placeholder="$t('maintain.pleaseEnterNewPassword')"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="checkPass" class="maxInpt">
          <el-input
            type="password"
            v-model="formInline.checkPass"
            prefix="ios-lock-outline"
            :placeholder="$t('onePass.pleaseVerifyNewPassword')"
            size="large"
          />
        </el-form-item>
      </template>
      <template v-if="current === 2">
        <el-form-item prop="phone" class="maxInpt">
          <el-input type="text" v-model="formInline.phone" prefix="ios-contact-outline" :placeholder="$t('onePass.pleaseEnterPhone')" />
        </el-form-item>
        <el-form-item prop="password" class="maxInpt">
          <el-input type="password" v-model="formInline.password" prefix="ios-lock-outline" :placeholder="$t('login.pleaseEnterPassword')" />
        </el-form-item>
      </template>
      <el-form-item class="maxInpt">
        <el-button
          v-if="current === 0"
          type="primary"
          @click="handleSubmit1('formInline', current)"
          class="mb20 width100"
          >{{ $t('product.nextStep') }}</el-button
        >
        <el-button
          v-if="current === 1 && checkPermi(['platform:one:pass:update:password'])"
          type="primary"
          @click="handleSubmit2('formInline', current)"
          class="mb20 width100"
          >{{ $t('common.submit') }}</el-button
        >
        <el-button
          v-if="current === 2 && checkPermi(['platform:one:pass:login'])"
          type="primary"
          @click="handleSubmit('formInline', current)"
          class="mb20 width100"
          >{{ $t('common.login') }}</el-button
        >
        <el-button @click="returns('formInline')" class="width100" style="margin-left: 0px">{{ $t('common.back') }}</el-button>
      </el-form-item>

      <!--<el-button v-if="current === 0"  size="mini" :loading="loading" type="primary" style="width:100%;margin-bottom:20px;" @click="handleSubmit('formInline')">{{ $t('onePass.register') }}</el-button>-->
      <!--<el-button size="mini" type="primary" style="width:100%;margin-bottom:20px;" @click="changelogo">{{ $t('onePass.loginNow') }}</el-button>-->
    </el-form>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import { updatePasswordApi, captchaApi, configApi } from '@/api/sms';
import { checkPermi } from '@/utils/permission';
import { validatePhone } from '@/utils/toolsValidate'; // 权限判断函数
export default {
  name: 'forgetPassword',
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('login.pleaseEnterPassword')));
      } else {
        if (this.current === 1) {
          if (this.formInline.checkPass !== '') {
            this.$refs.formInline.validateField('checkPass');
          }
          callback();
        } else {
          if (value !== this.formInline.checkPass) {
            callback(new Error(this.$t('onePass.pleaseEnterCorrectPassword')));
          }
          callback();
        }
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('maintain.pleaseReenterPassword')));
      } else if (value !== this.formInline.password) {
        callback(new Error(this.$t('maintain.passwordMismatch')));
      } else {
        callback();
      }
    };
    return {
      isReadonly: false,
      cutNUm: this.$t('onePass.getVerificationCode'),
      canClick: true,
      current: 0,
      formInline: {
        account: '',
        phone: '',
        code: '',
        password: '',
        checkPass: '',
      },
      ruleInline: {
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        code: [{ required: true, message: this.$t('onePass.pleaseEnterVerificationCode'), trigger: 'blur' }],
        password: [{ validator: validatePass, trigger: 'blur' }],
        checkPass: [{ validator: validatePass2, trigger: 'blur' }],
      },
    };
  },
  props: {
    infoData: {
      type: Object,
      default: null,
    },
  },
  mounted() {
    this.infoData ? (this.formInline.phone = this.infoData.phone) : (this.formInline.phone = '');
  },
  methods: {
    checkPermi,
    // 短信验证码
    cutDown() {
      if (this.formInline.phone) {
        if (!this.canClick) return;
        this.canClick = false;
        this.cutNUm = 60;
        let data = {
          phone: this.formInline.phone,
          types: 1,
        };
        captchaApi(data).then(async (res) => {
          this.$message.success(res.msg);
        });
        let time = setInterval(() => {
          this.cutNUm--;
          if (this.cutNUm === 0) {
            this.cutNUm = this.$t('onePass.getVerificationCode');
            this.canClick = true;
            clearInterval(time);
          }
        }, 1000);
      } else {
        this.$message.warning(this.$t('onePass.pleaseEnterPhoneExcl'));
      }
    },
    handleSubmit1(name, current) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.current = 1;
        } else {
          return false;
        }
      });
    },
    handleSubmit2(name) {
      this.formInline.account = this.formInline.phone;
      this.$refs[name].validate((valid) => {
        if (valid) {
          updatePasswordApi(this.formInline).then(async (res) => {
            this.$message.success(this.$t('category.updateSuccess'));
            this.current = 2;
          });
        } else {
          return false;
        }
      });
    },
    //登录
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          configApi({
            account: this.formInline.account,
            password: this.formInline.password,
          }).then(async (res) => {
            this.$message.success(this.$t('onePass.loginSuccessExcl'));
            this.$emit('on-Login');
          });
        } else {
          return false;
        }
      });
    },
    returns() {
      this.current === 0 ? this.$emit('goback') : (this.current = 0);
    },
  },
};
</script>

<style scoped lang="scss">
.login-form {
  flex: 1;
  padding: 32px 0;
  text-align: center;
  width: 384px;
  margin: 0 auto;
  overflow: hidden;
}
.width100 {
  width: 100%;
}

.maxInpt {
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.code {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ivu-steps-item:last-child {
  width: unset !important;
}
</style>
