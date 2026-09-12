<template>
  <div class="divBox">
    <el-card
      shadow="never"
      :bordered="false"
      v-hasPermi="['merchant:admin:role:list']"
      class="box-card"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form inline size="small" @submit.native.prevent>
          <el-form-item :label="$t('systemSetting.roleNicknameLabel')">
            <el-input
              v-model.trim="listPram.roleName"
              @keyup.enter.native="handleGetRoleList"
              :placeholder="$t('systemSetting.pleaseEnterRoleNickname')"
              clearable
              class="selWidth"
            />
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click.native="handleGetRoleList">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card shadow="never" :bordered="false" class="box-card mt14" :body-style="{ padding: '20px' }">
      <el-button size="small" type="primary" @click="handlerOpenEdit(0)" v-hasPermi="['merchant:admin:role:save']"
        >{{ $t('systemSetting.addRole') }}</el-button
      >
      <el-table
        class="mt20"
        :data="listData.list"
        size="small"
        :header-cell-style="{ fontWeight: 'bold', background: '#f8f8f9', color: '#515a6e', height: '40px' }"
      >
        <el-table-column :label="$t('systemSetting.roleNo')" prop="id" width="120"></el-table-column>
        <el-table-column :label="$t('systemSetting.roleNickname')" min-width="130">
          <template slot-scope="scope">{{ localizedRoleName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('common.status')" prop="status" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:admin:role:update:status'])"
              v-model="scope.row.status"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
            <div v-else>{{ scope.row.status ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.createTime')" prop="createTime" min-width="150" />
        <el-table-column :label="$t('maintain.updateTime')" prop="updateTime" min-width="150" />
        <el-table-column :label="$t('common.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <a @click="handlerOpenEdit(1, scope.row)" v-hasPermi="['merchant:admin:role:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handlerOpenDel(scope.row)" v-hasPermi="['merchant:admin:role:delete']">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        :current-page="listPram.page"
        :page-sizes="constants.page.limit"
        :layout="constants.page.layout"
        :total="listData.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <el-dialog
      :visible.sync="editDialogConfig.visible"
      :title="editDialogConfig.isCreate === 0 ? $t('systemSetting.createIdentity') : $t('systemSetting.editIdentity')"
      destroy-on-close
      :close-on-click-modal="false"
      width="560px"
      class="dialog-bottom"
    >
      <edit
        v-if="editDialogConfig.visible"
        :is-create="editDialogConfig.isCreate"
        :edit-data="editDialogConfig.editData"
        @hideEditDialog="hideEditDialog"
        ref="editForm"
      />
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

import * as roleApi from '@/api/role.js';
import edit from './edit';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  // name: "index"
  components: { edit },
  data() {
    return {
      constants: this.$constants,
      listData: { list: [] },
      listPram: {
        createTime: null,
        updateTime: null,
        level: null,
        page: 1,
        limit: this.$constants.page.limit[0],
        roleName: '',
        rules: null,
        status: '',
      },
      menuList: [],
      editDialogConfig: {
        visible: false,
        isCreate: 0, // 0=创建，1=编辑
        editData: {},
      },
    };
  },
  mounted() {
    if (checkPermi(['merchant:admin:role:list'])) this.handleGetRoleList();
  },
  methods: {
    checkPermi,
    localizedRoleName(row) {
      return getLocalizedText(row ? row.roleName : '', row ? row.roleNameJson : '', getUiLocale(this));
    },
    handlerOpenDel(rowData) {
      this.$modalSure(this.$t('systemSetting.confirmDeleteCurrentData')).then(() => {
        roleApi.delRole(rowData.id).then((data) => {
          this.$message.success(this.$t('content.deleteDataSuccess'));
          this.handleGetRoleList();
        });
      });
    },
    handleGetRoleList() {
      roleApi.getRoleList(this.listPram).then((data) => {
        this.listData = data;
      });
    },
    handlerOpenEdit(isCreate, editDate) {
      isCreate === 1 ? (this.editDialogConfig.editData = editDate) : (this.editDialogConfig.editData = {});
      this.editDialogConfig.isCreate = isCreate;
      this.editDialogConfig.visible = true;
    },
    hideEditDialog() {
      this.editDialogConfig.visible = false;
      this.handleGetRoleList();
    },
    handleSizeChange(val) {
      this.listPram.limit = val;
      this.handleGetRoleList(this.listPram);
    },
    handleCurrentChange(val) {
      this.listPram.page = val;
      this.handleGetRoleList(this.listPram);
    },
    //修改状态
    handleStatusChange(row) {
      roleApi.updateRoleStatus(row).then((res) => {
        this.$message.success(this.$t('user.updateStatusSuccess'));
        this.handleGetRoleList();
      });
    },
  },
};
</script>

<style scoped lang="scss"></style>
