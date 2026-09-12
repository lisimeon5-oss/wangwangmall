<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:activitystyle:list']"
    >
      <div class="padding-add">
        <el-form ref="tableFrom" :model="tableFrom" size="small" :inline="true" @submit.native.prevent>
          <el-form-item :label="$t('order.createTimeColon')" prop="date">
            <el-date-picker
              style="width: 260px"
              v-model="timeVal"
              type="datetimerange"
              range-separator="-"
              value-format="yyyy-MM-dd HH:mm:ss"
              :start-placeholder="$t('product.startDate')"
              :end-placeholder="$t('product.endDate')"
              @change="onchangeTime"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityStatusLabel')" prop="status">
            <el-select
              v-model="tableFrom.runningStatus"
              :placeholder="$t('el.select.placeholder')"
              class="selWidth"
              clearable
              @change="getList(1)"
            >
              <el-option :label="$t('common.notStarted')" :value="0" />
              <el-option :label="$t('common.ongoing')" :value="1" />
              <el-option :label="$t('common.ended')" :value="-1" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityNameLabel')">
            <el-input
              v-model="name"
              :placeholder="$t('marketing.pleaseEnterActivityName')"
              class="selWidth"
              clearable
              @keyup.enter.native="getList(1)"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset('tableFrom')">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" :bordered="false" shadow="never">
      <router-link :to="{ path: activityTpye === 1 ? '/marketing/atmosphere/add' : '/marketing/border/add' }">
        <el-button v-hasPermi="['platform:activitystyle:save']" size="small" type="primary">{{
          activityTpye === 1 ? $t('marketing.addAtmosphereImage') : $t('marketing.addActivityBorder')
        }}</el-button>
      </router-link>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        class="mt20"
        size="small"
        highlight-current-row
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column :label="$t('marketing.activityName')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ getLocalizedActivityName(scope.row) }}</template>
        </el-table-column>
        <el-table-column min-width="100" :label="$t('marketing.atmosphereImage')">
          <template slot-scope="scope">
            <el-image style="width: 36px; height: 36px" :src="scope.row.style" />
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$t('product.usageScope')" min-width="110">
          <template slot-scope="scope">
            <span>{{ scope.row.method | activityMethodFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="260" :label="$t('marketing.activityDate')">
          <template slot-scope="{ row }">
            <div>{{ row.starttime }} - {{ row.endtime }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.activityStatus')" min-width="90">
          <template slot-scope="{ row }">
            <el-tag class="notStartTag tag-background" v-if="row.runningStatus == 0">{{ $t('common.notStarted') }}</el-tag>
            <el-tag class="doingTag tag-background" v-if="row.runningStatus == 1">{{ $t('common.ongoing') }}</el-tag>
            <el-tag class="endTag tag-background" v-if="row.runningStatus == -1">{{ $t('common.ended') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createtime" :label="$t('product.createTime')" min-width="150" />
        <el-table-column :label="$t('community.isEnabled')" fixed="right" min-width="90">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:activitystyle:updatestatus'])"
              v-model="scope.row.status"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.status ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="100" fixed="right">
          <template slot-scope="scope">
            <a v-hasPermi="['platform:activitystyle:edite']" @click="onEdit(scope.row)">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a v-hasPermi="['platform:activitystyle:delete']" @click="handleDelete(scope.row.id, scope.$index)">{{ $t('common.delete') }}</a>
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
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import { atuosphereList, atmosphereDelete, atmosphereStatusApi } from '@/api/marketing';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'HoneyList',
  components: {},
  data() {
    return {
      props: { multiple: false, emitPath: false },
      Loading: false,
      dialogVisible: false,
      listLoading: false,
      receiveType: 0,
      id: '',
      categoryList: [],
      labelList: [],
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        name: '',
        runningStatus: '',
        starttime: '',
        endtime: '',
        type: null,
      },
      name: '',
      type: 0,
      isShow: false,
      timeVal: [],
    };
  },
  computed: {
    activityTpye() {
      return this.$route.path.indexOf('border') !== -1 ? 0 : 1;
    },
  },
  mounted() {
    if (checkPermi(['platform:activitystyle:list'])) this.getList(1);
  },
  methods: {
    checkPermi,
    getLocalizedActivityName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    onEdit(item) {
      localStorage.setItem('activitystyle', JSON.stringify(item));
      this.$router.push({
        path: this.activityTpye === 1 ? `/marketing/atmosphere/add/${item.id}` : `/marketing/border/add/${item.id}`,
      });
    },
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.starttime = e ? e[0] : '';
      this.tableFrom.endtime = e ? e[1] : '';
    },
    reset(formName) {
      this.timeVal = [];
      this.name = '';
      this.tableFrom = {
        page: 1,
        limit: 20,
        name: '',
        status: '',
        starttime: '',
        endtime: '',
        type: null,
      };
      this.getList('');
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure(`删除活动后将无法恢复，请谨慎操作!`).then(() => {
        atmosphereDelete({ id: id }).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableFrom);
          this.getList('');
        });
      });
    },
    // 列表
    getList(num) {
      this.listLoading = true;
      this.tableFrom.type = this.activityTpye;
      this.tableFrom.page = num || this.tableFrom.page;
      this.tableFrom.name = encodeURIComponent(this.name);
      atuosphereList(this.tableFrom)
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
      this.tableFrom.page = page;
      this.getList('');
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList('');
    },
    // 修改状态
    onchangeIsShow(row) {
      atmosphereStatusApi({ id: row.id, status: row.status })
        .then(() => {
          this.$message.success(this.$t('category.updateSuccess'));
          this.getList('');
        })
        .catch(() => {
          row.status = !row.status;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.modalbox {
  :v-deep.el-dialog {
    min-width: 550px;
  }
}
.container {
  min-width: 821px;
}
.dialogBox {
  box-sizing: border-box;
  .el-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 25px;
  }
}
</style>
