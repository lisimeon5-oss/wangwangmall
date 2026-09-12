<template>
  <div class="login-container">
    <el-row type="flex">
      <el-col :span="24">
        <el-form
          ref="formInline"
          size="small"
          :model="formInline"
          :rules="ruleInline"
          class="login-form"
          autocomplete="on"
          label-position="left"
        >
          <div class="title-container">
            <h3 class="title mb15">{{ $t('onePass.smsAccountLogin') }}</h3>
          </div>
          <el-form-item prop="account">
            <el-input
              ref="account"
              v-model="formInline.account"
              :placeholder="$t('login.username')"
              prefix-icon="el-icon-user"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              :key="passwordType"
              ref="password"
              v-model="formInline.password"
              :type="passwordType"
              :placeholder="$t('login.password')"
              name="password"
              tabindex="2"
              auto-complete="off"
              prefix-icon="el-icon-lock"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-button
            size="mini"
            :loading="loading"
            type="primary"
            style="width: 100%; margin-bottom: 20px"
            @click="handleSubmit('formInline')"
            v-hasPermi="['platform:one:pass:login']"
            >{{ $t('common.login') }}
          </el-button>
          <div class="acea-row row-center-wrapper mb20">
            <el-button
              v-hasPermi="['platform:one:pass:update:password']"
              size="mini"
              type="text"
              style="margin-left: 0"
              @click="changePassword"
              >{{ $t('onePass.forgotPassword') }}</el-button
            >
            <el-divider direction="vertical"></el-divider>
            <el-button
              size="mini"
              type="text"
              style="margin-left: 0"
              v-hasPermi="['platform:one:pass:register']"
              @click="changeReg"
              >{{ $t('onePass.registerAccount') }}</el-button
            >
          </div>
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('onePass.onePassIntro')"
            placement="bottom"
          >
            <span style="margin-left: 0">{{ $t('onePass.platformDescription') }}</span>
          </el-tooltip>
        </el-form>
      </el-col>
    </el-row>
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
import { configApi } from '@/api/sms';
export default {
  name: 'Login',
  data() {
    return {
      formInline: {
        account: '',
        password: '',
      },
      ruleInline: {
        account: [{ required: true, message: this.$t('login.pleaseEnterUsername'), trigger: 'blur' }],
        password: [{ required: true, message: this.$t('login.pleaseEnterPassword'), trigger: 'blur' }],
      },
      passwordType: 'password',
      loading: false,
    };
  },
  created() {
    var _this = this;
    document.onkeydown = function (e) {
      const key = window.event.keyCode;
      if (key === 13) {
        _this.handleSubmit('formInline');
      }
    };
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = '';
      } else {
        this.passwordType = 'password';
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loading = true;
          configApi(this.formInline)
            .then(async (res) => {
              this.$message.success(this.$t('onePass.loginSuccessExcl'));
              this.$store.dispatch('user/isLogin');
              this.$emit('on-Login');
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    // 修改密码
    changePassword() {
      this.$emit('on-change');
    },
    changeReg() {
      this.$emit('on-changes');
    },
  },
};
</script>
<style lang="scss" scoped>
.title {
  text-align: center;
}
.captcha {
  display: flex;
  align-items: flex-start;
}
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
.imgs {
  img {
    height: 36px;
  }
}
.login-form {
  flex: 1;
  padding: 32px 0;
  text-align: center;
  width: 384px;
  margin: 0 auto;
  overflow: hidden;
}
.tips {
  font-size: 14px;
  color: #fff;
  margin-bottom: 10px;

  span {
    &:first-of-type {
      margin-right: 16px;
    }
  }
}
.svg-container {
  padding: 6px 5px 6px 15px;
  color: $dark_gray;
  vertical-align: middle;
  width: 30px;
  display: inline-block;
}
.thirdparty-button {
  position: absolute;
  right: 0;
  bottom: 6px;
}
</style>
