<template>
  <div>
    <el-drawer :visible.sync="dialogVisible" :direction="direction" size="1000px" :before-close="handleClose">
      <div>
        <div class="detailHead">
          <div class="full">
            <div class="order_icon"><span class="iconfont icon-dingdan"></span></div>
            <div class="text">
              <div class="title">
                <span>{{ localizedGroupName(groupInfo) }}</span>
                <el-tag
                  size="mini"
                  effect="plain"
                  :type="groupInfo.groupProcess == 0 ? 'success' : groupInfo.groupProcess == 1 ? 'warning' : 'info'"
                  >{{ groupProcessArr[groupInfo.groupProcess] }}</el-tag
                >
              </div>
              <div>
                <span class="mr20">{{ groupInfo.startTime }} {{ $t('marketing.timeTo') }} {{ groupInfo.endTime }}</span>
              </div>
            </div>
          </div>
          <ul class="list">
            <li class="item">
              <div class="title">{{ $t('product.auditStatus') }}</div>
              <div>
                <span>{{ groupStatusArr[groupInfo.groupStatus] }}</span>
              </div>
            </li>
            <li class="item">
              <div class="title">{{ $t('marketing.startedGroupCount') }}</div>
              <div>{{ groupInfo.totalActivityBegin }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('marketing.formedGroupCount') }}</div>
              <div>{{ groupInfo.totalActivityDone }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('marketing.joinGroupOrderCount') }}</div>
              <div>{{ groupInfo.totalOrderBegin }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('marketing.formedOrderCount') }}</div>
              <div>{{ groupInfo.totalOrderDone }}</div>
            </li>
          </ul>
        </div>
        <el-tabs type="border-card" v-model="activeName">
          <el-tab-pane :label="$t('marketing.activityInfo')" name="detail">
            <div class="detailSection" style="border: none">
              <div class="title">{{ $t('community.basicInfo') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="tips">{{ $t('marketing.activityTagLabel') }}</div>
                  <div class="value">{{ $t('marketing.peopleGroup', { count: groupInfo.buyCount }) }}</div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('marketing.formedCountLabel') }}</div>
                  <div class="value">{{ groupInfo.buyCount }}</div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('marketing.formedValidityLabel') }}</div>
                  <div class="value">{{ $t('marketing.hoursValue', { count: groupInfo.validHour }) }}</div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('marketing.activityPurchaseLimitLabel') }}</div>
                  <div class="value">{{ groupInfo.allQuota == -1 ? $t('marketing.unlimited') : groupInfo.allQuota }}</div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('marketing.singlePurchaseLimitLabel') }}</div>
                  <div class="value">{{ groupInfo.oncQuota == -1 ? $t('marketing.unlimited') : groupInfo.oncQuota }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('marketing.advancedSettings') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="tips">{{ $t('marketing.joinGroupLabel') }}</div>
                  <div class="value">{{ groupInfo.showGroup ? $t('common.open') : $t('common.close') }}</div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('marketing.virtualGroupLabel') }}</div>
                  <div class="value">{{ groupInfo.fictiStatus ? $t('common.open') : $t('common.close') }}</div>
                </li>
              </ul>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('product.productInfo')" name="goods">
            <div>
              <div
                class="table-box"
                v-for="(item, index) in groupInfo.groupBuyActivityProductResponseList"
                :key="index"
              >
                <div class="detailHead">
                  <div class="full">
                    <i
                      class="iconfont iconChange"
                      :class="item.visible ? 'icon-xuanze' : 'icon-xiala1'"
                      @click="openClose(item)"
                    ></i>
                    <img :src="item.image" alt="" />
                    <div class="text table-text">
                      <div class="title line1" :title="localizedProductName(item)">{{ localizedProductName(item) }}</div>
                    </div>
                  </div>
                </div>
                <div class="tablelHead text-title" v-if="!item.groupBuyActivitySkuResponses.length">{{ $t('marketing.productOffShelfGroupBuyTip') }}</div>
                <div class="tablelHead" v-if="item.groupBuyActivitySkuResponses.length">
                  <el-table
                    :data="item.groupBuyActivitySkuResponses"
                    class="orderDetailList"
                    size="small"
                    v-if="!item.visible"
                  >
                    <el-table-column :label="$t('product.image')">
                      <template slot-scope="scope">
                        <img :src="scope.row['attrValue'][0].image" alt="" />
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('marketing.spec')" prop="sku">
                      <template slot-scope="scope">
                        <span>{{ localizedSku(scope.row, item) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('marketing.productCode')" prop="barCode">
                      <template slot-scope="scope">
                        <span>{{ scope.row['attrValue'][0].barCode || '--' }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('marketing.salePriceYuan')" prop="price">
                      <template slot-scope="scope">
                        <span>{{ scope.row['attrValue'][0].price }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('marketing.remainingStock')" prop="stock">
                      <template slot-scope="scope">
                        <span>{{ scope.row['attrValue'][0].stock }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('marketing.groupPriceYuan')" prop="activePrice"></el-table-column>
                    <el-table-column :label="$t('marketing.groupQuotaLimit')" prop="quota"></el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
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

import { getLocalizedText, getUiLocale, localizeSpecSku } from '@/utils/localizedName';

export default {
  props: {},
  data() {
    return {
      activeName: 'detail',
      direction: 'rtl',
      dialogVisible: false,
      groupInfo: {},
      groupStatusArr: [this.$t('marketing.initialize'), this.$t('common.rejected'), this.$t('order.revoked'), this.$t('product.listAwaitAudit'), this.$t('common.approved')],
      groupProcessArr: [this.$t('common.notStarted'), this.$t('common.ongoing'), this.$t('common.ended')],
    };
  },
  watch: {},
  mounted() {
    this.activeName = 'detail';
  },
  methods: {
    localizedGroupName(row) {
      return getLocalizedText(row.groupName, row.groupNameJson, getUiLocale(this));
    },
    localizedProductName(row) {
      return getLocalizedText(row.productName, row.productNameJson, getUiLocale(this));
    },
    localizedSku(row, product) {
      const attrValue = row && row.attrValue && row.attrValue[0];
      const sku = (attrValue && attrValue.sku) || (row && row.sku) || '';
      const attrList = (product && product.attrList) || (row && row.attrList);
      return localizeSpecSku(sku, this.$t.bind(this), attrList, getUiLocale(this));
    },
    openClose(item) {
      if (item.visible) {
        this.$set(item, 'visible', false);
      } else {
        this.$set(item, 'visible', true);
      }
    },
    handleClose() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-tabs__content {
  padding: 0 20px !important;
}

.detailSection {
  padding: 25px 15px !important;
}

::v-deep .el-table th.el-table__cell > .cell,
::v-deep.el-table .cell,
.el-table--border .el-table__cell:first-child .cell {
  padding-left: 15px;
}

.demo-drawer__content {
  padding: 0 30px;
}

.demo-image__preview {
  display: inline-block;

  .el-image {
    width: 50px;
    height: 50px;
  }
}
.table-box {
  margin-top: 15px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  .detailHead {
    padding: 15px 20px !important;
  }
  .tablelHead {
    padding: 0 20px 15px;
  }
  .full {
    img {
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }
  }
  .title.line1 {
    width: 600px;
  }
}
.table-text {
  .title {
    margin-bottom: 0 !important;
    font-size: 13px !important;
  }
}
.text-title {
  font-size: 12px;
  color: red;
}
.iconChange {
  font-size: 16px !important;
  color: #999 !important;
  cursor: pointer;
}
</style>
