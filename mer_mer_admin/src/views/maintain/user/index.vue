<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-form ref="pram" :model="pram" :rules="rules" label-width="100px">
        <el-form-item :label="$t('maintain.adminAccountLabel')" prop="account">
          <el-input v-model.trim="pram.account" class="from-ipt-width" :placeholder="$t('maintain.adminAccount')" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('maintain.adminNameLabel')" prop="realName">
          <el-input
            :disabled="type === 'password'"
            v-model.trim="pram.realName"
            maxlength="16"
            class="from-ipt-width"
            :placeholder="$t('maintain.adminName')"
          />
        </el-form-item>
        <el-form-item v-if="type === 'password'" :label="$t('maintain.originalPasswordLabel')" prop="oldPassword">
          <el-input
            v-model.trim="pram.oldPassword"
            type="password"
            class="from-ipt-width"
            :placeholder="$t('maintain.originalPassword')"
            clearable
          />
        </el-form-item>
        <el-form-item v-if="type === 'password'" :label="$t('maintain.newPasswordLabel')" prop="password">
          <el-input
            v-model.trim="pram.password"
            type="password"
            class="from-ipt-width"
            :placeholder="$t('maintain.newPassword')"
            clearable
          />
        </el-form-item>
        <el-form-item v-if="pram.password" :label="$t('maintain.confirmNewPasswordLabel')" prop="confirmPassword">
          <el-input
            v-model.trim="pram.confirmPassword"
            class="from-ipt-width"
            type="password"
            :placeholder="$t('maintain.confirmNewPassword')"
            clearable
          />
        </el-form-item>
        <el-form-item v-hasPermi="['merchant:login:admin:update:password', 'merchant:login:admin:update']">
          <el-button type="primary" @click="handlerSubmit('pram')">{{ $t('common.submit') }}</el-button>
          <el-button @click="close('pram')">{{ $t('common.cancel') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
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

import * as systemAdminApi from '@/api/systemadmin.js';
import Cookies from 'js-cookie';
import { Debounce } from '@/utils/validate';
import { checkPermi } from '@/utils/permission';
export default {
  name: 'index',
  data() {
    const confirmvalidatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('maintain.pleaseReenterPassword')));
      } else if (value !== this.pram.password) {
        callback(new Error(this.$t('maintain.passwordMismatch')));
      } else {
        callback();
      }
    };
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('maintain.pleaseEnterNewPassword')));
      } else {
        if (this.pram.confirmPassword !== '') {
          this.$refs.pram.validateField('confirmPassword');
        }
        callback();
      }
    };
    const JavaMerInfo = JSON.parse(Cookies.get('JavaMerInfo'));
    return {
      password: '',
      JavaMerInfo: JSON.parse(Cookies.get('JavaMerInfo')),
      pram: {
        account: JavaMerInfo.account,
        password: '',
        oldPassword: '',
        confirmPassword: '',
        realName: JavaMerInfo.realName,
        id: JavaMerInfo.id,
      },
      roleList: [],
      rules: {
        account: [{ required: true, message: this.$t('maintain.pleaseEnterAdminAccount'), trigger: ['blur', 'change'] }],
        oldPassword: [{ required: true, message: this.$t('maintain.pleaseEnterOriginalPassword'), trigger: ['blur', 'change'] }],
        password: [
          { required: true, validator: validatePass, trigger: 'blur' },
          { required: true, min: 6, max: 20, message: this.$t('maintain.passwordLength6to20') },
        ],
        confirmPassword: [{ required: true, validator: confirmvalidatePass, trigger: ['blur', 'change'] }],
        realName: [{ required: true, message: this.$t('maintain.adminName'), trigger: ['blur', 'change'] }],
      },
      type: 'users', //个人中心还是修改密码
    };
  },
  watch: {
    $route(to, from) {
      this.type = this.$route.params.type;
      this.tempRoute = Object.assign({}, this.$route);
      this.setTagsViewTitle();
    },
  },
  created() {
    this.type = this.$route.params.type;
    this.tempRoute = Object.assign({}, this.$route);
  },
  mounted() {
    this.setTagsViewTitle();
  },
  methods: {
    checkPermi,
    //设置头部标题
    setTagsViewTitle() {
      const title = this.type === 'password' ? this.$t('maintain.modifyPassword') : this.$t('maintain.personalCenter');
      const route = Object.assign({}, this.tempRoute, { title: `${title}` });
      this.$store.dispatch('tagsView/updateVisitedView', route);
    },
    close(formName) {
      this.$refs[formName].resetFields();
    },
    handlerSubmit: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.type === 'password') {
            this.onSavePassword();
          } else {
            this.onSaveAccount();
          }
        } else {
          return false;
        }
      });
    }),
    //保存密码
    onSavePassword() {
      systemAdminApi.adminPasswordUpdate(this.pram).then((data) => {
        this.$message.success(this.$t('user.submitSuccess'));
        this.$router.go(-1);
      });
    },
    //保存账号
    onSaveAccount() {
      systemAdminApi.adminAccountUpdate(this.pram).then((data) => {
        this.$message.success(this.$t('user.submitSuccess'));
        this.$router.go(-1);
      });
    },
  },
};
</script>

<style scoped></style>
