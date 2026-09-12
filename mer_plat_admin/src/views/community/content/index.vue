<template>
  <div class="divBox">
    <el-card
      v-hasPermi="['platform:community:note:page:list']"
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form inline size="small" label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('finance.auditStatusLabel')" v-if="tabActive === '10'">
            <el-select
              v-model="tableFrom.auditStatus"
              :placeholder="$t('el.select.placeholder')"
              class="filter-item selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('product.userSearchLabel')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item :label="$t('category.categoryNameLabel')" style="display: inline-block">
            <el-select
              v-model="tableFrom.categoryId"
              clearable
              filterable
              :placeholder="$t('community.pleaseSelectCategoryName')"
              class="selWidth"
              :key="'cate-filter-' + ($i18n.locale || '')"
              @change="getList(1)"
            >
              <el-option
                v-for="item in cateSelect"
                :key="item.id"
                :label="getLocalizedTopicName(item)"
                :value="item.id"
                :disabled="item.isShow === 0"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('community.contentTitleLabel')" label-width="66px">
            <el-input v-model="title" @keyup.enter.native="getList(1)" :placeholder="$t('community.pleaseEnterContentTitle')" class="selWidth" />
          </el-form-item>
          <el-form-item :label="$t('community.topicNameLabel')" style="display: inline-block">
            <el-select
              @change="getList(1)"
              class="selWidth"
              clearable
              filterable
              v-model="tableFrom.topicId"
              v-selectLoadMore="selectLoadMore"
              :loading="loading"
              remote
              :multiple="multiple"
              :remote-method="remoteMethod"
              :placeholder="$t('community.pleaseSelectTopic')"
            >
              <el-option v-for="user in topicSelect" :key="user.id" :label="getLocalizedTopicName(user)" :value="user.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('community.imageTextTypeLabel')">
            <el-select
              v-model="tableFrom.type"
              :placeholder="$t('community.pleaseSelectImageTextType')"
              class="filter-item selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option :label="$t('community.imageText')" value="1" />
              <el-option :label="$t('community.shortVideo')" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs :key="'community-content-tabs-' + ($i18n.locale || '')" class="list-tabs" v-model="tabActive" @tab-click="handleClick">
        <el-tab-pane v-for="(item, index) in headeNum" :key="item.type" :name="item.type" :label="item.title" />
      </el-tabs>
      <el-button
        v-hasPermi="['platform:community:note:category:batch:update']"
        @click="categoryBatch"
        size="small"
        type="primary"
        class="mt5"
        >{{ $t('community.batchMove') }}</el-button
      >
      <el-table
        v-loading="listLoading"
        ref="table"
        :data="tableData.data"
        size="small"
        highlight-current-row
        @selection-change="handleSelectionChange"
        class="mt20 tableSelection"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="ID" prop="id" width="60" />
        <el-table-column :label="$t('community.contentTitle')" min-width="160" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div>{{ scope.row.title | filterEmpty }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('community.contentAuthor')" prop="authorName" min-width="140" />
        <el-table-column :label="$t('community.contentType')" min-width="70">
          <template slot-scope="scope">
            <div>{{ scope.row.type === 1 ? $t('community.imageText') : $t('community.video') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('community.cover')" min-width="50px">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.cover" class="mr5 imgStyle" :preview-src-list="[scope.row.cover]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('community.recommendLevel')" min-width="130">
          <template slot-scope="scope">
            <el-rate disabled v-model="scope.row.star"> </el-rate>
          </template>
        </el-table-column>
        <el-table-column prop="likeNum" :label="$t('community.likesCount')" min-width="100" />
        <el-table-column prop="replyNum" :label="$t('community.commentCount')" min-width="100" />
        <el-table-column :label="$t('community.category')" min-width="100">
          <template slot-scope="scope">
            {{ getLocalizedCategoryName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('community.topic')" min-width="130" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div v-if="!scope.row.topicList">{{ $t('finance.none') }}</div>
            <div v-for="(item, i) in scope.row.topicList" :key="i">{{ item }}<br /></div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('community.comment')" min-width="90">
          <template slot-scope="scope">
            <div>{{ scope.row.replyStatus | communityReplyStatusFilter }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="tabActive === '10'" :label="$t('product.auditStatus')" min-width="100">
          <template slot-scope="scope">
            <el-tag class="doingTag tag-background" v-if="scope.row.auditStatus === 0">{{ $t('dashboard.awaitAudit') }}</el-tag>
            <el-tag class="endTag tag-background" v-if="scope.row.auditStatus === 1">{{ $t('common.auditSuccess') }}</el-tag>
            <el-tag class="notStartTag tag-background" v-if="scope.row.auditStatus === 2">{{ $t('common.auditFailed') }}</el-tag>
            <el-tag type="danger" v-if="scope.row.auditStatus === 3">{{ $t('common.platformClosed') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="tabActive === '10'"
          prop="refusal"
          :label="$t('product.rejectReason')"
          min-width="120"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <div v-if="Number(scope.row.auditStatus) > 1">{{ $t('product.rejectReason') }}：{{ scope.row.refusal }}</div>
            <div v-else>{{ $t('finance.none') }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('community.publishTime')" min-width="150" />
        <el-table-column :label="$t('common.operate')" width="240" fixed="right">
          <template slot-scope="scope">
            <template
              v-if="
                scope.row.auditStatus == 0 &&
                checkPermi(['platform:community:note:detail', 'platform:community:note:audit'])
              "
            >
              <a @click="onAudit(scope.row.id, true)">{{ $t('finance.audit') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template v-if="checkPermi(['platform:community:note:repley:force:off:switch'])">
              <a @click="onReplyOff(scope.row)">{{ scope.row.replyStatus !== 3 ? $t('community.closeComments') : $t('community.cancelCloseComments') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template v-if="scope.row.auditStatus == 1 && checkPermi(['platform:community:note:forced:down'])">
              <a @click="onOff(scope.row.id)">{{ $t('product.forceOff') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> {{ $t('user.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  @click.native="onAudit(scope.row.id, false)"
                  v-if="checkPermi(['platform:community:note:detail'])"
                >
                  {{ $t('common.detail') }}
                </el-dropdown-item>
                <el-dropdown-item
                  @click.native="handleDelete(scope.row.id, scope.$index)"
                  v-if="checkPermi(['platform:community:note:delete'])"
                >
                  {{ $t('common.delete') }}
                </el-dropdown-item>
                <el-dropdown-item
                  @click.native="onEdit(scope.row)"
                  v-if="scope.row.auditStatus == 1 && checkPermi(['platform:community:note:star:update'])"
                >
                  {{ $t('community.editStar') }}
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
    <!--审核-->
    <el-drawer
      :visible.sync="dialogVisible"
      :direction="direction"
      custom-class="demo-drawer"
      size="1000px"
      ref="drawer"
      class="infoBox"
      @close="onClose"
    >
      <div v-loading="loading" v-if="dialogVisible">
        <div class="detailHead">
          <div class="acea-row row-between headerBox">
            <div class="full">
              <div class="order_icon"><span class="iconfont icon-shipinico"></span></div>
              <div class="text">
                <div class="title">{{ isExamine ? $t('community.contentAudit') : $t('community.contentDetail') }}</div>
                <div>
                  <span class="mr20"
                    >{{ $t('finance.auditStatusLabel') }}<span class="color-warning">{{
                      formValidate.auditStatus | communityAuditStatusFilter
                    }}</span></span
                  >
                </div>
              </div>
            </div>
            <div v-if="isExamine" class="acea-row justify-content">
              <el-button
                v-hasPermi="['platform:community:note:audit']"
                v-debounceClick="
                  () => {
                    onAuditStatus(2);
                  }
                "
                style="margin-left: 0"
                >{{ loadingBtn ? $t('finance.submitting') : $t('product.auditRejected') }}</el-button
              >
              <el-button
                type="primary"
                v-hasPermi="['platform:community:note:audit']"
                v-debounceClick="
                  () => {
                    onAuditStatus(1);
                  }
                "
                >{{ loadingBtn ? $t('finance.submitting') : $t('finance.auditPassed') }}</el-button
              >
            </div>
          </div>
        </div>
        <el-tabs type="border-card" v-model="currentTab">
          <!-- 商品信息-->
          <el-tab-pane :label="$t('community.basicInfo')" name="0">
            <div class="detailSection">
              <ul class="list mt-16">
                <li class="item">
                  <div class="tips">{{ $t('content.articleTitleLabel') }}</div>
                  <div class="value">
                    {{ formValidate.title | filterEmpty }}
                  </div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('content.authorLabel') }}</div>
                  <div class="value">
                    {{ formValidate.authorName | filterEmpty }}
                  </div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('community.authorIdLabel') }}</div>
                  <div class="value">
                    {{ formValidate.authorId | filterEmpty }}
                  </div>
                </li>
                <li class="item">
                  <div class="tips">{{ $t('community.publishTimeLabel') }}</div>
                  <div class="value">
                    {{ formValidate.createTime }}
                  </div>
                </li>
              </ul>
              <div class="list" style="display: block">
                <div class="item">
                  <div class="tips">{{ $t('content.articleContentLabel') }}</div>
                  <div class="value">
                    {{ formValidate.content | filterEmpty }}
                  </div>
                </div>
                <div class="item row-middle">
                  <div class="tips">{{ $t('community.coverLabel') }}</div>
                  <div class="upLoadPicBox">
                    <el-image
                      class="pictrue"
                      :src="formValidate.cover"
                      :preview-src-list="[formValidate.cover]"
                    ></el-image>
                  </div>
                </div>
                <div class="item" v-if="formValidate.type === 2 && formValidate.video">
                  <div class="acea-row row-middle">
                    <div class="tips">{{ $t('community.shortVideoLabel') }}</div>
                    <div class="upLoadPicBox">
                      <video class="pictrue" :src="formValidate.video" controls="controls">
                        {{ $t('community.browserNotSupportVideo') }}
                      </video>
                    </div>
                  </div>
                </div>
                <div class="item" v-if="formValidate.type === 1 && formValidate.image">
                  <div class="tips">{{ $t('community.imageLabel') }}</div>
                  <div
                    v-for="(item, index) in formValidate.image.split(',')"
                    :key="index"
                    class="pictrue"
                    style="display: inline-block; margin: 0 10px 10px 0"
                  >
                    <el-image class="pictrue" :src="item || ''" :preview-src-list="[item ? item : '']" />
                  </div>
                </div>
                <div class="item" v-if="formValidate.auditStatus === 2 || formValidate.auditStatus === 3">
                  <div class="tips">{{ formValidate.auditStatus === 2 ? $t('order.rejectReason') : $t('community.closeReasonLabel') }}</div>
                  <div class="value">
                    {{ formValidate.refusal }}
                  </div>
                </div>
                <div class="item" v-if="formValidate.operateTime">
                  <div class="tips">{{ formValidate.auditStatus === 3 ? $t('community.closeTimeLabel') : $t('finance.auditTimeLabel') }}</div>
                  <div class="value">
                    {{ formValidate.operateTime }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('community.relatedProducts')" name="1">
            <el-table
              class="mt20"
              ref="tableList"
              row-key="id"
              :data="formValidate.productList"
              size="small"
              border
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" min-width="45" />
              <el-table-column min-width="180" :label="$t('product.productInfo')">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="demo-image__preview mr10 acea-row">
                      <el-image :src="scope.row.productImage" :preview-src-list="[scope.row.productImage]" />
                    </div>
                    <div class="row_title line2">{{ scope.row.productName }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="price" :label="$t('user.salePricePlaceholder')" width="120" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane :label="$t('community.commentList')" name="2">
            <el-table
              ref="tableList"
              row-key="id"
              :data="replyData.data"
              size="small"
              border
              class="mt20"
              style="width: 100%"
              :default-expand-all="isExpandAll"
              :tree-props="{ children: 'replyList', hasChildren: 'hasChildren' }"
            >
              <el-table-column prop="用户名/Id" label="ID" min-width="100">
                <template slot-scope="scope">
                  <span>{{ scope.row.nickname + '/' + scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="content" :label="$t('community.commentContent')" width="150" :show-overflow-tooltip="true" />
              <el-table-column prop="countReply" :label="$t('community.commentCount')" min-width="100" />
              <el-table-column prop="countStart" :label="$t('community.likesCount')" min-width="100" />
              <el-table-column :label="$t('community.commentTime')" min-width="150" prop="createTime" />
              <el-table-column :label="$t('common.operate')" width="120" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    @click="handleReplyDelete(scope.row.id, scope.$index)"
                    v-hasPermi="['platform:product:reply:delete']"
                    >{{ $t('common.delete') }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div class="block">
              <el-pagination
                :page-sizes="[20, 40, 60, 80]"
                :page-size="tableFromReply.limit"
                :current-page="tableFromReply.page"
                layout="total, sizes, prev, pager, next, jumper"
                :total="replyData.total"
                @size-change="handleSizeChangeReply"
                @current-change="pageChangeReply"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="demo-drawer__footer">
        <div v-show="isExamine" class="from-foot-btn drawer_fix">
          <div class="acea-row justify-content"></div>
        </div>
      </div>
    </el-drawer>
    <!--编辑星级-->
    <el-dialog :visible.sync="visible" :title="$t('community.editStar')" destroy-on-close :close-on-click-modal="false" width="540px">
      <el-rate v-model="star"></el-rate>
      <span slot="footer">
        <div class="dialog-btn-top">
          <el-button @click="visible = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button
            type="primary"
            v-debounceClick="
              () => {
                submitForm();
              }
            "
            >{{ $t('finance.confirmSpaced') }}</el-button
          >
        </div>
      </span>
    </el-dialog>
    <!--编辑分类-->
    <el-dialog
      :visible.sync="visibleCategory"
      :title="$t('merchant.editCategory')"
      destroy-on-close
      :close-on-click-modal="false"
      width="540px"
    >
      <el-select
        v-model="categoryId"
        clearable
        filterable
        :placeholder="$t('el.select.placeholder')"
        class="selectStyle"
        :key="'cate-edit-' + ($i18n.locale || '')"
      >
        <el-option
          v-for="item in cateSelect"
          :key="item.id"
          :label="getLocalizedTopicName(item)"
          :value="item.id"
          :disabled="item.isShow === 0"
        />
      </el-select>
      <span slot="footer">
        <div class="dialog-btn-top">
          <el-button @click="visibleCategory = false">{{ $t('el.messagebox.cancel') }}</el-button>
          <el-button
            type="primary"
            v-debounceClick="
              () => {
                submitFormCategory();
              }
            "
            >{{ $t('finance.confirmSpaced') }}</el-button
          >
        </div>
      </span>
    </el-dialog>
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
import * as community from '@/api/community';
import { checkPermi } from '@/utils/permission';
import { getLocalizedName } from '@/utils/localizedName';
import { filterEmpty } from '@/filters';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'communityTopic',
  directives: {
    // 计算是否滚动到最下面
    selectLoadMore: {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        SELECTWRAP_DOM.addEventListener(
          'scroll',
          function () {
            if (this.scrollHeight - this.scrollTop < this.clientHeight + 1) {
              binding.value();
            }
          },
          { passive: true },
        );
      },
    },
  },
  data() {
    return {
      currentTab: 0,
      tabActive: '',
      star: 0,
      visible: false,
      direction: 'rtl',
      // 是否展开，默认全部折叠
      isExpandAll: false,
      multiple: false,
      moren: '',
      isChecked: false,
      listLoading: true,
      tableData: {
        data: [],
        total: 0,
      },
      search: {
        limit: 10,
        page: 1,
        name: '',
      },
      tableFrom: {
        page: 1,
        limit: 20,
        auditStatus: 0,
        type: '',
        title: '',
        authorName: '',
        categoryId: '',
        topicId: '',
        searchType: 'all',
      },
      title: '',
      cateSelect: [],
      topicSelect: [],
      dialogVisible: false,
      loading: false,
      loadingAudit: false,
      isExamine: false, // 是否是审核
      community_id: '',
      //强制下架
      ruleForm: {
        id: 0,
        reason: '',
      },
      //评论列表分页
      tableFromReply: {
        page: 1,
        limit: 20,
        nid: 0,
      },
      //评论列表数据
      replyData: {
        data: [],
        total: 0,
      },
      id: 0,
      formValidate: {}, //详情
      //审核
      auditStatusFrom: {
        auditStatus: 0,
        id: 0,
        refusalReason: '',
      },
      loadingBtn: false,
      multipleSelectionAll: [],
      multipleSelection: [],
      idKey: 'id',
      visibleCategory: false, //分类弹窗
      categoryId: '', //分类
      noteIdList: [], //笔记列表id
    };
  },
  computed: {
    headeNum() {
      return [
        { title: this.$t('dashboard.awaitAudit'), type: '0' },
        { title: this.$t('el.table.clearFilter'), type: '10' },
      ];
    },
    statusList() {
      return [
        { label: this.$t('dashboard.awaitAudit'), value: 0 },
        { label: this.$t('common.approved'), value: 1 },
        { label: this.$t('common.rejected'), value: 2 },
        { label: this.$t('common.platformClosed'), value: 3 },
      ];
    },
    rules() {
      return {
        status: [{ required: true, message: this.$t('product.pleaseSelectAuditStatus'), trigger: 'change' }],
        refusal: [{ required: true, message: this.$t('product.pleaseEnterRejectReason'), trigger: 'blur' }],
      };
    },
  },
  mounted() {
    if (checkPermi(['platform:community:note:page:list'])) this.getList(1);
    this.getCateSelect();
    this.getTopicSelect();
  },
  methods: {
    filterEmpty,
    checkPermi,
    getLocalizedTopicName(row) {
      const locale =
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn';
      return getLocalizedName(row, locale);
    },
    getLocalizedCategoryName(row) {
      if (!row) return '';
      const cate = (this.cateSelect || []).find((c) => Number(c.id) === Number(row.categoryId));
      if (cate) return this.getLocalizedTopicName(cate);
      return this.getLocalizedTopicName({
        name: row.categoryName,
        nameJson: row.categoryNameJson,
      });
    },
    //审核拒绝
    cancelForm() {
      this.$modalPrompt('textarea', this.$t('product.rejectReason')).then((V) => {
        this.auditStatusFrom.refusalReason = V;
        this.onAuditSubmit();
      });
    },
    // 审核点击
    onAuditStatus(type) {
      this.auditStatusFrom.auditStatus = type;
      if (type === 1) {
        this.$modalSure(this.$t('community.approveContentConfirm')).then(() => {
          this.onAuditSubmit();
        });
      } else {
        this.cancelForm();
      }
    },
    //审核提交
    onAuditSubmit() {
      this.auditStatusFrom.id = this.community_id;
      community
        .communityNoteAuditApi(this.auditStatusFrom)
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
    //编辑星级
    submitForm() {
      community.communityStarUpdateApi({ id: this.id, star: this.star }).then((res) => {
        this.$message.success(this.$t('product.editSuccess'));
        this.visible = false;
        this.getList();
      });
    },
    handleClick(tab) {
      this.tabActive = tab.name;
      if (this.tabActive === '10') {
        this.tableFrom.auditStatus = '';
      } else {
        this.tableFrom.auditStatus = 0;
      }
      this.getList(1);
    },
    onClose() {
      this.dialogVisible = false;
    },
    // 评论列表；
    getReplyNoteList(id) {
      this.tableFromReply.nid = id;
      community.communityReplyNoteListApi(this.tableFromReply).then((res) => {
        this.replyData.total = res.total;
        this.replyData.data = res.list;
      });
    },
    pageChangeReply(page) {
      this.tableFromReply.page = page;
      this.getReplyNoteList(this.community_id);
    },
    handleSizeChangeReply(val) {
      this.tableFromReply.limit = val;
      this.getReplyNoteList(this.community_id);
    },
    //评论删除
    handleReplyDelete(id) {
      this.$modalSure(this.$t('community.deleteComment')).then(() => {
        community.communityReplyDelApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getReplyNoteList(this.community_id);
        });
      });
    },
    // 分类列表；
    getCateSelect() {
      community
        .communityCategoryListApi({
          limit: 100,
          page: 1,
        })
        .then((res) => {
          this.cateSelect = res.list;
        });
    },
    // 下拉加载更多
    selectLoadMore() {
      this.search.page = this.search.page + 1;
      if (this.search.page > this.totalPage) return;
      this.getTopicSelect(); // 请求接口
    },
    // 远程搜索
    remoteMethod(query) {
      this.loading = true;
      this.search.name = query;
      this.search.page = 1;
      this.topicSelect = [];
      setTimeout(() => {
        this.loading = false;
        this.getTopicSelect(); // 请求接口
      }, 200);
    },
    // 话题列表；
    getTopicSelect() {
      community.communityTopicListApi(this.search).then((res) => {
        this.totalPage = res.totalPage;
        this.total = res.total;
        this.topicSelect = this.topicSelect.concat(res.list);
      });
    },
    //批量移动
    categoryBatch() {
      if (this.noteIdList.length === 0) return this.$message.warning(this.$t('community.pleaseSelectAtLeastOneContent'));
      this.visibleCategory = true;
    },
    //批量移动提交
    submitFormCategory() {
      if (this.categoryId === 0) return this.$message.warning(this.$t('community.pleaseSelectTargetCategory'));
      community
        .communitycCategoryBatchApi({
          categoryId: this.categoryId,
          noteIdList: this.noteIdList,
        })
        .then((res) => {
          this.$message.success(this.$t('community.moveSuccess'));
          this.visibleCategory = false;
          this.getList();
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      setTimeout(() => {
        this.changePageCoreRecordData();
        let data = [];
        if (this.multipleSelectionAll.length) {
          this.multipleSelectionAll.map((item) => {
            data.push(item.id);
          });
        }
        this.noteIdList = data;
      }, 50);
    },
    // 设置选中的方法
    setSelectRow() {
      if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
        return;
      }
      // 标识当前行的唯一键的名称
      let idKey = this.idKey;
      let selectAllIds = [];
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
    // 记忆选择核心方法
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      let idKey = this.idKey;
      let that = this;
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.multipleSelectionAll.length <= 0) {
        this.multipleSelectionAll = this.multipleSelection;
        return;
      }
      // 总选择里面的key集合
      let selectAllIds = [];
      this.multipleSelectionAll.forEach((row) => {
        selectAllIds.push(row[idKey]);
      });
      let selectIds = [];
      // 获取当前页选中的id
      this.multipleSelection.forEach((row) => {
        selectIds.push(row[idKey]);
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(row[idKey]) < 0) {
          that.multipleSelectionAll.push(row);
        }
      });
      let noSelectIds = [];
      // 得到当前页没有选中的id
      this.tableData.data.forEach((row) => {
        if (selectIds.indexOf(row[idKey]) < 0) {
          noSelectIds.push(row[idKey]);
        }
      });
      noSelectIds.forEach((id) => {
        if (selectAllIds.indexOf(id) >= 0) {
          for (let i = 0; i < that.multipleSelectionAll.length; i++) {
            if (that.multipleSelectionAll[i][idKey] == id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.multipleSelectionAll.splice(i, 1);
              break;
            }
          }
        }
      });
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableFrom.title = encodeURIComponent(this.title);
      community
        .communityNoteListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.$nextTick(function () {
            this.setSelectRow(); //调用跨页选中方法
          });
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    reset() {
      this.tableFrom.auditStatus = '';
      this.tableFrom.type = '';
      this.tableFrom.title = '';
      this.tableFrom.authorName = '';
      this.tableFrom.categoryId = '';
      this.tableFrom.topicId = '';
      this.title = '';
      this.tableFrom.content = '';
      this.tableFrom.searchType = 'all';
      this.getList(1);
    },
    pageChange(page) {
      this.changePageCoreRecordData();
      this.tableFrom.page = page;
      this.getList('');
    },
    handleSizeChange(val) {
      this.changePageCoreRecordData();
      this.tableFrom.limit = val;
      this.getList('');
    },
    // 编辑
    onEdit(row) {
      this.star = row.star;
      this.id = row.id;
      this.visible = true;
    },
    // 查看评论
    onReply(id) {
      this.$router.push({
        path: 'reply',
        query: {
          community_id: id,
        },
      });
    },
    // 审核
    onAudit(id, bl) {
      this.loadingAudit = true;
      this.currentTab = 0;
      this.getReplyNoteList(id);
      this.community_id = id;
      this.dialogVisible = true;
      this.isExamine = bl;
      community.communityNoteDetailApi(id).then((res) => {
        this.formValidate = res;
        this.loadingAudit = false;
      });
    },
    // 强制下架
    onOff(id) {
      this.$modalPrompt('textarea', this.$t('community.forceOffReason')).then((V) => {
        this.ruleForm.reason = V;
        this.submit(id);
      });
    },
    submit(id) {
      this.ruleForm.id = id;
      community.communityNoteForcedDownApi(this.ruleForm).then((res) => {
        this.$message.success(this.$t('user.offShelfSuccess'));
        this.getList();
      });
    },
    onSubmit() {
      community
        .communityAuditApi(this.community_id, this.ruleForm)
        .then((res) => {
          this.$message.success(res.message);
          this.dialogVisible = false;
          this.getList('');
        })
        .catch((res) => {
          this.$message.error(res.message);
        });
    },
    //强制关闭评论
    onReplyOff(row) {
      this.$modalSure(
        row.replyStatus !== 3
          ? this.$t('community.closeCommentsConfirm')
          : this.$t('community.cancelCloseCommentsConfirm'),
      ).then(() => {
        community.communityNoteReplyOffApi(row.id).then(() => {
          this.$message.success(this.$t('merchant.closeSuccess'));
          this.getList();
        });
      });
    },
    // 删除
    handleDelete(id) {
      this.$modalSure(this.$t('community.deleteContentConfirm')).then(() => {
        community.communityNoteDelApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    onchangeIsShow(row) {
      community.communityNoteReplyOffApi(row.replyStatus).then(() => {
        this.getList('');
        this.$message.success(this.$t('product.operateSuccess'));
      });
    },
  },
};
</script>

<style scoped tips="scss">
.detailSection {
  border: none !important;
}

::v-deep .el-drawer__header {
  display: none;
}

.icon-shipinico {
  font-size: 50px;
}

.box-container {
  overflow: hidden;
}

.box-container .list {
  float: left;
  line-height: 40px;
}

.box-container .sp {
  width: 50%;
}

.box-container .sp3 {
  width: 33.3333%;
}

.box-container .sp100 {
  width: 100%;
}

.box-container .list .name {
  display: inline-block;
  width: 150px;
  text-align: right;
  color: #606266;
}

.box-container .list.image {
  margin-bottom: 40px;
}

.box-container .list.image img {
  position: relative;
  top: 40px;
}

::v-deep.el-form-item__content .el-rate {
  position: relative;
  top: 8px;
}

.selectStyle {
  width: 100%;
  padding-bottom: 20px;
}

::v-deep .el-image__preview {
  object-fit: contain;
}
</style>
