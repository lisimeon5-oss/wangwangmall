<template>
  <div class="components-container">
    <div class="container" v-hasPermi="['platform:system:group:data:list']">
      <el-form inline>
        <el-form-item :label="$t('common.status')">
          <el-select v-model="listPram.status" :placeholder="$t('common.status')" clearable @change="handlerSearch" class="selWidth">
            <el-option
              v-for="item in constants.roleListStatus"
              :key="item.value"
              :label="translateText(item.label)"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <el-button
      type="primary"
      size="mini"
      @click="handlerOpenEditData({}, 0)"
      v-hasPermi="['platform:system:group:data:save']"
      >{{ $t('maintain.addData') }}</el-button
    >
    <!-- v-if="((formData.id==55 || formData.name===$t('maintain.checkinDaysConfig')) && dataList.list.length<7) || (formData.id!=55|| formData.name!==$t('maintain.checkinDaysConfig'))" -->
    <el-dialog
      :title="editDataConfig.isCreate === 0 ? $t('maintain.addData') : $t('maintain.editData')"
      :visible.sync="editDataConfig.visible"
      append-to-body
      destroy-on-close
      width="700px"
      class="dialog-bottom"
    >
      <edit
        v-if="editDataConfig.visible"
        :form-data="formData"
        :edit-data="editDataConfig.editData"
        :is-create="editDataConfig.isCreate"
        @hideDialog="handlerHideDia"
      />
    </el-dialog>
    <el-table size="small" :data="dataList.list" style="width: 100%" class="mt20 mb20 table-top">
      <el-table-column :label="$t('maintain.number')" prop="id" />
      <el-table-column
        v-for="(item, index) in formConf.fields"
        :key="index"
        :label="translateText(item.__config__.label)"
        :prop="item.__vModel__"
      >
        <template slot-scope="scope">
          <div v-if="['img', 'image', 'pic'].indexOf(item.__vModel__) > -1" class="demo-image__preview line-heightOne">
            <el-image :src="scope.row[item.__vModel__]" :preview-src-list="[scope.row[item.__vModel__]]" />
          </div>
          <span v-else>{{ displayField(scope.row, item) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" prop="status">
        <template slot-scope="scope">
          <span>{{ scope.row.status | filterShowOrHide }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operate')" width="200">
        <template slot-scope="scope">
          <a @click="handlerOpenEditData(scope.row, 1)" v-hasPermi="['platform:system:group:data:update']">{{ $t('common.edit') }}</a>
          <el-divider direction="vertical"></el-divider>
          <a
            @click="handlerDelete(scope.row)"
            v-if="formMark !== 99 && checkPermi(['platform:system:group:data:delete'])"
            >{{ $t('common.delete') }}</a
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        background
        :current-page="listPram.page"
        :page-sizes="constants.page.limit"
        :layout="constants.page.layout"
        :total="dataList.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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
import edit from './combineEdit';
import * as systemGroupDataApi from '@/api/systemGroupData.js';
import * as systemFormConfigApi from '@/api/systemFormConfig.js';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { translateText } from '@/utils/i18nText';
import { getLocalizedText } from '@/utils/localizedName';
export default {
  // name: "combineDataList"
  components: { edit },
  props: {
    formData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      constants: this.$constants,
      listPram: {
        gid: null,
        keywords: null,
        status: null, // 1=开启 2=关闭
        page: 1,
        pageSize: this.$constants.page.limit[0],
      },
      editDataConfig: {
        visible: false,
        isCreate: 0, // 0=create 1=edit
        editData: {},
      },
      formConf: { fields: [] },
      dataList: { list: [], total: 0 },
      formMark: 0,
    };
  },
  mounted() {
    if (checkPermi(['platform:system:config:info'])) this.handlerGetFormConfig();
    this.listPram.gid = this.formData.id;
    if (checkPermi(['platform:system:group:data:list'])) this.handlerGetListData(this.listPram);
  },
  methods: {
    checkPermi,
    translateText,
    currentLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
    displayField(row, item) {
      const key = item && item.__vModel__;
      if (['name', 'title', 'tag', 'label', 'info'].indexOf(key) > -1) {
        return getLocalizedText(row[key], row[`${key}Json`], this.currentLocale());
      }
      return row[key];
    },
    handlerSearch() {
      this.listPram.page = 1;
      this.handlerGetListData(this.listPram);
    },
    handlerGetListData(pram) {
      // 获取列表数据
      systemGroupDataApi.groupDataList(pram).then((data) => {
        const _selfList = [];
        data.list.forEach((_lItem) => {
          _lItem.value = JSON.parse(_lItem.value);
          const _fields = _lItem.value.fields;
          const _rowData = {};
          _fields.map((item) => {
            _rowData[item.name] = item.value;
          });
          _rowData.id = _lItem.id;
          _rowData.sort = _lItem.sort;
          _rowData.status = _lItem.status;
          _selfList.push(_rowData);
        });
        this.dataList.list = _selfList;
        this.dataList.total = data.total;
      });
    },
    handlerGetFormConfig() {
      // 获取表单配置后生成table列
      const _pram = { id: this.formData.formId };
      systemFormConfigApi.getFormConfigInfo(_pram).then((data) => {
        this.formMark = parseInt(data.id);
        this.formConf = JSON.parse(data.content);
      });
    },
    handlerOpenEditData(rowData, isCreate) {
      this.editDataConfig.editData = rowData;
      this.editDataConfig.isCreate = isCreate;
      this.editDataConfig.visible = true;
    },
    handlerHideDia() {
      this.handlerGetListData(this.listPram);
      this.editDataConfig.visible = false;
    },
    handlerDelete(rowData) {
      this.$modalSure(this.$t('maintain.deleteCurrentDataConfirm')).then(() => {
        systemGroupDataApi.groupDataDelete(rowData).then((data) => {
          this.$message.success(this.$t('content.deleteDataSuccess'));
          this.handlerHideDia();
        });
      });
    },
    handleSizeChange(val) {
      this.listPram.limit = val;
      this.handlerGetListData(this.listPram);
    },
    handleCurrentChange(val) {
      this.listPram.page = val;
      this.handlerGetListData(this.listPram);
    },
  },
};
</script>

<style scoped>
.el-link {
  font-size: 12px;
}

.linkMiddle {
  padding: 0 8px;
  color: #dddddd;
}

.table-top {
  margin-top: 20px;
}

.pagination {
  padding-bottom: 20px;
}
</style>
