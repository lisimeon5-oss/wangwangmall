<template>
  <div class="mobile-config">
    <div v-for="(item, key) in rCom" :key="key">
      <component
        :is="item.components.name"
        :configObj="configObj"
        ref="childData"
        :configNme="item.configNme"
        :key="key"
        :index="activeIndex"
        :num="item.num"
      ></component>
    </div>
    <rightBtn :activeIndex="activeIndex" :configObj="configObj"></rightBtn>
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
import toolCom from '@/components/PageDiy/mobileConfigRight/index.js';
import rightBtn from '@/components/PageDiy/rightBtn/index.vue';
import { mapState, mapMutations, mapActions } from 'vuex';
import bannerPage from '../mobilePage/banner.vue';
import { applyDiyUiLabels } from '@/utils/diyCname';
export default {
  name: 'c_banner',
  componentsName: 'home_banner',
  components: {
    ...toolCom,
    rightBtn,
  },
  props: {
    activeIndex: {
      type: null,
    },
    num: {
      type: null,
    },
    index: {
      type: null,
    },
  },
  data() {
    return {
      configObj: {},
      rCom: [
        {
          components: toolCom.c_checked_tab,
          configNme: 'setUp',
        },
      ],
    };
  },
  watch: {
    num(nVal) {
      this.loadConfig(nVal);
    },
    configObj: {
      handler(nVal, oVal) {
        this.$store.commit('mobildConfig/UPDATEARR', { num: this.num, val: nVal });
      },
      deep: true,
    },
    'configObj.setUp.tabVal': {
      handler(nVal, oVal) {
        var arr = [this.rCom[0]];
        if (nVal == 0) {
          let tempArr = [
            {
              components: toolCom.c_title,
              configNme: 'swiperStyleConfig',
            },
            {
              components: toolCom.c_radio,
              configNme: 'swiperStyleConfig',
            },
            {
              components: toolCom.c_title,
              configNme: 'swiperConfig',
            },
            {
              components: toolCom.c_menu_list,
              configNme: 'swiperConfig',
            },
          ];
          this.rCom = arr.concat(tempArr);
        } else {
          let tempArr = [
            {
              components: toolCom.c_title,
              configNme: 'docConfig',
            },
            {
              components: toolCom.c_txt_tab,
              configNme: 'docConfig',
            },
            {
              components: toolCom.c_txt_tab,
              configNme: 'txtStyle',
            },
            {
              components: toolCom.c_radio,
              configNme: 'themeStyleConfig',
            },
            {
              components: toolCom.c_bg_color,
              configNme: 'docColor',
            },
            {
              components: toolCom.c_title,
              configNme: 'bgColor',
            },
            {
              components: toolCom.c_bg_color,
              configNme: 'bgColor',
            },
            {
              components: toolCom.c_title,
              configNme: 'downConfig',
            },
            {
              components: toolCom.c_slider,
              configNme: 'upConfig',
            },
            {
              components: toolCom.c_slider,
              configNme: 'downConfig',
            },
            {
              components: toolCom.c_slider,
              configNme: 'lrConfig',
            },
            {
              components: toolCom.c_slider,
              configNme: 'mbConfig',
            },
            {
              components: toolCom.c_title,
              configNme: 'bgStyle',
            },
            {
              components: toolCom.c_slider,
              configNme: 'bgStyle',
            },
            {
              components: toolCom.c_slider,
              configNme: 'contentStyle',
            },
          ];
          this.rCom = arr.concat(tempArr);
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.loadConfig(this.num);
    });
  },
  methods: {
    loadConfig(nVal) {
      const raw = this.$store.state.mobildConfig.defaultArray[nVal];
      if (!raw) return;
      const value = JSON.parse(JSON.stringify(raw));
      this.configObj = applyDiyUiLabels(value, { data: bannerPage.data, num: nVal });
    },
    handleSubmit(name) {
      let obj = {};
      obj.activeIndex = this.activeIndex;
      obj.data = this.configObj;
      this.add(obj);
    },
    ...mapMutations({
      add: 'mobildConfig/UPDATEARR',
    }),
  },
};
</script>

<style scoped lang="scss">
.title-tips {
  padding-bottom: 10px;
  color: #333;
  span {
    margin-right: 14px;
    color: #999;
  }
}
</style>
