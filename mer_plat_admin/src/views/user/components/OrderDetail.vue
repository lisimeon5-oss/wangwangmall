<template>
  <div>
    <el-drawer :visible.sync="dialogVisible" :direction="direction" size="1000px" :before-close="handleClose">
      <div v-if="orderDatalist" v-loading="loading">
        <div class="detailHead">
          <div class="full">
            <div class="order_icon"><span class="iconfont icon-dingdan"></span></div>
            <div class="text">
              <div class="title">{{ $t('user.purchaseRecord') }}</div>
              <div>
                <span class="mr20">{{ $t('order.orderNoColon') }}{{ orderDatalist.orderNo }}</span>
              </div>
            </div>
          </div>
          <ul class="list">
            <li class="item">
              <div class="title">{{ $t('order.orderStatus') }}</div>
              <div>
                <span>{{ orderDatalist.paid ? $t('order.paid') : $t('order.unpaid') }}</span>
              </div>
            </li>
            <li class="item">
              <div class="title">{{ $t('order.payPrice') }}</div>
              <div class="color-warning">฿ {{ orderDatalist.price || '0.0' }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('order.payType') }}</div>
              <div>{{ orderDatalist.payType | filterCardPayType }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('user.payTimeCol') }}</div>
              <div>{{ orderDatalist.payTime | filterEmpty }}</div>
            </li>
          </ul>
        </div>
        <div class="detailSection">
          <div class="title">{{ $t('order.userInfo') }}</div>
          <ul class="list">
            <li class="item">
              <div class="lang">{{ $t('order.userNickname') }}</div>
              <div class="value">{{ orderDatalist.userNickname }} | {{ orderDatalist.uid }}</div>
            </li>
            <li class="item">
              <div class="lang">{{ $t('user.phoneLabel') }}</div>
              <div class="value">{{ orderDatalist.userPhone }}</div>
            </li>
          </ul>
        </div>
        <div class="detailSection">
          <div class="title">{{ $t('user.cardInfoTitle') }}</div>
          <ul class="list">
            <li class="item">
              <div class="lang">{{ $t('user.cardNameLabel') }}</div>
              <div class="value">{{ orderDatalist.cardName }}</div>
            </li>
            <li class="item">
              <div class="lang">{{ $t('user.cardTypeLabel') }}</div>
              <div class="value">{{ orderDatalist.type | filterCardType }}</div>
            </li>
            <li class="item">
              <div class="lang">{{ $t('user.cardTermLabel') }}</div>
              <div class="value">{{ orderDatalist.type === 2 ? $t('user.permanent') : orderDatalist.deadlineDay + $t('user.day') }}</div>
            </li>
            <li class="item">
              <div class="lang">{{ $t('user.expireTimeLabel') }}</div>
              <div class="value">{{ orderDatalist.cardExpirationTime }}</div>
            </li>
            <li class="item">
              <div class="lang">{{ $t('user.giftBalanceLabel') }}</div>
              <div class="value">{{ orderDatalist.giftBalance || '0.0' }}</div>
            </li>
            <li class="item">
              <div class="lang">{{ $t('order.createTimeColon') }}</div>
              <div class="value">{{ orderDatalist.createTime }}</div>
            </li>
          </ul>
        </div>
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
import {
  getLogisticsInfoApi,
  orderInvoiceListApi,
  orderDetailApi,
  getOrderInvoiceList,
  refundOrderDetailApi,
} from '@/api/order';
import { memberOrderInfoApi } from '@/api/user';
import { filterCardType } from '@/filters';

export default {
  name: 'OrderDetail',
  data() {
    return {
      direction: 'rtl',
      dialogVisible: false,
      orderDatalist: {},
      loading: false,
    };
  },
  watch: {},
  mounted() {},
  methods: {
    filterCardType,
    handleClose() {
      this.dialogVisible = false;
    },
    // 订单信息
    getDetail(id) {
      this.loading = true;
      memberOrderInfoApi(id)
        .then((res) => {
          this.orderDatalist = res;
          this.loading = false;
        })
        .catch(() => {
          this.orderDatalist = null;
          this.loading = false;
        });
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

.wrapper {
  background-color: #fff;
  margin-top: 7px;
  padding: 10px 12px;
  &-num {
    font-size: 10px;
    color: #999999;
  }

  &-title {
    color: #666666;
    font-size: 12px;
  }

  &-img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
    border-radius: 7px;
    overflow: hidden;
    margin-bottom: 10px;

    image {
      width: 100%;
      height: 100%;
    }

    &:nth-child(5n) {
      margin-right: 0;
    }
  }
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

.logistics {
  align-items: center;
  padding: 10px 0px;
  .logistics_img {
    width: 45px;
    height: 45px;
    margin-right: 12px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .logistics_cent {
    span {
      display: block;
      font-size: 12px;
    }
  }
}

.trees-coadd {
  width: 100%;
  height: 400px;
  border-radius: 4px;
  overflow: hidden;
  .scollhide {
    width: 100%;
    height: 100%;
    overflow: auto;
    margin-left: 18px;
    padding: 10px 0 10px 0;
    box-sizing: border-box;
    .content {
      font-size: 12px;
    }

    .time {
      font-size: 12px;
      color: #2d8cf0;
    }
  }
}

.description {
  &-term {
    display: table-cell;
    padding-bottom: 5px;
    line-height: 20px;
    width: 50%;
    font-size: 12px;
    color: #606266;
  }
  ::v-deep .el-divider--horizontal {
    margin: 12px 0 !important;
  }
}
</style>
