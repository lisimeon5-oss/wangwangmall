<template>
  <!--input输入框，选择链接-->
  <div class="box borderPadding" v-if="configData && configData.isShow === 1">
    <div class="lang-name-switch" v-if="isValI18n && !useParentLang">
      <el-radio-group v-model="activeLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="c_row-item">
      <div class="title labelwidth">
        {{ diyUiText(configData.title) }}
      </div>
      <div class="slider-box ml22">
        <div @click="getLink(configData.title)">
          <el-input
            v-if="isValI18n"
            size="small"
            :value="placeInput"
            :placeholder="placePlaceholder"
            :maxlength="configData.max"
            @input="onPlaceInput"
          />
          <el-input
            v-else
            size="small"
            icon="ios-arrow-forward"
            :icon="isLinkTitle ? 'ios-arrow-forward' : ''"
            :readonly="isLinkTitle"
            v-model="configData.val"
            :placeholder="diyUiText(configData.place)"
            :maxlength="configData.max"
          >
            <el-button
              v-if="isLinkTitle"
              slot="append"
              icon="el-icon-arrow-right"
            ></el-button>
            <span slot="suffix">{{ configData.unit || '' }}</span>
          </el-input>
        </div>
      </div>
    </div>
    <linkaddress ref="linkaddres" @linkUrl="linkUrl"></linkaddress>
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
import linkaddress from '@/components/linkaddress';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang } from '@/utils/localizedName';
import { diyUiText } from '@/utils/diyCname';
export default {
  name: 'c_input_item',
  props: {
    configObj: {
      type: Object,
    },
    configNme: {
      type: String,
    },
  },
  components: {
    linkaddress,
  },
  data() {
    return {
      value: '',
      defaults: {},
      configData: {},
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
    };
  },
  computed: {
    isLinkTitle() {
      const t = this.configData && this.configData.title;
      return t === this.$t('pagediy.link') || t === this.$t('pagediy.moreLink') || t === '链接' || t === '更多链接';
    },
    isValI18n() {
      const name = this.defaults && this.defaults.name;
      return (
        this.configNme === 'placeWords' ||
        (this.configNme === 'titleConfig' &&
          (name === 'homeMerchant' ||
            name === 'seckill' ||
            name === 'group' ||
            name === 'intergral' ||
            name === 'homeDiscover')) ||
        (name === 'titles' &&
          (this.configNme === 'titleConfig' || this.configNme === 'titleFuConfig' || this.configNme === 'titleRightConfig'))
      );
    },
    useParentLang() {
      return (
        this.defaults &&
        (this.defaults.name === 'seckill' ||
          this.defaults.name === 'group' ||
          this.defaults.name === 'intergral' ||
          this.defaults.name === 'homeDiscover') &&
        this.configObj &&
        this.configObj.diyMediaLang
      );
    },
    formLang() {
      if (this.useParentLang) return this.configObj.diyMediaLang;
      return this.activeLang;
    },
    formLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.formLang);
      return lang ? lang.label : this.formLang;
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
    placeInput() {
      if (!this.configData) return '';
      if (this.formLang === this.defaultLangCode) return this.configData.val || this.configData.value || '';
      return parseLangJsonMap(this.configData.valJson)[this.formLang] || '';
    },
    placePlaceholder() {
      if (this.formLang === this.defaultLangCode) {
        return (
          this.configData.place ||
          (this.configNme === 'titleConfig' ? this.$t('pagediy.pleaseEnterTitle') : this.$t('pagediy.searchProductName'))
        );
      }
      if (this.configNme === 'titleConfig') return this.$t('pagediy.inputTitleInLang', { lang: this.formLangLabel });
      if (this.configNme === 'titleFuConfig') return this.$t('pagediy.inputSubtitleInLang', { lang: this.formLangLabel });
      if (this.configNme === 'titleRightConfig') return this.$t('pagediy.inputRightTextInLang', { lang: this.formLangLabel });
      return this.$t('pagediy.inputHintTextInLang', { lang: this.formLangLabel });
    },
  },
  created() {
    this.defaults = this.configObj;
    this.configData = this.configObj[this.configNme];
    this.syncPlaceVal();
    this.getLanguageList();
  },
  watch: {
    configObj: {
      handler(nVal, oVal) {
        this.defaults = nVal;
        this.configData = nVal[this.configNme];
        this.syncPlaceVal();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    diyUiText,
    syncPlaceVal() {
      if (!this.isValI18n || !this.configData) return;
      if (!this.configData.val && this.configData.value) this.$set(this.configData, 'val', this.configData.value);
    },
    onPlaceInput(val) {
      if (this.formLang === this.defaultLangCode) {
        this.$set(this.configData, 'val', val);
        return;
      }
      const map = parseLangJsonMap(this.configData.valJson);
      if (String(val || '').trim()) map[this.formLang] = val;
      else delete map[this.formLang];
      this.$set(this.configData, 'valJson', Object.keys(map).length ? JSON.stringify(map) : '');
    },
    getLanguageList() {
      if (!this.isValI18n) return;
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
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    linkUrl(e) {
      this.configData.val = e;
      this.$emit('getConfig', { name: 'c_input_item', values: this.configData.val });
    },
    getLink(title) {
      if (!this.isLinkTitle) {
        return;
      }
      this.$refs.linkaddres.dialogVisible = true;
    },
  },
};
</script>

<style scoped lang="scss">
.title {
  font-size: 12px;
  color: #999;
}
::v-deep .el-input--medium,
::v-deep.ivu-input {
  font-size: 12px !important;
}
.c_row-item {
  margin-bottom: 20px;
}
.slider-box {
  ::v-deep.el-input__suffix {
    top: 10px !important;
  }
}

.label {
  font-size: 12px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #999999;
}
.lang-name-switch {
  width: 100%;
  margin-bottom: 10px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
