<template>
  <el-drawer
    :visible.sync="drawerVisible"
    :wrapperClosable="false"
    direction="rtl"
    size="800px"
    :before-close="handleClose"
    class="showHeader"
  >
    <div slot="title" class="demo-drawer_title">{{ pram.id ? $t('user.editCard') : $t('user.addCard') }}</div>
    <div class="detailSection">
      <el-form :model="pram" ref="pram" label-width="88px" class="demo-ruleForm px35" :rules="rules">
        <el-form-item :label="$t('user.cardNameLabel')" prop="name">
          <div class="lang-name-switch from-ipt-width">
            <el-radio-group v-model="activeLang" size="small">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model="pram.name"
              maxlength="10"
              class="lang-name-input"
              :placeholder="$t('user.pleaseEnterCardName')"
            />
            <el-input
              v-else
              v-model="nameJsonForm[activeLang]"
              maxlength="30"
              class="lang-name-input"
              :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
            />
          </div>
          <div class="from-tips">{{ $t('user.cardNameTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.labelTextLabel')">
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model="pram.label"
            :placeholder="$t('user.pleaseEnterLabelText')"
            maxlength="6"
            class="from-ipt-width"
          />
          <el-input
            v-else
            v-model="labelJsonForm[activeLang]"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
            maxlength="20"
            class="from-ipt-width"
          />
          <div class="from-tips">
            {{ $t('user.labelTextTip') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('user.cardTypeLabel')" required>
          <el-radio-group v-model="pram.type" :disabled="pram.id ? true : false">
            <el-radio :label="0">{{ $t('user.trial') }}</el-radio>
            <el-radio :label="1">{{ $t('user.term') }}</el-radio>
            <el-radio :label="2">{{ $t('user.permanent') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="pram.type < 2" :label="$t('user.cardTermLabel')" required>
          <el-input-number v-model.trim="pram.deadlineDay" :min="1" :max="2000" :step="1" :placeholder="$t('user.termPlaceholder')" />
          <div class="from-tips">{{ $t('user.cardTermTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.originalPrice')" required>
          <el-input-number
            v-model.trim="pram.originalPrice"
            :min="0.01"
            :max="99999.99"
            :precision="2"
            :step="0.1"
            :placeholder="$t('user.originalPricePlaceholder')"
          />
          <div class="from-tips">{{ $t('user.originalPriceTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.salePrice')" required>
          <el-input-number
            v-model.trim="pram.price"
            :min="0.01"
            :max="99999.99"
            :precision="2"
            :step="0.1"
            :placeholder="$t('user.salePricePlaceholder')"
          />
          <div class="from-tips">{{ $t('user.salePriceTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.giftBalanceLabel')" required>
          <el-input-number
            v-model.trim="pram.giftBalance"
            :min="0"
            :max="999.99"
            :precision="2"
            :step="0.1"
            :placeholder="$t('user.giftBalancePlaceholder')"
          />
          <el-checkbox v-model="pram.isFirstChargeGive" class="ml15">{{ $t('user.firstChargeOnly') }}</el-checkbox>
          <div class="from-tips">{{ $t('user.giftBalanceTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.sortLabel')">
          <el-input-number
            v-model.trim="pram.sort"
            :min="0"
            :max="999"
            :step="1"
            step-strictly
            :label="$t('user.sortPlaceholder')"
          ></el-input-number>
          <div class="from-tips">{{ $t('user.cardSortTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('user.statusColon')" required>
          <el-switch
            v-model="pram.status"
            :active-text="$t('user.on')"
            :inactive-text="$t('user.off')"
            :active-value="true"
            :inactive-value="false"
          />
          <div class="from-tips">{{ $t('user.benefitStatusTip') }}</div>
        </el-form-item>
      </el-form>
    </div>
    <div class="demo-drawer__footer from-foot-btn btn-shadow drawer_fix">
      <div class="acea-row row-center">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button
          v-if="checkPermi(['platform:paid:member:card:add', 'platform:paid:member:card:edit'])"
          type="primary"
          v-debounceClick="submitForm"
          >{{ $t('common.confirmPrefix') }}</el-button
        >
      </div>
    </div>
  </el-drawer>
</template>
<script>
import { checkPermi } from '@/utils/permission';
import { memberCardAddApi, memberCardEditApi } from '@/api/user';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';


import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'cardCreat',
  props: {
    //是否显示隐藏
    drawerVisible: {
      type: Boolean,
      default: false,
    },
    pramInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pram: {
        deadlineDay: 0,
        giftBalance: 0,
        id: 0,
        isFirstChargeGive: true,
        label: '',
        labelJson: '',
        name: '',
        nameJson: '',
        originalPrice: 0,
        price: 0,
        sort: 0,
        status: true,
        type: 0,
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      labelJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
    };
  },
  computed: {
    rules() {
      return {
        name: [
          {
            validator: (rule, value, callback) => {
              if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
              else callback(new Error(this.$t('user.pleaseEnterCardName')));
            },
            trigger: 'blur',
          },
        ],
      };
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
  },
  mounted() {
    this.pram = Object.assign({}, this.pramInfo);
    this.getLanguageList();
  },
  methods: {
    checkPermi,
    emptyLangForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseJson(json) {
      const form = this.emptyLangForm();
      if (!json) return form;
      try {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    buildJson(form, defaultName) {
      return buildI18nNameJson(this.langOptions, form, this.defaultLangCode, defaultName);
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
          this.nameJsonForm = this.parseJson(this.pram && this.pram.nameJson);
          this.labelJsonForm = this.parseJson(this.pram && this.pram.labelJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseJson(this.pram && this.pram.nameJson);
          this.labelJsonForm = this.parseJson(this.pram && this.pram.labelJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    handleClose() {
      this.$emit('onClosedrawerVisible');
    },
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.pram.imageUrl = img[0].sattDir;
        },
        multiple,
        'content',
      );
    },
    submitForm() {
      this.$refs.pram.validate(async (valid) => {
        if (valid) {
          try {
            this.pram.nameJson = this.buildJson(this.nameJsonForm, this.pram.name);
            this.pram.labelJson = this.buildJson(this.labelJsonForm, this.pram.label);
            this.pram.id ? await memberCardEditApi(this.pram) : await memberCardAddApi(this.pram);
            this.$modal.msgSuccess(this.$t('user.saveSuccess'));
            this.$emit('subSuccess');
          } catch (e) {}
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.detailSection form {
  padding-bottom: 80px;
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
