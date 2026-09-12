<template>
  <div class="divBox">
    <div class="container_box">
      <pages-header
        ref="pageHeader"
        :title="isEdit && !isCopy ? $t('marketing.editCoupon') : !isCopy ? $t('marketing.addCouponWord') : $t('marketing.copyCoupon')"
        backUrl="/marketing/PlatformCoupon/list"
      ></pages-header>
      <el-card class="mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
        <el-tabs v-if="tabList.length > 0" v-model="currentTab" class="list-tabs mb25">
          <el-tab-pane v-for="(item, index) in tabList" :key="index" :name="item.value" :label="item.title" />
        </el-tabs>
        <el-form
          ref="formValidate"
          v-loading="loading"
          class="formValidate"
          :rules="ruleValidate"
          :model="formValidate"
          label-width="150px"
          @submit.native.prevent
        >
          <div v-show="currentTab === '1'">
            <el-form-item :label="$t('marketing.couponNameLabel')" prop="name">
              <div class="lang-name-switch from-ipt-width">
                <el-radio-group v-model="activeLang" size="small">
                  <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                    {{ lang.label }}
                  </el-radio-button>
                </el-radio-group>
                <el-input
                  v-if="activeLang === defaultLangCode"
                  v-model.trim="formValidate.name"
                  size="small"
                  class="lang-name-input"
                  :placeholder="$t('user.pleaseEnterCouponName')"
                  maxlength="20"
                />
                <el-input
                  v-else
                  v-model.trim="nameJsonForm[activeLang]"
                  size="small"
                  class="lang-name-input"
                  :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
                  maxlength="20"
                />
              </div>
            </el-form-item>
            <el-form-item :label="$t('marketing.couponValueYuanLabel')" prop="money">
              <el-input-number
                type="number"
                v-model="formValidate.money"
                size="small"
                :disabled="isEdit && !isCopy"
                :max="9999"
                :min="1"
                :step="1"
                step-strictly
                :placeholder="$t('marketing.pleaseEnterCouponFace')"
                controls-position="right"
              >
                <span slot="suffix" class="suffix_text">{{ $t('dashboard.yuan') }}</span>
              </el-input-number>
            </el-form-item>
            <el-form-item :label="$t('marketing.useThresholdYuanLabel')" prop="minPrice">
              <el-input-number
                v-model="formValidate.minPrice"
                size="small"
                :disabled="isEdit && !isCopy"
                :max="999999"
                :min="0"
                :step="1"
                step-strictly
                :placeholder="$t('marketing.pleaseEnterUseThreshold')"
                controls-position="right"
              >
                <span slot="suffix" class="suffix_text">{{ $t('dashboard.yuan') }}</span>
              </el-input-number>
              <p class="desc mt10">{{ $t('marketing.fillCouponMinAmountTip') }}</p>
            </el-form-item>
            <el-form-item :label="$t('marketing.receiveMethodLabel')" prop="receiveType">
              <el-radio-group v-model="formValidate.receiveType" :disabled="isEdit && !isCopy">
                <el-radio :label="1">{{ $t('marketing.userReceive') }}</el-radio>
                <el-radio :label="3">{{ $t('marketing.platformActivityUse') }}</el-radio>
              </el-radio-group>
              <p class="desc mt10">
                {{ $t('marketing.manualReceiveTip') }}<br />
                {{ $t('marketing.platformActivityTip') }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('marketing.receiveTimeLabel')" prop="isTimeReceive" v-if="formValidate.receiveType === 1">
              <el-radio-group v-model="formValidate.isTimeReceive" :disabled="isEdit && !isCopy">
                <el-radio :label="true">{{ $t('marketing.timePeriod') }}</el-radio>
                <el-radio :label="false">{{ $t('marketing.noTimeLimit') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formValidate.isTimeReceive && formValidate.receiveType === 1" prop="collectionTime">
              <el-date-picker
                v-model="formValidate.collectionTime"
                size="small"
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                :default-time="['00:00:00', '23:59:59']"
                :start-placeholder="$t('product.startDate')"
                :end-placeholder="$t('product.endDate')"
                :picker-options="pickerOptionsForEditCoupon"
                align="right"
                @change="onChangeCollectionTime"
              />
              <p class="desc mt10">{{ $t('marketing.couponReceivePeriodTip') }}</p>
            </el-form-item>
            <el-form-item :label="$t('marketing.useValidityLabel')" prop="isFixedTime">
              <el-radio-group v-model="formValidate.isFixedTime">
                <el-radio :label="false">{{ $t('marketing.days') }}</el-radio>
                <el-radio :label="true">{{ $t('marketing.timePeriod') }}</el-radio>
              </el-radio-group>
              <p class="desc mt10">
                {{ !isEdit || isCopy ? '' : $t('marketing.couponEditTip') }}
              </p>
            </el-form-item>
            <el-form-item v-if="!formValidate.isFixedTime" prop="day">
              <el-input-number
                size="small"
                :placeholder="$t('marketing.pleaseEnterDaysCount')"
                :max="999"
                :min="1"
                :step="1"
                step-strictly
                v-model="formValidate.day"
                controls-position="right"
              >
                <span slot="suffix" class="suffix_text">{{ $t('user.day') }}</span>
              </el-input-number>
              <p class="desc mt10">{{ $t('marketing.expireAfterReceiveTip') }}</p>
            </el-form-item>
            <el-form-item v-if="formValidate.isFixedTime" prop="validityTime">
              <el-date-picker
                v-model="formValidate.validityTime"
                size="small"
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                :default-time="['00:00:00', '23:59:59']"
                :start-placeholder="$t('product.startDate')"
                :end-placeholder="$t('product.endDate')"
                align="right"
                @change="onChangeValidityTime"
                :picker-options="pickerOptionsForEditCoupon"
              />
            </el-form-item>
            <el-form-item :label="!isEdit || isCopy ? $t('marketing.publishCountUnitLabel') : $t('marketing.increasePublishCountLabel')" prop="isLimited">
              <el-radio-group v-model="formValidate.isLimited" :disabled="isEdit && !isCopy">
                <el-radio :label="true">{{ $t('marketing.limited') }}</el-radio>
                <el-radio :label="false">{{ $t('user.unlimited') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formValidate.isLimited" prop="total">
              <el-input-number
                v-if="!isEdit || isCopy"
                size="small"
                :placeholder="$t('marketing.pleaseEnterCouponCount')"
                :max="999999"
                :step="1"
                :min="1"
                step-strictly
                v-model="formValidate.total"
                controls-position="right"
              >
                <span slot="suffix" class="suffix_text">{{ $t('marketing.pcs') }}</span>
              </el-input-number>
              <el-input-number
                v-else
                size="small"
                :placeholder="$t('marketing.pleaseEnterCouponCount')"
                :max="999999"
                :step="1"
                :min="1"
                step-strictly
                v-model="formValidate.num"
                controls-position="right"
              >
                <span slot="suffix" class="suffix_text">{{ $t('marketing.pcs') }}</span>
              </el-input-number>
              <p class="desc mt10">
                {{
                  !isEdit || isCopy
                    ? $t('marketing.fillCouponCount')
                    : $t('marketing.editCouponTip')
                }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('marketing.repeatReceiveLabel')" prop="isRepeated">
              <el-radio-group v-model="formValidate.isRepeated">
                <el-radio :label="false">{{ $t('marketing.noRepeat') }}</el-radio>
                <el-radio :label="true">{{ $t('marketing.canRepeat') }}</el-radio>
              </el-radio-group>
              <p v-if="formValidate.receiveType === 1" class="desc mt10">
                {{ $t('marketing.canRepeatReceiveUsedTip') }}<br />
                {{ $t('marketing.noRepeatReceiveTip') }}
              </p>
              <p v-else class="desc mt10">
                {{ $t('marketing.canRepeatReceiveActivityTip') }}<br />
                {{ $t('marketing.noRepeatReceiveMultiTip') }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('marketing.isEnabledColon')">
              <el-switch
                :width="56"
                :disabled="isEdit && !isCopy"
                v-model="formValidate.status"
                :active-text="$t('common.open')"
                :inactive-text="$t('common.close')"
              />
            </el-form-item>
          </div>
          <div v-show="currentTab === '2'">
            <el-form-item label-width="0">
              <el-radio-group v-model="formValidate.category" :disabled="isEdit && !isCopy">
                <el-radio :label="3">{{ $t('marketing.general') }}</el-radio>
                <el-radio :label="4">{{ $t('marketing.category') }}</el-radio>
                <el-radio :label="2">{{ $t('marketing.product') }}</el-radio>
                <el-radio :label="5">{{ $t('product.brand') }}</el-radio>
                <el-radio :label="6">{{ $t('marketing.crossStore') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formValidate.category == 4" :label="$t('marketing.selectCategoryColon')" :span="24" label-width="64px">
              <el-cascader
                class="from-ipt-width"
                ref="cascader"
                v-model="linkedData"
                clearable
                :options="merPlatProductClassify"
                :props="categoryProps"
              />
            </el-form-item>
            <el-form-item v-if="formValidate.category == 2" label-width="0">
              <el-button size="small" type="primary" @click="addGoods">{{ $t('marketing.addProduct') }}</el-button>
              <el-button size="small" @click="batchDel" :disabled="!multipleSelection.length">批量删除</el-button>
            </el-form-item>
            <el-form-item v-if="formValidate.category == 2" label-width="0">
              <el-table
                ref="tableList"
                v-loading="listLoading"
                :data="tableData.data"
                style="width: 100%"
                size="small"
                @selection-change="handleSelectionChange"
                @select-all="selectAll"
                @select="selectOne"
                class="tableSelection"
              >
                <el-table-column type="selection" width="55"> </el-table-column>
                <el-table-column prop="id" label="ID" width="55"> </el-table-column>
                <el-table-column :label="$t('product.productImage')" min-width="80">
                  <template slot-scope="scope">
                    <div class="demo-image__preview line-heightOne">
                      <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column :show-overflow-tooltip="true" prop="name" :label="$t('product.productName')" min-width="200" />
                <el-table-column prop="price" :label="$t('user.salePricePlaceholder')" min-width="90" />
                <el-table-column prop="stock" :label="$t('product.stock')" min-width="70" />
                <el-table-column :label="$t('common.operate')" width="140" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item
              v-if="formValidate.category == 5"
              :label="$t('marketing.selectBrandColon')"
              :span="24"
              prop="proBrandList"
              label-width="64px"
            >
              <el-select
                class="from-ipt-width"
                clearable
                filterable
                v-model="proBrandList"
                :loading="loading"
                remote
                :placeholder="$t('videoChannel.pleaseSelectBrand')"
              >
                <el-option v-for="(v, i) in productBrand" :key="i" :label="v.name" :value="v.id" :disabled="!v.isShow">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('marketing.selectMerchantColon')"
              v-if="formValidate.category == 6"
              :span="24"
              label-width="64px"
              prop="merIds"
            >
              <merchant-name
                @getMerId="getMerId"
                :multiple="true"
                :merIdChecked="merIds"
                style="width: 460px"
              ></merchant-name>
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </div>
    <el-card dis-hover class="fixed-card box-card" shadow="never" :bordered="false">
      <div class="acea-row row-center-wrapper">
        <el-button
          type="primary"
          v-show="currentTab === '1'"
          v-debounceClick="
            () => {
              submitForm('formValidate');
            }
          "
          size="small"
          >{{ $t('product.nextStep') }}</el-button
        >
        <el-button v-show="currentTab === '2'" @click="currentTab = '1'" size="small" class="priamry_border"
          >{{ $t('product.previousStep') }}</el-button
        >
        <el-button
          v-show="currentTab === '2' && checkPermi(['platform:coupon:add', 'platform:coupon:update'])"
          type="primary"
          v-debounceClick="
            () => {
              save('formValidate');
            }
          "
          size="small"
          >{{ $t('common.save') }}</el-button
        >
      </div>
    </el-card>
  </div>
</template>
<script>
import { couponInfoApi, platformCouponAddApi, platformCouponEditApi } from '@/api/marketing';
import { mapGetters } from 'vuex';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import merchantName from '@/components/merUseCategory';
import { Debounce } from '@/utils/validate';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';

import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'createCoupon',
  data() {
    return {
      currentTab: '1',
      tabList: [
        { value: '1', title: this.$t('product.basicSetting') },
        { value: '2', title: this.$t('product.usageScope') },
      ],
      loading: false,
      formValidate: {
        name: '', //优惠券名称
        category: 3, //适用范围
        money: 1, //面值
        minPrice: 0, //使用门槛
        receiveType: 1, //领取方式
        isTimeReceive: true, //领取时间类型
        receiveStartTime: '', //可领取开始时间
        receiveEndTime: '', //可领取结束时间
        isFixedTime: false,
        day: 1, //天数
        useStartTime: '', //可使用时间范围 开始时间
        useEndTime: '', //可使用时间范围 结束时间
        isLimited: true, //是否限量
        total: 1, //总数
        num: 1, //编辑优惠券发布数量
        isRepeated: false, //是否可重复领取
        linkedData: null, //关联数据
        status: false,
        validityTime: [], //使用有效期
        collectionTime: [], //领取时间
        nameJson: '',
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      pickerOptionsForEditCoupon: {
        // 时间有效校验
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
      ruleValidate: {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('user.pleaseEnterCouponName')));
          },
        }],
        money: [{ required: true, message: '请输入优惠券面值' }],
        minPrice: [{ required: true, message: '请输入优惠券使用门槛' }],
        receiveType: [{ required: true, message: '请选择领取方式' }],
        isTimeReceive: [{ required: true, message: '请选择领取时间类型' }],
        day: [{ required: true, message: '请输入天数' }],
        total: [{ required: true, message: '请输入发布数量' }],
        isLimited: [{ required: true, message: '请选择使用有效期' }],
        isRepeated: [{ required: true, message: '请选择是否可重复领取' }],
        isFixedTime: [{ required: true, message: '请选择使用有效期' }],
        validityTime: [
          {
            type: 'array',
            required: true,
            message: '请选择日期区间',
            fields: {
              0: {
                //type: 'tpye', //tpye类型试情况而定,所以如果返回的是date就改成date
                required: true,
                trigger: 'change',
                message: '请选择开始日期',
              },
              1: {
                //type: 'tpye',
                required: true,
                trigger: 'change',
                message: '请选择结束日期',
              },
            },
          },
        ],
        collectionTime: [
          {
            type: 'array',
            required: true,
            message: '请选择日期区间',
            fields: {
              0: {
                //type: 'tpye', //tpye类型试情况而定,所以如果返回的是date就改成date
                required: true,
                trigger: 'change',
                message: '请选择开始日期',
              },
              1: {
                //type: 'tpye',
                required: true,
                trigger: 'change',
                message: '请选择结束日期',
              },
            },
          },
        ],
      },
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'childList',
        expandTrigger: 'hover',
        checkStrictly: false,
        emitPath: false,
        multiple: false,
      },
      listLoading: false,
      selectGoods: false,
      multipleSelection: [],
      tableData: {
        data: [],
        total: 0,
      },
      proBrandList: '',
      merIds: [],
      ids: [],
      linkedData: null,
    };
  },
  components: { merchantName },
  computed: {
    ...mapGetters(['merPlatProductClassify', 'productBrand']),
    isEdit() {
      return this.$route.params.id ? true : false;
    },
    isCopy() {
      return this.$route.params.copy ? true : false;
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route);
  },
  mounted() {
    this.setTagsViewTitle();
    this.getLanguageList();
    if (!localStorage.getItem('merPlatProductClassify')) this.$store.dispatch('product/getAdminProductClassify');
    if (!localStorage.getItem('productBrand')) this.$store.dispatch('product/getMerProductBrand');
    if (this.isEdit) {
      this.getInfo();
    }
  },
  methods: {
    checkPermi,
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
        // 解析失败时保持为空
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
          this.nameJsonForm = this.parseNameJson(this.formValidate && this.formValidate.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.formValidate && this.formValidate.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    //设置标题
    setTagsViewTitle() {
      if (this.$route.params.id && this.$route.params.id != 0) {
        const title = this.isEdit && !this.isCopy ? this.$t('marketing.editCoupon') : this.isCopy ? this.$t('marketing.copyCoupon') : this.$t('marketing.addCouponWord');
        const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.$route.params.id}` });
        this.$store.dispatch('tagsView/updateVisitedView', route);
      }
    },
    // 具体日期
    onChangeValidityTime(e) {
      this.formValidate.validityTime = e;
      this.formValidate.useStartTime = e ? e[0] : '';
      this.formValidate.useEndTime = e ? e[1] : '';
    },
    // 领取时间
    onChangeCollectionTime(e) {
      this.formValidate.collectionTime = e;
      this.formValidate.receiveStartTime = e ? e[0] : '';
      this.formValidate.receiveEndTime = e ? e[1] : '';
    },
    back() {
      this.$router.push({ path: '/marketing/PlatformCoupon/list' });
    },
    // 获取商户id
    getMerId(id) {
      this.merIds = id;
    },
    addGoods() {
      const _this = this;
      this.$modalGoodList(
        function (row) {
          _this.listLoading = false;
          _this.tableData.data = row;
        },
        'many',
        _this.tableData.data,
      );
    },
    //行删除
    handleDelete(index, row) {
      this.$modalSure('删除该商品吗？').then(() => {
        this.tableData.data.splice(index, 1);
      });
    },
    //批量删除
    batchDel() {
      this.$modalSure('批量删除该商品吗？').then(() => {
        let data = [];
        for (let item1 of this.tableData.data) {
          let _index = this.multipleSelection.findIndex((c) => c.id === item1.id);
          if (_index === -1) {
            data.push(item1);
          }
        }
        this.tableData.data = data;
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    selectAll(data) {
      let id = data.map((i, index) => {
        return i.spu_id;
      });
      this.ids = Array.from(new Set([...this.ids, ...id]));
    },
    selectOne(data, row) {
      let id = data.map((i, index) => {
        return i.spu_id;
      });
      let index = this.ids.findIndex((e) => {
        return e == row.spu_id;
      });
      this.ids.splice(index, 1);
      this.ids = Array.from(new Set([...this.ids, ...id]));
    },
    handleCommand(command) {
      this.$message('click on item ' + command);
      this.selectAllPage = command === 'all';
      this.$nextTick(() => {
        this.$refs.tableList.toggleAllSelection();
      });
    },
    getInfo() {
      couponInfoApi(this.$route.params.id).then((res) => {
        this.formValidate = JSON.parse(JSON.stringify(res));
        if (this.formValidate.isTimeReceive) {
          this.$set(this.formValidate, 'collectionTime', [
            this.formValidate.receiveStartTime,
            this.formValidate.receiveEndTime,
          ]);
        }
        if (res.category == 6) {
          this.merIds = this.formValidate.linkedData.split(',');
        } else if (this.formValidate.category == 4) {
          this.linkedData = Number(this.formValidate.linkedData);
        } else if (this.formValidate.category == 2) {
          this.tableData.data = this.formValidate.productList;
        } else if (this.formValidate.category == 5) {
          this.proBrandList = Number(this.formValidate.linkedData);
        }
        if (this.formValidate.useStartTime && this.formValidate.useEndTime) {
          this.$set(this.formValidate, 'validityTime', [res.useStartTime, res.useEndTime]);
        }
        this.formValidate.num = 1;
        this.nameJsonForm = this.parseNameJson(this.formValidate.nameJson);
        this.activeLang = resolveFormActiveLang(this);
      });
    },
    submitForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.currentTab = '2';
        } else {
          this.$message.warning('请完善基础设置信息');
        }
      });
    }),
    //保存
    save() {
      switch (this.formValidate.category) {
        case 6:
          this.formValidate.linkedData = this.merIds.toString();
          break;
        case 2:
          if (!this.tableData.data.length) return this.$message.error('请选择至少一个商品');
          let data = [];
          this.tableData.data.map((item) => data.push(item.id));
          this.formValidate.linkedData = data.toString();
          break;
        case 4:
          this.formValidate.linkedData = this.linkedData;
          break;
        case 5:
          this.formValidate.linkedData = this.proBrandList.toString();
          break;
        default:
          this.formValidate.linkedData = '';
          break;
      }
      if (this.formValidate.receiveType === 3) this.formValidate.isTimeReceive = false;
      this.formValidate.nameJson = this.buildNameJson();
      if (!this.formValidate.isLimited) {
        this.formValidate.total = 1;
      }
      if (this.isEdit && !this.isCopy) {
        platformCouponEditApi(this.formValidate).then((res) => {
          this.$message.success(this.$t('user.addSuccess'));
          this.back();
        });
      } else {
        platformCouponAddApi(this.formValidate).then((res) => {
          this.$message.success(this.$t('user.addSuccess'));
          this.back();
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .selWidth {
  width: 460px !important;
}
.add_title {
  position: relative;
}
.box-body {
  ::v-deep.el-card__body {
    padding-top: 0px;
  }
}
.from-ipt-width {
  width: 460px;
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
.input_width {
  width: 100px;
}
.pictrue {
  width: 58px;
  height: 58px;
  margin-right: 10px;
  position: relative;
  img {
    width: 100%;
    height: 100%;
  }
  .del {
    position: absolute;
    top: 0;
    right: 0;
  }
}
.suffix_text {
  color: #333;
}
</style>
