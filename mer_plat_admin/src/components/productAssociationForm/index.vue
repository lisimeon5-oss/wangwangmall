<template>
  <div>
    <el-form-item v-if="productAssociationType == 'product'">
      <el-button size="small" type="primary" @click="handleAddGoods">{{ $t('product.addProduct') }}</el-button>
      <el-button v-if="isBatchDelete" size="small" @click="handleBatchDel" :disabled="!multipleSelection.length"
        >{{ $t('product.batchDelete') }}</el-button
      >
    </el-form-item>
    <el-form-item v-if="productAssociationType == 'product'">
      <el-table
        ref="tableList"
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%; margin-top: 5px"
        size="small"
        @selection-change="handleSelectionChange"
        @select-all="selectAll"
        @select="selectOne"
      >
        <el-table-column v-if="isBatchDelete" type="selection" width="55"> </el-table-column>
        <el-table-column prop="id" label="ID" width="55"> </el-table-column>
        <el-table-column :label="$t('product.productImage')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="name" :label="$t('product.productName')" min-width="200" />
        <el-table-column prop="price" :label="$t('product.attrPrice')" min-width="90" />
        <el-table-column prop="stock" :label="$t('product.stock')" min-width="70" />
        <el-table-column :label="$t('product.operate')" width="60" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item
      label-width="100px"
      v-if="productAssociationType == 'brand'"
      :label="$t('product.selectBrandLabel')"
      :span="24"
      prop="proBrandList"
    >
      <el-select
        class="selWidth"
        clearable
        filterable
        v-model="formValidate.proBrandList"
        :multiple="multipleBrand"
        :placeholder="$t('product.pleaseSelectBrand')"
        @change="handleBrandSelected"
      >
        <el-option v-for="(v, i) in productBrand" :key="i" :label="getLocalizedBrandName(v)" :value="v.id" :disabled="!v.isShow">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      label-width="100px"
      v-if="productAssociationType == 'category'"
      :label="$t('product.selectCategoryLabel')"
      :span="24"
      prop="proCategorylist"
    >
      <el-cascader
        v-model="formValidate.proCategorylist"
        class="selWidth"
        :props="propsCategory"
        :options="merPlatProductClassify"
        filterable
        placeholder=""
        :show-all-levels="false"
        clearable
        @change="handleCateSelected"
      />
    </el-form-item>
    <el-form-item
      label-width="100px"
      :label="$t('product.selectMerchantLabel')"
      v-hasPermi="['platform:merchant:page:list']"
      v-if="productAssociationType == 'merchant'"
      :span="24"
      prop="merIds"
    >
      <merchant-name @getMerId="getMerId" :multiple="multipleMer" :merIdChecked="formValidate.merIds"></merchant-name>
    </el-form-item>
  </div>
</template>
<script setup>
import merchantName from '@/components/merUseCategory/index.vue';
import { mapGetters } from 'vuex';
import { productListbyidsApi } from '@/api/product';
import { getLocalizedName } from '@/utils/localizedName';
export default {
  props: {
    formValidate: {
      type: Object,
      default: null,
    },
    //商品关联类型:product-商品，category-品类，brand-品牌,merchant-店铺
    productAssociationType: {
      type: String,
      default: '',
    },
    //品牌是否多选，false单选
    multipleBrand: {
      type: Boolean,
      default: false,
    },
    //分类是否多选，false单选
    multipleCategory: {
      type: Boolean,
      default: false,
    },
    //商户是否多选，false单选
    multipleMer: {
      type: Boolean,
      default: true,
    },
    //是否展示批量删除
    isBatchDelete: {
      type: Boolean,
      default: false,
    },
  },
  components: { merchantName },
  data() {
    return {
      tableData: {
        data: [],
        total: 0,
      },
      multipleSelection: [], //全部选中的商品值
      listLoading: false,
      productIds: [],
      propsCategory: {
        value: 'id',
        label: 'name',
        children: 'childList',
        expandTrigger: 'hover',
        checkStrictly: false,
        multiple: this.multipleCategory,
        emitPath: false,
      },
    };
  },
  computed: {
    ...mapGetters(['merPlatProductClassify', 'productBrand']),
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
  mounted() {
    if (!localStorage.getItem('merPlatProductClassify')) this.$store.dispatch('product/getAdminProductClassify');
    if (!localStorage.getItem('productBrand')) this.$store.dispatch('product/getMerProductBrand');
  },
  created() {
    this.getProductListByIds();
  },
  methods: {
    getLocalizedBrandName(row) {
      return getLocalizedName(row, this.currentLocale);
    },
    async getProductListByIds() {
      if (this.productAssociationType === 'product' && this.formValidate.data) {
        // 根据id查询出对应商品
        let data = this.formValidate.data.split(',');
        this.tableData.data = await productListbyidsApi({ ids: data });
      }
    },
    //添加商品
    handleAddGoods() {
      const _this = this;
      this.$modalGoodList(
        function (row) {
          _this.listLoading = false;
          _this.tableData.data = row;
          _this.$emit('getProductAssociationData', _this.tableData.data);
        },
        'many',
        _this.tableData.data,
      );
    },
    //行删除
    handleDelete(index, row) {
      this.$modalSure(this.$t('product.deleteThisProductConfirm')).then(() => {
        this.tableData.data.splice(index, 1);
        this.$emit('getProductAssociationData', this.tableData.data);
      });
    },
    //批量删除
    handleBatchDel() {
      this.$modalSure(this.$t('product.batchDeleteProductConfirm')).then(() => {
        let data = [];
        for (let item1 of this.tableData.data) {
          let _index = this.multipleSelection.findIndex((c) => c.id === item1.id);
          if (_index === -1) {
            data.push(item1);
          }
        }
        this.tableData.data = data;
        this.$emit('getProductAssociationData', this.tableData.data);
      });
    },
    //表格选择
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    selectAll(data) {
      let id = data.map((i, index) => {
        return i.id;
      });
      this.productIds = Array.from(new Set([...this.productIds, ...id]));
    },
    selectOne(data, row) {
      let id = data.map((i, index) => {
        return i.id;
      });
      let index = this.productIds.findIndex((e) => {
        return e == row.id;
      });
      this.productIds.splice(index, 1);
      this.productIds = Array.from(new Set([...this.productIds, ...id]));
    },
    // 获取商户id
    getMerId(id) {
      this.formValidate.merIds = id;
      this.$emit('getProductAssociationData', id);
    },
    handleBrandSelected(ids) {
      this.$forceUpdate(() => {
        this.formValidate.proBrandList = ids;
      });
      this.$emit('getProductAssociationData', ids);
    },
    handleCateSelected(ids) {
      this.$emit('getProductAssociationData', ids);
    },
  },
};
</script>
<style scoped lang="scss">
::v-deep.el-cascader__search-input{
  color: white;
  opacity: 0 !important;
}
</style>
