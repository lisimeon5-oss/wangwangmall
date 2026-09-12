<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['merchant:mp:live:goods:list']"
    >
      <div class="padding-add">
        <el-form size="small" inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('product.productSearch')">
            <el-input
              v-model="keywords"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('marketing.pleaseEnterLiveProductSearch')"
              class="selWidth"
              clearable
              size="small"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs class="list-tabs mb5" v-model="tableForm.reviewStatus" @tab-click="getList(1)">
        <el-tab-pane name=" " :label="$t('common.all')"></el-tab-pane>
        <el-tab-pane name="0" :label="$t('marketing.merchantCreated')"></el-tab-pane>
        <el-tab-pane name="1" :label="$t('product.platformPendingReAudit')"></el-tab-pane>
        <el-tab-pane name="2" :label="$t('marketing.platformAuditPassed')"></el-tab-pane>
        <el-tab-pane name="3" :label="$t('product.platformAuditFailed')"></el-tab-pane>
        <el-tab-pane name="4" :label="$t('product.wechatAuditSuccess')"></el-tab-pane>
        <el-tab-pane name="5" :label="$t('product.wechatAuditFailed')"></el-tab-pane>
      </el-tabs>
      <el-button
        size="small"
        @click="onEdit(0)"
        type="primary"
        class="mb20"
        v-hasPermi="['merchant:mp:live:goods:save']"
        >{{ $t('marketing.addLiveProduct') }}</el-button
      >
      <el-table v-loading="listLoading" :data="tableData.data" style="width: 100%" size="small" highlight-current-row>
        <el-table-column label="ID" prop="id" min-width="40" />
        <el-table-column :label="$t('marketing.productId')" min-width="50">
          <template slot-scope="scope">
            <span>{{ scope.row.productId | filterEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.listProductName')" min-width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.name + '/' + scope.row.productId }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product.productImage')" min-width="100">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.coverImgUrlLocal" :preview-src-list="[scope.row.coverImgUrlLocal]" />
            </div>
          </template>
        </el-table-column>
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
        <el-table-column prop="sort" min-width="60" :label="$t('product.sort')" />
        <el-table-column :label="$t('product.auditStatus')" min-width="100">
          <template slot-scope="scope">
            <el-tooltip
              v-if="scope.row.reviewStatus === 3 || scope.row.reviewStatus === 5"
              class="item"
              effect="dark"
              :content="scope.row.reviewReason"
              placement="top"
            >
              <el-tag class="notStartTag tag-background" v-if="scope.row.reviewStatus === 3">{{ $t('product.platformAuditFailed') }}</el-tag>
              <el-tag class="notStartTag tag-background" v-if="scope.row.reviewStatus === 5">{{ $t('product.wechatAuditFailed') }}</el-tag>
            </el-tooltip>
            <div v-else>
              <el-tag class="doingTag tag-background" v-if="scope.row.reviewStatus === 1">{{ $t('product.platformPendingAudit') }}</el-tag>
              <el-tag class="endTag tag-background" v-if="scope.row.reviewStatus === 2">{{ $t('marketing.platformAuditPassed') }}</el-tag>
              <el-tag class="endTag tag-background" v-if="scope.row.reviewStatus === 4">{{ $t('product.wechatAuditSuccess') }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <a v-hasPermi="['merchant:mp:live:goods:sort']" @click="handleSort(scope.row.id)">{{ $t('product.sort') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['merchant:mp:live:goods:edit']" @click="onEdit(scope.row.id)">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['merchant:mp:live:goods:delete']" @click="handleDelete(scope.row.id)">{{ $t('common.delete') }}</a>
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
    <!--排序-->
    <details-from ref="ProDetail" @getList="getList" />
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
import { liveGoodsListApi, liveGoodsDelApi } from '@/api/marketing';
import detailsFrom from './proDetail';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'BroadcastProList',
  computed: {},
  components: { detailsFrom },
  data() {
    return {
      Loading: false,
      listLoading: true,
      product_id: '',
      dialogVisible: false,
      tableData: {
        data: [],
        total: 0,
      },
      keywords: '',
      tableForm: {
        page: 1,
        limit: this.$constants.page.limit[0],
        reviewStatus: '',
        keywords: '',
      },
      liveRoomStatus: '',
      roomInfo: {},
    };
  },
  mounted() {
    if (checkPermi(['merchant:mp:live:goods:list'])) this.getList();
  },
  methods: {
    checkPermi,
    // 排序
    handleSort(id) {
      this.id = id;
      this.$refs.ProDetail.dialogVisible = true;
      this.$refs.ProDetail.isEdit = true;
      this.$refs.ProDetail.getData(id);
    },
    onEdit(id) {
      this.$router.push({ path: `/marketing/broadcast/creatPro/${id}` });
    },
    // 详情
    onProDetails(row) {
      this.roomInfo = row;
      // this.product_id = id;
      this.dialogVisible = true;
      // this.$refs.ProDetail.isEdit = false;
      // this.$refs.ProDetail.getData(id);
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure(this.$t('product.deleteThisProductConfirm')).then(() => {
        liveGoodsDelApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableForm);
          this.getList('');
        });
      });
    },
    handleSizeChangeIssue(val) {
      this.tableFormIssue.limit = val;
      this.getIssueList();
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableForm.page = num ? num : this.tableForm.page;
      this.tableForm.keywords = encodeURIComponent(this.keywords);
      liveGoodsListApi(this.tableForm)
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
      this.getList();
    },
    handleSizeChange(val) {
      this.tableForm.limit = val;
      this.getList();
    },
    // 修改状态
    // onchangeIsShow(row) {
    //   changeProDisplayApi(row.broadcast_goods_id, { is_show: row.is_show })
    //     .then(({ message }) => {
    //       this.$message.success(message);
    //       this.getList();
    //     })
    //     .catch(({ message }) => {
    //       this.$message.error(message);
    //     });
    // },
    // 审核
  },
};
</script>

<style scoped lang="scss">
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
