<template>
  <div class="mobile-page" v-if="configObj" :style="boxStyle">
    <div class="advert">
      <template v-if="style === 0">
        <div class="advertItem01 acea-row" v-for="(item, index) in picList" :key="index">
          <img
            :src="cubeImg(item)"
            v-if="cubeImg(item)"
            :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
            class="img-style"
            :style="radiusStyle"
          />
          <div class="empty-box" v-else>
            <span class="iconfont icontupian"></span>
          </div>
        </div>
      </template>

      <div class="advertItem02 acea-row" v-if="style === 1" :style="gapStyle">
        <div class="item" v-for="(item, index) in picList" :key="index" :style="spaceStyleTwo">
          <img
            :src="cubeImg(item)"
            v-if="cubeImg(item)"
            :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
            class="img-style"
            :style="radiusStyle"
          />
          <div class="empty-box" v-else>
            <span class="iconfont icontupian"></span>
          </div>
        </div>
      </div>
      <div class="advertItem02 advertItem03 acea-row" v-if="style === 2" :style="gapStyle">
        <div class="item" v-for="(item, index) in picList" :key="index" :style="spaceStyleThree">
          <img
            :src="cubeImg(item)"
            v-if="cubeImg(item)"
            :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
            class="img-style"
            :style="radiusStyle"
          />
          <div class="empty-box" v-else>
            <span class="iconfont icontupian"></span>
          </div>
        </div>
      </div>
      <div class="advertItem04 acea-row" v-if="style === 3" :style="gapStyle">
        <div class="item" :style="spaceStyleTwo">
          <img
            :src="picList.length > 0 && cubeImg(picList[0])"
            v-if="picList.length > 0 && cubeImg(picList[0])"
            :class="picList[0].radioVal === '0' ? 'stretch' : picList[0].radioVal === '1' ? 'scale' : 'fill'"
            class="img-style img-left"
            :style="radiusStyle"
          />
          <div class="empty-box" v-else>
            <span class="iconfont icontupian"></span>
          </div>
        </div>
        <div class="item pic-four" :style="spaceStyleFour">
          <div class="pic">
            <img
              :src="picList.length > 1 && cubeImg(picList[1])"
              v-if="picList.length > 1 && cubeImg(picList[1])"
              :class="picList[1].radioVal === '0' ? 'stretch' : picList[1].radioVal === '1' ? 'scale' : 'fill'"
              class="img-style"
              :style="radiusStyle"
            />
            <div class="empty-box" v-else>
              <span class="iconfont icontupian"></span>
            </div>
          </div>
          <div class="pic">
            <img
              :src="picList.length > 2 && cubeImg(picList[2])"
              v-if="picList.length > 2 && cubeImg(picList[2])"
              :class="picList[2].radioVal === '0' ? 'stretch' : picList[2].radioVal === '1' ? 'scale' : 'fill'"
              class="img-style"
              :style="radiusStyle"
            />
            <div class="empty-box" v-else>
              <span class="iconfont icontupian"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="advertItem02 advertItem05 acea-row" v-if="style === 4" :style="gapStyle">
        <div class="item" v-for="(item, index) in picList" :key="index" :style="spaceStyleFive">
          <img
            :src="cubeImg(item)"
            v-if="cubeImg(item)"
            :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
            class="img-style"
            :style="radiusStyle"
          />
          <div class="empty-box" v-else>
            <span class="iconfont icontupian"></span>
          </div>
        </div>
      </div>
      <div class="advertItem06 acea-row" v-if="style === 5" :style="gapStyle">
        <div class="item" v-for="(item, index) in picList" :key="index" :style="spaceStyleTwo">
          <img
            :src="cubeImg(item)"
            v-if="cubeImg(item)"
            :class="item.radioVal === '0' ? 'stretch' : item.radioVal === '1' ? 'scale' : 'fill'"
            class="img-style"
            :style="radiusStyle"
          />
          <div class="empty-box" v-else>
            <span class="iconfont icontupian"></span>
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
import { mapState } from 'vuex';
import { diyCname } from '@/utils/diyCname';
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'picture_cube',
  ...diyCname('pagediy.pictureCube'),
  configName: 'c_picture_cube',
  icon: 't-icon-zujian-tupianmofang',
  type: 0, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'pictureCube', // 外面匹配名称
  props: {
    index: {
      type: null,
    },
    num: {
      type: null,
    },
  },
  computed: {
    ...mapState('mobildConfig', ['defaultArray']),
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
  watch: {
    pageData: {
      handler(nVal, oVal) {
        this.setConfig(nVal);
      },
      deep: true,
    },
    num: {
      handler(nVal, oVal) {
        let data = this.$store.state.mobildConfig.defaultArray[nVal];
        this.setConfig(data);
      },
      deep: true,
    },
    defaultArray: {
      handler(nVal, oVal) {
        let data = this.$store.state.mobildConfig.defaultArray[this.num];
        this.setConfig(data);
      },
      deep: true,
    },
    style(nVal) {
      this.configObj.menuConfig.nowIndex = nVal;
    },
  },
  data() {
    return {
      // 默认初始化数据禁止修改
      defaultConfig: {
        name: 'pictureCube',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.pictureCube'),
        },
        tabConfig: {
          name: 'pictureCure',
          title: this.$t('pagediy.selectAppearance'),
          tabTitle: this.$t('pagediy.contentSettings'),
          isShow: 1,
          tabVal: 0,
          list: [
            {
              val: this.$t('pagediy.styleOne'),
              icon: 'icon-tupian-yangshiyi',
              count: 1,
            },
            {
              val: this.$t('pagediy.styleTwo'),
              icon: 'icon-tupian-yangshier',
              count: 2,
            },
            {
              val: this.$t('pagediy.styleThree'),
              icon: 'icon-tupian-yangshisan',
              count: 3,
            },
            {
              val: this.$t('pagediy.styleFour'),
              icon: 'icon-tupian-yangshisi',
              count: 3,
            },
            {
              val: this.$t('pagediy.styleFive'),
              icon: 'icon-tupian-yangshiwu',
              count: 4,
            },
            {
              val: this.$t('pagediy.styleSix'),
              icon: 'icon-tupian-yangshiliu',
              count: 4,
            },
          ],
        },
        picStyle: {
          tabVal: 0,
          picList: [
            {
              image: '',
              imageJson: '',
              link: '',
              radioVal: '0',
            },
          ],
        },
        menuConfig: {
          name: 'tpmf',
          title: '',
          maxList: 1,
          isCube: 1,
          isSmall: false,
          nowIndex: 0,
          radioShow: 1,
          list: [
            {
              img: '',
              imgJson: '',
              info: [
                {
                  title: this.$t('pagediy.link'),
                  tips: this.$t('pagediy.pleaseEnterLink'),
                  value: '',
                  max: 100,
                  radioVal: '0',
                },
              ],
            },
          ],
        },
        bgColor: {
          title: this.$t('pagediy.backgroundColor'),
          tabTitle: this.$t('pagediy.colorSettings'),
          default: [
            {
              item: '#FFFFFF',
            },
            {
              item: '#FFFFFF',
            },
          ],
          color: [
            {
              item: '#FFFFFF',
            },
            {
              item: '#FFFFFF',
            },
          ],
        },
        bgStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.backgroundCircle'),
          name: 'bgStyle',
          val: 0,
          min: 0,
          max: 30,
        },
        contantStyle: {
          tabTitle: this.$t('pagediy.radiusSettings'),
          title: this.$t('pagediy.contentRadius'),
          name: 'contantStyle',
          val: 0,
          min: 0,
          max: 30,
        },
        // 左右间距
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          val: 12,
          min: 0,
          max: 40,
        },
        // 页面间距
        // 上间距
        upConfig: {
          tabTitle: this.$t('pagediy.marginSettings'),
          title: this.$t('pagediy.topMargin'),
          val: 10,
          min: 0,
          max: 100,
        },
        // 下间距
        downConfig: {
          title: this.$t('pagediy.bottomMargin'),
          val: 10,
          min: 0,
        },
        mbConfig: {
          title: this.$t('pagediy.pageSpacing'),
          val: 10,
          min: 0,
        },
        spaceConfig: {
          title: this.$t('pagediy.contentSpacing'),
          val: 0,
          min: 0,
          max: 20,
        },
      },
      pageData: {},
      style: 0,
      picList: [],
      configObj: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.num) {
        this.pageData = this.$store.state.mobildConfig.defaultArray[this.num];
        this.setConfig(this.pageData);
      }
    });
  },
  methods: {
    cubeImg(item) {
      if (!item) return '';
      return getLocalizedText(item.image, item.imageJson, getUiLocale(this));
    },
    setConfig(data) {
      if (!data) return;
      if (data) {
        this.configObj = data;
        this.style = data.tabConfig.tabVal;
        if (!data.picStyle.picList.length) {
          this.picList = [
            {
              image: '',
              link: '',
            },
          ];
        } else {
          this.picList = data.picStyle.picList;
        }
      }
    },
  },
};
</script>
<style scoped lang="scss">
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
.content img {
  object-fit: fill;
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
</style>
