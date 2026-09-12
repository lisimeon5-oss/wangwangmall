<script setup>
import { pcBaseConfigEditApi, pcBaseConfigGetApi } from '@/api/systemPcConfig';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  name: 'basicSettings',
  data() {
    return {
      fullscreenLoading: false,
      ruleValidate: {
        goodStoreImage: [{ required: true, message: this.$t('systemSetting.pleaseUploadBrandStoreAd'), trigger: 'change' }],
        leftTopLogo: [{ required: true, message: this.$t('systemSetting.pleaseUploadTopLeftLogo'), trigger: 'change' }],
        goPhoneQrCodeTypeList: [
          { type: 'array', required: true, message: this.$t('systemSetting.pleaseSelectQrCodeType'), trigger: 'change' },
        ],
      },
      formValidate: {
        goPhoneQrCodeTypeList: [],
        goodStoreImage: '',
        leftTopLogo: '',
        goPhoneQrCodeType: '',
        merchantApplySwitch: "1"
      },
    };
  },
  mounted() {
    if (checkPermi(['platform:pc:shopping:base:config:get'])) this.getBaseConfig();
  },
  methods: {
    checkPermi,
    //上传图片
    modalPicTap(multiple, name) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (name === 'leftTopLogo') {
            _this.formValidate.leftTopLogo = img[0].sattDir;
          } else {
            _this.formValidate.goodStoreImage = img[0].sattDir;
          }
        },
        multiple,
        'imageUrl',
      );
    },
    //保存
    handleBaseConfigSave(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loadingBtn = true;
          this.formValidate.goPhoneQrCodeType = this.formValidate.goPhoneQrCodeTypeList.join(',');
          pcBaseConfigEditApi(this.formValidate)
            .then((res) => {
              this.$message.success(this.$t('user.saveSuccess'));
              this.loadingBtn = false;
              this.getBaseConfig();
            })
            .catch(() => {
              this.loadingBtn = false;
            });
        } else {
          return false;
        }
      });
    },
    getBaseConfig() {
      pcBaseConfigGetApi().then((res) => {
        Object.assign(this.formValidate, res);
        this.formValidate.goPhoneQrCodeTypeList = res.goPhoneQrCodeType ? res.goPhoneQrCodeType.split(',') : [];
      });
    },
  },
};
</script>

<template>
  <div class="divBox">
    <el-card class="box-card" :body-style="{ padding: '40px 50px' }" shadow="never" :bordered="false">
      <el-form
        ref="formValidate"
        v-loading="fullscreenLoading"
        class="formValidate"
        :rules="ruleValidate"
        :model="formValidate"
        label-width="180px"
        @submit.native.prevent
      >
        <el-form-item :label="$t('systemSetting.pcTopLeftLogoLabel')" prop="leftTopLogo">
          <div class="upLoadPicBox" @click="modalPicTap(false, 'leftTopLogo')">
            <div v-if="formValidate.leftTopLogo" class="pictrue"><img :src="formValidate.leftTopLogo" /></div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.brandStoreAdImageLabel')" prop="goodStoreImage">
          <div class="upLoadPicBox" @click="modalPicTap(false, 'goodStoreImage')">
            <div v-if="formValidate.goodStoreImage" class="pictrue"><img :src="formValidate.goodStoreImage" /></div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.phoneExperienceLabel')">
          <el-checkbox-group v-model="formValidate.goPhoneQrCodeTypeList">
            <el-checkbox label="1">{{ $t('common.miniProgram') }}</el-checkbox>
            <el-checkbox label="2">{{ $t('systemSetting.officialAccountH5') }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('systemSetting.merchantOnboardingEntryLabel')">
          <el-switch
            v-model="formValidate.merchantApplySwitch"
            active-value="1"
            inactive-value="0"
            :active-text="$t('common.open')"
            :inactive-text="$t('common.close')"
          />
        </el-form-item>
        <el-form-item v-hasPermi="['platform:pc:shopping:base:config:edit']">
          <el-button
            size="small"
            type="primary"
            v-debounceClick="
              () => {
                handleBaseConfigSave('formValidate');
              }
            "
            >{{ $t('common.save') }}</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
