<template>
  <!--上传图片-->
  <div v-if="configData && configData.isShow === 1">
    <div class="lang-name-switch" v-if="isIconI18n && !useParentLang">
      <el-radio-group v-model="activeLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="upload_img acea-row row-between borderPadding">
      <div>
        <div class="header">{{ diyUiText(configData.title) }}</div>
        <div class="title">{{ diyUiText(configData.tips) }}</div>
      </div>
      <div class="box" @click="modalPicTap">
        <img :src="displayUrl" alt="" v-if="displayUrl" />
        <div class="upload-box" v-else><span class="iconfont icon-tianjia1" /></div>
        <span
          class="iconfont-diy iconfont icon-tianjia1"
          @click.stop="bindDelete"
          v-if="displayUrl && configData.type"
        ></span>
      </div>
    </div>
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
import { mapState } from 'vuex';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang } from '@/utils/localizedName';
import { diyUiText } from '@/utils/diyCname';
export default {
  name: 'c_upload_img',
  computed: {
    ...mapState({
      tabVal: (state) => state.admin.mobildConfig.searchConfig.data.tabVal,
    }),
    isIconI18n() {
      const name = this.defaults && this.defaults.name;
      return name === 'homeMerchant' || name === 'news' || name === 'seckill' || name === 'group' || name === 'intergral' || name === 'homeDiscover';
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
    mediaLang() {
      if (this.useParentLang) return this.configObj.diyMediaLang;
      return this.activeLang;
    },
    displayUrl() {
      if (!this.configData) return '';
      if (!this.isIconI18n || this.mediaLang === this.defaultLangCode) return this.configData.url || '';
      return parseLangJsonMap(this.configData.urlJson)[this.mediaLang] || '';
    },
  },
  props: {
    configObj: {
      type: Object,
    },
    configNme: {
      type: String,
    },
  },
  data() {
    return {
      defaultList: [
        {
          name: 'a42bdcc1178e62b4694c830f028db5c0',
          url: 'https://o5wwk8baw.qnssl.com/a42bdcc1178e62b4694c830f028db5c0/avatar',
        },
        {
          name: 'bc7521e033abdd1e92222d733590f104',
          url: 'https://o5wwk8baw.qnssl.com/bc7521e033abdd1e92222d733590f104/avatar',
        },
      ],
      defaults: {},
      configData: {},
      modalPic: false,
      isChoice: this.$t('maintain.singleSelect'),
      gridBtn: {
        xl: 4,
        lg: 8,
        md: 8,
        sm: 8,
        xs: 8,
      },
      gridPic: {
        xl: 6,
        lg: 8,
        md: 12,
        sm: 12,
        xs: 12,
      },
      activeIndex: 0,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      langLoaded: false,
    };
  },
  watch: {
    configObj: {
      handler(nVal, oVal) {
        this.defaults = nVal;
        this.configData = nVal[this.configNme];
        if (this.isIconI18n && !this.langLoaded) {
          this.langLoaded = true;
          this.getLanguageList();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    this.defaults = this.configObj;
    this.configData = this.configObj[this.configNme];
  },
  methods: {
    diyUiText,
    setItemUrl(url) {
      if (!this.isIconI18n || this.mediaLang === this.defaultLangCode) {
        this.$set(this.configData, 'url', url);
        return;
      }
      const map = parseLangJsonMap(this.configData.urlJson);
      if (url) map[this.mediaLang] = url;
      else delete map[this.mediaLang];
      this.$set(this.configData, 'urlJson', Object.keys(map).length ? JSON.stringify(map) : '');
    },
    bindDelete() {
      this.setItemUrl('');
    },
    getLanguageList() {
      if (!this.isIconI18n) return;
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
    // 点击图文封面
    modalPicTap() {
      const _this = this;
      this.$modalUpload(function (img) {
        if (!img) return;
        _this.setItemUrl(img[0].sattDir);
      });
    },
  },
};
</script>

<style scoped lang="scss">
.lang-name-switch {
  width: 100%;
  margin-bottom: 10px;
  padding: 0 20px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.header {
  font-size: 12px;
  color: #999;
  margin-bottom: 9px;
}

.title {
  margin: 0 0 5px;
  padding-bottom: 3px;
  /*border-bottom:1px solid rgba(0,0,0,0.05);*/
  font-size: 12px;
  color: #bbbbbb;
}

.box {
  width: 64px;
  height: 64px;
  border-radius: 4px 4px 4px 4px;
  margin-bottom: 20px;
  position: relative;
  cursor: pointer;
  // background: #d5d5d5;

  .iconfont-diy,
  .iconfont {
    position: absolute;
    color: #999;
  }

  img {
    width: 100%;
    height: 100%;
  }
}

.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 64px;
  height: 64px;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid #eeeeee;
  font-size: 12px;
  color: #cccccc;

  .iconfont {
    font-size: 16px;
  }
}
</style>
