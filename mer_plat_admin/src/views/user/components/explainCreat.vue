<template>
  <el-drawer
    :visible.sync="drawerVisible"
    :wrapperClosable="false"
    direction="rtl"
    size="1000px"
    :before-close="handleClose"
    class="showHeader"
  >
    <div slot="title" class="demo-drawer_title">{{ $t('user.benefitDescription') }}</div>
    <div class="detailSection">
      <el-form :model="pram" ref="pram" label-width="75px" class="demo-ruleForm px35">
        <el-form-item :label="$t('user.benefitNameLabel')">
          <div class="from-ipt-width el-input el-input--small" disabled>
            <span class="el-input__inner">
              {{ pram.name | filterMemberBenefits }}
            </span>
          </div>
        </el-form-item>
        <el-form-item
          :label="$t('user.benefitDescLabel')"
          prop="expand"
          :rules="[{ required: true, message: $t('user.pleaseFillBenefitDesc'), trigger: ['blur', 'change'] }]"
        >
          <div class="lang-name-switch mb10">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <Tinymce :key="editorKey" v-model="currentExpand"></Tinymce>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="checkPermi(['platform:paid:member:benefits:statement:edit'])"
            type="primary"
            v-debounceClick="submitForm"
            >{{ $t('common.submit') }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
</template>
<script>
import Tinymce from '@/components/Tinymce/index.vue';
import { memberBenefitsStatementEditApi } from '@/api/user';
import { checkPermi } from '@/utils/permission';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';

import { resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'explainCreat',
  components: { Tinymce },
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
        expand: '',
        expandJson: '',
        id: 0,
        name: '',
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      expandJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
    };
  },
  computed: {
    editorKey() {
      return `${this.pram.id || 0}-${this.activeLang}-${this.uiLocale}`;
    },
    uiLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
    currentExpand: {
      get() {
        if (this.activeLang === this.defaultLangCode) {
          return this.pram.expand || '';
        }
        return this.expandJsonForm[this.activeLang] || '';
      },
      set(val) {
        if (this.activeLang === this.defaultLangCode) {
          this.pram.expand = val;
        } else {
          this.$set(this.expandJsonForm, this.activeLang, val);
        }
      },
    },
  },
  mounted() {
    this.pram = Object.assign({ expand: '', expandJson: '', id: 0, name: '' }, this.pramInfo);
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
    buildJson() {
      const obj = {};
      this.langOptions.forEach((lang) => {
        if (lang.code === this.defaultLangCode) return;
        const value = this.expandJsonForm[lang.code] || '';
        if (value && String(value).replace(/<[^>]+>/g, '').trim()) obj[lang.code] = value;
      });
      return Object.keys(obj).length ? JSON.stringify(obj) : '';
    },
    isEmptyHtml(html) {
      if (!html) return true;
      return !String(html).replace(/<[^>]+>/g, '').trim();
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
          this.expandJsonForm = this.parseJson(this.pram && this.pram.expandJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.expandJsonForm = this.parseJson(this.pram && this.pram.expandJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    handleClose() {
      this.$emit('onClosedrawerVisible');
    },
    submitForm() {
      this.$refs.pram.validate((valid) => {
        if (!valid) return;
        if (this.isEmptyHtml(this.pram.expand)) {
          return this.$message.warning(this.$t('user.pleaseFillBenefitDesc'));
        }
        memberBenefitsStatementEditApi({
          id: this.pram.id,
          expand: this.pram.expand,
          expandJson: this.buildJson(),
        }).then(() => {
          this.$modal.msgSuccess(this.$t('user.saveSuccess'));
          this.$emit('subSuccess');
        });
      });
    },
  },
};
</script>

<style scoped lang="scss">
.lang-name-switch {
  width: 100%;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
