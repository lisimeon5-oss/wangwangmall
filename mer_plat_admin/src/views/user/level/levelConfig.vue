<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-alert type="warning" effect="light" class="mb20" :closable="false" show-icon>
        <slot name="title">
          <div class="acea-row">
            <div>{{ $t('user.closeMemberTip') }}</div>
            <el-link type="primary" @click="handlerToLink('/page/design/viewDesign')" class="font12">{{ $t('user.goNow') }}</el-link>
          </div>
          <div class="acea-row row-middle mt10">
            <div class="line-heightOne">{{ $t('user.signExperienceTip') }}</div>
            <el-link type="primary" @click="handlerToLink('/marketing/sign/config')" class="font12 line-heightOne"
            >{{ $t('user.goNow') }}</el-link
            >
          </div>
        </slot>
      </el-alert>
      <div class="form-data" v-loading="loading">
        <z-b-parser
          v-if="!loading && checkPermi(['platform:finance:merchant:closing:config'])"
          :is-create="1"
          :form-conf="formConf"
          :edit-data="editData"
          :form-name="formName"
          :key-num="keyNum"
          @submit="handlerSubmit"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { systemUserLevelConfigApi, systemUserLevelUpdateConfigApi } from '@/api/user';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  name: 'levelConfig',
  data() {
    return {
      formConf: { fields: [] },
      loading: false,
      keyNum: 0,
      editData: {},
      formName: 'userlevelConfig',
    };
  },
  created() {
    //this.keyNum += 1
    this.getConfigInfo();
  },
  methods: {
    checkPermi,
    //立即前往
    handlerToLink(url) {
      const { href } = this.$router.resolve({
        path: url,
      });
      window.open(href);
    },
    handlerSubmit(formValue) {
      if (checkPermi(['platform:system:user:level:config:update'])) {
        systemUserLevelUpdateConfigApi(formValue)
          .then((res) => {
            this.$message.success(this.$t('user.operationSuccess'));
            this.getConfigInfo();
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.$message.warning(this.$t('user.noPermission'));
      }
    },
    // 获取配置信息
    getConfigInfo() {
      this.keyNum += 1;
      this.loading = true;
      systemUserLevelConfigApi()
        .then((res) => {
          this.editData = res;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped></style>
