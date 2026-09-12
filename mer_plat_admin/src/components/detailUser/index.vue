<template>
  <div>
    <el-drawer ref="userDetailFrom" :visible.sync="dialogUserDetail" size="1100px" @close="handleClose">
      <div slot="title" class="demo-drawer_title">
        <div class="con-head">
          <img :src="userDetailData.avatar" alt="" />
          <span class="nickname">{{ userDetailData.nickname }}</span>
        </div>
        <div class="acea-row info-row">
          <div class="info-row-item">
            <div class="info-row-item-title">{{ $t('user.balance') }}</div>
            <div>{{ userDetailData.nowMoney }}</div>
          </div>
          <div class="info-row-item">
            <div class="info-row-item-title">{{ $t('user.integral') }}</div>
            <div>{{ userDetailData.integral }}</div>
          </div>
          <div class="info-row-item">
            <div class="info-row-item-title">{{ $t('user.experience') }}</div>
            <div>{{ userDetailData.experience }}</div>
          </div>
          <div class="info-row-item">
            <div class="info-row-item-title">{{ $t('user.grade') }}</div>
            <div>{{ userDetailData.grade }}</div>
          </div>
          <div class="info-row-item">
            <div class="info-row-item-title">{{ $t('finance.commission') }}</div>
            <div>{{ userDetailData.brokeragePrice }}</div>
          </div>
          <div class="info-row-item">
            <div class="info-row-item-title">{{ $t('user.payCount') }}</div>
            <div>{{ userDetailData.payCount }}</div>
          </div>
          <div class="info-row-item">
            <div class="info-row-item-title">{{ $t('user.continuousSign') }}</div>
            <div>{{ userDetailData.signNum }}</div>
          </div>
        </div>
      </div>
      <div class="demo-drawer__content">
        <div class="description" v-if="userDetailData">
          <!-- Tabs -->
          <el-tabs type="border-card" v-model="tabsVal">
            <!-- 用户信息 -->
            <el-tab-pane name="1" :label="$t('user.userInfoTab')">
              <div class="user-info">
                <div class="section">
                  <div class="section-hd">{{ $t('product.basicInfo') }}</div>
                  <div class="section-bd">
                    <div class="item">
                      <div>{{ $t('user.userIdLabel') }}</div>
                      <div class="value">{{ userDetailData.id }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.realNameLabel') }}</div>
                      <div class="value">{{ userDetailData.realName || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.userAccountLabel') }}</div>
                      <div class="value">{{ userDetailData.account || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.userPhoneLabel') }}</div>
                      <div class="value">{{ userDetailData.phone }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.birthdayColon') }}</div>
                      <div class="value">{{ userDetailData.birthday || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.genderColon') }}</div>
                      <div class="value">{{ genderText(userDetailData.sex) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.countryLabel') }}</div>
                      <div class="value">{{ countryText(userDetailData.country) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.userAddress') }}</div>
                      <div class="value">
                        {{
                          userDetailData.province +
                            userDetailData.city +
                            userDetailData.district +
                            userDetailData.address || '-'
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="user-info">
                <div class="section">
                  <div class="section-hd">{{ $t('user.paidMemberInfo') }}</div>
                  <div class="section-bd">
                    <div class="item">
                      <div>{{ $t('user.paidMemberColon') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isPaidMember) }}</div>
                    </div>
                    <div v-show="userDetailData.isPaidMember" class="item">
                      <div>{{ $t('user.memberExpireTime') }}</div>
                      <div class="value">
                        {{
                          userDetailData.isPermanentPaidMember
                            ? $t('user.permanentMember')
                            : userDetailData.paidMemberExpirationTime
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="user-info">
                <div class="section">
                  <div class="section-hd-other">{{ $t('user.userOverview') }}</div>
                  <div class="section-bd">
                    <div class="item">
                      <div>{{ $t('user.createIp') }}</div>
                      <div class="value">{{ userDetailData.addIp || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.registerTypeLabel') }}</div>
                      <div class="value">{{ registerTypeText(userDetailData.registerType) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.addTimeColon') }}</div>
                      <div class="value">{{ userDetailData.createTime || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.statusColon') }}</div>
                      <div class="value">{{ userDetailData.status == true ? $t('user.normalStatus') : $t('user.forbidden') }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.tagLabel') }}</div>
                      <div class="value">{{ userDetailData.tagId || '-' | tagFilter }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.bindIos') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isBindingIos) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.isLogoffLabel') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isLogoff) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.bindWechatAndroid') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isWechatAndroid) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.bindWechatIos') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isWechatIos) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.bindOfficialAccount') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isWechatPublic) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.bindMiniProgram') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isWechatRoutine) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.lastLoginIp') }}</div>
                      <div class="value">{{ userDetailData.lastIp || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.lastLoginTime') }}</div>
                      <div class="value">{{ userDetailData.lastLoginTime || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.logoffTime') }}</div>
                      <div class="value">{{ userDetailData.logoffTime || '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="user-info">
                <div class="section">
                  <div class="section-hd">{{ $t('user.spreadInfo') }}</div>
                  <div class="section-bd">
                    <div class="item">
                      <div>{{ $t('user.isPromoterLabel') }}</div>
                      <div class="value">{{ yesNo(userDetailData.isPromoter) }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.subordinateCount') }}</div>
                      <div class="value">{{ userDetailData.spreadCount || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.becomePromoterTime') }}</div>
                      <div class="value">{{ userDetailData.promoterTime || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.parentPromoterNickname') }}</div>
                      <div class="value">{{ userDetailData.spreadName || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.parentPromoterId') }}</div>
                      <div class="value">{{ userDetailData.spreadUid || '-' }}</div>
                    </div>
                    <div class="item">
                      <div>{{ $t('user.bindParentTime') }}</div>
                      <div class="value">{{ userDetailData.spreadTime || '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="user-info">
                <div class="section">
                  <div class="section-hd">{{ $t('order.userRemark') }}</div>
                  <div class="section-bd">
                    <div class="item">
                      <div>{{ $t('user.remarkLabel') }}</div>
                      <div class="value">{{ userDetailData.mark || '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane name="2" :label="$t('user.balanceChange')">
              <el-table :data="balanceRecordData" size="small" class="mt20">
                <el-table-column prop="linkId" :label="$t('user.relatedOrderNo')" min-width="100">
                  <template slot-scope="scope">
                    {{ scope.row.linkId == '0' ? '-' : scope.row.linkId }}
                  </template>
                </el-table-column>
                <el-table-column prop="type" :label="$t('user.recordType')">
                  <template slot-scope="scope">
                    {{ scope.row.type == 1 ? $t('user.add') : $t('user.deduct') }}
                  </template>
                </el-table-column>
                <el-table-column prop="amount" :label="$t('user.amount')" />
                <el-table-column prop="remark" :label="$t('common.remark')" />
                <el-table-column prop="createTime" :label="$t('marketing.addTime')" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane name="3" :label="$t('user.commissionRecord')">
              <el-table :data="brokerageRecordData" size="small" class="mt20">
                <el-table-column prop="linkNo" :label="$t('user.relatedOrderNo')" min-width="100">
                  <template slot-scope="scope">
                    {{ scope.row.linkNo == '0' ? '-' : scope.row.linkNo }}
                  </template>
                </el-table-column>
                <el-table-column prop="title" :label="$t('user.recordTitle')" />
                <el-table-column prop="price" :label="$t('user.amount')">
                  <template slot-scope="scope"> {{ scope.row.type == 1 ? '+' : '-' }}{{ scope.row.price }} </template>
                </el-table-column>
                <el-table-column prop="status" :label="$t('common.status')">
                  <template slot-scope="scope">{{ brokerageStatusText(scope.row.status) }}</template>
                </el-table-column>
                <el-table-column prop="mark" :label="$t('common.remark')" />
                <el-table-column prop="createTime" :label="$t('marketing.addTime')" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane name="5" :label="$t('user.pointsDetail')">
              <el-table :data="integralRecordData" size="small" class="mt20">
                <el-table-column prop="linkId" :label="$t('user.relatedOrderNo')" min-width="100">
                  <template slot-scope="scope">
                    {{ scope.row.linkId == '0' ? '-' : scope.row.linkId }}
                  </template>
                </el-table-column>
                <el-table-column prop="title" :label="$t('user.recordTitle')" min-width="120" />
                <el-table-column prop="integral" :label="$t('user.integral')">
                  <template slot-scope="scope">
                    {{ scope.row.type == 1 ? '+' : '-' }}{{ scope.row.integral }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" :label="$t('common.status')">
                  <template slot-scope="scope">{{ integralStatusText(scope.row.status) }}</template>
                </el-table-column>
                <el-table-column prop="mark" :label="$t('common.remark')" />
                <el-table-column prop="createTime" :label="$t('marketing.addTime')" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane name="4" :label="$t('user.experienceRecord')">
              <el-table :data="experienceRecordData" size="small" class="mt20">
                <el-table-column prop="type" :label="$t('user.recordType')">
                  <template slot-scope="scope">
                    {{ scope.row.type == 1 ? $t('user.add') : $t('user.deduct') }}
                  </template>
                </el-table-column>
                <el-table-column prop="experience" :label="$t('user.experience')" />
                <el-table-column prop="mark" :label="$t('common.remark')" />
                <el-table-column prop="createTime" :label="$t('marketing.addTime')" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane name="6" :label="$t('user.signRecord')">
              <el-table :data="signRecordData" size="small" class="mt20">
                <el-table-column prop="date" :label="$t('user.signTime')" />
                <el-table-column prop="day" :label="$t('marketing.continuousSignDays')" />
                <el-table-column prop="mark" :label="$t('common.remark')" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
          <div class="block" v-if="tabsVal != '1'">
            <el-pagination
              :page-size="paginationData.limit"
              :total="paginationData.total"
              :current-page="paginationData.page"
              @size-change="handleSizeChange"
              @current-change="pageChange"
              background
              :page-sizes="[10, 20, 30, 40]"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
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
  userDetailApi,
  userBalanceRecord,
  userBrokerageRecord,
  userExperienceRecord,
  userIntegralRecord,
  userSignRecord,
} from '@/api/user';
import { registerTypeFilter } from '@/filters/user';

export default {
  name: 'detailUser',
  props: {
    userNo: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      dialogUserDetail: false,
      userDetailData: {},
      tabsVal: '1',
      balanceRecordData: [],
      brokerageRecordData: [],
      experienceRecordData: [],
      integralRecordData: [],
      signRecordData: [],
      paginationData: {
        page: 1,
        limit: 10,
        total: 0,
      },
    };
  },
  watch: {
    tabsVal(val) {
      this.paginationData.page = 1;
      this.getList(val);
    },
  },
  methods: {
    yesNo(val) {
      return val ? this.$t('common.yes') : this.$t('common.no');
    },
    genderText(sex) {
      const map = {
        0: this.$t('user.unknown'),
        1: this.$t('user.male'),
        2: this.$t('user.female'),
        3: this.$t('user.secret'),
      };
      return map[sex] || this.$t('user.unknown');
    },
    countryText(country) {
      if (!country) return '-';
      return country === 'CN' ? this.$t('user.china') : this.$t('user.otherCountry');
    },
    registerTypeText(type) {
      return registerTypeFilter(type) || '-';
    },
    brokerageStatusText(status) {
      const map = {
        1: this.$t('common.orderCreated'),
        2: this.$t('common.frozenPeriod'),
        3: this.$t('common.finish'),
        4: this.$t('common.expired'),
      };
      return map[status] || this.$t('user.withdrawApply');
    },
    integralStatusText(status) {
      const map = {
        1: this.$t('common.orderCreated'),
        2: this.$t('common.frozenPeriod'),
        3: this.$t('common.finish'),
      };
      return map[status] || this.$t('common.expired');
    },
    getList(val) {
      switch (val) {
        case '2':
          this.getBalabceRecord();
          break;
        case '3':
          this.getBrokerageRecord();
          break;
        case '4':
          this.getExperienceRecord();
          break;
        case '5':
          this.getIntegralRecord();
          break;
        case '6':
          this.getSignRecord();
          break;
      }
    },
    //获取签到记录列表
    getSignRecord() {
      userSignRecord({
        userId: this.userDetailData.id,
        page: this.paginationData.page,
        limit: this.paginationData.limit,
      }).then((res) => {
        this.signRecordData = res.list;
        this.paginationData.total = res.total;
      });
    },
    //获取积分记录列表
    getIntegralRecord() {
      userIntegralRecord({
        userId: this.userDetailData.id,
        page: this.paginationData.page,
        limit: this.paginationData.limit,
      }).then((res) => {
        this.integralRecordData = res.list;
        this.paginationData.total = res.total;
      });
    },
    //获取经验记录列表
    getExperienceRecord() {
      userExperienceRecord({
        userId: this.userDetailData.id,
        page: this.paginationData.page,
        limit: this.paginationData.limit,
      }).then((res) => {
        this.experienceRecordData = res.list;
        this.paginationData.total = res.total;
      });
    },
    //获取佣金记录列表
    getBrokerageRecord() {
      userBrokerageRecord({
        userId: this.userDetailData.id,
        page: this.paginationData.page,
        limit: this.paginationData.limit,
      }).then((res) => {
        this.brokerageRecordData = res.list;
        this.paginationData.total = res.total;
      });
    },
    //获取余额记录列表
    getBalabceRecord() {
      userBalanceRecord({
        userId: this.userDetailData.id,
        page: this.paginationData.page,
        limit: this.paginationData.limit,
      }).then((res) => {
        this.balanceRecordData = res.list;
        this.paginationData.total = res.total;
      });
    },
    handleSizeChange(val) {
      this.paginationData.limit = val;
      this.getList(this.tabsVal);
    },
    pageChange(val) {
      this.paginationData.page = val;
      this.getList(this.tabsVal);
    },
    handleClose() {
      this.dialogUserDetail = false;
      this.tabsVal = '1';
    },
    getUserDetail(id) {
      userDetailApi(id).then((res) => {
        this.userDetailData = res;
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-drawer__header {
  display: flex !important;
  align-items: flex-start !important;
  margin: 0 !important;
  padding: 15px 15px 0 15px !important;
}
::v-deep .demo-drawer_title {
  width: 90%;
}
::v-deep .el-drawer__body{
  padding: 0 0 30px 0 !important;
}
.InvoiceList {
  ::v-deep.el-collapse-item__header {
    font-size: 12px;
    color: #606266;
  }
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

.title {
  font-size: 36px;
}

.demo-drawer__content {
  // padding: 0 30px;
  overflow: hidden;
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
    font-size: 12px;
    color: #606266;
  }
  ::v-deep .el-divider--horizontal {
    margin: 12px 0 !important;
  }
}
.description-term img {
  width: 60px;
  height: 60px;
}
.description-term {
  display: flex;
  align-items: center;
}
.con-head {
  padding: 0 30px;
  display: flex;
  align-items: center;
  img {
    width: 60px;
    height: 60px;
    margin-right: 15px;
    border-radius: 50%;
  }
  .nickname {
    font-weight: 500;
    font-size: 16px;
    line-height: 16px;
    color: rgba(0, 0, 0, 0.85);
  }
}

.info-row {
  flex-wrap: nowrap;
  padding: 20px 35px 24px 30px;
  border-bottom: 1px dashed #eee;

  &-item {
    flex: none;
    width: 155px;
    font-size: 14px;
    line-height: 14px;
    color: rgba(0, 0, 0, 0.85);

    &-title {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 13px;
      color: #666666;
    }
  }
}
.user-info {
  .section {
    padding: 25px 0;

    &-hd {
      padding-left: 10px;
      border-left: 3px solid var(--prev-color-primary);
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      color: #303133;
    }

    &-bd {
      display: flex;
      flex-wrap: wrap;
    }

    .item {
      width: 30%;
      // flex: 0 0 calc(~"(100% - 60px) / 3");
      display: flex;
      margin: 16px 30px 0 0;
      font-size: 13px;
      color: #606266;

      &:nth-child(3n + 3) {
        margin: 16px 0 0;
      }
    }

    .value {
      flex: 1;
    }
    .avatar {
      width: 60px;
      height: 60px;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.section-hd-other {
  padding-left: 10px;
  border-left: 3px solid var(--prev-color-primary);
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: #303133;
}
::v-deep .el-tabs__content {
  padding: 0 30px !important;
}
</style>
