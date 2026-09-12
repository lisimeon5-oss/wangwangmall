<template>
  <div>
    <el-form ref="editPram" :model="editPram" label-width="110px">
      <el-form-item
        :label="$t('category.categoryNameLabel')"
        prop="name"
        :rules="nameRules"
      >
        <div class="lang-name-switch">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="editPram.name"
            :maxlength="8"
            :placeholder="$t('category.categoryNamePlaceholder')"
            clearable
            class="lang-name-input"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            :maxlength="8"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
            clearable
            class="lang-name-input"
          />
        </div>
      </el-form-item>
      <el-form-item :label="$t('category.parentLabel')">
        <el-cascader
          ref="cascader"
          v-model="editPram.pid"
          :disabled="isCreate === 1 && editPram.pid === 0"
          @change="change"
          :options="parentOptions"
          :props="categoryProps"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="$t('category.categoryIconLabel')">
        <div class="upLoadPicBox" @click="modalPicTap('1')">
          <div v-if="editPram.icon" class="pictrue">
            <img :src="editPram.icon" />
          </div>
          <div v-else class="upLoad">
            <i class="el-icon-camera cameraIconfont" />
          </div>
          <div class="from-tips">{{ $t('category.suggestedSize') }}</div>
        </div>
      </el-form-item>
      <el-form-item :label="$t('category.sortLabel')">
        <el-input-number v-model.trim="editPram.sort" :min="1" :max="9999" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button @click="close">{{ $t('category.cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="loadingBtn"
        @click="handlerSubmit('editPram')"
        v-hasPermi="['merchant:product:category:update', 'merchant:product:category:add']"
        >{{ $t('category.confirm') }}</el-button
      >
    </div>
  </div>
</template>
<script>
import * as storeApi from '@/api/product.js';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName, getLocalizedName, getUiLocale } from '@/utils/localizedName';
export default {
  props: {
    prent: {
      type: Object,
      required: true,
    },
    isCreate: {
      type: Number,
      default: 0,
    },
    editData: {
      type: Object,
    },
    biztype: {
      type: Object,
      required: true,
    },
    allTreeList: {
      type: Array,
    },
  },
  data() {
    return {
      loadingBtn: false,
      editPram: {
        icon: null,
        name: '',
        nameJson: '',
        pid: 0,
        sort: 0,
        id: 0,
      },
      categoryProps: {
        value: 'id',
        label: 'label',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
        emitPath: false,
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: {},
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    parentOptions() {
      return this.buildLocalizedTreeOptions(this.allTreeList);
    },
    nameRules() {
      this.$i18n.locale;
      return [
        {
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) {
              callback();
            } else {
              callback(new Error(this.$t('category.pleaseEnterCategoryName')));
            }
          },
          trigger: ['blur', 'change'],
        },
      ];
    },
  },
  created() {
    this.getLanguageList();
  },
  mounted() {
    this.initEditData();
  },
  methods: {
    change() {},
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
          this.nameJsonForm = this.parseNameJson(this.editData && this.editData.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.editData && this.editData.nameJson);
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
    buildLocalizedTreeOptions(nodes) {
      if (!Array.isArray(nodes)) return [];
      const locale = getUiLocale(this);
      return nodes.map((node) => {
        const item = { ...node, label: getLocalizedName(node, locale) };
        if (node.children && node.children.length) {
          item.children = this.buildLocalizedTreeOptions(node.children);
        }
        return item;
      });
    },
    modalPicTap(tit, num, i) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (tit === '1' && !num) {
            _this.editPram.icon = img[0].sattDir;
          }
        },
        tit,
        'store',
      );
    },
    close() {
      this.$emit('hideEditDialog');
    },
    initEditData() {
      const { icon, name, pid, sort, id } = this.editData || {};
      if (this.isCreate === 1) {
        this.editPram.icon = icon;
        this.editPram.name = name;
        this.editPram.pid = pid;
        this.editPram.sort = sort;
        this.editPram.id = id;
        this.nameJsonForm = this.parseNameJson(this.editData.nameJson);
        this.activeLang = resolveFormActiveLang(this);
      } else {
        this.editPram.pid = this.prent.id;
        this.nameJsonForm = this.emptyNameJsonForm();
        this.activeLang = resolveFormActiveLang(this);
      }
    },
    handlerSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        this.handlerSaveOrUpdate(this.isCreate === 0);
      });
    },
    handlerSaveOrUpdate(isSave) {
      this.editPram.nameJson = this.buildNameJson();
      if (isSave) {
        this.loadingBtn = true;
        storeApi
          .productCategoryAddApi(this.editPram)
          .then(() => {
            this.$emit('hideEditDialog');
            this.$message.success(this.$t('category.createDirectorySuccess'));
            this.$store.commit('product/SET_MerProductClassify', []);
            this.loadingBtn = false;
          })
          .catch(() => {
            this.loadingBtn = false;
          });
      } else {
        this.loadingBtn = true;
        storeApi
          .productCategoryUpdateApi(this.editPram)
          .then(() => {
            this.$emit('hideEditDialog');
            this.$message.success(this.$t('category.updateDirectorySuccess'));
            this.$store.commit('product/SET_MerProductClassify', []);
            this.loadingBtn = false;
          })
          .catch(() => {
            this.loadingBtn = false;
          });
      }
    },
  },
};
</script>

<style scoped lang="scss">
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
