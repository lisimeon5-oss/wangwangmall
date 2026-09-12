<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:groupbuy:activity:list']"
    >
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('marketing.activityNameLabel')">
            <el-input v-model="formData.groupName" :placeholder="$t('marketing.pleaseEnterActivityName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityProgressLabel')" class="inline">
            <el-select
              @change="selectChange"
              v-model="formData.groupProcess"
              clearable
              :placeholder="$t('marketing.pleaseSelectActivityProgress')"
              class="selWidth"
            >
              <el-option :label="$t('common.notStarted')" value="0" />
              <el-option :label="$t('common.ongoing')" value="1" />
              <el-option :label="$t('common.ended')" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityDateLabel')" class="inline">
            <el-date-picker
              @change="selectChange"
              class="selWidth"
              v-model="formData.startTime"
              type="date"
              :placeholder="$t('user.chooseDate')"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityStatusLabel')" class="inline">
            <el-select
              @change="selectChange"
              v-model="formData.activityStatus"
              clearable
              :placeholder="$t('marketing.pleaseSelectActivityStatus')"
              class="selWidth"
            >
              <el-option :label="$t('common.open')" value="1" />
              <el-option :label="$t('common.close')" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('merchant.merchantCategoryLabel')" class="inline">
            <el-select
              @change="selectChange"
              v-model="formData.categoryId"
              clearable
              size="small"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
            >
              <el-option v-for="item in merchantClassify" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('product.merchantNameLabel')">
            <el-input v-model="formData.merName" :placeholder="$t('merchant.pleaseEnterMerchantName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="search">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs v-if="hedaList.length" @tab-click="getTabList" v-model="formData.groupStatus" class="list-tabs">
        <el-tab-pane :label="$t('marketing.tabApprovedCount', { count: hedaList[2].count })" name="4" />
        <el-tab-pane :label="$t('marketing.tabPendingAuditCount', { count: hedaList[1].count })" name="3" />
        <el-tab-pane :label="$t('marketing.tabRejectedCount', { count: hedaList[0].count })" name="1" />
      </el-tabs>
      <el-table :data="tableData" size="small" ref="multipleTable" row-key="id" class="mt20 tableSelection">
        <el-table-column label="ID" prop="id" width="60" />
        <el-table-column :label="$t('marketing.activityName')" min-width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedGroupName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityTime')" prop="time" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.startTime }} {{ $t('marketing.timeTo') }} {{ scope.row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.createMerchant')" min-width="120">
          <template slot-scope="scope">{{ localizedMerName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.formedCount')" prop="buyCount" />
        <el-table-column :label="$t('marketing.activityProgress')" prop="doing">
          <template slot-scope="scope">
            <span v-if="scope.row.groupProcess == 0">{{ $t('common.notStarted') }}</span>
            <span v-if="scope.row.groupProcess == 1">{{ $t('common.ongoing') }}</span>
            <span v-if="scope.row.groupProcess == 2">{{ $t('common.ended') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.joinProductCount')" prop="productCount" />
        <el-table-column :label="$t('marketing.startedGroupCount')" prop="totalActivityBegin" :render-header="totalActivityBeginHeader" />
        <el-table-column :label="$t('marketing.formedGroupCount')" prop="totalActivityDone" :render-header="totalActivityDoneHeader" />
        <el-table-column
          :label="$t('marketing.joinGroupOrderCount')"
          prop="totalOrderBegin"
          min-width="100"
          :render-header="totalOrderBeginHeader"
        />
        <el-table-column
          :label="$t('marketing.formedOrderCount')"
          prop="totalOrderDone"
          min-width="100"
          :render-header="totalOrderDoneHeader"
        />
        <el-table-column :label="$t('product.rejectReason')" prop="refusal" v-if="formData.groupStatus == 1" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.refusal || $t('marketing.platformForceClose') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityStatus')" prop="status">
          <template slot-scope="scope">
            <span v-if="scope.row.activityStatus == 1">{{ $t('common.open') }}</span>
            <span v-if="scope.row.activityStatus == 0">{{ $t('common.close') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" prop="operate" min-width="155">
          <template slot-scope="scope">
            <a @click="toDeatil(scope.row)" v-hasPermi="['platform:groupbuy:activity:info']">{{ $t('common.detail') }}</a>
            <el-divider v-if="scope.row.groupStatus != 1" direction="vertical"></el-divider>
            <a
              v-if="scope.row.groupStatus == 4"
              @click="close(scope.row)"
              v-hasPermi="['platform:groupbuy:activity:review:close']"
              >{{ $t('marketing.forceClose') }}</a
            >
            <a
              v-if="scope.row.groupStatus == 3"
              @click="toDeatil(scope.row)"
              v-hasPermi="['platform:groupbuy:activity:review:pass']"
              >{{ $t('finance.audit') }}</a
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-size="formData.limit"
          :current-page="formData.page"
          :total="total"
          :page-sizes="[20, 40, 60, 80]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <!-- 活动详情 -->
    <activityDetail ref="detail" @changeList="getTabList"></activityDetail>
  </div>
</template>

<script>
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { mapGetters } from 'vuex';
import activityDetail from './detail.vue';
import { groupActivityList, groupActivityCount, groupActivityInfo, groupActivityClose } from '@/api/group';
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  components: {
    activityDetail,
  },
  data() {
    return {
      tableData: [],
      formData: {
        activityStatus: '',
        categoryId: '',
        groupName: '',
        groupProcess: '',
        groupStatus: '4',
        limit: 20,
        merName: '',
        page: 1,
        startTime: '',
      },
      hedaList: [],
      total: 0,
    };
  },
  computed: {
    ...mapGetters(['merchantClassify']),
  },
  created() {
    if (!this.merchantClassify.length) this.$store.dispatch('merchant/getMerchantClassify');
    if (checkPermi(['platform:groupbuy:activity:list'])) this.getList();
  },
  methods: {
    localizedGroupName(row) {
      return getLocalizedText(row.groupName, row.groupNameJson, getUiLocale(this));
    },
    localizedMerName(row) {
      return getLocalizedText(row.merName, row.merNameJson, getUiLocale(this));
    },
    selectChange() {
      this.formData.page = 1;
      this.getList();
    },
    search() {
      this.formData.page = 1;
      this.getList();
    },
    totalOrderDoneHeader(h, { column }) {
      return this.headerText(
        h,
        column,
        this.$t('marketing.formedOrderCountTip'),
      );
    },
    totalOrderBeginHeader(h, { column }) {
      return this.headerText(h, column, this.$t('marketing.joinGroupOrderCountTip'));
    },
    totalActivityDoneHeader(h, { column }) {
      return this.headerText(h, column, this.$t('marketing.formedGroupCountTip'));
    },
    // 开团提示
    totalActivityBeginHeader(h, { column }) {
      return this.headerText(h, column, this.$t('marketing.startedGroupCountTip'));
    },
    headerText(h, column, text) {
      const serviceContent = [
        h(
          'div',
          {
            slot: 'content',
          },
          text,
        ),
      ];
      return h('div', [
        h('span', column.label),
        h(
          'el-tooltip',
          {
            props: {
              placement: 'top',
            },
          },
          [
            serviceContent,
            h('i', {
              class: 'el-icon-warning-outline',
              style: 'color:#999;margin-left:5px;',
            }),
          ],
        ),
      ]);
    },
    handleSizeChange(val) {
      this.formData.limit = val;
      this.getList();
    },
    pageChange(page) {
      this.formData.page = page;
      this.getList();
    },
    getHead() {
      groupActivityCount(this.formData).then((res) => {
        this.hedaList = res;
      });
    },
    getTabList() {
      this.formData.page = 1;
      this.getList();
    },
    getList() {
      groupActivityList(this.formData).then((res) => {
        this.tableData = res.list;
        this.total = res.total;
        this.getHead();
      });
    },
    //详情
    toDeatil(row) {
      groupActivityInfo(row.id).then((res) => {
        this.$refs.detail.activityInfo = res;
        this.$refs.detail.dialogVisible = true;
      });
    },
    //关闭
    close(row) {
      this.$modalSure(this.$t('marketing.forceCloseConfirm')).then(() => {
        groupActivityClose(row.id).then((res) => {
          this.$message({
            type: 'success',
            message: this.$t('marketing.closeSuccessExcl'),
          });
          this.getList();
        });
      });
    },
    //重置
    reset() {
      this.formData.activityStatus = '';
      this.formData.categoryId = '';
      this.formData.groupName = '';
      this.formData.groupProcess = '';
      this.formData.groupStatus = '4';
      this.formData.merName = '';
      this.formData.page = 1;
      this.formData.startTime = '';
      this.getList();
    },
  },
};
</script>

<style lang="scss" scoped></style>
