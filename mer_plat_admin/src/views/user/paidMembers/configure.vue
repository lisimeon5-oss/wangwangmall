<template>
  <div class="divBox">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '0 20px' }">
      <el-tabs v-model="activeName" class="list-tabs mb5">
        <el-tab-pane :label="$t('user.baseConfig')" name="first"></el-tab-pane>
        <el-tab-pane :label="$t('user.memberBenefits')" name="second"></el-tab-pane>
        <el-tab-pane :label="$t('user.memberCard')" name="three"></el-tab-pane>
      </el-tabs>
      <div v-if="activeName === 'first'">
        <el-form
          v-hasPermi="['platform:paid:member:base:config:get', 'platform:paid:member:base:config:edit']"
          :model="pram"
          ref="signForm"
          label-width="90px"
          class="demo-ruleForm"
        >
          <el-form-item :label="$t('user.purchaseEntrance')" required>
            <el-switch
              v-model="pram.paidMemberPaidEntrance"
              :active-text="$t('user.on')"
              :inactive-text="$t('user.off')"
              active-value="1"
              inactive-value="0"
            />
            <div class="from-tips">
              {{ $t('user.purchaseEntranceTip') }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('user.memberPrice')" required>
            <el-radio-group v-model="pram.paidMemberPriceDisplay">
              <el-radio label="all">{{ $t('user.allUsersVisible') }}</el-radio>
              <el-radio label="paid">{{ $t('user.paidMembersOnly') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('user.memberExclusive')" required>
            <el-switch
              v-model="pram.paidMemberProductSwitch"
              :active-text="$t('user.on')"
              :inactive-text="$t('user.off')"
              active-value="1"
              inactive-value="0"
            />
            <div class="from-tips">{{ $t('user.memberExclusiveTip') }}</div>
          </el-form-item>
          <el-form-item>
            <el-button
              v-if="checkPermi(['platform:paid:member:base:config:edit'])"
              type="primary"
              v-debounceClick="memberConfigSubmitForm"
              >{{ $t('common.submit') }}</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div v-if="activeName === 'second'">
        <el-table
          :key="activeName"
          ref="table"
          v-loading="listLoading"
          :data="tableData"
          highlight-current-row
          size="small"
          class="mb50"
        >
          <el-table-column prop="id" label="ID" :show-overflow-tooltip="true" width="60"></el-table-column>
          <el-table-column prop="name" :label="$t('user.benefitName')" :show-overflow-tooltip="true" min-width="160">
            <template slot-scope="scope">
              <span>{{ scope.row.name | filterMemberBenefits }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('user.displayName')"
            :show-overflow-tooltip="true"
            min-width="160"
          >
            <template slot-scope="{ row }">{{ getLocalizedBenefitValue(row) }}</template>
          </el-table-column>
          <el-table-column prop="imageUrl" :label="$t('user.benefitIcon')" min-width="160">
            <template slot-scope="scope">
              <div class="demo-image__preview line-heightOne">
                <el-image :src="scope.row.imageUrl" :preview-src-list="[scope.row.imageUrl]" />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('user.benefitIntro')"
            :show-overflow-tooltip="true"
            min-width="160"
          >
            <template slot-scope="{ row }">{{ getLocalizedBenefitMessage(row) }}</template>
          </el-table-column>
          <el-table-column :label="$t('common.status')" min-width="160">
            <template slot-scope="scope">
              <el-switch
                v-if="checkPermi(['platform:paid:member:benefits:switch'])"
                v-model="scope.row.status"
                :active-value="true"
                :inactive-value="false"
                :active-text="$t('user.show')"
                :inactive-text="$t('user.hide')"
                @change="handleStatusChange(scope.row, 'benefits')"
              >
              </el-switch>
              <div v-else>{{ scope.row.status ? $t('user.show') : $t('user.hide') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.operate')" width="160" fixed="right">
            <template slot-scope="scope">
              <a @click="handleCreatBenefits(scope.row)" v-hasPermi="['platform:paid:member:benefits:edit']"
                >{{ $t('user.benefitSetting') }}</a
              >
              <el-divider direction="vertical"></el-divider>
              <a @click="handleCreatExplain(scope.row)" v-hasPermi="['platform:paid:member:benefits:statement:edit']"
                >{{ $t('user.benefitDescription') }}</a
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="activeName === 'three'">
        <el-button size="small" type="primary" @click="handlerCreat()">{{ $t('user.addNew') }}</el-button>
        <el-table
          ref="table"
          v-loading="listLoading"
          :data="tableDataMember"
          highlight-current-row
          size="small"
          class="mb50 mt20"
          :key="activeName"
        >
          <el-table-column prop="id" label="ID" :show-overflow-tooltip="true" width="60"></el-table-column>
          <el-table-column
            :label="$t('user.cardName')"
            :show-overflow-tooltip="true"
            min-width="160"
          >
            <template slot-scope="{ row }">{{ getLocalizedCardName(row) }}</template>
          </el-table-column>
          <el-table-column prop="value" :label="$t('user.cardType')" :show-overflow-tooltip="true" min-width="160">
            <template slot-scope="scope">{{ scope.row.type | filterMemberType }}</template>
          </el-table-column>
          <el-table-column prop="deadlineDay" :label="$t('user.cardTerm')" :show-overflow-tooltip="true" min-width="160">
            <template slot-scope="scope">{{ scope.row.type === 2 ? $t('user.permanent') : scope.row.deadlineDay + $t('user.day') }}</template>
          </el-table-column>
          <el-table-column
            prop="price"
            :label="$t('user.cardPrice')"
            :show-overflow-tooltip="true"
            min-width="160"
          ></el-table-column>
          <el-table-column
            prop="giftBalance"
            :label="$t('user.giftBalance')"
            :show-overflow-tooltip="true"
            min-width="160"
          ></el-table-column>
          <el-table-column
            :label="$t('user.labelText')"
            :show-overflow-tooltip="true"
            min-width="160"
          >
            <template slot-scope="{ row }">{{ getLocalizedCardLabel(row) }}</template>
          </el-table-column>
          <el-table-column :label="$t('common.status')" min-width="160">
            <template slot-scope="scope">
              <el-switch
                v-if="checkPermi(['platform:paid:member:card:switch'])"
                v-model="scope.row.status"
                :active-value="true"
                :inactive-value="false"
                :active-text="$t('user.on')"
                :inactive-text="$t('user.off')"
                @change="handleStatusChange(scope.row, 'card')"
              >
              </el-switch>
              <div v-else>{{ scope.row.status ? $t('user.on') : $t('user.off') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.operate')" width="160" fixed="right">
            <template slot-scope="scope">
              <a @click="handlerCreat(scope.row)" v-hasPermi="['platform:paid:member:card:edit']">{{ $t('common.edit') }}</a>
              <el-divider direction="vertical"></el-divider>
              <a @click="handleDelete(scope.$index, scope.row)" v-hasPermi="['platform:paid:member:card:delete']"
                >{{ $t('common.delete') }}</a
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!--权益设置-->
    <benefits-edit
      ref="benefitsEditRef"
      :drawerVisible="drawerVisible"
      v-if="drawerVisible"
      :pramInfo="pramInfo"
      @onClosedrawerVisible="onClosedrawerVisible"
      @subSuccess="subSuccessBenefits"
    ></benefits-edit>
    <!--权益说明-->
    <explain-creat
      ref="explainCreatRef"
      v-if="drawerVisibleExplain"
      :drawerVisible="drawerVisibleExplain"
      :pramInfo="pramInfo"
      @subSuccess="subSuccessExplain"
      @onClosedrawerVisible="onClosedrawerVisibleExplain"
    ></explain-creat>
    <!--会员卡-->
    <card-creat
      ref="cardCreatRef"
      v-if="drawerVisibleCard"
      :pramInfo="pramInfo"
      :drawerVisible="drawerVisibleCard"
      @onClosedrawerVisible="onClosedrawerVisibleCard"
      @subSuccess="subSuccessCard"
    ></card-creat>
  </div>
</template>
<script>
import {
  memberBenefitsListApi,
  memberBenefitsStatementSwitchApi,
  memberCardDeleteApi,
  memberCardListApi,
  memberCardSwitchApi,
  memberConfigEditApi,
  memberConfigGetApi,
} from '@/api/user';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import Debounce from '@/libs/debounce';
import BenefitsEdit from '../components/benefitsCreat..vue';
import ExplainCreat from '../components/explainCreat.vue';
import CardCreat from '../components/cardCreat.vue';
import { getLocalizedText } from '@/utils/localizedName';
const cardInfo = {
  deadlineDay: 0,
  giftBalance: 0,
  id: 0,
  isFirstChargeGive: false,
  label: '',
  labelJson: '',
  name: '',
  nameJson: '',
  originalPrice: 0,
  price: 0,
  sort: 0,
  status: true,
  type: 0,
};
export default {
  name: 'Configure',
  components: { CardCreat, ExplainCreat, BenefitsEdit },
  data() {
    return {
      activeName: 'first',
      pram: {
        paidMemberPaidEntrance: 1,
        paidMemberPriceDisplay: 'all',
        paidMemberProductSwitch: 1,
      },
      listLoading: false,
      tableData: [], //会员权益列表
      drawerVisible: false, //权益
      pramInfo: null,
      drawerVisibleExplain: false, //权益说明
      tableDataMember: [], //会员卡列表
      drawerVisibleCard: false, //会员卡
    };
  },
  computed: {
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
  watch: {
    activeName: {
      handler(val) {
        if (val === 'second') this.getList();
        if (val === 'three') this.getMemberList();
      },
      deep: true,
      immediate: false,
    },
  },
  mounted() {
    if (checkPermi(['platform:paid:member:base:config:get'])) this.getMemberConfig();
  },
  methods: {
    checkPermi,
    getLocalizedBenefitValue(row) {
      return getLocalizedText(row && row.value, row && row.valueJson, this.currentLocale);
    },
    getLocalizedBenefitMessage(row) {
      return getLocalizedText(row && row.message, row && row.messageJson, this.currentLocale);
    },
    getLocalizedCardName(row) {
      return getLocalizedText(row && row.name, row && row.nameJson, this.currentLocale);
    },
    getLocalizedCardLabel(row) {
      return getLocalizedText(row && row.label, row && row.labelJson, this.currentLocale);
    },
    //基础设置
    memberConfigSubmitForm(formName) {
      memberConfigEditApi(this.pram).then(async (res) => {
        this.$message.success(this.$t('user.submitSuccess'));
        this.getMemberConfig();
      });
    },
    async getMemberConfig() {
      try {
        this.pram = await memberConfigGetApi();
      } catch (e) {}
    },
    //会员卡列表
    async getMemberList() {
      this.listLoading = true;
      try {
        this.tableDataMember = await memberCardListApi();
        this.listLoading = false;
      } catch (e) {
        this.listLoading = false;
      }
    },
    //行删除
    handleDelete(index, row) {
      this.$modalSure(this.$t('user.deleteCardConfirm')).then(async () => {
        try {
          await memberCardDeleteApi(row.id);
          this.$message.success(this.$t('user.deleteSuccess'));
          this.tableDataMember.splice(index, 1);
        } catch (e) {}
      });
    },
    //会员卡关闭
    onClosedrawerVisibleCard() {
      this.drawerVisibleCard = false;
    },
    //会员卡创建
    handlerCreat(row) {
      this.pramInfo = row ? row : Object.assign({}, cardInfo);
      this.drawerVisibleCard = true;
    },
    //会员卡创建成功
    subSuccessCard() {
      this.getMemberList();
      this.onClosedrawerVisibleCard();
    },
    //会员权益列表
    async getList() {
      this.listLoading = true;
      try {
        this.tableData = await memberBenefitsListApi();
        this.listLoading = false;
      } catch (e) {
        this.listLoading = false;
      }
    },
    //会员权益修改状态
    handleStatusChange: Debounce(async function (row, name) {
      try {
        if (name === 'benefits') {
          await memberBenefitsStatementSwitchApi(row.id);
          this.getList();
        } else {
          await memberCardSwitchApi(row.id);
          this.getMemberList();
        }
        this.$message.success(this.$t('user.updateStatusSuccess'));
      } catch (e) {
        row.status = !row.status;
      }
    }),
    //会员权益设置
    handleCreatBenefits(row) {
      this.pramInfo = row;
      this.drawerVisible = true;
    },
    //会员权益关闭弹窗
    onClosedrawerVisible() {
      this.drawerVisible = false;
    },
    subSuccessBenefits() {
      this.getList();
      this.onClosedrawerVisible();
    },
    //权益说明
    handleCreatExplain(row) {
      this.pramInfo = row;
      this.drawerVisibleExplain = true;
    },
    //权益说明关闭
    onClosedrawerVisibleExplain() {
      this.drawerVisibleExplain = false;
    },
    subSuccessExplain() {
      this.getList();
      this.onClosedrawerVisibleExplain();
    },
  },
};
</script>
<style scoped lang="scss"></style>
