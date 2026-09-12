<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:merchant:apply:page:list']"
    >
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('merchant.selectTimeLabel')">
            <el-date-picker
              v-model="timeVal"
              type="daterange"
              size="small"
              :placeholder="$t('user.chooseDate')"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              range-separator="-"
              :start-placeholder="$t('product.startDate')"
              :end-placeholder="$t('product.endDate')"
              @change="onchangeTime"
              class="selWidth"
            />
          </el-form-item>
          <el-form-item :label="$t('finance.auditStatusLabel')">
            <el-select v-model="tableFrom.auditStatus" clearable size="small" :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('order.pendingAudit')" value="1" />
              <el-option :label="$t('finance.auditPassed')" value="2" />
              <el-option :label="$t('product.auditRejected')" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('merchant.merchantCategoryLabel')">
            <el-select v-model="tableFrom.categoryId" clearable size="small" :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option v-for="item in merchantClassify" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('merchant.storeTypeLabel')">
            <el-select v-model="tableFrom.typeId" clearable size="small" :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option v-for="item in merchantType" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('merchant.merchantSearchLabel')">
            <el-input
              v-model.trim="keywords"
              size="small"
              :placeholder="$t('merchant.pleaseEnterMerchantNameKeyword')"
              class="selWidth"
              @keyup.enter.native="getList(1)"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset()">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-table v-loading="listLoading" :data="tableData.data" size="small" highlight-current-row class="mt20">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item :label="$t('merchant.merchantRealNameLabel')">
                <span>{{ props.row.realName }}</span>
              </el-form-item>
              <el-form-item :label="$t('merchant.merchantTypeLabel')">
                <span>{{ props.row.isSelf ? $t('product.selfOperated') : $t('product.notSelfOperated') }}</span>
              </el-form-item>
              <el-form-item :label="$t('user.remarkLabel')">
                <span>{{ props.row.remark }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column prop="name" :label="$t('product.merchantName')" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column prop="phone" :label="$t('merchant.contactInfo')" min-width="130" />
        <el-table-column prop="createTime" :label="$t('finance.applyTime')" min-width="150" />
        <el-table-column :label="$t('common.status')" min-width="150">
          <template slot-scope="scope">
            <el-tag class="endTag tag-background" v-if="scope.row.auditStatus == 2" type="success">{{ $t('common.approved') }}</el-tag>
            <el-tag class="doingTag tag-background" v-if="scope.row.auditStatus == 1" type="info">{{ $t('merchant.unprocessed') }}</el-tag>
            <el-tag class="notStartTag tag-background" v-if="scope.row.auditStatus == 3" type="warning">{{ $t('common.rejected') }}</el-tag>
            <div v-if="scope.row.auditStatus == 3" class="mt10">{{ $t('common.reasonLabel') }}{{ scope.row.denialReason }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="150" fixed="right">
          <template slot-scope="scope">
            <a
              v-if="scope.row.auditStatus == 1 && checkPermi(['platform:merchant:apply:audit'])"
              @click="onchangeIsShow(scope.row, 'isSHOW')"
              >{{ $t('finance.audit') }}</a
            >
            <el-divider
              v-if="scope.row.auditStatus == 1 && checkPermi(['platform:merchant:apply:audit'])"
              direction="vertical"
            ></el-divider>
            <a @click="onchangeIsShow(scope.row)">{{ $t('common.detail') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="onEdit(scope.row)" v-hasPermi="['platform:merchant:apply:remark']">{{ $t('common.remark') }}</a>
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
    <audit-from ref="auditFroms" :merData="merData" :isSHOW="isSHOW" @subSuccess="subSuccess"></audit-from>
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
import { merApplyListApi, merApplyRemarkApi } from '@/api/merchant';
import { mapGetters } from 'vuex';
import auditFrom from './audit';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
export default {
  name: 'MerchantApplication',
  components: { auditFrom },
  data() {
    return {
      props: {
        emitPath: false,
      },
      fromList: this.$constants.fromList,
      isChecked: false,
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        dateLimit: '',
        auditStatus: '',
        keywords: '',
        categoryId: '',
        typeId: '',
      },
      keywords: '',
      mer_id: this.$route.query.id ? this.$route.query.id : '',
      autoUpdate: true,
      timeVal: [],
      merData: {},
      isSHOW: '',
    };
  },
  computed: {
    ...mapGetters(['merchantClassify', 'merchantType']),
  },
  watch: {
    mer_id(newName, oldName) {
      if (checkPermi(['platform:merchant:apply:page:list'])) this.getList('');
    },
  },
  mounted() {
    if (checkPermi(['platform:merchant:apply:page:list'])) this.getList('');
  },
  methods: {
    checkPermi,
    subSuccess() {
      this.getList('');
    },
    // 选择时间
    selectChange(tab) {
      this.tableFrom.dateLimit = tab;
      this.timeVal = [];
      this.tableFrom.page = 1;
      this.getList('');
    },
    statusChange(tab) {
      this.tableFrom.auditStatus = tab;
      this.tableFrom.page = 1;
      this.getList('');
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = this.timeVal ? this.timeVal.join(',') : '';
      this.tableFrom.page = 1;
      this.getList('');
    },
    // 列表
    getList(num) {
      if (!this.merchantClassify.length) this.$store.dispatch('merchant/getMerchantClassify');
      if (!this.merchantType.length) this.$store.dispatch('merchant/getMerchantType');
      this.listLoading = true;
      this.tableFrom.keywords = encodeURIComponent(this.keywords);
      this.tableFrom.page = num ? num : this.tableFrom.page;
      merApplyListApi(this.tableFrom)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    reset() {
      this.tableFrom = {
        page: 1,
        limit: 20,
        dateLimit: '',
        auditStatus: '',
        keywords: '',
        categoryId: '',
        typeId: '',
      };
      this.timeVal = [];
      this.keywords = '';
      this.getList();
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList('');
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList(1);
    },
    // 审核
    onchangeIsShow(row, type) {
      this.merData = row;
      this.isSHOW = type;
      this.$refs.auditFroms.dialogVisible = true;
    },
    // 添加

    // 备注
    onEdit(row) {
      this.$modalPrompt('textarea', this.$t('common.remark'), row.remark).then((V) => {
        merApplyRemarkApi({
          id: row.id,
          remark: V,
        }).then((res) => {
          this.$message({
            type: 'success',
            message: this.$t('user.submitSuccess'),
          });
          this.getList('');
        });
      });
    },
    // 删除
    handleDelete(id) {
      this.$modalSure().then(() => {
        intentionDelte(id).then(({ message }) => {
          this.$message.success(message);
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList();
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
