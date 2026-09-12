<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-if="checkPermi(['platform:product:tag:list'])"
    >
      <div class="padding-add">
        <el-form inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.tagName')">
            <el-input
              v-model.trim="keywords"
              @keyup.enter.native="handleSearch"
              size="small"
              clearable
              class="selWidth"
              :placeholder="$t('product.pleaseEnterTagName')"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" shadow="never" :bordered="false">
      <div class="container">
        <router-link :to="{ path: '/product/tag/creatTag' }" v-hasPermi="['platform:product:tag:save']">
          <el-button size="small" type="primary" class="mr10">{{ $t('product.addTag') }}</el-button>
        </router-link>
      </div>
      <el-table
        v-loading="tableConfig.listLoading"
        :data="tableData.data"
        size="small"
        row-key="tag_id"
        :default-expand-all="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="mt20"
      >
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column :label="$t('product.tagName')" min-width="100" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ getLocalizedTagName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('product.tagNote')" prop="tagNote" min-width="200" :show-overflow-tooltip="true" />
        <el-table-column prop="startTime" :label="$t('product.effectivePeriod')" width="350">
          <template slot-scope="scope"> {{ scope.row.startTime }} - {{ scope.row.endTime }} </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('product.isShow')" min-width="100" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:product:tag:status'])"
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('product.show')"
              :inactive-text="$t('product.hide')"
              @change="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.status ? $t('product.show') : $t('product.hide') }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="150" />
        <el-table-column prop="position" :label="$t('product.mallTitlePosition')" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.position === 0 ? $t('product.belowTitle') : $t('product.beforeTitle') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('product.sort')" min-width="50" />
        <el-table-column :label="$t('product.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <router-link
              :to="{ path: '/product/tag/creatTag/' + scope.row.id }"
              v-hasPermi="['platform:product:tag:update']"
            >
              <a>{{ $t('product.edit') }}</a>
            </router-link>
            <template v-if="scope.row.owner > 0 && checkPermi(['platform:product:tag:delet'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDelete(scope.row.id, scope.$index)">{{ $t('product.delete') }}</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="tableFrom.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <el-drawer
      :visible.sync="editDataDialogConfig.visible"
      :title="editData.id ? $t('product.tagEdit') : $t('product.tagAdd')"
      direction="rtl"
      custom-class="demo-drawer"
      size="900px"
      ref="drawer"
      :wrapperClosable="editData.id ? false : true"
      :modal-append-to-body="false"
      class="infoBox"
      @close="editDataDialogConfig.visible = false"
    >
      <edit-tag
        v-if="editDataDialogConfig.visible"
        :edit-data="editData"
        @onCloseHandle="handleOnEditDiaClosed"
      ></edit-tag>
    </el-drawer>
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
import * as storeApi from '@/api/product.js';
import editTag from './editTag';
import { mapGetters } from 'vuex';
import { checkPermi } from '@/utils/permission';
import { productTagInfoApi, productTagStatusApi } from '@/api/product.js';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
import { getLocalizedText } from '@/utils/localizedName';
export default {
  name: 'ProductTag',
  components: {
    editTag,
  },
  computed: {
    currentLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
  },
  data() {
    return {
      isChecked: false,
      tableConfig: {
        listLoading: false,
      },
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        keywords: '', // 搜索关键字
      },
      keywords: '',
      editData: {},
      editDataDialogConfig: {
        visible: false,
      },
    };
  },
  mounted() {
    if (checkPermi(['platform:product:tag:list'])) this.getList(1);
  },
  methods: {
    checkPermi,
    getLocalizedTagName(row) {
      return getLocalizedText(row.tagName, row.tagNameJson, this.currentLocale);
    },
    handleSearch() {
      this.getList(1);
    },
    // 列表
    getList(num) {
      this.tableFrom.keywords = this.keywords;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableConfig.listLoading = true;
      storeApi
        .productTagListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.tableConfig.listLoading = false;
        })
        .catch((res) => {
          this.tableConfig.listLoading = false;
          this.$message.error(res.message);
        });
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList();
    },
    // 添加
    onAdd() {
      this.editData = {};
      this.editDataDialogConfig.visible = true;
    },
    // 编辑
    onEdit(row) {
      this.editData = row;
      this.editDataDialogConfig.visible = true;
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure(this.$t('product.deleteTagConfirm')).then(async () => {
        await storeApi.productTagDelete(id);
        await handleDeleteTable(this.tableData.data.length, this.tableFrom);
        this.$message.success(this.$t('product.deleteSuccess'));
        await this.getList();
      });
    },
    onchangeIsShow(row) {
      storeApi
        .productTagStatusApi(row.id, row.status)
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.getList();
        })
        .catch((e) => {
          return (row.status = !row.status);
        });
    },
    handleOnEditDiaClosed() {
      this.editDataDialogConfig.visible = false;
      this.getList();
    },
  },
};
</script>

<style scoped lang="scss">
.infoBox {
  ::v-deep.el-drawer__header {
    margin-bottom: 0;
    font-size: 20px;
  }
  ::v-deep.el-icon-arrow-down,
  ::v-deep .el-icon-arrow-up {
    display: none;
  }
}
</style>
