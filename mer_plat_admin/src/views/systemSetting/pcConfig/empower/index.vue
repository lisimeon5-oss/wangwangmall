<script setup>
import FromList from '@/components/FromList/index.vue';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import {
  bottomQrcodeGetApi,
  bottomQrcodeSaveApi,
  pcFriendlyLinkGetApi,
  pcFriendlyLinkSaveApi,
  pcPhilosophyGetApi,
  pcPhilosophySaveApi,
  shoppingQuickEntryGetApi,
  shoppingQuickEntrySaveApi,
} from '@/api/systemPcConfig';
import {
  bottomQrcodeDefault,
  friendlyLinkDefault,
  philosophyDefault,
  shoppingQuickEntryDefault,
} from '@/views/systemSetting/pcConfig/defaultPcConfig';
import { hasI18nNameContent, parseLangJsonMap } from '@/utils/localizedName';
export default {
  name: 'empower',
  components: { FromList },
  data() {
    return {
      currentTab: '1',
      tabList: [
        { value: '1', title: this.$t('systemSetting.businessPhilosophy') },
        // { value: '2', title: this.$t('systemSetting.authorizationRecord') },
        { value: '3', title: this.$t('systemSetting.moduleLink') },
        { value: '4', title: this.$t('systemSetting.qrCodeConfig') },
        { value: '5', title: this.$t('systemSetting.friendlyLink') },
      ],
      //经营理念
      philosophyConfig: Object.assign({}, philosophyDefault()),
      fullscreenLoading: false,
      ruleValidate: {
        authInfo: [{ required: true, message: this.$t('systemSetting.pleaseEnterAuthorizationInfo'), trigger: 'blur' }],
        filingNum: [{ required: true, message: this.$t('systemSetting.pleaseEnterRecordNo'), trigger: 'blur' }],
      },
      // 友情链接
      friendlyLinkConfig: Object.assign({}, friendlyLinkDefault()),
      loadingBtn: false,
      // 二维码
      bottomQrcodeConfig: Object.assign({}, bottomQrcodeDefault()),
      //PC商城快捷入口配置
      shoppingQuickEntryConfig: Object.assign({}, shoppingQuickEntryDefault()),
    };
  },
  mounted() {
    if (checkPermi(['platform:pc:shopping:philosophy:get'])) this.getPhilosophy();
    if (checkPermi(['platform:pc:shopping:friendly:link:get'])) this.getFriendly();
    if (checkPermi(['platform:pc:shopping:bottom:qrcode:get'])) this.getBottomQrcode();
    if (checkPermi(['platform:pc:shopping:quick:entry:get'])) this.getShoppingQuickEntry();
  },
  methods: {
    checkPermi,
    //经验理念新增
    handlePhilosophySave() {
      this.philosophyConfig.list.map((item, index) => {
        item.sort = index + 1;
      });
      const missing = this.philosophyConfig.list.some(
        (item) => !item.imageUrl || !hasI18nNameContent(item.name, parseLangJsonMap(item.nameJson)),
      );
      if (missing) {
        const noImage = this.philosophyConfig.list.some((item) => !item.imageUrl);
        return this.$message.warning(
          noImage ? this.$t('systemSetting.imageAddressRequired') : this.$t('systemSetting.philosophyRequired'),
        );
      }
      this.loadingBtn = true;
      pcPhilosophySaveApi({ philosophyVoList: this.philosophyConfig.list })
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getPhilosophy();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    //经验理念
    getPhilosophy() {
      pcPhilosophyGetApi().then((res) => {
        let philosophyVoList = res.philosophyVoList;
        if (philosophyVoList.length) this.philosophyConfig.list = res.philosophyVoList;
      });
    },
    //友情链接保存
    handleFriendlySave() {
      this.loadingBtn = true;
      this.friendlyLinkConfig.list.map((item, index) => {
        item.sort = index + 1;
      });
      pcFriendlyLinkSaveApi(this.friendlyLinkConfig.list)
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getFriendly();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    //获取友情链接
    getFriendly() {
      pcFriendlyLinkGetApi().then((res) => {
        this.friendlyLinkConfig.list = res;
      });
    },
    //底部二维码
    handleBottomQrcodeSave() {
      this.loadingBtn = true;
      this.bottomQrcodeConfig.list.map((item, index) => {
        item.sort = index + 1;
      });

      bottomQrcodeSaveApi(this.bottomQrcodeConfig.list)
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getBottomQrcode();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    //获取底部二维码
    getBottomQrcode() {
      bottomQrcodeGetApi().then((res) => {
        if (res.length > 0) this.bottomQrcodeConfig.list = res;
      });
    },
    //保存模块链接
    handleShoppingQuickEntrySave() {
      this.loadingBtn = true;
      this.shoppingQuickEntryConfig.list.map((item, index) => {
        item.sort = index + 1;
      });
      shoppingQuickEntrySaveApi(this.shoppingQuickEntryConfig.list)
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getShoppingQuickEntry();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    //获取模块链接
    getShoppingQuickEntry() {
      shoppingQuickEntryGetApi().then((res) => {
        this.shoppingQuickEntryConfig.list = res && res.length ? res : [];
      });
    },
  },
};
</script>

<template>
  <div class="divBox">
    <el-card class="box-card mb20" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs class="list-tabs" v-model="currentTab">
        <el-tab-pane v-for="(item, index) in tabList" :key="index" :name="item.value" :label="item.title" />
      </el-tabs>
      <!-- 经营理念-->
      <div v-if="currentTab === '1'">
        <FromList :configObj="philosophyConfig"></FromList>
        <el-button type="primary" v-hasPermi="['platform:pc:shopping:philosophy:save']" @click="handlePhilosophySave">{{
          loadingBtn ? $t('finance.submitting') : $t('common.save')
        }}</el-button>
      </div>
      <!-- 模块链接-->
      <div v-if="currentTab === '3'">
        <FromList :configObj="shoppingQuickEntryConfig"></FromList>
        <el-button
          v-hasPermi="['platform:pc:shopping:quick:entry:save']"
          type="primary"
          @click="handleShoppingQuickEntrySave"
          >{{ loadingBtn ? $t('finance.submitting') : $t('common.save') }}</el-button
        >
      </div>
      <!-- 二维码配置 -->
      <div v-if="currentTab === '4'">
        <FromList :configObj="bottomQrcodeConfig"></FromList>
        <el-button
          v-hasPermi="['platform:pc:shopping:bottom:qrcode:save']"
          type="primary"
          @click="handleBottomQrcodeSave"
          >{{ loadingBtn ? $t('finance.submitting') : $t('common.save') }}</el-button
        >
      </div>
      <!-- 友情链接-->
      <div v-if="currentTab === '5'">
        <FromList :configObj="friendlyLinkConfig"></FromList>
        <el-button
          v-hasPermi="['platform:pc:shopping:friendly:link:save']"
          type="primary"
          @click="handleFriendlySave"
          >{{ loadingBtn ? $t('finance.submitting') : $t('common.save') }}</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.authorize {
  .title {
    padding-left: 10px;
    border-left: 3px solid var(--prev-color-primary);
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    color: #303133;
  }
}
.selWidth {
  width: 600px;
}
</style>
