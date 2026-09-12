<template>
  <div class="divBox">
    <pages-header
      ref="pageHeader"
      :title="$route.params.edit === 'edit' ? $t('coupon.editCouponTitle') : !$route.params.id ? $t('coupon.addCouponTitle') : $t('coupon.copyCouponTitle')"
      backUrl="/coupon/list"
    ></pages-header>
    <el-card class="box-card mt14" shadow="never" :bordered="false">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        class="demo-ruleForm"
        @submit.native.prevent
      >
        <el-form-item :label="$t('user.couponName')" prop="name">
          <div class="lang-name-switch from-ipt-width">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model.trim="ruleForm.name"
              class="lang-name-input"
              maxlength="20"
              :placeholder="$t('marketing.pleaseEnterCouponName')"
              :disabled="$route.params.edit ? true : false"
            ></el-input>
            <el-input
              v-else
              v-model.trim="nameJsonForm[activeLang]"
              class="lang-name-input"
              maxlength="20"
              :placeholder="$t('marketing.inputNameInLang', { lang: activeLangLabel })"
              :disabled="$route.params.edit ? true : false"
            ></el-input>
          </div>
        </el-form-item>
        <el-form-item :label="$t('coupon.couponTypeLabel')">
          <el-radio-group v-model="ruleForm.category" :disabled="$route.params.edit ? true : false">
            <el-radio :label="1">{{ $t('coupon.merchantCoupon') }}</el-radio>
            <el-radio :label="2">{{ $t('coupon.productCoupon') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('product.productLabel')" v-if="ruleForm.category === 2" prop="checked">
          <div class="acea-row">
            <template v-if="ruleForm.checked.length">
              <div class="pictrue" v-for="(item, index) in ruleForm.checked" :key="index">
                <img :src="item.image" />
                <i class="el-icon-error btndel" @click="handleRemove(index)" />
              </div>
            </template>
            <div class="upLoadPicBox" @click="changeGood">
              <div class="upLoad">
                <i class="el-icon-camera cameraIconfont" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('marketing.couponFaceValueLabel')" prop="money">
          <el-input-number
            v-model.trim="ruleForm.money"
            :min="1"
            :max="9999"
            step-strictly
            :label="$t('product.couponMoney')"
            :disabled="$route.params.edit ? true : false"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('marketing.useThresholdLabel')">
          <el-radio-group v-model="threshold" :disabled="$route.params.edit ? true : false">
            <el-radio :label="false">{{ $t('coupon.noThreshold') }}</el-radio>
            <el-radio :label="true">{{ $t('coupon.hasThreshold') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('coupon.couponMinSpendLabel')" prop="minPrice" v-if="threshold">
          <el-input-number
            v-model.trim="ruleForm.minPrice"
            :step="1"
            step-strictly
            :min="1"
            :max="999999"
            :label="$t('coupon.descriptionText')"
            :disabled="$route.params.edit ? true : false"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('marketing.useValidityLabel')">
          <el-radio-group v-model="ruleForm.isFixedTime" :disabled="$route.params.edit ? true : false">
            <el-radio :label="false">{{ $t('marketing.days') }}</el-radio>
            <el-radio :label="true">{{ $t('marketing.timePeriod') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('coupon.validDaysLabel')" prop="day" v-if="!ruleForm.isFixedTime">
          <el-input-number
            v-model.trim="ruleForm.day"
            :min="1"
            :max="999"
            step-strictly
            :label="$t('coupon.validDaysInput')"
            :disabled="$route.params.edit ? true : false"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('coupon.validPeriodLabel')" prop="resource" v-if="ruleForm.isFixedTime">
          <el-date-picker
            :disabled="$route.params.edit ? true : false"
            v-model="termTime"
            type="datetimerange"
            range-separator="-"
            value-format="yyyy-MM-dd HH:mm:ss"
            :start-placeholder="$t('product.startDate')"
            :picker-options="pickerOptions"
            :end-placeholder="$t('product.endDate')"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('coupon.timedClaimLabel')" prop="isTimeReceive">
          <el-radio-group v-model="ruleForm.isTimeReceive" :disabled="$route.params.edit ? true : false">
            <el-radio :label="true">{{ $t('coupon.limitedTime') }}</el-radio>
            <el-radio :label="false">{{ $t('marketing.noTimeLimit') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('marketing.receiveTimeLabel')" v-if="ruleForm.isTimeReceive">
          <el-date-picker
            :disabled="$route.params.edit ? true : false"
            v-model="isForeverTime"
            type="datetimerange"
            range-separator="-"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
            :start-placeholder="$t('product.startDate')"
            :end-placeholder="$t('product.endDate')"
            @blur="handleTimestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('marketing.receiveMethodLabel')" prop="receiveType">
          <el-radio-group v-model="ruleForm.receiveType" :disabled="$route.params.edit ? true : false">
            <el-radio :label="1">{{ $t('common.couponManual') }}</el-radio>
            <el-radio :label="2">{{ $t('coupon.productPurchaseGiftCoupon') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('coupon.quantityLimitedLabel')" prop="isLimited">
          <el-radio-group v-model="ruleForm.isLimited" :disabled="$route.params.edit ? true : false">
            <el-radio :label="true">{{ $t('marketing.limited') }}</el-radio>
            <el-radio :label="false">{{ $t('product.unlimited') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('marketing.publishCountLabel')" prop="total" v-if="ruleForm.isLimited">
          <el-input-number
            v-model.trim="ruleForm.total"
            :min="1"
            :max="9999"
            step-strictly
            :disabled="$route.params.edit ? true : false"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('product.sortLabel')" prop="sort">
          <el-input-number
            v-model.trim="ruleForm.sort"
            :min="1"
            :max="9999"
            step-strictly
            :label="$t('product.sort')"
            :disabled="$route.params.edit ? true : false"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('user.statusColon')" prop="status">
          <el-radio-group v-model="ruleForm.status" :disabled="$route.params.edit ? true : false">
            <el-radio :label="true">{{ $t('common.open') }}</el-radio>
            <el-radio :label="false">{{ $t('common.close') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button
            size="mini"
            type="primary"
            @click="submitForm('ruleForm')"
            :loading="loading"
            v-hasPermi="['merchant:coupon:save', 'merchant:coupon:product:join:edit']"
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

import { couponSaveApi, couponInfoApi, couponProductEditApi } from '@/api/product';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { Debounce } from '@/utils/validate';
import { checkPermi } from '@/utils/permission';
import {
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
  pickFormName,
} from '@/utils/localizedName';
export default {
  name: 'creatCoupon',
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          // return time.getTime() < new Date().setTime(new Date().getTime() - 3600 * 1000 * 24); //不限制未来时间
          return time.getTime() < Date.now() - 8.64e7 || time.getTime() > Date.now() + 600 * 8.64e7; //限制未来时间
        },
      },
      loading: false,
      threshold: false,
      termTime: [],
      props2: {
        children: 'child',
        label: 'name',
        value: 'id',
        checkStrictly: true,
        emitPath: false,
      },
      couponType: 0,
      term: 'termday',
      ruleForm: {
        category: 1,
        isFixedTime: false,
        name: '',
        nameJson: '',
        money: 1,
        minPrice: 1,
        day: null,
        isTimeReceive: false,
        productIds: '',
        receiveType: 2,
        isLimited: false,
        useStartTime: '', // 使用
        useEndTime: '', // 结束
        receiveStartTime: '', //领取
        receiveEndTime: '',
        sort: 0,
        total: 1,
        status: false,
        checked: [],
      },
      isForeverTime: [],
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      tempRoute: {},
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    rules() {
      return {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('marketing.pleaseEnterCouponName')));
          },
          trigger: 'blur',
        }],
        day: [{ required: true, message: this.$t('coupon.pleaseEnterValidDays'), trigger: 'blur' }],
        money: [{ required: true, message: this.$t('marketing.pleaseEnterCouponFace'), trigger: 'blur' }],
        productIds: [{ required: true, message: this.$t('coupon.pleaseSelectCategory'), trigger: 'change' }],
        checked: [{ required: true, message: this.$t('product.listPleaseSelectAtLeastOne'), trigger: 'change', type: 'array' }],
        isForeverTime: [{ required: true, message: this.$t('coupon.pleaseSelectClaimTime'), trigger: 'change', type: 'array' }],
        total: [{ required: true, message: this.$t('coupon.pleaseEnterPublishCount'), trigger: 'blur' }],
        minPrice: [{ required: true, message: this.$t('coupon.pleaseEnterMinimumSpend'), trigger: 'blur' }],
      };
    },
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route);
    this.getLanguageList();
  },
  mounted() {
    if (this.$route.params.id) {
      this.setTagsViewTitle();
      this.getInfo();
    }
  },
  methods: {
    emptyNameJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseNameJson(nameJson) {
      const form = this.emptyNameJsonForm();
      if (!nameJson) return form;
      try {
        const obj = typeof nameJson === 'string' ? JSON.parse(nameJson) : nameJson;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // ignore
      }
      return form;
    },
    buildNameJson() {
      return buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, pickFormName(this));
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
          this.nameJsonForm = this.parseNameJson(this.ruleForm && this.ruleForm.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.ruleForm && this.ruleForm.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    setTagsViewTitle() {
      const title =
        this.$route.params.edit === 'edit' ? this.$t('coupon.editCouponTitle') : !this.$route.params.id ? this.$t('coupon.addCouponTitle') : this.$t('coupon.copyCouponTitle');
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.$route.params.id}` });
      this.$store.dispatch('tagsView/updateVisitedView', route);
    },
    handleTimestamp() {},
    getInfo() {
      this.loading = true;
      couponInfoApi(this.$route.params.id)
        .then((res) => {
          const info = res;
          this.ruleForm = {
            category: info.category,
            isFixedTime: info.isFixedTime,
            isTimeReceive: info.receiveEndTime ? true : false, //复制优惠券如果没有限制结束时间
            name: info.name,
            nameJson: info.nameJson || '',
            money: info.money,
            minPrice: info.minPrice,
            day: info.day,
            receiveType: info.receiveType,
            isLimited: info.isLimited,
            sort: info.sort,
            total: info.total,
            status: info.status,
            productIds: Number(info.productIds),
            checked: res.productList || [],
          };
          this.nameJsonForm = this.parseNameJson(info.nameJson);
          this.activeLang = resolveFormActiveLang(this);
          info.minPrice == 0 ? (this.threshold = false) : (this.threshold = true);
          info.isTimeReceive
            ? (this.isForeverTime = [info.receiveStartTime, info.receiveEndTime])
            : (this.isForeverTime = []);
          info.isFixedTime && info.useStartTime && info.useEndTime
            ? (this.termTime = [info.useStartTime, info.useEndTime])
            : (this.termTime = []);
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    handleRemove(i) {
      this.ruleForm.checked.splice(i, 1);
    },
    changeGood() {
      const _this = this;
      this.$modalGoodList(
        function (row) {
          _this.ruleForm.checked = row;
        },
        'many',
        _this.ruleForm.checked,
      );
    },
    save(formName) {
      if ((this.ruleForm.isFixedTime && !this.termTime) || (this.ruleForm.isFixedTime && !this.termTime.length))
        return this.$message.warning(this.$t('coupon.pleaseSelectValidity'));
      if (
        (this.ruleForm.isTimeReceive && !this.isForeverTime) ||
        (this.ruleForm.isTimeReceive && !this.isForeverTime.length)
      )
        return this.$message.warning(this.$t('coupon.pleaseSelectClaimTimeDuplicate'));
      if (!this.threshold) this.ruleForm.minPrice = 0;
      if (!this.ruleForm.isLimited) this.ruleForm.total = 0;
      this.ruleForm.isFixedTime && this.termTime.length
        ? ((this.ruleForm.useStartTime = this.termTime[0]), (this.ruleForm.day = null))
        : (this.ruleForm.useStartTime = '');
      this.ruleForm.isFixedTime && this.termTime.length
        ? ((this.ruleForm.useEndTime = this.termTime[1]), (this.ruleForm.day = null))
        : (this.ruleForm.useEndTime = '');
      this.ruleForm.isTimeReceive && this.isForeverTime.length
        ? (this.ruleForm.receiveStartTime = this.isForeverTime[0])
        : (this.ruleForm.receiveStartTime = '');
      this.ruleForm.isTimeReceive && this.isForeverTime.length
        ? (this.ruleForm.receiveEndTime = this.isForeverTime[1])
        : (this.ruleForm.receiveEndTime = '');
      this.ruleForm.nameJson = this.buildNameJson();
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          couponSaveApi(this.ruleForm)
            .then(() => {
              this.$message.success(this.$t('product.addSuccess'));
              this.loading = false;
              setTimeout(() => {
                this.$router.push({ path: `/coupon/list` });
              }, 200);
              this.closeSelectedTag();
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          this.loading = false;
          return false;
        }
      });
    },
    submitForm: Debounce(function (formName) {
      if (this.ruleForm.category === 2)
        this.ruleForm.productIds = this.ruleForm.checked
          .map((item) => {
            return item.id;
          })
          .join(',');
      if (this.ruleForm.category === 1) this.ruleForm.productIds = '';
      if (!this.$route.params.edit) {
        this.save(formName);
      } else {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            couponProductEditApi({
              id: this.$route.params.id,
              productIds: this.ruleForm.productIds,
            })
              .then(() => {
                this.$message.success(this.$t('product.editSuccess'));
                this.loading = false;
                setTimeout(() => {
                  this.$router.push({ path: `/coupon/list` });
                }, 200);
                this.closeSelectedTag();
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            this.loading = false;
            return false;
          }
        });
      }
    }),
    closeSelectedTag() {
      let that = this;
      that.$store.dispatch('tagsView/delView', that.$route).then(({ visitedViews }) => {
        if (that.isActive(that.$route)) {
          that.toLastView(visitedViews, that.$route);
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
.pictrue {
  width: 60px;
  height: 60px;
  border: 1px dotted rgba(0, 0, 0, 0.1);
  margin-right: 10px;
  position: relative;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
  }
}
.btndel {
  position: absolute;
  z-index: 1;
  width: 20px !important;
  height: 20px !important;
  left: 46px;
  top: -4px;
}
.lang-name-switch {
  width: 100%;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.lang-name-input {
  margin-top: 10px;
}
</style>
