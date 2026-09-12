<template>
  <div>
    <el-drawer ref="userDetailFrom" :visible.sync="dialogUserDetail" size="1200px" @close="handleClose">
      <div slot="title" class="demo-drawer_title"></div>
      <div class="demo-drawer__content">
        <div class="description" v-if="userDetailData">
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
              <div class="info-row-item-title">{{ $t('user.experience') }}</div>
              <div>{{ userDetailData.experience }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">{{ $t('user.level') }}</div>
              <div>{{ userDetailData.grade }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">{{ $t('user.commissionAmount') }}</div>
              <div>{{ userDetailData.brokeragePrice }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">{{ $t('user.points') }}</div>
              <div>{{ userDetailData.integral }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">{{ $t('user.purchaseCount') }}</div>
              <div>{{ userDetailData.payCount }}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-item-title">{{ $t('user.consecutiveSignDays') }}</div>
              <div>{{ userDetailData.signNum }}</div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd">{{ $t('user.basicInfo') }}</div>
              <div class="section-bd">
                <div class="item">
                  <div>{{ $t('user.userPhoneLabel') }}</div>
                  <div class="value">{{ userDetailData.phone }}</div>
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
                  <div>{{ $t('user.birthdayLabel') }}</div>
                  <div class="value">{{ userDetailData.birthday || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.genderLabel') }}</div>
                  <div class="value">
                    {{
                      userDetailData.sex == 0
                        ? $t('user.unknown')
                        : userDetailData.sex == 1
                        ? $t('user.male')
                        : userDetailData.sex == 2
                        ? $t('user.female')
                        : $t('user.secret')
                    }}
                  </div>
                </div>
                <div class="item">
                  <div>{{ $t('user.countryLabel') }}</div>
                  <div class="value">{{ userDetailData.country == 'CN' ? $t('user.china') : $t('user.other') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.userAddressLabel') }}</div>
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
                  <div>{{ $t('user.paidMemberLabel') }}</div>
                  <div class="value">{{ userDetailData.isPaidMember ? $t('common.yes') : $t('common.no') }}</div>
                </div>
                <div v-show="userDetailData.isPaidMember" class="item">
                  <div>{{ $t('user.memberExpiryLabel') }}</div>
                  <div class="value">
                    {{ userDetailData.isPermanentPaidMember ? $t('user.permanentMember') : userDetailData.paidMemberExpirationTime }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="user-info">
            <div class="section">
              <div class="section-hd-other">{{ $t('user.otherInfo') }}</div>
              <div class="section-bd">
                <div class="item">
                  <div>{{ $t('user.createIpLabel') }}</div>
                  <div class="value">{{ userDetailData.addIp || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.addTimeLabel') }}</div>
                  <div class="value">{{ userDetailData.createTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.boundIosLabel') }}</div>
                  <div class="value">{{ userDetailData.isBindingIos == true ? $t('common.yes') : $t('common.no') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.loggedOffLabel') }}</div>
                  <div class="value">{{ userDetailData.isLogoff == true ? $t('common.yes') : $t('common.no') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.promoterLabel') }}</div>
                  <div class="value">{{ userDetailData.isPromoter == true ? $t('common.yes') : $t('common.no') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.boundWechatAndroidLabel') }}</div>
                  <div class="value">{{ userDetailData.isWechatAndroid == true ? $t('common.yes') : $t('common.no') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.boundWechatIosLabel') }}</div>
                  <div class="value">{{ userDetailData.isWechatIos == true ? $t('common.yes') : $t('common.no') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.boundOfficialAccountLabel') }}</div>
                  <div class="value">{{ userDetailData.isWechatPublic == true ? $t('common.yes') : $t('common.no') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.boundMiniProgramLabel') }}</div>
                  <div class="value">{{ userDetailData.isWechatRoutine == true ? $t('common.yes') : $t('common.no') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.lastLoginIpLabel') }}</div>
                  <div class="value">{{ userDetailData.lastIp || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.lastLoginTimeLabel') }}</div>
                  <div class="value">{{ userDetailData.lastLoginTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.logoffTimeLabel') }}</div>
                  <div class="value">{{ userDetailData.logoffTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.promoterTimeLabel') }}</div>
                  <div class="value">{{ userDetailData.promoterTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.registerTypeLabel') }}</div>
                  <div class="value">
                    {{
                      userDetailData.registerType == 'wechat'
                        ? $t('user.registerWechat')
                        : userDetailData.registerType == 'routine'
                        ? $t('user.registerRoutine')
                        : userDetailData.registerType == 'h5'
                        ? $t('user.registerH5')
                        : userDetailData.registerType == 'iosWx'
                        ? $t('user.registerIosWx')
                        : userDetailData.registerType == 'androidWx'
                        ? $t('user.registerAndroidWx')
                        : userDetailData.registerType == 'ios'
                        ? $t('user.registerIos')
                        : '-'
                    }}
                  </div>
                </div>
                <div class="item">
                  <div>{{ $t('user.subordinateCountLabel') }}</div>
                  <div class="value">{{ userDetailData.spreadCount || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.parentPromoterNicknameLabel') }}</div>
                  <div class="value">{{ userDetailData.spreadName || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.bindParentPromoterTimeLabel') }}</div>
                  <div class="value">{{ userDetailData.spreadTime || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.parentPromoterIdLabel') }}</div>
                  <div class="value">{{ userDetailData.spreadUid || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.statusLabel') }}</div>
                  <div class="value">{{ userDetailData.status == true ? $t('user.normal') : $t('user.disabled') || '-' }}</div>
                </div>
                <div class="item">
                  <div>{{ $t('user.remarkLabel') }}</div>
                  <div class="value">{{ userDetailData.mark || '-' }}</div>
                </div>
              </div>
            </div>
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
import { userDetailApi } from '@/api/user';

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
    };
  },
  methods: {
    handleClose() {
      this.dialogUserDetail = false;
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
  padding: 15px 15px 0 15px !important;
  margin: 0 !important;
}
::v-deep .el-drawer__body{
  padding: 0 0 30px 0 !important;
}
::v-deep .demo-drawer_title {
  width: 90%;
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
::v-deep .el-drawer__header {
  height: 0 !important;
  margin: 0 !important;
  padding: 15px !important;
}

.info-row {
  flex-wrap: nowrap;
  padding: 20px 35px 24px 0;

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
    border-top: 1px dashed #eeeeee;

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
</style>
