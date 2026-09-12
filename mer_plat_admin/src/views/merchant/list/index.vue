<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:merchant:page:list']"
    >
      <div class="padding-add">
        <el-form size="small" label-position="right" inline @submit.native.prevent>
          <el-form-item :label="$t('merchant.selectTimeLabel')">
            <el-date-picker
              v-model="timeVal"
              size="small"
              type="daterange"
              :placeholder="$t('user.chooseDate')"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              range-separator="-"
              :start-placeholder="$t('product.startDate')"
              :end-placeholder="$t('product.endDate')"
              @change="onchangeTime"
              class="selWidth"
            />
          </el-form-item>
          <el-form-item :label="$t('product.merchantNameLabel')">
            <el-input
              v-model.trim="keywords"
              @keyup.enter.native="getList(1)"
              size="small"
              :placeholder="$t('merchant.pleaseEnterMerchantName')"
              class="selWidth"
            />
          </el-form-item>
          <el-form-item :label="$t('merchant.merchantTypeLabel')">
            <el-select v-model.trim="tableFrom.isSelf" clearable size="small" :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option :label="$t('product.selfOperated')" value="1" />
              <el-option :label="$t('product.notSelfOperated')" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('merchant.merchantCategoryLabel')">
            <el-select v-model="tableFrom.categoryId" clearable size="small" :placeholder="$t('el.select.placeholder')" class="selWidth">
              <el-option v-for="item in merchantClassify" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('merchant.storeTypeLabel')">
            <el-select v-model="tableFrom.typeId" clearable :placeholder="$t('el.select.placeholder')" size="small" class="selWidth">
              <el-option v-for="item in merchantType" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getList(1), getHeadNum()">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="reset">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '0 20px 20px' }" shadow="never" :bordered="false">
      <el-tabs
        class="list-tabs"
        v-if="headeNum.length > 0"
        v-model="tableFrom.isSwitch"
        @tab-click="getList(1), getHeadNum()"
      >
        <el-tab-pane
          v-for="(item, index) in headeNum"
          :key="index"
          :name="item.type.toString()"
          :label="$t(item.titleKey) + '(' + item.count + ')'"
        />
      </el-tabs>
      <el-button size="small" type="primary" v-hasPermi="['platform:merchant:add']" class="mt5" @click="onAdd"
        >{{ $t('merchant.addMerchant') }}
      </el-button>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        highlight-current-row
        class="mt20"
      >
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column :label="$t('product.merchantName')" min-width="180" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ getLocalizedMerchantName(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="realName" :label="$t('merchant.merchantRealName')" min-width="150" />
        <el-table-column :label="$t('merchant.createType')" min-width="120">
          <template slot-scope="scope">
            <span class="spBlock">{{ scope.row.createType | merCreateTypeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" :label="$t('merchant.merchantPhone')" min-width="150" />
        <el-table-column prop="copyProductNum" :label="$t('merchant.thirdPartyCopyCount')" min-width="110" />
        <el-table-column prop="createTime" :label="$t('product.createTime')" min-width="150" />
        <el-table-column prop="status" :label="$t('merchant.enableDisable')" min-width="90" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:merchant:open', 'platform:merchant:close'])"
              v-model="scope.row.isSwitch"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @click.native="onchangeIsClose(scope.row)"
            />
            <div v-else>{{ scope.row.isSwitch ? $t('common.open') : $t('common.close') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('merchant.recommend')" min-width="90" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:merchant:recommend:switch'])"
              v-model="scope.row.isRecommend"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('common.yes')"
              :inactive-text="$t('common.no')"
              @click.native="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.isRecommend ? $t('common.yes') : $t('common.no') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="160" fixed="right">
          <template slot-scope="scope">
            <a @click="handleLoginMer(scope.row.id)" v-hasPermi="['platform:merchant:detail']">{{ $t('common.login') }} </a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handleEdit(scope.row.id, 1, 'info')" v-hasPermi="['platform:merchant:detail']">{{ $t('common.detail') }} </a>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown
              trigger="click"
              v-if="
                checkPermi([
                  'platform:merchant:update:phone',
                  'platform:merchant:update:phone',
                  'platform:merchant:reset:password',
                  'platform:merchant:copy:prodcut:num',
                ])
              "
            >
              <span class="el-dropdown-link"> {{ $t('user.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
              <el-dropdown-menu slot="dropdown" class="icon-arrow-down">
                <el-dropdown-item
                  @click.native="handleEdit(scope.row.id, '', 'edit')"
                  v-if="checkPermi(['platform:merchant:update'])"
                  >{{ $t('common.edit') }}
                </el-dropdown-item>
                <el-dropdown-item
                  @click.native="handleUpdatePhone(scope.row, 1)"
                  v-if="checkPermi(['platform:merchant:update:phone'])"
                  >{{ $t('merchant.modifyPhone') }}
                </el-dropdown-item>
                <el-dropdown-item
                  @click.native="onPassword(scope.row.id)"
                  v-if="checkPermi(['platform:merchant:reset:password'])"
                  >{{ $t('merchant.resetPassword') }}
                </el-dropdown-item>
                <el-dropdown-item
                  @click.native="handleTimes(scope.row, 2)"
                  v-if="checkPermi(['platform:merchant:copy:prodcut:num'])"
                  >{{ $t('merchant.setThirdPartyCopyCount') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="tableFrom.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>

    <el-drawer
      :title="$t('merchant.merchant')"
      size="1000px"
      :visible.sync="dialogVisible"
      :before-close="closeModel"
      :closeOnClickModal="false"
    >
      <creat-merchant
        ref="creatMerchants"
        :merId="merId"
        :key="indexKey"
        :is-disabled="isDisabled"
        :handleType="handleType"
        @getList="getChange"
        @closeModel="closeModel"
        @onChangeEdit="onChangeEdit"
      ></creat-merchant>
    </el-drawer>
    <el-dialog
      :title="$t('merchant.modifyMerchantPhone')"
      :visible.sync="phoneDialogVisible"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form ref="phoneForm" :model="phoneForm" :rules="phoneRules" label-width="120px">
        <el-form-item :label="$t('merchant.merchantPhoneLabel')" prop="phone">
          <el-input v-model.trim="phoneForm.phone" maxlength="11" :placeholder="$t('merchant.pleaseEnterMerchantPhone')" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="phoneDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="formLoading" @click="submitPhone">{{ $t('common.save') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('merchant.modifyCopyProductCount')"
      :visible.sync="copyDialogVisible"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="copyForm" :model="copyForm" :rules="copyRules" label-width="120px">
        <el-form-item :label="$t('merchant.modifyCountTypeLabel')" prop="type">
          <el-radio-group v-model="copyForm.type">
            <el-radio label="add">{{ $t('merchant.increase') }}</el-radio>
            <el-radio label="sub">{{ $t('merchant.decrease') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('merchant.modifyCountLabel')" prop="num">
          <el-input-number v-model="copyForm.num" :min="1" :max="9999" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="copyDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="formLoading" @click="submitCopyNum">{{ $t('common.save') }}</el-button>
      </span>
    </el-dialog>
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
import * as merchant from '@/api/merchant';
import creatMerchant from './creatMerchant';
import { mapGetters } from 'vuex';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { merchantLogin } from '@/api/user';
import { getLocalizedName } from '@/utils/localizedName';

export default {
  name: 'MerchantList',
  components: { creatMerchant },
  data() {
    return {
      dialogVisible: false,
      fromList: this.$constants.fromList,
      isChecked: false,
      listLoading: false,
      headeNum: [
        {
          count: '',
          type: '1',
          titleKey: 'merchant.normalEnabledMerchant',
        },
        {
          count: '',
          type: '0',
          titleKey: 'merchant.closedMerchant',
        },
      ],
      tableData: {
        data: [],
        total: 0,
      },
      tableFrom: {
        page: 1,
        limit: 20,
        dateLimit: '',
        isSwitch: '1',
        keywords: '',
        isSelf: '',
        categoryId: '',
        typeId: '',
      },
      keywords: '',
      autoUpdate: true,
      timeVal: [],
      merId: 0,
      keyNum: 0,
      isDisabled: false,
      indexKey: 0,
      handleType: '', //操作类型，编辑、详情
      phoneDialogVisible: false,
      copyDialogVisible: false,
      formLoading: false,
      phoneForm: { phone: '' },
      copyForm: { type: 'add', num: 1 },
    };
  },
  computed: {
    ...mapGetters(['merchantClassify', 'merchantType']),
    phoneRules() {
      return {
        phone: [{ required: true, message: this.$t('merchant.pleaseEnterMerchantPhone'), trigger: 'blur' }],
      };
    },
    copyRules() {
      return {
        type: [{ required: true, message: this.$t('merchant.modifyCountTypeLabel'), trigger: 'change' }],
        num: [{ required: true, message: this.$t('merchant.modifyCountLabel'), trigger: 'change' }],
      };
    },
    currentLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
  },
  mounted() {
    if (!this.merchantClassify.length) this.$store.dispatch('merchant/getMerchantClassify');
    if (!this.merchantType.length) this.$store.dispatch('merchant/getMerchantType');
    if (checkPermi(['platform:merchant:list:header:num'])) this.getHeadNum();
    if (checkPermi(['platform:merchant:page:list'])) this.getList('');
  },
  methods: {
    checkPermi,
    getLocalizedMerchantName(row) {
      return getLocalizedName(row, this.currentLocale);
    },
    //详情中点击编辑按钮
    onChangeEdit() {
      this.isDisabled = !this.isDisabled;
    },
    /**
     *  选择时间
     */
    selectChange(tab) {
      this.tableFrom.dateLimit = tab;
      this.timeVal = [];
      this.tableData.data = [];
      this.getList(1);
      this.getHeadNum();
    },
    /**
     *  具体日期
     */
    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.dateLimit = this.timeVal ? this.timeVal.join(',') : '';
      this.getList(1);
      this.getHeadNum();
    },
    /**
     *  获取开启商户数
     */
    getHeadNum() {
      const data = { ...this.tableFrom };
      delete data.page;
      delete data.limit;
      delete data.isSwitch;
      merchant
        .merHeaderNumApi(data)
        .then((res) => {
          this.headeNum[0]['count'] = res.openNum;
          this.headeNum[1]['count'] = res.closeNum;
        })
        .catch((res) => {});
    },
    /**
     *  列表
     */
    getList(num) {
      this.listLoading = true;
      this.tableFrom.keywords = encodeURIComponent(this.keywords);
      this.tableFrom.page = num ? num : this.tableFrom.page;
      merchant
        .merchantListApi({
          page: this.tableFrom.page,
          limit: this.tableFrom.limit,
          dateLimit: this.tableFrom.dateLimit,
          isSwitch: this.tableFrom.isSwitch,
          keywords: this.tableFrom.keywords,
          isSelf: this.tableFrom.isSelf,
          categoryId: this.tableFrom.categoryId,
          typeId: this.tableFrom.typeId,
        })
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((res) => {
          this.listLoading = false;
          this.$message.error(res.message);
        });
    },
    reset() {
      this.timeVal = [];
      this.tableFrom.dateLimit = '';
      this.tableFrom.isSelf = '';
      this.tableFrom.categoryId = '';
      this.tableFrom.typeId = '';
      this.tableFrom.keywords = '';
      this.keywords = '';
      this.getHeadNum();
      this.getList(1);
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList('');
      this.getHeadNum();
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList(1);
      this.getHeadNum();
    },
    /**
     *  修改状态
     */
    onchangeIsShow(row) {
      if (this.tableFrom.isSwitch === '0') return;
      row.isRecommend = !row.isRecommend;
      const title = !row.isRecommend ? this.$t('merchant.enableRecommendConfirm') : this.$t('merchant.disableRecommendConfirm');
      this.$modalSure(title).then(() => {
        merchant.merchantSwitchApi(row.id).then((res) => {
          row.isRecommend = !row.isRecommend;
          this.$message.success(this.$t('merchant.toggleRecommendSuccess'));
        });
      });
    },
    /**
     *  开启关闭
     */
    onchangeIsClose(row) {
      !row.isSwitch
        ? merchant.merchantCloseApi(row.id).then(() => {
            this.$message.success(this.$t('merchant.closeSuccess'));
            this.tableFrom.isSwitch = '1';
            this.getHeadNum();
            this.getList('');
          })
        : merchant.merchantOpenApi(row.id).then(() => {
            this.$message.success(this.$t('merchant.openSuccess'));
            this.tableFrom.isSwitch = '0';
            this.getHeadNum();
            this.getList('');
          });
    },
    getChange() {
      this.getHeadNum();
      this.getList(1);
      this.closeModel();
    },
    closeModel() {
      this.dialogVisible = false;
    },
    /**
     *  添加
     */
    onAdd() {
      this.dialogVisible = true;
      this.isDisabled = false;
      this.indexKey = Math.random();
      this.merId = 0;
    },
    /**
     * 登录商户
     * @param id 商户id
     */
    handleLoginMer(id) {
      merchantLogin(id).then((res) => {
        window.open(
          `https://${res.merSiteUrl}/dashboard?token=${res.token}&account=${res.account}&isSms=${res.isSms}&leftSquareLogo=${res.leftSquareLogo}&leftTopLogo=${res.leftTopLogo}&realName=${res.realName}`,
        );
      });
    },
    /**
     *  编辑
     */
    handleEdit(id, n, type) {
      this.dialogVisible = true;
      this.merId = id;
      this.indexKey = Math.random();
      this.handleType = type;
      n ? (this.isDisabled = true) : (this.isDisabled = false);
    },
    /**
     *  修改手机号
     */
    handleUpdatePhone(row) {
      this.merId = row.id;
      this.phoneForm = { phone: row.phone || '' };
      this.phoneDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.phoneForm && this.$refs.phoneForm.clearValidate();
      });
    },
    handleTimes(row) {
      this.merId = row.id;
      this.copyForm = { type: 'add', num: 1 };
      this.copyDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.copyForm && this.$refs.copyForm.clearValidate();
      });
    },
    submitPhone() {
      this.$refs.phoneForm.validate((valid) => {
        if (!valid) return;
        this.formLoading = true;
        merchant
          .merchantupdatePhoneApi({ id: this.merId, phone: this.phoneForm.phone })
          .then(() => {
            this.$message.success(this.$t('product.operateSuccess'));
            this.phoneDialogVisible = false;
            this.getList(1);
          })
          .finally(() => {
            this.formLoading = false;
          });
      });
    },
    submitCopyNum() {
      this.$refs.copyForm.validate((valid) => {
        if (!valid) return;
        this.formLoading = true;
        merchant
          .merchantCopyNumApi({ id: this.merId, type: this.copyForm.type, num: this.copyForm.num })
          .then(() => {
            this.$message.success(this.$t('product.operateSuccess'));
            this.copyDialogVisible = false;
            this.getList(1);
          })
          .finally(() => {
            this.formLoading = false;
          });
      });
    },
    // 修改密码表单
    onPassword(id) {
      this.merId = id;
      this.$modalSure(this.$t('merchant.resetPasswordConfirm')).then(() => {
        merchant.merRsetPasswordApi(id).then((res) => {
          this.$message.success(this.$t('merchant.resetPasswordSuccess'));
        });
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-range-editor.is-active:hover {
  border-color: #409eff !important;
}

.demo-table-expand label {
  width: 90px;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.icon-arrow-down {
  ::v-deep .el-dropdown-menu__item {
    font-size: 12px;
  }
}

::v-deep .el-col-12 {
  width: 100% !important;
}
</style>
