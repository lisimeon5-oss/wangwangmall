<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['merchant:seckill:product:list']"
    >
      <div class="padding-add">
        <el-form size="small" inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.productName')">
            <el-input v-model="proName" :placeholder="$t('product.pleaseEnterProductName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityNameLabel')">
            <el-input v-model="activityName" :placeholder="$t('marketing.pleaseEnterActivityName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.productStatusLabel')" class="inline">
            <el-select
              v-model="tableFrom.proStatus"
              clearable
              :placeholder="$t('common.pleaseSelect')"
              class="selWidth"
              @change="getList(1)"
            >
              <el-option :label="$t('product.onShelf')" :value="1" />
              <el-option :label="$t('product.offShelf')" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityStatusLabel')" class="inline">
            <el-select
              v-model="tableFrom.activityStatus"
              clearable
              :placeholder="$t('common.pleaseSelect')"
              class="selWidth"
              @change="getList(1)"
            >
              <el-option :label="$t('common.ongoing')" :value="1" />
              <el-option :label="$t('common.ended')" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs
        class="list-tabs"
        v-model="tableFrom.auditStatus"
        @tab-click="getList(1)"
        v-hasPermi="['merchant:seckill:product:list']"
      >
        <el-tab-pane :label="$t('common.auditSuccess')" name="2" />
        <el-tab-pane :label="$t('product.listAwaitAudit')" name="1" />
        <el-tab-pane :label="$t('common.auditFailed')" name="3" />
      </el-tabs>
      <div class="mt5 mb20">
        <el-button size="small" @click="onEdit(0)" type="primary" v-hasPermi="['merchant:seckill:product:add']"
          >{{ $t('marketing.addSeckillProduct') }}</el-button
        >
        <el-button
          v-show="tableFrom.auditStatus === '3'"
          v-hasPermi="['merchant:seckill:product:delete']"
          size="small"
          @click="batchDel"
          :disabled="!multipleSelection.length"
          >{{ $t('product.batchDelete') }}</el-button
        >
        <el-button
          v-hasPermi="['merchant:seckill:product:down']"
          v-if="tableFrom.auditStatus === '2'"
          size="small"
          @click="batchDown"
          :disabled="!multipleSelection.length"
          >{{ $t('marketing.batchOffShelf') }}</el-button
        >
      </div>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        ref="multipleTable"
        row-key="id"
        class="tableSelection"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" :reserve-selection="true" width="45"></el-table-column>
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('product.productImage')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.listProductName')" min-width="180" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.productCategory')" min-width="100" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedText(scope.row.categoryName, scope.row.categoryNameJson) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityName')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedText(scope.row.activityName, scope.row.activityNameJson) }}</template>
        </el-table-column>
        <el-table-column prop="price" :label="$t('product.productPrice')" min-width="90" />
        <el-table-column prop="seckillPrice" :label="$t('marketing.activityPrice')" min-width="90" />
        <el-table-column prop="sort" :label="$t('product.sort')" min-width="60" />
        <el-table-column :label="$t('marketing.productStatus')" min-width="70">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isShow">{{ $t('product.onShelf') }}</el-tag>
            <el-tag v-else>{{ $t('product.offShelf') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityStatus')" fixed="right" min-width="90">
          <template slot-scope="scope">
            <el-tag class="notStartTag tag-background" v-if="scope.row.activityStatus === 0">{{ $t('common.notStarted') }}</el-tag>
            <el-tag class="doingTag tag-background" v-if="scope.row.activityStatus === 1">{{ $t('common.ongoing') }}</el-tag>
            <el-tag class="endTag tag-background" type="info" v-if="scope.row.activityStatus === 2">{{ $t('common.ended') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.auditStatus')" fixed="right" min-width="90">
          <template slot-scope="scope">
            <el-tag class="doingTag tag-background" v-if="scope.row.auditStatus === 1">{{ $t('product.listAwaitAudit') }}</el-tag>
            <el-tag class="endTag tag-background" v-if="scope.row.auditStatus === 2">{{ $t('common.auditSuccess') }}</el-tag>
            <el-tag class="notStartTag tag-background" type="info" v-if="scope.row.auditStatus === 3">{{ $t('common.auditFailed') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="tableFrom.auditStatus === '3'"
          prop="reason"
          :label="$t('marketing.failureReason')"
          fixed="right"
          min-width="120"
          :show-overflow-tooltip="true"
        />
        <el-table-column :label="$t('common.operate')" width="180" fixed="right">
          <template slot-scope="scope">
            <a @click="handleAudit(scope.row, 2)" v-hasPermi="['merchant:seckill:product:list']">{{ $t('common.detail') }}</a>
            <template
              v-if="
                tableFrom.auditStatus === '2' &&
                checkPermi(['merchant:seckill:product:list', 'merchant:seckill:product:add'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleAudit(scope.row, 3)">{{ $t('common.edit') }}</a>
            </template>
            <template
              v-if="tableFrom.auditStatus === '2' && scope.row.isShow && checkPermi(['merchant:seckill:product:down'])"
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDown(scope.row, $t('product.offShelf'))">{{ $t('product.offShelf') }}</a>
            </template>
            <template
              v-if="tableFrom.auditStatus === '2' && !scope.row.isShow && checkPermi(['merchant:seckill:product:up'])"
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDown(scope.row, $t('product.onShelf'))">{{ $t('product.onShelf') }}</a>
            </template>
            <template v-if="tableFrom.auditStatus === '1' && checkPermi(['merchant:seckill:product:withdraw'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="handleWithdraw(scope.row)">{{ $t('marketing.withdrawAudit') }}</a>
            </template>
            <template v-if="tableFrom.auditStatus === '3' && checkPermi(['merchant:seckill:product:delete'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
            </template>
            <template v-if="tableFrom.auditStatus === '3' && checkPermi(['merchant:seckill:product:add'])">
              <el-divider direction="vertical"></el-divider>
              <a @click="onEdit(1, scope.row)">{{ $t('marketing.resubmit') }}</a>
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
    <!--秒杀商品 审核 详情-->
    <el-drawer direction="rtl" :visible.sync="dialogVisible" size="1000px" @close="close('ruleForm')">
      <div v-loading="loading">
        <div class="detailHead">
          <div class="acea-row row-between headerBox">
            <div class="full">
              <img class="order_icon" :src="seckillInfo.image" alt="" />
              <div class="text">
                <div class="title">{{ localizedName(seckillInfo) }}</div>
                <div>
                  <span class="mr20">{{ $t('marketing.productIdLabel') }}{{ seckillInfo.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="detailSection padBox">
          <div class="title">{{ $t('marketing.activityInfo') }}</div>
          <ul class="list">
            <li class="item">
              <div class="tips">{{ $t('marketing.activityNameLabel') }}</div>
              <div class="value">{{ localizedText(seckillInfo.activityName, seckillInfo.activityNameJson) }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('marketing.activityStatusLabel') }}</div>
              <div class="value">{{ seckillInfo.activityStatus | activityStatusFilter }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('finance.auditStatusLabel') }}</div>
              <div class="value">
                {{ seckillInfo.auditStatus == 1 ? $t('product.listAwaitAudit') : seckillInfo.auditStatus == 2 ? $t('finance.auditPassed') : $t('common.auditFailed') }}
              </div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('product.productCategoryLabel') }}</div>
              <div class="value">{{ localizedText(seckillInfo.categoryName, seckillInfo.categoryNameJson) }}</div>
            </li>
          </ul>
        </div>
        <div class="detailSection padBox">
          <div class="title">{{ $t('product.productInfo') }}</div>
          <div class="item item-block mb20">
            <div class="tips">{{ $t('product.productName') }}</div>
            <div class="value">{{ localizedName(seckillInfo) }}</div>
          </div>
          <div style="width: 100%">
            <el-table
              ref="tableList"
              row-key="id"
              :data="seckillInfo.attrValue"
              v-loading="listLoading"
              size="mini"
              border
              default-expand-all
              :tree-props="{ children: 'children' }"
              style="width: 100%"
            >
              <el-table-column min-width="140" :label="$t('product.productInfo')">
                <template slot-scope="scope">
                  <div class="acea-row">
                    <div class="demo-image__preview mr10 line-heightOne">
                      <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
                    </div>
                    <div class="row_title line2">{{ localizedSku(scope.row.sku) }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="otPrice" :label="$t('product.attrPrice')" width="120" />
              <el-table-column prop="quotaShow" :label="$t('marketing.limited')" width="80" />
              <el-table-column prop="quota" :label="$t('marketing.limitedRemaining')" width="120" />
              <el-table-column prop="price" :label="$t('marketing.activityPriceFull')" min-width="120">
                <template slot-scope="scope">
                  <el-input-number
                    :disabled="isShow < 3"
                    v-model="scope.row.price"
                    type="number"
                    :precision="2"
                    :min="0"
                    :max="99999"
                    :controls="false"
                    class="input_width"
                  >
                  </el-input-number>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div v-show="isShow === 3" class="px35">
          <el-button
            size="small"
            class="mb20"
            type="primary"
            @click="setPrice(seckillInfo.id, seckillInfo.attrValue)"
            v-hasPermi="['merchant:seckill:product:price']"
            >{{ $t('marketing.saveActivityPrice') }}</el-button
          >
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  seckillProListApi,
  seckillProSetPriceApi,
  seckillProDelApi,
  seckillProDownApi,
  seckillProUpApi,
  seckillProWithdrawApi,
} from '@/api/marketing';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
import { getLocalizedName, getLocalizedText, getUiLocale, localizeSpecSku } from '@/utils/localizedName';
export default {
  name: 'SeckillList',
  data() {
    return {
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      proName: '',
      activityName: '',
      tableFrom: {
        page: 1,
        limit: this.$constants.page.limit[0],
        proName: '',
        activityName: '',
        auditStatus: '2',
        activityStatus: '',
        proStatus: '',
      },
      multipleSelection: [],
      dialogVisible: false,
      seckillInfo: {},
      isShow: 0, //1审核，2查看，3编辑
      loading: false,
      id: '', //秒杀商品id
    };
  },
  mounted() {
    if (checkPermi(['merchant:seckill:product:list'])) this.getList(1);
    this.$store.dispatch('product/getAdminProductClassify');
  },
  methods: {
    checkPermi,
    localizedName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    localizedText(text, json) {
      return getLocalizedText(text, json, getUiLocale(this));
    },
    localizedSku(sku) {
      return localizeSpecSku(sku, this.$t.bind(this), this.seckillInfo.attrList, getUiLocale(this));
    },
    //表格选中
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 查看编辑
    handleAudit(row, n) {
      this.id = row.id;
      this.isShow = n;
      this.dialogVisible = true;
      this.seckillInfo = row;
    },
    close(refName) {
      this.dialogVisible = false;
      if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
      }
    },
    //重新提交
    onEdit(num, item) {
      if (num === 0) {
        this.$cache.local.remove('seckillData');
      } else {
        localStorage.setItem('seckillData', JSON.stringify(item));
      }
      this.$router.push({ path: '/marketing/seckill/creatSeckill' });
    },
    //撤回审核
    handleWithdraw(row) {
      this.$modalSure(this.$t('marketing.withdrawSeckillConfirm')).then(() => {
        seckillProWithdrawApi(row.id).then((res) => {
          this.getList();
        });
      });
    },
    handleReset() {
      this.tableFrom.proName = '';
      this.tableFrom.activityName = '';
      this.tableFrom.activityStatus = '';
      this.tableFrom.proStatus = '';
      this.activityName = '';
      this.proName = '';
      this.getList(1);
    },
    // 列表
    getList(num) {
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableFrom.activityName = encodeURIComponent(this.activityName);
      this.tableFrom.proName = encodeURIComponent(this.proName);
      this.listLoading = true;
      seckillProListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    batchDel() {
      let ids = this.multipleSelection.map((item) => item.id).toString();
      this.$modalSure(this.$t('marketing.batchDeleteSeckillProductConfirm')).then(() => {
        seckillProDelApi({ ids: ids }).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getList();
        });
      });
    },
    // 删除
    handleDelete(row) {
      this.$modalSure(this.$t('marketing.deleteSeckillProductConfirm')).then(() => {
        seckillProDelApi({ ids: row.id }).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    batchDown() {
      let ids = this.multipleSelection.map((item) => item.id).toString();
      this.$modalSure(this.$t('marketing.batchOffShelfSeckillConfirm')).then(() => {
        seckillProDownApi({ ids: ids }).then(() => {
          this.$message.success(this.$t('product.listOffShelfSuccess'));
          this.getList();
        });
      });
    },
    handleDown(row, title) {
      this.$modalSure($t('marketing.seckillProductActionConfirm', { action: title })).then(() => {
        row.isShow
          ? seckillProDownApi({ ids: row.id }).then(() => {
              this.$message.success($t('marketing.actionSuccess', { action: title }));
              this.getList();
            })
          : seckillProUpApi({ ids: row.id }).then(() => {
              this.$message.success($t('marketing.actionSuccess', { action: title }));
              this.getList();
            });
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
    setPrice(id, row) {
      let productList = {
        productList: [
          {
            attrValue: row.map((item) => {
              return {
                activityPrice: item.price,
                id: item.id,
              };
            }),
            id: id,
          },
        ],
      };
      seckillProSetPriceApi(productList)
        .then((res) => {
          this.$message.success(this.$t('user.addSuccess'));
          this.getList();
          this.dialogVisible = false;
        })
        .catch((res) => {});
    },
  },
};
</script>
<style lang="scss" scoped>
.px35 {
  padding: 0 35px;
}
.row_title {
  width: 246px;
}
.demo-drawer__content {
  padding: 0 30px;
}
</style>
