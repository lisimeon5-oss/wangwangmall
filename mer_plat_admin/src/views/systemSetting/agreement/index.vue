<template>
  <div class="divBox">
    <el-card class="box-card" :bordered="false" shadow="never">
      <div v-loading="loading">
        <el-tabs
          tab-position="left"
          v-model="agreementValue"
          @tab-click="tabStatus"
          v-hasPermi="[
            'platform:system:agreement:user:info',
            'platform:system:agreement:merincomming:info',
            'platform:system:agreement:userprivacy:info',
            'platform:system:agreement:useraccountcancel:info',
            'platform:system:agreement:useraccountcancelnotice:info',
            'platform:system:agreement:aboutus:info',
            'platform:system:agreement:intelligent:info',
            'platform:system:agreement:platfromrule:info',
            'platform:system:agreement:coupon:agreement:info',
            'platform:system:agreement:paid:member:info',
          ]"
        >
          <el-tab-pane :label="item.title" v-for="(item, index) in tabList" :key="item.info" :name="item.info">
            <div class="content">
              <div class="phoneBox">
                <div class="fontBox" v-html="previewHtml"></div>
              </div>
              <div class="ueditor">
                <div class="font"><span class="verticalLine"></span> {{ item.title }}</div>
                <div class="lang-name-switch">
                  <el-radio-group v-model="activeLang" size="small" @change="onLangChange">
                    <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                      {{ lang.label }}
                    </el-radio-button>
                  </el-radio-group>
                </div>
                <Tinymce v-model="editorHtml" :key="editorKey"></Tinymce>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="btn">
          <el-button
            class="button"
            type="primary"
            @click="submenus"
            v-hasPermi="[
              'platform:system:agreement:user:save',
              'platform:system:agreement:merincomming:save',
              'platform:system:agreement:userprivacy:save',
              'platform:system:agreement:useraccountcancel:save',
              'platform:system:agreement:useraccountcancelnotice:save',
              'platform:system:agreement:aboutus:save',
              'platform:system:agreement:intelligent:save',
              'platform:system:agreement:platfromrule:save',
              'platform:system:agreement:coupon:agreement:save',
              'platform:system:agreement:paid:member:save',
            ]"
            >{{ $t('common.submit') }}</el-button
          >
        </div>
      </div>
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
import Tinymce from '@/components/Tinymce/index';
import { agreementInfoApi, agreementSaveApi } from '@/api/system';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  getLocalizedText,
  parseLangJsonMap,
  resolveFormActiveLang,
} from '@/utils/localizedName';
export default {
  name: 'agreements',
  components: { Tinymce },
  data() {
    return {
      loading: false,
      formValidate: {
        agreement: '',
        agreementJson: '',
      },
      agreementValue: 'userinfo',
      agreementSave: 'usersave',
      keyIndex: 0,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
    };
  },
  computed: {
    tabList() {
      return [
        { title: this.$t('systemSetting.userAgreement'), info: 'userinfo', save: 'usersave' },
        { title: this.$t('systemSetting.privacyAgreement'), info: 'userprivacyinfo', save: 'userprivacysave' },
        { title: this.$t('systemSetting.onboardingAgreement'), info: 'merincomminginfo', save: 'merincommingsave' },
        { title: this.$t('systemSetting.aboutUs'), info: 'aboutusinfo', save: 'aboutussave' },
        { title: this.$t('systemSetting.qualificationCertificates'), info: 'intelligentinfo', save: 'intelligentsave' },
        { title: this.$t('systemSetting.platformRules'), info: 'platfromruleinfo', save: 'platfromrulesave' },
        { title: this.$t('systemSetting.cancellationAgreement'), info: 'useraccountcancelinfo', save: 'useraccountcancelsave' },
        { title: this.$t('systemSetting.cancellationStatement'), info: 'useraccountcancelnoticeinfo', save: 'useraccountcancelnoticesave' },
        { title: this.$t('systemSetting.couponAgreement'), info: 'coupon/agreement/info', save: 'coupon/agreement/save' },
        { title: this.$t('systemSetting.paidMemberAgreement'), info: 'paid/member/info', save: 'paid/member/save' },
      ];
    },
    editorKey() {
      return this.keyIndex + '-' + this.activeLang;
    },
    editorHtml: {
      get() {
        if (this.activeLang === this.defaultLangCode) return this.formValidate.agreement || '';
        return parseLangJsonMap(this.formValidate.agreementJson)[this.activeLang] || '';
      },
      set(val) {
        if (this.activeLang === this.defaultLangCode) {
          this.formValidate.agreement = val;
          return;
        }
        const map = parseLangJsonMap(this.formValidate.agreementJson);
        if (this.hasHtmlContent(val)) map[this.activeLang] = val;
        else delete map[this.activeLang];
        this.formValidate.agreementJson = Object.keys(map).length ? JSON.stringify(map) : '';
      },
    },
    previewHtml() {
      return getLocalizedText(
        this.formValidate.agreement,
        this.formValidate.agreementJson,
        this.activeLang,
      );
    },
  },
  created() {
    this.getLanguageList();
    if (
      checkPermi([
        'platform:system:agreement:user:info',
        'platform:system:agreement:merincomming:info',
        'platform:system:agreement:userprivacy:info',
        'platform:system:agreement:useraccountcancel:info',
        'platform:system:agreement:useraccountcancelnotice:info',
        'platform:system:agreement:aboutus:info',
        'platform:system:agreement:intelligent:info',
        'platform:system:agreement:platfromrule:info',
        'platform:system:agreement:coupon:agreement:info',
        'platform:system:agreement:paid:member:info',
      ])
    )
      this.getInfo(this.agreementValue);
  },
  methods: {
    checkPermi,
    hasHtmlContent(html) {
      return String(html || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim().length > 0;
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
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    onLangChange() {
      this.keyIndex += 1;
    },
    getInfo(data) {
      this.loading = true;
      this.formValidate.agreement = '';
      this.formValidate.agreementJson = '';
      agreementInfoApi(data)
        .then((res) => {
          let obj = {};
          try {
            obj = res ? JSON.parse(res) : {};
          } catch (e) {
            obj = {};
          }
          this.formValidate.agreement = obj.agreement || '';
          this.formValidate.agreementJson =
            typeof obj.agreementJson === 'string'
              ? obj.agreementJson
              : obj.agreementJson
                ? JSON.stringify(obj.agreementJson)
                : '';
          this.keyIndex += 1;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    submenus() {
      const jsonForm = parseLangJsonMap(this.formValidate.agreementJson);
      const hasContent =
        this.hasHtmlContent(this.formValidate.agreement) ||
        Object.keys(jsonForm).some((k) => this.hasHtmlContent(jsonForm[k]));
      if (!hasContent) {
        return this.$message.warning(this.$t('systemSetting.pleaseEnterAgreementInfo'));
      }
      agreementSaveApi(this.agreementSave, {
        agreement: this.formValidate.agreement || '',
        agreementJson: this.formValidate.agreementJson || '',
      }).then(async (res) => {
        this.$message.success(this.$t('user.saveSuccess'));
      });
    },
    tabStatus(e) {
      this.getInfo(e.name);
      this.agreementSave = this.tabList[e.index].save;
    },
  },
};
</script>
<style scoped lang="scss">
.box-card :v-deep.el-card__body {
  padding-left: 0px;
}
:v-deep.el-tabs__item.is-active {
  color: var(--prev-color-primary);
  background-color: #ccc;
  background: #437efd1e;
  // opacity: 0.1;
}
:v-deep.el-tabs--left .el-tabs__header.is-left {
  float: left;
  margin-bottom: 0;
  margin-right: 20px;
  height: 700px;
}
.verticalLine {
  border: 2px solid var(--prev-color-primary);
  margin-right: 10px;
}
.btn {
  border-top: 1px solid #ccc;
  margin-top: 20px;
  .button {
    display: block;
    margin: 17px auto 0px;
  }
}
.content {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  img {
    max-width: 100%;
  }
  .phoneBox {
    width: 302px;
    height: 543px;
    background-image: url('../../../assets/imgs/phoneBox.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    overflow: hidden;
    margin-right: 30px;
    .fontBox {
      margin: 0 auto;
      margin-top: 45px;
      width: 255px;
      height: 450px;
      background: #ffffff;
      border: 1px solid #e2e2e2;
      padding: 10px;
      overflow: hidden;
      overflow-y: auto;
      ::v-deep img {
        width: 100% !important;
      }
    }
  }
  .ueditor {
    flex: 1;
    .font {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }
  }
}
.lang-name-switch {
  margin-bottom: 16px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
