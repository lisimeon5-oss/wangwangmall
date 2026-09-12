<template>
  <div class="divBox relative">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('marketing.groupOpenDateLabel')" class="inline">
            <el-date-picker
              v-model="time"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('product.customTime')"
              class="selWidth"
              :start-placeholder="$t('product.startDate')"
              :end-placeholder="$t('product.endDate')"
              @change="timeChange"
            />
          </el-form-item>
          <el-form-item :label="$t('marketing.activityNameLabel')">
            <el-input
              v-model="formData.groupActivityName"
              :placeholder="$t('marketing.pleaseEnterActivityName')"
              class="selWidth"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('product.productSearchLabel')">
            <el-input v-model="formData.productName" :placeholder="$t('product.pleaseEnterProductName')" class="selWidth" clearable></el-input>
          </el-form-item>
          <el-form-item :label="$t('marketing.groupLeaderSearchLabel')">
            <UserSearchInput v-model="formData" class="selWidth" />
          </el-form-item>
          <el-form-item :label="$t('merchant.merchantSearchLabel')">
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
      <el-tabs @tab-click="handleClick" v-model="formData.recordStatus" class="list-tabs">
        <el-tab-pane :label="$t('marketing.tabSucceededCount', { count: hedaList.successNum || 0 })" name="10" />
        <el-tab-pane :label="$t('marketing.tabGroupingCount', { count: hedaList.ingNum || 0 })" name="0" />
        <el-tab-pane :label="$t('marketing.tabFailedCount', { count: hedaList.failNum || 0 })" name="-1" />
      </el-tabs>
      <el-table :data="tableData" size="small" ref="multipleTable" row-key="id" class="mt20 tableSelection">
        <el-table-column label="ID" prop="groupBuyingId" width="50" />
        <el-table-column :label="$t('marketing.activityName')" min-width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedGroupName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.createMerchant')" min-width="120">
          <template slot-scope="scope">{{ localizedMerName(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.groupLeaderInfo')" prop="creater" min-width="150">
          <template slot-scope="scope">
            <div class="acea-row">
              <div>{{ scope.row.groupLeaderNickname }}</div>
              <span>|</span>
              <div>{{ scope.row.groupLeaderUid }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.productInfo')" prop="product" min-width="300">
          <template slot-scope="scope">
            <div class="acea-row al-c">
              <img :src="scope.row.productImage" alt="" />
              <div :style="{ marginLeft: '10px' }">
                <div class="line1">{{ localizedProductName(scope.row) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.groupBuyTime')" prop="time" min-width="220">
          <template slot-scope="scope">
            <div>
              <div>{{ $t('marketing.groupOpenTimeLabel') }}{{ scope.row.createTime }}</div>
              <div>{{ $t('marketing.groupEndTimeLabel') }}{{ scope.row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.formedCount')" prop="buyingCountNum" />
        <el-table-column :label="$t('marketing.joinedGroupCount')" prop="yetBuyingNum" />
        <el-table-column :label="$t('common.operate')" prop="operate" min-width="155">
          <template slot-scope="scope">
            <a @click="toDeatil(scope.row)">{{ $t('common.detail') }}</a>
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
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import activityDetail from './detail.vue';
import { groupRecordList, groupRecordCount, groupRecordInfo } from '@/api/group';
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  components: {
    activityDetail,
  },
  data() {
    return {
      tableData: [],
      formData: {
        groupActivityName: '',
        productName: '',
        merName: '',
        recordStatus: '10',
        startTime: '',
        endTime: '',
        limit: 20,
        page: 1,
        content: '',
        searchType: 'all',
      },
      total: 0,
      hedaList: [],
      time: '',
    };
  },
  created() {
    if (checkPermi(['platform:groupbuy:record:list'])) this.getList();
  },
  methods: {
    localizedGroupName(row) {
      return getLocalizedText(row.groupName, row.groupNameJson, getUiLocale(this));
    },
    localizedMerName(row) {
      return getLocalizedText(row.merName, row.merNameJson, getUiLocale(this));
    },
    localizedProductName(row) {
      return getLocalizedText(row.productName, row.productNameJson, getUiLocale(this));
    },
    search() {
      this.formData.page = 1;
      this.getList();
    },
    handleClick(tab, event) {
      this.formData.page = 1;
      this.getList();
    },
    timeChange(e) {
      this.formData.page = 1;
      if (e) {
        this.formData.startTime = e[0];
        this.formData.endTime = e[1];
      } else {
        this.formData.startTime = '';
        this.formData.endTime = '';
      }
      this.getList();
    },
    getList() {
      groupRecordList(this.formData).then((res) => {
        this.tableData = res.list;
        this.total = res.total;
        this.getCount();
      });
    },
    getCount() {
      groupRecordCount(this.formData).then((res) => {
        this.hedaList = res;
      });
    },
    //详情
    toDeatil(row) {
      groupRecordInfo(row.groupBuyingId).then((res) => {
        this.$refs.detail.data = res;
        this.$refs.detail.dialogVisible = true;
      });
    },
    handleSizeChange(val) {
      this.formData.limit = val;
      this.getList();
    },
    pageChange(page) {
      this.formData.page = page;
      this.getList();
    },
    //重置
    reset() {
      this.formData.groupActivityName = '';
      this.formData.productName = '';
      this.formData.merName = '';
      this.formData.startTime = '';
      this.formData.endTime = '';
      this.formData.page = 1;
      this.formData.content = '';
      this.formData.searchType = 'all';
      this.time = '';
      this.getList();
    },
  },
};
</script>

<style lang="scss" scoped>
.line1 {
  width: 200px;
}

.sku {
  font-weight: 400;
}

.al-c {
  align-items: center;
}
</style>
