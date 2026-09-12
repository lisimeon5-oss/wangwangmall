<template>
  <div class="divBox">
    <div>
      <el-card :bordered="false" class="box-card" :body-style="{ padding: '0 20px 20px' }">
        <div v-hasPermi="['platform:system:notification:list']">
          <el-tabs class="list-tabs" v-model="currentTab" @tab-click="changeTab">
            <el-tab-pane
              :label="item.label"
              :name="item.value.toString()"
              v-for="(item, index) in headerList"
              :key="index + '-only'"
            />
          </el-tabs>
        </div>
        <el-row type="flex" class="mb20 mt-1">
          <el-col>
            <el-button
              type="primary"
              icon="el-icon-document"
              @click="syncRoutine()"
              v-hasPermi="['platform:wechat:routine:sync']"
              >{{ $t('systemSetting.syncMiniProgramSubscribeMessage') }}</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-document"
              @click="syncWechat()"
              v-hasPermi="['platform:wechat:whcbqhn:sync']"
              >{{ $t('systemSetting.syncWechatTemplateMessage') }}</el-button
            >
          </el-col>
        </el-row>
        <div class="description">
          <p><span class="iconfont iconxiaochengxu"></span> {{ $t('systemSetting.miniProgramCategoryLabel') }}{{ $t('systemSetting.departmentStore') }}</p>
          <p>
            <span class="iconfont icongongzhonghao"></span> {{ $t('systemSetting.officialAccountCategory') }}
          </p>
        </div>
        <el-table :data="levelLists" ref="table" class="mt25" size="small" v-loading="loadingList">
          <el-table-column label="ID" prop="id" width="80"></el-table-column>
          <el-table-column :label="$t('systemSetting.notificationType')" prop="type"></el-table-column>
          <el-table-column :label="$t('systemSetting.notificationSceneDescription')" prop="description"></el-table-column>
          <el-table-column :label="$t('systemSetting.identifier')" prop="mark"></el-table-column>
          <el-table-column :label="$t('systemSetting.officialAccountTemplate')" prop="isWechat" v-if="currentTab == '1'">
            <template slot-scope="scope" v-if="scope.row.isWechat !== 0">
              <el-switch
                v-if="checkPermi(['platform:system:notification:wechat:switch'])"
                v-model="scope.row.isWechat"
                :active-value="1"
                :inactive-value="2"
                :active-text="$t('common.enable')"
                :inactive-text="$t('common.disable')"
                @change="changeWechat(scope.row)"
              >
              </el-switch>
              <div v-else>{{ scope.row.isWechat === 1 ? $t('common.enable') : $t('common.disable') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('systemSetting.miniProgramSubscribe')" prop="isRoutine" v-if="currentTab == '1'">
            <template slot-scope="scope" v-if="scope.row.isRoutine !== 0">
              <el-switch
                v-if="checkPermi(['platform:system:notification:routine:switch'])"
                v-model="scope.row.isRoutine"
                :active-value="1"
                :inactive-value="2"
                :active-text="$t('common.enable')"
                :inactive-text="$t('common.disable')"
                @change="changeRoutine(scope.row)"
              >
              </el-switch>
              <div v-else>{{ scope.row.isRoutine === 1 ? $t('common.enable') : $t('common.disable') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('systemSetting.sendSms')" prop="isSms">
            <template slot-scope="scope" v-if="scope.row.isSms !== 0">
              <el-switch
                v-if="checkPermi(['platform:system:notification:sms:switch'])"
                v-model="scope.row.isSms"
                :active-value="1"
                :inactive-value="2"
                :active-text="$t('common.enable')"
                :inactive-text="$t('common.disable')"
                @change="changeSms(scope.row)"
              >
              </el-switch>
              <div v-else>{{ scope.row.isSms === 1 ? $t('common.enable') : $t('common.disable') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.operate')" width="70" v-hasPermi="['platform:system:notification:detail']">
            <template slot-scope="scope">
              <a @click="setting(scope.row)">{{ $t('common.detail') }}</a>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <el-dialog :title="$t('systemSetting.notificationDetail')" :visible.sync="centerDialogVisible" width="50%">
      <el-tabs v-model="infoTab" @tab-click="changeInfo">
        <el-tab-pane
          :label="item.label"
          :name="item.value.toString()"
          v-for="(item, index) in currentTab == '1' ? infoList : infoList1"
          :key="index"
        />
        <el-form ref="form" :model="form" label-width="80px" v-loading="loading">
          <el-form-item label="ID">
            <el-input v-model.trim="form.id" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('systemSetting.templateNameShort')" v-if="form.name">
            <el-input v-model.trim="form.name" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('onePass.templateId')" v-if="form.tempId">
            <el-input v-model.trim="form.tempId"></el-input>
          </el-form-item>
          <el-form-item :label="$t('systemSetting.templateNo')" v-if="form.tempKey">
            <el-input v-model.trim="form.tempKey" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('systemSetting.templateDescription')" v-if="form.title">
            <el-input v-model.trim="form.title" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('onePass.templateContent')" v-if="form.content">
            <el-input v-model.trim="form.content" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('common.status')">
            <el-radio-group v-model="form.status">
              <el-radio label="1">{{ $t('common.open') }}</el-radio>
              <el-radio label="2">{{ $t('common.close') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-tabs>
      <span slot="footer">
        <el-button @click="centerDialogVisible = false">{{ $t('videoChannel.cancelSpaced') }}</el-button>
        <el-button type="primary" @click="submit()">{{ $t('finance.confirmSpaced') }}</el-button>
      </span>
    </el-dialog>
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
import {
  notificationListApi,
  notificationRoutine,
  notificationWechat,
  notificationSms,
  notificationDetail,
  notificationUpdate,
} from '@/api/systemFormConfig';
import { wechatAsyncApi, routineAsyncApi } from '@/api/wxApi';
import { Debounce } from '@/utils/validate';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  data() {
    return {
      modalTitle: '',
      notificationModal: false,
      headerList: [
        { label: this.$t('systemSetting.notifyMember'), value: '1' },
        { label: this.$t('systemSetting.notifyAdmin'), value: '2' },
      ],
      id: 0,
      levelLists: [],
      currentTab: '1',
      loading: false,
      formData: {},
      industry: null,
      loadingList: false,
      centerDialogVisible: false,
      infoList: [],
      infoList1: [{ label: this.$t('common.sms'), value: 'sms' }],
      form: {
        content: '',
        name: '',
        id: '',
        status: null,
        tempId: '',
        tempKey: '',
        title: '',
      },
      detailType: '',
      infoTab: '',
    };
  },
  created() {
    if (checkPermi(['platform:system:notification:list'])) this.getNotificationList(Number(this.currentTab));
  },
  methods: {
    checkPermi,
    changeTab(data) {
      this.currentTab = data.name;
      this.getNotificationList(data.name);
    },
    //获取消息列表
    getNotificationList(id) {
      this.loadingList = true;
      notificationListApi({ sendType: id })
        .then((res) => {
          this.loadingList = false;
          this.levelLists = res;
        })
        .catch((res) => {
          this.loadingList = false;
        });
    },
    //公众号消息开关
    changeWechat(row) {
      notificationWechat(row.id).then((res) => {
        this.$modal.msgSuccess(this.$t('category.updateSuccess'));
      });
    },
    //小程序消息开关
    changeRoutine(row) {
      notificationRoutine(row.id).then((res) => {
        this.$modal.msgSuccess(this.$t('category.updateSuccess'));
      });
    },
    //短信消息开关
    changeSms(row) {
      notificationSms(row.id).then((res) => {
        this.$modal.msgSuccess(this.$t('category.updateSuccess'));
      });
    },
    //详情tab切换
    changeInfo(data) {
      this.getNotificationDetail(data);
    },
    //详情数据
    getNotificationDetail(param) {
      this.loading = true;
      let data = {
        id: this.id,
        type: param.name,
      };
      this.$set(this, 'detailType', data.type);
      notificationDetail(data)
        .then((res) => {
          this.form = res;
          this.$set(this.form, 'status', res.status.toString());
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    // 设置
    setting(row) {
      this.infoList = [];
      this.id = row.id;
      this.centerDialogVisible = true;
      if (row.isWechat !== 0) {
        this.infoList.push({ label: this.$t('systemSetting.officialAccountTemplateMessage'), value: 'wechat' });
      }
      if (row.isRoutine !== 0) {
        this.infoList.push({ label: this.$t('systemSetting.miniProgramSubscribeMessage'), value: 'routine' });
      }
      if (row.isSms !== 0) {
        this.infoList.push({ label: this.$t('common.sms'), value: 'sms' });
      }
      this.infoTab = this.infoList[0].value;
      this.getNotificationDetail({ name: this.infoTab });
    },
    //修改通知
    submit: Debounce(function () {
      let data = {
        id: this.id,
        status: Number(this.form.status),
        tempId: this.form.tempId,
        type: this.detailType,
      };
      notificationUpdate(data).then((res) => {
        this.$modal.msgSuccess(this.$t('category.updateSuccess'));
        this.centerDialogVisible = false;
        this.getNotificationList(this.currentTab);
      });
    }),
    syncWechat() {
      wechatAsyncApi().then((res) => {
        this.$message.success(this.$t('systemSetting.syncSuccess'));
      });
    },
    syncRoutine() {
      routineAsyncApi().then((res) => {
        this.$message.success(this.$t('systemSetting.syncSuccess'));
      });
    },
  },
};
</script>

<style scoped>
.mt-1 {
  margin-top: 6px;
}

.description {
  padding: 16px;
  position: relative;
  border-radius: 4px;
  margin-bottom: 20px;
  color: #515a6e;
  line-height: 1.5;
  font-size: 14px;
  border: 1px solid #abdcff;
  background-color: #f0faff;
}

.iconfont {
  color: #06c05f;
}

::v-deep .el-tabs__nav-scroll {
  margin-top: -10px;
}
</style>
