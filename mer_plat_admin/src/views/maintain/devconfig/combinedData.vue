<template>
  <div class="divBox">
    <el-card
      class="box-card"
      v-hasPermi="['platform:system:group:list']"
      :body-style="{ padding: 0 }"
      :bordered="false"
      shadow="never"
    >
      <div class="padding-add">
        <el-form inline @submit.native.prevent label-position="right">
          <el-form-item :label="$t('maintain.dataSearchLabel')">
            <el-input
              v-model.trim="keywords"
              :placeholder="$t('maintain.pleaseEnterGroupDataName')"
              class="selWidth"
              size="small"
              clearable
              @keyup.enter.native="handlerSearch"
            ></el-input>
          </el-form-item>
          <el-form-item class="search-form-sub">
            <el-button type="primary" size="small" @click="handlerSearch">{{ $t('common.search') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-button size="mini" type="primary" @click="handlerOpenEdit({}, 0)" v-hasPermi="['platform:system:group:save']"
        >{{ $t('maintain.addDataGroup') }}</el-button
      >
      <el-table :data="dataList.list" class="mt20" size="small" highlight-current-row>
        <el-table-column :label="$t('maintain.dataGroupName')" min-width="150">
          <template slot-scope="scope">{{ getLocalizedGroupName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('maintain.intro')" min-width="150">
          <template slot-scope="scope">{{ getLocalizedGroupInfo(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" fixed="right" width="170">
          <template slot-scope="scope">
            <a @click="handleDataList(scope.row)" v-hasPermi="['platform:system:group:data:list']">{{ $t('maintain.dataList') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handlerOpenEdit(scope.row, 1)" v-hasPermi="['platform:system:group:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handleDelete(scope.row)" v-hasPermi="['platform:system:group:delete']">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        :current-page="listPram.page"
        :page-sizes="constants.page.limit"
        :layout="constants.page.layout"
        :total="dataList.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <el-dialog
      :title="editDialogConfig.isCreate === 0 ? $t('maintain.createDataGroup') : $t('maintain.editDataGroup')"
      :visible.sync="editDialogConfig.visible"
      class="dialog-bottom"
    >
      <edit
        v-if="editDialogConfig.visible"
        :is-create="editDialogConfig.isCreate"
        :edit-data="editDialogConfig.editData"
        @hideDialog="handlerHideDialog"
        @closeDialog="closeDialog"
      />
    </el-dialog>
    <el-dialog :title="$t('maintain.groupDataList')" :visible.sync="comDataListConfig.visible">
      <cm-data-list v-if="comDataListConfig.visible" :form-data="comDataListConfig.formData" />
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
import edit from '@/views/maintain/devconfig/combinedDataEdit';
import * as systemGroupApi from '@/api/systemGroup';
import cmDataList from './combineDataList';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { getLocalizedName, getLocalizedText } from '@/utils/localizedName';
export default {
  // name: "combinedData"
  components: { edit, cmDataList },
  data() {
    return {
      constants: this.$constants,
      dataList: {
        list: [],
        total: 0,
      },
      keywords: '',
      listPram: {
        keywords: null,
        page: 1,
        pageSize: this.$constants.page.limit[0],
      },
      editDialogConfig: {
        visible: false,
        isCreate: 0, // 0=创建 1=编辑
        editData: {},
      },
      comDataListConfig: {
        visible: false,
        formData: {},
      },
    };
  },
  mounted() {
    if (checkPermi(['platform:system:group:list'])) this.handlerGetList(this.listPram);
  },
  methods: {
    checkPermi,
    currentLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
    getLocalizedGroupName(row) {
      return getLocalizedName(row, this.currentLocale());
    },
    getLocalizedGroupInfo(row) {
      return getLocalizedText(row ? row.info : '', row ? row.infoJson : '', this.currentLocale());
    },
    closeDialog() {
      this.editDialogConfig.visible = false;
    },
    handlerSearch() {
      this.listPram.page = 1;
      this.handlerGetList(this.listPram);
    },
    handlerOpenEdit(editData, isCreate) {
      isCreate === 0 ? (this.editDialogConfig.editData = {}) : (this.editDialogConfig.editData = editData);
      this.editDialogConfig.isCreate = isCreate;
      this.editDialogConfig.visible = true;
    },
    handlerGetList(pram) {
      pram.keywords = encodeURIComponent(this.keywords);
      systemGroupApi.groupList(pram).then((data) => {
        this.dataList = data;
      });
    },
    handleDataList(rowData) {
      if (rowData.formId <= 0) return this.$message.error(this.$t('maintain.pleaseAssociateFormFirst'));
      this.comDataListConfig.formData = rowData;
      this.comDataListConfig.visible = true;
    },
    handleDelete(rowData) {
      this.$modalSure(this.$t('maintain.deleteCurrentDataConfirm')).then(() => {
        systemGroupApi.groupDelete(rowData).then((data) => {
          this.$message.success(this.$t('content.deleteDataSuccess'));
          setTimeout(() => {
            this.handlerGetList(this.listPram);
          }, 800);
        });
      });
    },
    handleSizeChange(val) {
      this.listPram.limit = val;
      this.handlerGetList(this.listPram);
    },
    handleCurrentChange(val) {
      this.listPram.page = val;
      this.handlerGetList(this.listPram);
    },
    handlerHideDialog() {
      setTimeout(() => {
        this.editDialogConfig.visible = false;
        this.handlerGetList(this.listPram);
      }, 800);
    },
  },
};
</script>

<style scoped></style>
