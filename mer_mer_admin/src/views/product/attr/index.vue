<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: '20px 20px 2px' }"
      v-hasPermi="['merchant:product:rule:page:list']"
    >
      <el-form inline size="small" @submit.native.prevent>
        <el-form-item :label="$t('product.specName')">
          <el-input v-model.trim="keywords" :placeholder="$t('product.specNamePlaceholder')" class="form_content_width" clearable>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleSearchList">{{ $t('product.query') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" :bordered="false" class="box-card mt14" :body-style="{ padding: '20px' }">
      <el-button size="small" type="primary" @click="add" v-hasPermi="['merchant:product:rule:save']"
        >{{ $t('product.addProductSpec') }}</el-button
      >
      <el-table
        ref="table"
        v-loading="listLoading"
        class="mt20"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        highlight-current-row
      >
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column :label="$t('product.specNameColumn')" min-width="150">
          <template slot-scope="scope">
            {{ getLocalizedName({ name: scope.row.ruleName, nameJson: scope.row.ruleNameJson }, uiLocale) || '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.productSpec')" min-width="150">
          <template slot-scope="scope">
            <span v-for="(item, index) in scope.row.ruleValue" :key="index" class="mr10">{{
              getLocalizedText(item.value, item.valueJson, uiLocale) || '-'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.productAttr')" min-width="300">
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.ruleValue" :key="index">
              {{ displayRuleDetails(item) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <a @click="onEdit(scope.row)" v-hasPermi="['merchant:product:rule:update']">{{ $t('product.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handleDelete(scope.row.id, scope.$index)" v-hasPermi="['merchant:product:rule:delete']">{{ $t('product.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="$constants.page.limit"
          :page-size="tableFrom.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
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

import { templateListApi, attrDeleteApi } from '@/api/product';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
import { getLocalizedName, getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'StoreAttr',
  data() {
    return {
      formDynamic: {
        ruleName: '',
        ruleValue: [],
      },
      tableFrom: {
        page: 1,
        limit: this.$constants.page.limit[0],
        keywords: '',
      },
      keywords: '',
      tableData: {
        data: [],
        loading: false,
        total: 0,
      },
      listLoading: false,
      selectionList: [],
      multipleSelectionAll: [],
      idKey: 'id',
      nextPageFlag: false,
      keyNum: 0,
    };
  },
  computed: {
    uiLocale() {
      return (this.$i18n && this.$i18n.locale) || getUiLocale(this);
    },
  },
  mounted() {
    if (checkPermi(['merchant:product:rule:page:list'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedName,
    getLocalizedText,
    displayRuleDetails(item) {
      const details = item.detail || [];
      return details
        .map((d, i) => getLocalizedText(d, item.detailJson && item.detailJson[i], this.uiLocale))
        .filter((t) => t)
        .join(',') || '-';
    },
    handleSearchList() {
      this.tableFrom.page = 1;
      this.getList();
    },
    add() {
      const _this = this;
      this.$modalAttr(
        Object.assign({}, this.formDynamic),
        function () {
          _this.getList();
        },
        (this.keyNum += 1),
      );
    },
    // 列表
    getList() {
      this.listLoading = true;
      this.tableFrom.keywords = encodeURIComponent(this.keywords);
      templateListApi(this.tableFrom)
        .then((res) => {
          const list = res.list;
          this.tableData.data = list;
          this.tableData.total = res.total;
          for (var i = 0; i < list.length; i++) {
            list[i].ruleValue = JSON.parse(list[i].ruleValue);
          }
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
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
    // 删除
    handleDelete(id, idx) {
      this.$modalSure()
        .then(() => {
          attrDeleteApi(id).then(() => {
            this.$message.success(this.$t('product.deleteSuccess'));
            handleDeleteTable(this.tableData.data.length, this.tableFrom);
            this.getList();
          });
        })
        .catch(() => {});
    },
    handleDeleteAll() {
      if (!this.multipleSelectionAll.length) return this.$message.warning(this.$t('product.selectProductSpec'));
      const data = [];
      this.multipleSelectionAll.map((item) => {
        data.push(item.id);
      });
      this.ids = data.join(',');
      this.$modalSure()
        .then(() => {
          attrDeleteApi(this.ids).then(() => {
            this.$message.success(this.$t('product.deleteSuccess'));
            this.getList();
          });
        })
        .catch(() => {});
    },
    onEdit(val) {
      const _this = this;
      this.$modalAttr(JSON.parse(JSON.stringify(val)), function () {
        _this.getList();
      });
    },
  },
};
</script>

<style scoped lang="scss">
.seachTiele {
  line-height: 35px;
}

.fr {
  float: right;
}

.el-message-box__content {
  padding: 24px;
}
</style>
