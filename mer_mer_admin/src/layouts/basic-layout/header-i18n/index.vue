<template>
  <el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
    <div class="layout-navbars-breadcrumb-user-icon">
      <i class="el-icon-guide" :title="$t('common.refresh')"></i>
      <span class="i18n-label">{{ currentLangLabel }}</span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="item in langList" :key="item.value" :command="item.value" :disabled="disabledI18n === item.value">
        {{ item.label }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { Local } from '@/utils/storage';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';

export default {
  name: 'iHeaderI18n',
  data() {
    return {
      disabledI18n: 'zh-cn',
      langList: defaultLangList,
    };
  },
  computed: {
    currentLangLabel() {
      const item = this.langList.find((i) => i.value === this.disabledI18n);
      return item ? item.label : defaultLangList[0].label;
    },
  },
  mounted() {
    this.initI18n();
    this.getLanguageList();
  },
  methods: {
    getLanguageList() {
      systemLanguageList()
        .then((list) => {
          if (!list || list.length === 0) {
            return;
          }
          this.langList = list.map((item) => ({
            label: item.name,
            value: item.code,
          }));
        })
        .catch(() => {
          // 接口失败时保留本地默认语言列表
        });
    },
    onLanguageChange(lang) {
      Local.remove('JavaMerThemeConfigPrev');
      if (this.$store && this.$store.state.themeConfig) {
        this.$store.state.themeConfig.themeConfig.globalI18n = lang;
        Local.set('JavaMerThemeConfigPrev', this.$store.state.themeConfig.themeConfig);
      } else {
        Local.set('JavaMerThemeConfigPrev', { globalI18n: lang });
      }
      this.$i18n.locale = lang;
      this.initI18n();
    },
    initI18n() {
      const prev = Local.get('JavaMerThemeConfigPrev');
      if (prev && prev.globalI18n) {
        this.disabledI18n = prev.globalI18n;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user-icon {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--prev-bg-topBarColor);
}
.i18n-label {
  margin-left: 4px;
  font-size: 12px;
}
</style>