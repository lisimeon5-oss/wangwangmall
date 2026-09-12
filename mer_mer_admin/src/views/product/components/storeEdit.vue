<template>
  <div class="detailSection padBox">
    <el-form
      ref="formValidate"
      v-loading="loading"
      class="formValidate"
      :model="formValidate"
      @submit.native.prevent
      :rules="rules"
    >
      <el-form-item v-if="!stockEdit" :label="$t('product.merchantCategoryLabel')" prop="cateIds">
        <el-cascader
          v-model="formValidate.cateIds"
          :options="merProductClassify"
          :props="props2"
          clearable
          class="from-ipt-width"
          :show-all-levels="false"
        />
      </el-form-item>
      <el-form-item :label="$t('product.productSpecLabel')" class="labeltop">
        <el-table :data="ManyAttrValue" class="tabNumWidth" size="small">
          <template v-if="manyTabDate">
            <el-table-column v-for="(item, iii) in manyTabDate" :key="iii" :label="specColumnTitle(iii)" min-width="140">
              <template slot-scope="scope">
                <span class="priceBox">{{ specCellText(iii, scope.row[iii]) }}</span>
              </template>
            </el-table-column>
          </template>
          <el-table-column :label="$t('product.image')" width="70">
            <template slot-scope="scope">
              <div class="line-heightOne">
                <div v-if="scope.row.image" class="tabPic line-heightOne"><img :src="scope.row.image" /></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-for="(item, iii) in attrValue" :key="iii" :label="formThead[iii].title">
            <template slot-scope="scope">
              <el-input
                v-if="
                  (iii === 'price' || (iii === 'stock' && productType < 5)) &&
                  !stockEdit
                "
                v-model.trim="scope.row[iii]"
                type="number"
                :min="0"
                class="priceBox"
                @keyup.native="keyupEvent(iii, scope.row[iii], scope.$index)"
              />
              <span v-else-if="iii === 'isDefault' || iii === 'isShow'">{{
                scope.row[iii] ? $t('product.yes') : $t('product.no')
              }}</span>
              <span v-else>{{ scope.row[iii] || '--' }}</span>
            </template>
          </el-table-column>
          <!--增加库存-->
          <el-table-column v-if="stockEdit && productType !== 6" :label="$t('product.addStock')" align="right" width="150">
            <template slot-scope="scope">
              <el-form-item class="all line-heightOne">
                <el-input-number v-model.trim="scope.row.stockAdd" :step="1" step-strictly :min="0" class="priceBox" />
              </el-form-item>
            </template>
          </el-table-column>
          <!--云盘链接设置-->
          <el-table-column v-if="!stockEdit && productType === 5" :label="$t('product.linkSettings')" align="right">
            <template slot-scope="scope">
              <el-form-item class="all">
                <a @click="editVirtually(scope.$index, scope.row)">{{ $t('product.editLink') }}</a>
              </el-form-item>
            </template>
          </el-table-column>
          <!--管理卡密，卡密库跳转-->
          <el-table-column
            v-if="productType === 6 && checkPermi(['merchant:card:secret:page:list'])"
            :label="stockEdit ? $t('product.supplementCdkey') : $t('product.manageCdkey')"
            align="right"
          >
            <template slot-scope="scope">
              <el-form-item class="all">
                <a @click="handlerToAddCdkey(scope.row)">{{ $t('product.supplementCdkey') }}</a>
              </el-form-item>
            </template>
          </el-table-column>
          <!--修改卡密库-->
          <el-table-column
            v-if="!stockEdit && productType === 6 && checkPermi(['merchant:card:secret:page:list'])"
            :label="$t('product.cdkeySettings')"
            align="right"
          >
            <template slot-scope="scope">
              <el-form-item class="all">
                <a @click="handlerEeditCdkey(scope.$index, scope.row)">{{ displayCdkeyLibraryName(scope.row) }}</a>
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item v-if="(stockEdit && productType !== 6) || !stockEdit">
        <el-button type="primary" @click="onSubmit('formValidate')">{{
          loadingBtn ? $t('product.submitting') : $t('product.confirmSpace')
        }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 添加云盘-->
    <add-cloud-disk
      ref="cloudDiskRef"
      :cloudDisk="cloudDisk"
      @handlerSubSuccess="handlerSubSuccessCloudDisk"
      @closeCloudDisk="closeCloudDisk"
    ></add-cloud-disk>

    <!-- 选择卡密库-->
    <cdkey-library
      ref="cdkeyLibrary"
      v-if="cdkeyLibraryInfo"
      :cdkeyLibraryInfo="cdkeyLibraryInfo"
      @handlerSubSuccess="handlerChangeCdkeyIdSubSuccess"
    ></cdkey-library>
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

import { productDetailApi, productStockAddApi, productFreeEditApi } from '@/api/product';
import { mapGetters } from 'vuex';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import i18n from '@/i18n';
import { getLocalizedName, getUiLocale, localizeProductSpecName, localizeProductSpecValue, localizeSpecSku } from '@/utils/localizedName';
import CdkeyLibrary from '@/views/product/components/cdkeyLibrary.vue';
import addCloudDisk from '@/views/product/components/addCloudDisk.vue';
import product from '@/mixins/product';
const defaultObj = {
  cateIds: [], // 商品分类id
  cateId: null, // 商品分类id传值
  attrValue: [
    {
      image: '',
      price: 0,
      cost: 0,
      otPrice: 0,
      vipPrice: 0,
      stock: 0,
      weight: 0,
      volume: 0,
      brokerage: 0,
      brokerageTwo: 0,
      isDefault: false,
      isShow: false,
      itemNumber: '',
    },
  ],
  attr: [],
  specType: false,
};
const objTitle = () => ({
  price: {
    title: i18n.t('product.salePrice'),
  },
  cost: {
    title: i18n.t('product.costPrice'),
  },
  otPrice: {
    title: i18n.t('product.strikePrice'),
  },
  vipPrice: {
    title: i18n.t('product.memberPrice'),
  },
  stock: {
    title: i18n.t('product.stock'),
  },
  barCode: {
    title: i18n.t('product.productCode'),
  },
  weight: {
    title: i18n.t('product.weightKG'),
  },
  volume: {
    title: i18n.t('product.volumeM3'),
  },
  brokerage: {
    title: i18n.t('product.firstCommission'),
  },
  brokerageTwo: {
    title: i18n.t('product.secondCommission'),
  },
  isDefault: {
    title: i18n.t('product.isDefault'),
  },
  isShow: {
    title: i18n.t('product.isShow'),
  },
  itemNumber: {
    title: i18n.t('product.productBarcode'),
  },
  stockAdd: {
    title: i18n.t('product.addStock'),
  },
});
export default {
  name: 'edit',
  mixins: [product], //此js存放商品的部分函数方法
  components: { addCloudDisk, CdkeyLibrary },
  props: {
    //id
    productId: {
      type: Number || String,
      default: 0 || '',
    },
    //编辑库存true，免审编辑false
    stockEdit: {
      type: Boolean,
      default: false,
    },
    //类型
    productType: {
      type: Number || String,
      default: 0 || '',
    },
    //佣金设置是否单独设置
    isSub: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      props2: {
        children: 'childList',
        label: 'name',
        value: 'id',
        multiple: true,
        emitPath: false,
        checkStrictly: true,
      },
      rules: {
        cateIds: [{ required: true, message: this.$t('product.selectMerchantCategory'), trigger: 'change', type: 'array', min: '1' }],
        stockAdd: [{ required: true, message: this.$t('product.enterStock'), trigger: 'blur' }],
      },
      formValidate: Object.assign({}, defaultObj),
      formThead: Object.assign({}, objTitle()),
      isAttr: false,
      ManyAttrValue: [
        {
          image: '',
          price: 0,
          cost: 0,
          otPrice: 0,
          vipPrice: 0,
          stock: 0,
          weight: 0,
          volume: 0,
          stockAdd: 0,
        },
      ], // 规格
      manyTabTit: {},
      manyTabDate: {},
      loading: false,
      attrInfo: {},
      loadingBtn: false,
      cloudDisk: '', //云盘地址
      virtuallyIndex: 0, //索引
      cdkeyLibraryInfo: {}, //卡密库对象
    };
  },
  computed: {
    uiLocale() {
      return (this.$i18n && this.$i18n.locale) || getUiLocale(this);
    },
    ...mapGetters(['merProductClassify']),
    attrValue() {
      const obj = Object.assign({}, defaultObj.attrValue[0]);
      delete obj.image;
      if (this.formValidate.type === 2) {
        delete obj.itemNumber;
      }
      if (this.productType === 5) {
        delete obj.stock;
        delete obj.volume;
        delete obj.weight;
        delete obj.itemNumber;
      }
      if (this.productType === 6) {
        delete obj.volume;
        delete obj.weight;
        delete obj.itemNumber;
      }
      if (!this.isSub) {
        delete obj.brokerage;
        delete obj.brokerageTwo;
      }
      return obj;
    },
  },
  watch: {
    // 切换语言时重新生成规格表单标题，确保售价/成本价等标签跟随语言
    '$i18n.locale'() {
      this.formThead = Object.assign({}, objTitle());
    },
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route);
    if (this.formValidate.specType) {
      // this.$watch('formValidate.attr', this.watCh);
    }
  },
  mounted() {
    this.getInfo();
  },
  methods: {
    checkPermi,
    displayCdkeyLibraryName(row) {
      return getLocalizedName({ name: row.cdkeyLibraryName, nameJson: row.cdkeyLibraryNameJson }, this.uiLocale);
    },
    specColumnTitle(key) {
      const attr = (this.formValidate.attrList || []).find((item) => item.attributeName === key);
      return localizeProductSpecName(attr, this.uiLocale) || (this.manyTabTit[key] && this.manyTabTit[key].title) || key;
    },
    specCellText(specKey, text) {
      const attr = (this.formValidate.attrList || []).find((item) => item.attributeName === specKey);
      return localizeSpecSku(localizeProductSpecValue(attr, text, this.uiLocale), this.$t.bind(this));
    },
    // 补充卡密
    handlerToAddCdkey(row) {
      const { href } = this.$router.resolve({
        path: `/product/cdkey/creatCdkey/${row.cdkeyId}/${row.cdkeyLibraryName}`,
      });
      window.open(href);
    },
    //编辑卡密
    handlerEeditCdkey(index, data) {
      this.cdkeyLibraryInfo = {
        id: data.cdkeyId,
        name: data.cdkeyLibraryName,
        nameJson: data.cdkeyLibraryNameJson,
      };
      this.ManyAttrValue[index].expand = data.expand;
      this.virtuallyIndex = index;
      this.$refs.cdkeyLibrary.cdkeyShow = true;
    },
    //选择卡密库回调
    handlerChangeCdkeyIdSubSuccess(row) {
      this.ManyAttrValue[this.virtuallyIndex].cdkeyLibraryName = row.name;
      this.ManyAttrValue[this.virtuallyIndex].cdkeyLibraryNameJson = row.nameJson;
      this.ManyAttrValue[this.virtuallyIndex].cdkeyId = row.id;
    },
    //编辑云盘链接
    editVirtually(index, data) {
      this.ManyAttrValue[index].expand = data.expand;
      this.virtuallyIndex = index;
      this.cloudDisk = data.expand;
      this.$refs.cloudDiskRef.cloudDiskShow = true;
    },
    //确认提交云盘链接
    handlerSubSuccessCloudDisk(e) {
      this.cloudDisk = e;
      this.ManyAttrValue[this.virtuallyIndex].expand = JSON.parse(JSON.stringify(e));
      this.$refs.cloudDiskRef.cloudDiskShow = false;
    },
    closeCloudDisk() {
      this.$refs.cloudDiskRef.cloudDiskShow = false;
    },
    keyupEvent(key, val, index) {
      this.$forceUpdate();
      const regex = /^\d{1,6}(\.\d{1,2})?$/;
      const re = /^\D*([0-9](\d{1,5}(\.\d{1,2})?))?.*$/;
      // var re = /^\D*([0-9]\d*\.?\d{0,2})?.*$/;
      this.ManyAttrValue[index][key] =
        key === 'stock'
          ? parseInt(val)
          : regex.test(val)
          ? val
          : this.$set(this.ManyAttrValue[index], key, val.toString().replace(re, '$1'));
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.stockEdit) {
            let data = [];
            let stockAdd = '';
            this.ManyAttrValue.forEach((val, index) => {
              stockAdd = val.stockAdd;
            });
            if (!stockAdd && stockAdd !== 0) return this.$message.warning(this.$t('product.addStockRequired'));
            this.ManyAttrValue.forEach((val, index) => {
              data.push({
                id: val.id,
                stock: val.stockAdd ? val.stockAdd : 0,
              });
            });
            productStockAddApi({
              attrValueList: data,
              id: this.productId,
            })
              .then((res) => {
                this.$message.success(this.$t('product.operateSuccess'));
                this.$emit('subSuccess');
                this.loadingBtn = false;
              })
              .catch((res) => {
                this.loadingBtn = false;
              });
          } else {
            let data = [];
            this.formValidate.cateId = this.formValidate.cateIds.join(',');
            this.ManyAttrValue.forEach((val, index) => {
              data.push({
                id: val.id,
                stock: val.stock,
                price: val.price,
                expand: val.expand,
                cdkeyId: val.cdkeyId,
              });
            });
            productFreeEditApi({
              attrValue: data,
              id: this.productId,
              cateId: this.formValidate.cateId,
            })
              .then((res) => {
                this.$message.success(this.$t('product.operateSuccess'));
                this.$emit('subSuccess');
                this.loadingBtn = false;
              })
              .catch((res) => {
                this.loadingBtn = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    // 详情
    getInfo() {
      this.fullscreenLoading = true;
      productDetailApi(this.productId)
        .then(async (res) => {
          this.isAttr = true;
          res.attrValueList.forEach((val) => {
            val.stockAdd = 0;
          });
          this.formValidate = {
            attrValueList: res.attrValueList,
            specType: res.specType,
            cateIds: res.cateId.split(','), // 商品分类id
            cateId: res.cateId, // 商品分类id传值
            attrList: res.attrList,
          };

          if (res.specType) {
            this.ManyAttrValue = res.attrValueList;
            this.ManyAttrValue = this.ManyAttrValue.map((item) => {
              return {
                ...item,
                ...JSON.parse(item.attrValue),
              };
            });
            const tmp = {};
            const tmpTab = {};
            this.formValidate.attrList.forEach((o, i) => {
              tmp[o.attributeName] = { title: o.attributeName };
              tmpTab[o.attributeName] = '';
            });
            this.manyTabTit = tmp;
            this.manyTabDate = tmpTab;
            this.formThead = Object.assign({}, this.formThead, tmp);
          } else {
            this.ManyAttrValue = res.attrValueList;
          }
          //await this.getData(res, 'add');
          this.fullscreenLoading = false;
        })
        .catch((res) => {
          this.fullscreenLoading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-table__cell:first-child .cell,
::v-deep .el-table__cell:last-child .cell {
  padding-left: 20px !important;
  padding-right: 20px !important;
}
::v-deep .tabNumWidth {
  .el-form-item {
    margin-bottom: 0 !important;
  }
}
::v-deep .el-table__cell {
  padding: 0 !important;
}
.pictrue {
  border: none;
}
</style>
