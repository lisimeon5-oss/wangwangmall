<template>
  <div class="mobile-page" v-if="configObj" :style="boxStyle">
    <div class="empty-box video" :style="contantRadius">
      <video :src="videoUrl"></video>
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
import { diyCname, mergeDiyUiLabels } from '@/utils/diyCname';
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'home_video',
  ...diyCname('pagediy.video'),
  icon: 't-icon-zujian-shipin',
  configName: 'c_home_video',
  type: 0, // 0 基础组件 1 营销组件 2工具组件
  defaultName: 'video', // 外面匹配名称
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
    contantRadius() {
      return [{ 'border-radius': this.configObj.contantStyle.val ? this.configObj.contantStyle.val + 'px' : '0' }];
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
  },
  data() {
    return {
      defaultConfig: {
        name: 'video',
        timestamp: this.num,
        setUp: {
          tabVal: 0,
          cname: this.$t('pagediy.video'),
        },
        tabConfig: {
          title: this.$t('pagediy.videoType'),
          name: 'tabConfig',
          tabTitle: this.$t('pagediy.videoContentSettings'),
          list: [
            {
              val: this.$t('pagediy.manualUpload'),
              icon: 'icon-shoudongshangchuan',
            },
            {
              val: this.$t('pagediy.videoLink'),
              icon: 'icon-shipinlianjie',
            },
          ],
          tabVal: 0,
        },
        uploadVideo: {
          title: this.$t('upload.uploadVideo'),
          name: 'uploadVideo',
          isShow: 1,
          tips: this.$t('pagediy.suggestSize152x60'),
          header: this.$t('pagediy.setLogo'),
          url: '',
          urlJson: '',
        },
        cover: {
          name: 'cover',
          isShow: 1,
          tips: this.$t('pagediy.suggestSize152x60'),
          header: this.$t('pagediy.setLogo'),
          url: '',
          title: this.$t('pagediy.videoCover'),
          val: '',
          urlJson: '',
        },
        link: {
          title: this.$t('pagediy.videoLink'),
          value: '',
          place: this.$t('pagediy.pleaseEnterLink'),
          isShow: 0,
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
        // 左右间距
        lrConfig: {
          title: this.$t('pagediy.leftRightMargin'),
          val: 12,
          min: 0,
          max: 40,
        },
      },
      configObj: null,
      videoUrl: '',
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
    setConfig(data) {
      if (!data) return;
      if (data) {
        this.configObj = mergeDiyUiLabels(data, this.defaultConfig);
        const locale = getUiLocale(this);
        if (this.configObj.tabConfig.tabVal === 0) {
          this.videoUrl = getLocalizedText(this.configObj.uploadVideo.url, this.configObj.uploadVideo.urlJson, locale);
        } else {
          this.videoUrl = getLocalizedText(
            this.configObj.link.value || this.configObj.link.val,
            this.configObj.link.valueJson || this.configObj.link.valJson,
            locale,
          );
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.video {
  width: 100%;
  height: 239px !important;
  video {
    width: 100%;
    height: 100%;
  }
}
</style>
