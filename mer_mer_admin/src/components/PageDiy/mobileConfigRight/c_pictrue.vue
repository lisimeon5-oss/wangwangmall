<template>
  <!--图片魔方、热区添加图片-->
  <div class="mobile-page borderPadding">
    <div v-if="isUpdate">
      <template v-if="configData.isHotspot != 1">
        <div class="divider"></div>
        <div class="title mb10">{{ $t('pagediy.layout') }}</div>
      </template>
      <div class="tip mb20">{{ $t('pagediy.selectLayoutAddImageTip') }}</div>
      <div class="advert">
        <div v-if="style === 0">
          <div class="advertItem01 acea-row" v-for="(item, index) in configData.picList" :key="index">
            <img :src="cubeImg(item)" v-if="cubeImg(item)" class="img-style" />
            <div class="empty-box" v-else>{{ $t('pagediy.sizeUnlimited') }}</div>
          </div>
        </div>
        <div v-if="style === 1" class="advertItem02 acea-row" :style="gapStyle">
          <div
            class="item"
            :class="currentIndex === index ? 'on' : ''"
            @click="currentTab(index, configData)"
            v-for="(item, index) in configData.picList"
            :style="spaceStyleTwo"
            :key="index"
          >
            <img
              :src="cubeImg(item)"
              v-if="cubeImg(item)"
              :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
              class="img-style"
              :style="radiusStyle"
            />
            <div class="empty-box" v-else>
              <div>
                <div>{{ $t('pagediy.widthPx', { n: 375 }) }}</div>
                <div>{{ $t('pagediy.heightUnlimited') }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="style === 2" class="advertItem02 advertItem03 acea-row" :style="gapStyle">
          <div
            class="item"
            :class="currentIndex === index ? 'on' : ''"
            @click="currentTab(index, configData)"
            v-for="(item, index) in configData.picList"
            :style="spaceStyleThree"
            :key="index"
          >
            <img
              :src="cubeImg(item)"
              v-if="cubeImg(item)"
              :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
              class="img-style"
              :style="radiusStyle"
            />
            <div class="empty-box" v-else>
              <div>
                <div>{{ $t('pagediy.widthPx', { n: 250 }) }}</div>
                <div>{{ $t('pagediy.heightUnlimited') }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="style === 3" class="advertItem04 acea-row" :style="gapStyle">
          <div
            class="item"
            :class="currentIndex === 0 ? 'on' : ''"
            @click="currentTab(0, configData)"
            :style="spaceStyleTwo"
          >
            <img
              :src="cubeImg(configData.picList[0])"
              v-if="cubeImg(configData.picList[0])"
              :class="
                configData.picList[0].radioVal === '0'
                  ? 'stretch'
                  : configData.picList[0].radioVal === '1'
                  ? 'scale'
                  : 'fill'
              "
              class="img-style img-left"
              :style="radiusStyle"
            />
            <div class="empty-box" v-else>{{ $t('pagediy.sizeOrRatio', { w: 375, h: 375 }) }}</div>
          </div>
          <div class="item pic-four" :style="spaceStyleFour">
            <div class="pic" :class="currentIndex === 1 ? 'on' : ''" @click="currentTab(1, configData)">
              <img
                :src="cubeImg(configData.picList[1])"
                v-if="cubeImg(configData.picList[1])"
                :class="
                  configData.picList[1].radioVal === '0'
                    ? 'stretch'
                    : configData.picList[1].radioVal === '1'
                    ? 'scale'
                    : 'fill'
                "
                class="img-style"
                :style="radiusStyle"
              />
              <div class="empty-box" v-else>{{ $t('pagediy.sizeOrRatio', { w: 375, h: 188 }) }}</div>
            </div>
            <div class="pic" :class="currentIndex === 2 ? 'on' : ''" @click="currentTab(2, configData)">
              <img
                :src="cubeImg(configData.picList[2])"
                v-if="cubeImg(configData.picList[2])"
                :class="
                  configData.picList[2].radioVal === '0'
                    ? 'stretch'
                    : configData.picList[2].radioVal === '1'
                    ? 'scale'
                    : 'fill'
                "
                class="img-style"
                :style="radiusStyle"
              />
              <div class="empty-box" v-else>{{ $t('pagediy.sizeOrRatio', { w: 375, h: 188 }) }}</div>
            </div>
          </div>
        </div>
        <div v-if="style === 4" class="advertItem02 advertItem05 acea-row" :style="gapStyle">
          <div
            class="item"
            :class="currentIndex === index ? 'on' : ''"
            @click="currentTab(index, configData)"
            v-for="(item, index) in configData.picList"
            :style="spaceStyleFive"
            :key="index"
          >
            <img
              :src="cubeImg(item)"
              v-if="cubeImg(item)"
              :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
              class="img-style"
              :style="radiusStyle"
            />
            <div class="empty-box" v-else>{{ $t('pagediy.widthPxHeightUnlimited', { n: 188 }) }}</div>
          </div>
        </div>
        <div v-if="style === 5" class="advertItem06 acea-row" :style="gapStyle">
          <div
            class="item"
            :class="currentIndex === index ? 'on' : ''"
            @click="currentTab(index, configData)"
            v-for="(item, index) in configData.picList"
            :style="spaceStyleTwo"
            :key="index"
          >
            <img
              :src="cubeImg(item)"
              v-if="cubeImg(item)"
              :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
              class="img-style"
              :style="radiusStyle"
            />
            <div class="empty-box" v-else>{{ $t('pagediy.sizeOrRatio', { w: 375, h: 188 }) }}</div>
          </div>
        </div>
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
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'c_pictrue',
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
      defaults: {},
      configData: {},
      isUpdate: false, // 重新渲染
      currentIndex: 0,
      arrayObj: {
        image: '',
        imageJson: '',
        link: '',
        radioVal: '0',
      },
    };
  },
  computed: {
    style() {
      return this.configObj.tabConfig.tabVal;
    },
    //最外层盒子的样式
    boxStyle() {
      return [
        { 'border-radius': this.configObj.bgStyle.val ? this.configObj.bgStyle.val + 'px' : '0' },
        {
          background: `linear-gradient(${this.configObj.bgColor.color[0].item}, ${this.configObj.bgColor.color[1].item})`,
        },
        { margin: this.configObj.mbConfig.val + 'px' + ' ' + this.configObj.lrConfig.val + 'px' + ' ' + 0 },
        { padding: this.configObj.upConfig.val + 'px' + ' ' + 0 + ' ' + this.configObj.downConfig.val + 'px' },
      ];
    },
    radiusStyle() {
      return [{ 'border-radius': this.configObj.contantStyle.val ? this.configObj.contantStyle.val + 'px' : '0' }];
    },
    //因后台页面宽度379---正常应375
    spaceStyleTwo() {
      return [{ width: (379 - this.configObj.lrConfig.val * 2 - this.configObj.spaceConfig.val) / 2 + 'px' }];
    },
    spaceStyleThree() {
      return [{ width: (379 - this.configObj.lrConfig.val * 2 - this.configObj.spaceConfig.val * 2) / 3 + 'px' }];
    },
    spaceStyleFour() {
      return [
        { width: (379 - this.configObj.lrConfig.val * 2 - this.configObj.spaceConfig.val) / 2 + 'px' },
        { gap: this.configObj.spaceConfig.val + 'px' },
        { height: (188 - this.configObj.spaceConfig.val) / 2 + 'px' },
      ];
    },
    spaceStyleFive() {
      return [{ width: (379 - this.configObj.lrConfig.val * 2 - this.configObj.spaceConfig.val * 3) / 4 + 'px' }];
    },
    gapStyle() {
      return [{ gap: this.configObj.spaceConfig.val + 'px' }];
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.defaults = this.configObj;
      if (this.configObj.hasOwnProperty('timestamp')) {
        this.isUpdate = true;
      } else {
        this.isUpdate = false;
      }
      this.$set(this, 'configData', this.configObj[this.configNme]);
    });
  },
  watch: {
    configObj: {
      handler(nVal, oVal) {
        this.defaults = nVal;
        this.$set(this, 'configData', nVal[this.configNme]);
        this.isUpdate = true;
        this.$set(this, 'isUpdate', true);
      },
      deep: true,
    },
    'configObj.tabConfig.tabVal': {
      handler(nVal, oVal) {
        this.count = this.defaults.tabConfig.list[nVal].count;
        this.picArrayConcat(this.count);
        this.configData.picList.splice(nVal + 1);
        this.currentIndex = 0;
        let list = this.defaults.menuConfig.list[0];
        if (this.configData.picList[0]) {
          list.img = this.configData.picList[0].image;
          list.imgJson = this.configData.picList[0].imageJson || '';
          list.info[0].value = this.configData.picList[0].link;
        }
      },
      deep: true,
    },
  },
  methods: {
    cubeImg(item) {
      if (!item) return '';
      return getLocalizedText(item.image, item.imageJson, getUiLocale(this));
    },
    currentTab(e, data) {
      this.currentIndex = e;
      this.configData.tabVal = e;
      if (this.defaults.menuConfig.isCube) {
        let list = this.defaults.menuConfig.list[0];
        if (data.picList[e]) {
          list.img = data.picList[e].image || '';
          list.imgJson = data.picList[e].imageJson || '';
          list.info[0].value = data.picList[e].link || '';
          list.info[0].radioVal = data.picList[e].radioVal || '0';
        } else {
          list.img = '';
          list.imgJson = '';
          list.info[0].value = '';
          list.info[0].radioVal = '0';
        }
      }
    },
    picArrayConcat(count) {
      for (let i = this.configData.picList.length; i < count; i++) {
        this.configData.picList.push({
          image: '',
          imageJson: '',
          link: '',
          radioVal: '0',
        });
      }
    },
  },
};
</script>
<style scoped lang="scss">
.divider {
  margin: 20px 0;
  border: 1px dashed #eeeeee;
}
::v-deep .ivu-divider-horizontal {
  margin: 12px 0;
}
.empty-box {
  color: #999999;
  font-size: 12px;
  border-radius: 0;
  background-color: #eee;
  width: 100%;
  border: 1px solid #ddd;
  text-align: center;
}

