<template>
  <el-dialog
    v-if="dialogVisible"
    :title="formValidate.id ? $t('user.editUserLevel') : $t('user.addUserLevel')"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form :model="formValidate" :rules="rules" ref="userRef" label-width="90px" class="demo-ruleForm" v-loading="loading">
      <el-form-item :label="$t('user.levelName')" prop="name">
        <div class="lang-name-switch from-ipt-width">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="formValidate.name"
            maxlength="50"
            class="lang-name-input"
            :placeholder="$t('user.pleaseEnterLevelName')"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            maxlength="50"
            class="lang-name-input"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
          />
        </div>
      </el-form-item>
      <el-form-item :label="$t('user.levelGrade')" prop="grade">
        <el-select v-model="formValidate.grade" :placeholder="$t('common.pleaseSelect')" :disabled="formValidate.grade === 0">
          <el-option
            v-for="item in levelData"
            :key="item.val"
            :label="item.name"
            :value="item.val"
            :disabled="item.disabled"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('user.requiredGrowth')" prop="experience">
        <el-input-number
          :disabled="formValidate.grade === 0"
          v-model.number="formValidate.experience"
          :placeholder="$t('user.pleaseEnterGrowth')"
          :min="0"
          :max="99999"
          step-strictly
        ></el-input-number>
      </el-form-item>
      <el-form-item :label="$t('user.textColor')" prop="backColor">
        <div class="acea-row">
          <el-color-picker
              v-model="formValidate.backColor"
              @change="changeColor($event)"
          ></el-color-picker>
          <el-input size="small" v-model.trim="formValidate.backColor" class="ml10 from-ipt-width"></el-input>
        </div>
        <div class="from-tips">{{ $t('user.textColorTip') }}</div>
      </el-form-item>
      <el-form-item :label="$t('user.iconLabel')" prop="icon">
        <div class="upLoadPicBox" @click="modalPicTap(false, 'icon')">
          <div v-if="formValidate.icon" class="pictrue"><img :src="formValidate.icon" /></div>
          <div v-else class="upLoad">
            <i class="el-icon-camera cameraIconfont" />
          </div>
          <p class="desc mt10">{{ $t('user.iconSize') }}</p>
        </div>
      </el-form-item>
      <el-form-item :label="$t('user.backgroundImage')" prop="backImage">
        <div class="upLoadPicBox" @click="modalPicTap(false, 'backImage')">
          <div v-if="formValidate.backImage" class="pictrue"><img :src="formValidate.backImage" /></div>
          <div v-else class="upLoad">
            <i class="el-icon-camera cameraIconfont" />
          </div>
        </div>
        <p class="desc mt10">{{ $t('user.bgSize') }}</p>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="resetForm('formValidate')">{{ $t('common.cancel') }}</el-button>
      <el-button
        type="primary"
        @click="submitForm('formValidate')"
        v-hasPermi="['platform:system:user:level:save', 'platform:system:user:level:update']"
        >{{ $t('common.confirmPrefix') }}</el-button
      >
    </span>
  </el-dialog>
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
import { levelSaveApi, levelInfoApi, levelUpdateApi } from '@/api/user';
import { Debounce } from '@/utils/validate';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';


import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'CreatGrade',
  props: {
    userInfo: {
      type: Object,
      default: ()=>{
        return {}
      },
    },
    levelNumData: {
      type: Array,
      default: [],
    },
  },
  watch: {
    userInfo: {
      handler: function (val) {
        this.formValidate = val;
        this.nameJsonForm = this.parseNameJson(val && val.nameJson);
        this.activeLang = resolveFormActiveLang(this);
      },
      immediate: false,
      deep: true,
    },
    levelNumData: {
      handler: function (val) {
        this.levelNumDataNew = val;
      },
      immediate: false,
      deep: true,
    },
  },
  data() {
    return {
      dialogVisible: false,
      formValidate: this.userInfo,
      loading: false,
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      levelNum: [],
      levelNumDataNew: this.levelNumData,
    };
  },
  mounted() {
    this.getLanguageList();
    for (let i = 0; i < 100; i++) {
      this.levelNum.push({
        val: i,
        name: i,
      });
    }
  },
  computed: {
    rules() {
      return {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('user.pleaseEnterLevelName')));
          },
          trigger: 'blur',
        }],
        grade: [
          { required: true, message: this.$t('user.pleaseEnterGrade'), trigger: 'blur' },
          { type: 'number', message: this.$t('user.gradeMustBeNumber') },
        ],
        backColor: [{ required: true, message: this.$t('user.pleaseEnterTextColor'), trigger: 'blur' }],
        discount: [{ message: this.$t('user.pleaseEnterDiscount'), trigger: 'blur' }],
        experience: [
          { required: true, message: this.$t('user.pleaseEnterExperience'), trigger: 'blur' },
          { type: 'number', message: this.$t('user.experienceMustBeNumber') },
        ],
        icon: [{ required: true, message: this.$t('user.pleaseUploadIcon'), trigger: 'change' }],
        backImage: [{ required: true, message: this.$t('user.pleaseUploadBackground'), trigger: 'change' }],
      };
    },
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    levelData() {
      this.levelNum.map((i) => {
        if (this.levelNumDataNew.some((item) => item === i.val)) {
          i.disabled = true;
        } else {
          i.disabled = false;
        }
      });
      return this.levelNum;
    },
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
    //点击颜色
    changeColor(e, color) {
      if (e) {
        this.$refs.userRef.clearValidate('backColor')
      }
    },
    // 点击商品图
    modalPicTap(multiple, num) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (num === 'icon') {
            _this.formValidate.icon = img[0].sattDir;
            _this.$refs.userRef.clearValidate('icon');
          } else {
            _this.formValidate.backImage = img[0].sattDir;
            _this.$refs.userRef.clearValidate('backImage');
          }
        },
        multiple,
        'user',
      );
    },
    handleClose() {
      this.dialogVisible = false;
    },
    submitForm: Debounce(function (formName) {
      this.$refs.userRef.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.formValidate.nameJson = this.buildNameJson();
          this.formValidate.id
            ? levelUpdateApi(this.formValidate)
                .then((res) => {
                  this.$message.success(this.$t('user.editSuccess'));
                  this.loading = false;
                  this.handleClose();
                  this.$parent.getList();
                })
                .catch(() => {
                  this.loading = false;
                })
            : levelSaveApi(this.formValidate)
                .then((res) => {
                  this.$message.success(this.$t('user.addSuccess'));
                  this.loading = false;
                  this.handleClose();
                  this.$parent.getList();
                })
                .catch(() => {
                  this.loading = false;
                });
        } else {
          return false;
        }
      });
    }),
    resetForm() {
       this.$nextTick(() => {
        this.$refs.userRef.clearValidate();
      })
      this.dialogVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
.desc {
  color: #999;
  font-size: 12px;
  line-height: 16px;
}
.el-input-number.el-input-number--small {
  width: 200px;
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
