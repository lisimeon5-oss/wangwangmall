<template>
  <div>
    <div class="header clearfix">
      <div class="container">
        <el-form inline size="small" @submit.native.prevent>
          <el-form-item :label="$t('user.couponName')">
            <el-input
              v-model="tableFrom.keywords"
              @keyup.enter.native="getList(1)"
              clearable
              :placeholder="$t('user.pleaseEnterCouponName')"
              class="selWidth"
              size="small"
            />
          </el-form-item>
          <el-form-item label-width="0">
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-table
      ref="table"
      v-loading="listLoading"
      :data="tableData.data"
      style="width: 100%"
      size="small"
      tooltip-effect="dark"
      v-on:row-click="rowClick"
      width="900px"
    >
      <el-table-column width="30">
        <template slot-scope="scope">
          <el-radio v-model="templateRadio" :label="scope.row.id" @change.native="getTemplateRow(scope.row)"
            >&nbsp</el-radio
          >
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" min-width="50" />
      <el-table-column prop="name" :show-overflow-tooltip="true" :label="$t('user.couponNameCol')" min-width="150" />
      <el-table-column prop="category" :label="$t('user.useScope')" min-width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.category | couponCategory }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="money" :label="$t('user.faceValue')" min-width="90" />
      <el-table-column prop="minPrice" :label="$t('user.threshold')" min-width="90" />
      <el-table-column prop="receiveType" :label="$t('user.receiveMethod')" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.receiveType | receiveType }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="isLimited" :label="$t('user.remaining')" min-width="90">
        <template slot-scope="scope">
          <span>{{ !scope.row.isLimited ? $t('user.unlimited') : scope.row.lastTotal }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operate')" width="60" fixed="right">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            class="mr10"
            :disabled="multipleSelection.coupon_id != scope.row.id"
            @click="send(scope.row.id)"
            >{{ $t('user.send') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="block mb20">
      <el-pagination
        background
        :page-sizes="[10, 20, 30, 40]"
        :page-size="tableFrom.limit"
        :current-page="tableFrom.page"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.total"
        @size-change="handleSizeChange"
        @current-change="pageChange"
      />
    </div>
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
import { couponSendApi, canSendListApi } from '@/api/marketing';
import i18n from '@/i18n';
export default {
  name: 'CouponList',
  props: {
    checkedIds: {
      type: Array,
      default: [],
    },
    allCheck: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      listLoading: true,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 10,
        keywords: '',
      },
      multipleSelection: {
        coupon_id: '',
      },
      templateRadio: 0,
    };
  },
  filters: {
    receiveType(val) {
      const typeObj = {
        1: i18n.t('user.manualReceive'),
        2: i18n.t('user.productGiftCoupon'),
        3: i18n.t('user.platformAutoIssue'),
      };
      return typeObj[val];
    },
  },
  mounted() {
    this.getList(1);
  },
  methods: {
    rowStyle: function ({ row, rowIndex }) {
      Object.defineProperty(row, 'rowIndex', { value: rowIndex, writable: true, enumerable: false });
    },
    rowClick: function (row) {
      this.multipleSelection = { coupon_id: row.id };
      this.templateRadio = row.id;
    },
    getTemplateRow(row) {
      this.multipleSelection = { coupon_id: row.id };
    },
    // 发送优惠券
    send(id) {
      let that = this;
      that
        .$confirm(that.$t('user.sendCouponConfirm'), that.$t('common.tip'), {
          confirmButtonText: that.$t('common.confirmPrefix'),
          cancelButtonText: that.$t('common.cancel'),
          type: 'warning',
        })
        .then(() => {
          let params = {
            couponId: id,
            // is_all: that.allCheck ? 1 : 0,
            uidList: that.checkedIds,
          };
          couponSendApi(params)
            .then((res) => {
              that.$message.success(that.$t('user.sendSuccess'));
              that.$emit('sendSuccess');
            })
        })
        .catch((action) => {
          that.$message({
            type: 'info',
            message: that.$t('user.cancelled'),
          });
        });
    },
    filter(data) {
      for (var key in data) {
        if (data[key] === '') {
          delete data[key];
        }
      }
      return data;
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.page = num ? num : this.tableFrom.page;
      canSendListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
          this.$message.error(res.message);
        });
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList('');
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList('');
    },
  },
};
</script>

<style scoped lang="scss">
.seachTiele {
  line-height: 35px;
}
.fr {
  float: right;
}
</style>
