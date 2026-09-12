<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <h3 class="title">{{ $t('user.levelRuleDesc') }}</h3>
      <div class="lang-name-switch mb20">
        <el-radio-group v-model="activeLang" size="small">
          <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
            {{ lang.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <Tinymce :key="editorKey" v-model="currentRule" class="mb20"></Tinymce>
      <el-button type="primary" plain class="submission" size="small" @click="previewProtol">{{ $t('user.preview') }}</el-button>
      <el-button
        type="primary"
        class="submission"
        v-hasPermi="['platform:system:user:level:rule:update']"
        size="small"
        v-debounceClick="
          () => {
            handleSubmit('formValidate');
          }
        "
        >{{ $t('common.submit') }}</el-button
      >
    </el-card>
    <div class="Box">
      <el-dialog
        v-if="modals"
        :visible.sync="modals"
        title=""
        height="30%"
        custom-class="dialog-scustom"
        class="addDia"
      >
        <div class="agreement">
          <h3>{{ $t('user.levelRuleDesc') }}</h3>
          <div class="content">
            <div v-html="currentRule"></div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce/index';
import { systemUserLevelRuleApi, systemUserLevelUpdateRuleApi } from '@/api/user';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';

import { resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'description',
  components: { Tinymce },
  data() {
    return {
      agreement: '',
      formValidate: {
        rule: '',
        ruleJson: '',
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      ruleJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      keyIndex: Math.random(),
      fullscreenLoading: false,
      modals: false,
    };
  },
  computed: {
    editorKey() {
      return `${this.keyIndex}-${this.activeLang}`;
    },
    currentRule: {
      get() {
        if (this.activeLang === this.defaultLangCode) {
          return this.formValidate.rule || '';
        }
        return this.ruleJsonForm[this.activeLang] || '';
      },
      set(val) {
        if (this.activeLang === this.defaultLangCode) {
          this.formValidate.rule = val;
        } else {
          this.$set(this.ruleJsonForm, this.activeLang, val);
        }
      },
    },
  },
  mounted() {
    this.getLanguageList();
    this.getInfo();
  },
  methods: {
    emptyRuleJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
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
          this.ruleJsonForm = this.parseRuleJson(this.formValidate.ruleJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.ruleJsonForm = this.parseRuleJson(this.formValidate.ruleJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    parseRuleJson(ruleJson) {
      const form = this.emptyRuleJsonForm();
      if (!ruleJson) return form;
      try {
        const obj = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    buildRuleJson() {
      const obj = {};
      this.langOptions.forEach((lang) => {
        if (lang.code === this.defaultLangCode) return;
        const value = this.ruleJsonForm[lang.code] || '';
        if (value && value.replace(/<[^>]+>/g, '').trim()) obj[lang.code] = value;
      });
      return Object.keys(obj).length ? JSON.stringify(obj) : '';
    },
    isEmptyHtml(html) {
      if (!html) return true;
      return !String(html).replace(/<[^>]+>/g, '').trim();
    },
    getInfo() {
      this.fullscreenLoading = true;
      systemUserLevelRuleApi()
        .then((res) => {
          if (typeof res === 'string') {
            this.formValidate.rule = res;
            this.formValidate.ruleJson = '';
          } else {
            this.formValidate.rule = (res && res.rule) || '';
            this.formValidate.ruleJson = (res && res.ruleJson) || '';
          }
          this.ruleJsonForm = this.parseRuleJson(this.formValidate.ruleJson);
          this.keyIndex = Math.random();
          this.fullscreenLoading = false;
        })
        .catch((res) => {
          this.fullscreenLoading = false;
        });
    },

    // 提交
    handleSubmit() {
      if (this.isEmptyHtml(this.formValidate.rule)) {
        return this.$message.warning(this.$t('user.pleaseEnterRuleInfo'));
      } else {
        this.fullscreenLoading = true;
        systemUserLevelUpdateRuleApi({
          rule: this.formValidate.rule,
          ruleJson: this.buildRuleJson(),
        })
          .then(async (res) => {
            this.fullscreenLoading = false;
            this.$message.success(this.$t('user.submitSuccess'));
          })
          .catch((res) => {
            this.fullscreenLoading = false;
          });
      }
    },
    previewProtol() {
      this.modals = true;
    },
  },
};
</script>

<style scoped lang="scss">
.dialog-scustom,
.addDia {
  min-width: 400px;
  height: 900px;
  .el-dialog {
    width: 400px;
  }
  h3 {
    color: #333;
    font-size: 16px;
    text-align: center;
    font-weight: bold;
    margin: 0;
  }
}
.title {
  font-weight: bold;
  font-size: 18px;
  width: 1000px;
  margin-bottom: 20px;
}
.lang-name-switch {
  width: 100%;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.agreement {
  width: 350px;
  margin: 0 auto;
  box-shadow: 1px 5px 5px 2px rgba(0, 0, 0, 0.2);
  padding: 26px;
  border-radius: 15px;
  .content {
    height: 600px;
    overflow-y: scroll;
    ::v-deep p {
      font-size: 13px;
      line-height: 22px;
    }
  }
  ::v-deep img {
    max-width: 100%;
  }
  p {
    text-align: justify;
  }
}
/*css主要部分的样式*/
/*定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸*/

::-webkit-scrollbar {
  width: 10px; /*对垂直流动条有效*/
  height: 10px; /*对水平流动条有效*/
}

/*定义滚动条的轨道颜色、内阴影及圆角*/
::-webkit-scrollbar-track {
  /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);*/
  background-color: transparent;
  border-radius: 3px;
}
</style>
