<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:coupon:page:list']"
    >
      <div class="padding-add">
        <el-form size="small" label-position="right" label-width="78px" @submit.native.prevent inline>
          <el-form-item :label="$t('marketing.couponNameColon')">
            <el-input
              v-model.trim="name"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('user.pleaseEnterCouponName')"
              clearable
              class="selWidth"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.openStatusLabel')">
            <el-select v-model="tableFrom.status" :placeholder="$t('marketing.pleaseSelectOpenStatus')" clearable class="selWidth">
              <el-option :label="$t('common.open')" :value="1"></el-option>
              <el-option :label="$t('common.close')" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.receiveMethodLabel')">
            <el-select v-model="tableFrom.receiveType" clearable :placeholder="$t('marketing.pleaseSelectReceiveMethod')" class="selWidth">
              <el-option :label="$t('marketing.userReceive')" :value="1"></el-option>
              <el-option :label="$t('marketing.platformActivityUse')" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.useScopeLabel')">
            <el-select
              v-model="tableFrom.category"
              clearable
              :placeholder="$t('marketing.pleaseSelectUseScope')"
              @change="getList(1)"
              class="selWidth"
            >
              <el-option :label="$t('marketing.product')" :value="2"></el-option>
              <el-option :label="$t('marketing.general')" :value="3"></el-option>
              <el-option :label="$t('marketing.category')" :value="4"></el-option>
              <el-option :label="$t('product.brand')" :value="5"></el-option>
              <el-option :label="$t('marketing.crossStore')" :value="6"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <router-link v-hasPermi="['platform:coupon:add']" :to="{ path: '/marketing/platformCoupon/creatCoupon' }">
        <el-button size="small" type="primary" class="mr10">{{ $t('marketing.addCouponWord') }}</el-button>
      </router-link>
      <el-table v-loading="listLoading" :data="tableData.data" size="small" ref="multipleTable" class="mt20">
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :show-overflow-tooltip="true" :label="$t('user.couponNameCol')" min-width="150">
          <template slot-scope="scope">{{ getLocalizedCouponName(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="category" :label="$t('product.usageScope')" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.category | couponCategory }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="money" :label="$t('marketing.faceValueCol')" min-width="90" />
        <el-table-column prop="minPrice" :label="$t('marketing.useThreshold')" min-width="90" />
        <el-table-column prop="issuedNum" :label="$t('marketing.useGrantCount')" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.usedNum }}/{{ scope.row.issuedNum }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isLimited" :label="$t('marketing.publishCount')" min-width="90">
          <template slot-scope="scope">
            <span>{{ !scope.row.isLimited ? $t('user.unlimited') : scope.row.total }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="receiveType" :label="$t('user.receiveMethod')" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.receiveType | receiveType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="receiveStartTime" :label="$t('marketing.receiveDate')" min-width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.receiveEndTime">
              {{ scope.row.receiveStartTime }} -<br />
              {{ scope.row.receiveEndTime }}
            </div>
            <span v-else>{{ $t('marketing.noTimeLimit') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('community.isEnabled')" fixed="right" min-width="90">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:coupon:switch'])"
              v-model="scope.row.status"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @change="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.status ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="120" fixed="right">
          <template slot-scope="scope">
            <a v-if="checkPermi(['platform:coupon:detail'])" @click="look(scope.row.id)">{{ $t('common.detail') }}</a>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> {{ $t('user.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-hasPermi="['platform:coupon:detail', 'platform:coupon:update']">
                  <router-link :to="{ path: '/marketing/platformCoupon/creatCoupon/' + scope.row.id }">
                    {{ $t('common.edit') }}
                  </router-link>
                </el-dropdown-item>
                <el-dropdown-item v-hasPermi="['platform:coupon:detail', 'platform:coupon:add']">
                  <router-link :to="{ path: '/marketing/platformCoupon/creatCoupon/' + scope.row.id + '/' + 1 }">
                    {{ $t('marketing.copy') }}
                  </router-link>
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleDelete(scope.row.id)" v-hasPermi="['platform:coupon:delete']">
                  {{ $t('common.delete') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <!--优惠券详情-->
    <el-drawer :title="$t('marketing.couponDetail')" size="1000px" :visible.sync="showInfo" direction="rtl" :before-close="handleClose">
      <div v-loading="loading">
        <div class="detailHead" :class="!showTab ? 'bdbtmSolid' : ''">
          <div class="full">
            <div class="order_icon"><span class="iconfont icon-youhuiquan"></span></div>
            <div class="text">
              <div class="title">{{ getLocalizedCouponName(cell) }}</div>
              <div>
                <span class="mr20">{{ $t('marketing.couponFaceValueLabel') }}{{ cell.money }}{{ $t('dashboard.yuan') }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-tabs type="border-card" v-model="activeNames" v-if="showTab">
          <el-tab-pane :label="$t('community.basicInfo')" name="one"></el-tab-pane>
          <el-tab-pane :label="tabPaneName" name="two"></el-tab-pane>
        </el-tabs>
        <div class="px35" v-if="activeNames == 'one'">
          <div class="detailSection" style="border: none">
            <div class="title">{{ $t('marketing.couponInfo') }}</div>
            <ul class="list">
              <li class="item">
                <div class="tips">{{ $t('marketing.useThresholdLabel') }}</div>
                <div class="value">{{ cell.minPrice }}{{ $t('dashboard.yuan') }}</div>
              </li>
              <li class="item">
                <div class="tips">{{ $t('marketing.receiveTimeLabel') }}</div>
                <div class="value">
                  {{ cell.isTimeReceive ? cell.receiveStartTime + ' - ' + cell.receiveEndTime : $t('marketing.noTimeLimit') }}
                </div>
              </li>
              <li class="item">
                <div class="tips">{{ $t('marketing.receiveMethodLabel') }}</div>
                <div class="value">
                  {{ cell.receiveType | receiveType }}
                </div>
              </li>
              <li class="item">
                <div class="tips">{{ $t('marketing.useScopeLabel') }}</div>
                <div class="value">{{ cell.category | couponCategory }}</div>
              </li>
              <li class="item">
                <div class="tips">{{ $t('marketing.repeatReceiveLabel') }}</div>
                <div class="value">{{ cell.isRepeated ? $t('marketing.canRepeatReceive') : $t('marketing.noRepeatReceive') }}</div>
              </li>
              <li class="item">
                <div class="tips">{{ $t('marketing.publishCountLabel') }}</div>
                <div class="value">{{ !cell.isLimited ? $t('user.unlimited') : cell.total }}</div>
              </li>

              <li class="item">
                <div class="tips">{{ $t('merchant.enableLabel') }}</div>
                <div class="value">{{ cell.status ? $t('common.open') : $t('common.close') }}</div>
              </li>
              <li class="item">
                <div class="tips">{{ $t('marketing.useValidityLabel') }}</div>
                <div class="value">
                  {{
                    cell.isFixedTime
                      ? $t('marketing.rangeValid', { range: cell.useStartTime + ' - ' + cell.useEndTime })
                      : $t('marketing.afterReceiveValid', { day: cell.day })
                  }}
                </div>
              </li>
            </ul>
          </div>
          <div class="detailSection">
            <div class="title">{{ $t('marketing.couponSituation') }}</div>
            <ul class="list">
              <li class="item">
                <div class="tips">{{ $t('marketing.grantedCountLabel') }}</div>
                <div class="value">{{ cell.issuedNum }}</div>
              </li>
              <li class="item">
                <div class="tips">{{ $t('marketing.usedCountLabel') }}</div>
                <div class="value">{{ cell.usedNum }}</div>
              </li>
            </ul>
          </div>
        </div>
        <div class="px35" v-if="cell.category == 2 && activeNames == 'two'">
          <el-table ref="tableList" v-loading="listLoading" :data="cell.productList" class="mt20" size="small">
            <el-table-column prop="id" label="ID" width="55"> </el-table-column>
            <el-table-column :label="$t('product.productImage')" min-width="80">
              <template slot-scope="scope">
                <div class="demo-image__preview line-heightOne">
                  <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
                </div>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="name" :label="$t('product.productName')" min-width="150" />
            <el-table-column prop="price" :label="$t('user.salePricePlaceholder')" min-width="90" />
            <el-table-column prop="stock" :label="$t('product.stock')" min-width="70" />
          </el-table>
        </div>
        <div class="px35" v-if="cell.category == 6 && activeNames == 'two'">
          <el-table ref="tableList" :data="cell.merchantList" class="mt20" size="small">
            <el-table-column prop="categoryId" label="ID" min-width="55"> </el-table-column>
            <el-table-column :label="$t('marketing.merchantAvatar')" min-width="80">
              <template slot-scope="scope">
                <div class="demo-image__preview line-heightOne">
                  <el-image :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" />
                </div>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="name" :label="$t('product.merchantName')" min-width="150" />
            <el-table-column :label="$t('product.merchantType')" min-width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.isSelf | selfTypeFilter }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
    <el-dialog :title="$t('common.delete')" :visible.sync="delShow" width="430px" :before-close="handleClose">
      <div>
        <el-radio v-model="loseEfficacyStatus" :label="0">{{ $t('marketing.receivedCouponStillValid') }}</el-radio><br />
        <el-radio v-model="loseEfficacyStatus" :label="1" class="mt20"
          >{{ $t('marketing.syncDeleteCouponTip') }}</el-radio
        >
      </div>
      <div class="acea-row row-right mt20 btnBottom">
        <el-button size="small" @click="delShow = false">{{ $t('el.messagebox.cancel') }}</el-button>
        <el-button size="small" type="primary" @click="confirmDelete()">{{ $t('common.delete') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { couponDeleteApi, couponInfoApi, couponStatusApi, platformCouponListApi } from '@/api/marketing';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { getLocalizedName } from '@/utils/localizedName';
export default {
  name: 'platformCoupon',
  data() {
    return {
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        category: '',
        name: '',
        status: '',
        receiveType: '',
      },
      name: '',
      fromList: this.$constants.fromList,
      showInfo: false,
      delShow: false,
      cell: {},
      loseEfficacyStatus: 0,
      tabPaneName: this.$t('user.more'),
      activeNames: 'one',
      showTab: false,
      loading: false,
    };
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
  mounted() {
    if (checkPermi(['platform:coupon:page:list'])) this.getList(1);
    if (!localStorage.getItem('merPlatProductClassify')) this.$store.dispatch('product/getAdminProductClassify');
  },
  methods: {
    checkPermi,
    getLocalizedCouponName(row) {
      return getLocalizedName(row, this.currentLocale);
    },
    onchangeIsShow(row) {
      couponStatusApi(row.id)
        .then(async () => {
          this.$message.success(this.$t('category.updateSuccess'));
        })
        .catch(() => {
          row.status = !row.status;
        });
    },
    look(id) {
      this.showTab = false;
      this.activeNames = 'one';
      this.loading = true;
      couponInfoApi(id)
        .then((res) => {
          if (res.category == 6) {
            this.tabPaneName = this.$t('marketing.merchantList');
            this.showTab = true;
          } else if (res.category == 2) {
            this.tabPaneName = this.$t('marketing.productList');
            this.showTab = true;
          }
          this.cell = res;
          this.showInfo = true;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 删除
    handleDelete(id) {
      this.rowId = id;
      this.delShow = true;
    },
    // 列表
    getList(num) {
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableFrom.name = encodeURIComponent(this.name);
      this.listLoading = true;
      platformCouponListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    reset() {
      this.tableFrom.category = '';
      this.tableFrom.name = '';
      this.tableFrom.status = '';
      this.tableFrom.receiveType = '';
      this.name = '';
      this.getList(1);
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList();
    },
    handleClose() {
      this.showInfo = false;
      this.delShow = false;
    },
    confirmDelete() {
      couponDeleteApi({
        id: this.rowId,
        loseEfficacyStatus: this.loseEfficacyStatus,
      }).then(() => {
        this.$message.success(this.$t('product.deleteSuccess'));
        this.delShow = false;
        if (this.tableData.data.length === 1 && this.tableFrom.page > 1) this.tableFrom.page = this.tableFrom.page - 1;
        this.getList(1);
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep.el-drawer__header {
  display: block !important;
}
::v-deep .el-table th.el-table__cell > .cell,
::v-deep.el-table .cell,
.el-table--border .el-table__cell:first-child .cell {
  padding-left: 15px;
}
.section {
  padding: 25px 0;
  border-bottom: 1px dashed #eeeeee;
  .title {
    padding-left: 10px;
    border-left: 3px solid #1890ff;
    font-size: 15px;
    line-height: 15px;
    font-weight: bold;
    color: #333;
  }
  .cell {
    font-size: 14px;
    color: #333;
    margin-top: 20px;
  }
}
::v-deep .el-tabs__content {
  display: none;
}
</style>
