<template>
  <div class="divBox">
    <el-card class="box-card" :bordered="false" shadow="never" :body-style="{ padding: '40px 50px' }">
      <el-form
        v-hasPermi="['platform:sign:get:config', 'platform:sign:edit:base:config']"
        :model="signForm"
        :rules="rules"
        ref="signForm"
        label-width="90px"
        class="demo-ruleForm"
      >
        <el-form-item :label="$t('marketing.dailySignRewardLabel')" prop="integral">
          <div class="acea-row">
            <el-checkbox v-model="signForm.isIntegral">{{ $t('marketing.giftPointsValue') }}</el-checkbox>
            <el-input-number
              v-model.trim="signForm.integral"
              :min="0"
              :max="9999"
              :step="1"
              :label="$t('marketing.pointsValue')"
              class="ml40"
            ></el-input-number>
          </div>
        </el-form-item>
        <el-form-item prop="experience">
          <div class="acea-row">
            <el-checkbox v-model="signForm.isExperience">{{ $t('marketing.giftExpValue') }}</el-checkbox>
            <el-input-number
              v-model.trim="signForm.experience"
              :min="0"
              :max="9999"
              :step="1"
              :label="$t('marketing.expValue')"
              class="ml40"
            ></el-input-number>
          </div>
        </el-form-item>
        <el-form-item :label="$t('marketing.signRuleDescriptionLabel')" class="operation">
          <div class="lang-name-switch">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              type="textarea"
              :rows="3"
              :placeholder="$t('marketing.pleaseEnterContent')"
              style="width: 460px"
              v-model="signForm.signRuleDescription"
            />
            <el-input
              v-else
              type="textarea"
              :rows="3"
              :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
              style="width: 460px"
              v-model="ruleJsonForm[activeLang]"
            />
          </div>
          <el-button class="btn" size="small" type="text" @click="applyDefaultDescription">{{
            $t('marketing.useDefaultDescription')
          }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="checkPermi(['platform:sign:edit:base:config'])"
            type="primary"
            @click="submitForm('signForm')"
            >{{ $t('common.submit') }}</el-button
          >
        </el-form-item>
      </el-form>
      <el-button
        v-if="checkPermi(['platform:sign:get:config', 'platform:sign:add:config'])"
        type="primary"
        @click="addSign"
        class="mt20"
        >{{ $t('marketing.addContinuousSignReward') }}</el-button
      >
      <div class="from-tips mt14 mb20">{{ $t('marketing.continuousSignRewardTip') }}</div>
      <el-table :data="signConfigList" border>
        <el-table-column :label="$t('marketing.continuousDays')" width="130">
          <template slot-scope="scope">
            <el-input v-show="scope.row.show" :placeholder="$t('marketing.pleaseEnterContent')" v-model.trim="scope.row.day"></el-input>
            <span v-show="!scope.row.show">{{ scope.row.day }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('marketing.continuousReward')" min-width="680">
          <template slot-scope="scope">
            <div class="acea-row row-center-wrapper">
              <el-checkbox v-model="scope.row.isIntegral" :disabled="!scope.row.show">{{ $t('marketing.giftPointsValue') }}</el-checkbox>
              <el-input-number
                :disabled="!scope.row.show"
                v-model.trim="scope.row.integral"
                :min="0"
                :max="9999"
                :step="1"
                :label="$t('marketing.pointsValue')"
                class="mr20"
              ></el-input-number>
              <el-checkbox v-model="scope.row.isExperience" class="ml40 mr20" :disabled="!scope.row.show"
                >{{ $t('marketing.giftExpValue') }}</el-checkbox
              >
              <el-input-number
                :disabled="!scope.row.show"
                v-model.trim="scope.row.experience"
                :min="0"
                :max="9999"
                :step="1"
                :label="$t('marketing.expValue')"
              ></el-input-number>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="150">
          <template slot-scope="scope">
            <a v-if="checkPermi(['platform:sign:edit:award:config'])" type="text" @click="editSign(scope.row)">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a
              v-if="checkPermi(['platform:sign:add:config', 'platform:sign:edit:award:config'])"
              type="text"
              @click="saveSign(scope.row)"
              >{{ $t('common.save') }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <a v-if="checkPermi(['platform:sign:delete:config'])" type="text" @click="delSign(scope.row)">{{ $t('common.delete') }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import {
  signBaseConfigApi,
  signeGetConfigApi,
  signAddConfigApi,
  signeEditConfigApi,
  signeDelConfigApi,
} from '@/api/marketing';
import { checkPermi } from '@/utils/permission';
import { Debounce } from '@/utils/validate'; // 权限判断函数
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson } from '@/utils/localizedName';
const signObj = {
  day: 0,
  experience: 0,
  integral: 0,
  id: 0,
  isExperience: true,
  isIntegral: true,
  show: true,
};
export default {
  name: 'index',
  data() {
    return {
      signForm: {
        day: 0,
        experience: 0,
        id: 0,
        integral: 0,
        isExperience: true,
        isIntegral: true,
        signRuleDescription: '',
      },
      defaultDescription: this.$t('marketing.dailySignRewardTip'),
      rules: {
        isIntegral: [{ required: true, message: this.$t('marketing.pleaseEnterPoints'), trigger: 'blur' }],
        experience: [{ required: true, message: this.$t('marketing.pleaseEnterExp'), trigger: 'blur' }],
      },
      signConfigList: [],
      showTab: false,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      ruleJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
  },
  mounted() {
    this.getLanguageList();
    if (checkPermi(['platform:sign:get:config'])) this.getSignConfig();
  },
  methods: {
    checkPermi,
    emptyRuleJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseRuleJson(ruleJson) {
      const form = this.emptyRuleJsonForm();
      if (!ruleJson) return form;
      try {
        const obj = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
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
          this.ruleJsonForm = this.parseRuleJson(this.signForm.signRuleDescriptionJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.ruleJsonForm = this.parseRuleJson(this.signForm.signRuleDescriptionJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    applyDefaultDescription() {
      const text = this.$i18n.t('marketing.signRuleDefaultDescription', this.activeLang);
      if (this.activeLang === this.defaultLangCode) {
        this.signForm.signRuleDescription = text;
      } else {
        this.$set(this.ruleJsonForm, this.activeLang, text);
      }
    },
    getSignConfig() {
      signeGetConfigApi().then((res) => {
        this.signForm = res.baseSignConfig;
        this.$set(this, 'signConfigList', res.signConfigList);
        this.$set(this.signForm, 'signRuleDescription', res.signRuleDescription);
        this.$set(this.signForm, 'signRuleDescriptionJson', res.signRuleDescriptionJson);
        this.ruleJsonForm = this.parseRuleJson(res.signRuleDescriptionJson);
      });
    },
    submitForm: Debounce(function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (!hasI18nNameContent(this.signForm.signRuleDescription, this.ruleJsonForm)) {
            this.$message.warning(this.$t('marketing.pleaseEnterSignRule'));
            return false;
          }
          const payload = {
            ...this.signForm,
            signRuleDescriptionJson: buildI18nNameJson(
              this.langOptions,
              this.ruleJsonForm,
              this.defaultLangCode,
              this.signForm.signRuleDescription,
            ),
          };
          signBaseConfigApi(payload).then(() => {
            this.$message.success(this.$t('product.operateSuccess'));
            this.getSignConfig();
          });
        } else {
          return false;
        }
      });
    }),
    addSign() {
      this.signConfigList.push(Object.assign({}, signObj));
    },
    editSign(row) {
      this.$set(row, 'show', true);
    },
    delSign(row) {
      this.$modalSure(this.$t('category.deleteCurrentDataConfirm')).then(() => {
        signeDelConfigApi(row.id).then((data) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          this.getSignConfig();
        });
      });
    },
    saveSign(row) {
      row.id
        ? signeEditConfigApi(row).then(() => {
            this.$set(row, 'show', false);
            this.$message.success(this.$t('product.operateSuccess'));
            this.getSignConfig();
          })
        : signAddConfigApi(row).then(() => {
            this.$set(row, 'show', false);
            this.$message.success(this.$t('product.operateSuccess'));
            this.getSignConfig();
          });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-table {
  width: 970px;
}
.btn {
  position: relative;
  top: -15px;
  left: 12px;
}
.lang-name-switch {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.lang-name-switch .el-radio-group {
  margin-bottom: 8px;
}
.title {
  ::v-deep.el-alert {
    padding: 0 16px !important;
  }
}
</style>
