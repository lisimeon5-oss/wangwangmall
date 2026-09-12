<template>
  <div>
    <el-form ref="editPram" :model="editPram" label-width="80px">
      <el-form-item
        :label="$t('category.categoryNameLabel')"
        prop="name"
        :rules="[{ validator: (rule, value, callback) => { if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback(); else callback(new Error(this.$t('category.pleaseEnterCategoryName'))); }, trigger: ['blur', 'change'] }]"
      >
        <div v-if="biztype.value === 1 || biztype.value === 2" class="lang-name-switch">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="editPram.name"
            :maxlength="biztype.value === 1 ? 8 : 20"
            :placeholder="$t('category.categoryNamePlaceholder')"
            clearable
            class="lang-name-input"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            :maxlength="biztype.value === 1 ? 8 : 20"
            :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
            clearable
            class="lang-name-input"
          />
        </div>
        <el-input v-else v-model.trim="editPram.name" :maxlength="biztype.value === 1 ? 8 : 20" :placeholder="$t('category.categoryNamePlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('category.parentLabel')" v-if="biztype.value !== 2">
        <el-cascader
          :key="currentLocale"
          v-model="editPram.pid"
          :disabled="isCreate === 1"
          :options="parentOptions"
          filterable
          :props="categoryProps"
          style="width: 100%"
          ref="cascader"
          @change="handleChange"
        />
      </el-form-item>
      <el-form-item :label="$t('category.categoryIconLabel')">
        <div class="upLoadPicBox" @click="modalPicTap(false)">
          <div v-if="editPram.icon" class="pictrue">
            <img :src="editPram.icon" />
          </div>
          <div v-else class="upLoad">
            <i class="el-icon-camera cameraIconfont" />
          </div>
          <div class="from-tips">{{ $t('category.suggestedSize') }}</div>
        </div>
      </el-form-item>
      <el-form-item class="mb30" :label="$t('category.sortLabel')">
        <el-input-number v-model.trim="editPram.sort" :min="0" />
      </el-form-item>
      <el-form-item :label="$t('category.extraField')" v-if="biztype.value !== 1 && biztype.value !== 3 && biztype.value !== 5">
        <el-input v-model.trim="editPram.extra" type="textarea" :placeholder="$t('category.extraField')" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button @click="close">{{ $t('category.cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="loadingBtn"
        v-debounceClick="
          () => {
            handlerSubmit('editPram');
          }
        "
        v-hasPermi="[
          'platform:product:category:add',
          'platform:product:category:update',
          'platform:category:update',
          'platform:category:save',
        ]"
        >{{ $t('category.confirm') }}</el-button
      >
    </div>
  </div>
</template>
<!--创建和编辑公用一个组件-->
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
import * as articleApi from '@/api/article.js';
import * as storeApi from '@/api/product.js';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';

import { resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  // name: "edit"
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
      constants: this.$constants,
      editPram: {
        icon: null,
        name: null,
        nameJson: null,
        pid: null,
        sort: 0,
        // status: true,
        type: this.biztype.value,
        url: null,
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
      // 多语言名称支持的语言（动态从后端获取启用的语言）
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      // 默认语言代码（对应分类名称 name 字段）
      defaultLangCode: 'zh-cn',
      // 当前切换的语言代码（分类名称多语言切换）
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      // 多语言名称编辑对象（不含默认语言）
      nameJsonForm: {},
    };
  },
  computed: {
    // 当前切换语言的显示名称
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    // 当前界面语言（用于父级下拉选项多语言展示）
    currentLocale() {
      return this.$i18n.locale || 'zh-cn';
    },
    // 父级下拉选项：按当前语言生成 label，并禁用 3 级及更深节点
    parentOptions() {
      return this.buildLocalizedTreeOptions(this.allTreeList);
    },
  },
  created() {
    this.getLanguageList();
  },
  mounted() {
    this.initEditData();
  },
  methods: {
    handleChange() {
      this.prent.level = this.$refs['cascader'].getCheckedNodes()[0].level;
    },
    /** 构建多语言名称编辑对象（不含默认语言） */
    emptyNameJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    /** 获取启用的语言列表，用于动态渲染分类名称多语言输入 */
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
          // 接口失败时回退到默认语言列表
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.editData && this.editData.nameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    /** 解析多语言名称 JSON 字符串为编辑对象 */
    parseNameJson(nameJson) {
      const form = this.emptyNameJsonForm();
      if (!nameJson) return form;
      try {
        const obj = JSON.parse(nameJson);
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    /** 将多语言名称编辑对象序列化为 JSON 字符串 */
    buildNameJson() {
      return buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, pickFormName(this));
    },
    /** 获取分类名称在当前语言下的显示名称（父级下拉选项使用） */
    getLocalizedName(row) {
      const locale = this.currentLocale;
      if (row && row.nameJson) {
        try {
          const nameObj = typeof row.nameJson === 'string' ? JSON.parse(row.nameJson) : row.nameJson;
          const val = nameObj[locale];
          if (val) return val;
        } catch (e) {
          // 解析失败时回退默认名称
        }
      }
      return row ? row.name : '';
    },
    /** 递归为分类树节点生成本地化 label，并禁用 3 级及更深节点 */
    buildLocalizedTreeOptions(nodes) {
      if (!Array.isArray(nodes)) return [];
      return nodes.map((node) => {
        const item = { ...node, label: this.getLocalizedName(node) };
        if (node.children && node.children.length) {
          item.children = this.buildLocalizedTreeOptions(node.children);
        }
        if (item.level >= 3) item.disabled = true;
        return item;
      });
    },
    // 点击图标
    addIcon() {
      const _this = this;
      _this.$modalIcon(function (icon) {
        _this.editPram.icon = icon;
      });
    },
    // 点击商品图
    modalPicTap(multiple) {
      const _this = this;
      const attr = [];
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.editPram.icon = img[0].sattDir;
        },
        multiple,
        'store',
      );
    },
    close() {
      this.$emit('hideEditDialog');
    },
    initEditData() {
      const { icon, name, pid, sort, type, id, url, level } = this.editData;
      if (this.isCreate === 1) {
        this.editPram.icon = icon;
        this.editPram.name = name;
        this.editPram.pid = pid;
        this.editPram.sort = sort;
        this.editPram.type = type;
        this.editPram.url = url;
        this.editPram.id = id;
        this.editPram.level = level;
        this.nameJsonForm = this.parseNameJson(this.editData.nameJson);
        this.activeLang = resolveFormActiveLang(this);
      } else {
        this.editPram.pid = this.prent.id;
        this.editPram.type = this.biztype.value;
        this.editPram.level = parseInt(this.prent.level) + 1;
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
        // this.editPram.pid = this.prent.id
        this.loadingBtn = true;
        if (this.biztype.value !== 2) {
          if (this.editPram.pid === 0) this.editPram.level = 1;
          if (!this.editPram.level) this.editPram.level = parseInt(this.prent.level) + 1;
          storeApi
            .productCategoryAddApi(this.editPram)
            .then((data) => {
              this.$emit('hideEditDialog');
              this.$message.success(this.$t('category.createDirectorySuccess'));
              this.$store.commit('product/SET_AdminProductClassify', []);
              this.loadingBtn = false;
            })
            .catch(() => {
              this.loadingBtn = false;
            });
        } else {
          articleApi
            .articleCategoryAddApi(this.editPram)
            .then((data) => {
              this.$emit('hideEditDialog');
              this.$message.success(this.$t('category.createDirectorySuccess'));
              localStorage.removeItem('articleClass');
              this.loadingBtn = false;
            })
            .catch(() => {
              this.loadingBtn = false;
            });
        }
      } else {
        this.loadingBtn = true;
        if (this.biztype.value !== 2) {
          if (this.editPram.pid === this.editData.id) return this.$message.warning(this.$t('category.cannotSelectCurrentCategory'));
          storeApi
            .productCategoryUpdateApi(this.editPram)
            .then((data) => {
              this.$emit('hideEditDialog');
              this.$message.success(this.$t('category.updateDirectorySuccess'));
              this.$store.commit('product/SET_AdminProductClassify', []);
              this.loadingBtn = false;
            })
            .catch(() => {
              this.loadingBtn = false;
            });
        } else {
          this.editPram.pid = Array.isArray(this.editPram.pid) ? this.editPram.pid[0] : this.editPram.pid;
          articleApi
            .articleCategoryUpdateApi(this.editPram)
            .then((data) => {
              this.$emit('hideEditDialog');
              this.$message.success(this.$t('category.updateDirectorySuccess'));
              localStorage.removeItem('articleClass');
              this.loadingBtn = false;
            })
            .catch(() => {
              this.loadingBtn = false;
            });
        }
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
