<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:article:list']"
    >
      <div class="padding-add">
        <el-form inline size="small" label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('content.articleCategoryLabel')">
            <el-select
              v-model="listPram.cid"
              clearable
              class="selWidth"
              :placeholder="$t('content.pleaseSelectArticleCategory')"
              @change="handerSearch"
            >
              <el-option v-for="item in categoryTreeData" :key="item.id" :label="localizedCategoryName(item)" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('content.articleTitleLabel')">
            <el-input
              v-model.trim="title"
              @keyup.enter.native="handerSearch"
              :placeholder="$t('content.pleaseEnterArticleTitle')"
              class="selWidth"
              size="small"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('content.articleAuthorLabel')">
            <el-input
              v-model.trim="author"
              @keyup.enter.native="handerSearch"
              :placeholder="$t('content.pleaseEnterArticleAuthor')"
              class="selWidth"
              size="small"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handerSearch()">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <router-link :to="{ path: '/marketing/content/articleCreat' }">
        <el-button size="small" type="primary" class="mr10" v-hasPermi="['platform:article:save']">{{ $t('content.addArticle') }}</el-button>
      </router-link>
      <el-table v-loading="listLoading" :data="listData.list" size="small" highlight-current-row class="mt20">
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('content.image')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.cover" :preview-src-list="[scope.row.cover]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('content.articleTitle')" min-width="220" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedArticleTitle(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="visit" :label="$t('category.typeArticle')" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.cid | articleTypeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="visit" :label="$t('content.views')" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.visit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="author" :label="$t('content.articleAuthor')" min-width="180" />
        <el-table-column prop="sort" :label="$t('product.sort')" show-overflow-tooltip min-width="80" />
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="150" />
        <el-table-column :label="$t('common.status')" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:article:switch'])"
              v-model="scope.row.status"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.enable')"
              :inactive-text="$t('common.disable')"
              @change="handleStatusChange(scope.row)"
            >
            </el-switch>
            <div v-else>{{ scope.row.status ? $t('common.enable') : $t('common.disable') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <router-link :to="{ path: '/marketing/content/articleCreat/' + scope.row.id }">
              <a v-hasPermi="['platform:article:update']">{{ $t('common.edit') }}</a>
            </router-link>
            <el-divider direction="vertical"></el-divider>
            <a @click="handlerDelete(scope.row)" v-hasPermi="['platform:article:delete']">{{ $t('common.delete') }}</a>
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
      :title="editDialogConfig.isEdit === 0 ? $t('content.createArticle') : $t('content.editArticle')"
      top="1vh"
      width="900px"
      destroy-on-close
      :modal="false"
      :close-on-click-modal="false"
      class="articleModal"
    >
      <edit
        v-if="editDialogConfig.visible"
        :is-edit="editDialogConfig.isEdit"
        :edit-data="editDialogConfig.editData"
        @hideDialog="handlerHideDialog"
      />
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
import * as articleApi from '@/api/article.js';
import edit from './edit';
import { checkPermi } from '@/utils/permission';
import { getLocalizedName, getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  components: { edit },
  data() {
    return {
      constants: this.$constants,
      listPram: {
        author: null,
        cid: null,
        page: 1,
        title: '',
        limit: this.$constants.page.limit[0],
      },
      author: '',
      title: '',
      listData: { list: [], total: 0 },
      editDialogConfig: {
        visible: false,
        data: {},
        isEdit: 0, // 0=add 1=edit
      },
      listLoading: true,
      categoryTreeData: [],
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'child',
        expandTrigger: 'hover',
        checkStrictly: true,
        emitPath: false,
      },
    };
  },
  created() {
    if (localStorage.getItem('articleClass')) {
      this.categoryTreeData = JSON.parse(localStorage.getItem('articleClass'));
    } else {
      if (checkPermi(['platform:article:category:list'])) this.handlerGetTreeList();
    }
    if (checkPermi(['platform:article:list'])) this.handlerGetListData(this.listPram);
  },
  methods: {
    checkPermi,
    localizedCategoryName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    localizedArticleTitle(row) {
      return getLocalizedText(row.title, row.titleJson, getUiLocale(this));
    },
    //修改状态
    handleStatusChange(row) {
      articleApi.articleSwitchApi(row.id).then((res) => {
        this.$message.success(this.$t('user.updateStatusSuccess'));
        this.handlerGetTreeList();
      });
    },
    handlerGetTreeList() {
      articleApi.articleCategoryListApi().then((data) => {
        this.categoryTreeData = data;
        let list = data.filter((item) => {
          return item.status;
        });
        localStorage.setItem('articleClass', JSON.stringify(list));
      });
    },
    handerSearch() {
      this.listPram.page = 1;
      this.handlerGetListData(this.listPram);
    },
    handlerGetListData(pram) {
      this.listLoading = true;
      this.listPram.title = encodeURIComponent(this.title);
      this.listPram.author = encodeURIComponent(this.author);
      articleApi.ListArticle(pram).then((data) => {
        this.listData = data;
        this.listLoading = false;
      });
    },
    handlerOpenEdit(isEdit, editData) {
      // 0=add 1=edit
      if (isEdit === 1) {
        this.editDialogConfig.isEdit = 1;
        this.editDialogConfig.editData = editData;
      } else {
        this.editDialogConfig.isEdit = 0;
      }
      this.editDialogConfig.visible = true;
    },
    handlerHideDialog() {
      this.handlerGetListData(this.listPram);
      this.editDialogConfig.visible = false;
    },
    handlerDelete(rowData) {
      this.$modalSure(this.$t('content.deleteCurrentArticle'), this.$t('el.messagebox.title')).then((result) => {
        articleApi.DelArticle(rowData.id).then((data) => {
          this.$message.success(this.$t('content.deleteDataSuccess'));
          this.handlerGetListData(this.listPram);
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
    reset() {
      this.author = '';
      this.title = '';
      this.listPram = {
        author: null,
        cid: null,
        page: 1,
        title: '',
        limit: this.$constants.page.limit[0],
      };
      this.handlerGetListData(this.listPram);
    },
  },
};
</script>

<style scoped lang="scss">
.articleModal {
  z-index: 333 !important;
}
</style>
