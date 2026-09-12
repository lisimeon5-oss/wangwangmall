<template>
  <!--商品分类组件-->
  <div class="c_product borderPadding" v-if="configData">
    <div class="title">{{ configData.title }}</div>
    <div class="lang-name-switch">
      <el-radio-group v-model="activeLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="list-box">
      <draggable class="dragArea list-group" :list="configData.list" group="peoples" handle=".move-icon">
        <div class="item" v-for="(item, index) in configData.list" :key="index" @click="activeBtn(index)">
          <div class="move-icon">
            <span class="iconfont icon-tuozhuaidian" style="font-size: 28px; color: #dddddd"></span>
          </div>
          <div class="content ml20">
            <div class="con-item">
              <span>{{ $t('pagediy.displayText') }}</span>
              <div>
                <el-input
                  size="small"
                  :value="getTitleInput(item)"
                  :placeholder="titlePlaceholder"
                  maxlength="5"
                  @input="setTitleInput(item, $event)"
                >
                </el-input>
              </div>
            </div>
            <div class="con-item">
              <span>{{ $t('pagediy.dataType') }}</span>
              <el-radio-group v-model="item.type">
                <el-radio :label="0">{{ $t('linkPicker.microPage') }}</el-radio>
                <el-radio :label="1">{{ $t('pagediy.productCategory') }}</el-radio>
              </el-radio-group>
            </div>
            <div v-if="item.type === 0" class="con-item">
              <span>{{ $t('linkPicker.microPage') }}</span>
              <div class="input-box">
                <el-select v-model="item.val" :placeholder="$t('common.pleaseSelect')">
                  <el-option v-for="item in microList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                </el-select>
              </div>
            </div>
            <div v-else class="con-item">
              <span>{{ $t('pagediy.productCategory') }}</span>
              <div class="input-box">
                <el-select v-model="item.val" :placeholder="$t('common.pleaseSelect')">
                  <el-option
                    v-for="item in merPlatProductClassify"
                    :key="item.id"
                    :label="item.name"
                    :disabled="!item.isShow"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
          <div v-if="configData.list.length > 1" class="delete" @click.stop="bindDelete(index)">
            <i class="el-icon-error" style="font-size: 26px" />
          </div>
        </div>
      </draggable>
    </div>
    <div v-if="configData.list">
      <div class="add-btn" @click="addHotTxt">
        <el-button style="width: 100%" icon="el-icon-plus" plain>{{ $t('pagediy.addModule') }}</el-button>
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
import vuedraggable from 'vuedraggable';
import linkaddress from '@/components/linkaddress';
import { mapGetters } from 'vuex';
import { pagediyListApi } from '@/api/devise';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'c_classify',
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
  },
  components: {
    linkaddress,
    draggable: vuedraggable,
  },
  data() {
    return {
      defaults: {},
      configData: {},
      itemObj: {},
      activeIndex: 0,
      tableForm: {
        page: 1,
        limit: 1000,
        name: '',
      },
      microList: [],
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
    };
  },
  computed: {
    ...mapGetters(['merPlatProductClassify']),
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
    titlePlaceholder() {
      if (this.activeLang === this.defaultLangCode) return this.$t('pagediy.enterTabNameMax5');
      return this.$t('category.inputNameInLang', { lang: this.activeLangLabel });
    },
  },
  mounted() {
    this.getList();
    this.getLanguageList();
    this.$nextTick(() => {
      if (!localStorage.getItem('merPlatProductClassifyV2')) this.$store.dispatch('product/getAdminProductClassify');
      this.defaults = this.configObj;
      this.configData = this.configObj[this.configNme];
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
    getTitleInput(item) {
      if (this.activeLang === this.defaultLangCode) return item.title || '';
      return parseLangJsonMap(item.titleJson)[this.activeLang] || '';
    },
    setTitleInput(item, val) {
      if (this.activeLang === this.defaultLangCode) {
        this.$set(item, 'title', val);
        return;
      }
      const map = parseLangJsonMap(item.titleJson);
      if (String(val || '').trim()) map[this.activeLang] = val;
      else delete map[this.activeLang];
      this.$set(item, 'titleJson', Object.keys(map).length ? JSON.stringify(map) : '');
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
    //微页面地址
    getList() {
      pagediyListApi(this.tableForm).then((res) => {
        this.microList = res.list;
      });
    },
    linkUrl(e) {
      this.configData.list[this.activeIndex].url = `/pages/small_page/index?id=${e}`;
    },
    getLink(index) {
      this.activeIndex = index;
      this.$refs.linkaddres.dialogVisible = true;
    },
    addHotTxt() {
      let obj = {
        title: '精选',
        titleJson: '',
        val: '',
        type: 0,
        url: '',
      };
      this.configData.list.push(obj);
    },
    // 删除数组
    bindDelete(index) {
      if (this.configData.list.length == 1) {
        let itemObj = this.configData.list[0];
        this.itemObj = itemObj;
        let storage = window.localStorage;
        storage.setItem('itemObj', JSON.stringify(itemObj));
      }
      this.configData.list.splice(index, 1);
      this.configData.tabCur = 0;
      this.$emit('getConfig', { name: 'delete', values: this.configData.list });
    },
    sliderChange(index) {
      this.configData.tabCur = index;
      this.$emit('getConfig', { name: 'product', indexs: index });
    },
    activeBtn(index) {
      // this.configData.tabCur = index;
      // this.$emit('getConfig', { name: 'product', indexs: index });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep.el-input__inner {
  font-size: 12px;
}
.c_product {
  padding-bottom: 20px;
  .list-box {
    .item {
      position: relative;
      display: flex;
      margin-top: 14px;
      padding: 16px 20px;
      width: 100%;
      background: #f9f9f9;
      border-radius: 3px 3px 3px 3px;
      opacity: 1;
      &:first-of-type {
        margin-top: 20px;
      }
      .delete {
        position: absolute;
        right: 0;
        top: 0;
        right: -13px;
        top: -14px;
        color: #999999;
        cursor: pointer;
      }
    }
    .move-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: move;
    }
    .content {
      flex: 1;
      .con-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        &:last-child {
          margin-bottom: 0;
        }
        span {
          width: 80px;
          font-size: 12px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: #999999;
        }
        ::v-deep .el-radio {
          font-size: 12px !important;
        }
      }
    }
  }
  .add-btn {
    margin-top: 18px;
  }
}
.title {
  font-size: 12px;
  color: #bbbbbb;
}
.lang-name-switch {
  width: 100%;
  margin-top: 10px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}

.iconfont-diy,
.iconfont {
  color: #dddddd;
  font-size: 38px;
}
</style>
