<template>
  <div class="divBox">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('product.merchantNameLabel')">
            <merchant-name @getMerId="getMerId" :merIdChecked="merIds"></merchant-name>
          </el-form-item>
          <el-form-item :label="$t('merchant.merchantCategoryLabel')" class="inline">
            <el-select v-model="tableForm.merType" :placeholder="$t('merchant.pleaseSelectMerchantCategory')" size="small" clearable class="selWidth">
              <el-option
                v-for="item in merchantClassify"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.liveStatusColon')">
            <el-select
              :key="'live-status-' + currentLocale"
              v-model="tableForm.liveStatus"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
              clearable
              size="small"
            >
              <el-option v-for="item in studioStatusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('menu.showStatus')">
            <el-select
              :key="'store-show-' + currentLocale"
              v-model="tableForm.storeShow"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
              size="small"
              clearable
            >
              <el-option
                v-for="item in studioShowStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('marketing.recommendLevelLabel')">
            <el-select
              :key="'star-' + currentLocale"
              v-model="tableForm.star"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
              size="small"
              clearable
            >
              <el-option
                v-for="item in recommendedLevelStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.liveSearchLabel')" label-width="66px">
            <el-input
              v-model="keywords"
              size="small"
              :placeholder="$t('marketing.pleaseEnterLiveRoomSearch')"
              class="selWidth"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="samll" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="samll" @click="reset()">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs class="list-tabs" v-model="reviewStatus" @tab-click="getList(1)">
        <el-tab-pane :label="$t('el.table.clearFilter')" name="''" />
        <el-tab-pane :label="$t('product.platformPendingAudit')" name="0" />
        <el-tab-pane :label="$t('product.platformAuditFailed')" name="1" />
        <el-tab-pane :label="$t('product.wechatAuditFailed')" name="2" />
        <el-tab-pane :label="$t('product.wechatAuditSuccess')" name="3" />
      </el-tabs>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        highlight-current-row
        class="mt5"
      >
        <el-table-column prop="id" label="ID" width="40" />
        <el-table-column prop="roomName" :label="$t('marketing.liveName')" min-width="120" />
        <el-table-column prop="anchorName" :label="$t('marketing.hostNickname')" min-width="90" />
        <el-table-column prop="anchorWechat" :label="$t('marketing.hostWechat')" min-width="100" />
        <el-table-column key="14" :label="$t('marketing.showInMall')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:mp:live:room:showstore'])"
              v-model="scope.row.storeShow"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('common.show')"
              :inactive-text="$t('menu.hide')"
              @click.native="onchangeStoreShow(scope.row)"
            />
            <div v-else>{{ scope.row.storeShow === 1 ? $t('common.show') : $t('menu.hide') }}</div>
          </template>
        </el-table-column>
        <el-table-column key="15" :label="$t('marketing.officialInclusion')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:mp:live:room:isfeedspubic'])"
              :disabled="scope.row.reviewStatus === 3"
              v-model="scope.row.isFeedsPublic"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeIsFeeds(scope.row)"
            />
            <div v-else>{{ scope.row.isFeedsPublic === 1 ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column key="16" :label="$t('community.comment')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:mp:live:room:updatecomment'])"
              :disabled="scope.row.liveStatus == 101 && scope.row.reviewStatus === 3"
              v-model="scope.row.closeComment"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeIsCommen(scope.row)"
            />
            <div v-else>{{ scope.row.closeComment === 1 ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column key="18" :label="$t('marketing.replay')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:mp:live:room:updatereplay'])"
              :disabled="scope.row.liveStatus !== 101"
              v-model="scope.row.closeReplay"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeCloseReplay(scope.row)"
            />
            <div v-else>{{ scope.row.closeReplay === 1 ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.liveStatus')" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.liveStatus | broadcastStatusFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.auditStatus')" min-width="110">
          <template slot-scope="scope">
            <el-tooltip
              v-if="scope.row.reviewStatus === 1 || scope.row.reviewStatus === 2"
              class="item"
              effect="dark"
              :content="scope.row.reviewReason"
              placement="top"
            >
              <el-tag class="notStartTag tag-background" v-if="scope.row.reviewStatus === 1">{{ $t('product.platformAuditFailed') }}</el-tag>
              <el-tag class="notStartTag tag-background" v-if="scope.row.reviewStatus === 2">{{ $t('product.wechatAuditFailed') }}</el-tag>
            </el-tooltip>
            <div v-else>
              <el-tag class="doingTag tag-background" v-if="scope.row.reviewStatus === 0">{{ $t('dashboard.awaitAudit') }}</el-tag>
              <el-tag class="endTag tag-background" v-if="scope.row.reviewStatus === 3">{{ $t('product.wechatAuditSuccess') }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" min-width="150" :label="$t('marketing.liveStartTime')" />
        <el-table-column prop="endTime" min-width="150" :label="$t('marketing.livePlanEndTime')" />
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <a v-hasPermi="['platform:mp:live:room:list']" @click="onStudioDetails(scope.row, false)">{{ $t('common.detail') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a
              v-if="scope.row.reviewStatus === 0 && checkPermi(['platform:mp:live:room:review'])"
              @click="onStudioDetails(scope.row, true)"
              >{{ $t('finance.audit') }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['platform:mp:live:room:delete']" @click="handleDelete(scope.row, scope.$index)">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="tableForm.limit"
          :current-page="tableForm.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <!-- 审核 详情-->
    <el-drawer
      custom-class="demo-drawer"
      direction="rtl"
      :visible.sync="dialogVisible"
      size="1000px"
      @close="close('ruleForm')"
    >
      <div slot="title" class="demo-drawer_title">{{ $t('marketing.liveDetail') }}</div>
      <div class="demo-drawer__content" v-loading="loading">
        <div class="description">
          <div class="title">{{ $t('marketing.liveInfo') }}</div>
          <div class="acea-row">
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveStatusLabel') }}</label>{{ roomInfo.liveStatus | broadcastStatusFilter }}
            </div>
            <div class="description-term sp100"><label class="name">{{ $t('marketing.liveNameLabel') }}</label>{{ roomInfo.roomName }}</div>
            <div class="description-term sp100"><label class="name">{{ $t('marketing.liveIdLabel') }}</label>{{ roomInfo.id }}</div>
            <div class="description-term sp100"><label class="name">{{ $t('marketing.hostNicknameLabel') }}</label>{{ roomInfo.anchorName }}</div>
            <!--<div class="description-term sp100"><label class="name">{{ $t('marketing.hostPhoneLabel') }}</label>{{ roomInfo.anchorPhone }}</div>-->
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.hostWechatLabel') }}</label>{{ roomInfo.anchorWechat }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.hostSubWechatLabel') }}</label>{{ roomInfo.subAnchorWechat }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.creatorWechatLabel') }}</label>{{ roomInfo.activityName }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('order.auditResult') }}</label>{{ roomInfo.reviewStatus | roomReviewStatusFilter }}
            </div>
            <div v-show="roomInfo.reviewStatus === 1 || roomInfo.reviewStatus === 2" class="description-term sp100">
              <label class="name">{{ $t('community.auditFailReasonLabel') }}</label>{{ roomInfo.reviewReason }}
            </div>
            <div class="description-term sp100"><label class="name">{{ $t('marketing.liveStartTimeLabel') }}</label>{{ roomInfo.startTime }}</div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveExpectedEndLabel') }}</label>{{ roomInfo.endTime }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveTypeLabel') }}</label>{{ roomInfo.type === 1 ? '推流' : $t('marketing.phoneLive') }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveLikeLabel') }}</label>{{ roomInfo.closeLike | roomShowFilter }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveCommentLabel') }}</label>{{ roomInfo.closeComment | roomShowFilter }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveShelfLabel') }}</label>{{ roomInfo.closeGoods | roomShowFilter }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveServiceLabel') }}</label>{{ roomInfo.closeKf | roomShowFilter }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveReplayLabel') }}</label>{{ roomInfo.closeReplay | roomShowFilter }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveShareLabel') }}</label>{{ roomInfo.closeShare | roomShowFilter }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.liveOfficialLabel') }}</label>{{ roomInfo.isFeedsPublic === 1 ? $t('common.open') : $t('common.close') }}
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('user.backgroundImage') }}</label>
              <div class="demo-image__preview mr10">
                <el-image
                  style="width: 36px; height: 36px"
                  :src="roomInfo.coverImgLocal"
                  :preview-src-list="[roomInfo.coverImgLocal]"
                />
              </div>
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('community.coverLabel') }}</label>
              <div class="demo-image__preview mr10">
                <el-image
                  style="width: 36px; height: 36px"
                  :src="roomInfo.feedsImgLocal"
                  :preview-src-list="[roomInfo.feedsImgLocal]"
                />
              </div>
            </div>
            <div class="description-term sp100">
              <label class="name">{{ $t('marketing.shareImageLabel') }}</label>
              <div class="demo-image__preview mr10">
                <el-image
                  style="width: 36px; height: 36px"
                  :src="roomInfo.shareImgLocal"
                  :preview-src-list="[roomInfo.shareImgLocal]"
                />
              </div>
            </div>
            <div v-if="roomInfo.reviewStatus === 3" class="description-term sp100">
              <label class="name">{{ $t('marketing.liveMiniProgramCodeLabel') }}</label>
              <div class="demo-image__preview mr10">
                <el-image
                  style="width: 36px; height: 36px"
                  :src="roomInfo.qrcodeUrl"
                  :preview-src-list="[roomInfo.qrcodeUrl]"
                />
              </div>
            </div>
          </div>
        </div>
        <el-divider v-if="goodsList.length > 0"></el-divider>
        <div v-if="goodsList.length > 0" class="description">
          <div class="title">{{ $t('product.productInfo') }}</div>
          <div class="acea-row mb20">
            <div style="width: 100%">
              <el-table
                ref="tableList"
                row-key="id"
                :data="goodsList"
                v-loading="listLoading"
                size="mini"
                border
                default-expand-all
                :tree-props="{ children: 'children' }"
                style="width: 100%"
              >
                <el-table-column prop="id" label="ID" min-width="50" />
                <el-table-column :label="$t('product.productImage')" min-width="100">
                  <template slot-scope="scope">
                    <div class="demo-image__preview line-heightOne">
                      <el-image :src="scope.row.coverImgUrlLocal" :preview-src-list="[scope.row.coverImgUrlLocal]" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="name" :label="$t('product.productName')" min-width="120" />
                <el-table-column :label="$t('marketing.priceType')" min-width="80">
                  <template slot-scope="scope">
                    <span>{{ scope.row.priceType | priceTypeFilter }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('marketing.price')" min-width="100">
                  <template slot-scope="scope">
                    <span v-if="scope.row.priceType === 1">{{ scope.row.price }}</span>
                    <span v-else>{{ scope.row.price + '~' + scope.row.price2 }}</span>
                  </template>
                </el-table-column>
                <!--<el-table-column prop="goods.pay_num" :label="$t('marketing.salesCount')" min-width="50" />-->
              </el-table>
            </div>
          </div>
        </div>
      </div>
      <div v-show="isReview" class="demo-drawer__footer">
        <div class="from-foot-btn drawer_fix">
          <div class="acea-row justify-content">
            <el-button
              v-hasPermi="['platform:mp:live:room:review']"
              v-debounceClick="
                () => {
                  onSubmit(1);
                }
              "
              style="margin-left: 0"
              >{{ loadingBtn ? $t('finance.submitting') : $t('product.auditRejected') }}</el-button
            >
            <el-button
              type="primary"
              v-hasPermi="['platform:mp:live:room:review']"
              v-debounceClick="
                () => {
                  onSubmit(3);
                }
              "
              >{{ loadingBtnSuccess ? $t('finance.submitting') : $t('finance.auditPassed') }}</el-button
            >
          </div>
        </div>
      </div>
    </el-drawer>
    <!--导入直播商品-->
    <!--<import-goods ref="uploadGoods" />-->
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
  liveRoomGoodsListApi,
  liveRoomListApi,
  liveRoomDeleteApi,
  liveRoomIsFeedsPublicApi,
  liveRoomUpdatecommentApi,
  studioPushMessageApi,
  liveRoomUpdatefeedpublicApi,
  liveRoomReviewApi,
  liveRoomShowApi,
} from '@/api/marketing';
//import detailsFrom from './studioDetail';
// import importGoods from '@/components/importGoods/index'
import { mapGetters } from 'vuex';
import merchantName from '@/components/merUseCategory';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
import { getUiLocale } from '@/utils/localizedName';
export default {
  name: 'StudioList',
  computed: {
    ...mapGetters(['merchantClassify', 'merchantType']),
    currentLocale() {
      return getUiLocale(this);
    },
    recommendedLevelStatus() {
      return [
        { label: this.$t('common.all'), value: '' },
        { label: this.$t('marketing.fiveStar'), value: '5' },
        { label: this.$t('marketing.fourStar'), value: '4' },
        { label: this.$t('marketing.threeStar'), value: '3' },
        { label: this.$t('marketing.twoStar'), value: '2' },
        { label: this.$t('marketing.oneStar'), value: '1' },
      ];
    },
    studioShowStatusList() {
      return [
        { label: this.$t('common.show'), value: 1 },
        { label: this.$t('common.close'), value: 0 },
      ];
    },
    studioStatusList() {
      return [
        { label: this.$t('product.liveStreaming'), value: '101' },
        { label: this.$t('common.ended'), value: '103' },
        { label: this.$t('common.notStarted'), value: '102' },
        { label: this.$t('product.banned'), value: '104' },
        { label: this.$t('product.paused'), value: '105' },
        { label: this.$t('product.abnormal'), value: '106' },
        { label: this.$t('product.expiredOver'), value: '107' },
      ];
    },
  },
  components: { merchantName },
  data() {
    return {
      merIds: [], //商户id
      loadingBtn: false,
      loading: false,
      Loading: false,
      dialogVisible: false,
      importVisible: false,
      listLoading: true,
      tableData: { data: [], total: 0 },
      tableForm: {
        page: 1,
        limit: 20,
        reviewStatus: null,
        liveStatus: null,
        keywords: '',
        storeShow: '',
        merType: '',
        star: '',
        merName: '',
      },
      reviewStatus: '',
      keywords: '',
      roomId: '',
      liveRoomStatus: '',
      roomInfo: {},
      isReview: false, //是否是审核，true是
      goodsList: [], //商品列表
      ruleForm: {
        reviewReason: '',
        reviewStatus: 2,
        id: '',
      },
      loadingBtnSuccess: false, //审核成功通过
    };
  },
  mounted() {
    if (!this.merchantClassify.length) this.$store.dispatch('merchant/getMerchantClassify');
    if (checkPermi(['platform:mp:live:room:list'])) this.getList('');
  },
  methods: {
    checkPermi,
    close() {
      this.dialogVisible = false;
    },
    //审核拒绝
    cancelForm() {
      this.$modalPrompt('textarea', this.$t('product.rejectReason')).then((V) => {
        this.ruleForm.reviewReason = V;
        this.submit();
      });
    },
    // 审核提交
    onSubmit(type) {
      this.ruleForm.reviewStatus = type;
      if (type === 3) {
        this.$modalSure(this.$t('marketing.approveLiveRoomConfirm')).then(() => {
          this.submit();
        });
      } else {
        this.cancelForm();
      }
    },
    submit() {
      if (this.ruleForm.reviewStatus === 3) {
        this.loadingBtnSuccess = true;
      } else {
        this.loadingBtn = true;
      }
      this.ruleForm.id = this.roomId;
      liveRoomReviewApi(this.ruleForm)
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.dialogVisible = false;
          if (this.ruleForm.reviewStatus === 3) {
            this.loadingBtnSuccess = false;
          } else {
            this.loadingBtn = false;
          }
          this.getList();
        })
        .catch((res) => {
          if (this.ruleForm.reviewStatus === 3) {
            this.loadingBtnSuccess = false;
          } else {
            this.loadingBtn = false;
          }
        });
    },
    //直播间商品列表
    roomGoodslist() {
      liveRoomGoodsListApi(this.roomId).then((res) => {
        this.goodsList = res;
      });
    },
    getMerId(id) {
      this.merIds = id;
      this.tableForm.merName = id.toString();
      this.getList();
    },
    // 详情
    onStudioDetails(row, type) {
      this.isReview = type;
      this.roomInfo = row;
      this.roomId = row.id;
      this.dialogVisible = true;
      if (row.reviewStatus === 3 && checkPermi(['platform:mp:live:room:goodslist'])) this.roomGoodslist();
    },
    // 删除
    handleDelete(item, idx) {
      this.$modalSure(this.$t('marketing.liveRoomDeleteConfirm')).then(() => {
        liveRoomDeleteApi(item.id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList('');
        });
      });
    },
    // 推送消息
    onPushMessage(id) {
      this.$confirm(this.$t('marketing.pushToSubscribersConfirm'), this.$t('el.messagebox.title'), {
        confirmButtonText: this.$t('el.messagebox.confirm'),
        cancelButtonText: this.$t('el.messagebox.cancel'),
        type: 'warning',
      })
        .then(() => {
          studioPushMessageApi(id)
            .then(({ message }) => {
              this.$message.success(message);
            })
            .catch(({ message }) => {
              this.$message.error(message);
            });
        })
        .catch((action) => {
          this.$message({
            type: 'info',
            message: this.$t('common.cancelled'),
          });
        });
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableData.page = num ? num : this.tableData.page;
      this.tableForm.keywords = encodeURIComponent(this.keywords);
      this.tableForm.reviewStatus = this.reviewStatus ? Number(this.reviewStatus) : null;
      this.tableForm.liveStatus = this.tableForm.liveStatus ? this.tableForm.liveStatus : null;
      liveRoomListApi(this.tableForm)
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
      this.tableForm = {
        page: 1,
        limit: 20,
        reviewStatus: null,
        liveStatus: null,
        keywords: '',
        storeShow: '',
        merType: '',
        star: '',
      };
      this.merIds = [];
      this.keywords = '';
      this.getList();
    },
    pageChange(page) {
      this.tableForm.page = page;
      this.getList('');
    },
    handleSizeChange(val) {
      this.tableForm.limit = val;
      this.getList('');
    },
    //开启回放
    onchangeCloseReplay(row) {
      liveRoomUpdatereplayApi(row.id, row.closeReplay).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList('');
      });
    },
    // 开启收录
    onchangeIsFeeds(row) {
      liveRoomIsFeedsPublicApi(row.id, row.isFeedsPublic).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList('');
      });
    },
    //是否显示在商城
    onchangeStoreShow(row) {
      liveRoomShowApi(row.id, row.storeShow).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList('');
      });
    },
    // 禁言
    onchangeIsCommen(row) {
      liveRoomUpdatecommentApi(row.id, row.closeComment).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList('');
      });
    },
  },
};
</script>

<style scoped lang="scss">
.lang {
  width: 100% !important;
}
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
    line-height: 30px;
    width: 50%;
    font-size: 14px;
    color: #606266;
  }
  ::v-deep .el-divider--horizontal {
    margin: 12px 0 !important;
  }
}
.seachTiele {
  line-height: 35px;
}
.fa {
  color: #0a6aa1;
  display: block;
}
.sheng {
  color: #ff0000;
  display: block;
}
</style>
