<template>
  <div class="divBox">
    <div class="container_box">
      <pages-header
        ref="pageHeader"
        :title="$t('marketing.addSeckillProduct')"
        :backUrl="this.isEdit ? `/marketing/seckill/seckillActivity` : '/marketing/seckill/list'"
      ></pages-header>
      <el-card class="box-card box-body mt14 list-tabs" shadow="never" :bordered="false">
        <el-tabs v-model="activeName">
          <el-tab-pane v-if="!$route.params.activityId" :label="$t('product.basicSetting')" name="first"></el-tab-pane>
          <el-tab-pane :label="$t('marketing.addProduct')" name="second"></el-tab-pane>
        </el-tabs>
        <el-form ref="form" :model="form" :rules="rules" size="small" class="demo-ruleForm">
          <template v-if="activeName == 'first' && !$route.params.isActivity !== '1'">
            <el-form-item :label="$t('marketing.selectActivityLabel')" prop="id">
              <span v-if="isCopy">{{ localizedName({ name: form.productList.activityName, nameJson: form.productList.activityNameJson }) }}</span>
              <el-select
                v-else
                class="from-ipt-width"
                clearable
                filterable
                v-model="form.id"
                v-selectLoadMore="selectLoadMore"
                :loading="loading"
                remote
                :disabled="isCopy"
                :remote-method="remoteMethod"
                :placeholder="$t('marketing.pleaseSelectActivity')"
              >
                <el-option
                  v-for="user in activityList"
                  :key="user.id"
                  :label="localizedName(user)"
                  :value="user.id"
                  :disabled="Number(user.status) > 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </template>
          <template v-if="activeName == 'second'">
            <div class="acea-row row-between-wrapper">
              <div class="acea-row mb20">
                <el-button :disabled="!isEdit && isCopy" size="small" type="primary" @click="addGoods()"
                  >{{ $t('marketing.addProduct') }}</el-button
                >
                <el-dropdown size="small" class="ml10 mr10">
                  <el-button :disabled="isShowCheck">{{ $t('product.batchSet') }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :disabled="isShowCheck" @click.native="setPrice(2)">{{ $t('marketing.limited') }}</el-dropdown-item>
                    <el-dropdown-item :disabled="isShowCheck" @click.native="setPrice(1)">{{ $t('marketing.activityPrice') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button size="small" @click="batchDel" :disabled="isShowCheck">{{ $t('product.batchDelete') }}</el-button>
              </div>
            </div>
            <el-table
              ref="tableList"
              row-key="id"
              :data="proData"
              v-loading="listLoading"
              size="small"
              default-expand-all
              :tree-props="{ children: 'children' }"
              style="width: 100%"
            >
              <el-table-column width="30"></el-table-column>
              <el-table-column width="50">
                <template slot="header" slot-scope="scope">
                  <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" />
                </template>
                <template slot-scope="scope" v-if="!scope.row.sku">
                  <el-checkbox :value="scope.row.checked" @change="(v) => handleCheckOneChange(v, scope.row)" />
                </template>
              </el-table-column>
              <el-table-column min-width="300" :label="$t('product.productInfo')">
                <template slot-scope="scope">
                  <div class="acea-row">
                    <div class="demo-image__preview mr10 line-heightOne">
                      <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" />
                    </div>
                    <div class="row_title line2">{{ scope.row.sku ? localizedSku(scope.row.sku, scope.row) : localizedName(scope.row) }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('marketing.productCategory')" min-width="80">
                <template slot-scope="scope">{{ localizedText(scope.row.categoryName, scope.row.categoryNameI18n || scope.row.categoryNameJson) }}</template>
              </el-table-column>
              <el-table-column prop="price" :label="$t('product.attrPrice')" width="120" />
              <el-table-column prop="stock" :label="$t('product.stock')" min-width="80" />
              <el-table-column prop="quota" :label="$t('marketing.limited')" width="120">
                <template slot-scope="scope" v-if="scope.row.sku">
                  <el-input-number
                    v-model="scope.row.quota"
                    type="number"
                    :precision="0"
                    :min="0"
                    :max="scope.row.stock"
                    :controls="false"
                    class="input_width"
                  >
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column prop="activityPrice" :label="$t('marketing.activityPriceFull')" width="120">
                <template slot-scope="scope" v-if="scope.row.sku">
                  <el-input-number
                    v-model="scope.row.activityPrice"
                    type="number"
                    :precision="2"
                    :min="0.01"
                    :max="99999"
                    :controls="false"
                    class="input_width"
                  >
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.operate')" width="70" fixed="right">
                <template slot-scope="scope">
                  <a v-if="!scope.row.sku" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</a>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-form>
      </el-card>
      <el-card dis-hover class="fixed-card" shadow="never" :bordered="false">
        <div class="acea-row row-center-wrapper">
          <!--<el-button v-show="activeName == 'first'" size="small" type="primary" v-debounceClick="getTableData"-->
          <!--&gt;下一步</el-button-->
          <!--&gt;-->
          <el-button
            :disabled="!form.id && activeName === 'first'"
            v-show="activeName === 'first'"
            size="small"
            type="primary"
            @click="activeName = 'second'"
            >{{ $t('product.nextStep') }}</el-button
          >
          <!--<el-button-->
          <!--v-show="activeName == 'second'"-->
          <!--type="primary"-->
          <!--@click="submitForm('form')"-->
          <!--size="small"-->
          <!--v-if="!isEdit || isCopy"-->
          <!--&gt;立即创建</el-button-->
          <!--&gt;-->
          <el-button
            v-hasPermi="['merchant:seckill:product:add']"
            v-show="activeName == 'second'"
            type="primary"
            v-debounceClick="
              () => {
                submitForm('form');
              }
            "
            size="small"
            >{{ $t('marketing.saveChanges') }}</el-button
          >
        </div>
      </el-card>
    </div>
    <activity ref="activityModal" @onChange="setActivity" key="keyNum" />
  </div>
</template>

<script>
import {
  seckillProAddApi,
  seckillActivityDetailApi,
  seckillAtivityUpdateApi,
  seckillActivityListApi,
} from '@/api/marketing';
import { productMarketingListApi } from '@/api/product';
import { mapGetters } from 'vuex';
import activity from './activity.vue';
import { localizeSpecSku, getLocalizedName, getLocalizedText, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'creatSeckill',
  components: {
    activity,
  },
  directives: {
    // 计算是否滚动到最下面
    selectLoadMore: {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          if (this.scrollHeight - this.scrollTop < this.clientHeight + 1) {
            binding.value();
          }
        });
      },
    },
  },
  data() {
    return {
      activeName: '',
      search: {
        limit: this.$constants.page.limit[0],
        page: 1,
        name: '',
      },
      form: {
        id: '',
        productList: [],
      },
      rules: {
        name: [{ required: true, message: this.$t('marketing.pleaseEnterActivityName'), trigger: 'blur' }],
        share: [{ required: true, message: this.$t('marketing.pleaseSelectDiscountRate'), trigger: 'change' }],
        timeVal: [{ required: true, message: this.$t('marketing.pleaseSelectActivityDate') }],
        discount: [{ required: true, message: this.$t('marketing.pleaseSelectDiscountMethod') }],
        timeVal2: [{ type: 'array', required: true, message: this.$t('marketing.pleaseSelectSeckillSession'), trigger: 'change' }],
        id: [{ required: true, message: this.$t('marketing.pleaseSelectSeckillActivity'), trigger: 'change' }],
      },
      timeVal2: [],
      spikeTimeList: [],
      multipleSelection: [],
      activityType: null,
      proData: [],
      listLoading: false,
      checkAll: false,
      isIndeterminate: true,
      activityList: [],
      loading: false,
      keyNum: 0,
      isShowCheck: false,
      attrValue: [], //普通商品sku数组
      auditStatus: 0, //审核状态
      productId: 0, //普通商品id
    };
  },
  mounted() {
    this.$store.dispatch('product/getAdminProductClassify');
    if (this.$route.params.activityId) {
      this.form.id = this.$route.params.activityId;
      this.activeName = 'second';
    } else {
      if (!this.isCopy) {
        this.getActivityList();
      } else {
        this.getInfo();
      }
      this.activeName = 'first';
    }
    this.isCkecked();
  },
  computed: {
    pickerOptions() {
      this.$i18n.locale;
      return this.$createTimeOptions();
    },
    ...mapGetters(['merPlatProductClassify']),
    //判断是否有活动id
    isEdit() {
      return this.$route.params.activityId ? true : false;
    },
    //判断添加商品是否可编辑
    isCopy() {
      if (this.$route.params.activityId && localStorage.getItem('seckillData')) return true;
      if (this.$route.params.activityId && !localStorage.getItem('seckillData')) return false;
      if (!this.$route.params.activityId && localStorage.getItem('seckillData')) return true;
      return false;
    },
  },
  methods: {
    localizedSku(sku, row) {
      let attrList = row && row.attrList;
      if ((!attrList || !attrList.length) && this.proData && this.proData.length) {
        const parent = this.proData.find((p) => (p.children || []).some((c) => c === row || (c && row && c.id === row.id)));
        attrList = parent && parent.attrList;
      }
      return localizeSpecSku(sku, this.$t.bind(this), attrList, getUiLocale(this));
    },
    localizedName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    localizedText(text, json) {
      return getLocalizedText(text, json, getUiLocale(this));
    },
    // 下拉加载更多
    selectLoadMore() {
      this.search.page = this.search.page + 1;
      if (this.search.page > this.totalPage) return;
      this.getActivityList(); // 请求接口
    },
    // 远程搜索
    remoteMethod(query) {
      this.loading = true;
      this.search.name = query;
      this.search.page = 1;
      this.activityList = [];
      setTimeout(() => {
        this.loading = false;
        this.getActivityList(); // 请求接口
      }, 200);
    },
    // 活动列表
    getActivityList() {
      seckillActivityListApi(this.search).then((res) => {
        this.totalPage = res.totalPage;
        this.total = res.total;
        this.activityList = this.activityList.concat(res.list);
      });
    },
    // 判断选中没有
    isCkecked() {
      let checked = this.proData.filter((item) => item.checked);
      if (checked.length) {
        this.isShowCheck = false;
      } else {
        this.isShowCheck = true;
      }
    },
    //全选
    handleCheckAllChange(val) {
      this.isIndeterminate = !this.isIndeterminate;
      this.proData.forEach((item) => {
        this.$set(item, 'checked', val);
      });
      this.isCkecked();
    },
    //单选
    handleCheckOneChange(val, row) {
      let totalCount = this.proData.length;
      let someStatusCount = 0;
      this.$set(row, 'checked', val);
      this.proData.forEach((item) => {
        if (item.checked === val) {
          someStatusCount++;
        }
      });
      this.checkAll = totalCount === someStatusCount ? val : !val;
      this.isIndeterminate = someStatusCount > 0 && someStatusCount < totalCount;
      this.isCkecked();
    },
    //详情
    getInfo() {
      this.listLoading = true;
      let info = JSON.parse(localStorage.getItem('seckillData'));
      this.auditStatus = info.auditStatus;
      this.productId = info.productId;
      this.form.productList = info;
      this.form.id = info.activityId;
      this.listLoading = false;
      if (info.auditStatus === 3) {
        //调取商品详情接口 获取商品规格id。因为重新提交 相当于添加商品，取普通商品规格id
        productMarketingListApi({ productId: info.productId, activityId: info.activityId, marketingType: 2 }).then(
          async (res) => {
            if (res) {
              this.attrValue = res.list[0].attrValue || [];
              this.getAttrValue(res.list);
            }
          },
        );
      } else {
        this.getAttrValue([info]);
      }
    },
    back() {
      if (this.isEdit) {
        this.$router.push({ path: `/marketing/seckill/seckillActivity` });
      } else {
        this.$router.push({ path: `/marketing/seckill/list` });
      }
    },
    //行删除
    handleDelete(index, row) {
      this.$modalSure(this.$t('marketing.deleteSeckillProductConfirm')).then(() => {
        let i = this.proData.findIndex((item) => item == row);
        this.proData.splice(i, 1);
      });
    },
    setActivity(data, type) {
      if (type == 1) {
        if (data.type == 0) {
          this.proData.forEach((item) => {
            item.children.forEach((item1) => {
              if (item.checked) {
                this.$set(item1, 'activityPrice', data.price);
              }
            });
          });
        } else {
          this.proData.forEach((item) => {
            item.children.forEach((item1) => {
              if (item.checked) {
                this.$set(item1, 'activityPrice', (item1.price * data.discount) / 100);
              }
            });
          });
        }
      } else if (type == 2) {
        this.proData.forEach((item) => {
          item.children.forEach((item1) => {
            if (item.checked) {
              this.$set(item1, 'quota', data.activity_stock);
            }
          });
        });
      }
    },
    //添加商品
    addGoods() {
      if (!this.form.id) return this.$message.warning(this.$t('marketing.selectSeckillFirst'));
      const _this = this;
      this.$modalActivityProduct(
        function (row) {
          _this.listLoading = false;
          _this.getAttrValue(row);
        },
        'many',
        _this.proData,
        Number(_this.form.id),
        1,
      );
    },
    getAttrValue(row) {
      const _this = this;
      if (!Array.isArray(row) || !row.length) return;
      row.map((item) => {
        _this.$set(item, 'children', item.attrValue || []);
        _this.$set(item, 'sort', 0);
        _this.$set(item, 'checked', true);
        (item.children || []).map((i) => {
          _this.$set(i, 'name', i.sku);
          _this.$set(i, 'merName', item.merName);
          _this.$set(i, 'categoryName', item.categoryName);
          _this.$set(i, 'categoryNameJson', item.categoryNameJson);
          _this.$set(i, 'categoryNameI18n', item.categoryNameI18n);
          _this.$set(i, 'attrList', item.attrList);
          _this.$set(i, 'quota', i.quota ? i.quota : 0);
          _this.$set(i, 'quotaShow', i.quotaShow ? i.quotaShow : 0);
          // _this.$set(i, 'activityPrice', 0.01);
          _this.$set(i, 'activityPrice', 0.01);
          _this.$set(i, 'price', i.price);
        });
      });
      _this.proData = row;
      _this.isCkecked();
    },
    batchDel() {
      this.$modalSure(this.$t('marketing.batchDeleteProductsConfirm')).then(() => {
        this.proData = this.proData.filter((item) => !item.checked);
      });
    },
    //设置活动价
    setPrice(type) {
      this.keyNum = Math.random();
      this.$refs.activityModal.type = type;
      this.$refs.activityModal.showStatus = true;
    },
    // 具体日期
    onchangeTime(e) {
      this.form.timeVal = e;
      this.form.startDate = e ? e[0] : '';
      this.form.endDate = e ? e[1] : '';
    },
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let total = 0;
          let price = 0;
          this.proData.map((item) => {
            item.children.map((i) => {
              total += i.quota;
              price += i.activityPrice;
            });
          });
          if (!total && total !== 0) return this.$message.warning(this.$t('marketing.productLimitRequired'));
          if (!price) return this.$message.warning(this.$t('marketing.spikePriceRequired'));
          if (total < this.proData.length) return this.$message.warning(this.$t('marketing.productLimitSumTip'));
          let list = this.proData;
          //this.auditStatus === 3 获取商品规格id。因为重新提交 相当于添加商品，取普通商品规格id
          if (this.auditStatus === 3) {
            this.form.productList = list.map((item) => {
              return {
                id: this.productId,
                sort: 0,
                attrValue: item.attrValue.map((item1, idx) => {
                  return {
                    activityPrice: item1.activityPrice,
                    attrValueId: this.attrValue[idx].id,
                    quota: item1.quota,
                  };
                }),
              };
            });
          } else {
            this.form.productList = list.map((item) => {
              return {
                id: item.id,
                sort: 0,
                attrValue: item.attrValue.map((item1) => {
                  return {
                    activityPrice: item1.activityPrice,
                    attrValueId: item1.id,
                    quota: item1.quota,
                  };
                }),
              };
            });
          }
          // this.form.id = this.$route.params.activityId ? this.$route.params.activityId : this.form.id;
          seckillProAddApi(this.form)
            .then((res) => {
              this.$message.success(this.$t('user.addSuccess'));
              if (this.$route.params.activityId) {
                this.$router.push({ path: `/marketing/seckill/seckillActivity` });
              } else {
                this.$router.push({ path: `/marketing/seckill/list` });
              }
            })
            .catch((res) => {});
        } else {
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
</style>
