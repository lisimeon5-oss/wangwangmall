<template>
  <div class="mobile-config">
    <Form ref="formInline">
      <div v-for="(item, key) in rCom" :key="key">
        <component
          :is="item.components.name"
          :configObj="configObj"
          ref="childData"
          :configNme="item.configNme"
          :key="key"
          @getConfig="getConfig"
          :index="activeIndex"
          :num="item.num"
        ></component>
      </div>
      <rightBtn :activeIndex="activeIndex" :configObj="configObj"></rightBtn>
    </Form>
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
import toolCom from '../mobileConfigRight/index.js';
import rightBtn from '../rightBtn/index.vue';
import { mapMutations } from 'vuex';
import { diyCname, applyDiyUiLabels } from '@/utils/diyCname';
import newsRollPage from '../mobilePage/home_news_roll.vue';
export default {
  name: 'c_news_roll',
  componentsName: 'home_news_roll',
  ...diyCname('pagediy.newsBroadcast'),
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
  components: {
    ...toolCom,
    rightBtn,
  },
  data() {
    return {
      hotIndex: 1,
      configObj: {}, // 配置对象
      rCom: [
        {
          components: toolCom.c_checked_tab,
          configNme: 'setUp',
        },
      ], // 当前页面组件
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
              configNme: 'logoConfig',
            },
            {
              components: toolCom.c_upload_img,
              configNme: 'logoConfig',
            },
            {
              components: toolCom.c_title,
              configNme: 'listConfig',
            },
            {
              components: toolCom.c_product,
              configNme: 'listConfig',
            },
          ];
          this.rCom = arr.concat(tempArr);
        } else {
          let tempArr = [
            {
              components: toolCom.c_title,
              configNme: 'directionConfig',
            },
            {
              components: toolCom.c_txt_tab,
              configNme: 'directionConfig',
            },
            {
              components: toolCom.c_txt_tab,
              configNme: 'textPosition',
            },
            {
              components: toolCom.c_bg_color,
              configNme: 'textColor',
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
              configNme: 'upConfig',
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
      this.configObj = applyDiyUiLabels(value, { data: newsRollPage.data, num: nVal });
    },
    // 获取组件参数
    getConfig(data) {},
  },
};
</script>

<style scoped lang="scss">
.title-tips {
  padding-bottom: 10px;
  font-size: 14px;
  colo: #333;
  span {
    margin-right: 14px;
    color: #999;
  }
}
</style>
