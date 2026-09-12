<template>
  <div class="divBox">
    <div class="container_box">
      <pages-header
        ref="pageHeader"
        :title="$t('marketing.groupActivityTitle', { action: type == 1 ? $t('common.edit') : $t('common.add') })"
        :backUrl="'/marketing/group/activity'"
      ></pages-header>
      <el-card class="box-card box-body mt14 list-tabs" shadow="never" :bordered="false">
        <el-tabs v-model="activeName">
          <el-tab-pane :label="$t('product.basicSetting')" name="first"></el-tab-pane>
          <el-tab-pane :label="$t('marketing.addProduct')" name="second"></el-tab-pane>
        </el-tabs>
        <el-form :model="formData" :rules="rules" ref="form" size="small" class="demo-ruleForm">
          <div v-show="activeName == 'first'">
            <div class="detailSection">
              <div class="title">{{ $t('community.basicInfo') }}</div>
              <el-form-item :label="$t('marketing.activityNameLabel')" label-width="100px" prop="groupName">
                <div class="lang-name-switch">
                  <el-radio-group v-model="activeLang" size="small">
                    <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                      {{ lang.label }}
                    </el-radio-button>
                  </el-radio-group>
                  <el-input
                    v-if="activeLang === defaultLangCode"
                    class="from-ipt-width lang-name-input"
                    v-model.trim="formData.groupName"
                    :placeholder="$t('marketing.pleaseEnterActivityName')"
                    :maxlength="20"
                  />
                  <el-input
                    v-else
                    class="from-ipt-width lang-name-input"
                    v-model.trim="nameJsonForm[activeLang]"
                    :placeholder="$t('marketing.inputNameInLang', { lang: activeLangLabel })"
                    :maxlength="20"
                  />
                </div>
                <div class="from-tips">{{ $t('marketing.groupNameAdminTip') }}</div>
              </el-form-item>
              <el-form-item :label="$t('marketing.activityTimeLabel')" label-width="100px" prop="startTime">
                <el-date-picker
                  v-model="time"
                  class="selWidth"
                  type="datetimerange"
                  :start-placeholder="$t('product.startDate')"
                  :end-placeholder="$t('product.endDate')"
                  :default-time="['00:00:00', '23:59:59']"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  @change="timeChange"
                  @blur="$forceUpdate()"
                  :clearable="false"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item :label="$t('marketing.formedCountLabel')" label-width="100px" class="group-num-box" prop="buyCount">
                <el-input-number
                  :min="2"
                  :max="10000"
                  type="number"
                  :controls="false"
                  class="from-ipt-width group-num-box"
                  v-model="formData.buyCount"
                  :precision="0"
                ></el-input-number>
                <div class="from-tips">{{ $t('marketing.integerRange2To10000') }}</div>
                <span class="span">{{ $t('dashboard.people') }}</span>
              </el-form-item>
              <el-form-item :label="$t('marketing.formedValidityLabel')" label-width="100px" class="group-num-box" prop="validHour">
                <el-input-number
                  type="number"
                  :controls="false"
                  :min="1"
                  :max="240"
                  class="from-ipt-width"
                  v-model="formData.validHour"
                  :precision="0"
                ></el-input-number>
                <div class="from-tips">{{ $t('marketing.groupValidityTip') }}</div>
                <span class="span time">{{ $t('marketing.hours') }}</span>
              </el-form-item>
              <el-form-item :label="$t('marketing.activityPurchaseLimitLabel')" label-width="100px" prop="allQuota">
                <el-input-number
                  :min="0"
                  :max="9999"
                  type="number"
                  :controls="false"
                  class="from-ipt-width"
                  v-model="formData.allQuota"
                  :precision="0"
                ></el-input-number>
                <div class="from-tips">{{ $t('marketing.activityLimitTip') }}</div>
              </el-form-item>
              <el-form-item :label="$t('marketing.singlePurchaseLimitLabel')" label-width="100px" prop="oncQuota">
                <el-input-number
                  :min="0"
                  :max="9999"
                  type="number"
                  :controls="false"
                  class="from-ipt-width"
                  v-model="formData.oncQuota"
                  :precision="0"
                ></el-input-number>
                <div class="from-tips">{{ $t('marketing.singleLimitTip') }}</div>
              </el-form-item>
              <div class="title">{{ $t('marketing.advancedSettings') }}</div>
              <el-form-item :label="$t('marketing.joinGroupLabel')" label-width="100px">
                <el-switch
                  :active-text="$t('common.open')"
                  :inactive-text="$t('common.close')"
                  v-model="showGroupSwitch"
                  :width="35"
                  @change="showGroup"
                >
                </el-switch>
                <div class="from-tips">{{ $t('marketing.joinGroupTip') }}</div>
              </el-form-item>
              <el-form-item :label="$t('marketing.virtualGroupLabel')" label-width="100px" v-show="showGroupSwitch">
                <el-switch
                  :active-text="$t('common.open')"
                  :inactive-text="$t('common.close')"
                  v-model="fictiStatusSwitch"
                  :width="35"
                  @change="fictiStatus"
                >
                </el-switch>
                <div class="from-tips">{{ $t('marketing.virtualGroupTip') }}</div>
              </el-form-item>
            </div>
          </div>
          <div v-show="activeName == 'second'">
            <el-button type="primary" @click="addGoods">{{ $t('marketing.addActivityProduct') }}</el-button>
            <div class="table-box" v-for="(item, index) in productList" :key="index">
              <div class="red-delete" @click="deleteGoods(index)">
                <span class="iconfont icon-shanchu"></span>
              </div>
              <div class="detailHead">
                <div class="full">
                  <i
                    class="iconfont iconChange"
                    :class="item.visible ? 'icon-xuanze' : 'icon-xiala1'"
                    @click="openClose(item)"
                  ></i>
                  <img :src="item.image" alt="" />
                  <div class="text">
                    <div class="title line1" :title="item.name">
                      {{ item.name }}
                    </div>
                  </div>
                  <div>
                    <el-popover
                      :append-to-body="false"
                      placement="bottom"
                      trigger="click"
                      v-model="item.priceVisible"
                      width="300"
                    >
                      <div class="acea-row row-middle">
                        <el-input
                          type="number"
                          style="width: 120px"
                          v-model="item.inputPrice"
                          :placeholder="$t('marketing.pleaseEnterGroupPrice')"
                        ></el-input>
                        <el-button
                          class="ml14"
                          size="mini"
                          @click="
                            colosePrice(item);
                            item.priceVisible = false;
                          "
                          >{{ $t('common.cancel') }}</el-button
                        >
                        <el-button
                          type="primary"
                          size="mini"
                          @click="
                            setActivePrice(item, item.inputPrice);
                            item.priceVisible = false;
                          "
                          >{{ $t('common.confirmPrefix') }}</el-button
                        >
                      </div>
                      <el-button slot="reference" size="small" class="mr10">{{ $t('marketing.setGroupPrice') }}</el-button>
                    </el-popover>
                  </div>
                  <div>
                    <el-popover :append-to-body="false" width="375" placement="bottom" v-model="item.numVisible">
                      <div class="acea-row row-middle">
                        <el-input
                          type="number"
                          style="width: 120px"
                          v-model="item.inputNum"
                          :placeholder="$t('marketing.pleaseEnterGroupLimit')"
                        ></el-input>
                        <el-button
                          class="ml14"
                          size="mini"
                          @click="
                            coloseNum(item);
                            item.numVisible = false;
                          "
                          >{{ $t('common.cancel') }}</el-button
                        >
                        <el-button
                          type="primary"
                          size="mini"
                          @click="
                            setQuotaShow(item, item.inputNum);
                            item.numVisible = false;
                          "
                          >{{ $t('common.confirmPrefix') }}</el-button
                        >
                      </div>
                      <el-button slot="reference" size="small" class="mr10">{{ $t('marketing.setGroupLimit') }}</el-button>
                    </el-popover>
                  </div>
                </div>
              </div>
              <div class="tablelHead" v-if="!item.visible">
                <el-table
                  ref="tableList"
                  row-key="id"
                  :data="item.attrValue"
                  size="small"
                  default-expand-all
                  style="width: 100%"
                >
                  <el-table-column width="30"></el-table-column>
                  <el-table-column :label="$t('product.image')">
                    <template slot-scope="scope">
                      <img :src="scope.row.image" alt="" />
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('marketing.spec')" prop="sku"></el-table-column>
                  <el-table-column :label="$t('marketing.productCode')" prop="barCode"></el-table-column>
                  <el-table-column :label="$t('marketing.salePriceYuan')" prop="price"></el-table-column>
                  <el-table-column :label="$t('marketing.remainingStock')" prop="stock"></el-table-column>
                  <el-table-column :label="$t('marketing.groupPriceYuan')">
                    <template slot-scope="scope" v-if="scope.row.sku">
                      <el-input-number
                        type="number"
                        :min="0.01"
                        :max="999999.99"
                        :controls="false"
                        v-model="scope.row.activePrice"
                        :precision="2"
                      ></el-input-number>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('marketing.groupQuotaLimit')">
                    <template slot-scope="scope" v-if="scope.row.sku">
                      <el-input-number
                        :min="0"
                        :max="scope.row.stock"
                        type="number"
                        :controls="false"
                        v-model="scope.row.quotaShow"
                        :precision="0"
                      ></el-input-number>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-form>
      </el-card>
      <el-card dis-hover class="fixed-card" shadow="never" :bordered="false">
        <div class="acea-row row-center-wrapper">
          <el-button v-show="activeName == 'second'" size="small" @click="activeName = 'first'">{{ $t('product.prevStep') }}</el-button>
          <el-button v-show="activeName == 'first'" type="primary" size="small" @click="toGo('form')">{{ $t('product.nextStep') }}</el-button>
          <el-button
            v-show="activeName == 'second'"
            type="primary"
            size="small"
            v-debounceClick="
              () => {
                submitForm('form');
              }
            "
            >{{ $t('common.submit') }}</el-button
          >
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { groupBuySave, groupBuyInfo, groupBuyUpdate } from '@/api/group';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
  pickFormName,
} from '@/utils/localizedName';
export default {
  data() {
    return {
      isAdd: true,
      activeName: 'first',
      formData: {
        id: '',
        groupName: '',
        groupNameJson: '',
        buyCount: '',
        validHour: '',
        allQuota: '',
        oncQuota: '',
        showGroup: 0,
        fictiStatus: 0,
        startTime: '',
        endTime: '',
        groupBuySkuRequest: [],
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      productList: [],
      //凑团
      showGroupSwitch: 0,
      //模拟成团
      fictiStatusSwitch: 0,
      time: '',
      activityId: '',
      type: '',
      visible: false,
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    rules() {
      return {
        groupName: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('marketing.pleaseEnterActivityName')));
          },
          trigger: 'blur',
        }],
        buyCount: [{ required: true, message: this.$t('marketing.pleaseEnterFormedCount'), trigger: 'blur' }],
        validHour: [{ required: true, message: this.$t('marketing.pleaseEnterValidTime'), trigger: 'blur' }],
        allQuota: [{ required: true, message: this.$t('marketing.pleaseEnterActivityLimit'), trigger: 'blur' }],
        oncQuota: [{ required: true, message: this.$t('marketing.pleaseEnterSingleLimit'), trigger: 'blur' }],
        startTime: [{ required: true, message: this.$t('marketing.pleaseSelectActivityTime'), trigger: 'change' }],
      };
    },
  },
  created() {
    this.getLanguageList();
    if (this.$route.params.activityId) {
      this.type = this.$route.params.type;
      this.getInfo(this.$route.params.activityId);
      if (this.$route.params.type == 1) {
        this.activityId = this.$route.params.activityId;
        this.formData.id = this.$route.params.activityId;
      }
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
          this.nameJsonForm = this.parseNameJson(this.formData && this.formData.groupNameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.formData && this.formData.groupNameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
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
    openClose(item) {
      if (item.visible) {
        this.$set(item, 'visible', false);
      } else {
        this.$set(item, 'visible', true);
      }
    },
    //编辑复制-数据回显
    getInfo(id) {
      groupBuyInfo(id).then((res) => {
        this.formData = res;
        this.nameJsonForm = this.parseNameJson(res.groupNameJson);
        this.activeLang = resolveFormActiveLang(this);
        this.time = [res.startTime, res.endTime];
        this.showGroupSwitch = res.showGroup == 0 ? false : true;
        this.fictiStatusSwitch = res.fictiStatus == 0 ? false : true;
        let editArr = [];
        res.groupBuyActivityProductResponseList.forEach((item) => {
          if (item.groupBuyActivitySkuResponses.length) {
            let obj = {
              id: item.productId,
              name: item.productName,
              image: item.image,
              attrValue: [],
            };
            item.groupBuyActivitySkuResponses.forEach((citem) => {
              if (citem.attrValue.length) {
                obj.attrValue.push({
                  activePrice: citem.activePrice,
                  groupActivityId: citem.groupActivityId,
                  id: citem.id,
                  productId: citem.productId,
                  quotaShow: citem.quotaShow,
                  skuId: citem.skuId,
                  sku: citem.attrValue[0].sku,
                  image: citem.attrValue[0].image,
                  price: citem.attrValue[0].price,
                  stock: citem.attrValue[0].stock,
                });
              }
            });
            editArr.push(obj);
          }
        });
        // this.formData.groupBuySkuRequest = editArr;
        this.productList = editArr;
      });
    },
    toGo(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.activeName = 'second';
        } else {
          return false;
        }
      });
    },
    timeChange(e) {
      if (e) {
        this.formData.startTime = e[0];
        this.formData.endTime = e[1];
      } else {
        this.formData.startTime = '';
        this.formData.endTime = '';
      }
    },
    //模拟成团开关
    fictiStatus(e) {
      e ? (this.formData.fictiStatus = 1) : (this.formData.fictiStatus = 0);
    },
    //凑团开关
    showGroup(e) {
      if (e) {
        this.formData.showGroup = 1;
      } else {
        this.formData.fictiStatus = 0;
        this.formData.showGroup = 0;
        this.fictiStatusSwitch = 0;
      }
    },
    //添加商品
    addGoods() {
      const _this = this;
      this.$modalActivityProduct(
        function (row) {
          _this.listLoading = false;
          _this.getAttrValue(row);
        },
        'many',
        _this.productList,
        0,
        2,
        // Number(_this.form.id),
      );
    },
    //删除商品
    deleteGoods(index) {
      this.$modalSure(this.$t('marketing.deleteProductConfirm')).then(() => {
        this.productList.splice(index, 1);
        this.$message({
          type: 'success',
          message: this.$t('marketing.deleteSuccessExcl'),
        });
      });
    },
    //获取商品
    getAttrValue(row) {
      let procuctList = row;
      row.forEach((item) => {
        item.attrValue.forEach((citem) => {
          if (!citem.activePrice) {
            this.$set(citem, 'activePrice', 0.01);
          }
          if (!citem.quotaShow) {
            this.$set(citem, 'quotaShow', 0);
          }
        });
      });
      this.productList = row;
    },
    setActivePrice(item, V) {
      item.attrValue.forEach((item) => {
        this.$set(item, 'activePrice', V);
      });
      this.$set(item, 'inputPrice', '');
    },
    colosePrice(item) {
      this.$set(item, 'inputPrice', '');
    },
    setQuotaShow(item, V) {
      item.attrValue.forEach((item) => {
        this.$set(item, 'quotaShow', V);
      });
      this.$set(item, 'inputNum', '');
    },
    coloseNum(item) {
      this.$set(item, 'inputNum', '');
    },
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let total = 0;
          let price = 0;
          this.productList.map((item) => {
            item.attrValue.forEach((i) => {
              total += i.quotaShow;
              price += i.activePrice;
            });
          });
          if (!total && total !== 0) return this.$message.warning(this.$t('marketing.productLimitRequired'));
          if (!price) return this.$message.warning(this.$t('marketing.groupPriceRequired'));
          if (total < this.productList.length) return this.$message.warning(this.$t('marketing.productLimitSumTip'));
          if (this.productList.length > 10) return this.$message.warning(this.$t('marketing.maxTenProducts'));
          let arr = [];
          this.productList.forEach((item) => {
            item.attrValue.forEach((val) => {
              arr.push({
                activePrice: val.activePrice,
                productId: val.productId,
                quotaShow: val.quotaShow,
                skuId: val.skuId ? val.skuId : val.id,
                id: this.type == 1 ? val.id : '',
                groupActivityId: this.$route.params.activityId ? this.$route.params.activityId : '',
              });
            });
          });
          this.formData.groupBuySkuRequest = arr;
          this.formData.productCount = this.productList.length;
          this.formData.groupNameJson = this.buildNameJson();
          if (this.type == 1) {
            groupBuyUpdate(this.formData)
              .then((res) => {
                this.$message.success(this.$t('user.modifySuccess'));
                this.$router.push({ path: '/marketing/group/activity/3' });
              })
              .catch((err) => {
                this.$message.error(err);
              });
          } else {
            groupBuySave(this.formData)
              .then((res) => {
                this.$message.success(this.$t('user.addSuccess'));
                this.$router.push({ path: '/marketing/group/activity/3' });
              })
              .catch((err) => {
                this.$message.error(err);
              });
          }
        } else {
          this.$message.warning(this.$t('marketing.pleaseFillBasicSettings'));
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.add_title {
  position: relative;
}
.box-body {
  ::v-deep.el-card__body {
    padding-top: 0px;
  }
}

.f-w-500 {
  font-weight: 500;
}
.f-s-18 {
  font-size: 18px;
}
.ml32 {
  margin-left: 32px;
}
.row_title {
  min-width: 200px !important;
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
::v-deep .right-align {
  padding-bottom: 20px !important;
}
.detailSection {
  border-top: none;
  .title {
    margin-bottom: 20px;
  }
}
.group-num-box {
  position: relative;
  .span {
    position: absolute;
    top: 0;
    left: 430px;
    font-size: 13px;
  }
  .span.time {
    left: 420px;
  }
}
.table-box {
  position: relative;
  margin-top: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  .detailHead {
    padding: 15px 25px 5px 20px !important;
  }
  .tablelHead {
    padding: 0 20px 15px;
  }
  .full {
    img {
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }
  }
  .title.line1 {
    width: 600px;
  }
}
.selWidth {
  width: 460px !important;
}
::v-deep.el-input-number .el-input__inner {
  text-align: left;
}
// .red-delete {
//   width: 50px;
//   height: 50px;
//   border-radius: 0 6px 0 0;
//   position: absolute;
//   top: 0;
//   right: 0;
//   background: red;
// }
.red-delete {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  &::before {
    border: 20px solid red;
    border-left: 20px solid transparent;
    border-top: 20px solid transparent;
    border-bottom-right-radius: 6px;
    content: '';
    position: relative;
    width: 0;
    transform: rotate(-90deg);
    position: absolute;
    right: 0;
    top: 0;
  }
  .icon-shanchu {
    font-size: 16px;
    color: #fff;
    position: absolute;
    right: 2.5px;
    top: 2.5px;
    z-index: 999;
  }
}
.ml14 {
  margin-left: 14px;
}
.iconChange {
  font-size: 16px !important;
  color: #999 !important;
  cursor: pointer;
}
::v-deep .list-tabs .el-card__body {
  padding-bottom: 60px !important;
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
