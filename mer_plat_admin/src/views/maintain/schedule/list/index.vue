<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-button type="primary" size="small" @click="handleAddJob" v-hasPermi="['platform:schedule:job:add']"
        >{{ $t('maintain.addScheduledTask') }}</el-button
      >
      <el-table v-loading="listLoading" :data="tableData" size="small" class="table mt20 operation">
        <el-table-column prop="jobId" :label="$t('maintain.taskId')" min-width="60" />
        <el-table-column prop="beanName" :label="$t('maintain.scheduledTaskClassName')" min-width="200" />
        <el-table-column prop="methodName" :label="$t('maintain.methodName')" min-width="150" />
        <el-table-column prop="cronExpression" min-width="120" :label="$t('maintain.cronExpression')" />
        <el-table-column prop="params" :label="$t('maintain.parameter')" min-width="100" />
        <el-table-column :label="$t('common.status')" min-width="80">
          <template
            slot-scope="scope"
            v-if="checkPermi(['platform:schedule:job:start', 'platform:schedule:job:suspend'])"
          >
            <el-switch
              v-model="scope.row.status"
              :active-value="0"
              :inactive-value="1"
              :active-text="$t('maintain.normal')"
              :inactive-text="$t('product.paused')"
              @change="onchangeIsShow(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" :label="$t('common.remark')" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="150" />
        <el-table-column fixed="right" width="150" :label="$t('common.operate')">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.status == 0"
              type="text"
              size="small"
              @click="onEdit(scope.row)"
              v-hasPermi="['platform:schedule:job:update']"
              >{{ $t('common.edit') }}</el-button
            >
            <el-divider direction="vertical"></el-divider>
            <a @click="onTrig(scope.row)" v-hasPermi="['platform:schedule:job:trig']">{{ $t('maintain.execute') }}</a>
            <el-divider direction="vertical"></el-divider>
            <el-button
              :disabled="scope.row.status == 0"
              type="text"
              size="small"
              @click="handleDelete(scope.row.jobId, scope.$index)"
              v-hasPermi="['platform:schedule:job:delete']"
              >{{ $t('common.delete') }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <creat-Job
      ref="creatJobs"
      :editData="editData"
      :dialogVisible="dialogVisible"
      @getList="getjobList"
      @closeModel="closeModel"
    />
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
import * as schedule from '@/api/schedule.js';
import creatJob from './creatJob';
import { Debounce } from '@/utils/validate';
import { checkPermi } from '@/utils/permission';
export default {
  name: 'list',
  components: { creatJob },
  data() {
    return {
      tableData: [],
      listLoading: false,
      dialogVisible: false,
      status: 0,
      jobId: 0,
      editData: {
        jobId: 0,
        beanName: '',
        cronExpression: '',
        methodName: '',
        remark: '',
        param: '',
      },
    };
  },
  created() {
    if (checkPermi(['platform:schedule:job:list'])) this.getjobList();
  },
  methods: {
    checkPermi, //权限控制
    // 获取定时任务列表
    getjobList() {
      this.listLoading = true;
      schedule.jobList().then((data) => {
        this.listLoading = false;
        this.tableData = data;
      });
    },
    submit: Debounce(function (data) {}),
    //  关闭模态框
    handleClose(done) {
      this.formConf.fields = [];
      this.dialogVisible = false;
    },
    onchangeIsShow(row) {
      if (row.status == 1) {
        schedule
          .scheduleJobSuspend(row.jobId)
          .then(() => {
            this.$message.success(this.$t('category.updateSuccess'));
            this.getjobList();
          })
          .catch(() => {
            row.status = !row.status;
          });
      } else {
        schedule
          .scheduleJobStart(row.jobId)
          .then(() => {
            this.$message.success(this.$t('category.updateSuccess'));
            this.getjobList();
          })
          .catch(() => {
            row.status = !row.status;
          });
      }
    },
    // 添加定时任务
    handleAddJob() {
      this.editData = {};
      this.dialogVisible = true;
    },
    // 修改定时任务
    onEdit(row) {
      this.editData = row;
      this.dialogVisible = true;
    },
    onTrig(row) {
      schedule.scheduleJobTrig(row.jobId).then((res) => {
        this.$message.success(this.$t('maintain.triggerSuccess'));
        this.getjobList();
      });
    },
    closeModel() {
      this.dialogVisible = false;
    },
    // 删除定时任务
    handleDelete(id, idx) {
      this.$modalSure().then(() => {
        schedule.scheduleJobDelete(id).then((res) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getjobList();
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.el-icon-plus {
  margin-right: 5px;
}
</style>
