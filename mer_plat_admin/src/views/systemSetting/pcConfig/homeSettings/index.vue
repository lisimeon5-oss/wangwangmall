<template>
  <div class="divBox">
    <el-card class="box-card mb20" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs class="list-tabs" v-model="currentTab">
        <el-tab-pane v-for="(item, index) in tabList" :key="index" :name="item.value" :label="item.title" />
      </el-tabs>
      <!-- 首页广告-->
      <template v-if="currentTab === '0'">
        <FromList :configObj="advertisementlistConfig"></FromList>
        <el-button
          v-hasPermi="['platform:pc:shopping:home:advertisement:edit']"
          type="primary"
          @click="handleAdvertisementSave"
          >{{ loadingBtn ? $t('finance.submitting') : $t('common.save') }}</el-button
        >
      </template>
      <!-- 首页banner-->
      <template v-if="currentTab === '1'">
        <FromList :configObj="bannerListConfig"></FromList>
        <el-button v-hasPermi="['platform:pc:shopping:home:banner:save']" type="primary" @click="handleBannerSave">{{
          loadingBtn ? $t('finance.submitting') : $t('common.save')
        }}</el-button>
      </template>
      <!-- 首页推荐-->
      <template v-if="currentTab === '2'">
        <el-button
          v-hasPermi="['platform:pc:shopping:home:recommended:add']"
          :disabled="tableData.data.length >= 10"
          type="primary"
          size="small"
          class="mb20"
          @click="handleAdd"
          >{{ $t('systemSetting.addSection') }}</el-button
        >
        <el-table
          v-loading="listLoading"
          :data="tableData.data"
          style="width: 100%"
          size="small"
          row-key="brand_id"
          :default-expand-all="false"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="id" label="ID" min-width="60" />
          <el-table-column :label="$t('systemSetting.sectionName')" min-width="150">
            <template slot-scope="scope">{{ localizedSectionName(scope.row) }}</template>
          </el-table-column>
          <el-table-column prop="sort" :label="$t('product.sort')" min-width="50" />
          <el-table-column prop="status" :label="$t('product.isShow')" min-width="100" fixed="right">
            <template slot-scope="scope">
              <el-switch
                v-if="checkPermi(['platform:pc:shopping:home:recommended:switch'])"
                v-model="scope.row.status"
                :active-value="true"
                :inactive-value="false"
                :active-text="$t('common.show')"
                :inactive-text="$t('menu.hide')"
                @change="onchangeIsShow(scope.row)"
              />
              <div v-else>{{ scope.row.status ? $t('common.show') : $t('menu.hide') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.operate')" width="120" fixed="right">
            <template slot-scope="scope">
              <a v-hasPermi="['platform:pc:shopping:home:recommended:edit']" @click="handleEdit(scope.row)">{{ $t('common.edit') }}</a>
              <el-divider direction="vertical"></el-divider>
              <a
                v-hasPermi="['platform:pc:shopping:home:recommended:delete']"
                @click="handleDelete(scope.row.id, scope.$index)"
                >{{ $t('common.delete') }}</a
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 顶部菜单-->
      <template v-if="currentTab === '3'">
        <FromList :configObj="menuListConfig"></FromList>
        <el-button v-hasPermi="['platform:pc:shopping:home:navigation:save']" type="primary" @click="handleMenuSave">{{
          loadingBtn ? $t('finance.submitting') : $t('common.save')
        }}</el-button>
      </template>
    </el-card>

    <!--添加首页推荐模板-->
    <el-drawer size="1000px" :visible.sync="drawer" direction="rtl" class="showHeader" :before-close="handleClose">
      <div slot="title" class="demo-drawer_title">{{ dataForm.id ? $t('systemSetting.editRecommendSection') : $t('systemSetting.addRecommendSection') }}</div>
      <div v-if="drawer" class="demo-drawer__content detailSection">
        <el-form
          ref="dataForm"
          v-loading="fullscreenLoading"
          class="dataForm mt20"
          :rules="ruleValidate"
          :model="dataForm"
          label-width="120px"
          @submit.native.prevent
        >
          <el-form-item :label="$t('systemSetting.sectionNameLabel')" prop="name">
            <div class="lang-name-switch from-ipt-width">
              <el-radio-group v-model="activeLang" size="small">
                <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                  {{ lang.label }}
                </el-radio-button>
              </el-radio-group>
              <el-input
                v-if="activeLang === defaultLangCode"
                v-model.trim="dataForm.name"
                maxlength="6"
                size="small"
                :placeholder="$t('systemSetting.pleaseEnterSectionName')"
              />
              <el-input
                v-else
                v-model.trim="nameJsonForm[activeLang]"
                maxlength="6"
                size="small"
                :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
              />
            </div>
          </el-form-item>
          <el-form-item :label="$t('systemSetting.adImageLinkLabel')">
            <el-input v-model="dataForm.linkUrl" size="small" class="from-ipt-width" :placeholder="$t('systemSetting.pleaseEnterAdImageLink')" />
          </el-form-item>
          <el-form-item :label="$t('systemSetting.adImageLabel')" prop="imageUrl">
            <div class="upLoadPicBox" @click="modalPicTap(false, 'dan')">
              <div v-if="dataForm.imageUrl" class="pictrue"><img :src="dataForm.imageUrl" /></div>
              <div v-else class="upLoad">
                <i class="el-icon-camera cameraIconfont" />
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('product.sortLabel')">
            <el-input-number
              v-model.trim="dataForm.sort"
              :min="0"
              :max="99"
              :step="1"
              step-strictly
              :label="$t('product.sort')"
            ></el-input-number>
          </el-form-item>
          <el-form-item :label="$t('merchant.enableLabel')">
            <el-switch
              :width="56"
              v-model="dataForm.status"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
            />
          </el-form-item>
          <el-form-item :label="$t('systemSetting.selectProductLabel')" prop="playType">
            <el-radio-group v-model="dataForm.playType" @input="handlePlayTypeChange">
              <el-radio label="product">{{ $t('product.specifiedProductParticipation') }}</el-radio>
              <el-radio label="brand">{{ $t('product.specifiedBrandParticipation') }}</el-radio>
              <el-radio label="category">{{ $t('product.specifiedCategoryParticipation') }}</el-radio>
              <el-radio label="merchant">{{ $t('product.specifiedMerchantParticipation') }}</el-radio>
            </el-radio-group>
            <product-association-form
              :productAssociationType="dataForm.playType"
              :formValidate="dataForm"
              :multipleBrand="false"
              :multipleCategory="false"
              :isBatchDelete="false"
              :multipleMer="multipleMer"
              class="mt20"
              @getProductAssociationData="getProductAssociationData"
            ></product-association-form>
          </el-form-item>
          <el-form-item class="btn">
            <div>
              <div class="acea-row justify-content">
                <el-button
                  type="primary"
                  v-debounceClick="
                    () => {
                      handleRecommendedSave('dataForm');
                    }
                  "
                  >{{ loadingBtn ? $t('finance.submitting') : $t('common.save') }}</el-button
                >
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import FromList from '@/components/FromList';
import productAssociationForm from '@/components/productAssociationForm';
import {
  pcRecommendedAddApi,
  pcRecommendedDeleteApi,
  pcRecommendedEditApi,
  pcRecommendedListApi,
  pcRecommendedSwitchApi,
  pcHomeBannerSaveApi,
  pcHomeBannerGetApi,
  pcHomeAdvertisementEditApi,
  pcHomeAdvertisementGetApi,
  pcHomeNavigationSaveApi,
  pcHomeNavigationGetApi,
} from '@/api/systemPcConfig';
import { mapGetters } from 'vuex';
import { checkPermi } from '@/utils/permission';
import { advertisementDefault, bannerDefault, menuDefault } from '@/views/systemSetting/pcConfig/defaultPcConfig';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  buildI18nNameJson,
  getLocalizedName,
  getUiLocale,
  hasI18nNameContent,
  pickFormName,
  resolveFormActiveLang,
} from '@/utils/localizedName';
const fromData = {
  imageUrl: '',
  name: '',
  nameJson: '',
  playType: 'product',
  sort: 0,
  status: false,
  data: '',
  id: 0,
  linkUrl: '',
  merIds: null,
  proBrandList: [],
  proCategorylist: [],
};
export default {
  name: 'homeSettings',
  components: { productAssociationForm, FromList },
  data() {
    // 自定义组件校验规则
    let validatePlayTypeAndPlayProducts = (rule, value, callback) => {
      if (value === '' || this.dataForm.playProducts.length === 0) {
        callback(new Error(this.$t('product.pleaseSelectParticipationType')));
      } else {
        callback();
      }
    };
    return {
      currentTab: '0',
      tabList: [
        { value: '0', title: this.$t('systemSetting.homeAd') },
        { value: '1', title: this.$t('systemSetting.homeBanner') },
        { value: '2', title: this.$t('systemSetting.homeRecommend') },
        { value: '3', title: this.$t('systemSetting.topMenu') },
      ],
      drawer: false,
      fullscreenLoading: false,
      ruleValidate: {
        name: [{
          required: true,
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(this.dataForm.name, this.nameJsonForm)) callback();
            else callback(new Error(this.$t('systemSetting.pleaseEnterSectionName')));
          },
          trigger: 'blur',
        }],
        imageUrl: [{ required: true, message: this.$t('systemSetting.pleaseSelectImage'), trigger: 'blur' }],
        playType: [
          {
            required: true,
            message: this.$t('systemSetting.pleaseSelectProductAssociationType'),
            trigger: 'blur',
            validator: validatePlayTypeAndPlayProducts,
          },
        ],
      },
      dataForm: Object.assign({}, fromData),
      loadingBtn: false,
      tableData: {
        data: [],
      },
      listLoading: false,
      productData: [], //选中的商品类型值
      // 首页广告语
      advertisementlistConfig: Object.assign({}, advertisementDefault()),
      // banner数据
      bannerListConfig: Object.assign({}, bannerDefault()),
      playValues: null, // 待添加的商品参与类型
      //顶部菜单
      menuListConfig: Object.assign({}, menuDefault()),
      multipleMer: true,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: {},
    };
  },
  mounted() {
    this.getLanguageList();
    // if (this.id > 0) {
    //   this.getRecommendedInfo(this.id);
    // }
    if (checkPermi(['platform:pc:shopping:home:banner:get'])) this.getPcHomeBanner();
    if (checkPermi(['platform:pc:shopping:home:recommended:list'])) this.getList();
    if (checkPermi(['platform:pc:shopping:home:advertisement:get'])) this.getAdvertisement();
    if (checkPermi(['platform:pc:shopping:home:navigation:get'])) this.getPcHomeNavigation();
  },
  computed: {
    ...mapGetters(['merPlatProductClassify', 'productBrand']),
    isEdit() {
      return this.dataForm.id > 0 ? true : false;
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
  },
  methods: {
    checkPermi,
    localizedSectionName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
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
          this.nameJsonForm = this.parseNameJson(this.dataForm && this.dataForm.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.dataForm && this.dataForm.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    //顶部菜单保存
    handleMenuSave() {
      this.menuListConfig.list.map((item, index) => {
        item.sort = index + 1;
      });
      this.loadingBtn = true;
      pcHomeNavigationSaveApi(this.menuListConfig.list)
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getPcHomeNavigation();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    //获取顶部菜单
    getPcHomeNavigation() {
      pcHomeNavigationGetApi().then((res) => {
        this.menuListConfig.list = res;
      });
    },
    //首页推荐模板列表
    getList(num) {
      this.listLoading = true;
      pcRecommendedListApi()
        .then((res) => {
          this.tableData.data = res;
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
        });
    },
    //模板弹窗
    handleClose() {
      //this.$refs['formValidate'].resetFields();
      this.drawer = false;
    },
    //新增模板
    handleAdd() {
      this.dataForm = Object.assign({}, fromData);
      this.nameJsonForm = this.emptyNameJsonForm();
      this.activeLang = resolveFormActiveLang(this);
      this.drawer = true;
      this.loadingBtn = false;
    },
    //模板状态
    onchangeIsShow(row) {
      pcRecommendedSwitchApi(row.id).then((res) => {
        this.$message.success(this.$t('product.operateSuccess'));
        this.getList();
      });
    },
    //编辑首页推荐模板
    handleEdit(row) {
      this.dataForm.id = row.id;
      Object.assign(this.dataForm, row);
      this.nameJsonForm = this.parseNameJson(this.dataForm.nameJson);
      this.activeLang = resolveFormActiveLang(this);

      this.getRecommendedInfo(this.dataForm);
      this.drawer = true;
      this.loadingBtn = false;
    },
    //首页推荐模板数据
    getRecommendedInfo() {
      // 以下两个属性的转换为组件和业务之间的，后期优化选择器统一所有业务数据后再配合后台修改统一优化
      this.dataForm.playType = this.dataForm.productAssociationType;
      this.dataForm.playProducts = this.dataForm.data;
      switch (this.dataForm.playType) {
        case 'product':
          this.dataForm.playProducts = this.dataForm.data;
          break;
        case 'brand':
          this.dataForm.proBrandList = Number(this.dataForm.data);
          break;
        case 'category':
          this.dataForm.proCategorylist = Number(this.dataForm.data);
          break;
        case 'merchant':
          this.dataForm.merIds = this.multipleMer
            ? this.dataForm.data.split(',').map((item) => Number(item))
            : this.dataForm.data ? Number(this.dataForm.data): '';
          break;
      }
    },
    // 删除首页推荐
    handleDelete(id, idx) {
      this.$modalSure(this.$t('systemSetting.deleteModuleConfirm')).then(() => {
        pcRecommendedDeleteApi(id).then((res) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getList();
        });
      });
    },
    //选择商品类型中，商品列表、商户（merchant）选中回调
    getProductAssociationData(res) {
      this.playValues = res;
      this.dataForm.playProducts = this.playValues;
      this.dataForm.merIds = this.playValues;
      this.dataForm.proBrandList = JSON.parse(JSON.stringify(this.playValues));
    },
    //上传图片
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.dataForm.imageUrl = img[0].sattDir;
        },
        multiple,
        'imageUrl',
      );
    },
    //推荐模板保存
    handleRecommendedSave(formName) {
      if (this.playValues) {
        // 如果编辑过数据那么再转换格式
        if (this.dataForm.playType === 'product') {
          this.dataForm.data = this.playValues.map((item) => item.id).join(',');
        } else if (this.dataForm.playType === 'merchant') {
          this.dataForm.data = this.multipleMer
            ? this.playValues.map((item) => item).join(',')
            : this.playValues.toString();
        } else {
          this.dataForm.data = this.playValues;
        }
        this.dataForm.productAssociationType = this.dataForm.playType;
      }
      if (this.dataForm.style == '') return this.$message.error(this.$t('systemSetting.pleaseUploadAtmosphereImage'));
      this.dataForm.nameJson = this.buildNameJson();

      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loadingBtn = true;
          this.isEdit
            ? pcRecommendedEditApi(this.dataForm)
                .then((res) => {
                  this.$message.success(this.$t('product.editSuccess'));
                  this.handleClose();
                  this.getList();
                })
                .catch(() => {
                  this.loadingBtn = false;
                })
            : pcRecommendedAddApi(this.dataForm)
                .then((res) => {
                  this.$message.success(this.$t('product.addSuccess'));
                  this.handleClose();
                  this.getList();
                })
                .catch(() => {
                  this.loadingBtn = false;
                });
        } else {
          return false;
        }
      });
    },
    //广告语数据
    getAdvertisement() {
      pcHomeAdvertisementGetApi().then((res) => {
        this.advertisementlistConfig.list[0].id = res.id;
        this.advertisementlistConfig.list[0].imageUrl = res.imageUrl;
        this.advertisementlistConfig.list[0].linkUrl = res.linkUrl;
        this.advertisementlistConfig.list[0].status = res.status;
      });
    },
    //广告语
    handleAdvertisementSave() {
      this.loadingBtn = true;
      pcHomeAdvertisementEditApi({
        id: this.advertisementlistConfig.list[0].id,
        imageUrl: this.advertisementlistConfig.list[0].imageUrl,
        linkUrl: this.advertisementlistConfig.list[0].linkUrl,
        status: this.advertisementlistConfig.list[0].status,
      })
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getAdvertisement();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    //banner新增
    handleBannerSave() {
      this.bannerListConfig.list.map((item, index) => {
        item.sort = index + 1;
      });
      this.loadingBtn = true;
      pcHomeBannerSaveApi({ bannerList: this.bannerListConfig.list })
        .then((res) => {
          this.$message.success(this.$t('user.saveSuccess'));
          this.loadingBtn = false;
          this.getPcHomeBanner();
        })
        .catch(() => {
          this.loadingBtn = false;
        });
    },
    //banner数据
    getPcHomeBanner() {
      pcHomeBannerGetApi().then((res) => {
        this.bannerListConfig.list = res.bannerList;
      });
    },
    handlePlayTypeChange() {
      this.playValues = '';
      this.dataForm.playProducts = '';
      this.dataForm.data = '';
      this.dataForm.proBrandList = [];
      this.dataForm.proCategorylist = [];
      this.dataForm.merIds = null;
    },
  },
};
</script>
<style scoped lang="scss">
.demo-drawer__content {
  padding: 0 40px;
}
.selWidth {
  width: 500px;
}
.lang-name-switch {
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
}
</style>
