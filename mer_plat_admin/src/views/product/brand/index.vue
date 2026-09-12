<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <div class="clearfix">
        <el-button size="small" type="primary" @click="onAdd" v-hasPermi="['platform:product:brand:add']">{{
          $t('product.addBrand')
        }}</el-button>
      </div>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        class="mt20"
        size="small"
        row-key="brand_id"
        :default-expand-all="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column :label="$t('product.brandName')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ getLocalizedName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('product.brandIcon')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.icon" :preview-src-list="[scope.row.icon]" v-if="scope.row.icon" />
              <img v-else :src="defaultImg" alt="" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('product.sort')" min-width="50" />
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="150" />
        <el-table-column prop="status" :label="$t('product.isShow')" min-width="100" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:product:brand:show:status'])"
              v-model="scope.row.isShow"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('product.show')"
              :inactive-text="$t('product.hide')"
              @change="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.isShow ? $t('product.show') : $t('product.hide') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <a @click="onEdit(scope.row)" v-hasPermi="['platform:product:brand:update']">{{ $t('product.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['platform:product:brand:delete']" @click="handleDelete(scope.row.id, scope.$index)">{{ $t('product.delete') }}</a>
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
    <creat-band ref="creatBands" :editData="editData" @getList="getList" />
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
import creatBand from './creatBand';
import { mapGetters } from 'vuex';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'BrandList',
  components: { creatBand },
  computed: {
    ...mapGetters(['merPlatProductClassify']),
    currentLocale() {
      return this.$i18n.locale || 'zh-cn';
    },
  },
  data() {
    return {
      props: {
        value: 'store_brand_category_id',
        label: 'cate_name',
        children: 'children',
        emitPath: false,
      },
      defaultImg: require('@/assets/imgs/moren.jpg'),
      isChecked: false,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
      },
      editData: {},
    };
  },
  mounted() {
    // this.getBrandCategory();
    this.$store.dispatch('product/getAdminProductClassify');
    if (checkPermi(['platform:product:brand:list'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedName(row) {
      const locale = this.currentLocale;
      if (row && row.nameJson) {
        try {
          const nameObj = typeof row.nameJson === 'string' ? JSON.parse(row.nameJson) : row.nameJson;
          const val = nameObj[locale];
          if (val) return val;
        } catch (e) {
          // 解析失败时回退默认名称
        }
      }
      return row ? row.name : '';
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      storeApi
        .brandListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
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
      this.$refs.creatBands.dialogVisible = true;
    },
    // 编辑
    onEdit(row) {
      this.editData = row;
      this.$refs.creatBands.dialogVisible = true;
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure(this.$t('product.deleteBrandConfirm')).then(() => {
        storeApi.brandDeleteApi(id).then((res) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.$store.commit('product/SET_ProductBrand', []);
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    onchangeIsShow(row) {
      storeApi.brandShowApi(row.id).then((res) => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.$store.commit('product/SET_ProductBrand', []);
        this.getList();
      });
    },
  },
};
</script>

<style scoped lang="scss"></style>
