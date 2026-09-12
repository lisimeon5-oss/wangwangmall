<template>
  <div class="divBox">
    <div class="container_box">
      <pages-header ref="pageHeader" :title="$t('marketing.addLiveRoom')" backUrl="/marketing/broadcast/room"></pages-header>
    </div>
    <el-card class="box-card mt14" v-loading="listLoading" shadow="never" :bordered="false">
      <el-form :model="formData" :rules="rules" ref="formData" label-width="150px" class="demo-ruleForm">
        <el-form-item :label="$t('marketing.liveRoomName')" prop="roomName">
          <el-input
            :disabled="isDetail"
            v-model.trim="formData.roomName"
            :placeholder="$t('marketing.roomNameLengthPlaceholder')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('marketing.hostNickname')" prop="anchorName">
          <el-input
            :disabled="isDetail"
            v-model.trim="formData.anchorName"
            :placeholder="$t('marketing.hostNameLengthPlaceholder')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('marketing.hostWechat')" prop="anchorWechat">
          <el-input :disabled="isDetail" v-model.trim="formData.anchorWechat"></el-input>
        </el-form-item>
        <el-form-item :label="$t('marketing.hostSubWechat')">
          <el-input :disabled="isDetail" v-model.trim="formData.subAnchorWechat"></el-input>
        </el-form-item>
        <el-form-item :label="$t('marketing.creatorWechat')">
          <el-input :disabled="isDetail" v-model.trim="formData.createrWechat"></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.backgroundImage')" prop="coverImgLocal">
          <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'coverImgLocal')">
            <div v-if="formData.coverImgLocal" class="pictrue">
              <img v-if="formData.coverImgLocal && !isDetail" :src="formData.coverImgLocal" />
              <el-image
                v-else
                style="width: 60px; height: 60px"
                :src="formData.coverImgLocal"
                :preview-src-list="[formData.coverImgLocal]"
              />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
            <span class="from-tips">{{ $t('marketing.imageTip1080') }}</span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('marketing.shareImageLabel')" prop="shareImgLocal">
          <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'shareImgLocal')">
            <div v-if="formData.shareImgLocal" class="pictrue">
              <img v-if="formData.shareImgLocal && !isDetail" :src="formData.shareImgLocal" />
              <el-image
                v-else
                style="width: 60px; height: 60px"
                :src="formData.shareImgLocal"
                :preview-src-list="[formData.shareImgLocal]"
              />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
            <span class="from-tips">{{ $t('marketing.imageTip800x640') }}</span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveChannelCoverLabel')" prop="feedsImgLocal">
          <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'feedsImgLocal')">
            <div v-if="formData.feedsImgLocal" class="pictrue">
              <img v-if="formData.feedsImgLocal && !isDetail" :src="formData.feedsImgLocal" />
              <el-image
                v-else
                style="width: 60px; height: 60px"
                :src="formData.feedsImgLocal"
                :preview-src-list="[formData.feedsImgLocal]"
              />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
            <span class="from-tips">{{ $t('marketing.imageTip800') }}</span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveTimeLabel')" prop="timeVal">
          <el-date-picker
            :disabled="isDetail"
            style="width: 550px"
            v-model="formData.timeVal"
            type="datetimerange"
            range-separator="-"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            :start-placeholder="$t('product.startDate')"
            :end-placeholder="$t('product.endDate')"
            :picker-options="pickerOptions0"
            @change="onchangeTime"
            @blur="$forceUpdate()"
          >
          </el-date-picker>
          <p class="from-tips">{{ $t('marketing.liveTimeTip') }}</p>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveTypeLabel')" prop="type">
          <el-radio-group :disabled="isDetail" v-model="formData.type">
            <el-radio :label="1">{{ $t('marketing.streamPush') }}</el-radio>
            <el-radio :label="0">{{ $t('marketing.phoneLive') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveLikeLabel')" prop="closeLike">
          <el-radio-group :disabled="isDetail" v-model="formData.closeLike">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
          <p class="from-tips">{{ $t('marketing.disableLikeTip') }}</p>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveShelfLabel')" prop="closeLike">
          <el-radio-group :disabled="isDetail" v-model="formData.closeGoods">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
          <p class="from-tips">{{ $t('marketing.disableShelfTip') }}</p>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveCommentLabel')" prop="closeLike">
          <el-radio-group :disabled="isDetail" v-model="formData.closeComment">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
          <p class="from-tips">{{ $t('marketing.disableCommentTip') }}</p>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveInclusionLabel')">
          <el-radio-group :disabled="isDetail" v-model="formData.isFeedsPublic">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
          <p class="from-tips">{{ $t('marketing.inclusionDefaultOn') }}</p>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveReplayLabel')">
          <el-radio-group :disabled="isDetail" v-model="formData.closeReplay">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
          <p class="from-tips">{{ $t('marketing.canEnableAfterStart') }}</p>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveShareLabel')">
          <el-radio-group :disabled="isDetail" v-model="formData.closeShare">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
          <p class="from-tips">{{ $t('marketing.cannotEditAfterStart') }}</p>
        </el-form-item>
        <el-form-item :label="$t('marketing.liveServiceLabel')">
          <el-radio-group :disabled="isDetail" v-model="formData.closeKf">
            <el-radio :label="1">{{ $t('common.open') }}</el-radio>
            <el-radio :label="0">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
          <p class="from-tips">{{ $t('marketing.canEnableAfterStart') }}</p>
        </el-form-item>
        <el-form-item v-if="isDetail" :label="$t('marketing.importedLiveProductsLabel')">
          <el-table ref="table" :data="tableData.data" style="width: 100%" size="samll" highlight-current-row>
            <el-table-column prop="id" label="ID" min-width="50" />
            <el-table-column :label="$t('product.productImage')" min-width="100">
              <template slot-scope="scope">
                <div class="demo-image__preview line-heightOne">
                  <el-image :src="scope.row.coverImgUrlLocal" :preview-src-list="[scope.row.coverImgUrlLocal]" />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" :label="$t('product.listProductName')" min-width="120" />
            <el-table-column :label="$t('marketing.priceType')" min-width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.priceType | priceTypeFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('marketing.price')" min-width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.priceType === 1">{{ scope.row.price }}</span>
                <span v-else>{{ scope.row.price + '~' + scope.row.price2 }}</span>
              </template>
            </el-table-column>
            <!--<el-table-column prop="goods.pay_num" :label="$t('marketing.salesCount')" min-width="50" />-->
            <!--<el-table-column label="上下架" min-width="80">-->
            <!--<template slot-scope="scope">-->
            <!--<el-switch-->
            <!--v-model="scope.row.onSale"-->
            <!--:active-value="1"-->
            <!--:inactive-value="0"-->
            <!--:active-text="$t('product.onShelf')"-->
            <!--:inactive-text="$t('product.offShelf')"-->
            <!--@change="onchangeIsShow(scope.row)"-->
            <!--/>-->
            <!--</template>-->
            <!--</el-table-column>-->
            <el-table-column v-hasPermi="['merchant:mp:live:room:deletegoods']" :label="$t('common.operate')" width="70" fixed="right">
              <template slot-scope="scope">
                <a @click="handleDelete(scope.row, scope.$index)">{{ $t('common.delete') }}</a>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item v-if="!isDetail">
          <el-button
            v-hasPermi="['merchant:mp:live:room:create', 'merchant:mp:live:room:edit']"
            type="primary"
            v-debounceClick="
              () => {
                submitForm('formData');
              }
            "
            >{{ $t('coupon.submitNow') }}</el-button
          >
        </el-form-item>
      </el-form>
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
import {
  liveMediaUploadlocalApi,
  liveRoomCreateApi,
  liveRoomInfoApi,
  liveRoomGoodslistApi,
  liveRoomGoodsonsaleApi,
  liveRoomDeletegoodsinroomApi,
  liveRoomEditApi,
} from '@/api/marketing';
export default {
  name: 'CreatCoupon',
  data() {
    return {
      pickerOptions0: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
      pickerOptions: {
        disabledDate(time) {
          let curDate = new Date().getTime();
          let three = 180 * 24 * 3600 * 1000;
          let threeMonths = curDate - three;
          return time.getTime() > Date.now() || time.getTime() < threeMonths;
        },
      },
      tableData: {
        data: [],
        total: 0,
      },
      formData: {
        roomName: '',
        coverImg: '',
        startTime: '',
        endTime: '',
        anchorName: '',
        anchorWechat: '',
        subAnchorWechat: '',
        createrWechat: '',
        shareImg: '',
        feedsImg: '',
        isFeedsPublic: 1,
        type: 0,
        closeLike: 0,
        closeGoods: 0,
        closeComment: 0,
        closeReplay: 1,
        closeShare: 0,
        closeKf: 1,
        timeVal: [],
        coverImgLocal: '',
        feedsImgLocal: '',
        shareImgLocal: '',
        id: null,
      },
      listLoading: false,
      rules: {
        roomName: [
          { required: true, message: this.$t('marketing.roomNameRequired'), trigger: 'blur' },
          { min: 3, max: 17, message: this.$t('marketing.roomNameLengthRule'), trigger: 'blur' },
        ],
        anchorName: [
          { required: true, message: this.$t('marketing.roomNameRequired'), trigger: 'blur' },
          { min: 2, max: 15, message: this.$t('marketing.hostNameLengthRule'), trigger: 'blur' },
        ],
        anchorWechat: [{ required: true, message: this.$t('marketing.hostWechatRequired'), trigger: 'blur' }],
        coverImgLocal: [{ required: true, message: this.$t('marketing.uploadBackgroundRequired'), trigger: 'change' }],
        feedsImgLocal: [{ required: true, message: this.$t('marketing.uploadChannelCoverRequired'), trigger: 'change' }],
        shareImgLocal: [{ required: true, message: this.$t('marketing.uploadShareImageRequired'), trigger: 'change' }],
        timeVal: [{ type: 'array', required: true, message: this.$t('marketing.selectTimeRequired'), trigger: 'change' }],
        tempRoute: {},
      },
    };
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route);
  },
  computed: {
    //判断是否是详情
    isDetail() {
      return this.$route.params.type ? true : false;
    },
  },
  mounted() {
    this.setTagsViewTitle();
    if (this.$route.params.roomId) {
      this.getInfo();
    }
  },
  methods: {
    setTagsViewTitle() {
      const title = this.$route.params.roomId ? (this.isDetail ? this.$t('marketing.liveRoomDetail') : this.$t('marketing.editLiveRoom')) : this.$t('marketing.addLiveRoom');
      const route = Object.assign({}, this.tempRoute, {
        title: this.$route.params.roomId ? `${title}-${this.$route.params.roomId}` : `${title}`,
      });
      this.$store.dispatch('tagsView/updateVisitedView', route);
    },
    // 上下架 goodsId, roomId 取的是微信返回的id
    onchangeIsShow(row) {
      liveRoomGoodsonsaleApi({ goodsId: row.goodsId, roomId: this.formData.roomId, onSale: row.onSale }).then(() => {
        this.$message.success(this.$t('product.operateSuccess'));
        if (this.isDetail) this.getList();
      });
    },
    // 删除goodsId取的是微信返回的id
    handleDelete(item, idx) {
      this.$modalSure(this.$t('marketing.deleteLiveProductConfirm')).then(() => {
        liveRoomDeletegoodsinroomApi(this.$route.params.roomId, item.goodsId).then(() => {
          this.$message.success(this.$t('product.deleteSuccess'));
          if (this.isDetail) this.getList();
        });
      });
    },
    //详情
    getInfo() {
      this.listLoading = true;
      liveRoomInfoApi(this.$route.params.roomId)
        .then(async (res) => {
          if (res) {
            let info = JSON.parse(JSON.stringify(res));
            this.formData = info;
            this.formData.startTime = info.startTime;
            this.formData.endTime = info.endTime;
            this.formData.timeVal = [info.startTime, info.endTime];
            if (this.isDetail) this.getList();
          }
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
        });
    },
    // 点击商品图
    modalPicTap(num, tit) {
      const _this = this;
      if (_this.isDetail) return;
      this.$modalUpload(
        async function (img) {
          if (img) {
            _this.formData[tit] = img[0].sattDir;
            switch (tit) {
              case 'coverImgLocal':
                _this.formData.coverImg = await _this.getImgData(_this.formData[tit]);
                break;
              case 'feedsImgLocal':
                _this.formData.feedsImg = await _this.getImgData(_this.formData[tit]);
                break;
              default:
                _this.formData.shareImg = await _this.getImgData(_this.formData[tit]);
            }
          }
        },
        num,
        'content',
      );
    },
    // 传入图片地址调接口，获取到微信mediaId码
    getImgData(file) {
      return new Promise((resolve, reject) => {
        liveMediaUploadlocalApi({ imagePath: file, type: 'image' }).then((res) => {
          resolve(res.mediaId);
        });
      });
    },
    // 具体日期
    onchangeTime(e) {
      this.$set(this.formData, 'timeVal', e);
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.formData.startTime = this.formData.timeVal ? this.formData.timeVal[0] : '';
          this.formData.endTime = this.formData.timeVal ? this.formData.timeVal[1] : '';
          if (this.$route.params.roomId) this.formData.id = this.$route.params.roomId;
          this.$route.params.roomId
            ? liveRoomEditApi(this.formData)
                .then((res) => {
                  this.$message.success(this.$t('product.editSuccess'));
                  this.$router.push({ path: `/marketing/broadcast/room` });
                })
                .catch(() => {
                  this.btnLoading = false;
                })
            : liveRoomCreateApi(this.formData)
                .then((res) => {
                  this.$message.success(this.$t('user.addSuccess'));
                  this.$router.push({ path: `/marketing/broadcast/room` });
                })
                .catch(() => {
                  this.btnLoading = false;
                });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    // 直播间商品列表
    getList() {
      liveRoomGoodslistApi(this.$route.params.roomId).then((res) => {
        this.tableData.data = res;
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
