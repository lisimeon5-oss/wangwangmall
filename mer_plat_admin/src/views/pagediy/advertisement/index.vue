<template>
  <div class="divBox">
    <el-card class="box-card" :body-style="{ padding: '40px 50px' }" shadow="never" :bordered="false">
      <div class="flex">
        <div class="iframe" :bordered="false">
          <div class="nofonts" v-if="!previewAdList.length">{{ $t('pagediy.noSplashAdPhoto') }}</div>
          <swiper :options="swiperOption" class="swiperimg on">
            <swiper-slide class="swiperimg on" v-for="(item, index) in previewAdList" :key="index + 'a'">
              <img :src="previewAdImage(item)" mode="aspectFill" />
            </swiper-slide>
          </swiper>
        </div>
        <div class="content">
          <div class="ml20">
            <div class="right-box">
              <div class="title-bar-line">{{ $t('pagediy.splashAdSettings') }}</div>
              <div class="from-tips">{{ $t('pagediy.splashAdImageTip') }}</div>
              <div class="list-box mt20">
                <el-form :model="splashFrom">
                  <el-form-item :label="$t('pagediy.splashAdLabel')">
                    <el-switch
                      v-model="splashFrom.splashAdSwitch"
                      :active-value="1"
                      :inactive-value="0"
                      :width="55"
                      :active-text="$t('common.open')"
                      :inactive-text="$t('common.close')"
                    />
                  </el-form-item>
                  <el-form-item :label="$t('pagediy.adTimeLabel')">
                    <el-input-number
                      v-model.number="splashFrom.splashAdShowTime"
                      type="number"
                      size="small"
                      :min="1"
                      :placeholder="$t('pagediy.pleaseEnterSplashAdTime')"
                      style="width: 150px"
                    ></el-input-number
                    >{{ $t('pagediy.unitSeconds') }}
                    <div class="from-tips">{{ $t('pagediy.adAutoCloseTip') }}</div>
                  </el-form-item>
                  <el-form-item :label="$t('pagediy.displayIntervalLabel')">
                    <el-input-number
                      v-model.number="splashFrom.splashAdShowInterval"
                      type="number"
                      size="small"
                      :min="0"
                      :placeholder="$t('pagediy.pleaseEnterAdInterval')"
                      style="width: 150px"
                    ></el-input-number
                    >{{ $t('pagediy.unitHours') }}
                    <div class="from-tips">
                      {{ $t('pagediy.splashAdIntervalTip') }}
                    </div>
                  </el-form-item>
                </el-form>
                <FromList :configObj="advertisementConfig"></FromList>
              </div>
              <div class="save">
                <el-button
                  size="small"
                  type="primary"
                  v-hasPermi="['platform:page:layout:splash:ad:save']"
                  v-debounceClick="handleAdvertisementSave"
                  >{{ loadingBtn ? $t('finance.submitting') : $t('common.save') }}</el-button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
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
import FromList from '@/components/FromList';
import { splashGetApi, splashSaveApi } from '@/api/devise';
import { checkPermi } from '@/utils/permission';
import { advertisementDefault } from '@/views/pagediy/advertisement/default';
import { getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'index',
  components: { FromList },
  data() {
    return {
      swiperOption: {
        //显示分页
        pagination: {
          el: '.swiper-pagination',
        },
        //设置点击箭头
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        //自动轮播
        autoplay: {
          delay: 2000,
          //当用户滑动图片后继续自动轮播
          disableOnInteraction: false,
        },
        //开启循环模式
        loop: false,
      },
      advertisementConfig: Object.assign({}, advertisementDefault()), //选择链接数据
      activeIndex: 0,
      splashFrom: {
        adList: [],
        splashAdShowInterval: 0,
        splashAdShowTime: 0,
        splashAdSwitch: 0,
      },
      loadingBtn: false,
    };
  },
  computed: {
    previewAdList() {
      return (this.advertisementConfig && this.advertisementConfig.list) || [];
    },
  },
  mounted() {
    if (checkPermi(['platform:page:layout:splash:ad:get'])) this.getAdvertisement();
  },
  methods: {
    previewAdImage(item) {
      return getLocalizedText(item && item.imageUrl, item && item.imageUrlJson, getUiLocale(this));
    },
    // 开屏广告新增
    handleAdvertisementSave() {
      this.advertisementConfig.list.map((item, index) => {
        item.sort = index + 1;
      });
      let data = {
        ...this.splashFrom,
        adList: this.advertisementConfig.list,
      };
      this.loadingBtn = true;
      splashSaveApi(data)
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getAdvertisement();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    // 开屏广告数据
    getAdvertisement() {
      splashGetApi().then((res) => {
        this.splashFrom = res;
        this.advertisementConfig.list = res.adList || [];
      });
    },
  },
};
</script>

<style scoped lang="scss">
.iframe {
  margin-left: 20px;
  position: relative;
  width: 350px;
  height: 75vh;
  max-height: 650px;
  background: #ffffff;
  border: 1px solid #eeeeee;
  opacity: 1;
  border-radius: 10px;
}
.swiperimg {
  width: 335px;
  height: 145px;
  border-radius: 8px;

  &.on {
    height: 75vh;
    max-height: 650px;
    width: 350px;
    line-height: 145px;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.nofonts {
  text-align: center;
  line-height: 125px;
}
.content {
  max-height: calc(100vh - 200px);
  overflow-y: scroll;
  .right-box {
    margin-left: 40px;
  }
}
.content::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}
</style>
