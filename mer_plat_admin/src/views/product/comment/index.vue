<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:product:reply:list']"
    >
      <div class="padding-add">
        <el-form :inline="true" label-position="right" @submit.native.prevent>
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
              style="width: 260px"
            ></el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('product.replyStatusLabel')">
            <el-select
              v-model="tableFrom.isReply"
              :placeholder="$t('product.pleaseSelectReplyStatus')"
              @change="handleSeachList"
              size="small"
              class="selWidth"
              clearable
            >
              <el-option :label="$t('product.replied')" value="1"></el-option>
              <el-option :label="$t('product.notReplied')" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('product.productSearchLabel')">
            <el-input
              v-model.trim="productSearch"
              :placeholder="$t('product.pleaseEnterProductName')"
              class="selWidth"
              size="small"
              clearable
              @keyup.enter.native="handleSeachList"
            />
          </el-form-item>
          <el-form-item :label="$t('product.userSearchLabel')" label-for="nickname">
            <UserSearchInput v-model="tableFrom" />
          </el-form-item>
          <el-form-item :label="$t('product.merchantNameLabel')" v-hasPermi="['platform:merchant:page:list']">
            <merchant-name @getMerId="getMerId" :merIdChecked="tableFrom.merId"></merchant-name>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSeachList" size="small">{{ $t('product.query') }}</el-button>
            <el-button @click="reset" size="small">{{ $t('product.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt16" shadow="never" :bordered="false">
      <el-table :data="tableData.data" size="small">
        <el-table-column prop="id" label="ID" width="50" />
        <el-table-column :label="$t('product.productInfo')" prop="productImage" min-width="300" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div class="demo-image__preview acea-row row-middle line-heightOne" v-if="scope.row.productName">
              <el-image :src="scope.row.productImage" :preview-src-list="[scope.row.productImage]" class="mr10" />
              <div class="info line2">{{ scope.row.productName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="merName" :label="$t('product.merchantName')" min-width="130" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('product.userNickname')" min-width="130" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span :class="scope.row.isLogoff == true ? 'red' : ''">{{ scope.row.nickname }}</span>
            <span :class="scope.row.isLogoff == true ? 'red' : ''" v-if="scope.row.isLogoff == true">|</span>
            <span v-if="scope.row.isLogoff == true" class="red">({{ $t('product.loggedOff') }})</span>
          </template>
        </el-table-column>
        <el-table-column prop="star" :label="$t('product.starRating')" min-width="90" />
        <el-table-column prop="comment" :label="$t('product.commentContent')" min-width="210" :show-overflow-tooltip="true" />
        <el-table-column prop="merchantReplyContent" :label="$t('product.replyContent')" min-width="250" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('product.commentTime')" min-width="150">
          <template slot-scope="scope">
            <span> {{ scope.row.createTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.operate')" width="70" fixed="right">
          <template slot-scope="scope">
            <a @click="handleDelete(scope.row.id, scope.$index)" v-hasPermi="['platform:product:reply:delete']">{{ $t('product.delete') }}</a>
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
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import merchantName from '@/components/merchantName';
import { replyListApi, replyDeleteApi } from '@/api/product';
import { formatDates } from '@/utils/index';
import { userListApi } from '@/api/user';
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
  components: { merchantName },
  data() {
    return {
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
        isReply: '',
        dateLimit: '',
        merId: null,
        nickname: '',
        productSearch: '',
        isDel: false,
        searchType: 'all',
        content: '',
      },
      productSearch: '',
      nickname: '',
      timeVal: [],
      loading: false,
      uids: [],
      options: [],
      timer: '',
    };
  },
  watch: {
    $route(to, from) {
      this.getList(1);
    },
  },
  mounted() {
    if (checkPermi(['platform:product:reply:list'])) this.getList(1);
  },
  methods: {
    checkPermi,
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          userListApi({ keywords: query, page: 1, limit: 10 }).then((res) => {
            this.options = res.list;
          });
        }, 200);
      } else {
        this.options = [];
      }
    },
    getMerId(id) {
      this.tableFrom.merId = id;
      this.handleSeachList();
    },
    handleSeachList() {
      this.getList(1);
    },
    reset() {
      this.tableFrom.page = 1;
      this.tableFrom.isReply = '';
      this.tableFrom.dateLimit = '';
      this.tableFrom.merId = null;
      this.tableFrom.nickname = '';
      this.tableFrom.productSearch = '';
      this.tableFrom.searchType = 'all';
      this.tableFrom.content = '';
      this.nickname = '';
      this.productSearch = '';
      this.selectChange();
    },
    // 选择时间
    selectChange(tab) {
      this.timeVal = [];
      this.getList(1);
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = e ? this.timeVal.join(',') : '';
      this.getList(1);
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure().then(() => {
        replyDeleteApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.nickname = encodeURIComponent(this.nickname);
      this.tableFrom.productSearch = encodeURIComponent(this.productSearch);
      this.tableFrom.page = num ? num : this.tableFrom.page;
      this.tableFrom.uid = this.uids.join(',');
      replyListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
        });
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

<style scoped lang="scss">
.red {
  color: #ed4014;
}
.table {
  .el-image {
    width: auto !important;
    height: 30px !important;
  }
  ::v-deepel-image__inner,
  .el-image__placeholder,
  .el-image__error {
    width: auto !important;
  }
}
.info {
  width: 82%;
}
</style>
