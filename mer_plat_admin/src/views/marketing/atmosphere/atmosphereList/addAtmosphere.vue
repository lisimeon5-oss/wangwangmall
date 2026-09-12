<template>
  <div class="divBox">
    <pages-header
      ref="pageHeader"
      :title="pageTitle"
      :backUrl="activityTpye === 1 ? '/marketing/atmosphere/list' : '/marketing/border/list'"
    ></pages-header>
    <el-card class="box-card mb20 mt20" :body-style="{ padding: '0 20px 20px' }" :bordered="false" shadow="never">
      <el-tabs
        v-if="tabList.length > 0"
        :key="'atmosphere-tabs-' + ($i18n.locale || '')"
        class="list-tabs"
        v-model="currentTab"
        @tab-click="onChangeType('formValidate')"
      >
        <el-tab-pane v-for="(item, index) in tabList" :key="index" :name="item.value" :label="item.title" />
      </el-tabs>
      <el-form
        :key="'atmosphere-form-' + ($i18n.locale || '')"
        ref="formValidate"
        v-loading="fullscreenLoading"
        class="formValidate mt25"
        :rules="ruleValidate"
        :model="formValidate"
        label-width="120px"
        @submit.native.prevent
      >
        <div v-show="currentTab == 1">
          <el-form-item :label="$t('marketing.activityNameLabel')" prop="name">
            <div class="lang-name-switch selWidth">
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
                :placeholder="$t('marketing.pleaseEnterActivityName')"
              />
              <el-input
                v-else
                v-model.trim="nameJsonForm[activeLang]"
                size="small"
                class="lang-name-input"
                :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
              />
            </div>
          </el-form-item>
          <el-form-item :label="$t('marketing.activityTimeLabel')" prop="timeVal">
            <el-date-picker
              class="mb10 selWidth"
              v-model="formValidate.timeVal"
              :default-time="['00:00:00', '23:59:59']"
              type="datetimerange"
              :range-separator="$t('marketing.to')"
              value-format="yyyy-MM-dd HH:mm:ss"
              :start-placeholder="$t('product.startDate')"
              :picker-options="pickerOptions"
              :end-placeholder="$t('product.endDate')"
              @change="onchangeTime"
            >
            </el-date-picker>
            <p class="desc">{{ $t('marketing.setActivityDisplayTimeTip', { name: activityTpye === 1 ? $t('marketing.atmosphereImage') : $t('marketing.border') }) }}</p>
          </el-form-item>
          <el-form-item :label="activityTpye === 1 ? $t('marketing.activityAtmosphereImageLabel') : $t('marketing.activityBorderLabel')" prop="style">
            <div class="upLoadPicBox mb10" @click="modalPicTap(false)">
              <div v-if="formValidate.style" class="pictrue"><img :src="formValidate.style" /></div>
              <div v-else class="upLoad">
                <i class="el-icon-camera cameraIconfont" />
              </div>
            </div>
            <p class="desc">{{ activityTpye === 1 ? '750*100px' : '750*750px' }}</p>
          </el-form-item>
          <el-form-item :label="$t('merchant.enableLabel')">
            <el-switch
              :width="56"
              v-model="formValidate.status"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
            />
          </el-form-item>
        </div>
        <div v-show="currentTab == 2">
          <el-form-item label-width="0">
            <el-radio-group v-model="formValidate.method">
              <el-radio :label="0">{{ $t('product.allProductsParticipate') }}</el-radio>
              <el-radio :label="1">{{ $t('product.specifiedProductParticipation') }}</el-radio>
              <el-radio :label="2">{{ $t('product.specifiedBrandParticipation') }}</el-radio>
              <el-radio :label="3">{{ $t('product.specifiedCategoryParticipation') }}</el-radio>
              <el-radio :label="4">{{ $t('product.specifiedMerchantParticipation') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="formValidate.method == 1" label-width="0">
            <el-button size="small" type="primary" @click="addGoods">{{ $t('marketing.addProduct') }}</el-button>
            <el-button size="small" @click="batchDel" :disabled="!multipleSelection.length">{{ $t('product.batchDelete') }}</el-button>
          </el-form-item>
          <el-form-item v-if="formValidate.method == 1" label-width="0">
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
            v-if="formValidate.method == 2"
            :label="$t('marketing.selectBrandLabel')"
            :span="24"
            label-width="100px"
            prop="proBrandList"
          >
            <el-select
              class="selWidth"
              clearable
              filterable
              v-model="formValidate.proBrandList"
              :loading="loading"
              remote
              multiple
              :placeholder="$t('videoChannel.pleaseSelectBrand')"
            >
              <el-option v-for="(v, i) in productBrand" :key="i" :label="v.name" :value="v.id" :disabled="!v.isShow">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="formValidate.method == 3"
            :label="$t('marketing.selectCategoryLabel')"
            :span="24"
            label-width="100px"
            prop="proCategorylist"
          >
            <el-cascader
              v-model="formValidate.proCategorylist"
              class="selWidth"
              :props="props"
              :options="merPlatProductClassify"
              filterable
              placeholder=""
              :show-all-levels="false"
              clearable
            />
          </el-form-item>
          <el-form-item
            :label="$t('marketing.selectMerchantLabel')"
            v-hasPermi="['platform:merchant:page:list']"
            v-if="formValidate.method == 4"
            :span="24"
            label-width="100px"
            prop="merIds"
          >
            <merchant-name
              @getMerId="getMerId"
              :multiple="multiple"
              :merIdChecked="formValidate.merIds"
            ></merchant-name>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
    <el-card class="fixed-card" :bordered="false" shadow="never">
      <el-button v-show="currentTab == 1" size="small" type="primary" @click="submitForm('formValidate', 1)"
        >{{ $t('product.nextStep') }}</el-button
      >
      <el-button v-show="currentTab == 2" size="small" @click="currentTab = '1'" class="priamry_border"
        >{{ $t('product.previousStep') }}</el-button
      >
      <el-button v-show="currentTab == 2" size="small" type="primary" @click="submitForm('formValidate', 2)"
        >{{ $t('common.save') }}</el-button
      >
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
import { atuosphereUpdateApi, selectProductList, createAtuosphere } from '@/api/marketing';
import { merCategoryListApi } from '@/api/merchant';
import { productListbyidsApi } from '@/api/product';
import { mapGetters } from 'vuex';
import merchantName from '@/components/merUseCategory';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'addAtmosphere',
  components: { merchantName },
  directives: {
    // 计算是否滚动到最下面
    selectLoadMore: {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        SELECTWRAP_DOM.addEventListener(
          'scroll',
          function () {
            if (this.scrollHeight - this.scrollTop < this.clientHeight + 1) {
              binding.value();
            }
          },
          { passive: true },
        );
      },
    },
  },
  data() {
    return {
      multiple: true,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7 || time.getTime() > Date.now() + 600 * 8.64e7; //限制未来时间
        },
      },
      props: {
        value: 'id',
        label: 'name',
        children: 'childList',
        expandTrigger: 'hover',
        checkStrictly: false,
        multiple: true,
        emitPath: false,
      },
      currentTab: '1',
      fullscreenLoading: false,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      formValidate: {
        name: '',
        nameJson: '',
        starttime: '',
        endtime: '',
        style: '',
        status: 0,
        method: 0,
        products: null,
        proBrandList: [],
        proCategorylist: [],
        merIds: [],
        type: null,
        timeVal: [],
        id: null,
      },

      listLoading: false,
      selectGoods: false,
      multipleSelection: [],
      merSelect: [],
      tableData: {
        data: [],
        total: 0,
      },
      options: [
        {
          value: 'all',
          label: 'all',
        },
        {
          value: 'one',
          label: 'one',
        },
      ],
      tableFrom: {
        page: 1,
        limit: 20,
        spu_ids: [],
      },
      ids: [],
      search: {
        limit: 10,
        page: 1,
      },
      brandList: [],
      loading: false,
      tempRoute: {},
    };
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route);
  },
  computed: {
    ...mapGetters(['merPlatProductClassify', 'productBrand']),
    isEdit() {
      return this.$route.params.id ? true : false;
    },
    activityTpye() {
      return this.$route.path.indexOf('border') !== -1 ? 0 : 1;
    },
    pageTitle() {
      if (this.activityTpye === 1) {
        return this.isEdit ? this.$t('marketing.editAtmosphereImage') : this.$t('marketing.addAtmosphereImage');
      }
      return this.isEdit ? this.$t('marketing.editActivityBorder') : this.$t('marketing.addActivityBorder');
    },
    tabList() {
      return [
        { value: '1', title: this.$t('product.basicSetting') },
        { value: '2', title: this.$t('product.usageScope') },
      ];
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    ruleValidate() {
      return {
        name: [{
          required: true,
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('marketing.pleaseEnterActivityName')));
          },
          trigger: 'blur',
        }],
        style: [{ required: true, message: this.$t('systemSetting.pleaseSelectImage'), trigger: 'blur' }],
        proBrandList: [{ type: 'array', required: true, message: this.$t('marketing.pleaseSelectAtLeastOneBrand'), trigger: 'change' }],
        proCategorylist: [{ type: 'array', required: true, message: this.$t('marketing.pleaseSelectAtLeastOneCategory'), trigger: 'change' }],
        merIds: [{ type: 'array', required: true, message: this.$t('marketing.pleaseSelectAtLeastOneMerchant'), trigger: 'change' }],
        timeVal: [{ type: 'array', required: true, message: this.$t('marketing.pleaseSelectTimeRange'), trigger: 'change' }],
      };
    },
  },
  mounted() {
    this.getLanguageList();
    if (!localStorage.getItem('merPlatProductClassify')) this.$store.dispatch('product/getAdminProductClassify');
    if (!localStorage.getItem('productBrand')) this.$store.dispatch('product/getMerProductBrand');
    if (this.$route.params.id) {
      this.setTagsViewTitle();
      this.getInfo(this.$route.params.id);
    }
    this.getMerchantList();
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
          this.nameJsonForm = this.parseNameJson(this.formValidate && this.formValidate.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.formValidate && this.formValidate.nameJson);
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
        // 解析失败时保持为空
      }
      return form;
    },
    buildNameJson() {
      return buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, pickFormName(this));
    },
    // 点击选项
    onChangeType(formName) {
      //this.$refs[formName].resetFields();
    },
    // 根据id查询商品列表，编辑时用
    async getproductListbyids() {
      let data = this.formValidate.products.slice(0).split(',');
      this.tableData.data = await productListbyidsApi({ ids: data });
    },
    // 获取商户id
    getMerId(id) {
      this.formValidate.merIds = id;
    },
    // 活动时间
    onchangeTime(e) {
      this.$set(this.formValidate, 'timeVal', e);
      this.formValidate.starttime = e ? e[0] : '';
      this.formValidate.endtime = e ? e[1] : '';
    },
    //上传图片
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.formValidate.style = img[0].sattDir;
          if (_this.formValidate.style) _this.$refs.formValidate.clearValidate(['style']);
        },
        multiple,
        'activitystyle',
      );
    },
    setTagsViewTitle() {
      const title = this.activityTpye === 1 ? this.$t('marketing.editAtmosphereImage') : this.$t('marketing.editActivityBorder');
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.$route.params.id}`,
      });
      this.$store.dispatch('tagsView/updateVisitedView', route);
    },
    // 商户列表；
    getMerchantList() {
      merCategoryListApi().then((res) => {
        this.merSelect = res;
      });
    },
    // 氛围图详情
    getInfo(id) {
      this.fullscreenLoading = true;
      let data = JSON.parse(localStorage.getItem('activitystyle'));
      let info = JSON.parse(JSON.stringify(data));
      this.formValidate.id = info.id;
      this.formValidate.starttime = info.starttime;
      this.formValidate.endtime = info.endtime;
      this.formValidate.style = info.style;
      this.formValidate.status = info.status;
      this.formValidate.method = info.method;
      this.formValidate.name = info.name;
      this.formValidate.nameJson = info.nameJson || '';
      this.nameJsonForm = this.parseNameJson(this.formValidate.nameJson);
      this.activeLang = resolveFormActiveLang(this);
      this.formValidate.products = info.products;
      this.formValidate.type = this.activityTpye;
      this.formValidate.timeVal = [info.starttime, info.endtime];
      if (info.method === 1) this.getproductListbyids();
      switch (info.method) {
        case 0:
          this.formValidate.products = '';
          break;
        case 1:
          this.formValidate.products = '';
          break;
        case 2:
          this.formValidate.proBrandList = info.products.split(',').map((item) => item * 1);
          break;
        case 3:
          this.formValidate.proCategorylist = info.products.split(',').map((item) => item * 1);
          break;
        default:
          this.formValidate.merIds = info.products.split(',').map((item) => item * 1);
          break;
      }
      this.fullscreenLoading = false;
      this.fullscreenLoading = false;
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
    getList(num) {
      this.tableFrom.page = num || this.tableFrom.page;
      selectProductList({
        spu_ids: this.tableFrom.spu_ids.toString(),
        page: this.tableFrom.page,
        limit: this.tableFrom.limit,
      })
        .then((res) => {
          this.tableData.data = res.data.list;
          this.tableData.total = res.data.count;
          if (this.selectAllPage == 'all') {
            this.multipleSelection.push(...this.tableData.data);
            this.multipleSelection.forEach((row) => {
              this.$refs.tableList.toggleRowSelection(row, true);
            });
          }

          this.listLoading = false;
        })
        .catch((res) => {
          this.$message.error(res.message);
          this.listLoading = false;
        });
    },
    //行删除
    handleDelete(index, row) {
      this.$modalSure(this.$t('product.deleteThisProductConfirm')).then(() => {
        this.tableData.data.splice(index, 1);
      });
    },
    //批量删除
    batchDel() {
      this.$modalSure(this.$t('product.batchDeleteProductConfirm')).then(() => {
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
    submitForm(formName, num) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (num === 1) {
            this.currentTab = '2';
          } else {
            switch (this.formValidate.method) {
              case 0:
                this.formValidate.products = '';
                break;
              case 1:
                if (!this.tableData.data.length) return this.$message.error(this.$t('product.pleaseSelectAtLeastOneProduct'));
                let data = [];
                this.tableData.data.map((item) => data.push(item.id));
                this.formValidate.products = data.toString();
                break;
              case 2:
                this.formValidate.products = this.formValidate.proBrandList.toString();
                break;
              case 3:
                this.formValidate.products = this.formValidate.proCategorylist.toString();
                break;
              default:
                this.formValidate.products = this.formValidate.merIds.toString();
                break;
            }
            this.formValidate.type = this.activityTpye;
            this.formValidate.nameJson = this.buildNameJson();
            if (this.formValidate.style == '') return this.$message.error(this.$t('systemSetting.pleaseUploadAtmosphereImage'));
            if (this.isEdit) this.formValidate.id = this.$route.params.id;
            this.isEdit
              ? atuosphereUpdateApi(this.formValidate).then((res) => {
                  this.$message.success(this.$t('product.editSuccess'));
                  this.$router.push({
                    path: this.activityTpye === 1 ? '/marketing/atmosphere/list' : '/marketing/border/list',
                  });
                })
              : createAtuosphere(this.formValidate).then((res) => {
                  this.$message.success(this.$t('product.addSuccess'));
                  this.$router.push({
                    path: this.activityTpye === 1 ? '/marketing/atmosphere/list' : '/marketing/border/list',
                  });
                });
          }
        } else {
          return false;
        }
      });
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList('');
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList('');
    },
  },
};
</script>

<style lang="scss" scoped>
.desc {
  color: #999;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
}

::v-deep.el-input__suffix {
  right: 10px;
  line-height: 32px;
}

.selWidth {
  width: 460px !important;
}
.lang-name-switch {
  width: 460px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.lang-name-input {
  margin-top: 10px;
}
</style>
