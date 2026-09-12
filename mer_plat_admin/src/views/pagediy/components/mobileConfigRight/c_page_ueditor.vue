<template>
  <!--富文本编辑器-->
  <div class="box borderPadding" v-if="configData">
    <Tinymce :key="formLang" v-model="displayVal" style="width: 100%; height: 60%"></Tinymce>
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
import Tinymce from '@/components/Tinymce/index';
import { parseLangJsonMap } from '@/utils/localizedName';

export default {
  name: 'c_page_ueditor',
  props: {
    configObj: {
      type: Object,
    },
    configNme: {
      type: String,
    },
  },
  components: { Tinymce },
  data() {
    return {
      myConfig: {
        autoHeightEnabled: false,
        initialFrameHeight: 350,
        initialFrameWidth: '100%',
        UEDITOR_HOME_URL: '/UEditor/',
        imageFieldName: 'file',
        imageUrlPrefix: '',
        imageActionName: 'upfile',
        imageMaxSize: 2048000,
        imageAllowFiles: ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      },
      defaults: {},
      configData: {},
      defaultLangCode: 'zh-cn',
    };
  },
  computed: {
    formLang() {
      return (this.configObj && this.configObj.diyMediaLang) || this.defaultLangCode;
    },
    displayVal: {
      get() {
        if (!this.configData) return '';
        if (this.formLang === this.defaultLangCode) return this.configData.val || '';
        return parseLangJsonMap(this.configData.valJson)[this.formLang] || '';
      },
      set(val) {
        if (!this.configData) return;
        if (this.formLang === this.defaultLangCode) {
          this.$set(this.configData, 'val', val);
          return;
        }
        const map = parseLangJsonMap(this.configData.valJson);
        if (this.hasRichText(val)) map[this.formLang] = val;
        else delete map[this.formLang];
        this.$set(this.configData, 'valJson', Object.keys(map).length ? JSON.stringify(map) : '');
      },
    },
  },
  created() {
    this.defaults = this.configObj;
    this.configData = this.configObj[this.configNme];
  },
  watch: {
    configObj: {
      handler(nVal) {
        this.defaults = nVal;
        this.configData = nVal[this.configNme];
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    hasRichText(html) {
      return (
        String(html || '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/<[^>]+>/g, '')
          .trim().length > 0
      );
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep.mce-last {
  display: flex;
  flex-wrap: wrap;
}
</style>
