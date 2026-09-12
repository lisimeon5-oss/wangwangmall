<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:user:page:list']"
    >
      <div class="padding-add">
        <el-form
          ref="userFrom"
          :model="userFrom"
          label-width="66px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form" v-if="!collapse">
            <div class="search-form-box">
              <el-form-item :label="$t('order.userSearch')" label-for="nickname">
                <UserSearchInput v-model="userFrom" />
              </el-form-item>
              <el-form-item :label="$t('user.userTagLabel')">
                <el-select
                  v-model.trim="labelData"
                  :placeholder="$t('common.pleaseSelect')"
                  class="selWidth"
                  clearable
                  filterable
                  multiple
                  size="small"
                >
                  <el-option
                    :value="item.id"
                    v-for="(item, index) in labelLists"
                    :key="index"
                    :label="getLocalizedTagName(item)"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" size="small" @click="userSearchs">{{ $t('common.search') }}</el-button>
              <el-button size="small" @click="reset" class="ResetSearch">{{ $t('common.reset') }}</el-button>
              <a class="ivu-ml-8 font12 ml10" @click="collapse = !collapse">
                <template v-if="!collapse"> {{ $t('user.expand') }} <i class="el-icon-arrow-down" /> </template>
                <template v-else> {{ $t('user.collapse') }} <i class="el-icon-arrow-up" /> </template>
              </a>
            </el-form-item>
          </div>
          <div v-if="collapse" class="acea-row search-form">
            <div class="search-form-box">
              <el-form-item :label="$t('order.userSearch')" label-for="nickname">
                <UserSearchInput v-model="userFrom" />
              </el-form-item>
              <el-form-item :label="$t('user.userTagLabel')">
                <el-select
                  v-model.trim="labelData"
                  :placeholder="$t('common.pleaseSelect')"
                  class="selWidth"
                  clearable
                  filterable
                  multiple
                  size="small"
                >
                  <el-option
                    :value="item.id"
                    v-for="(item, index) in labelLists"
                    :key="index"
                    :label="getLocalizedTagName(item)"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('user.consumption')">
                <el-select v-model="userFrom.payCount" :placeholder="$t('common.pleaseSelect')" size="small" class="selWidth" clearable>
                  <el-option value="0" label="0"></el-option>
                  <el-option value="1" label="1+"></el-option>
                  <el-option value="2" label="2+"></el-option>
                  <el-option value="3" label="3+"></el-option>
                  <el-option value="4" label="4+"></el-option>
                  <el-option value="5" label="5+"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('user.gender')">
                <el-select v-model="userFrom.sex" :placeholder="$t('common.pleaseSelect')" size="small" class="selWidth" clearable>
                  <el-option value="" :label="$t('common.all')"></el-option>
                  <el-option value="0" :label="$t('user.unknown')"></el-option>
                  <el-option value="1" :label="$t('user.male')"></el-option>
                  <el-option value="2" :label="$t('user.female')"></el-option>
                  <el-option value="3" :label="$t('user.secret')"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('user.identity')">
                <el-select v-model="userFrom.identity" :placeholder="$t('common.pleaseSelect')" size="small" class="selWidth" clearable>
                  <el-option value="" :label="$t('common.all')"></el-option>
                  <el-option value="1" :label="$t('user.promoter')"></el-option>
                  <el-option value="3" :label="$t('user.paidMember')"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('order.timeSelect')">
                <el-date-picker
                  v-model="timeVal"
                  align="right"
                  unlink-panels
                  value-format="yyyy-MM-dd"
                  format="yyyy-MM-dd"
                  size="small"
                  type="daterange"
                  placement="bottom-end"
                  :placeholder="$t('order.customTime')"
                  :picker-options="pickerOptions"
                  @change="onchangeTime"
                  class="selWidth"
                />
              </el-form-item>
              <el-form-item :label="$t('user.registerTypeLabel')">
                <el-select v-model="userFrom.registerType" :placeholder="$t('common.pleaseSelect')" size="small" class="selWidth" clearable>
                  <el-option v-for="item in registerTypeList" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" size="small" @click="userSearchs">{{ $t('common.search') }}</el-button>
              <el-button class="ResetSearch" size="small" @click="reset">{{ $t('common.reset') }}</el-button>
              <a class="ivu-ml-8 font12 ml10" @click="collapse = !collapse">
                <template v-if="!collapse"> {{ $t('user.expand') }} <i class="el-icon-arrow-down" /> </template>
                <template v-else> {{ $t('user.collapse') }} <i class="el-icon-arrow-up" /> </template>
              </a>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <div class="acea-row row-middle">
        <el-dropdown size="small">
          <el-button :disabled="!multipleSelectionAll.length">
            {{ $t('user.batchSet') }}<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <template v-if="multipleSelectionAll.length">
              <el-dropdown-item v-hasPermi="['platform:user:tag']" @click.native="setBatch('label', '', 1)"
                >{{ $t('user.batchAddLabel') }}</el-dropdown-item
              >
              <el-dropdown-item
                v-hasPermi="['platform:coupon:can:send:list', 'platform:coupon:batch:send']"
                @click.native="sendCoupon"
                >{{ $t('user.sendCoupon') }}</el-dropdown-item
              >
              <el-dropdown-item v-hasPermi="['platform:user:gift:paid:member']" @click.native="handleGiftMembers('')"
                >{{ $t('user.giftMember') }}</el-dropdown-item
              >
            </template>
          </el-dropdown-menu>
        </el-dropdown>
        <div v-show="multipleSelectionAll.length" class="ml12 font12">
          {{ $t('user.selected') }} <span class="font-color font12"> {{ multipleSelectionAll.length }} </span>{{ $t('user.itemUnit') }}
        </div>
      </div>
      <el-table
        ref="table"
        v-loading="listLoading"
        :data="tableData.data"
        size="small"
        @selection-change="handleSelectionChange"
        highlight-current-row
        class="mt20"
      >
        <el-table-column type="expand" width="40">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item :label="$t('user.firstVisit')">
                <span>{{ props.row.createTime | filterEmpty }}</span>
              </el-form-item>
              <el-form-item :label="$t('user.lastVisit')">
                <span>{{ props.row.lastLoginTime | filterEmpty }}</span>
              </el-form-item>
              <el-form-item :label="$t('user.tagLabel')">
                <span>{{ props.row.tagId | tagFilter }}</span>
              </el-form-item>
              <el-form-item :label="$t('user.addressLabel')">
                <span>{{ (props.row.province + props.row.city) | filterEmpty }}</span>
              </el-form-item>
              <el-form-item :label="$t('user.remarkLabel')" style="width: 100%; display: flex; margin-right: 10px">
                <span>{{ props.row.mark | filterEmpty }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="45"></el-table-column>
        <el-table-column prop="id" label="ID" width="70" align="right" v-if="isColumnChecked('id')" />
        <el-table-column :label="$t('user.avatar')" width="50" v-if="isColumnChecked('avatar')">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user.nickname')" min-width="180" v-if="isColumnChecked('name')">
          <template slot-scope="scope">
            <div class="acea-row row-middle">
              <span :class="scope.row.isLogoff ? 'red' : ''">{{ scope.row.nickname | filterEmpty }} | </span>
              <img :src="getSexImage(scope.row.sex)" :title="sexFilter(scope.row.sex)" />
              <span :class="scope.row.isLogoff ? 'red' : ''" v-if="scope.row.isLogoff == true" class="ml2">|</span>
              <span v-if="scope.row.isLogoff" class="red ml2">{{ $t('order.loggedOff') }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user.referrer')" min-width="130" v-if="isColumnChecked('referrer')">
          <template slot-scope="scope">
            <span>{{ scope.row.spreadName | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user.phone')" min-width="100" v-if="isColumnChecked('phone')">
          <template slot-scope="scope">
            <span>{{ scope.row.phone | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nowMoney" :label="$t('order.balance')" min-width="100" v-if="isColumnChecked('balance')" />
        <el-table-column prop="integral" :label="$t('user.integral')" min-width="100" v-if="isColumnChecked('integral')" />
        <el-table-column prop="registerType" :label="$t('user.registerType')" min-width="100" v-if="isColumnChecked('registerType')">
          <template slot-scope="scope">
            <span>{{ scope.row.registerType | registerTypeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <a @click="onDetails(scope.row.id)" v-if="checkPermi(['platform:user:detail'])">{{ $t('common.detail') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="editUser(scope.row)" v-hasPermi="['platform:user:update', 'platform:user:detail']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown
              trigger="click"
              v-hasPermi="[
                'platform:user:operate:integer',
                'platform:user:operate:balance',
                'platform:user:tag',
                'platform:retail:store:update:user:spread',
                'platform:retail:store:clean:user:spread',
                'platform:user:gift:paid:member',
              ]"
            >
              <span class="el-dropdown-link"> {{ $t('user.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  @click.native="editPoint(scope.row, 'integral')"
                  v-if="checkPermi(['platform:user:operate:integer'])"
                  >{{ $t('user.modifyIntegral') }}</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="editPoint(scope.row, 'balance')"
                  v-if="checkPermi(['platform:user:operate:balance'])"
                  >{{ $t('user.modifyBalance') }}</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="setBatch('label', scope.row, 2)"
                  v-if="checkPermi(['platform:user:tag'])"
                  >{{ $t('user.setLabel') }}</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="setExtension(scope.row)"
                  v-if="checkPermi(['platform:retail:store:update:user:spread'])"
                  >{{ $t('user.modifyReferrer') }}</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="clearSpread(scope.row)"
                  v-if="
                    scope.row.spreadUid &&
                    scope.row.spreadUid > 0 &&
                    checkPermi(['platform:retail:store:clean:user:spread'])
                  "
                  >{{ $t('user.clearReferrer') }}</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="handleGiftMembers(scope.row)"
                  v-if="checkPermi(['platform:user:gift:paid:member'])"
                  >{{ $t('user.giftMember') }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="userFrom.limit"
          :current-page="userFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <div class="card_abs" v-show="card_select_show" :style="{ top: collapse ? 570 + 'px' : 270 + 'px' }">
      <template>
        <div class="cell_ht">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"
            >{{ $t('common.selectAll') }}</el-checkbox
          >
          <el-button type="text" @click="checkSave()">{{ $t('common.save') }}</el-button>
        </div>
        <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="item in columnOptions" :label="item.key" :key="item.key" class="check_cell">{{
            item.label
          }}</el-checkbox>
        </el-checkbox-group>
      </template>
    </div>
    <!--修改推广人-->
    <el-dialog :title="$t('user.modifyPromoter')" :visible.sync="extensionVisible" width="540px" :before-close="handleCloseExtension">
      <el-form
        class="formExtension mt20"
        ref="formExtension"
        :model="formExtension"
        :rules="ruleInline"
        label-width="70px"
        @submit.native.prevent
        v-loading="loading"
      >
        <el-form-item :label="$t('user.selectUser')" prop="image">
          <div class="upLoadPicBox" @click="modalPicTap">
            <div v-if="selectedUser.image" class="acea-row">
              <img class="pictrue" :src="selectedUser.image" />
              <span>{{ selectedUser.nickname }}</span>
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="extensionVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="onSubExtension('formExtension')">{{ $t('common.confirmPrefix') }}</el-button>
      </span>
    </el-dialog>
    <!--用户列表-->
    <el-dialog class="big-dialog" :title="$t('user.promoterList')" :visible.sync="userVisible" width="900px">
      <user-list v-if="userVisible" @getTemplateRow="getTemplateRow"></user-list>
      <!-- <span slot="footer">
        <el-button @click="userVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="userVisible = false">{{ $t('common.confirmPrefix') }}</el-button>
      </span> -->
    </el-dialog>
    <!--批量设置-->
    <el-dialog
      :title="isBatch ? $t('user.batchAddLabel') : $t('user.setLabel')"
      :visible.sync="dialogVisible"
      width="540px"
      :before-close="handleClose"
    >
      <el-form
        :model="dynamicValidateForm"
        ref="dynamicValidateForm"
        label-width="75px"
        class="demo-dynamic"
        v-loading="loading"
      >
        <el-form-item
          prop="groupId"
          :label="$t('user.userTagLabel')"
          :rules="[{ required: true, message: $t('user.pleaseSelectUserTag'), trigger: 'change' }]"
        >
          <el-select v-model="dynamicValidateForm.groupId" :placeholder="$t('user.pleaseSelectLabel')" filterable multiple>
            <el-option :value="item.id" v-for="(item, index) in labelLists" :key="index" :label="getLocalizedTagName(item)"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          v-debounceClick="
            () => {
              submitForm('dynamicValidateForm');
            }
          "
          >{{ $t('common.confirmPrefix') }}</el-button
        >
      </span>
    </el-dialog>
    <!--编辑-->
    <el-dialog :title="$t('common.edit')" :visible.sync="visible" width="900px">
      <edit-from v-if="visible" :userInfo="userInfo" @resetForm="resetForm" class="dialog-bottom"></edit-from>
    </el-dialog>
    <!--积分余额-->
    <el-dialog
      :title="type === 'integral' ? $t('user.integral') : $t('order.balance')"
      :visible.sync="VisiblePoint"
      width="540px"
      :close-on-click-modal="false"
      :before-close="handlePointClose"
    >
      <el-form
        :model="PointValidateForm"
        ref="PointValidateForm"
        label-width="75px"
        class="demo-dynamic"
        v-loading="loadingPoint"
      >
        <el-form-item :label="type === 'integral' ? $t('user.integralLabel') : $t('user.balanceLabel')" required>
          <span>{{ type === 'integral' ? userInfo.integral : userInfo.nowMoney }}</span>
        </el-form-item>
        <template v-if="type === 'integral'">
          <el-form-item :label="$t('user.modifyIntegralLabel')" required>
            <el-radio-group v-model="PointValidateForm.operateType">
              <el-radio label="add">{{ $t('user.add') }}</el-radio>
              <el-radio label="sub">{{ $t('user.subtract') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('user.integralLabel')" required>
            <el-input-number
              type="text"
              step-strictly
              v-model.trim="PointValidateForm.integral"
              :min="0"
              :max="999999"
            ></el-input-number>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :label="$t('user.modifyBalanceLabel')" required>
            <el-radio-group v-model="PointValidateForm.operateType">
              <el-radio label="add">{{ $t('user.add') }}</el-radio>
              <el-radio label="sub">{{ $t('user.subtract') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('user.balanceLabel')" required>
            <el-input-number
              type="text"
              v-model.trim="PointValidateForm.money"
              :precision="2"
              :step="0.1"
              :min="0"
              :max="999999"
            ></el-input-number>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer">
        <el-button @click="handlePointClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="loadingBtn" @click="submitPointForm('PointValidateForm')">{{ $t('common.confirmPrefix') }}</el-button>
      </span>
    </el-dialog>
    <!--用户详情-->
    <detail-user ref="userDetailFrom"></detail-user>
    <!-- 选择优惠券 -->
    <el-dialog v-if="visibleCoupon" :title="$t('user.couponListTitle')" :visible.sync="visibleCoupon" width="1000px">
      <coupon-List v-if="visibleCoupon" ref="couponList" :checkedIds="checkedIds" @sendSuccess="sendSuccess" />
    </el-dialog>
    <!-- 赠送会员卡 -->
    <gift-to-members
      v-if="dialogVisibleMember"
      :tableDataMember="tableDataMember"
      :dialogVisibleMember="dialogVisibleMember"
      ref="giftMembersRef"
      :checkedIds="checkeduIds.toString()"
      @handlerSuccessSubmit="handlerSuccessSubmit"
      @handlerSuccessClose="handlerSuccessSubmit"
    ></gift-to-members>
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
  userListApi,
  tagAllListApi,
  tagPiApi,
  foundsApi,
  updateSpreadApi,
  balanceApi,
  memberCardListApi,
} from '@/api/user';
import { spreadClearApi } from '@/api/distribution';
import detailUser from '@/components/detailUser';
import editFrom from './edit';
import levelEdit from './level';
import userList from '@/components/userList';
import couponList from '../components/couponList';
import giftToMembers from '../components/giftToMembers';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { Debounce } from '@/utils/validate';
import { handleDeleteTable } from '@/libs/public';
import { getLocalizedName } from '@/utils/localizedName';
export default {
  name: 'UserIndex',
  components: { editFrom, userList, levelEdit, detailUser, couponList, giftToMembers },
  data() {
    return {
      formExtension: {
        spreadUid: '',
        userId: '',
      },
      selectedUser: {
        image: '',
        nickname: '',
      },
      ruleInline: {},
      extensionVisible: false,
      userVisible: false,
      levelInfo: '',
      loadingBtn: false,
      PointValidateForm: {
        integral: null,
        operateType: 'add',
        uid: '',
        money: null,
      },
      loadingPoint: false,
      VisiblePoint: false,
      visible: false,
      dialogVisible: false,
      levelVisible: false,
      labelData: [],
      selData: [],
      keywords: '',
      labelPosition: 'right',
      collapse: false,
      listLoading: true,
      tableData: {
        data: [],
        total: 0,
      },
      userFrom: {
        payCount: '',
        sex: '',
        identity: '',
        registerType: '',
        page: 1,
        limit: 20,
        searchType: 'all',
        content: '',
      },
      grid: {
        xl: 8,
        lg: 12,
        md: 12,
        sm: 24,
        xs: 24,
      },
      labelLists: [],
      selectedData: [],
      timeVal: [],
      dynamicValidateForm: {
        groupId: [],
      },
      loading: false,
      groupIdFrom: [],
      selectionList: [],
      batchName: '',
      uid: 0,
      Visible: false,
      keyNum: 0,
      multipleSelection: [],
      multipleSelectionAll: [],
      idKey: 'id',
      card_select_show: false,
      checkAll: false,
      columnKeys: ['id', 'avatar', 'name', 'registerType', 'referrer', 'phone', 'balance', 'integral'],
      checkedCities: ['id', 'avatar', 'name', 'registerType', 'referrer', 'phone', 'balance', 'integral'],
      isIndeterminate: true,
      type: 'integral',
      userInfo: {},
      checkedIds: [],
      selectAllPage: false,
      visibleCoupon: false, //发送优惠券显示
      isBatch: false, //是否是批量
      tableDataMember: [], //会员卡
      dialogVisibleMember: false,
      checkeduIds: '',
    };
  },
  computed: {
    registerTypeList() {
      return [
        { value: 'wechat', label: this.$t('user.registerWechat') },
        { value: 'routine', label: this.$t('user.registerRoutine') },
        { value: 'h5', label: 'H5' },
        { value: 'iosWx', label: this.$t('user.registerIosWx') },
        { value: 'androidWx', label: this.$t('user.registerAndroidWx') },
        { value: 'ios', label: 'ios' },
      ];
    },
    pickerOptions() {
      this.$i18n.locale;
      return this.$createTimeOptions();
    },
    columnOptions() {
      return [
        { key: 'id', label: 'ID' },
        { key: 'avatar', label: this.$t('user.avatar') },
        { key: 'name', label: this.$t('user.nickname') },
        { key: 'registerType', label: this.$t('user.registerType') },
        { key: 'referrer', label: this.$t('user.referrer') },
        { key: 'phone', label: this.$t('user.phone') },
        { key: 'balance', label: this.$t('order.balance') },
        { key: 'integral', label: this.$t('user.integral') },
      ];
    },
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
  activated() {
    this.getList(1);
  },
  mounted() {
    this.checkedCities = this.normalizeCheckedColumns(
      this.$cache.local.has('user_stroge') ? this.$cache.local.getJSON('user_stroge') : this.checkedCities,
    );
    if (checkPermi(['platform:user:page:list'])) this.getList(1);
    if (checkPermi(['platform:user:tag:all:list'])) this.getTagList();
    if (checkPermi(['platform:paid:member:card:list'])) this.getMemberList();
  },
  methods: {
    checkPermi,
    getLocalizedTagName(row) {
      return getLocalizedName(row, this.currentLocale);
    },
    isColumnChecked(key) {
      return this.checkedCities.includes(key);
    },
    normalizeCheckedColumns(saved) {
      const keys = this.columnKeys;
      if (!Array.isArray(saved) || !saved.length) return keys.slice();
      const aliasMap = {
        ID: 'id',
        头像: 'avatar',
        姓名: 'name',
        昵称: 'name',
        注册类型: 'registerType',
        推荐人: 'referrer',
        联系电话: 'phone',
        余额: 'balance',
        积分: 'integral',
      };
      const mapped = [];
      let hasUnknown = false;
      saved.forEach((item) => {
        if (keys.includes(item)) {
          mapped.push(item);
        } else if (aliasMap[item]) {
          mapped.push(aliasMap[item]);
        } else {
          hasUnknown = true;
        }
      });
      if (hasUnknown) return keys.slice();
      const unique = Array.from(new Set(mapped));
      return unique.length ? unique : keys.slice();
    },
    sexFilter(status) {
      const statusMap = {
        0: this.$t('user.unknown'),
        1: this.$t('user.male'),
        2: this.$t('user.female'),
        3: this.$t('user.secret'),
      };
      return statusMap[status];
    },
    //性别
    getSexImage(sex) {
      const iconMap = {
        0: 'unknown.png',
        1: 'man.png',
        2: 'woman.png',
        3: 'unknown.png',
      };
      const imageName = iconMap[sex] || 'unknown.png';
      return require(`@/assets/imgs/${imageName}`);
    },
    //赠送会员
    handleGiftMembers(row) {
      if (!this.multipleSelection.length && !row) return this.$message.warning(this.$t('user.pleaseSelectUser'));
      if (row) {
        this.checkeduIds = row.id;
      } else {
        this.getUserIds();
        this.checkeduIds = this.checkedIds.join(',');
      }
      this.dialogVisibleMember = true;
    },
    handlerSuccessSubmit() {
      this.handleClearCheckbox();
      this.dialogVisibleMember = false;
    },
    //会员卡列表
    async getMemberList() {
      try {
        this.tableDataMember = await memberCardListApi({ type: 1, status: 1 });
      } catch (e) {}
    },
    filterRegisterType(status) {
      const statusMap = {
        wechat: '#FD5ACC',
        routine: '#A277FF',
        h5: '#E8B600',
        iosWx: '#1BBE6B',
        androidWx: '#EF9C20',
        ios: '#1890FF',
      };
      return statusMap[status];
    },
    // 清除
    clearSpread(row) {
      this.$modalSure(this.$t('user.clearReferrerConfirm'), { name: row.nickname }).then(() => {
        spreadClearApi(row.id).then((res) => {
          this.$message.success(this.$t('user.clearSuccess'));
          this.getList();
        });
      });
    },
    onSubExtension(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          updateSpreadApi(this.formExtension).then((res) => {
            this.$message.success(this.$t('user.setSuccess'));
            this.extensionVisible = false;
            this.getList();
          });
        } else {
          return false;
        }
      });
    },
    getTemplateRow(row) {
      this.formExtension.spreadUid = row.id;
      this.selectedUser = {
        image: row.avatar,
        nickname: row.nickname,
      };
      this.userVisible = false;
    },
    setExtension(row) {
      this.formExtension = {
        spreadUid: '',
        userId: row.id,
      };
      this.selectedUser = {
        image: '',
        nickname: '',
      };
      this.extensionVisible = true;
    },
    handleCloseExtension() {
      this.extensionVisible = false;
      this.selectedUser = {
        image: '',
        nickname: '',
      };
    },
    modalPicTap() {
      this.userVisible = true;
    },
    resetForm() {
      this.visible = false;
    },
    reset(formName) {
      this.userFrom.payCount = '';
      this.userFrom.sex = '';
      this.userFrom.identity = '';
      this.userFrom.registerType = '';
      this.userFrom.page = 1;
      this.userFrom.searchType = 'all';
      this.userFrom.content = '';
      this.keywords = '';
      this.labelData = [];
      this.timeVal = [];
      this.getList(1);
    },
    Close() {
      this.Visible = false;
      this.levelVisible = false;
    },
    // 账户详情
    onDetails(id) {
      this.$refs.userDetailFrom.getUserDetail(id);
      this.$refs.userDetailFrom.dialogUserDetail = true;
    },
    // 积分余额
    editPoint(row, type) {
      this.uid = row.id;
      this.type = type;
      this.userInfo = row;
      this.VisiblePoint = true;
    },
    // 积分余额
    submitPointForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.PointValidateForm.uid = this.uid;
          this.loadingBtn = true;
          if (this.type === 'integral') {
            foundsApi(this.PointValidateForm)
              .then((res) => {
                this.$message.success(this.$t('user.setSuccess'));
                this.loadingBtn = false;
                this.handlePointClose();
                this.getList();
              })
              .catch(() => {
                this.loadingBtn = false;
              });
          } else {
            balanceApi(this.PointValidateForm)
              .then((res) => {
                this.$message.success(this.$t('user.setSuccess'));
                this.loadingBtn = false;
                this.handlePointClose();
                this.getList();
              })
              .catch(() => {
                this.loadingBtn = false;
              });
          }
        } else {
          return false;
        }
      });
    }),
    // 积分余额
    handlePointClose() {
      this.VisiblePoint = false;
      this.PointValidateForm = {
        integral: null,
        operateType: 'add',
        uid: '',
        money: null,
      };
    },
    editUser(row) {
      this.userInfo = row;
      this.visible = true;
    },
    submitForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.getUserIds();
          this.loading = true;
          tagPiApi({ tagIds: this.dynamicValidateForm.groupId.join(','), ids: this.checkedIds.join(',') })
            .then((res) => {
              this.$message.success(this.$t('user.setSuccess'));
              this.loading = false;
              this.handleClose();
              this.getList();
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    }),
    setBatch(name, row, num) {
      num === 1 ? (this.isBatch = true) : (this.isBatch = false);
      this.batchName = name;
      if (row) {
        this.checkedIds = row.id;
        this.dynamicValidateForm.groupId = row.tagId ? row.tagId.split(',').map(Number) : [];
      } else {
        this.dynamicValidateForm.groupId = '';
      }
      if (this.multipleSelection.length === 0 && !row) return this.$message.warning(this.$t('user.pleaseSelectUserToSet'));
      this.dialogVisible = true;
    },
    //清除选中
    handleClearCheckbox(){
      this.$refs.table.clearSelection();
      this.multipleSelectionAll = [];
    },
    handleClose() {
      this.handleClearCheckbox();
      this.dialogVisible = false;
      this.$refs['dynamicValidateForm'].resetFields();
    },
    // 搜索
    userSearchs() {
      this.userFrom.page = 1;
      this.getList();
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.userFrom.dateLimit = e ? this.timeVal.join(',') : '';
    },
    //标签列表
    getTagList() {
      tagAllListApi().then((res) => {
        this.labelLists = res;
        localStorage.setItem('tagAllList', JSON.stringify(res));
      });
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.userFrom.page = num ? num : this.userFrom.page;
      this.userFrom.tagIds = this.labelData.join(',');
      userListApi(this.userFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.$nextTick(function () {
            this.setSelectRow(); // 调用跨页选中方法
          });
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
        });
      this.checkedCities = this.normalizeCheckedColumns(
        this.$cache.local.has('user_stroge') ? this.$cache.local.getJSON('user_stroge') : this.checkedCities,
      );
      this.$set(this, 'card_select_show', false);
    },
    // 设置选中的方法
    setSelectRow() {
      if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
        return;
      }
      // 标识当前行的唯一键的名称
      const idKey = this.idKey;
      const selectAllIds = [];
      this.multipleSelectionAll.forEach((row) => {
        selectAllIds.push(row[idKey]);
      });
      this.$refs.table.clearSelection();
      for (var i = 0; i < this.tableData.data.length; i++) {
        if (selectAllIds.indexOf(this.tableData.data[i][idKey]) >= 0) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.table.toggleRowSelection(this.tableData.data[i], true);
        }
      }
    },
    // 设置选中的方法
    handleSelectionChange(val) {
      this.multipleSelection = val;
      setTimeout(() => {
        this.$selfUtil.changePageCoreRecordData(
          this.multipleSelectionAll,
          this.multipleSelection,
          this.tableData.data,
          (e) => {
            this.multipleSelectionAll = e;
          },
        );
      }, 50);
    },
    pageChange(page) {
      this.$selfUtil.changePageCoreRecordData(
        this.multipleSelectionAll,
        this.multipleSelection,
        this.tableData.data,
        (e) => {
          this.multipleSelectionAll = e;
        },
      );
      this.userFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.$selfUtil.changePageCoreRecordData(
        this.multipleSelectionAll,
        this.multipleSelection,
        this.tableData.data,
        (e) => {
          this.multipleSelectionAll = e;
        },
      );
      this.userFrom.limit = val;
      this.getList(1);
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure().then(() => {
        productDeleteApi(id).then(() => {
          this.$message.success(this.$t('user.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.userFrom);
          this.getList();
        });
      });
    },
    onchangeIsShow(row) {
      row.isShow
        ? putOnShellApi(row.id)
            .then(() => {
              this.$message.success(this.$t('user.shelfSuccess'));
              this.getList();
            })
            .catch(() => {
              row.isShow = !row.isShow;
            })
        : offShellApi(row.id)
            .then(() => {
              this.$message.success(this.$t('user.offShelfSuccess'));
              this.getList();
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
      this.checkedCities = val ? this.columnKeys.slice() : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.columnKeys.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnKeys.length;
    },
    checkSave() {
      this.card_select_show = false;
      this.$modal.loading(this.$t('order.savingToLocal'));
      this.$cache.local.setJSON('user_stroge', this.checkedCities);
      setTimeout(this.$modal.closeLoading(), 1000);
    },
    // 获取批量用户ids
    getUserIds() {
      const data = [];
      this.multipleSelectionAll.map((item) => {
        data.push(item.id);
      });
      this.checkedIds = data;
    },
    //发送优惠券
    sendCoupon() {
      if (this.multipleSelection.length > 0) {
        this.getUserIds();
        this.visibleCoupon = true;
      } else {
        this.$message.warning(this.$t('user.pleaseSelectUser'));
      }
    },
    sendSuccess() {
      this.handleClearCheckbox();
      this.visibleCoupon = false;
    },
  },
};
</script>

<style scoped lang="scss">
.sexImg,
img {
  width: 16px !important;
  height: 16px !important;
  margin-left: 2px;
}
::v-deep .el-table__cell:nth-child(2) .cell {
  padding-left: 14px;
  padding-right: 14px;
}

.red {
  color: #ed4014;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.text-right {
  text-align: right;
}

.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 33.33%;
}

.seachTiele {
  line-height: 30px;
}

.container {
  min-width: 821px;

  ::v-deepel-form-item {
    width: 100%;
  }

  ::v-deepel-form-item__content {
    width: 72%;
  }
}

.ivu-ml-8 {
  color: var(--prev-color-primary);
}

.btn_bt {
  border-top: 1px dashed #ccc;
  padding-top: 20px;
}

.relative {
  position: relative;
}

.card_abs {
  position: absolute;
  padding-bottom: 15px;
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

::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #606266;
}

.userbtn {
  position: absolute;
  right: 0;
}

::v-deep.el-tag {
  color: #fff !important;
}

.search-form {
  display: flex;
  justify-content: space-between;

  .search-form-box {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }
}

.search-form-sub {
  display: flex;
}

::v-deep.el-select {
  width: 100%;
}

::v-deep .el-tag {
  border: none;
}

::v-deep .el-tag--small {
  line-height: 24px;
}

::v-deep .el-dialog__title {
  font-weight: 600 !important;
}

::v-deep .el-dialog__body {
  padding-top: 20px !important;
}
</style>
