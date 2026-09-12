<template>
  <!--搜索框中搜索热词组件-->
  <div class="borderPadding mb20" v-if="configData">
    <div v-if="configData.info" class="title">
      <span>{{ configData.info }}</span>
    </div>
    <div class="lang-name-switch">
      <el-radio-group v-model="activeLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="input-box">
      <draggable class="dragArea list-group" :list="configData.list" group="peoples" handle=".icon">
        <div class="input-item" v-for="(item, index) in configData.list" :key="index">
          <div class="icon">
            <i class="iconfont icon-tuozhuaidian" style="font-size: 20px; color: #dddddd" />
          </div>
          <el-input
            size="small"
            class="ml20"
            :value="getHotInput(item)"
            maxlength="10"
            :placeholder="hotPlaceholder"
            @input="setHotInput(item, $event)"
          />
          <div class="delete" @click.stop="bindDelete(index)">
            <i class="el-icon-error" style="font-size: 20px" />
          </div>
        </div>
      </draggable>
      <div class="add-btn" @click="addHotTxt" v-if="configData.list.length < 20">
        <el-button icon="el-icon-plus" plain style="width: 100%; height: 40px; font-size: 12px">{{
          $t('pagediy.addHotWord')
        }}</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import vuedraggable from 'vuedraggable';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'c_hot_word',
  props: {
    configObj: {
      type: Object,
    },
    configNme: {
      type: String,
    },
  },
  components: {
    draggable: vuedraggable,
  },
  data() {
    return {
      hotWordList: [],
      hotIndex: 1,
      defaults: {},
      configData: {},
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
    hotPlaceholder() {
      if (this.activeLang === this.defaultLangCode) return '选填，不超过十个字';
      return this.$t('category.inputNameInLang', { lang: this.activeLangLabel });
    },
  },
  created() {
    this.defaults = this.configObj;
    this.configData = this.configObj[this.configNme];
    this.getLanguageList();
  },
  watch: {
    configObj: {
      handler(nVal, oVal) {
        this.configData = nVal[this.configNme];
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    getHotInput(item) {
      if (this.activeLang === this.defaultLangCode) return item.val || '';
      return parseLangJsonMap(item.valJson)[this.activeLang] || '';
    },
    setHotInput(item, val) {
      if (this.activeLang === this.defaultLangCode) {
        this.$set(item, 'val', val);
        return;
      }
      const map = parseLangJsonMap(item.valJson);
      if (String(val || '').trim()) map[this.activeLang] = val;
      else delete map[this.activeLang];
      this.$set(item, 'valJson', Object.keys(map).length ? JSON.stringify(map) : '');
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
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    addHotTxt() {
      let obj = {
        val: '',
        valJson: '',
      };
      this.configData.list.push(obj);
    },
    bindDelete(index) {
      this.configData.list.splice(index, 1);
    },
  },
};
</script>

<style scoped lang="scss">
.line-box {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  .title {
    p {
      font-size: 12px;
      color: #333333;
    }
    span {
      font-size: 12px;
      color: #999999;
    }
  }
  .input-box {
    margin-top: 10px;
    .add-btn {
      margin-top: 18px;
    }
  }
}
.input-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
  .delete {
    position: absolute;
    right: -7px;
    top: -8px;
    color: #999;
  }
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;
  }

  ::v-deep.ivu-input {
    flex: 1;
    height: 36px;
    font-size: 13px !important;
  }
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
