<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-if="checkPermi(['merchant:mp:live:room:list'])"
    >
      <div class="padding-add">
        <el-form size="small" inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('menu.showStatus')">
            <el-select
              v-model="tableForm.storeShow"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option
                v-for="item in studioShowStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.liveStatusColon')">
            <el-select
              v-model="tableForm.liveStatus"
              :placeholder="$t('common.pleaseSelect')"
              class="filter-item selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option v-for="item in studioStatusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.liveSearchLabel')">
            <el-input
              v-model="keywords"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('marketing.liveSearchWithPhone')"
              class="selWidth"
              size="small"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs class="list-tabs mb5" v-model="reviewStatus" @tab-click="getList(1)">
        <el-tab-pane name=" " :label="$t('common.all')"></el-tab-pane>
        <el-tab-pane name="0" :label="$t('product.platformPendingAudit')"></el-tab-pane>
        <el-tab-pane name="1" :label="$t('product.platformAuditFailed')"></el-tab-pane>
        <el-tab-pane name="3" :label="$t('product.wechatAuditSuccess')"></el-tab-pane>
        <el-tab-pane name="2" :label="$t('product.wechatAuditFailed')"></el-tab-pane>
      </el-tabs>
      <router-link v-hasPermi="['merchant:mp:live:room:create']" :to="{ path: '/marketing/broadcast/creatRoom' }">
        <el-button class="mr10" size="small" type="primary">{{ $t('marketing.addLiveRoom') }}</el-button>
      </router-link>
      <el-popover placement="bottom" width="200" trigger="click">
        <el-image :src="code"></el-image>
        <el-button size="small" slot="reference">{{ $t('marketing.becomeHost') }}</el-button>
      </el-popover>
      <el-table v-loading="listLoading" :data="tableData.data" class="mt20" size="small" highlight-current-row>
        <el-table-column prop="id" label="ID" width="40" />
        <el-table-column prop="roomName" :label="$t('marketing.liveName')" min-width="130" />
        <el-table-column prop="anchorName" :label="$t('marketing.hostNickname')" min-width="90" />
        <el-table-column prop="anchorWechat" :label="$t('marketing.hostWechat')" min-width="100" />
        <el-table-column key="15" :label="$t('marketing.officialInclusion')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:mp:live:room:isfeedspublic'])"
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
        <el-table-column key="16" :label="$t('marketing.mute')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:mp:live:room:updatecomment'])"
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
        <el-table-column key="17" :label="$t('marketing.customerServiceSwitch')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:mp:live:room:closekf'])"
              :disabled="scope.row.liveStatus == 101 && scope.row.reviewStatus === 3"
              v-model="scope.row.closeKf"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeIsKf(scope.row)"
            />
            <div v-else>{{ scope.row.closeKf === 1 ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column key="18" :label="$t('marketing.replay')" min-width="100">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['merchant:mp:live:room:updatereplay'])"
              :disabled="scope.row.liveStatus !== 101"
              v-model="scope.row.liveReplay"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeCloseReplay(scope.row)"
            />
            <div v-else>{{ scope.row.liveReplay === 1 ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.mallDisplay')" min-width="90">
          <template slot-scope="scope">
            <span v-if="scope.row.storeShow === 1">{{ $t('common.show') }}</span>
            <span v-else>{{ $t('common.close') }}</span>
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
              <el-tag class="doingTag tag-background" v-if="scope.row.reviewStatus === 0">{{ $t('product.listAwaitAudit') }}</el-tag>
              <el-tag class="endTag tag-background" v-if="scope.row.reviewStatus === 3">{{ $t('product.wechatAuditSuccess') }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" min-width="150" :label="$t('marketing.liveStartTime')" />
        <el-table-column prop="endTime" min-width="150" :label="$t('marketing.livePlanEndTime')" />

        <!--<el-table-column label="直播商品" min-width="100">-->
        <!--<template slot-scope="scope">-->
        <!--<el-button key="4" type="text" size="small" @click="handleImport(scope.row)"-->
        <!--&gt;导入</el-button-->
        <!--&gt;-->
        <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <router-link
              v-hasPermi="['merchant:mp:live:room:info']"
              :to="{ path: `/marketing/broadcast/creatRoom/${scope.row.id}/detail` }"
            >
              <a size="small">{{ $t('common.detail') }}</a>
            </router-link>
            <template
              v-if="
                Number(scope.row.liveStatus) < 103 &&
                scope.row.reviewStatus === 3 &&
                scope.row.closeGoods === 1 &&
                checkPermi(['merchant:mp:live:room:addgoods'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleImport(scope.row)">{{ $t('marketing.importProduct') }}</a>
            </template>
            <template
              v-if="
                scope.row.reviewStatus === 3 &&
                checkPermi(['merchant:mp:live:room:mangerass', 'merchant:mp:live:room:getass'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="onEditAssistant(scope.row)">{{ $t('marketing.editAssistant') }}</a>
            </template>
            <!--<el-button type="text" size="small" class="mr10" @click="onSharecode(scope.row.id)">直播间二维码</el-button>-->
            <!--<el-button type="text" size="small" class="mr10" @click="onPushMessage(scope.row.id)">推送商品</el-button> -->
            <!--v-if="scope.row.liveStatus === 102 && (scope.row.status === -1 || scope.row.status === 0)"-->
            <template
              v-if="
                scope.row.liveStatus === 102 &&
                scope.row.reviewStatus === 1 &&
                scope.row.liveStatus === '' &&
                checkPermi(['merchant:mp:live:room:edit'])
              "
            >
              <el-divider direction="vertical"></el-divider>
              <router-link :to="{ path: `/marketing/broadcast/creatRoom/${scope.row.id}` }">
                <a>{{ $t('common.edit') }}</a>
              </router-link>
            </template>
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['merchant:mp:live:room:delete']" @click="handleDelete(scope.row, scope.$index)">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="$constants.page.limit"
          :page-size="tableForm.limit"
          :current-page="tableForm.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <!--编辑小助手-->
    <el-dialog v-if="dialogVisible" :title="$t('product.productInfo')" :visible.sync="dialogVisible" width="700px">
      <div v-loading="loading">
        <div class="box-container">
          <div class="list">
            <label class="name">{{ $t('marketing.assistantLabel') }}</label>
            <el-select
              class="selWidth"
              clearable
              filterable
              v-model="users"
              v-selectLoadMore="selectLoadMore"
              :loading="loading"
              remote
              multiple
              :remote-method="remoteMethod"
              :placeholder="$t('marketing.pleaseSelectAssistant')"
            >
              <el-option
                v-for="user in assistantList"
                :key="user.id"
                :label="user.wechatNickname + '/' + user.wechat"
                :value="user.id"
              >
              </el-option>
            </el-select>
            <el-button size="small" type="primary" style="width: 80px" @click="handleAssistant">{{ $t('common.confirmPrefix') }}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <!--导入直播商品-->
    <el-dialog :title="$t('product.productInfo')" :visible.sync="importVisible" width="1000px">
      <import-goods @getGoodList="getGoodList" ref="uploadGoods" v-if="importVisible" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit">{{ $t('product.confirmSpace') }}</el-button>
      </span>
    </el-dialog>
    <!--分享二维码-->
    <el-dialog
      :title="$t('marketing.liveShareQr')"
      :visible.sync="sharecodeVisible"
      width="1000px"
      :before-close="handleClose('sharecodeVisible')"
    >
      <div v-loading="loading" class="demo-image__preview">
        <el-image style="width: 100px; height: 100px" :src="sharecode" :preview-src-list="[sharecode]"> </el-image>
      </div>
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
import {
  liveRoomEditasstoroomeApi,
  liveRoomListApi,
  liveRoomDeleteApi,
  liveRoomGoodslistApi,
  liveAssistantListApi,
  liveRoomAddasstoroomeApi,
  liveRoomAddgoodsApi,
  liveRoomIsFeedsPublicApi,
  liveRoomUpdatecommentApi,
  studioPushMessageApi,
  liveRoomUpdateclosekfApi,
  liveRoomGetsharecodeApi,
  liveRoomGetassApi,
  liveRoomRemoveasstoroomeApi,
  liveRoomMangerassApi,
  liveRoomUpdatereplayApi,
} from '@/api/marketing';
import importGoods from './importGoods';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'StudioList',
  directives: {
    // 计算是否滚动到最下面
    selectLoadMore: {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          if (this.scrollHeight - this.scrollTop < this.clientHeight + 1) {
            binding.value();
          }
        });
      },
    },
  },
  components: { importGoods },
  data() {
    return {
      loadingBtn: false,
      loading: false,
      Loading: false,
      dialogVisible: false, //编辑小助手弹窗
      importVisible: false, //导入商品弹窗
      listLoading: true,
      studioShowStatusList: [
        { label: this.$t('common.show'), value: 1 },
        { label: this.$t('common.close'), value: 0 },
      ],
      studioStatusList: [
        { label: this.$t('product.liveStreaming'), value: '101' },
        { label: this.$t('common.ended'), value: '103' },
        { label: this.$t('common.notStarted'), value: '102' },
        { label: this.$t('product.banned'), value: '104' },
        { label: this.$t('product.paused'), value: '105' },
        { label: this.$t('product.abnormal'), value: '106' },
        { label: this.$t('product.expiredOver'), value: '107' },
      ],
      tableData: { data: [], total: 0 },
      tableForm: {
        page: 1,
        limit: this.$constants.page.limit[0],
        reviewStatus: null,
        liveStatus: null,
        keywords: '',
        storeShow: '',
      },
      reviewStatus: null,
      keywords: '',
      roomId: '',
      liveRoomStatus: '',
      roomInfo: {},
      search: {
        //小助手
        limit: this.$constants.page.limit[0],
        page: 1,
        keywords: '',
      },
      assistantList: [], //小助手列表
      users: [], //小助手id集合
      goodList: [], //导入商品id集合
      sharecode: '', //分享二维码
      sharecodeVisible: false, //直播间分享码显示隐藏
      assistant: '', //直播间小助手 id
      code: 'https://res.wx.qq.com/op_res/9rSix1dhHfK4rR049JL0PHJ7TpOvkuZ3mE0z7Ou_Etvjf-w1J_jVX0rZqeStLfwh', //主播码
    };
  },
  mounted() {
    if (checkPermi(['merchant:mp:live:room:list'])) this.getList();
    this.getAssistantList();
  },
  methods: {
    checkPermi,
    //获取直播间二维码
    onSharecode(id) {
      this.sharecodeVisible = true;
      this.loading = true;
      liveRoomGetsharecodeApi(id)
        .then((res) => {
          this.sharecode = res;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    //获取导入商品id集合
    getGoodList(goodList) {
      this.goodList = goodList;
    },
    //导入商品提交
    onSubmit() {
      if (!this.goodList.length) return this.$message.warning(this.$t('marketing.selectProductSubmit'));
      liveRoomAddgoodsApi({
        id: this.roomId,
        ids: this.goodList,
      }).then((res) => {
        this.importVisible = false;
        this.$message.success(this.$t('marketing.importProductSuccess'));
        this.getList();
      });
    },
    // 关闭导入商品
    handleClose(n) {
      this[n] = false;
    },
    //添加小助手
    handleAssistant() {
      liveRoomMangerassApi({
        id: this.roomId,
        assid: this.users,
      })
        .then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.dialogVisible = false;
        })
        .catch((res) => {
          this.dialogVisible = false;
        });
    },
    // 下拉加载更多
    selectLoadMore() {
      this.search.page = this.search.page + 1;
      if (this.search.page > this.totalPage) return;
      this.getAssistantList(); // 请求接口
    },
    // 远程搜索
    remoteMethod(query) {
      this.loading = true;
      this.search.keywords = query;
      this.search.page = 1;
      this.assistantList = [];
      setTimeout(() => {
        this.loading = false;
        this.getMerList(); // 请求接口
      }, 200);
    },
    // 小助手列表
    getAssistantList() {
      liveAssistantListApi(this.search).then((res) => {
        this.totalPage = res.totalPage;
        this.total = res.total;
        this.assistantList = this.assistantList.concat(res.list);
      });
    },
    //直播间商品列表
    roomGoodslist() {
      liveRoomGoodslistApi(this.roomId).then(() => {
        this.$message.success(this.$t('product.deleteSuccess'));
        this.tableData.data.splice(idx, 1);
      });
    },
    // 导入
    handleImport(row) {
      this.roomId = row.id;
      this.importVisible = true;
    },
    // 编辑助手
    onEditAssistant(row) {
      this.assistant = row.assistant;
      this.users = [];
      this.roomId = row.id;
      this.getModifyass();
      this.dialogVisible = true;
      // this.$modalForm(studioEditAssistant(id)).then(() => this.getList(''));
    },
    //查询直播间小助手
    getModifyass() {
      liveRoomGetassApi(this.roomId).then((res) => {
        res.map((item) => {
          this.users.push(item.id);
        });
      });
    },
    // 删除
    handleDelete(item, idx) {
      this.$modalSure(this.$t('marketing.liveRoomDeleteConfirm')).then(() => {
        liveRoomDeleteApi(item.id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableForm);
          this.getList();
        });
      });
    },
    // 推送消息
    onPushMessage(id) {
      this.$confirm(this.$t('marketing.pushToSubscribersConfirm'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirmPrefix'),
        cancelButtonText: this.$t('common.cancel'),
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
    // 编辑
    onEdit(id) {
      //this.$modalForm(studioEdit(id)).then(() => this.getList(''));
    },
    handleReset() {
      this.tableForm.limit = this.$constants.page.limit[0];
      this.tableForm.liveStatus = null;
      this.tableForm.keywords = '';
      this.tableForm.storeShow = '';
      this.keywords = '';
      this.getList(1);
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableForm.page = num ? num : this.tableForm.page;
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
      liveRoomUpdatereplayApi(row.id, row.liveReplay).then(() => {
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
    // 禁言
    onchangeIsCommen(row) {
      liveRoomUpdatecommentApi(row.id, row.closeComment).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList('');
      });
    },
    // 客服
    onchangeIsKf(row) {
      liveRoomUpdateclosekfApi(row.id, row.closeKf).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList('');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.modalbox {
  ::v-deep.el-dialog {
    min-width: 550px;
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
