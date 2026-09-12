<template>
  <!--选项卡组件-->
  <div class="hot_imgs borderPadding">
    <div class="list-box">
      <draggable class="dragArea list-group" :list="configData.list" group="peoples" handle=".move-icon">
        <div v-for="(item, index) in configData.list" :key="index" class="acea-row row-middle">
          <div class="move-icon">
            <i class="iconfont icontuozhuaitubiao" style="font-size: 20px; color: #dddddd" />
          </div>
          <div class="item" :class="activeIndex === index ? 'checked' : ''" @click="onChecked(item, index)">
            <div class="info">
              <div class="info-item">
                <span>{{ tabListLabel(item) }} </span>
              </div>
            </div>
          </div>
          <div class="delete" @click.stop="bindDelete(index)">
            <i class="el-icon-error" style="font-size: 20px" />
          </div>
        </div>
      </draggable>
    </div>
    <template v-if="configData.list">
      <div class="add-btn">
        <el-button size="small" icon="el-icon-plus" plain style="width: 100%; height: 35px" @click="addBox"
          >{{ $t('pagediy.addTab') }}</el-button
        >
      </div>
    </template>
    <div class="title-bar mt10">{{ $t('pagediy.tabContent') }}</div>
    <div class="lang-name-switch">
      <el-radio-group v-model="activeLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="c_row-item">
      <div class="label">
        <span>{{ $t('pagediy.optionName') }}</span>
      </div>
      <div class="slider-box">
        <el-input
          :value="tabVal"
          :placeholder="tabPlaceholder"
          :step="1"
          maxlength="10"
          minlength="1"
          style="text-align: right"
          @input="onInput"
        ></el-input>
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
import vuedraggable from 'vuedraggable';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang, getLocalizedDiyVal } from '@/utils/localizedName';
export default {
  name: 'c_tab_input',
  props: {
    configObj: {
      type: Object,
    },
    configNme: {
      type: String,
    },
    index: {
      type: null,
    },
    isRub: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    draggable: vuedraggable,
  },
  data() {
    return {
      defaults: {},
      configData: {},
      menus: [],
      list: [
        {
          title: '',
          val: '',
        },
      ],
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
      indexLast: 0,
      lastObj: {},
      linkList: [],
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
    };
  },
  computed: {
    currentTab() {
      return this.configData && this.configData.list ? this.configData.list[this.activeIndex] : null;
    },
    tabVal() {
      const item = this.currentTab;
      if (!item) return '';
      if (this.activeLang === this.defaultLangCode) return item.val || '';
      return parseLangJsonMap(item.valJson)[this.activeLang] || '';
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
    tabPlaceholder() {
      if (this.activeLang === this.defaultLangCode) return this.$t('pagediy.enterOptionNameMax10');
      return this.$t('pagediy.inputOptionNameInLang', { lang: this.activeLangLabel });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.defaults = this.configObj;
      this.configData = this.configObj[this.configNme];
      this.activeIndex = this.configData.tabVal || 0;
      this.getLanguageList();
    });
  },
  watch: {
    configObj: {
      handler(nVal, oVal) {
        this.defaults = nVal;
        this.configData = nVal[this.configNme];
      },
      deep: true,
    },
  },
  methods: {
    tabListLabel(item) {
      return getLocalizedDiyVal(item, this.activeLang);
    },
    onInput(value) {
      const item = this.currentTab;
      if (!item) return;
      if (this.activeLang === this.defaultLangCode) {
        this.$set(item, 'val', value);
        return;
      }
      const map = parseLangJsonMap(item.valJson);
      if (String(value || '').trim()) map[this.activeLang] = value;
      else delete map[this.activeLang];
      this.$set(item, 'valJson', Object.keys(map).length ? JSON.stringify(map) : '');
    },
    onChecked(item, index) {
      this.activeIndex = index;
      this.$emit('getConfig', { name: 'tab_input', values: index });
    },
    addBox() {
      this.activeIndex += 1; //默认选中新填的tab
      this.configData.list.push({ val: this.$t('pagediy.tabComponent'), valJson: '' });
      this.$emit('getConfig', { name: 'add_tab', values: this.configData.list });
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
    onBlur() {
      let data = this.defaults.menuConfig;
      this.defaults.picStyle.picList[this.defaults.picStyle.tabVal].link = data.list[0].info[0].val;
    },
    // 删除
    bindDelete(index) {
      this.configData.list.splice(index, 1);
      this.$emit('getConfig', { name: 'del_tab', values: this.configData.list, index: index });
    },
  },
};
</script>

<style scoped lang="scss">
.acea-row {
  position: relative;
}
.delete {
  position: absolute;
  right: -7px;
  top: -8px;
  color: #cccccc;
}
.label {
  font-size: 12px;
  color: #999;
}
.lang-name-switch {
  width: 100%;
  margin-bottom: 10px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.slider-box {
  width: 81%;
}
.checked {
  border: 1px solid #0c8aff !important;
}
.title-bar {
  height: 38px;
  line-height: 38px;
  color: #333;
  font-size: 14px;
  position: relative;
}
.hot_imgs {
  margin-bottom: 20px;
  .title {
    padding: 13px 0;
    color: #bbbbbb;
    font-size: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .list-box {
    .item {
      width: 490px;
      position: relative;
      display: flex;
      height: 35px;
      line-height: 35px;
      margin-left: 10px;
      margin-bottom: 10px;
      border: 1px solid #dcdfe6;
      .move-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .img-box {
        position: relative;
        width: 64px;
        height: 64px;
        margin-left: 20px;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .info {
      flex: 1;
      margin-left: 22px;
      .info-item {
        display: flex;
        align-items: center;
        span {
          /*width: 40px;*/
          font-size: 13px;
        }
        .input-box {
          flex: 1;
          ::v-deep.ivu-input {
            font-size: 13px !important;
          }
        }
      }
    }

    .delect-btn {
      position: absolute;
      right: -7px;
      top: -12px;
      .iconfont-diy,
      .iconfont {
        font-size: 25px;
        color: #999;
      }
    }
  }
  .add-btn {
    margin-top: 10px;
  }
}

.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  font-size: 12px;
  color: #cccccc;
  .iconfont {
    font-size: 16px;
  }
}
.iconfont-diy,
.iconfont {
  color: #dddddd;
  font-size: 28px;
}
.el-select {
  display: block;
}
.move-icon {
  margin-bottom: 10px;
}
</style>
