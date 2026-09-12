<template>
  <div>
    <el-drawer :visible.sync="drawerVisible" :direction="direction" size="1000px" :before-close="handleClose">
      <div v-loading="loading">
        <div class="detailHead">
          <div class="acea-row row-between headerBox">
            <div class="full">
              <div class="order_icon"><span class="iconfont icon-shouhou_tuikuan-2"></span></div>
              <div class="text">
                <div class="title">{{ $t('order.refundOrder') }}</div>
                <div>
                  <span class="mr20">{{ $t('order.refundOrderNoLabel') }}{{ refundInfo.refundOrderNo }}</span>
                </div>
              </div>
            </div>
            <!-- 审核 -->
            <div class="acea-row row-center-wrapper">
              <el-button size="small" @click.native="onOrderMark()" v-hasPermi="['platform:refund:order:mark']"
                >{{ $t('order.orderRemark') }}</el-button
              >
              <el-button
                v-if="
                  checkPermi(['platform:refund:order:compulsory:refund']) &&
                  (refundInfo.refundStatus === 0 || refundInfo.refundStatus === 5)
                "
                type="primary"
                size="small"
                v-debounceClick="
                  () => {
                    handlerCompulsoryReturn(refundInfo);
                  }
                "
                >{{ $t('order.compulsoryRefund') }}</el-button
              >
            </div>
          </div>

          <ul class="list">
            <li class="item">
              <div class="title">{{ $t('order.refundStatus') }}</div>
              <div class="color-warning">{{ refundInfo.refundStatus | refundStatusFilter }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('order.refundPrice') }}</div>
              <div>฿ {{ refundInfo.refundPrice || '0.0' }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('order.payAmount') }}</div>
              <div>{{ refundInfo.payPrice }}</div>
            </li>
            <li class="item">
              <div class="title">{{ $t('order.createTime') }}</div>
              <div>{{ refundInfo.orderInfoVo ? refundInfo.orderInfoVo.createTime : '' }}</div>
            </li>
          </ul>
        </div>
        <el-tabs type="border-card" v-model="activeName">
          <el-tab-pane :label="$t('order.afterSalesInfo')" name="refund">
            <div class="detailSection" style="border: none">
              <div class="title">{{ $t('order.refundProduct') }}</div>
              <ul class="list">
                <li class="item row-middle">
                  <div class="image mr10">
                    <el-image
                      :src="refundInfo.image"
                      :preview-src-list="[refundInfo.image]"
                      style="width: 40px; height: 40px"
                    ></el-image>
                  </div>
                  <div>
                    <div class="text666 mb10 productName line-height-15">{{ refundInfo.productName }}</div>
                    <div class="text999">
                      <span>{{ refundInfo.sku }}</span
                      ><span class="ml30">{{ $t('order.sellingPrice') }}฿{{ refundInfo.price }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('order.refundDetail') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">{{ $t('order.refundQuantity') }}</div>
                  <div class="value">{{ refundInfo.applyRefundNum }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.purchaseQuantity') }}</div>
                  <div class="value">{{ refundInfo.payNum }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.expectedRefundMethod') }}</div>
                  <div class="value">{{ $t('order.originalPaymentReturn') }}</div>
                </li>
                <li v-show="refundInfo.refundStatus === 2 || refundInfo.refundStatus === 3" class="item">
                  <div class="lang">{{ $t('order.returnFreight') }}</div>
                  <div class="value">{{ refundInfo.refundFreightFee }}</div>
                </li>
                <li v-show="refundInfo.refundStatus === 2 || refundInfo.refundStatus === 3" class="item">
                  <div class="lang">{{ $t('order.refundFirstBrokerage') }}</div>
                  <div class="value">{{ refundInfo.refundFirstBrokerageFee }}</div>
                </li>
                <li v-show="refundInfo.refundStatus === 2 || refundInfo.refundStatus === 3" class="item">
                  <div class="lang">{{ $t('order.refundUseIntegral') }}</div>
                  <div class="value">{{ refundInfo.refundUseIntegral }}</div>
                </li>
                <li v-show="refundInfo.refundStatus === 2 || refundInfo.refundStatus === 3" class="item">
                  <div class="lang">{{ $t('order.refundGainIntegral') }}</div>
                  <div class="value">{{ refundInfo.refundGainIntegral }}</div>
                </li>
                <li v-show="refundInfo.refundStatus === 2 || refundInfo.refundStatus === 3" class="item">
                  <div class="lang">{{ $t('order.refundSecondBrokerage') }}</div>
                  <div class="value">{{ refundInfo.refundSecondBrokerageFee }}</div>
                </li>
              </ul>
            </div>
            <!-- 退款流程信息-->
            <div class="detailSection">
              <div class="title">{{ $t('order.refundFlowInfo') }}</div>
              <div class="detail-centent acea-row">
                <div>
                  <!--  操作类型：apply-申请退款，audit-商家审核，returning-商品退回，receiving-商家确认收货，refund-退款，compulsory-平台强制退款,revoke-撤销-->
                  <el-steps
                    direction="vertical"
                    :active="
                      refundInfo.promoterType === 'merchant' ? 2 : refundInfo.statusList && refundInfo.statusList.length
                    "
                    finish-status="success"
                  >
                    <el-step :title="$t('order.directRefundMerchant')" v-if="refundInfo.promoterType === 'merchant'">
                      <template slot="description">
                        <div class="mb10">
                          {{ refundInfo.refundTime }}
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.applyRefundUser')"
                      v-if="
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'apply')
                      "
                    >
                      <template slot="description">
                        <div class="mb10">
                          {{ refundInfo.statusList.filter((item) => item.changeType === 'apply')[0].createTime }}
                        </div>
                        <div class="refundReasonWap">
                          <div class="acea-row">
                            <div class="detail-term" style="width: 58%">
                              <span class="detail-infoTitle">{{ $t('order.refundReason') }}</span
                              ><span class="detail-info">{{ refundInfo.refundReasonWap }}</span>
                            </div>
                            <div class="detail-term">
                              <span class="detail-infoTitle">{{ $t('order.returnMethod') }}</span
                              ><span class="detail-info">{{
                                refundInfo.returnGoodsType === 1
                                  ? $t('order.expressReturn')
                                  : refundInfo.returnGoodsType === 2
                                  ? $t('order.storeReturn')
                                  : $t('order.noReturn')
                              }}</span>
                            </div>
                          </div>
                          <div class="detail-term acea-row">
                            <span class="detail-infoTitle">{{ $t('order.remarkNote') }}</span>
                            <div class="detail-info" style="width: 600px">
                              {{ refundInfo.refundReasonWapExplain | filterEmpty }}
                            </div>
                          </div>
                          <div class="detail-term">
                            <div class="acea-row">
                              <span class="detail-infoTitle">{{ $t('order.refundVoucher') }}</span>

                              <div v-if="refundInfo.refundReasonWapImg">
                                <el-image
                                  v-for="(item, index) in refundInfo.refundReasonWapImg.split(',')"
                                  :key="index"
                                  style="width: 60px; height: 60px"
                                  :src="item"
                                  class="mr10"
                                  :preview-src-list="refundInfo.refundReasonWapImg.split(',')"
                                ></el-image>
                              </div>
                              <div v-else>-</div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.merchantAudit')"
                      v-if="
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'audit')
                      "
                    >
                      <template slot="description" v-if="refundInfo.statusList && refundInfo.statusList.length">
                        <div class="mb10">
                          {{
                            refundInfo.statusList.filter((item) => item.changeType === 'audit').length
                              ? refundInfo.statusList.filter((item) => item.changeType === 'audit')[0].createTime
                              : ''
                          }}
                        </div>
                        <div v-if="refundInfo.refundStatus > 0" class="refundReasonWap">
                          <div class="detail-term">
                            <span class="detail-infoTitle">{{ $t('order.auditResult') }}</span
                            ><span class="detail-info">{{
                              refundInfo.refundStatus === 1 && refundInfo.statusList.length === 2
                                ? $t('order.rejectRefund')
                                : $t('order.agreeRefund')
                            }}</span>
                          </div>
                          <div
                            v-if="refundInfo.refundStatus === 1 && refundInfo.statusList.length === 2"
                            class="detail-term"
                          >
                            <span class="detail-infoTitle">{{ $t('order.rejectReason') }}</span>
                            <span class="detail-info">{{ refundInfo.refundReason | filterEmpty }}</span>
                          </div>
                          <div
                            v-if="refundInfo.returnGoodsType === 1 && refundInfo.refundStatus !== 1"
                            class="detail-term"
                          >
                            <div>
                              <span class="detail-infoTitle">{{ $t('order.returnAddress') }}</span>
                              <span class="detail-info">{{ refundInfo.receiverAddressDetail }}</span>
                            </div>
                            <div>
                              <span class="detail-infoTitle"></span>
                              <span class="detail-info">{{ refundInfo.receiver }} {{ refundInfo.receiverPhone }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.goodsReturnInfo')"
                      v-if="
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'returning')
                      "
                    >
                      <template slot="description" v-if="refundInfo.statusList && refundInfo.statusList.length">
                        <div class="mb10">
                          {{ refundInfo.statusList.filter((item) => item.changeType === 'returning')[0].createTime }}
                        </div>
                        <div v-if="refundInfo.returnGoodsType === 1" class="refundReasonWap">
                          <div class="acea-row">
                            <div class="detail-term" style="width: 58%">
                              <span class="detail-infoTitle">{{ $t('order.logisticsCompany') }}</span
                              ><span class="detail-info">{{ refundInfo.expressName }}</span>
                            </div>
                            <div class="detail-term">
                              <span class="detail-infoTitle">{{ $t('order.logisticsNo') }}</span>
                              <span class="detail-info">{{ refundInfo.trackingNumber }}</span>
                            </div>
                          </div>
                          <div class="detail-term">
                            <div>
                              <span class="detail-infoTitle">{{ $t('order.contactPhone') }}</span>
                              <span class="detail-info">{{ refundInfo.telephone }}</span>
                            </div>
                          </div>
                        </div>
                        <div v-if="refundInfo.returnGoodsType === 2" class="refundReasonWap">
                          <div class="detail-term">
                            <div>
                              <span class="detail-infoTitle">{{ $t('order.contactPhone') }}</span>
                              <span class="detail-info">{{ refundInfo.telephone }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.merchantConfirmReceipt')"
                      v-if="
                        refundInfo.refundStatus !== 1 &&
                        refundInfo.refundStatus !== 6 &&
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'receiving')
                      "
                    >
                      <template slot="description" v-if="refundInfo.statusList && refundInfo.statusList.length">
                        <div class="mb10">
                          {{
                            refundInfo.statusList.filter((item) => item.changeType === 'receiving').length
                              ? refundInfo.statusList.filter((item) => item.changeType === 'receiving')[0].createTime
                              : ''
                          }}
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.goodsRejectReceipt')"
                      v-if="
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'rejectionGoods')
                      "
                    >
                      <template slot="description" v-if="refundInfo.statusList && refundInfo.statusList.length">
                        <div class="mb10">
                          {{
                            refundInfo.statusList.filter((item) => item.changeType === 'rejectionGoods')[0].createTime
                          }}
                        </div>
                        <div v-if="refundInfo.refundStatus > 0" class="refundReasonWap">
                          <div class="detail-term">
                            <span class="detail-infoTitle">{{ $t('order.auditResult') }}</span
                            ><span class="detail-info">{{
                              refundInfo.refundStatus === 1 ? $t('order.rejectRefund') : $t('order.agreeRefund')
                            }}</span>
                          </div>
                          <div v-if="refundInfo.refundStatus === 1" class="detail-term">
                            <span class="detail-infoTitle">{{ $t('order.rejectReason') }}</span>
                            <span class="detail-info">{{ refundInfo.refundReason | filterEmpty }}</span>
                          </div>
                          <div
                            v-if="refundInfo.returnGoodsType === 1 && refundInfo.refundStatus !== 1"
                            class="detail-term"
                          >
                            <div>
                              <span class="detail-infoTitle">{{ $t('order.returnAddress') }}</span>
                              <span class="detail-info">{{ refundInfo.receiverAddressDetail }}</span>
                            </div>
                            <div>
                              <span class="detail-infoTitle"></span>
                              <span class="detail-info">{{ refundInfo.receiver }} {{ refundInfo.receiverPhone }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.revoked')"
                      v-if="
                        refundInfo.refundStatus === 6 &&
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'revoke')
                      "
                    >
                      <template slot="description" v-if="refundInfo.statusList && refundInfo.statusList.length">
                        <div class="mb10">
                          {{
                            refundInfo.statusList.filter((item) => item.changeType === 'revoke').length
                              ? refundInfo.statusList.filter((item) => item.changeType === 'revoke')[0].createTime
                              : ''
                          }}
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.platformCompulsoryRefundSuccess')"
                      v-if="
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'compulsory')
                      "
                    >
                      <template slot="description" v-if="refundInfo.statusList && refundInfo.statusList.length">
                        <div class="mb10">
                          {{
                            refundInfo.statusList.filter((item) => item.changeType === 'compulsory').length
                              ? refundInfo.statusList.filter((item) => item.changeType === 'compulsory')[0].createTime
                              : ''
                          }}
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="refundInfo.promoterType === 'user' ? $t('order.refundSuccess') : $t('order.refundSuccessMerchant')"
                      v-if="
                        refundInfo.refundStatus !== 1 &&
                        refundInfo.refundStatus !== 6 &&
                        refundInfo.statusList &&
                        refundInfo.statusList.length &&
                        refundInfo.statusList.find((item) => item.changeType === 'refund')
                      "
                    >
                      <template slot="description" v-if="refundInfo.statusList && refundInfo.statusList.length">
                        <div class="mb10">
                          {{
                            refundInfo.statusList.filter((item) => item.changeType === 'refund').length
                              ? refundInfo.statusList.filter((item) => item.changeType === 'refund')[0].createTime
                              : ''
                          }}
                        </div>
                      </template>
                    </el-step>
                    <el-step
                      :title="$t('order.merchantAudit')"
                      v-if="
                        refundInfo.refundStatus !== 1 &&
                        refundInfo.refundStatus !== 2 &&
                        refundInfo.refundStatus !== 6 &&
                        refundInfo.refundStatus === 0
                      "
                    >
                    </el-step>
                    <el-step
                      :title="$t('order.goodsReturnInfo')"
                      v-if="
                        refundInfo.refundStatus !== 1 &&
                        refundInfo.refundStatus !== 2 &&
                        refundInfo.refundStatus !== 6 &&
                        refundInfo.afterSalesType === 2 &&
                        (refundInfo.refundStatus === 0 || refundInfo.refundStatus === 4)
                      "
                    >
                    </el-step>
                    <el-step
                      :title="$t('order.merchantConfirmReceipt')"
                      v-if="
                        refundInfo.refundStatus !== 1 &&
                        refundInfo.refundStatus !== 2 &&
                        refundInfo.refundStatus !== 6 &&
                        refundInfo.afterSalesType === 2 &&
                        (refundInfo.refundStatus === 0 ||
                          refundInfo.refundStatus === 4 ||
                          refundInfo.refundStatus === 5)
                      "
                    >
                    </el-step>
                    <el-step
                      :title="refundInfo.promoterType === 'user' ? $t('order.refundSuccess') : $t('order.refundSuccessMerchant')"
                      v-if="
                        refundInfo.refundStatus !== 1 &&
                        refundInfo.refundStatus !== 6 &&
                        (refundInfo.refundStatus === 0 ||
                          refundInfo.refundStatus === 2 ||
                          refundInfo.refundStatus === 4 ||
                          refundInfo.refundStatus === 5)
                      "
                    >
                    </el-step>
                  </el-steps>
                </div>
              </div>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('order.platformRemark') }}</div>
              <ul class="list">
                <li class="item">
                  <div>{{ refundInfo.platformRemark | filterEmpty }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('order.merchantRemark') }}</div>
              <ul class="list">
                <li class="item">
                  <div>{{ refundInfo.merRemark | filterEmpty }}</div>
                </li>
              </ul>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('order.orderInfo')" name="detail" v-if="refundInfo.orderInfoVo">
            <div class="detailSection">
              <div class="title">{{ $t('order.userInfo') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">{{ $t('order.userNickname') }}</div>
                  <div class="value">
                    <span class="mr5">{{ refundInfo.orderInfoVo.nickname }}</span>
                    <span class="mr5"> | </span>
                    <span>{{ refundInfo.orderInfoVo.uid }}</span>
                  </div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.userPhone') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.phone }}</div>
                </li>
              </ul>
            </div>
            <div v-show="refundInfo.orderInfoVo.secondType < 2" class="detailSection">
              <div class="title">{{ $t('order.deliveryInfo') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">{{ $t('order.deliveryMethod') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.shippingType === 1 ? $t('order.merchantDelivery') : $t('order.storePickup') }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.receiverPhone') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.userPhone | filterEmpty }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.receiver') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.realName | filterEmpty }}</div>
                </li>
              </ul>
              <div class="userAddress acea-row">
                <div class="lang">{{ $t('order.receiverAddress') }}</div>
                <div class="value">{{ refundInfo.orderInfoVo.userAddress | filterEmpty }}</div>
              </div>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('order.orderInfo') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">{{ $t('order.orderNoColon') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.orderNo }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.productTotal') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.totalNum }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.payStatus') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.paid ? $t('order.paid') : $t('order.unpaid') }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.payTypeColon') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.payType | payTypeFilter }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.orderStatusColon') }}</div>
                  <div class="value textE93323">
                    <span v-if="refundInfo.orderInfoVo.refundStatus === 3">{{ $t('order.refunded') }}</span>
                    <span v-else>{{ refundInfo.orderInfoVo.status | orderStatusFilter }}</span>
                  </div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.shippedQuantity') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.deliveryNum }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.createTimeColon') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.createTime }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.payTime') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.payTime }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('order.orderDetail') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="lang">{{ $t('order.productTotalPrice') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.proTotalPrice }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.platformDiscount') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.platCouponPrice }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.giftIntegral') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.gainIntegral }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.actualPayColon') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.payPrice }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.deductIntegral') }}</div>
                  <div class="value">{{ refundInfo.orderInfoVo.useIntegral }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.merchantDiscount') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.merCouponPrice }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.memberDeduct') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.svipDiscountPrice || 0 }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.payFreight') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.payPostage }}</div>
                </li>
                <li class="item">
                  <div class="lang">{{ $t('order.integralDeduct') }}</div>
                  <div class="value">฿{{ refundInfo.orderInfoVo.integralPrice }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('order.userRemark') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="value productName">{{ refundInfo.orderInfoVo.userRemark | filterEmpty }}</div>
                </li>
              </ul>
            </div>
            <div class="detailSection">
              <div class="title">{{ $t('order.merchantRemark') }}</div>
              <ul class="list">
                <li class="item">
                  <div class="value productName">{{ refundInfo.orderInfoVo.merchantRemark | filterEmpty }}</div>
                </li>
              </ul>
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- 售后状态：0:待审核 1:商家拒绝 2：退款中 3:已退款 4:用户退货 5:商家待收货 6:已撤销-->
      </div>
    </el-drawer>
  </div>
</template>
<script setup>
import { orderRefundCompulsoryApi, refundMarkApi, refundOrderDetailApi } from '@/api/order';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { filterEmpty, refundStatusFilter } from '@/filters';
export default {
  name: 'refundOrderDetail',
  props: {
    //退款单号
    refundOrderNo: {
      type: String,
      default: 0,
    },
    //是否显示隐藏
    drawerVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false,
      loadingBtn: false,
      activeName: 'refund',
      direction: 'rtl',
      reverse: true,
      orderDatalist: {},
      loading: false,
      modal2: false,
      result: [],
      resultInfo: {},
      refundInfo: {},
    };
  },
  mounted() {
    this.getRefundOrderDetail(this.refundOrderNo);
  },
  methods: {
    checkPermi,
    handleClose() {
      this.$emit('onClosedrawerVisible');
    },
    // 备注
    onOrderMark() {
      this.$modalPrompt('textarea', this.$t('order.refundOrderRemark'), this.refundInfo.platformRemark).then((V) => {
        refundMarkApi({ remark: V, refundOrderNo: this.refundOrderNo }).then(() => {
          this.$message.success(this.$t('order.operationSuccess'));
        });
      });
    },
    // 获取订单退款信息
    getRefundOrderDetail(id) {
      this.loading = true;
      refundOrderDetailApi(id)
        .then(async (res) => {
          this.refundInfo = res;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handlerCompulsoryReturn(refundInfo) {
      this.$confirm(
        this.$t('order.compulsoryRefundConfirm', { price: refundInfo.refundPrice }),
        this.$t('order.compulsoryRefundTip'),
      ).then(async () => {
        let result = await orderRefundCompulsoryApi(refundInfo.refundOrderNo);
        this.$emit('compulsoryReturnSuccess');
      });
    },
  },
};
</script>
<style scoped lang="scss">
.userAddress {
  width: 100%;
  margin-top: 16px;
  font-size: 13px;
  color: #666;
}

.productName {
  width: 633px;
}

.detail-centent {
  margin-top: 16px;
}

::v-deep .el-step__main {
  margin-bottom: 30px !important;
}

::v-deep .el-step__title {
  font-size: 14px !important;
}

.flow-path {
  margin-bottom: 70px;
}

.refundReasonWap {
  width: 720px;
  height: auto;
  padding: 10px 25px 0 0;
  border-radius: 14px;
  background-color: #f3f8fe;
  overflow: hidden;
}

.image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
}

.refund {
  &-title {
    font-size: 17px;
    color: #333333;
    font-weight: 600;
  }

  &-orderNo {
    font-size: 14px;
    color: #333333;
  }

  &-price {
    margin-right: 100px;
  }
}
</style>
