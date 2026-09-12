<template>
  <div class="divBox relative">
    <el-card
      v-if="checkPermi(['merchant:product:page:list'])"
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form inline size="small" label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.productSearch')">
            <el-input
              v-model.trim="keywords"
              :placeholder="$t('product.searchNameKeyword')"
              class="form_content_width"
              size="small"
              @keyup.enter.native="handleSeachList"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('product.searchPlatformCategory')">
            <el-cascader
              v-model="tableFrom.categoryId"
              :options="merPlatProductClassify"
              :props="propsPlant"
              clearable
              class="form_content_width"
              @change="handleSeachList"
              size="small"
              :placeholder="$t('product.searchPlatformCategoryPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('product.searchMerchantCategory')">
            <el-cascader
              v-model="tableFrom.cateId"
              :options="merProductClassify"
              :props="propsMer"
              clearable
              class="form_content_width"
              @change="handleSeachList"
              size="small"
              :placeholder="$t('product.searchMerchantCategoryPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('product.searchMemberProduct')">
            <el-select
              v-model="tableFrom.isPaidMember"
              clearable
              size="small"
              :placeholder="$t('product.pleaseSelect')"
              class="selWidth"
              @change="handleSeachList"
            >
              <el-option :label="$t('product.yes')" value="true" />
              <el-option :label="$t('product.no')" value="false" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('product.typeLabel')">
            <el-select
              v-model="tableFrom.productType"
              clearable
              size="small"
              :placeholder="$t('product.pleaseSelect')"
              class="selWidth"
              @change="handleSeachList"
            >
              <el-option
                v-for="(item, index) in productTypeList"
                :label="item.label"
                :value="item.value"
                :key="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSeachList">{{ $t('product.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('product.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <div class="clearfix" ref="headerBox" v-if="checkPermi(['merchant:product:page:list'])">
        <el-tabs class="list-tabs mb5" v-model="tableFrom.type" @tab-click="handleSeachList">
          <el-tab-pane
            :label="objTitle[item.type - 1] + '(' + item.count + ')'"
            :name="item.type.toString()"
            v-for="(item, index) in headeNum"
            :key="index"
          />
        </el-tabs>
      </div>
      <el-button size="small" type="primary" v-hasPermi="['merchant:product:save']" @click="handleAdd('isAdd')"
        >{{ $t('product.addProduct') }}</el-button
      >
      <el-button
        class="mr14"
        @click="handleAdd('isCopy')"
        size="small"
        type="success"
        v-hasPermi="['merchant:product:import:product']"
        >{{ $t('product.collectProduct') }}</el-button
      >
      <el-dropdown size="small">
        <el-button :class="checkedIds.length > 0 ? '' : 'active'" :disabled="checkedIds.length > 0 ? false : true">
          {{ $t('product.batchSet') }}<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <template v-if="checkedIds.length > 0 ? true : false">
            <el-dropdown-item
              v-if="
                tableFrom.type == ProductTypeEnum.InTheWarehouse &&
                checkPermi(['merchant:product:batch:set:freight:template'])
              "
              @click.native="handleSetFreight()"
              >{{ $t('product.listSetFreight') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="
                tableFrom.type == ProductTypeEnum.InTheWarehouse && checkPermi(['merchant:product:batch:set:brokerage'])
              "
              @click.native="handleSetCommission()"
              >{{ $t('product.listSetCommission') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="
                checkPermi(['merchant:product:batch:down']) &&
                (tableFrom.type == ProductTypeEnum.OnSale || SoldOutAndAlertInventory)
              "
              @click.native="batchDelisting('down')"
              >{{ $t('product.listBatchOffShelf') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="
                checkPermi(['merchant:product:batch:up']) &&
                (tableFrom.type == ProductTypeEnum.InTheWarehouse || SoldOutAndAlertInventory)
              "
              @click.native="batchDelisting('up')"
              >{{ $t('product.listBatchOnShelf') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="checkPermi(['merchant:product:batch:restore']) && tableFrom.type == ProductTypeEnum.RecycleBin"
              @click.native="handleRestore()"
              >{{ $t('product.listBatchRestore') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="checkPermi(['merchant:product:batch:delete']) && tableFrom.type == ProductTypeEnum.RecycleBin"
              @click.native="handleRecycleBin(tableFrom.type)"
              >{{ $t('product.listBatchDelete') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="
                tableFrom.type === ProductTypeEnum.PendingReview && checkPermi(['merchant:product:batch:submit:audit'])
              "
              @click.native="handlePendingReview()"
              >{{ $t('product.listSubmitAudit') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="
                tableFrom.type == ProductTypeEnum.InTheWarehouse &&
                checkPermi(['merchant:product:batch:add:feedback:coupons'])
              "
              @click.native="handleAddCoupon()"
              >{{ $t('product.listAddFeedbackCoupon') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="checkPermi(['merchant:product:batch:recycle']) && RecycleBin"
              @click.native="handleRecycleBin(tableFrom.type)"
              >{{ $t('product.listAddRecycleBin') }}</el-dropdown-item
            >
          </template>
        </el-dropdown-menu>
      </el-dropdown>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        class="mt20"
        :highlight-current-row="true"
        highlight-current-row
        @selection-change="handleSelectionChange"
        @select-all="selectAll"
        @select="selectOne"
      >
        <el-table-column type="expand" width="40">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item :label="$t('product.listFavorites')">
                <span>{{ props.row.collectCount }}</span>
              </el-form-item>
              <el-form-item :label="$t('product.listInitialSales')">
                <span>{{ props.row.ficti }}</span>
              </el-form-item>
              <el-form-item :label="$t('product.listRejectReason')" v-if="tableFrom.type == 7">
                <span>{{ props.row.reason }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="id" label="ID" min-width="50" v-if="checkedCities.includes('ID')" />
        <el-table-column :label="$t('product.listProductImage')" min-width="80" v-if="checkedCities.includes('productImage')">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('product.listProductName')"
          min-width="200"
          v-if="checkedCities.includes('productName')"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <div>
              <span class="tags_name" :class="'name' + scope.row.specType">{{
                scope.row.specType ? $t('product.listMultiSpec') : $t('product.listSingleSpec')
              }}</span
              >{{ getLocalizedName(scope.row, uiLocale) || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" :label="$t('product.listProductPrice')" min-width="90" v-if="checkedCities.includes('productPrice')" />
        <el-table-column prop="sales" :label="$t('product.listSales')" min-width="90" v-if="checkedCities.includes('sales')" />
        <el-table-column prop="stock" :label="$t('product.listStock')" min-width="90" v-if="checkedCities.includes('stock')" />
        <el-table-column :label="$t('product.listFailReason')" min-width="150" v-if="tableFrom.type === '7'" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="textE93323">{{ scope.row.reason }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.status')" min-width="80" fixed="right" v-if="checkedCities.includes('status')">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:product:up', 'merchant:product:down'])"
              :disabled="IsShow"
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
        <el-table-column width="190" fixed="right">
          <template slot="header">
            <p>
              <span style="padding-right: 5px">{{ $t('product.operate') }}</span>
              <i class="el-icon-setting" @click="handleAddItem"></i>
            </p>
          </template>
          <template slot-scope="scope">
            <!--id:商品id，isDisabled：是否能编辑(1不能，2能)，isCopy：是否是采集商品(1是，2不是)-->
            <template
              v-if="
                tableFrom.type !== ProductTypeEnum.InTheWarehouse &&
                tableFrom.type !== ProductTypeEnum.AlertInventory &&
                tableFrom.type !== ProductTypeEnum.PendingReview &&
                checkPermi(['merchant:product:info'])
              "
            >
              <router-link :to="{ path: `/product/list/creatProduct/${scope.row.id}/1/2/${scope.row.type}` }">
                {{ $t('product.detail') }}
              </router-link>
            </template>
            <template
              v-if="checkPermi(['merchant:product:submit:audit']) && tableFrom.type === ProductTypeEnum.PendingReview"
            >
              <a @click="handlePendingReview(scope.row)">{{ $t('product.listSubmitAudit') }}</a>
            </template>
            <template
              v-if="tableFrom.type !== '5' && tableFrom.type !== '6' && checkPermi(['merchant:product:update'])"
            >
              <el-divider v-if="tableFrom.type !== '2' && tableFrom.type !== '4'" direction="vertical"></el-divider>
              <a @click="onEdit(scope.row)">{{ $t('product.edit') }}</a>
            </template>
            <template v-if="tableFrom.type === '5' && checkPermi(['merchant:product:restor'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="handleRestore(scope.row, scope.$index)">{{ $t('product.listRestoreProduct') }}</a>
            </template>
            <template
              v-if="
                (tableFrom.type === ProductTypeEnum.OnSale ||
                  (tableFrom.type === ProductTypeEnum.AlertInventory && scope.row.isShow) ||
                  (tableFrom.type === ProductTypeEnum.SoldOut && scope.row.isShow)) &&
                checkPermi(['merchant:product:quick:stock:add'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleEdit(scope.row, true)">{{ $t('product.listEditStock') }}</a>
            </template>
            <template
              v-if="
                (tableFrom.type === ProductTypeEnum.InTheWarehouse ||
                  (tableFrom.type === ProductTypeEnum.SoldOut && !scope.row.isShow) ||
                  (tableFrom.type === ProductTypeEnum.AlertInventory && !scope.row.isShow)) &&
                checkPermi(['merchant:product:review:free:edit'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleEdit(scope.row, false)">{{ $t('product.listReviewFreeEdit') }}</a>
            </template>
            <template
              v-if="
                (tableFrom.type === ProductTypeEnum.Audit ||
                  tableFrom.type === ProductTypeEnum.ReviewFailed ||
                  tableFrom.type === ProductTypeEnum.RecycleBin) &&
                checkPermi(['merchant:product:delete'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDelete(scope.row.id, tableFrom.type)">{{
                tableFrom.type === '5' ? $t('product.delete') : $t('product.listAddRecycleBin')
              }}</a>
            </template>
            <!-- 待提审-->
            <template v-if="tableFrom.type === ProductTypeEnum.PendingReview">
              <el-divider direction="vertical"></el-divider>
              <el-dropdown size="small" trigger="click">
                <span class="el-dropdown-link"> {{ $t('product.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    class="infoItem"
                    @click.native="handleInfo(scope.row.id, scope.row.type)"
                    v-if="checkPermi(['merchant:product:info'])"
                    >{{ $t('product.detail') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="checkPermi(['merchant:product:delete'])"
                    @click.native="handleDelete(scope.row.id, tableFrom.type)"
                    >{{ tableFrom.type === '5' ? $t('product.delete') : $t('product.listAddRecycleBin') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </template>

            <template
              v-if="
                tableFrom.type === ProductTypeEnum.InTheWarehouse ||
                tableFrom.type === ProductTypeEnum.AlertInventory ||
                (operation && !scope.row.isShow)
              "
            >
              <el-divider direction="vertical"></el-divider>
              <el-dropdown size="small" trigger="click">
                <span class="el-dropdown-link"> {{ $t('product.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    class="infoItem"
                    @click.native="handleInfo(scope.row.id, scope.row.type)"
                    v-if="(tableFrom.type === '2' || tableFrom.type === '4') && checkPermi(['merchant:product:info'])"
                    >{{ $t('product.detail') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click.native="handleSetFreight(scope.row)"
                    v-if="
                      checkPermi(['merchant:product:set:freight:template']) &&
                      scope.row.type !== 5 &&
                      scope.row.type !== 6
                    "
                    >{{ $t('product.listSetFreight') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="checkPermi(['merchant:product:set:brokerage'])"
                    @click.native="handleSetCommission(scope.row)"
                    >{{ $t('product.listSetCommission') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="checkPermi(['merchant:product:add:feedback:coupons'])"
                    @click.native="handleAddCoupon(scope.row)"
                    >{{ $t('product.listAddFeedbackCoupon') }}</el-dropdown-item
                  >

                  <el-dropdown-item
                    v-if="checkPermi(['merchant:product:delete'])"
                    @click.native="handleDelete(scope.row.id, tableFrom.type)"
                    >{{ tableFrom.type === '5' ? $t('product.delete') : $t('product.listAddRecycleBin') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
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
      <div class="card_abs" v-show="card_select_show">
        <template>
          <div class="cell_ht">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"
              >{{ $t('product.selectAll') }}</el-checkbox
            >
            <el-button type="text" @click="checkSave()">{{ $t('product.save') }}</el-button>
          </div>
          <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="item in columnData" :label="item" :key="item" class="check_cell">{{
              columnLabelMap[item]
            }}</el-checkbox>
          </el-checkbox-group>
        </template>
      </div>
    </el-card>

    <!--编辑库存-->
    <el-drawer
      :title="!stockEdit ? $t('product.listReviewFreeEdit') : $t('product.listEditStock')"
      :visible.sync="drawer"
      :direction="direction"
      :size="1500"
      class="showHeader"
      :before-close="handleCloseEdit"
    >
      <store-edit
        :productId="productId"
        v-if="drawer && productId"
        :productType="productType"
        @subSuccess="subSuccess"
        :stockEdit="stockEdit"
        :isSub="isSub"
      ></store-edit>
    </el-drawer>

    <!-- 设置运费模板-->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="$t('product.listSetFreight')"
      destroy-on-close
      :close-on-click-modal="false"
      width="600px"
      class="dialog-top"
    >
      <el-form
        ref="formValidate"
        class="formValidate"
        :rules="ruleValidate"
        :model="formValidate"
        label-width="75px"
        @submit.native.prevent
      >
        <el-form-item :label="$t('product.listShippingTemplate')" prop="tempId">
          <el-select v-model="formValidate.tempId" :placeholder="$t('product.pleaseSelect')" class="mr20" style="width: 100%">
            <el-option
              v-for="item in shippingTemplates"
              :key="item.id"
              :label="getLocalizedName(item, uiLocale) || item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="dialog-footer-inner">
            <el-button class="btns" size="small" @click="handleClose">{{ $t('product.cancel') }}</el-button>
            <el-button
              type="primary"
              class="submission"
              @click="handleSubmit('formValidate')"
              :loading="loadingBtn"
              v-if="checkPermi(['merchant:product:update'])"
              >{{ $t('product.confirm') }}</el-button
            >
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--批量设置佣金弹窗-->
    <el-dialog v-if="dialogCommision" :title="$t('product.listSetCommission')" :visible.sync="dialogCommision" width="600px">
      <el-form ref="commisionForm" :model="commisionForm" :rules="commisionRule" @submit.native.prevent>
        <el-form-item :label="$t('product.listFirstCommissionRate')" prop="extension_one">
          <el-input-number
            v-model="commisionForm.brokerage"
            :step="1"
            step-strictly
            :min="0"
            :max="100"
            class="priceBox"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item :label="$t('product.listSecondCommissionRate')" prop="extension_two">
          <el-input-number
            v-model="commisionForm.brokerageTwo"
            :step="1"
            :min="0"
            step-strictly
            :max="100"
            class="priceBox"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item>
          <span>{{ $t('product.listCommissionRemark') }}</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCommision = false">{{ $t('product.cancel') }}</el-button>
        <el-button type="primary" @click="submitCommisionForm('commisionForm')">{{ $t('product.submit') }}</el-button>
      </span>
    </el-dialog>

    <!-- 选择商品类型弹窗-->
    <product-tpye ref="productTpye" :addType="addType"></product-tpye>
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

import {
  productLstApi,
  productDeleteApi,
  putOnShellApi,
  offShellApi,
  productHeadersApi,
  restoreApi,
  productExcelApi,
  productAuditApi,
  productBatchDownApi,
  productBatchUpApi,
  productSetFreightApi,
  productBatchFreightApi,
  productBrokerageApi,
  productBatchBrokerageApi,
  productBatchAddCouponsApi,
  productAddCouponsApi,
  productBatchDeleteApi,
  productBatchRecycleApi,
  productBatchRestoreApi,
  productBatchAuditApi,
} from '@/api/product';
import { getToken } from '@/utils/auth';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { mapGetters } from 'vuex';
import storeEdit from './components/storeEdit';
import productTpye from './components/productTpye.vue';
import { ProductTypeEnum } from '@/enums/productEnums';
import * as $constants from '@/utils/constants';
import { handleDeleteTable } from '@/libs/public';
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';
const tableFroms = {
  page: 1,
  limit: $constants.page.limit[0],
  cateId: '',
  keywords: '',
  type: '1',
  categoryId: null,
  isPaidMember: null,
  productType: null,
};
export default {
  name: 'ProductList',
  directives: {
    // 计算是否滚动到最下面
    selectLoadMore: {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          if (this.scrollHeight - this.scrollTop < this.clientHeight + 1) {
            binding.value();
          }
        });
      },
    },
  },
  components: { storeEdit, productTpye },
  data() {
    return {
      drawer: false,
      direction: 'rtl',
      propsPlant: {
        children: 'childList',
        label: 'name',
        value: 'id',
        multiple: false,
        emitPath: false,
      },
      propsMer: {
        children: 'childList',
        label: 'name',
        value: 'id',
        multiple: false,
        emitPath: false,
        checkStrictly: true,
      },
      headeNum: [],
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: Object.assign({}, tableFroms),
      keywords: '',
      categoryList: [],
      objectUrl: process.env.VUE_APP_BASE_API,
      card_select_show: false,
      checkAll: false,
      checkedCities: ['ID', 'productImage', 'productName', 'productPrice', 'sales', 'stock', 'status'],
      columnData: ['ID', 'productImage', 'productName', 'productPrice', 'sales', 'stock', 'status'],
      isIndeterminate: true,
      productId: 0,
      stockEdit: false,
      multipleSelectionAll: [],
      checkedIds: [], //选中的id
      ruleValidate: {
        tempId: [{ required: true, message: this.$t('product.listPleaseSelectShippingTemplate'), trigger: 'change' }],
      },
      formValidate: {
        tempId: '',
      },
      loadingBtn: false,
      dialogVisible: false,
      dialogCommision: false, //佣金弹窗
      commisionForm: { brokerage: 0, brokerageTwo: 0, id: 0, idList: [] }, //设置佣金表单
      commisionRule: {
        brokerage: [{ required: true, message: this.$t('product.listPleaseEnterFirstCommission'), trigger: 'change' }],
        brokerageTwo: [{ required: true, message: this.$t('product.listPleaseEnterSecondCommission'), trigger: 'change' }],
      },
      keyNum: 0,
      couponIds: [], //优惠券集合
      productInfo: null, //商品详情
      productType: 0, //商品类型
      isSub: false, //佣金设置是否单独设置
      addType: 'isAdd',
    };
  },
  computed: {
    productTypeList() {
      return [
        { label: this.$t('product.typeNormal'), value: 0 },
        { label: this.$t('product.typeVirtual'), value: 2 },
        { label: this.$t('product.typeCloudDisk'), value: 5 },
        { label: this.$t('product.typeCardPassword'), value: 6 },
      ];
    },
    objTitle() {
      return [
        this.$t('product.listOnSale'),
        this.$t('product.listInWarehouse'),
        this.$t('product.listSoldOut'),
        this.$t('product.listAlertStock'),
        this.$t('product.listRecycleBin'),
        this.$t('product.listAwaitAudit'),
        this.$t('product.listReviewFailed'),
        this.$t('product.listPendingReview'),
      ];
    },
    uiLocale() {
      return (this.$i18n && this.$i18n.locale) || getUiLocale(this);
    },
    // 列设置下拉框：稳定 key -> 翻译文案
    columnLabelMap() {
      return {
        ID: 'ID',
        productImage: this.$t('product.listProductImage'),
        productName: this.$t('product.listProductName'),
        productPrice: this.$t('product.listProductPrice'),
        sales: this.$t('product.listSales'),
        stock: this.$t('product.listStock'),
        status: this.$t('product.status'),
      };
    },
    ProductTypeEnum() {
      return ProductTypeEnum;
    },
    //操作上下架禁用
    IsShow() {
      return (
        this.tableFrom.type == ProductTypeEnum.RecycleBin ||
        this.tableFrom.type == ProductTypeEnum.Audit ||
        this.tableFrom.type == ProductTypeEnum.ReviewFailed ||
        this.tableFrom.type == ProductTypeEnum.PendingReview
      );
    },
    //已售罄或者警戒库存
    SoldOutAndAlertInventory() {
      return (
        this.tableFrom.type == this.ProductTypeEnum.SoldOut ||
        this.tableFrom.type == this.ProductTypeEnum.AlertInventory
      );
    },
    //已售罄、警戒库存操作判断
    operation() {
      return (
        this.tableFrom.type == this.ProductTypeEnum.SoldOut ||
        this.tableFrom.type == this.ProductTypeEnum.AlertInventory
      );
    },
    //加入回收站 操作
    RecycleBin() {
      return (
        this.tableFrom.type == this.ProductTypeEnum.Audit ||
        this.tableFrom.type == this.ProductTypeEnum.ReviewFailed ||
        this.tableFrom.type === ProductTypeEnum.InTheWarehouse ||
        this.tableFrom.type === ProductTypeEnum.PendingReview
      );
    },
    ...mapGetters(['merPlatProductClassify', 'merProductClassify', 'productBrand', 'shippingTemplates']),
  },
  activated() {
    this.goodHeade();
    this.getList(1);
  },
  mounted() {
    if (checkPermi(['merchant:product:tabs:headers'])) this.goodHeade();
    if (checkPermi(['merchant:product:page:list'])) this.getList();
    if (!localStorage.getItem('shippingTemplates')) this.$store.dispatch('product/getShippingTemplates');
    if (this.$cache.local.has('goods_stroge')) {
      const saved = this.$cache.local.getJSON('goods_stroge');
      // 迁移旧版本中文列名到稳定 key，避免历史缓存导致列显示失败
      const columnKeyMap = {
        商品图: 'productImage',
        商品名称: 'productName',
        商品售价: 'productPrice',
        销量: 'sales',
        库存: 'stock',
        状态: 'status',
      };
      this.checkedCities = Array.isArray(saved) ? saved.map((v) => columnKeyMap[v] || v) : this.checkedCities;
    }
    //this.$store.dispatch('product/getAdminProductClassify');
    this.$store.dispatch('product/getAdminProductClassify');
    if (!localStorage.getItem('merProductClassifyV2')) this.$store.dispatch('product/getMerProductClassify');
    this.$store.dispatch('product/getMerProductBrand');
  },
  methods: {
    checkPermi,
    getLocalizedName,
    getUiLocale,
    //提交审核
    handlePendingReview(row) {
      if (!row && this.checkedIds.length === 0) return this.$message.warning(this.$t('product.listPleaseSelectAtLeastOne'));
      if (!row) {
        this.$modalSure(this.$t('product.listSubmitAuditConfirm')).then(() => {
          productBatchAuditApi({
            idList: this.checkedIds,
          }).then(() => {
            this.$message.success(this.$t('product.listBatchSubmitAuditSuccess'));
            this.getList('');
            this.goodHeade();
          });
        });
      } else {
        this.$confirm(this.$t('product.listAutoOnShelfAfterAudit'), this.$t('product.tip'), {
          confirmButtonText: this.$t('product.onShelf'),
          cancelButtonText: this.$t('product.listNoNeed'),
          type: 'warning',
          distinguishCancelAndClose: true,
          closeOnClickModal: false,
          customClass: 'deleteConfirm',
        })
          .then(() => {
            this.productAudit({ id: row.id, isAutoUp: true });
          })
          .catch((action) => {
            if (action === 'cancel') {
              this.productAudit({ id: row.id, isAutoUp: false });
              // 调用取消按钮的方法
            } else if (action === 'close') {
              console.log('Closed');
              // 调用关闭按钮的方法
            }
          });
      }
    },
    //提审提交
    productAudit(data) {
      productAuditApi(data).then((res) => {
        this.goodHeade();
        this.getList();
      });
    },
    //批量加入回收站
    handleRecycleBin(type) {
      if (this.checkedIds.length === 0) return this.$message.warning(this.$t('product.listPleaseSelectAtLeastOne'));
      this.$modalSure(type == 5 ? this.$t('product.listBatchDeleteConfirm') : this.$t('product.listBatchRecycleConfirm')).then(() => {
        if (type == 5) {
          this.onBatchDelete();
        } else {
          this.onBatchRecycle();
        }
      });
    },
    //批量删除
    onBatchDelete() {
      productBatchDeleteApi({
        idList: this.checkedIds,
      }).then(() => {
        this.$message.success(this.$t('product.batchDeleteSuccess'));
        this.tableFrom.page = this.tableFrom.page - 1;
        this.delSuccess();
      });
    },
    //批量加入回收站
    onBatchRecycle() {
      productBatchRecycleApi({
        idList: this.checkedIds,
      }).then(() => {
        this.$message.success(this.$t('product.listBatchRecycleSuccess'));
        this.tableFrom.page = this.tableFrom.page - 1;
        this.delSuccess();
      });
    },
    // 删除成功
    delSuccess() {
      handleDeleteTable(this.tableData.data.length, this.tableFrom);
      this.getList();
      this.goodHeade();
    },
    //添加回馈券
    handleAddCoupon(row) {
      this.productInfo = row;
      if (!row && this.checkedIds.length === 0) return this.$message.warning(this.$t('product.listPleaseSelectAtLeastOne'));
      const _this = this;
      this.$modalCoupon(
        'wu',
        (_this.keyNum += 1),
        [],
        function (row) {
          row.map((item) => {
            _this.couponIds.push(item.id);
          });
          _this.onSetCoupons(_this.couponIds);
        },
        '',
      );
    },
    //设置优惠券提交
    onSetCoupons(couponIds) {
      if (this.productInfo) {
        productAddCouponsApi({ id: this.productInfo.id, couponIds: couponIds }).then(() => {
          this.$message.success(this.$t('product.listAddCouponSuccess'));
        });
      } else {
        productBatchAddCouponsApi({ idList: this.checkedIds, couponIds: couponIds }).then(() => {
          this.$message.success(this.$t('product.listBatchAddCouponSuccess'));
        });
      }
    },
    // 设置运费
    async handleSetFreight(row) {
      this.productInfo = row;
      if (!row && this.checkedIds.length === 0) return this.$message.warning(this.$t('product.listPleaseSelectAtLeastOne'));
      this.dialogVisible = true;
      if (row) this.formValidate.tempId = row.tempId;
    },
    //设置运费提交
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loadingBtn = true;
          if (this.productInfo) {
            productSetFreightApi({ id: this.productInfo.id, templateId: this.formValidate.tempId })
              .then(() => {
                this.loadingBtn = false;
                this.$message.success(this.$t('product.listSetFreightSuccess'));
                this.dialogVisible = false;
              })
              .catch(() => {
                this.loadingBtn = false;
              });
          } else {
            productBatchFreightApi({ idList: this.checkedIds, templateId: this.formValidate.tempId })
              .then(() => {
                this.loadingBtn = false;
                this.$message.success(this.$t('product.listBatchFreightSuccess'));
                this.dialogVisible = false;
              })
              .catch(() => {
                this.loadingBtn = false;
              });
          }
        }
      });
    },
    //取消运费
    handleClose() {
      this.dialogVisible = false;
      this.formValidate.tempId = '';
    },
    //设置佣金
    handleSetCommission(row) {
      this.productInfo = row;
      if (!row && this.checkedIds.length === 0) return this.$message.warning(this.$t('product.listPleaseSelectAtLeastOne'));
      this.dialogCommision = true;
    },
    //设置佣金提交
    submitCommisionForm(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.productInfo) {
            this.commisionForm.id = this.productInfo.id;
            productBrokerageApi(this.commisionForm).then(() => {
              this.$message.success(this.$t('product.listSetCommissionSuccess'));
              this.dialogCommision = false;
            });
          } else {
            this.commisionForm.idList = this.checkedIds;
            productBatchBrokerageApi(this.commisionForm).then(() => {
              this.$message.success(this.$t('product.listBatchSetCommissionSuccess'));
              this.dialogCommision = false;
            });
          }
        } else {
          return;
        }
      });
    },
    //添加商品
    handleAdd(type) {
      this.addType = type;
      this.$refs.productTpye.proTypedialogVisible = true;
    },
    //批量下架
    batchDelisting(type) {
      if (this.checkedIds.length === 0) return this.$message.warning(this.$t('product.listPleaseSelectAtLeastOne'));
      if (type === 'down') {
        this.$modalSure(this.$t('product.listBatchOffShelfConfirm')).then(() => {
          productBatchDownApi({ idList: this.checkedIds }).then(() => {
            this.$message.success(this.$t('product.listBatchOffShelfSuccess'));
            this.getList(1);
            this.goodHeade();
          });
        });
      } else {
        this.$modalSure(this.$t('product.listBatchOnShelfConfirm')).then(() => {
          productBatchUpApi({ idList: this.checkedIds }).then(() => {
            this.$message.success(this.$t('product.listBatchOnShelfSuccess'));
            this.getList(1);
            this.goodHeade();
          });
        });
      }
    },
    // 设置选中的方法
    handleSelectionChange(val) {
      this.multipleSelectionAll = val;
      const data = [];
      this.multipleSelectionAll.map((item) => {
        data.push(item.id);
      });
      this.checkedIds = data;
    },
    selectAll(data) {
      let id = data.map((i, index) => {
        return i.id;
      });
      this.checkedIds = Array.from(new Set([...this.checkedIds, ...id]));
    },
    selectOne(data, row) {
      let id = data.map((i, index) => {
        return i.id;
      });
      let index = this.checkedIds.findIndex((e) => {
        return e == row.id;
      });
      this.checkedIds.splice(index, 1);
      this.checkedIds = Array.from(new Set([...this.checkedIds, ...id]));
    },
    //编辑商品
    onEdit(row) {
      //id:商品id，isDisabled：是否能编辑(1不能，2能)，isCopy：是否是采集商品(1是，2不是)
      if (this.tableFrom.type === '1') {
        this.$modalSure(this.$t('product.listOffShelfEditConfirm')).then(() => {
          offShellApi(row.id).then(() => {
            this.$router.push({ path: `/product/list/creatProduct/${row.id}/2/2/${row.type}` });
          });
        });
      } else {
        this.$router.push({ path: `/product/list/creatProduct/${row.id}/2/2/${row.type}` });
      }
    },
    //编辑库存成功回调
    subSuccess() {
      this.drawer = false;
      this.handleSeachList();
    },
    handleEdit(row, stockEdit) {
      this.productId = row.id;
      this.productType = row.type;
      this.isSub = row.isSub;
      this.drawer = true;
      this.stockEdit = stockEdit;
    },
    handleCloseEdit() {
      this.drawer = false;
    },
    handleAudit(id) {
      // this.$modalSure('提审商品吗').then(() => {
      //   productAuditApi(id).then((res) => {
      //     this.goodHeade();
      //     this.getList();
      //   });
      // });
      this.$confirm(this.$t('product.listAutoOnShelfAfterAudit'), this.$t('product.tip'), {
        confirmButtonText: this.$t('product.onShelf'),
        cancelButtonText: this.$t('product.listNoNeed'),
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
      })
        .then(() => {
          this.productAudit({ id: id, isAutoUp: true });
        })
        .catch(() => {
          this.productAudit({ id: id, isAutoUp: false });
        });
    },
    //恢复商品
    handleRestore(row) {
      if (!row && this.checkedIds.length === 0) return this.$message.warning(this.$t('product.listPleaseSelectAtLeastOne'));
      this.$modalSure(!row ? this.$t('product.listBatchRestoreConfirm') : this.$t('product.listRestoreConfirm')).then(() => {
        if (row) {
          restoreApi(row.id).then((res) => {
            this.$message.success(this.$t('product.listRestoreSuccess'));
            this.goodHeade();
            this.getList(1);
          });
        } else {
          productBatchRestoreApi({ idList: this.checkedIds }).then((res) => {
            this.$message.success(this.$t('product.listBatchRestoreSuccess'));
            this.goodHeade();
            this.getList(1);
          });
        }
      });
    },
    handleSeachList() {
      this.getList(1);
      this.goodHeade();
    },
    //重置
    handleReset() {
      this.tableFrom.cateId = '';
      this.tableFrom.keywords = '';
      this.tableFrom.categoryId = '';
      this.tableFrom.isPaidMember = null;
      this.tableFrom.productType = null;
      this.keywords = '';
      this.handleSeachList();
    },
    // 导出
    exports() {
      productExcelApi({
        cateId: this.tableFrom.cateId,
        keywords: this.tableFrom.keywords,
        type: this.tableFrom.type,
      }).then((res) => {
        window.location.href = res.fileName;
      });
    },
    // 获取商品表单头数量
    goodHeade() {
      let data = Object.assign({}, this.tableFrom);
      delete data.page;
      delete data.limit;
      delete data.type;
      productHeadersApi(data)
        .then((res) => {
          this.headeNum = res;
        })
        .catch((res) => {
          this.$message.error(res.message);
        });
    },
    changeNodes(data) {
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          if (!data[i].childList || data[i].childList.length < 1) {
            data[i].childList = undefined;
          } else {
            this.changeNodes(data[i].childList);
          }
        }
      }
      return data;
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
      this.$modalSure(type == 5 ? this.$t('product.listDeleteConfirm', { id }) : this.$t('product.listRecycleConfirm', { id })).then(() => {
        const deleteFlag = type == 5 ? 'delete' : 'recycle';
        productDeleteApi({
          id: id,
          type: deleteFlag,
        }).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.delSuccess();
        });
      });
    },
    onchangeIsShow(row) {
      row.isShow
        ? putOnShellApi(row.id)
            .then(() => {
              this.$message.success(this.$t('product.listOnShelfSuccess'));
              this.getList(1);
              this.goodHeade();
            })
            .catch(() => {
              row.isShow = !row.isShow;
            })
        : offShellApi(row.id)
            .then(() => {
              this.$message.success(this.$t('product.listOffShelfSuccess'));
              this.getList(1);
              this.goodHeade();
            })
            .catch(() => {
              row.isShow = !row.isShow;
            });
    },
    handleAddItem() {
      if (this.card_select_show) {
        this.$set(this, 'card_select_show', false);
      } else if (!this.card_select_show) {
        this.$set(this, 'card_select_show', true);
      }
    },
    handleCheckAllChange(val) {
      this.checkedCities = val ? this.columnData : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.columnData.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnData.length;
    },
    checkSave() {
      this.$set(this, 'card_select_show', false);
      this.$modal.loading(this.$t('product.savingLocal'));
      this.$cache.local.setJSON('goods_stroge', this.checkedCities);
      setTimeout(this.$modal.closeLoading(), 1000);
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
.card_abs {
  position: absolute;
  padding-bottom: 15px;
  top: 260px;
  right: 40px;
  width: 200px;
  background: #fff;
  z-index: 99999;
  box-shadow: 0px 0px 14px 0px rgba(0, 0, 0, 0.1);
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
