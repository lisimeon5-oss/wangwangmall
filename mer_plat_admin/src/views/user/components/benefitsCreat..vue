<template>
  <el-drawer
    :visible.sync="drawerVisible"
    :wrapperClosable="false"
    direction="rtl"
    size="800px"
    :before-close="handleClose"
    class="showHeader"
  >
    <div slot="title" class="demo-drawer_title">{{ $t('user.memberBenefitSetting') }}</div>
    <div class="detailSection">
      <el-form :model="pram" ref="pram" label-width="75px" class="demo-ruleForm px35" :rules="rules">
        <el-form-item :label="$t('user.benefitNameLabel')">
          <div class="from-ipt-width el-input el-input--small" disabled>
            <span class="el-input__inner">
              {{ pram.name | filterMemberBenefits }}
            </span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('user.displayNameLabel')" prop="value">
          <div class="lang-name-switch from-ipt-width">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model="pram.value"
              maxlength="6"
              class="lang-name-input"
            />
            <el-input
              v-else
              v-model="valueJsonForm[activeLang]"
              maxlength="20"
              :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
              class="lang-name-input"
            />
          </div>
          <div class="from-tips">{{ $t('user.displayNameTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.benefitIconLabel')" prop="imageUrl">
          <div class="upLoadPicBox acea-row" @click="modalPicTap(false)">
            <div v-if="pram.imageUrl" class="pictrue"><img :src="pram.imageUrl" /></div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
          <div class="from-tips">{{ $t('user.benefitIconTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.benefitIntroLabel')" prop="message">
          <el-input
            v-if="activeLang === defaultLangCode"
            class="from-ipt-width"
            v-model.trim="pram.message"
            maxlength="8"
            :placeholder="$t('user.pleaseEnterProductIntro')"
          />
          <el-input
            v-else
            class="from-ipt-width"
            v-model.trim="messageJsonForm[activeLang]"
            maxlength="40"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
          />
          <div class="from-tips">{{ $t('user.benefitIntroTip') }}</div>
        </el-form-item>
        <template v-if="pram.name === 'integralDoubling' || pram.name === 'experienceDoubling'">
          <el-form-item :label="$t('user.multiple')" required>
            <el-input-number v-model.trim="pram.multiple" :min="1" :max="9" :step="1" :placeholder="$t('user.pleaseEnterSort')" />
            <div class="from-tips">{{ $t('user.multipleTip') }}</div>
          </el-form-item>
          <el-form-item :label="$t('user.doublingChannel')" required>
            <el-checkbox-group v-model="pram.channelStrList" @change="checkedBoxChange">
              <template v-if="pram.name === 'integralDoubling'">
                <el-checkbox label="1">{{ $t('user.signIn') }}</el-checkbox>
                <el-checkbox label="2">{{ $t('user.buyProduct') }}</el-checkbox>
              </template>
              <template v-if="pram.name === 'experienceDoubling'">
                <el-checkbox label="1">{{ $t('user.signIn') }}</el-checkbox>
                <el-checkbox label="2">{{ $t('user.publishGrass') }}</el-checkbox>
              </template>
            </el-checkbox-group>
            <div class="from-tips">{{ $t('user.channelTip') }}</div>
          </el-form-item>
        </template>
        <el-form-item :label="$t('user.sortLabel')" required>
          <el-input-number v-model.trim="pram.sort" :min="0" :max="10" :step="1" :placeholder="$t('user.pleaseEnterSort')" />
          <div class="from-tips">{{ $t('user.sortTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.statusColon')" required>
          <el-switch
            v-model="pram.status"
            :active-text="$t('user.on')"
            :inactive-text="$t('user.off')"
            :active-value="true"
            :inactive-value="false"
          />
          <div class="from-tips">{{ $t('user.benefitStatusTip') }}</div>
        </el-form-item>
      </el-form>
    </div>
    <div class="demo-drawer__footer from-foot-btn btn-shadow drawer_fix">
      <div class="acea-row row-center">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button v-if="checkPermi(['platform:paid:member:benefits:edit'])" type="primary" v-debounceClick="submitForm"
          >{{ $t('common.confirmPrefix') }}</el-button
        >
      </div>
    </div>
  </el-drawer>
</template>
<script>
import { checkPermi } from '@/utils/permission';
import { memberBenefitsEditApi } from '@/api/user';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';


import { resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'benefitsEdit',
  props: {
    //是否显示隐藏
    drawerVisible: {
      type: Boolean,
      default: false,
    },
    pramInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pram: {
        channelStrList: [],
        channelStr: '',
        expand: '',
        id: 0,
        imageUrl: '',
        message: '',
        messageJson: '',
        multiple: 1,
        name: '',
        sort: 0,
        status: true,
        value: '',
        valueJson: '',
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      valueJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      messageJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
    };
  },
  computed: {
    rules() {
      return {
        value: [
          { required: true, message: this.$t('user.pleaseEnterDisplayName'), trigger: 'blur' },
          { min: 1, max: 6, message: this.$t('user.length1to6'), trigger: 'blur' },
        ],
        imageUrl: [{ required: true, message: this.$t('user.pleaseUploadBenefitIcon'), trigger: 'change' }],
        message: [{ required: true, message: this.$t('user.pleaseEnterBenefitIntro'), trigger: 'blur' }],
        channelStrList: [{ type: 'array', required: true, message: this.$t('user.pleaseSelectChannel'), trigger: 'change' }],
      };
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
  },
  mounted() {
    this.pram = Object.assign({}, this.pramInfo);
    this.pram.channelStrList = this.pram.channelStr ? [...this.pram.channelStr.split(',')] : [];
    this.getLanguageList();
  },
  methods: {
    checkPermi,
    emptyLangForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseJson(json) {
      const form = this.emptyLangForm();
      if (!json) return form;
      try {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    buildJson(form) {
      const obj = {};
      this.langOptions.forEach((lang) => {
        if (lang.code === this.defaultLangCode) return;
        const value = (form[lang.code] || '').trim();
        if (value) obj[lang.code] = value;
      });
      return Object.keys(obj).length ? JSON.stringify(obj) : '';
    },
    getLanguageList() {
      systemLanguageList()
        .then((list) => {
          if (!list || list.length === 0) {
            this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          } else {
            this.langOptions = list.map((item) => ({
              code: item.code,
              label: item.name,
              isDefault: item.isDefault,
            }));
            const defaultLang = list.find((item) => item.isDefault);
            this.defaultLangCode = defaultLang ? defaultLang.code : 'zh-cn';
          }
          this.valueJsonForm = this.parseJson(this.pram && this.pram.valueJson);
          this.messageJsonForm = this.parseJson(this.pram && this.pram.messageJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.valueJsonForm = this.parseJson(this.pram && this.pram.valueJson);
          this.messageJsonForm = this.parseJson(this.pram && this.pram.messageJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    checkedBoxChange() {
      this.$forceUpdate(); //强制渲染多选框样式，否则值变了样式没有选中
    },
    handleClose() {
      this.$emit('onClosedrawerVisible');
    },
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.pram.imageUrl = img[0].sattDir;
        },
        multiple,
        'content',
      );
    },
    submitForm() {
      this.$refs.pram.validate((valid) => {
        if (valid) {
          if (
            !this.pram.channelStrList.length &&
            (this.pram.name === 'integralDoubling' || this.pram.name === 'experienceDoubling')
          )
            return this.$modal.msgWarning(this.$t('user.channelRequired'));
          this.pram.channelStr = this.pram.channelStrList.join(',');
          this.pram.valueJson = this.buildJson(this.valueJsonForm);
          this.pram.messageJson = this.buildJson(this.messageJsonForm);
          memberBenefitsEditApi(this.pram).then((response) => {
            this.$modal.msgSuccess(this.$t('user.saveSuccess'));
            this.$forceUpdate();
            this.$emit('subSuccess');
          });
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.detailSection form {
  padding-bottom: 80px;
}
.lang-name-switch {
  width: 100%;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.lang-name-input {
  margin-top: 10px;
}
</style>
