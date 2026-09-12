<template>
  <div class="divBox relative">
    <el-card
      v-if="checkPermi(['platform:integral:product:page'])"
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form inline size="small" label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.productSearchLabel')">
            <el-input
              v-model.trim="keywords"
              :placeholder="$t('product.pleaseEnterProductNameKeyword')"
              class="form_content_width"
              size="small"
              @keyup.enter.native="handleSeachList"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.createDateLabel')">
            <el-date-picker
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('product.customTime')"
              class="selWidth"
              :start-placeholder="$t('product.startDate')"
              :end-placeholder="$t('product.endDate')"
              @change="onchangeTime"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSeachList">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <div class="clearfix" ref="headerBox" v-if="checkPermi(['platform:integral:product:page'])">
        <el-tabs class="list-tabs mb5" v-model="tableFrom.isShow" @tab-click="handleSeachList">
          <el-tab-pane
            v-for="item in headerTabs"
            :key="item.type"
            :label="item.label"
            :name="item.type"
          />
        </el-tabs>
      </div>
      <el-button size="small" type="primary" v-hasPermi="['platform:integral:product:save']" @click="handleAdd('isAdd')"
        >{{ $t('marketing.addProduct') }}</el-button
      >
      <el-button
        size="small"
        v-hasPermi="['platform:integral:product:save', 'platform:product:marketing:search:page']"
        @click="handleQuickAdd('isAdd')"
        >{{ $t('marketing.quickAdd') }}</el-button
      >
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        class="mt20"
        :highlight-current-row="true"
        highlight-current-row
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('product.productImage')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.productName')" min-width="200" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedProductName(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="redeemIntegral" :label="$t('marketing.exchangePoints')" min-width="90" />
        <el-table-column prop="price" :label="$t('marketing.exchangeAmount')" min-width="130" />
        <el-table-column prop="sales" :label="$t('marketing.exchangedCount')" min-width="90" />
        <el-table-column prop="stock" :label="$t('marketing.remainingStock')" min-width="90" />
        <el-table-column prop="sort" :label="$t('product.sort')" min-width="90" />
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="130" />
        <el-table-column :label="$t('common.status')" min-width="80" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:integral:product:update:show'])"
              v-model="scope.row.isShow"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('product.onShelf')"
              :inactive-text="$t('product.offShelf')"
              @change="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.isShow ? $t('product.onShelf') : $t('product.offShelf') }}</div>
          </template>
        </el-table-column>
        <el-table-column width="190" fixed="right" :label="$t('common.operate')">
          <template slot-scope="scope">
            <!--id:商品id，isDisabled：是否能编辑(noEdit不能，edit能)，isChoose：是否是选择商品(choose是，noChoose不是)-->
            <template v-if="checkPermi(['platform:integral:product:detail'])">
              <a @click="handleView(scope.row.id)">{{ $t('common.detail') }}</a>
            </template>
            <template v-if="checkPermi(['platform:integral:product:update'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="onEdit(scope.row,'edit')">{{ $t('common.edit') }}</a>
            </template>
            <template v-if="checkPermi(['platform:integral:product:save'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="onEdit(scope.row, 'copy')">{{ $t('marketing.copy') }}</a>
            </template>
            <template v-if="checkPermi(['platform:integral:product:delete'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDelete(scope.row.id, tableFrom.type)">{{ $t('common.delete') }}</a>
            </template>
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

    <!-- 商品详情 -->
    <info-from
      ref="infoFrom"
      :componentKey="componentKey"
      :is-atud="false"
      :is-show="isShow"
      :productId="productId"
      @onCloseInfo="onCloseInfo"
      fromType="pointsMall"
      :dialogVisibleInfoData="dialogVisibleInfo"
    />
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

