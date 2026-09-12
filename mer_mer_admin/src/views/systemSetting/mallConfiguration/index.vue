<template>
  <div class="divBox relative mallConfiguration">
    <el-card class="box-card" shadow="never" :bordered="false" :body-style="{ padding: '40px 50px' }">
      <div class="form-data">
        <el-form :model="pcConfigForm" :rules="rules" ref="pcConfigForm" label-width="129px" class="demo-ruleForm">
          <el-form-item :label="$t('systemSetting.pcMerchantLogoLabel')" prop="pcLogo">
            <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'pcLogo')">
              <div v-if="pcConfigForm.pcLogo" class="pictrue"><img :src="pcConfigForm.pcLogo" /></div>
              <div v-else class="upLoad">
                <i class="el-icon-camera cameraIconfont" />
              </div>
              <div class="line-heightOne from-tips">{{ $t('systemSetting.uploadImageUnder500kb60') }}</div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('systemSetting.brandStoreCoverLabel')" prop="pcGoodStoreCoverImage">
            <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'pcGoodStoreCoverImage')">
              <div v-if="pcConfigForm.pcGoodStoreCoverImage" class="pictrue">
                <img :src="pcConfigForm.pcGoodStoreCoverImage" />
              </div>
              <div v-else class="upLoad">
                <i class="el-icon-camera cameraIconfont" />
              </div>
              <div class="line-heightOne from-tips">{{ $t('systemSetting.uploadImageUnder500kb228') }}</div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('systemSetting.storeBannerLabel')">
            <FromList :configObj="bannerListConfig"></FromList>
          </el-form-item>
          <el-form-item :label="$t('systemSetting.storeRecommendedProductsLabel')">
            <div class="goods-box borderPadding">
              <div class="wrapper">
                <div class="dragArea list-group upLoadPicBox">
                  <div class="item" v-for="(good, index) in goodsList" :key="index">
                    <img :src="good.image" alt="" />
                    <i class="el-icon-error" @click.stop="handleDelete(index)" />
                  </div>
                  <div v-if="goodsList.length < 20" class="upLoad mb14" @click="handleAddGoods">
                    <i class="el-icon-camera cameraIconfont" />
                  </div>
                </div>
              </div>
            </div>
            <div class="from-tips" style="margin-top: 0">{{ $t('systemSetting.max20Products') }}</div>
          </el-form-item>
          <el-form-item v-hasPermi="['merchant:config:pc:shopping:save']">
            <el-button
              type="primary"
              v-debounceClick="
                () => {
                  handlePcConfigSave('pcConfigForm');
                }
              "
              >{{ loadingBtn ? $t('common.submitting') : $t('common.save') }}</el-button
            >
          </el-form-item>
        </el-form>
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
// +----------------------------------------------------------------------\
import FromList from '@/components/FromList/index.vue';
import { getPcConfigApi, savePcConfigApi } from '@/api/systemPcConfig';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  components: { FromList },
  data() {
    return {
      loadingBtn: false,
      loading: false,
      pcConfigForm: {
        bannerList: [],
        pcGoodStoreCoverImage: '',
        pcLogo: '',
        recommendProductList: [],
        recommendProductStr: '',
      },
      rules: {
        pcLogo: [{ required: true, message: this.$t('systemSetting.pleaseUploadMerchantPcLogo'), trigger: 'change' }],
        pcGoodStoreCoverImage: [{ required: true, message: this.$t('systemSetting.pleaseUploadBrandStoreCover'), trigger: 'change' }],
      },
      // 店铺banner
      bannerListConfig: {
        tips: this.$t('systemSetting.storeBannerTip'),
        title: this.$t('systemSetting.linkName'),
        isShowAddBtn: true, //添加按钮
        isShowEdit: true, //删除按钮
        isShowStatus: true, //开启状态
        isShowLinkUrl: true, //链接地址
        isShowImageUrl: true, //图片地址
        isShowName: false,
        maxList: 10, //最多可添加
        list: [
          {
            linkUrl: '',
            id: 0,
            sort: 0,
            imageUrl: '',
            status: false,
          },
        ],
      },
      goodsList: [], //选择的商品列表
    };
  },
  mounted() {
    if (checkPermi(['merchant:config:pc:shopping:get'])) this.getPcConfig();
  },
  methods: {
    //上传图片
    modalPicTap(type, num) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (num === 'pcLogo') {
            _this.pcConfigForm.pcLogo = img[0].sattDir;
            if (_this.pcConfigForm.pcLogo) _this.$refs.pcConfigForm.clearValidate(['pcLogo']);
          } else {
            _this.pcConfigForm.pcGoodStoreCoverImage = img[0].sattDir;
            if (_this.pcConfigForm.pcGoodStoreCoverImage)
              _this.$refs.pcConfigForm.clearValidate(['pcGoodStoreCoverImage']);
          }
        },
        type,
        'mallConfiguration',
      );
    },
    //底部授权数据
    getPcConfig() {
      getPcConfigApi().then((res) => {
        Object.assign(this.pcConfigForm, res);
        this.bannerListConfig.list = this.pcConfigForm.bannerList || [];
        this.goodsList = this.pcConfigForm.recommendProductList || [];
      });
    },
    //选择商品
    handleAddGoods() {
      const _this = this;
      this.$modalGoodList(
        function (row) {
          _this.getCheckedGoods(row);
        },
        'many',
        _this.goodsList,
        20,
      );
    },
    // 选中商品
    getCheckedGoods(row) {
      const _this = this;
      _this.goodsList = row;
    },
    handleDelete(index) {
      this.goodsList.splice(index, 1);
    },
    // 获取保存数据的数据
    getSaveData() {
      this.bannerListConfig.list.map((item, index) => {
        item.sort = index + 1;
      });
      this.pcConfigForm.bannerList = this.bannerListConfig.list;
      if (this.goodsList.length) {
        let recommendProduct = [];
        this.goodsList.map((item) => {
          recommendProduct.push(item.id);
        });
        this.pcConfigForm.recommendProductStr = recommendProduct.toString();
      } else {
        this.pcConfigForm.recommendProductStr = '';
      }
    },
    //保存
    handlePcConfigSave(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loadingBtn = true;
          this.getSaveData();
          savePcConfigApi(this.pcConfigForm)
            .then((res) => {
              this.$message.success(this.$t('user.saveSuccess'));
              this.loadingBtn = false;
              this.getPcConfig();
            })
            .catch(() => {
              this.loadingBtn = false;
            });
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-form-item__content {
  line-height: 1 !important;
}

.mallConfiguration {
  .title {
    padding-left: 10px;
    border-left: 3px solid var(--prev-color-primary);
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    color: #303133;
  }
}

.goods-box {
  .wrapper,
  .list-group {
    display: flex;
    flex-wrap: wrap;
  }

  .add-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    background: #f7f7f7;

    .iconfont-diy,
    .iconfont {
      font-size: 20px;
      color: #d8d8d8;
    }
  }

  .item {
    position: relative;
    width: 60px;
    height: 60px;
    margin-bottom: 14px;
    margin-right: 12px;
    border-radius: 4px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }

    .el-icon-error {
      position: absolute;
      right: -9px;
      top: -13px;
      font-size: 19px;
      cursor: pointer;
    }
  }
}
</style>