.mobile-page {
  .advert {
    .advertItem01 {
      width: 100%;
      height: 100%;
      .empty-box {
        width: 100%;
        height: 379px;
        border-radius: 0;
        .icon-tu {
          font-size: 50px;
          color: #999;
        }
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
    .advertItem02 {
      width: 100%;
      .item {
        width: 50%;
        height: auto;
        img {
          width: 100%;
          height: 100%;
        }
        .empty-box {
          width: 100%;
          height: 189.5px;
          border-radius: 0;
        }
      }
    }
    .advertItem03 {
      .item {
        width: 33.3333%;
        .empty-box {
          width: 100%;
          height: 126.4px;
          border-radius: 0;
        }
      }
    }
    .advertItem04 {
      .item {
        width: 50%;
        height: 189.5px;
        .empty-box {
          width: 100%;
          height: 100%;
          border-radius: 0;
        }
        img {
          width: 100%;
          height: 100%;
        }
        .pic {
          width: 100%;
          height: 100%;
          .empty-box {
            width: 100%;
            height: 94.75px;
            border-radius: 0;
          }
        }
      }
    }
    .advertItem05 {
      .item {
        width: 25%;
        .empty-box {
          width: 100%;
          height: 94.75px;
          border-radius: 0;
        }
      }
    }
    .advertItem06 {
      .item {
        width: 50%;
        height: 95px;
        img {
          width: 100%;
          height: 100%;
        }
        .empty-box {
          width: 100%;
          height: 100%;
          border-radius: 0;
        }
      }
    }
  }
}
.pic-four {
  display: flex;
  flex-direction: column;
}
.img-style {
  background-repeat: no-repeat;
  // width: 100%;
  // height: 100%;
  background-position: center center;
}
.stretch {
  background-size: 100% 100%;
}
.scale {
  object-fit: contain !important;
}
.fill {
  object-fit: cover !important;
}
.on {
  img {
    border: 1px solid #1890ff !important;
  }

  .empty-box {
    border: 1px solid #1890ff !important;
    color: #1890ff;
  }
}
</style>
