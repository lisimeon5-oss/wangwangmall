<template>
  <div>
    <el-form ref="pram" :model="pram" :rules="rules" label-width="90px" @submit.native.prevent>
      <el-form-item required :label="$t('systemSetting.adminPasswordLabel')" prop="password">
        <el-input v-model.trim="pram.password" :placeholder="$t('systemSetting.adminPassword')" clearable type="password" />
      </el-form-item>
      <el-form-item v-if="pram.password" required :label="$t('systemSetting.confirmPasswordLabel')" prop="confirmPassword">
        <el-input v-model.trim="pram.confirmPassword" type="password" :placeholder="$t('systemSetting.confirmPassword')" clearable />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button @click="close">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button type="primary" @click="handlerSubmit('pram')" v-hasPermi="['platform:admin:update:password']"
        >{{ $t('el.messagebox.confirm') }}</el-button
      >
    </div>
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
import * as roleApi from '@/api/role.js';
import * as systemAdminApi from '@/api/systemadmin.js';
import { Debounce } from '@/utils/validate';
import { editPassWordApi } from '@/api/systemadmin.js';
export default {
  // name: "edit"
  components: {},
  props: {
    adminId: {
      type: Number,
      required: 0,
    },
  },
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
        callback(new Error(this.$t('systemSetting.pleaseEnterAdminPassword')));
      } else {
        if (this.pram.confirmPassword !== '') {
          this.$refs.pram.validateField('confirmPassword');
        }
        callback();
      }
    };
    return {
      constants: this.$constants,
      pram: {
        password: '',
        confirmPassword: '',
        id: 0,
      },
      roleList: [],
      rules: {
        password: [
          { required: true, validator: validatePass, trigger: 'blur' },
          { required: true, min: 6, max: 20, message: this.$t('maintain.passwordLength6to20') },
        ],
        confirmPassword: [
          { required: true, message: this.$t('systemSetting.confirmPasswordPassword'), validator: confirmvalidatePass, trigger: ['blur', 'change'] },
        ],
      },
    };
  },
  methods: {
    close() {
      this.$emit('hideEditPassWordDialog');
    },
    handlerSubmit: Debounce(function (form) {
      this.$refs[form].validate((valid) => {
        if (!valid) return;
        this.handlerSave();
      });
    }),
    handlerSave() {
      this.pram.id = this.adminId;
      systemAdminApi.editPassWordApi(this.pram).then((data) => {
        this.$message.success(this.$t('systemSetting.modifyPasswordSuccess'));
        this.$emit('hideEditPassWordDialog');
      });
    },
    rulesSelect(selectKeys) {
      this.pram.rules = selectKeys;
    },
  },
};
</script>

<style scoped></style>