import { productLstApi, productDeleteApi, putOnShellApi, offShellApi, productHeadersApi } from '@/api/pointsMall';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import * as $constants from '@/utils/constants';
import { handleDeleteTable } from '@/libs/public';
import infoFrom from '@/components/productInfo';
import BatchAudit from '@/views/product/batchAudit';
import merchantName from '@/components/merchantName';
import previewBox from '@/views/product/previewBox';
import product from '@/mixins/product';
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';
const tableFroms = {
  page: 1,
  limit: $constants.page.limit[0],
  keywords: '',
  dateLimit: '',
  isShow: '1',
};
export default {
  name: 'ProductManage',
  components: { infoFrom },
  mixins: [product],
  data() {
    return {
      drawer: false,
      direction: 'rtl',
      headeNum: [],
      timeVal: [],
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: Object.assign({}, tableFroms),
      keywords: '',
      checkAll: false,
      isIndeterminate: true,
      componentKey: 0,
      isShow: false,
      productId: 0,
      multipleSelectionAll: [],
      checkedIds: [], //选中的id
      loadingBtn: false,
      dialogVisible: false,
      keyNum: 0,
      couponIds: [], //优惠券集合
      productInfo: null, //商品详情
      productType: 0, //商品类型
      isSub: false, //佣金设置是否单独设置
      addType: 'isAdd',
    };
  },
  computed: {
    headerTabs() {
      const up = (this.headeNum[0] && this.headeNum[0].count) || 0;
      const down = (this.headeNum[1] && this.headeNum[1].count) || 0;
      return [
        { type: '1', label: this.$t('marketing.tabOnShelfCount', { count: up }) },
        { type: '0', label: this.$t('marketing.tabOffShelfCount', { count: down }) },
      ];
    },
  },
  activated() {
    this.handleSeachList();
  },
  mounted() {
    if (checkPermi(['platform:integral:product:tabs:headers'])) this.goodHeade();
    if (checkPermi(['platform:integral:product:page'])) this.getList();
  },
  methods: {
    checkPermi,
    localizedProductName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    // 查看详情
    handleView(id) {
      this.productId = id;
      this.isShow = true;
      this.componentKey += 1;
      this.dialogVisibleInfo = true;
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = e ? this.timeVal.join(',') : '';
      this.tableFrom.page = 1;
      this.handleSeachList();
    },
    // 删除成功
    delSuccess() {
      handleDeleteTable(this.tableData.data.length, this.tableFrom);
      this.getList();
    },
    //快速添加
    handleQuickAdd() {
      const _this = this;
      this.$modalGoodList(function (row) {
        //id:商品id，isDisabled：是否能编辑(noEdit不能，edit能)，isChoose：是否是选择商品(choose是，noChoose不是)
        _this.$router.push({ path: `/marketing/pointsMall/productManage/creatProduct/${row.id}/edit/choose` });
      }, '');
    },
    //添加商品
    handleAdd() {
      //id:商品id，isDisabled：是否能编辑(noEdit不能，edit能)，isChoose：是否是选择商品(choose是，noChoose不是)
      this.$router.push({ path: `/marketing/pointsMall/productManage/creatProduct/0/edit/noChoose` });
    },
    //编辑商品
    onEdit(row, copy) {
      //id:商品id，isDisabled：是否能编辑(noEdit不能，edit能)，isChoose：是否是选择商品(choose是，noChoose不是)
      if (this.tableFrom.type === '1') {
        this.$modalSure(this.$t('marketing.offShelfProductConfirm')).then(() => {
          offShellApi(row.id).then(() => {
            this.$router.push({
              path: `/marketing/pointsMall/productManage/creatProduct/${row.id}/edit/noChoose/${copy}`,
            });
          });
        });
      } else {
        this.$router.push({ path: `/marketing/pointsMall/productManage/creatProduct/${row.id}/edit/noChoose/${copy}` });
      }
    },
    handleCloseEdit() {
      this.drawer = false;
    },
    handleSeachList() {
      this.getList(1);
      this.goodHeade();
    },
    //重置
    handleReset() {
      this.tableFrom.keywords = '';
      this.tableFrom.dateLimit = '';
      this.keywords = '';
      this.timeVal = [];
      this.handleSeachList();
    },
    // 获取商品表单头数量
    goodHeade() {
      let data = Object.assign({}, this.tableFrom);
      delete data.page;
      delete data.limit;
      productHeadersApi(data).then((res) => {
        this.headeNum = [
          { type: '1', count: res.upNum },
          { type: '0', count: res.downNum },
        ];
      });
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableFrom.keywords = encodeURIComponent(this.keywords);
      productLstApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
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
    //详情
    handleInfo(id, type) {
      this.$router.push({ path: `/product/list/creatProduct/${id}/2/2/${type}` });
    },
    // 删除
    handleDelete(id, type) {
      this.$modalSure(this.$t('marketing.deleteIntegralProductConfirm', { id })).then(() => {
        productDeleteApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.delSuccess();
        });
      });
    },
    //上下架
    onchangeIsShow(row) {
      putOnShellApi(row.id)
        .then(() => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.getList();
          this.goodHeade();
        })
        .catch(() => {
          row.isShow = !row.isShow;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.tags_name {
  font-size: 12px;
  height: 16px;
  line-height: 16px;
  padding: 0 2px;
  margin-right: 2px;
  &.namefalse {
    color: var(--prev-color-primary);
  }
  &.nametrue {
    color: #ff8a4d;
  }
}
::v-deep .el-table__cell:nth-child(2) .cell {
  padding-left: 14px;
  padding-right: 14px;
}
.infoItem {
  ::v-deep a {
    color: #606266 !important;
  }
}
.el-table__body {
  width: 100%;
  table-layout: fixed !important;
}
.taoBaoModal {
  //  z-index: 3333 !important;
}
.demo-table-expand {
  ::v-deep label {
    width: 82px;
  }
}
.demo-table-expand {
  ::v-deep .el-form-item__content {
    width: 77%;
  }
}
.seachTiele {
  line-height: 30px;
}
.relative {
  position: relative;
}

.cell_ht {
  height: 50px;
  padding: 15px 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #eeeeee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.check_cell {
  width: 100%;
  padding: 15px 20px 0;
}
.mt-1 {
  margin-top: 6px;
}
::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #606266;
}
::v-deep .el-drawer__header {
  font-size: 20px;
}
::v-deep .el-drawer__close-btn {
  font-size: 20px;
}
::v-deep .el-dialog__footer {
  padding: 0 24px 20px !important;
}
</style>
