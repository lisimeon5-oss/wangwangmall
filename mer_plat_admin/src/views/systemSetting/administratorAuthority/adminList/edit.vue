<template>
  <div>
    <el-form ref="pram" :model="pram" :rules="rules" label-width="100px" @submit.native.prevent>
      <el-form-item :label="$t('maintain.adminAccountLabel')" prop="account">
        <el-input v-model.trim="pram.account" :placeholder="$t('maintain.adminAccount')" />
      </el-form-item>
      <el-form-item v-if="isCreate === 0" :label="$t('systemSetting.adminPasswordLabel')" prop="pwd">
        <el-input v-model.trim="pram.pwd" type="password" :placeholder="$t('systemSetting.adminPassword')" clearable />
      </el-form-item>
      <el-form-item v-if="pram.pwd && isCreate === 0" required :label="$t('systemSetting.confirmPasswordLabel')" prop="repwd">
        <el-input v-model.trim="pram.repwd" :placeholder="$t('systemSetting.confirmPassword')" clearable />
      </el-form-item>
      <el-form-item :label="$t('maintain.adminNameLabel')" prop="realName">
        <el-input v-model.trim="pram.realName" maxlength="16" :placeholder="$t('maintain.adminName')" />
      </el-form-item>
      <el-form-item :label="$t('systemSetting.adminIdentityLabel')" prop="roles">
        <el-select v-model="pram.roles" :placeholder="$t('systemSetting.identity')" clearable multiple style="width: 100%">
          <el-option v-for="(item, index) in roleList.list" :key="index" :label="localizedRoleName(item)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('user.phoneLabel')" prop="phone">
        <el-input
          type="text"
          v-model.trim="pram.phone"
          prefix="ios-contact-outline"
          :placeholder="$t('onePass.pleaseEnterPhone')"
          size="large"
        />
      </el-form-item>
      <el-form-item :label="$t('user.statusColon')">
        <el-switch
          :active-text="$t('common.open')"
          :inactive-text="$t('common.close')"
          v-model="pram.status"
          :active-value="true"
          :inactive-value="false"
        />
      </el-form-item>
      <el-form-item> </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button @click="close">{{ $t('el.messagebox.cancel') }}</el-button>
      <el-button
        type="primary"
        @click="handlerSubmit('pram')"
        v-hasPermi="['platform:admin:save', 'platform:admin:update']"
      >
        {{ isCreate === 0 ? $t('el.messagebox.confirm') : $t('systemSetting.update') }}</el-button
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
import { validatePhone } from '@/utils/toolsValidate';
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  // name: "edit"
  components: {},
  props: {
    isCreate: {
      type: Number,
      required: true,
    },
    editData: {
      type: Object,
      default: () => {
        return { rules: [] };
      },
    },
  },
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('systemSetting.pleaseEnterAdminPassword')));
      } else {
        if (this.pram.repwd !== '') {
          this.$refs.pram.validateField('repwd');
        }
        callback();
      }
    };
    const confirmvalidatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('maintain.pleaseReenterPassword')));
      } else if (value !== this.pram.pwd) {
        callback(new Error(this.$t('maintain.passwordMismatch')));
      } else {
        callback();
      }
    };
    return {
      constants: this.$constants,
      pram: {
        account: null,
        level: null,
        pwd: '',
        repwd: '',
        realName: null,
        roles: [],
        status: null,
        id: null,
        phone: null,
      },
      roleList: [],
      rules: {
        account: [{ required: true, message: this.$t('maintain.pleaseEnterAdminAccount'), trigger: ['blur', 'change'] }],
        pwd: [
          { required: true, validator: validatePass, trigger: 'blur' },
          { required: true, min: 6, max: 20, message: this.$t('maintain.passwordLength6to20') },
        ],
        repwd: [{ required: true, validator: confirmvalidatePass, trigger: 'blur' }],
        realName: [{ required: true, message: this.$t('systemSetting.pleaseEnterAdminName'), trigger: ['blur', 'change'] }],
        roles: [{ required: true, message: this.$t('systemSetting.pleaseSelectAdminIdentity'), trigger: ['blur', 'change'] }],
        phone: [{ validator: validatePhone, trigger: ['blur', 'change'] }],
      },
    };
  },
  mounted() {
    this.initEditData();
    this.handleGetRoleList();
  },
  methods: {
    localizedRoleName(row) {
      return getLocalizedText(row ? row.roleName : '', row ? row.roleNameJson : '', getUiLocale(this));
    },
    close() {
      this.$emit('hideEditDialog');
    },
    handleGetRoleList() {
      const _pram = {
        page: 1,
        limit: this.constants.page.limit[4],
        status: 1,
      };
      roleApi.getRoleList(_pram).then((data) => {
        this.roleList = data;
        let arr = [];
        data.list.forEach((item) => {
          arr.push(item.id);
        });
        if (!arr.includes(Number.parseInt(this.pram.roles))) {
          this.$set(this.pram, 'roles', []);
        }
      });
    },
    initEditData() {
      if (this.isCreate !== 1) return;
      const { account, realName, roles, level, status, id, phone } = this.editData;
      this.pram.account = account;
      this.pram.realName = realName;
      const _roles = [];
      if (roles.length > 0 && !roles.includes(',')) {
        //如果权限id集合有长度并且是只有一个，就将它Push进_roles这个数组
        _roles.push(Number.parseInt(roles));
      } else {
        //否则就将多个id集合解构以后push进roles并且转换为整型
        _roles.push(...roles.split(',').map((item) => Number.parseInt(item)));
      }
      this.pram.roles = _roles;
      this.pram.status = status;
      this.pram.id = id;
      this.pram.phone = phone;
      this.rules.pwd = [];
      this.rules.repwd = [];
    },
    handlerSubmit: Debounce(function (form) {
      this.$refs[form].validate((valid) => {
        if (!valid) return;
        if (this.isCreate === 0) {
          this.handlerSave();
        } else {
          this.handlerEdit();
        }
      });
    }),
    handlerSave() {
      systemAdminApi.adminAdd(this.pram).then((data) => {
        this.$message.success(this.$t('systemSetting.createAdminSuccess'));
        this.$emit('hideEditDialog');
      });
    },
    handlerEdit() {
      this.pram.roles = this.pram.roles.join(',');
      systemAdminApi
        .adminUpdate(this.pram)
        .then((data) => {
          this.$message.success(this.$t('systemSetting.updateAdminSuccess'));
          this.$emit('hideEditDialog');
        })
        .catch(() => {
          this.pram.roles = this.pram.roles.split(',').map(Number);
        });
    },
    rulesSelect(selectKeys) {
      this.pram.rules = selectKeys;
    },
  },
};
</script>

<style scoped></style>
