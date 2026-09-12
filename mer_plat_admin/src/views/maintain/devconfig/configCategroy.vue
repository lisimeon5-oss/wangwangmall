<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-form inline v-hasPermi="['platform:category:save']">
        <el-form-item>
          <el-button size="mini" type="primary" @click="handlerOpenAdd({ id: 0, name: $t('category.topLevelDirectory') })"
            >{{ $t('maintain.addCategory') }}</el-button
          >
        </el-form-item>
      </el-form>
      <el-alert
        :title="$t('maintain.warmTip')"
        type="warning"
        effect="light"
        :description="$t('maintain.categoryTip')"
      >
      </el-alert>
      <el-table
        ref="treeList"
        :data="treeList"
        style="width: 100%"
        row-key="id"
        size="small"
        class="table mt20"
        highlight-current-row
        :tree-props="{ children: 'child', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" :label="$t('maintain.categoryNickname')" min-width="300">
          <template slot-scope="scope">
            {{ getLocalizedName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('maintain.associatedForm')" show-overflow-tooltip min-width="130">
          <template slot-scope="scope">
            <span>{{ scope.row.extra }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('maintain.enableStatus')" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.status | filterYesOrNo }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="250" fixed="right">
          <template slot-scope="scope">
            <template v-if="scope.row.pid === 0 && checkPermi(['platform:category:save'])">
              <a @click="handlerOpenAdd(scope.row)">{{ $t('category.addSubdirectory') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <a v-hasPermi="['platform:category:update']" @click="handleEditMenu(scope.row)">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['platform:category:list']" @click="handlerOpenFormConfig(scope.row)">{{ $t('maintain.configList') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['platform:category:delete']" @click="handleDelMenu(scope.row)">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      :title="editDialogConfig.isCreate === 0 ? $t('maintain.addCategory') : $t('merchant.editCategory')"
      :visible.sync="editDialogConfig.visible"
      destroy-on-close
      :close-on-click-modal="false"
      width="700"
      class="dialog-bottom"
    >
      <edit
        v-if="editDialogConfig.visible"
        :prent="editDialogConfig.prent"
        :is-create="editDialogConfig.isCreate"
        :edit-data="editDialogConfig.data"
        :biztype="editDialogConfig.biztype"
        :all-tree-list="treeList"
        @hideEditDialog="hideEditDialog"
      />
    </el-dialog>
    <el-dialog :title="$t('maintain.selectConfiguredForm')" :visible.sync="configFormSelectedDialog.visible" width="800px">
      <span class="color-red">{{ $t('maintain.formNoDuplicateAssociate') }}</span>
      <form-config-list
        v-if="configFormSelectedDialog.visible"
        select-model
        @selectedRowData="handlerSelectedRowData"
      />
      <el-form>
        <el-form-item v-hasPermi="['platform:category:update']">
          <el-button type="primary" style="width: 100%" @click="handlerAddFormExtra">{{ $t('maintain.associate') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
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
import * as categoryApi from '@/api/categoryApi.js';
import edit from '@/views/maintain/devconfig/configCategotyEdit.vue';
import configList from './configList';
import formConfigList from '@/views/maintain/formConfig';
import { checkPermi } from '@/utils/permission';
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';
export default {
  // name: "configCategroy"
  components: { edit, configList, formConfigList },
  props: {},
  data() {
    return {
      constants: this.$constants,
      searchPram: {
        status: null,
        type: null,
      },
      editDialogConfig: {
        visible: false,
        isCreate: 0, // 0=创建，1=编辑
        prent: {}, // 父级对象
        data: {},
      },
      treeList: [],
      listPram: {
        pid: 0,
        type: this.$constants.categoryType[5].value,
        status: null,
        name: null,
        page: this.$constants.page.page,
        limit: this.$constants.page.limit[1],
      },
      configFormSelectedDialog: {
        visible: false,
        currentData: {},
      },
    };
  },
  mounted() {
    if (checkPermi(['platform:category:list:tree'])) this.handlerGetTreeList();
  },
  methods: {
    checkPermi,
    getLocalizedName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    handlerOpenFormConfig(rowData) {
      this.configFormSelectedDialog.currentData = rowData;
      this.configFormSelectedDialog.visible = true;
    },
    handlerOpenAdd(rowData) {
      this.editDialogConfig.isCreate = 0;
      this.editDialogConfig.prent = rowData;
      this.editDialogConfig.data = {};
      this.editDialogConfig.biztype = this.biztype;
      this.editDialogConfig.visible = true;
    },
    handleEditMenu(rowData) {
      this.editDialogConfig.isCreate = 1;
      this.editDialogConfig.data = rowData;
      this.editDialogConfig.prent = rowData;
      this.editDialogConfig.visible = true;
    },
    handleDelMenu(rowData) {
      this.$modalSure(this.$t('maintain.deleteCurrentDataConfirm')).then(() => {
        categoryApi.deleteCategroy(rowData.id).then((data) => {
          this.handlerGetTreeList();
          this.$message.success(this.$t('product.deleteSuccess'));
        });
      });
    },
    hideEditDialog() {
      setTimeout(() => {
        this.editDialogConfig.prent = {};
        this.editDialogConfig.type = 0;
        this.editDialogConfig.visible = false;
        this.handlerGetTreeList();
      }, 200);
    },
    handlerGetTreeList() {
      // status: this.selectModel?1:-1
      const _pram = { type: this.constants.categoryType[5].value, status: -1 };
      categoryApi.treeCategroy(_pram).then((data) => {
        this.treeList = this.handleAddArrt(data);
      });
    },
    handleAddArrt(treeData) {
      const locale = getUiLocale(this);
      const walk = (list) => {
        if (!Array.isArray(list)) return list;
        return list.map((item) => {
          const next = { ...item };
          next.label = getLocalizedName(item, locale);
          if (item.child && item.child.length) next.child = walk(item.child);
          return next;
        });
      };
      return walk(treeData);
    },
    handlerSelectedRowData(rowData) {
      this.configFormSelectedDialog.currentData.extra = rowData.name;
    },
    handlerAddFormExtra() {
      categoryApi.updateCategroy(this.configFormSelectedDialog.currentData).then((data) => {
        this.$message.success(this.$t('maintain.associateFormSuccess'));
        setTimeout(() => {
          this.configFormSelectedDialog.visible = false;
          this.handlerGetTreeList();
        }, 800);
      });
    },
  },
};
</script>

<style scoped></style>
