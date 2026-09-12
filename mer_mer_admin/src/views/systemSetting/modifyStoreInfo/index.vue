<template>
  <div class="divBox relative">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '0 20px 20px' }">
      <el-tabs v-model="loginType" class="list-tabs">
        <el-tab-pane :label="item.name" :name="item.type.toString()" v-for="(item, index) in headerTabs" :key="index" />
      </el-tabs>
      <div v-if="loginType === '1'" class="information">
        <div class="merchant-info-table" v-loading="loading">
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantNameLabel') }}</div>
            <div class="merchant-info-value">{{ displayMerchantName }}</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantLoginAccountLabel') }}</div>
            <div class="merchant-info-value">{{ merData.phone }}</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantManagerNameLabel') }}</div>
            <div class="merchant-info-value">{{ merData.realName }}</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantCategoryLabel') }}</div>
            <div class="merchant-info-value">{{ displayMerCategory }}</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantTypeLabel') }}</div>
            <div class="merchant-info-value">{{ merData.isSelf | selfTypeFilter }}</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.storeTypeLabel') }}</div>
            <div class="merchant-info-value">{{ displayMerType }}</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantFeeLabel') }}</div>
            <div class="merchant-info-value">{{ merData.handlingFee }}%</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.addProductLabel') }}</div>
            <div class="merchant-info-value">{{ merData.productSwitch ? $t('systemSetting.platformReviewRequired') : $t('systemSetting.platformReviewExempt') }}</div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantRatingLabel') }}</div>
            <div class="merchant-info-value"><el-rate v-model="merData.starLevel" disabled text-color="#ff9900"></el-rate></div>
          </div>
          <div class="merchant-info-row">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantJoinTimeLabel') }}</div>
            <div class="merchant-info-value">{{ merData.createTime }}</div>
          </div>
          <div class="merchant-info-row" v-if="merData.qualificationPicture">
            <div class="merchant-info-label">{{ $t('systemSetting.merchantQualificationLabel') }}</div>
            <div class="merchant-info-value acea-row">
              <div v-for="(item, index) in JSON.parse(merData.qualificationPicture)" :key="index" class="pictrue">
                <el-image :src="item" :preview-src-list="[item]" fit="cover"> </el-image>
              </div>
            </div>
          </div>
          <div class="merchant-info-row" v-hasPermi="['merchant:switch:update']">
            <div class="merchant-info-label">{{ $t('systemSetting.enableMerchantLabel') }}</div>
            <div class="merchant-info-value">
              <el-switch
                v-model="merData.isSwitch"
                :active-value="true"
                :inactive-value="false"
                :active-text="$t('common.open')"
                :inactive-text="$t('common.close')"
                @change="changeSwitch"
              >
              </el-switch>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loginType === '2'" class="business-msg">
        <div class="form-data">
          <el-form :model="merInfoForm" :rules="rules" ref="merInfoForm" label-width="200px" class="demo-ruleForm">
            <el-form-item :label="$t('systemSetting.merchantAvatarLabel')" prop="avatar">
              <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'avatar')">
                <div v-if="merInfoForm.avatar" class="pictrue"><img :src="merInfoForm.avatar" /></div>
                <div v-else class="upLoad">
                  <i class="el-icon-camera cameraIconfont" />
                </div>
                <div class="from-tips">{{ $t('systemSetting.uploadImageUnder500kb90') }}</div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.h5MerchantBackgroundLabel')" prop="backImage">
              <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'backImage')">
                <div v-if="merInfoForm.backImage" class="pictrue"><img :src="merInfoForm.backImage" /></div>
                <div v-else class="upLoad">
                  <i class="el-icon-camera cameraIconfont" />
                </div>
                <div class="from-tips">{{ $t('systemSetting.uploadImageUnder500kb375') }}</div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.h5MerchantStreetBackgroundLabel')" prop="streetBackImage">
              <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'streetBackImage')">
                <div v-if="merInfoForm.streetBackImage" class="pictrue">
                  <img :src="merInfoForm.streetBackImage" />
                </div>
                <div v-else class="upLoad">
                  <i class="el-icon-camera cameraIconfont" />
                </div>
                <div class="from-tips">{{ $t('systemSetting.uploadImageUnder500kb355') }}</div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.h5MerchantCoverLabel')" prop="coverImage">
              <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'coverImage')">
                <div v-if="merInfoForm.coverImage" class="pictrue">
                  <img :src="merInfoForm.coverImage" />
                </div>
                <div v-else class="upLoad">
                  <i class="el-icon-camera cameraIconfont" />
                </div>
                <div class="from-tips">{{ $t('systemSetting.uploadImageUnder500kb350') }}</div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.h5MerchantHorizontalLogoLabel')" prop="rectangleLogo">
              <div class="upLoadPicBox acea-row" @click="modalPicTap('1', 'rectangleLogo')">
                <div v-if="merInfoForm.rectangleLogo" class="pictrue">
                  <img :src="merInfoForm.rectangleLogo" />
                </div>
                <div v-else class="upLoad">
                  <i class="el-icon-camera cameraIconfont" />
                </div>
                <div class="from-tips">{{ $t('systemSetting.uploadImageUnder500kb300') }}</div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.merchantIntroLabel')" prop="intro" :rules="merchantIntroRules">
              <div class="lang-name-switch width100">
                <el-radio-group v-model="activeLang" size="small">
                  <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                    {{ lang.label }}
                  </el-radio-button>
                </el-radio-group>
                <el-input
                  v-if="activeLang === defaultLangCode"
                  type="textarea"
                  v-model.trim="merInfoForm.intro"
                  maxlength="200"
                  :rows="3"
                  show-word-limit
                  :placeholder="$t('systemSetting.pleaseEnterMerchantIntro')"
                  class="lang-name-input"
                />
                <el-input
                  v-else
                  type="textarea"
                  v-model.trim="introJsonForm[activeLang]"
                  maxlength="200"
                  :rows="3"
                  show-word-limit
                  :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
                  class="lang-name-input"
                />
              </div>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.merchantKeywordsLabel')" prop="labelarr">
              <keyword @getLabelarr="getLabelarr" :labelarr="labelarr" class="width100"></keyword>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.customerServiceTypeLabel')" prop="serviceType">
              <el-select v-model="merInfoForm.serviceType" :placeholder="$t('common.pleaseSelect')" class="width100">
                <el-option v-for="item in serviceList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="merInfoForm.serviceType === 'H5'" :label="$t('systemSetting.h5LinkLabel')" prop="serviceLink">
              <el-input v-model.trim="merInfoForm.serviceLink" class="width100"></el-input>
            </el-form-item>
            <el-form-item v-if="merInfoForm.serviceType === 'phone'" :label="$t('systemSetting.phoneLabel')" prop="servicePhone">
              <el-input v-model.trim="merInfoForm.servicePhone" class="width100"></el-input>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.alertStockLabel')" prop="alertStock">
              <el-input-number
                v-model.trim="merInfoForm.alertStock"
                :min="1"
                :max="9999"
                :label="$t('systemSetting.alertStock')"
              ></el-input-number>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.pickupSwitchLabel')" prop="alertStock">
              <el-switch
                v-model="merInfoForm.isTakeTheir"
                :active-value="true"
                :inactive-value="false"
                :active-text="$t('common.open')"
                :inactive-text="$t('common.close')"
              >
              </el-switch>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.receiptPrintingSwitchLabel')" prop="receiptPrintingSwitch">
              <el-radio-group v-model="merInfoForm.receiptPrintingSwitch">
                <!--                  小票打印开关：0关闭，1=手动打印，2=自动打印，3=自动和手动-->
                <el-radio :label="0">{{ $t('common.close') }}</el-radio>
                <el-radio :label="1">{{ $t('systemSetting.manualPrint') }}</el-radio>
                <el-radio :label="2">{{ $t('systemSetting.autoPrint') }}</el-radio>
                <el-radio :label="3">{{ $t('systemSetting.autoAndManualPrint') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.electronicWaybillSwitchLabel')" prop="electrPrintingSwitch">
              <el-radio-group v-model="merInfoForm.electrPrintingSwitch">
                <el-radio :label="0">{{ $t('common.close') }}</el-radio>
                <el-radio :label="1">{{ $t('common.open') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('systemSetting.merchantAddressLabel')" prop="addressDetail">
              <el-input
                class="width100"
                v-model="merInfoForm.addressDetail"
                :enter-button="$t('systemSetting.findLocation')"
                :placeholder="$t('systemSetting.pleaseFindLocation')"
                readonly
              >
                <!--<el-button-->
                <!--slot="append"-->
                <!--style="background: #46a6ff; color: #fff; border-radius: 0 4px 4px 0;"-->
                <!--@click="onSearchs"-->
                <!--&gt;查找位置</el-button>-->
              </el-input>
              <iframe id="mapPage" width="100%" height="500px" frameborder="0" :src="keyUrl" />
            </el-form-item>
            <el-form-item v-if="checkPermi(['merchant:config:info:edit'])">
              <el-button type="primary" @click="handlerSubmit('merInfoForm')">{{ $t('common.confirm') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div v-if="loginType === '3'" class="business-msg">
        <div class="form-data">
          <el-form ref="settlementForm" :model="settlementForm" label-width="160px">
            <el-form-item :label="$t('systemSetting.settlementTypeLabel')" label-width="160px">
              <el-radio-group v-model="settlementForm.settlementType">
                <el-radio label="bank">{{ $t('systemSetting.bankCard') }}</el-radio>
                <el-radio label="wechat">{{ $t('systemSetting.wechat') }}</el-radio>
                <el-radio label="alipay">{{ $t('systemSetting.alipay') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <z-b-parser
            v-if="loginType === '3'"
            :is-create="1"
            :form-conf="formConf"
            :edit-data="transferData"
            :form-name="formId"
            @submit="transferhandlerSubmit"
            :key-num="keyNum"
          />
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
import {
  merchantSwitchApi,
  merchantTransferEditApi,
  getBaseInfoApi,
  merchantUpdateApi,
  merchantConfigInfoApi,
  merchantTransferApi,
} from '@/api/merchant';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { Debounce } from '@/utils/validate';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  getLocalizedName,
  getLocalizedText,
  getUiLocale,
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
  pickI18nSubmitName,
} from '@/utils/localizedName';
import Cookies from 'js-cookie';
export default {
  name: 'Information',
  data() {
    var checkPhone = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('systemSetting.pleaseEnterCustomerServicePhone')));
      } else {
        let regPone = null;
        const mobile = /^1(3|4|5|6|7|8|9)\d{9}$/; // 最新16手机正则
        const tel = /^(0[0-9]{2,3}\-)([2-9][0-9]{4,7})+(\-[0-9]{1,4})?$/; // 座机
        if (value.charAt(0) == 0) {
          // charAt查找第一个字符方法，用来判断输入的是座机还是手机号
          regPone = tel;
        } else {
          regPone = mobile;
        }
        if (!regPone.test(value)) {
          return callback(new Error(this.$t('systemSetting.customerServicePhoneFormat')));
        }
        callback();
      }
    };
    const validateVal = (rule, value, callback) => {
      if (this.labelarr.length === 0) {
        callback(new Error(this.$t('common.inputThenEnter')));
      } else {
        callback();
      }
    };
    return {
      formConf: { fields: [] },
      isCreate: 0,
      loginType: '1',
      merData: {}, // 默认数据
      submitLoading: false, // 提交loading
      editData: {},
      transferData: {},
      keyNum: 0,
      loading: false,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      introJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      merInfoForm: {
        avatar: '',
        backImage: '',
        streetBackImage: '',
        rectangleLogo: '',
        coverImage: '',
        intro: '',
        keywords: '',
        alertStock: 1,
        addressDetail: '',
        serviceType: '',
        serviceLink: null,
        servicePhone: '',
        latitude: '', //纬度
        longitude: '', //经度
        isTakeTheir: false,
        receiptPrintingSwitch: 0, // 小票打印开关：0关闭，1=自动打印，2=手动打印，3=自动和手动
        electrPrintingSwitch: 0, // 电子面单开关 0关闭 1开启
        txMapKey: '',
      },
      rules: {
        avatar: [{ required: true, message: this.$t('systemSetting.pleaseUploadMerchantAvatar'), trigger: 'change' }],
        backImage: [{ required: true, message: this.$t('systemSetting.pleaseUploadH5MerchantBackground'), trigger: 'change' }],
        streetBackImage: [{ required: true, message: this.$t('systemSetting.pleaseUploadH5MerchantStreetBackground'), trigger: 'change' }],
        coverImage: [{ required: true, message: this.$t('systemSetting.pleaseUploadMerchantCover'), trigger: 'change' }],
        rectangleLogo: [{ required: true, message: this.$t('systemSetting.pleaseUploadHorizontalLogo'), trigger: 'change' }],
        labelarr: [{ required: true, validator: validateVal, trigger: 'blur' }],
        alertStock: [{ required: true, message: this.$t('systemSetting.pleaseEnterAlertStock'), trigger: 'blur' }],
        serviceType: [{ required: true, message: this.$t('systemSetting.pleaseSelectCustomerServiceType'), trigger: 'change' }],
        serviceLink: [{ required: true, message: this.$t('systemSetting.pleaseEnterH5Link'), trigger: 'blur' }],
        servicePhone: [{ required: true, validator: checkPhone, trigger: 'blur' }],
        addressDetail: [{ required: true, message: this.$t('systemSetting.pleaseSelectMerchantAddress'), trigger: 'blur' }],
      },
      keyUrl: '',
      labelarr: [],
      serviceList: [
        {
          value: 'H5',
          label: this.$t('systemSetting.h5Link'),
        },
        {
          value: 'phone',
          label: this.$t('systemSetting.phone'),
        },
      ],
      settlementForm: {
        settlementType: 'bank',
      },
      formId: '结算信息-银行卡',
    };
  },
  computed: {
    headerTabs() {
      return [
        { type: '1', name: this.$t('systemSetting.merchantInfo') },
        { type: '2', name: this.$t('systemSetting.storeInfo') },
        { type: '3', name: this.$t('systemSetting.settlementInfo') },
      ];
    },
    displayMerchantName() {
      this.$i18n.locale;
      return getLocalizedName(this.merData, getUiLocale(this));
    },
    displayMerCategory() {
      this.$i18n.locale;
      return getLocalizedText(this.merData.merCategory, this.merData.merCategoryJson, getUiLocale(this));
    },
    displayMerType() {
      this.$i18n.locale;
      return getLocalizedText(this.merData.merType, this.merData.merTypeJson, getUiLocale(this));
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    merchantIntroRules() {
      this.$i18n.locale;
      return [
        {
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(this.merInfoForm.intro, this.introJsonForm)) callback();
            else callback(new Error(this.$t('systemSetting.pleaseEnterMerchantIntro')));
          },
          trigger: ['blur', 'change'],
        },
      ];
    },
  },
  watch: {
    '$i18n.locale'() {
      this.activeLang = resolveFormActiveLang(this);
    },
    'settlementForm.settlementType': {
      handler: function (val) {
        switch (val) {
          case 'bank':
            this.formId = '结算信息-银行卡';
            break;
          case 'wechat':
            this.formId = '结算信息-微信';
            break;
          default:
            this.formId = '结算信息-支付宝';
            break;
        }
        this.keyNum += 1;
      },
      immediate: false,
      deep: true,
    },
  },
  created() {
    if (checkPermi(['merchant:config:info'])) this.getConfigInfo();
    if (checkPermi(['merchant:settlement:info'])) this.getMerchantTransfer();
    if (checkPermi(['merchant:base:info'])) this.getInfo();
    this.getLanguageList();
  },
  mounted: function () {
    let that = this;
    window.addEventListener(
      'message',
      function (event) {
        // 接收位置信息，用户选择确认位置点后选点组件会触发该事件，回传用户的位置信息
        var loc = event.data;
        if (loc && loc.module === 'locationPicker') {
          // 防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
          window.parent.selectAdderss(loc);
        }
      },
      false,
    );
    window.selectAdderss = this.selectAdderss;
  },
  methods: {
    checkPermi,
    getLabelarr(attr) {
      this.labelarr = attr;
    },
    // 点击商品图
    modalPicTap(tit, val) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          switch (val) {
            case 'avatar':
              _this.merInfoForm.avatar = img[0].sattDir;
              break;
            case 'backImage':
              _this.merInfoForm.backImage = img[0].sattDir;
              break;
            case 'rectangleLogo':
              _this.merInfoForm.rectangleLogo = img[0].sattDir;
              break;
            case 'coverImage':
              _this.merInfoForm.coverImage = img[0].sattDir;
              break;
            default:
              _this.merInfoForm.streetBackImage = img[0].sattDir;
              break;
          }
        },
        tit,
        'content',
      );
    },
    // 选择经纬度
    selectAdderss(data) {
      this.merInfoForm.addressDetail = data.poiaddress + data.poiname;
      this.merInfoForm.latitude = data.latlng.lat;
      this.merInfoForm.longitude = data.latlng.lng;
    },
    changeSwitch() {
      const changeSwitch = this.merData.isSwitch ? this.$t('common.open') : this.$t('common.close');
      this.$modalSure(this.$t('systemSetting.changeMerchantStatusConfirm', { action: changeSwitch }))
        .then(() => {
          merchantSwitchApi()
            .then((res) => {
              this.$modal.msgSuccess(this.$t('user.modifySuccess'));
            })
            .catch(() => {
              this.merData.isSwitch = !this.merData.isSwitch;
            });
        })
        .catch(() => {
          this.merData.isSwitch = !this.merData.isSwitch;
        });
    },
    handlerSubmit: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.merInfoForm.keywords = this.labelarr.join(',');
          const payload = {
            ...this.merInfoForm,
            intro: pickI18nSubmitName(this.merInfoForm.intro, this.introJsonForm),
            introJson: this.buildIntroJson(),
          };
          merchantUpdateApi(payload).then((res) => {
            this.$message.success(this.$t('user.operationSuccess'));
            Cookies.set('merPrint', this.merInfoForm.receiptPrintingSwitch); // 打印机标识
            Cookies.set('merElectPrint', this.merInfoForm.electrPrintingSwitch); // 电子面单打印开关
            this.getConfigInfo();
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }),
    transferhandlerSubmit: Debounce(function (formValue) {
      if (checkPermi(['merchant:settlement:info:edit'])) {
        merchantTransferEditApi({
          id: this.formId,
          settlementType: this.settlementForm.settlementType,
          alipayCode: formValue.alipayCode,
          alipayQrcodeUrl: formValue.alipayQrcodeUrl,
          bankAddress: formValue.bankAddress,
          bankCard: formValue.bankCard,
          bankName: formValue.bankName,
          bankUserName: formValue.bankUserName,
          wechatCode: formValue.wechatCode,
          wechatQrcodeUrl: formValue.wechatQrcodeUrl,
          realName: formValue.realName,
        }).then((res) => {
          this.$message.success(this.$t('user.operationSuccess'));
          this.getMerchantTransfer();
        });
      } else {
        this.$message.warning(this.$t('user.noPermission'));
      }
    }),
    // 获取商户信息
    getInfo() {
      this.loading = true;
      getBaseInfoApi()
        .then((res) => {
          this.merData = res;
          localStorage.setItem('JavaMerchantBaseInfo', JSON.stringify(res));
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 获取商户配置信息
    getConfigInfo() {
      merchantConfigInfoApi().then((res) => {
        this.merInfoForm = res;
        this.keyUrl = `https://apis.map.qq.com/tools/locpicker?type=1&key=${this.merInfoForm.txMapKey}&referer=myapp`;
        localStorage.setItem('JavaMerchantConfigInfo', JSON.stringify(res));
        this.labelarr = (res.keywords && res.keywords.split(',')) || [];
        this.introJsonForm = this.parseIntroJson(res.introJson);
        this.activeLang = resolveFormActiveLang(this);
      });
    },
    emptyIntroJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseIntroJson(introJson) {
      const form = this.emptyIntroJsonForm();
      if (!introJson) return form;
      try {
        const obj = typeof introJson === 'string' ? JSON.parse(introJson) : introJson;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // ignore
      }
      return form;
    },
    buildIntroJson() {
      return buildI18nNameJson(this.langOptions, this.introJsonForm, this.defaultLangCode, this.merInfoForm.intro);
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
          this.introJsonForm = this.parseIntroJson(this.merInfoForm && this.merInfoForm.introJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.introJsonForm = this.parseIntroJson(this.merInfoForm && this.merInfoForm.introJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    // 获取转账信息
    getMerchantTransfer() {
      merchantTransferApi().then((res) => {
        this.transferData = res;
        this.settlementForm = res;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
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

.width100 {
  width: 700px;
}

.pictrue {
  width: 60px;
  height: 60px;
  border: 1px dotted rgba(0, 0, 0, 0.1);
  margin-right: 10px;
  position: relative;
  cursor: pointer;

  ::v-deep.el-image {
    width: 60px;
    height: 60px;
  }

  video {
    width: 100%;
    height: 100%;
  }
}

::v-deep.el-textarea__inner {
  height: 90px;
}

.information {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 25px 0 0 20px;

  h2 {
    text-align: center;
    color: #303133;
    font-weight: bold;
    font-size: 20px;
  }

  .lab-title {
    width: max-content;
    font-size: 14px;
    font-weight: bold;
    color: #303133;
    margin: 10px 10%;

    &::before {
      content: '';
      display: inline-block;
      width: 3px;
      height: 13px;
      background-color: var(--prev-color-primary);
      margin-right: 6px;
      position: relative;
      top: 1px;
    }
  }

  .user-msg {
    padding: 0 20px;
    margin-top: 30px;
  }

  .merchant-info-table {
    display: table;
    width: max-content;
    max-width: 100%;
    align-self: flex-start;
    border-collapse: separate;
    border-spacing: 0 14px;
    font-size: 13px;
    color: #303133;
  }

  .merchant-info-row {
    display: table-row;
  }

  .merchant-info-label {
    display: table-cell;
    padding-right: 20px;
    text-align: right;
    vertical-align: top;
    white-space: nowrap;
    color: #606266;
    line-height: 22px;
  }

  .merchant-info-value {
    display: table-cell;
    vertical-align: top;
    line-height: 22px;
    word-break: break-all;
  }

  .trip {
    padding-left: 10px;
    color: #ffb027;
    font-weight: normal;
  }

  .selWidth {
    width: 100%;
  }

  .demo-ruleForm {
    overflow: hidden;

    .form-item {
      width: 48%;
      display: inline-block;
    }
  }

  .form-data {
    padding: 30px 8%;

    .map-sty {
      width: 90%;
      text-align: right;
      margin: 0 0 0 10%;
    }

    .pictrue img {
      border-radius: 4px;
      object-fit: cover;
    }

    .tip-form {
      display: flex;
      align-items: center;

      span {
        white-space: nowrap;
        padding-left: 10px;
        line-height: 20px;
      }
    }
  }

  .submit-button {
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 20px;
    // left: 50%;
    width: 80%;
    padding: 10px 0;
    background-color: rgba(255, 255, 255, 0.7);
  }
}

.font_red {
  color: red;
  margin-right: 5px;
  font-weight: bold;
}

.margin_main {
  position: relative;

  .margin_price {
    cursor: pointer;
  }

  &:hover {
    .margin_modal {
      display: flex;
    }
  }

  .margin_modal {
    position: absolute;
    left: 0;
    top: 30px;
    border-radius: 8px;
    background: #fff;
    align-items: center;
    justify-content: center;
    z-index: 9;
    width: 250px;
    height: 320px;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    display: none;

    .alic {
      text-align: center;
    }

    img {
      display: block;
      width: 150px;
      height: 116px;
      margin: 0 auto 50px;
    }

    span {
      margin-bottom: 10px;
      display: block;
      font-weight: normal;
      text-align: center;
    }

    .text_g {
      font-size: 16px;
      color: #303133;
    }

    .text_b {
      color: #606266;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 14px;

      &.b02 {
        color: #ef9b6f;
      }

      &.b01 {
        color: #57d1a0;
      }
    }

    .el-button {
      margin-top: 25px;
    }
  }

  .margin_refused {
    display: block;
    margin-bottom: 10px;
    text-align: center;
    color: #606266;

    span {
      display: inline;
      // color: red;
    }
  }
}

.margin_count {
  position: relative;
  display: inline-block;

  .pay_btn:hover + .erweima {
    display: block;
  }

  .erweima {
    position: absolute;
    left: 0;
    top: 30px;
    z-index: 9;
    display: none;
    width: 250px;
    height: 320px;
    text-align: center;
    background: #fff;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

    img {
      width: 160px;
      height: 160px;
      margin-top: 20px;
    }

    .pay_type {
      font-size: 16px;
      color: #303133;
      font-weight: normal;
    }

    .pay_price {
      font-size: 18px;
      color: #e57272;
      margin: 10px 0;
    }

    .pay_title {
      font-size: 16px;
      color: #303133;
      margin-top: 20px;
    }

    .pay_time {
      font-size: 12px;
      color: #6d7278;
    }
  }
}

::v-deep .el-upload--picture-card {
  width: 58px;
  height: 58px;
  line-height: 70px;
}

::v-deep.el-upload-list__item {
  width: 58px;
  height: 58px;
}

.upLoadPicBox_qualification {
  display: flex;
  flex-wrap: wrap;

  .uploadpicBox_list {
    position: relative;
    height: 58px;
    width: 58px;
    margin: 0 20px 20px 0;

    .uploadpicBox_list_image {
      position: absolute;
      top: 0;
      left: 0;
      width: 58px;
      height: 58px;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .uploadpicBox_list_method {
      position: absolute;
      top: 0;
      left: 0;
      font-size: 18px;
      font-weight: bold;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 4px;
      opacity: 0;
      width: 100%;
      height: 100%;
      transition: 0.3s;
    }
  }
}

.uploadpicBox_list:hover .uploadpicBox_list_method {
  z-index: 11;
  opacity: 1;
}
</style>
