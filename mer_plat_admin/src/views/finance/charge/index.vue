<template>
  <div class="divBox">
    <el-card
      v-hasPermi="['platform:recharge:order:list']"
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
    >
      <div class="padding-add">
        <el-form size="small" inline @submit.native.prevent>
          <el-form-item :label="$t('product.timeSelectLabel')">
            <el-date-picker
              v-model="timeVal"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="daterange"
              placement="bottom-end"
              :placeholder="$t('product.customTime')"
              class="selWidth"
              @change="onchangeTime"
            />
          </el-form-item>
          <el-form-item :label="$t('product.userSearchLabel')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item :label="$t('order.orderNoLabel')" label-width="66px">
            <el-input
              v-model="tableFrom.keywords"
              :placeholder="$t('finance.pleaseEnterOrderNo')"
              class="selWidth"
              size="small"
              @keyup.enter.native="getList(1)"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        class="table"
        highlight-current-row
      >
        <el-table-column prop="uid" :label="$t('finance.userID')" width="60" />
        <el-table-column :label="$t('user.avatar')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" :label="$t('product.userNickname')" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column prop="orderNo" :label="$t('order.orderNo')" min-width="180" />
        <el-table-column
          sortable
          :label="$t('finance.payAmount')"
          min-width="120"
          :sort-method="
            (a, b) => {
              return a.price - b.price;
            }
          "
          prop="price"
        />
        <el-table-column
          sortable
          :label="$t('finance.giftAmount')"
          min-width="120"
          prop="givePrice"
          :sort-method="
            (a, b) => {
              return a.givePrice - b.givePrice;
            }
          "
        />
        <el-table-column :label="$t('order.payType')" min-width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.payType === 'weixin' ? $t('order.wechat') : $t('order.alipay') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('finance.payChannel')" min-width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.payChannel | rechargeTypeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user.payTimeCol')" min-width="150">
          <template slot-scope="scope">
            <span class="spBlock">{{ scope.row.payTime || $t('finance.none') }}</span>
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
  </div>
</template>

<script>
import { rechargeLstApi } from '@/api/finance';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  name: 'AccountsBill',
  data() {
    return {
      editData: {},
      isCreate: 1,
      cardLists: [],
      timeVal: [],
      tableData: {
        data: [],
        total: 0,
      },
      listLoading: true,
      tableFrom: {
        uid: '',
        dateLimit: '',
        keywords: '',
        page: 1,
        limit: 20,
        searchType: 'all',
        content: '',
      },
      fromList: this.$constants.fromList,
      dialogVisible: false,
    };
  },
  mounted() {
    if (checkPermi(['platform:recharge:order:list'])) this.getList();
  },
  methods: {
    checkPermi,
    // 选择时间
    selectChange(tab) {
      this.tableFrom.dateLimit = tab;
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
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      rechargeLstApi(this.tableFrom)
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
      this.tableFrom.uid = '';
      this.tableFrom.dateLimit = '';
      this.tableFrom.keywords = '';
      this.tableFrom.searchType = 'all';
      this.tableFrom.content = '';
      this.timeVal = [];
      this.getList(1);
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList();
    },
  },
};
</script>

<style scoped></style>
