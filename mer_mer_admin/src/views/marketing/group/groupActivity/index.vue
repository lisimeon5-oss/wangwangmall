<template>
  <div class="divBox relative">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('marketing.activityNameLabel')">
            <el-input v-model="formData.groupName" :placeholder="$t('marketing.pleaseEnterActivityName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityProgressLabel')" class="inline">
            <el-select
              v-model="formData.groupProcess"
              clearable
              :placeholder="$t('marketing.pleaseSelectActivityProgress')"
              class="selWidth"
              @change="selectChange"
            >
              <el-option :label="$t('common.notStarted')" value="0" />
              <el-option :label="$t('common.ongoing')" value="1" />
              <el-option :label="$t('common.ended')" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityDateLabel')" class="inline">
            <el-date-picker
              class="selWidth"
              v-model="formData.startTime"
              type="date"
              :placeholder="$t('marketing.chooseDateTime')"
              value-format="yyyy-MM-dd"
              @change="timeChange"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityStatusLabel')" class="inline">
            <el-select
              v-model="formData.activityStatus"
              clearable
              :placeholder="$t('marketing.pleaseSelectActivityStatus')"
              class="selWidth"
              @change="selectChange"
            >
              <el-option :label="$t('common.open')" value="1" />
              <el-option :label="$t('common.close')" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="search">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs v-model="formData.groupStatus" class="list-tabs" @tab-click="handleClick">
        <el-tab-pane :label="$t('marketing.tabApprovedCount', { count: countArr.length && countArr[3].count })" name="4" />
        <el-tab-pane :label="$t('marketing.tabPendingAuditCount', { count: countArr.length && countArr[2].count })" name="3" />
        <el-tab-pane :label="$t('marketing.tabRejectedCount', { count: countArr.length && countArr[0].count })" name="1" />
        <el-tab-pane :label="$t('marketing.tabWithdrawnCount', { count: countArr.length && countArr[1].count })" name="2" />
      </el-tabs>
      <el-button type="primary" size="small" @click="toAdd" v-hasPermi="['merchant:groupbuy:activity:add']"
        >{{ $t('marketing.addActivity') }}</el-button
      >
      <el-table :data="tableData" size="small" ref="multipleTable" row-key="id" class="mt20 tableSelection">
        <el-table-column label="ID" prop="id" width="60"></el-table-column>
        <el-table-column :label="$t('marketing.activityName')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedGroupName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityTime')" min-width="150">
          <template slot-scope="scope"> {{ scope.row.startTime }} {{ $t('marketing.timeTo') }} {{ scope.row.endTime }} </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.formedCount')" prop="buyCount" />
        <el-table-column :label="$t('marketing.activityProgress')">
          <template slot-scope="scope">
            <el-tag
              size="mini"
              effect="plain"
              :type="scope.row.groupProcess == 0 ? 'success' : scope.row.groupProcess == 1 ? 'warning' : 'info'"
              >{{ groupProcessArr[scope.row.groupProcess] }}</el-tag
            >
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
            <el-switch
              v-if="checkPermi(['merchant:groupbuy:activity:change:status'])"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.activityStatus"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @change="changeStatus(scope.row, $event)"
            />
            <div v-else>{{ scope.row.activityStatus ? $t('common.show') : $t('product.hide') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" prop="operate" min-width="200">
          <template slot-scope="scope">
            <a @click="toDeatil(scope.row)" v-hasPermi="['merchant:groupbuy:activity:info']">{{ $t('common.detail') }}</a>
            <el-divider v-if="scope.row.groupStatus != 3" direction="vertical"></el-divider>
            <a
              v-if="scope.row.groupStatus != 3"
              @click="toUpdate(scope.row)"
              v-hasPermi="['merchant:groupbuy:activity:info']"
              >{{ $t('common.edit') }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <a @click="toCopy(scope.row)">{{ $t('marketing.copy') }}</a>
            <el-divider direction="vertical" v-if="formData.groupStatus == '3'"></el-divider>
            <template
              v-if="
                checkPermi(['merchant:groupbuy:activity:delete']) &&
                scope.row.groupStatus != 3 &&
                scope.row.activityStatus === 0
              "
            >
              <el-divider direction="vertical"></el-divider>
              <a @click="delGroup(scope.row)">{{ $t('common.delete') }}</a>
            </template>
            <a
              v-if="scope.row.groupStatus == 3"
              @click="rollback(scope.row)"
              v-hasPermi="['merchant:groupbuy:activity:rollback']"
              >{{ $t('marketing.withdraw') }}</a
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
    <activityDetail ref="detail"></activityDetail>
  </div>
</template>

<script>
import activityDetail from './detail.vue';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import {
  groupBuyList,
  groupBuyDelete,
  groupBuyInfo,
  groupBuyListCount,
  groupActivityStatus,
  groupbuyActivityRollback,
} from '@/api/group';
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  components: {
    activityDetail,
  },
  data() {
    return {
      tableData: [],
      formData: {
        page: 1,
        limit: 20,
        groupName: '',
        groupProcess: '',
        activityStatus: '',
        startTime: '',
        groupStatus: '4',
      },
      total: 0,
      countArr: [],
      groupProcessArr: [this.$t('common.notStarted'), this.$t('common.ongoing'), this.$t('common.ended')],
    };
  },
  created() {
    this.$route.params.type && (this.formData.groupStatus = this.$route.params.type);
    if (checkPermi(['merchant:groupbuy:activity:list'])) this.getData();
  },
  methods: {
    checkPermi,
    localizedGroupName(row) {
      return getLocalizedText(row.groupName, row.groupNameJson, getUiLocale(this));
    },
    search() {
      this.formData.page = 1;
      this.getData();
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
    //撤回
    rollback(row) {
      this.$modalSure(this.$t('marketing.withdrawActivityConfirm')).then(() => {
        groupbuyActivityRollback(row.id).then((res) => {
          this.$message({
            type: 'success',
            message: this.$t('marketing.withdrawSuccess'),
          });
          this.getData();
        });
      });
    },
    timeChange(e) {
      this.formData.page = 1;
      this.getData();
    },
    handleClick(tab, event) {
      this.formData.page = 1;
      this.getData();
    },
    selectChange() {
      this.formData.page = 1;
      this.getData();
    },
    //活动状态开关
    changeStatus(row, e) {
      groupActivityStatus({ id: row.id, status: e }).then((res) => {
        this.$message({
          type: 'success',
          message: this.$t('marketing.modifySuccessExcl'),
        });
      });
    },
    getData() {
      groupBuyList(this.formData).then((res) => {
        this.tableData = res.list;
        this.total = res.total;
        this.getCount();
      });
    },
    getCount() {
      groupBuyListCount(this.formData).then((res) => {
        this.countArr = res;
      });
    },
    //详情
    toDeatil(row) {
      groupBuyInfo(row.id).then((res) => {
        this.$refs.detail.groupInfo = res;
        this.$refs.detail.dialogVisible = true;
      });
    },
    //关闭
    delGroup(row) {
      this.$modalSure(this.$t('marketing.deleteActivityConfirm')).then(() => {
        groupBuyDelete(row.id).then((res) => {
          this.$message({
            type: 'success',
            message: this.$t('marketing.deleteSuccessExcl'),
          });
          this.getData();
        });
      });
    },
    //添加活动
    toAdd() {
      this.$router.push({
        path: '/marketing/group/createGroup',
      });
    },
    //编辑活动  type=1编辑 2 复制
    toUpdate(row) {
      this.$router.push({ path: `/marketing/group/createGroup/${row.id}/1` });
    },
    toCopy(row) {
      this.$router.push({ path: `/marketing/group/createGroup/${row.id}/2` });
    },
    handleSizeChange(val) {
      this.formData.limit = val;
      this.getData();
    },
    pageChange(page) {
      this.formData.page = page;
      this.getData();
    },
    //重置
    reset() {
      this.formData.page = 1;
      this.formData.groupName = '';
      this.formData.groupProcess = '';
      this.formData.activityStatus = '';
      this.formData.startTime = '';
      this.formData.groupStatus = '4';
      this.getData();
    },
  },
};
</script>

<style lang="scss" scoped></style>
