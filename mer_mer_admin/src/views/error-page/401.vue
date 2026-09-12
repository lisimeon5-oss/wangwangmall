<template>
  <div class="errPage-container">
    <el-button size="small" icon="el-icon-arrow-left" class="pan-back-btn" @click="back"> {{ $t('common.back') }} </el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">Oops!</h1>
        {{ $t('error.gifSource') }}<a href="https://zh.airbnb.com/" target="_blank">airbnb</a> {{ $t('error.page') }}
        <h2>{{ $t('error.noPermissionPage') }}</h2>
        <h6>{{ $t('error.contactLeader') }}</h6>
        <ul class="list-unstyled">
          <li>{{ $t('error.orGoTo') }}</li>
          <li class="link-type">
            <router-link to="/dashboard"> {{ $t('error.backToHome') }} </router-link>
          </li>
          <li class="link-type">
            <a href="https://www.crmeb.com/">{{ $t('error.takeALook') }}</a>
          </li>
          <li><a href="#" @click.prevent="dialogVisible = true">{{ $t('error.clickToViewImage') }}</a></li>
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream." />
      </el-col>
    </el-row>
    <el-dialog :visible.sync="dialogVisible" :title="$t('error.browseFreely')">
      <img :src="ewizardClap" class="pan-img" />
    </el-dialog>
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

import errGif from '@/assets/401_images/401.gif';

export default {
  name: 'Page401',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      ewizardClap: 'https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646',
      dialogVisible: false,
    };
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: '/dashboard' });
      } else {
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
  .pan-back-btn {
    background: #008489;
    color: #fff;
    border: none !important;
  }
  .pan-gif {
    margin: 0 auto;
    display: block;
  }
  .pan-img {
    display: block;
    margin: 0 auto;
    width: 100%;
  }
  .text-jumbo {
    font-size: 60px;
    font-weight: 700;
    color: #484848;
  }
  .list-unstyled {
    font-size: 14px;
    li {
      padding-bottom: 5px;
    }
    a {
      color: #008489;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
