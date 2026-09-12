<template>
  <!--导航组、轮播图、头部组件、图片魔方中使用的内容设置，图片上传、链接选择-->
  <div class="hot_imgs borderPadding">
    <div class="title" v-if="configData.title">
      {{ configData.title }}
    </div>
    <div class="lang-name-switch" v-if="showTitleI18n">
      <el-radio-group v-model="activeLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="list-box mt20">
      <draggable class="dragArea list-group" :list="configData.list" group="peoples" handle=".move-icon">
        <div class="item" v-for="(item, index) in configData.list" :key="index">
          <div class="move-icon" v-if="!configData.radioShow">
            <span class="iconfont icon-tuozhuaidian"></span>
          </div>
          <div class="img-box" @click="modalPicTap(item, index)">
            <img :src="getItemImg(item)" alt="" v-if="getItemImg(item)" />
            <div class="upload-box" v-else><i class="el-icon-camera-solid" style="font-size: 30px" /></div>
          </div>
          <div class="info">
            <div v-for="(infos, key) in item.info" :key="key">
              <div class="info-item">
                <span>{{ infos.title }}</span>
                <div
                  class="input-box"
                  @click="getLink(index, key, item.info)"
                  :class="configData.name === 'tpmf' ? 'tpmf-box' : ''"
                >
                  <el-select v-if="infos.select" v-model="infos.value" style="">
                    <el-option v-for="itm in linkList" :key="itm.value" :label="itm.label" :value="itm.value" />
                  </el-select>
                  <el-input
                    v-else-if="isI18nTitle(infos, key, item)"
                    size="small"
                    :value="getTitleInput(infos)"
                    :placeholder="titlePlaceholder(infos)"
                    :maxlength="infos.max"
                    @input="setTitleInput(infos, $event)"
                  />
                  <el-input
                    size="small"
                    v-model="infos.value"
                    :readonly="key == item.info.length - 1 ? true : false"
                    :placeholder="infos.tips"
                    :maxlength="infos.max"
                    v-else
                  >
                    <el-button v-if="key == item.info.length - 1" slot="append" icon="el-icon-arrow-right"></el-button>
                  </el-input>
                </div>
              </div>
              <!-- 魔方 -->
              <div class="tc-box acea-row row-between mt15" v-if="configData.radioShow && configData.nowIndex">
                <span class="radio-text">{{ $t('pagediy.fillWay') }}</span>
                <el-radio-group v-model="infos.radioVal" @change="radioChange">
                  <el-radio label="0">{{ $t('pagediy.stretch') }}</el-radio>
                  <el-radio label="1">{{ $t('pagediy.scale') }}</el-radio>
                  <el-radio label="2">{{ $t('pagediy.fill') }}</el-radio>
                </el-radio-group>
              </div>
            </div>
            <div
              v-if="defaults.name !== 'pictureCube' && defaults.name !== 'swiperBg' && defaults.name !== 'homeComb'"
              class="info-item"
            >
              <span>{{ translateText("状态") }}</span>
              <div class="input-box">
                <el-switch
                  v-model="item.status"
                  :active-value="true"
                  :inactive-value="false"
                  :active-text="translateText('显示')"
                  :inactive-text="translateText('隐藏')"
                  @change="onchangeIsShow(item.status, index)"
                />
              </div>
            </div>
            <div class="delect-btn" @click.stop="bindDelete(item, index)" v-if="!configData.isCube">
              <i class="el-icon-error" style="font-size: 26px" />
            </div>
          </div>
        </div>
      </draggable>
    </div>
    <template v-if="configData.list">
      <div class="add-btn" v-if="configData.list.length < configData.maxList">
        <el-button class="button" icon="el-icon-plus" plain @click="addBox">{{ translateText("添加版块") }}</el-button>
      </div>
    </template>
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
import { getImageDimensions } from '@/utils';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'c_menu_list',
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
    linkaddress,
  },
  data() {
    return {
      defaults: {},
      configData: {},
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
    showTitleI18n() {
      if (this.isCarouselImgI18n) return true;
      const list = (this.configData && this.configData.list) || [];
      const first = list[0];
      return !!(first && first.info && first.info.length > 1);
    },
    isCarouselImgI18n() {
      const name = this.defaults && this.defaults.name;
      return name === 'swiperBg' || name === 'homeComb' || name === 'pictureCube';
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
  },
  mounted() {
    this.getLanguageList();
    this.$nextTick(() => {
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
    getItemImg(item) {
      if (!item) return '';
      if (!this.isCarouselImgI18n || this.activeLang === this.defaultLangCode) return item.img || '';
      return parseLangJsonMap(item.imgJson)[this.activeLang] || '';
    },
    setItemImg(item, url) {
      if (!this.isCarouselImgI18n || this.activeLang === this.defaultLangCode) {
        this.$set(item, 'img', url);
        return;
      }
      const map = parseLangJsonMap(item.imgJson);
      if (url) map[this.activeLang] = url;
      else delete map[this.activeLang];
      this.$set(item, 'imgJson', Object.keys(map).length ? JSON.stringify(map) : '');
    },
    isI18nTitle(infos, key, item) {
      return !infos.select && Number(key) !== item.info.length - 1;
    },
    getTitleInput(infos) {
      if (this.activeLang === this.defaultLangCode) return infos.value || '';
      return parseLangJsonMap(infos.valueJson)[this.activeLang] || '';
    },
    setTitleInput(infos, val) {
      if (this.activeLang === this.defaultLangCode) {
        this.$set(infos, 'value', val);
        return;
      }
      const map = parseLangJsonMap(infos.valueJson);
      if (String(val || '').trim()) map[this.activeLang] = val;
      else delete map[this.activeLang];
      this.$set(infos, 'valueJson', Object.keys(map).length ? JSON.stringify(map) : '');
    },
    titlePlaceholder(infos) {
      if (this.activeLang === this.defaultLangCode) return infos.tips;
      return this.$t('category.inputNameInLang', { lang: this.activeLangLabel });
    },
    resetInfoValues(obj) {
      if (!obj || !obj.info) return;
      obj.info.forEach((info, i) => {
        info.value = '';
        if (i !== obj.info.length - 1) info.valueJson = '';
      });
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
    //状态切换
    onchangeIsShow(e) {
      this.configData.list[index].status = e;
    },
    linkUrl(e) {
      this.configData.list[this.activeIndex].info[this.indexLast].value = e;
      if (this.defaults.name == 'pictureCube') {
        this.defaults.picStyle.picList[this.defaults.picStyle.tabVal].link = e;
      }
    },
    getLink(index, key, item) {
      this.indexLast = item.length - 1;
      if (key != item.length - 1) {
        return;
      }
      this.activeIndex = index;
      this.$refs.linkaddres.dialogVisible = true;
    },
    addBox() {
      if (this.configData.list.length == 0) {
        this.lastObj.img = '';
        this.lastObj.imgJson = '';
        this.resetInfoValues(this.lastObj);
        this.configData.list.push(this.lastObj);
      } else {
        let obj = JSON.parse(JSON.stringify(this.configData.list[this.configData.list.length - 1]));
        obj.img = '';
        obj.imgJson = '';
        this.resetInfoValues(obj);
        this.configData.list.push(obj);
      }
    },
    // 点击图文封面
    modalPicTap(item, index) {
      let _this = this;
      _this.$modalUpload(function (img) {
        if (!img) return;
        _this.setItemImg(item, img[0].sattDir);
        if (_this.isRub) _this.getPic(img[0].sattDir);
      });
    },
    // 获取图片信息
    async getPic(pc) {
      let imgSizeInfo = await getImageDimensions(pc);
      this.$nextTick(() => {
        let data = this.defaults.menuConfig;
        if (data && data.isCube) {
          const idx = this.defaults.picStyle.tabVal;
          const prev = this.defaults.picStyle.picList[idx] || {};
          const cur = Object.assign({}, prev, imgSizeInfo, {
            link: data.list[0].info[0].value,
            radioVal: data.list[0].info[0].radioVal,
          });
          if (this.activeLang === this.defaultLangCode) {
            cur.image = pc;
          } else {
            const map = parseLangJsonMap(cur.imageJson);
            if (pc) map[this.activeLang] = pc;
            else delete map[this.activeLang];
            cur.imageJson = Object.keys(map).length ? JSON.stringify(map) : '';
          }
          this.$set(this.defaults.picStyle.picList, idx, cur);
        }
      });
    },
    onBlur() {
      let data = this.defaults.menuConfig;
      this.defaults.picStyle.picList[this.defaults.picStyle.tabVal].link = data.list[0].info[0].value;
      this.defaults.picStyle.picList[this.defaults.picStyle.tabVal].radioVal = data.list[0].info[0].radioVal;
    },
    radioChange(e) {
      this.defaults.picStyle.picList[this.defaults.picStyle.tabVal].radioVal = e;
    },
    // 删除
    bindDelete(item, index) {
      if (this.configData.list.length == 1) {
        this.lastObj = this.configData.list[0];
      }
      this.configData.list.splice(index, 1);
    },
  },
};
</script>

<style scoped lang="scss">
.lang-name-switch {
  margin-top: 12px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.hot_imgs {
  margin-bottom: 20px;
  .title {
    color: #bbbbbb;
    font-size: 12px;
  }

  .list-box {
    .item {
      width: 100%;
      min-height: 140px;
      height: auto;
      background: #f9f9f9;
      border-radius: 3px 3px 3px 3px;
      opacity: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px 20px;
      margin-bottom: 14px;
      .move-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        cursor: move;
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
        margin-bottom: 10px;
        span {
          width: 40px;
          font-size: 12px;
          color: #999999;
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
  .add-btn .button {
    width: 100%;
    height: 36px;
    margin-top: 6px;
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
  cursor: pointer;
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
.mt15 {
  margin-top: 15px;
  color: #999;
}
::v-deep .tc-box .el-radio {
  margin-left: 29px !important;
}
::v-deep .tpmf-box .el-input {
  margin-left: 40px;
  width: 88%;
}
</style>
