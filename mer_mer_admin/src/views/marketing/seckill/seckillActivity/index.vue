<template>
  <div class="divBox relative">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['merchant:seckill:activity:page']"
    >
      <div class="padding-add">
        <el-form size="small" inline @submit.native.prevent label-position="right">
          <el-form-item :label="$t('marketing.activityDateLabel')">
            <el-date-picker
              v-model="tableForm.date"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              size="small"
              type="date"
              :placeholder="$t('marketing.activityDate')"
              class="selWidth"
              @change="getList(1)"
            />
          </el-form-item>
          <el-form-item :label="$t('marketing.activityNameLabel')">
            <el-input
              v-model="name"
              @keyup.enter.native="getList(1)"
              :placeholder="$t('marketing.pleaseEnterActivityName')"
              class="selWidth"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="mini"
        ref="multipleTable"
        class="operation"
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('marketing.activityName')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedName(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="productNum" :label="$t('marketing.productCount')" min-width="90" />
        <el-table-column prop="oneQuota" :label="$t('marketing.singlePurchaseLimit')" min-width="90" />
        <el-table-column prop="allQuota" :label="$t('marketing.activityPurchaseLimit')" min-width="90" />
        <el-table-column :label="$t('marketing.productCategory')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ localizedCategoryNames(scope.row) }}</template>
        </el-table-column>
        <el-table-column :label="$t('marketing.merchantStarLevel')" min-width="140">
          <template slot-scope="scope">
            <el-rate disabled v-model="scope.row.merStars" style="margin-top: 8px"></el-rate>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('marketing.activityStatus')" min-width="90">
          <template slot-scope="scope">
            <el-tag class="notStartTag tag-background" v-if="scope.row.status == 0">{{ $t('common.notStarted') }}</el-tag>
            <el-tag class="doingTag tag-background" v-if="scope.row.status == 1">{{ $t('common.ongoing') }}</el-tag>
            <el-tag class="endTag tag-background" v-if="scope.row.status == 2">{{ $t('common.ended') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="end_time" :label="$t('marketing.activityDate')" min-width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.startDate }} - {{ scope.row.endDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="end_time" :label="$t('marketing.activityTime')" min-width="110">
          <template slot-scope="scope">
            <div v-for="(item, i) in scope.row.timeList" :key="i">{{ item }}<br /></div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="150" />
        <el-table-column :label="$t('common.operate')" width="90" fixed="right">
          <template slot-scope="scope" v-hasPermi="['merchant:seckill:product:add']">
            <a
              :disabled="scope.row.status === 2 || Number(merStarLevel) < scope.row.merStars"
              type="text"
              size="small"
              v-hasPermi="['merchant:seckill:product:add']"
              @click="goOn(scope.row.id)"
              >{{ $t('marketing.joinActivity') }}</a
            >
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
  </div>
</template>

<script>
import { seckillActivityListApi, seckillAtivityDelApi } from '@/api/marketing';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import Cookies from 'js-cookie';
import * as $constants from '@/utils/constants';
import { handleDeleteTable } from '@/libs/public';
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';
import { mapGetters } from 'vuex';
const tableForms = {
  page: 1,
  limit: $constants.page.limit[0],
  name: '',
  date: '',
};
export default {
  name: 'SeckillList',
  data() {
    return {
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableForm: Object.assign({}, tableForms),
      name: '',
      fromList: this.$constants.fromList,
      merStarLevel: Cookies.get('merStarLevel'),
    };
  },
  mounted() {
    if (checkPermi(['merchant:seckill:activity:page'])) this.getList(1);
    if (checkPermi(['merchant:plat:product:category:cache:tree']))
      this.$store.dispatch('product/getAdminProductClassify');
  },
  computed: {
    ...mapGetters(['merPlatProductClassify']),
  },
  methods: {
    checkPermi,
    localizedName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    findCategory(nodes, id) {
      const list = nodes || [];
      for (let i = 0; i < list.length; i++) {
        const node = list[i];
        if (String(node.id) === String(id)) return node;
        const child = this.findCategory(node.childList || node.children, id);
        if (child) return child;
      }
      return null;
    },
    localizedCategoryNames(row) {
      if (!row || !row.proCategory || row.proCategory === '0') {
        return (row && row.productCategoryNames) || '';
      }
      const locale = getUiLocale(this);
      const names = String(row.proCategory)
        .split(',')
        .map((id) => {
          const node = this.findCategory(this.merPlatProductClassify, id.trim());
          return node ? getLocalizedName(node, locale) || node.name : '';
        })
        .filter(Boolean);
      return names.length ? names.join(',') : row.productCategoryNames || '';
    },
    goOn(id) {
      this.$router.push({ path: `/marketing/seckill/creatActivity/${id}` });
    },
    // 删除
    handleDelete(id) {
      this.$modalSure(this.$t('marketing.deleteSeckillActivityConfirm')).then(() => {
        seckillAtivityDelApi(id).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableForm);
          this.getList();
        });
      });
    },
    handleReset() {
      this.tableForm = Object.assign({}, tableForms);
      this.name = '';
      this.getList(1);
    },
    // 列表
    getList(num) {
      this.tableForm.page = num ? num : this.tableForm.page;
      this.tableForm.name = encodeURIComponent(this.name);
      this.listLoading = true;
      seckillActivityListApi(this.tableForm)
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
  },
};
</script>

<style scoped lang="scss">
.divBox {
  ::v-deep {
    .el-badge__content.is-fixed.is-dot {
      right: 1px;
      top: 5px;
    }
  }
}
</style>
