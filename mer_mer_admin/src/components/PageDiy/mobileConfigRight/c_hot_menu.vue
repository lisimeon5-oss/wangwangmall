<template>
  <!--导航组、轮播图、头部组件、图片魔方中使用的内容设置，图片上传、链接选择-->
  <div class="hot_imgs borderPadding">
    <div class="title" v-if="configData.title">
      {{ configData.title }}
    </div>
    <div class="lang-name-switch">
      <el-radio-group v-model="activeLang" size="mini">
        <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
          {{ lang.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="list-box mt20">
      <draggable class="dragArea list-group" :list="configData.list" group="peoples" handle=".move-icon">
        <div class="item" v-for="(item, index) in configData.list" :key="index">
          <div class="move-icon">
            <span class="iconfont icon-tuozhuaidian"></span>
          </div>
          <div class="img-box" @click="modalPicTap(item, index)">
            <img :src="getItemImg(item)" alt="" v-if="getItemImg(item)" />
            <div class="upload-box" v-else><i class="el-icon-camera-solid" style="font-size: 30px" /></div>
          </div>
          <div class="info" v-if="configObj['checkoutConfig']['checkoutVal'] == '1'">
            <div class="info-item" v-for="(infos, key) in item.info" :key="key">
              <span>{{ infos.title }}</span>
              <div class="input-box" @click="getLink(index, key, item.info)">
                <el-select v-if="infos.select" v-model="infos.value" style="">
                  <el-option v-for="itm in linkList" :key="itm.value" :label="itm.label" :value="itm.value" />
                </el-select>
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
                  @change="onchangeIsShow(item.status)"
                />
              </div>
            </div>
            <div class="delect-btn" @click.stop="bindDelete(item, index)" v-if="!configData.isCube">
              <i class="el-icon-error" style="font-size: 26px" />
            </div>
          </div>
          <div v-else class="info">
            <div class="setHot-btn" @click="setHot">{{ $t('pagediy.setHotZone') }}</div>
          </div>
        </div>
      </draggable>
    </div>
    <template v-if="configData.list">
      <div class="add-btn" v-if="configData.list.length < configData.maxList">
        <el-button class="button" icon="el-icon-plus" plain @click="addBox">{{ $t('pagediy.addSection') }}</el-button>
      </div>
    </template>
    <linkaddress ref="linkaddres" @linkUrl="linkUrl"></linkaddress>
    <!-- 设置热区弹出框 -->
    <el-dialog
      :title="$t('pagediy.hotZoneSettings')"
      class="dialog-bottom"
      :visible.sync="setHotVisible"
      :before-close="handleClose"
      :append-to-body="true"
      :close-on-click-modal="false"
      width="950px"
    >
      <OperationFloorModal
        v-if="changeCreated"
        ref="hotpot"
        :imgs="hotspotPreviewImgs"
        :img-area-data="imgAreaData"
        :imgAreaData="configObj.checkoutConfig.hotspot"
        @dialogChange="dialogChange"
      >
      </OperationFloorModal>
    </el-dialog>
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
import OperationFloorModal from '@/components/HotpotModal';
import modalSure from '@/libs/modal-sure';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang } from '@/utils/localizedName';
export default {
  name: 'c_hot_menu',
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
    OperationFloorModal,
  },
  data() {
    return {
      setHotVisible: false,
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
      imgAreaData: [], //热区数据
      changeCreated: true,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
    };
  },
  computed: {
    hotspotPreviewImgs() {
      return ((this.configData && this.configData.list) || []).map((item) => ({
        ...item,
        img: this.getItemImg(item),
      }));
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
    '$i18n.locale'() {
      this.activeLang = resolveFormActiveLang(this);
    },
  },
  methods: {
    getItemImg(item) {
      if (!item) return '';
      if (this.activeLang === this.defaultLangCode) return item.img || '';
      return parseLangJsonMap(item.imgJson)[this.activeLang] || '';
    },
    setItemImg(item, url) {
      if (this.activeLang === this.defaultLangCode) {
        this.$set(item, 'img', url);
        return;
      }
      const map = parseLangJsonMap(item.imgJson);
      if (url) map[this.activeLang] = url;
      else delete map[this.activeLang];
      this.$set(item, 'imgJson', Object.keys(map).length ? JSON.stringify(map) : '');
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
    //取消或确认
    dialogChange(type, areaData) {
      if (type) {
        this.footerClick(areaData);
      } else {
        this.close();
      }
    },
    close() {
      this.$refs.hotpot.areaData = [...this.configObj.checkoutConfig.hotspot];
      this.setHotVisible = false;
    },
    footerClick(areaData) {
      this.setHotVisible = false;
      this.configObj.checkoutConfig.hotspot = areaData;
    },

    //模态框关闭
    handleClose(done) {
      this.$modalSure(this.$t('pagediy.confirmClose'))
        .then((_) => {
          this.$refs.hotpot.areaData = [...this.$refs.hotpot.imgAreaData];
          done();
        })
        .catch((_) => {});
    },
    //设置热区
    setHot() {
      if (this.getItemImg(this.configData.list[0])) {
        this.setHotVisible = true;
      } else {
        this.$message({
          message: this.$t('pagediy.pleaseSelectImageFirst'),
          type: 'warning',
        });
      }
    },
    //状态切换
    onchangeIsShow(e) {
      this.configData.list[this.activeIndex].status = e;
    },
    linkUrl(e) {
      this.configData.list[this.activeIndex].info[this.indexLast].value = e;
      if (this.defaults.name == 'homeHotspot') {
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
        this.lastObj.info[0].value = '';
        this.lastObj.info[1].value = '';
        this.configData.list.push(this.lastObj);
      } else {
        let obj = JSON.parse(JSON.stringify(this.configData.list[this.configData.list.length - 1]));
        obj.img = '';
        obj.imgJson = '';
        obj.info[0].value = '';
        obj.info[1].value = '';
        this.configData.list.push(obj);
      }
    },
    // 点击图文封面
    modalPicTap(item, index) {
      let _this = this;
      _this.activeIndex = index;
      _this.$modalUpload(function (img) {
        if (!img) return;
        _this.setItemImg(item, img[0].sattDir);
        if (_this.isRub) _this.getPic(img[0].sattDir);
      });
    },
    // 获取图片信息
    getPic(pc) {
      if (this.$refs.hotpot) {
        this.changeCreated = false;
        this.configObj.checkoutConfig.hotspot = [];
        this.$refs.hotpot.imgAreaData = [];
        this.$refs.hotpot.areaData = [];
        this.$refs.hotpot.nowNum = 0;
        this.changeCreated = true;
      }
      this.$nextTick(() => {
        const row = this.configData.list[this.activeIndex];
        if (row) this.setItemImg(row, pc);
        let data = this.defaults.menuConfig;
        if (data && data.isCube) {
          const idx = this.defaults.picStyle.tabVal;
          const prev = this.defaults.picStyle.picList[idx] || {};
          const cur = Object.assign({}, prev, {
            link: data.list[0].info[0].value,
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
::v-deep .el-dialog__body {
  padding: 30px 20px !important;
}
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
      height: 140px;
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

.setHot-btn {
  color: #0c8aff;
  text-align: center;
  border: 1px dashed #0c8aff;
  padding: 10px 0;
  cursor: pointer;
}
.dialog-footer {
  margin-right: 400px;
}
</style>
