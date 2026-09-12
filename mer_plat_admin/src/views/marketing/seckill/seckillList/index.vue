<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:seckill:product:list']"
    >
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('videoChannel.productNameLabel')">
            <el-input v-model="proName" :placeholder="$t('product.pleaseEnterProductName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityNameLabel')">
            <el-input v-model="activityName" :placeholder="$t('marketing.pleaseEnterActivityName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.productStatusLabel')" class="inline">
            <el-select v-model="tableFrom.proStatus" clearable :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option :label="$t('product.onShelf')" :value="1" />
              <el-option :label="$t('product.offShelf')" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityStatusLabel')" class="inline">
            <el-select v-model="tableFrom.activityStatus" clearable :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option :label="$t('common.ongoing')" :value="1" />
              <el-option :label="$t('common.ended')" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('product.merchantNameLabel')">
            <merchant-name @getMerId="getMerId" :merIdChecked="merIds"></merchant-name>
          </el-form-item>
          <el-form-item :label="$t('marketing.merchantStarLevel')" class="inline">
            <el-select v-model="tableFrom.merStars" clearable :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option :label="$t('marketing.oneStarAbove')" :value="1" />
              <el-option :label="$t('marketing.twoStarAbove')" :value="2" />
              <el-option :label="$t('marketing.threeStarAbove')" :value="3" />
              <el-option :label="$t('marketing.fourStarAbove')" :value="4" />
              <el-option :label="$t('marketing.fiveStarAbove')" :value="5" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset('tableFrom')">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
        <el-tabs class="list-tabs" v-model="tableFrom.auditStatus" @tab-click="getList(1)">
        <el-tab-pane :label="item.name" :name="item.type" v-for="(item, index) in headerTabs" :key="item.type" />
      </el-tabs>
      <div class="acea-row mt5">
        <el-button
          v-hasPermi="['platform:seckill:product:delete']"
          size="small"
          @click="batchDel"
          :disabled="!multipleSelection.length"
        >
          {{ $t('product.batchDelete') }}
        </el-button>
        <el-button
          v-if="tableFrom.auditStatus === '2' && checkPermi(['platform:seckill:product:down'])"
          size="small"
          @click="batchDown"
          :disabled="!multipleSelection.length"
        >
          {{ $t('marketing.batchOffShelf') }}
        </el-button>
      </div>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        size="small"
        ref="multipleTable"
        row-key="id"
        @selection-change="handleSelectionChange"
        class="mt20 tableSelection"
      >
        <el-table-column type="selection" :reserve-selection="true" width="45"></el-table-column>
        <el-table-column prop="id" label="ID" min-width="45" />
        <el-table-column :label="$t('product.productImage')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.productName')" min-width="180" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.productCategory')" min-width="100" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedText(scope.row.categoryName, scope.row.categoryNameJson) }}</template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" :label="$t('product.merchantName')" min-width="130">
          <template slot-scope="scope">{{ localizedText(scope.row.merName, scope.row.merNameJson) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityName')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedText(scope.row.activityName, scope.row.activityNameJson) }}</template>
        </el-table-column>
        <el-table-column prop="price" :label="$t('product.productPrice')" min-width="90" />
        <el-table-column prop="seckillPrice" :label="$t('marketing.activityPrice')" min-width="90" />
        <el-table-column :label="$t('marketing.merchantStarLevel')" min-width="140">
          <template slot-scope="scope">
            <el-rate disabled v-model="scope.row.merStarLevel"></el-rate>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('product.sort')" min-width="60" />
        <el-table-column :label="$t('marketing.productStatus')" fixed="right" min-width="70">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isShow">{{ $t('product.onShelf') }}</el-tag>
            <el-tag v-else>{{ $t('product.offShelf') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityStatus')" fixed="right" min-width="90">
          <template slot-scope="scope">
            <el-tag class="notStartTag tag-background" v-if="scope.row.activityStatus === 0">{{ $t('common.notStarted') }}</el-tag>
            <el-tag class="doingTag tag-background" v-if="scope.row.activityStatus === 1">{{ $t('common.ongoing') }}</el-tag>
            <el-tag class="endTag tag-background" v-if="scope.row.activityStatus === 2">{{ $t('common.ended') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.auditStatus')" fixed="right" min-width="90">
          <template slot-scope="scope">
            <el-tag class="doingTag tag-background" v-if="scope.row.auditStatus === 1">{{ $t('dashboard.awaitAudit') }}</el-tag>
            <el-tag class="endTag tag-background" v-if="scope.row.auditStatus === 2">{{ $t('common.auditSuccess') }}</el-tag>
            <el-tag class="notStartTag tag-background" v-if="scope.row.auditStatus === 3">{{ $t('common.auditFailed') }}</el-tag>
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
        <el-table-column :label="$t('common.operate')" width="190" fixed="right">
          <template slot-scope="scope">
            <a v-if="checkPermi(['platform:seckill:product:list'])" @click="handleAudit(scope.row, 2)">{{ $t('common.detail') }}</a>
            <el-divider direction="vertical"></el-divider>
            <template v-if="tableFrom.auditStatus === '2' && checkPermi(['platform:seckill:product:list'])">
              <a @click="handleAudit(scope.row, 3)">{{ $t('common.edit') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template v-if="tableFrom.auditStatus === '1' && checkPermi(['platform:seckill:time:interval:delete'])">
              <a @click="handleAudit(scope.row, 1)">{{ $t('finance.audit') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template
              v-if="tableFrom.auditStatus === '2' && scope.row.isShow && checkPermi(['platform:seckill:product:down'])"
            >
              <a @click="handleDown(scope.row)">{{ $t('product.offShelf') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template v-if="checkPermi(['platform:seckill:product:delete'])">
              <a @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
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

    <!--秒杀商品 审核 详情-->
    <el-drawer
      custom-class="demo-drawer"
      direction="rtl"
      :visible.sync="dialogVisible"
      size="1000px"
      @close="close('ruleForm')"
    >
      <div v-loading="loading">
        <div class="detailHead">
          <div class="acea-row row-between headerBox">
            <div class="full">
              <img class="order_icon" :src="seckillInfo.image" alt="" />
              <div class="text">
                <div class="title">{{ localizedName(seckillInfo) }}</div>
                <div>
                  <span class="mr20">{{ $t('product.productIdLabel') }}{{ seckillInfo.id }}</span>
                </div>
              </div>
            </div>
            <div v-if="isShow === 1" class="acea-row justify-content">
              <el-button
                v-hasPermi="['platform:seckill:product:audit']"
                v-debounceClick="
                  () => {
                    onSubmit('fail');
                  }
                "
                style="margin-left: 0"
                >{{ loadingBtn ? $t('finance.submitting') : $t('product.auditRejected') }}</el-button
              >
              <el-button
                type="primary"
                v-hasPermi="['platform:seckill:product:audit']"
                v-debounceClick="
                  () => {
                    onSubmit('success');
                  }
                "
                >{{ loadingBtn ? $t('finance.submitting') : $t('finance.auditPassed') }}</el-button
              >
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
              <div class="value color-warning">{{ seckillInfo.activityStatus | activityStatusFilter }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('finance.auditStatusLabel') }}</div>
              <div class="value color-warning">
                {{ seckillInfo.auditStatus == 1 ? $t('dashboard.awaitAudit') : seckillInfo.auditStatus == 2 ? $t('finance.auditPassed') : $t('common.auditFailed') }}
              </div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('product.productCategoryLabel') }}</div>
              <div class="value">{{ localizedText(seckillInfo.categoryName, seckillInfo.categoryNameJson) }}</div>
            </li>
          </ul>
        </div>
        <div class="detailSection padBox">
          <div class="title">{{ $t('marketing.merchantInfoTitle') }}</div>
          <ul class="list">
            <li class="item">
              <div class="tips">{{ $t('product.merchantNameLabel') }}</div>
              <div class="value">{{ localizedText(seckillInfo.merName, seckillInfo.merNameJson) }}</div>
            </li>
            <li class="item">
              <div class="tips">{{ $t('marketing.merchantStarLevel') }}：</div>
              <div class="value">
                <el-rate disabled v-model="seckillInfo.merStarLevel" style="margin-top: -3px"></el-rate>
              </div>
            </li>
          </ul>
        </div>
        <div class="detailSection padBox">
          <div class="title">{{ $t('product.productInfo') }}</div>
          <div class="value w100">
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
              <el-table-column prop="otPrice" :label="$t('user.salePricePlaceholder')" width="120" />
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
          <div v-show="isShow === 3" class="mt20 acea-row justify-content">
            <el-button
              size="small"
              type="primary"
              @click="setPrice(seckillInfo.id, seckillInfo.attrValue)"
              v-hasPermi="['platform:seckill:product:price']"
              >{{ $t('marketing.saveActivityPrice') }}</el-button
            >
          </div>
        </div>
      </div>
      <!--      <div slot="title">-->
      <!--        {{ isShow === 1 ? $t('marketing.auditSpikeProduct') : isShow === 3 ? '秒杀商品编辑' : '秒杀商品详情' }}-->
      <!--      </div>-->
    </el-drawer>
  </div>
</template>

<script>
import {
  seckillProListApi,
  seckillProSetPriceApi,
  seckillProDelApi,
  seckillProDownApi,
  seckillProAuditApi,
} from '@/api/marketing';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import merchantName from '@/components/merUseCategory';
import { handleDeleteTable } from '@/libs/public';
import { getLocalizedName, getLocalizedText, getUiLocale, localizeSpecSku } from '@/utils/localizedName';
export default {
  name: 'SeckillList',
  components: {
    merchantName,
  },
  data() {
    return {
      orderImg: require('@/assets/imgs/order_icon.png'),
      isShow: 0, //1审核，2查看，3编辑
      loading: false,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      proName: '',
      activityName: '',
      tableFrom: {
        page: 1,
        limit: 20,
        proName: '',
        activityName: '',
        merStars: null,
        auditStatus: '2',
        merIds: '',
        activityStatus: '',
        proStatus: '',
      },
      multipleSelection: [],
      ruleForm: {
        reason: '',
        auditStatus: 'success',
        id: '',
      },
      rules: {
        auditStatus: [{ required: true, message: this.$t('product.pleaseSelectAuditStatus'), trigger: 'change' }],
        reason: [{ required: true, message: this.$t('product.pleaseEnterRejectReason'), trigger: 'blur' }],
      },
      dialogVisible: false,
      loadingBtn: false,
      id: '', //秒杀商品id
      merIds: [], //商户id
      seckillInfo: {},
    };
  },
  computed: {
    headerTabs() {
      return [
        { name: this.$t('common.auditSuccess'), type: '2' },
        { name: this.$t('dashboard.awaitAudit'), type: '1' },
        { name: this.$t('common.auditFailed'), type: '3' },
      ];
    },
  },
  mounted() {
    if (checkPermi(['platform:user:tag:list'])) this.getList(1);
    if (!localStorage.getItem('merPlatProductClassify')) this.$store.dispatch('product/getAdminProductClassify');
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
    reset(formName) {
      this.proName = '';
      this.activityName = '';
      this.merIds = [];
      this.tableFrom.proName = '';
      this.tableFrom.activityName = '';
      this.tableFrom.merStars = null;
      this.tableFrom.merIds = null;
      this.tableFrom.proName = '';
      this.tableFrom.activityStatus = '';
      this.tableFrom.proStatus = '';
      this.getList(1);
    },
    //审核拒绝
    cancelForm() {
      this.$modalPrompt('textarea', this.$t('product.rejectReason')).then((V) => {
        this.ruleForm.reason = V;
        this.submit();
      });
    },
    // 审核提交
    onSubmit(type) {
      this.ruleForm.auditStatus = type;
      if (type === 'success') {
        this.$modalSure(this.$t('marketing.approveSpikeProductConfirm')).then(() => {
          this.submit();
        });
      } else {
        this.cancelForm();
      }
    },
    submit() {
      this.loadingBtn = true;
      this.ruleForm.id = this.id;
      seckillProAuditApi(this.ruleForm)
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.dialogVisible = false;
          this.loadingBtn = false;
          this.getList();
        })
        .catch((res) => {
          this.loadingBtn = false;
        });
    },
    //表格选中
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getMerId(id) {
      this.merIds = id;
      this.tableFrom.merIds = id.toString();
      this.getList();
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
    //批量删除
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
    //批量下架
    batchDown() {
      let ids = this.multipleSelection.map((item) => item.id).toString();
      this.$modalSure(this.$t('marketing.batchOffShelfSeckillConfirm')).then(() => {
        seckillProDownApi({ ids: ids }).then(() => {
          this.$message.success(this.$t('user.offShelfSuccess'));
          this.getList();
        });
      });
    },
    //下架
    handleDown(row) {
      this.$modalSure(this.$t('marketing.offShelfSpikeConfirm')).then(() => {
        seckillProDownApi({ ids: row.id }).then(() => {
          this.$message.success(this.$t('user.offShelfSuccess'));
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
    //编辑价格
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
          this.$message.success(this.$t('user.saveSuccess'));
          this.getList();
          this.dialogVisible = false;
        })
        .catch((res) => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.demo-drawer__content {
  padding: 0 30px;
  padding-bottom: 86px;
}

.title {
  margin-bottom: 14px;
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.description {
  &-term {
    display: table-cell;
    padding-bottom: 5px;
    line-height: 20px;
    width: 50%;
    font-size: 14px;
    color: #606266;
  }
  ::v-deep .el-divider--horizontal {
    margin: 12px 0 !important;
  }
}
</style>
