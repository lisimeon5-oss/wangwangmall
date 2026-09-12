<template>
  <div class="divBox">
    <el-card
      v-hasPermi="['platform:community:reply:page:list']"
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form :inline="true" label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.userSearchLabel')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item :label="$t('product.timeSelectLabel')">
            <el-date-picker
              @change="onchangeTime"
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('product.customTime')"
              class="selWidth"
            ></el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('finance.auditStatusLabel')">
            <el-select
              v-model="tableFrom.auditStatus"
              :placeholder="$t('el.select.placeholder')"
              size="small"
              class="selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('community.contentTitleLabel')">
            <el-input
              v-model.trim="title"
              :placeholder="$t('content.pleaseEnterArticleTitle')"
              class="selWidth"
              size="small"
              @keyup.enter.native="getList(1)"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('community.commentContentLabel')">
            <el-input
              v-model.trim="keywords"
              :placeholder="$t('community.pleaseEnterCommentContent')"
              class="selWidth"
              size="small"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" :bordered="false" shadow="never">
      <el-table :data="tableData.data" size="small">
        <el-table-column prop="id" label="ID" width="50" />
        <el-table-column :label="$t('community.usernameID')" min-width="150">
          <template slot-scope="{ row }">
            <span>{{ row.userNickname + ' / ' + row.uid }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="noteTitle" :label="$t('content.articleTitle')" min-width="120" :show-overflow-tooltip="true" />
        <el-table-column prop="content" :label="$t('community.commentContent')" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column prop="countReply" :label="$t('community.commentCount')" min-width="100" />
        <el-table-column prop="countStart" :label="$t('community.likesCount')" min-width="100" />
        <el-table-column :label="$t('community.commentTime')" min-width="150" prop="createTime" />
        <el-table-column :label="$t('product.auditStatus')" min-width="100">
          <template slot-scope="scope">
            <span class="tag-background" :class="tagClass[scope.row.auditStatus]">{{
              scope.row.auditStatus | communityStatusFilter
            }}</span>
            <span v-if="scope.row.auditStatus == 2" style="display: block; font-size: 12px; color: red"
              >{{ $t('common.reasonLabel') }}{{ scope.row.refusal }}</span
            >
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <a @click="onAudit(scope.row, 'info')">{{ $t('common.detail') }}</a>
            <el-divider direction="vertical"></el-divider>
            <template v-if="scope.row.auditStatus === 0 && checkPermi(['platform:community:reply:audit'])">
              <a @click="onAudit(scope.row, 'audit')">{{ $t('finance.audit') }}</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <a @click="handleDelete(scope.row.id, scope.$index)" v-hasPermi="['platform:community:reply:delete']"
              >{{ $t('common.delete') }}</a
            >
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

    <!--审核 详情-->
    <el-drawer
      custom-class="demo-drawer"
      direction="rtl"
      :visible.sync="dialogVisible"
      size="1000px"
      @close="onClose()"
    >
      <div class="detailHead">
        <div class="acea-row row-between headerBox">
          <div class="full">
            <div class="order_icon"><span class="iconfont icon-daipingjia-2"></span></div>
            <div class="text">
              <div class="title">{{auditType === 'audit'? $t('community.commentAudit'):$t('community.commentDetail')}}</div>
              <div>
                <span class="mr20">{{ $t('community.auditResultLabel') }}{{ commentsInfo.auditStatus | communityStatusFilter }}</span>
              </div>
            </div>
          </div>
          <div v-if="auditType === 'audit'" class="acea-row justify-content">
            <el-button
              v-hasPermi="['platform:community:reply:audit']"
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
              v-hasPermi="['platform:community:reply:audit']"
              v-debounceClick="
                () => {
                  onAuditStatus(1);
                }
              "
              >{{ loadingBtnSuccess ? $t('finance.submitting') : $t('finance.auditPassed') }}</el-button
            >
          </div>
        </div>
      </div>
      <div class="demo-drawer__content detailSection" v-loading="loading">
        <ul class="list">
          <li class="item">
            <div class="lang">{{ $t('order.userNickname') }}</div>
            <div class="value">{{ commentsInfo.userNickname }}</div>
          </li>
          <li class="item">
            <div class="tips">{{ $t('community.userIdLabel') }}</div>
            <div class="value">{{ commentsInfo.uid }}</div>
          </li>
          <li class="item">
            <div class="tips">{{ $t('community.commentTypeLabel') }}</div>
            <div class="value">{{ commentsInfo.type === 1 ? $t('community.comment') : $t('community.reply') }}</div>
          </li>
          <li class="item">
            <div class="lang">{{ $t('community.commentCountLabel') }}</div>
            <div class="value">{{ commentsInfo.countReply }}</div>
          </li>
          <li class="item">
            <div class="tips">{{ $t('community.likesCountLabel') }}</div>
            <div class="value">{{ commentsInfo.countStart }}</div>
          </li>
        </ul>
        <div class="list" style="display: block">
          <div class="item">
            <div class="lang">{{ $t('community.contentLabel') }}</div>
            <div class="value">{{ commentsInfo.content }}</div>
          </div>
          <div v-show="commentsInfo.auditStatus === 2" class="item">
            <div class="lang">{{ $t('community.auditFailReasonLabel') }}</div>
            <div class="value">{{ commentsInfo.refusal }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import { communityReplyListApi, communityReplyDelApi, communityReplyAuditApi } from '@/api/community';
import { formatDates } from '@/utils/index';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'StoreComment',
  filters: {
    formatDate(time) {
      if (time !== 0) {
        const date = new Date(time * 1000);
        return formatDates(date, 'yyyy-MM-dd hh:mm');
      }
    },
  },
  data() {
    return {
      tagClass: ['doingTag', 'endTag', 'notStartTag'],
      loadingBtn: false,
      dialogVisible: false,
      props: {
        children: 'child',
        label: 'name',
        value: 'id',
        emitPath: false,
      },
      fromList: this.$constants.fromList,
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: false,
      tableFrom: {
        page: 1,
        limit: 20,
        auditStatus: '',
        dateLimit: '',
        keywords: '',
        userName: '',
        title: '',
        searchType: 'all',
        content: '',
      },
      keywords: '',
      title: '',
      timeVal: [],
      loading: false,
      uids: [],
      options: [],
      timer: '',
      commentsInfo: {},
      //审核
      auditStatusFrom: {
        auditStatus: 1,
        id: 0,
        refusalReason: '',
      },
      id: 0,
      loadingBtnSuccess: false, //审核成功通过
      auditType: '', //详情还是审核
    };
  },
  computed: {
    statusList() {
      return [
        { label: this.$t('dashboard.awaitAudit'), value: 0 },
        { label: this.$t('common.approved'), value: 1 },
        { label: this.$t('common.rejected'), value: 2 },
      ];
    },
  },
  watch: {
    $route(to, from) {
      this.getList();
    },
  },
  mounted() {
    if (checkPermi(['platform:community:reply:page:list'])) this.getList();
  },
  methods: {
    checkPermi,
    onClose() {
      this.dialogVisible = false;
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
      this.auditStatusFrom.id = this.id;
      if (this.auditStatusFrom.auditStatus === 1) {
        this.loadingBtnSuccess = true;
      } else {
        this.loadingBtn = true;
      }
      communityReplyAuditApi(this.auditStatusFrom)
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.dialogVisible = false;
          if (this.auditStatusFrom.auditStatus === 1) {
            this.loadingBtnSuccess = false;
          } else {
            this.loadingBtn = false;
          }
          this.getList();
        })
        .catch((res) => {
          if (this.auditStatusFrom.auditStatus === 1) {
            this.loadingBtnSuccess = false;
          } else {
            this.loadingBtn = false;
          }
        });
    },
    seachList() {
      this.tableFrom.page = 1;
      this.getList();
    },
    // 选择时间
    selectChange(tab) {
      this.timeVal = [];
      this.tableFrom.page = 1;
      this.getList();
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = e ? this.timeVal.join(',') : '';
      this.tableFrom.page = 1;
      this.getList();
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure(this.$t('community.deleteCommentConfirm')).then(() => {
        communityReplyDelApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    // 列表
    getList() {
      this.listLoading = true;
      this.tableFrom.title = encodeURIComponent(this.title);
      this.tableFrom.keywords = encodeURIComponent(this.keywords);
      communityReplyListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
        });
    },
    reset() {
      this.tableFrom.page = 1;
      this.tableFrom.auditStatus = '';
      this.tableFrom.dateLimit = '';
      this.tableFrom.keywords = '';
      this.tableFrom.userName = '';
      this.tableFrom.title = '';
      this.tableFrom.content = '';
      this.tableFrom.searchType = 'all';
      this.keywords = '';
      this.title = '';
      this.selectChange();
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList();
    },
    // 审核
    onAudit(row, type) {
      this.auditType = type;
      this.commentsInfo = row;
      this.id = row.id;
      this.dialogVisible = true;
    },
  },
};
</script>

<style scoped lang="scss">
.demo-drawer__content {
  padding: 25px 30px;
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
::v-deep.el-drawer__header {
  margin-bottom: 0 !important;
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
.tag-background {
  padding: 3px 8px;
}
</style>
