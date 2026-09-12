<template>
  <div class="mobile-config">
    <div class="lang-name-switch" v-if="showMediaLang">
      <el-radio-group v-model="mediaLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div v-for="(item, key) in rCom" :key="key">
      <component
        :is="item.components.name"
        :configObj="configObj"
        ref="childData"
        :configNme="item.configNme"
        :key="key"
        @getConfig="getConfig"
        :index="activeIndex"
        :num="item.num"
      ></component>
    </div>
    <rightBtn :activeIndex="activeIndex" :configObj="configObj"></rightBtn>
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
import toolCom from '../mobileConfigRight/index.js';
import rightBtn from '../rightBtn/index.vue';
import { applyDiyUiLabels } from '@/utils/diyCname';
import ueditorPage from '../mobilePage/z_ueditor.vue';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'c_ueditor_box',
  componentsName: 'z_ueditor',
  components: {
    ...toolCom,
    rightBtn,
  },
  props: {
    activeIndex: {
      type: null,
    },
    num: {
      type: null,
    },
    index: {
      type: null,
    },
  },
  data() {
    return {
      configObj: {},
      rCom: [
        {
          components: toolCom.c_checked_tab,
          configNme: 'setUp',
        },
      ],
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
    };
  },
  computed: {
    showMediaLang() {
      return this.configObj && this.configObj.setUp && Number(this.configObj.setUp.tabVal) === 0;
    },
    mediaLang: {
      get() {
        return (this.configObj && this.configObj.diyMediaLang) || this.defaultLangCode;
      },
      set(val) {
        this.$set(this.configObj, 'diyMediaLang', val);
      },
    },
  },
  watch: {
    num(nVal) {
      this.loadConfig(nVal);
    },
    configObj: {
      handler(nVal, oVal) {
        this.$store.commit('mobildConfig/UPDATEARR', { num: this.num, val: nVal });
      },
      deep: true,
    },
    'configObj.setUp.tabVal': {
      handler(nVal, oVal) {
        var arr = [this.rCom[0]];
        if (nVal == 0) {
          let tempArr = [
            {
              components: toolCom.c_title,
              configNme: 'richText',
            },
            {
              components: toolCom.c_page_ueditor,
              configNme: 'richText',
            },
          ];
          this.rCom = arr.concat(tempArr);
        } else {
          let tempArr = [
            {
              components: toolCom.c_title,
              configNme: 'bgColor',
            },
            {
              components: toolCom.c_bg_color,
              configNme: 'bgColor',
            },
            {
              components: toolCom.c_title,
              configNme: 'lrConfig',
            },
            {
              components: toolCom.c_slider,
              configNme: 'lrConfig',
            },
            {
              components: toolCom.c_slider,
              configNme: 'mbConfig',
            },
            {
              components: toolCom.c_title,
              configNme: 'bgStyle',
            },
            {
              components: toolCom.c_slider,
              configNme: 'bgStyle',
            },
          ];
          this.rCom = arr.concat(tempArr);
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.getLanguageList();
    this.$nextTick(() => {
      this.loadConfig(this.num);
    });
  },
  methods: {
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
          this.mediaLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.mediaLang = resolveFormActiveLang(this);
        });
    },
    loadConfig(nVal) {
      const raw = this.$store.state.mobildConfig.defaultArray[nVal];
      if (!raw) return;
      const value = JSON.parse(JSON.stringify(raw));
      if (!value.diyMediaLang) value.diyMediaLang = this.defaultLangCode;
      if (!value.richText) value.richText = { val: '', valJson: '' };
      if (!Object.prototype.hasOwnProperty.call(value.richText, 'valJson')) {
        value.richText.valJson = '';
      }
      this.configObj = applyDiyUiLabels(value, { data: ueditorPage.data, num: nVal });
    },
    getConfig() {},
  },
};
</script>

<style scoped lang="scss">
.lang-name-switch {
  padding: 12px 20px 0;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
