<template>
  <div class="divBox">
    <pages-header
      ref="pageHeader"
      :title="$route.params.id ? $t('content.editArticle') : $t('content.addArticle')"
      backUrl="/marketing/content/articleManager"
    ></pages-header>
    <el-card class="box-card mt14" shadow="never" :bordered="false" :body-style="{ padding: '40px 50px' }">
      <div class="components-container">
        <el-form :key="'article-form-' + ($i18n.locale || '')" ref="pram" label-width="110px" :model="pram" :rules="rules" size="small">
          <el-form-item :label="$t('common.language')">
            <div class="lang-name-switch">
              <el-radio-group v-model="activeLang" size="small">
                <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                  {{ lang.label }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </el-form-item>
          <el-form-item :label="$t('content.titleLabel')" prop="title">
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model.trim="pram.title"
              class="from-ipt-width"
              :placeholder="$t('content.title')"
              maxlength="100"
            />
            <el-input
              v-else
              v-model.trim="titleJsonForm[activeLang]"
              class="from-ipt-width"
              :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
              maxlength="100"
            />
          </el-form-item>
          <el-form-item :label="$t('content.authorLabel')" prop="author">
            <el-input v-model.trim="pram.author" class="from-ipt-width" :placeholder="$t('content.author')" maxlength="20" />
          </el-form-item>
          <el-form-item :label="$t('content.articleCategoryLabel')" prop="cid">
            <el-select v-model.trim="pram.cid" :placeholder="$t('el.select.placeholder')" class="from-ipt-width">
              <el-option v-for="item in categoryTreeData" :key="item.id" :label="localizedCategoryName(item)" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('content.coverLabel')" prop="cover">
            <div class="upLoadPicBox" @click="modalPicTap(false)">
              <div v-if="pram.cover" class="pictrue"><img :src="pram.cover" /></div>
              <div v-else class="upLoad">
                <i class="el-icon-camera cameraIconfont" />
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('content.articleIntroLabel')" prop="synopsis">
            <el-input
              v-if="activeLang === defaultLangCode"
              v-model.trim="pram.synopsis"
              maxlength="100"
              type="textarea"
              :rows="2"
              resize="none"
              class="from-ipt-width"
              :placeholder="$t('content.articleIntro')"
            />
            <el-input
              v-else
              v-model.trim="synopsisJsonForm[activeLang]"
              maxlength="100"
              type="textarea"
              :rows="2"
              resize="none"
              class="from-ipt-width"
              :placeholder="$t('category.inputNameInLang', { lang: activeLangLabel })"
            />
          </el-form-item>
          <el-form-item :label="$t('content.articleContentLabel')" prop="content">
            <Tinymce v-if="activeLang === defaultLangCode" :key="'content-' + defaultLangCode" v-model="pram.content"></Tinymce>
            <Tinymce v-else :key="'content-' + activeLang" v-model="contentJsonForm[activeLang]"></Tinymce>
          </el-form-item>
          <el-form-item :label="$t('product.sortLabel')">
            <el-input-number v-model.trim="pram.sort" :min="0" :max="10" :label="$t('product.sort')"></el-input-number>
          </el-form-item>
          <el-form-item :label="$t('content.isBannerLabel')">
            <el-switch v-model.trim="pram.isBanner" :active-text="$t('common.yes')" :inactive-text="$t('common.no')" />
          </el-form-item>
          <el-form-item :label="$t('content.isHotLabel')">
            <el-switch v-model.trim="pram.isHot" :active-text="$t('common.yes')" :inactive-text="$t('common.no')" />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handerSubmit('pram')"
              v-hasPermi="['platform:article:update', 'platform:article:save']"
              >{{ $t('common.save') }}</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce/index';
import * as articleApi from '@/api/article.js';
import { getToken } from '@/utils/auth';
import { Debounce } from '@/utils/validate';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  getLocalizedName,
  getUiLocale,
  resolveFormActiveLang,
  hasI18nNameContent,
  buildI18nNameJson,
} from '@/utils/localizedName';
export default {
  components: { Tinymce },
  data() {
    return {
      loading: false,
      constants: this.$constants,
      categoryTreeData: [],
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'child',
        expandTrigger: 'hover',
        checkStrictly: true,
        emitPath: false,
      },
      pram: {
        author: null,
        cid: null,
        content: '',
        cover: '',
        isBanner: false,
        isHot: null,
        shareSynopsis: null,
        shareTitle: null,
        sort: 0,
        synopsis: null,
        title: null,
        titleJson: '',
        synopsisJson: '',
        contentJson: '',
        id: null,
      },
      editData: {},
      myHeaders: { 'X-Token': getToken() },
      editorContentLaebl: '',
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      titleJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      synopsisJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
      contentJsonForm: defaultLangList.reduce((acc, i) => {
        if (i.value !== 'zh-cn') acc[i.value] = '';
        return acc;
      }, {}),
    };
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    rules() {
      return {
        title: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(this.pram.title, this.titleJsonForm)) callback();
            else callback(new Error(this.$t('content.pleaseFillTitle')));
          },
          trigger: ['blur', 'change'],
        }],
        author: [{ required: true, message: this.$t('content.pleaseFillAuthor'), trigger: ['blur', 'change'] }],
        cid: [{ required: true, message: this.$t('content.pleaseSelectCategory'), trigger: ['blur', 'change'] }],
        cover: [{ required: true, message: this.$t('content.pleaseUploadCover'), trigger: 'change' }],
        synopsis: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(this.pram.synopsis, this.synopsisJsonForm)) callback();
            else callback(new Error(this.$t('content.pleaseFillArticleIntro')));
          },
          trigger: ['blur', 'change'],
        }],
        content: [{
          validator: (rule, value, callback) => {
            if (this.hasI18nHtml(this.pram.content, this.contentJsonForm)) callback();
            else callback(new Error(this.$t('content.pleaseFillArticleContent')));
          },
          trigger: ['blur', 'change'],
        }],
      };
    },
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route);
  },
  mounted() {
    this.getLanguageList();
    if (localStorage.getItem('articleClass')) {
      this.categoryTreeData = JSON.parse(localStorage.getItem('articleClass'));
    } else {
      this.handlerGetCategoryTreeData();
    }
    if (this.$route.params.id) {
      this.getInfo();
      this.setTagsViewTitle();
    }
  },
  methods: {
    localizedCategoryName(row) {
      return getLocalizedName(row, getUiLocale(this));
    },
    htmlHasText(html) {
      return String(html || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim().length > 0;
    },
    hasI18nHtml(defaultHtml, form) {
      if (this.htmlHasText(defaultHtml)) return true;
      return Object.keys(form || {}).some((key) => this.htmlHasText(form[key]));
    },
    emptyLangForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseLangJson(json) {
      const form = this.emptyLangForm();
      if (!json) return form;
      try {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // ignore
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
          this.titleJsonForm = this.parseLangJson(this.pram.titleJson);
          this.synopsisJsonForm = this.parseLangJson(this.pram.synopsisJson);
          this.contentJsonForm = this.parseLangJson(this.pram.contentJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.titleJsonForm = this.parseLangJson(this.pram.titleJson);
          this.synopsisJsonForm = this.parseLangJson(this.pram.synopsisJson);
          this.contentJsonForm = this.parseLangJson(this.pram.contentJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    getInfo() {
      articleApi.InfoArticle(this.$route.params.id).then((data) => {
        this.editData = data;
        this.hadlerInitEditData();
      });
    },
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          _this.pram.cover = img[0].sattDir;
        },
        multiple,
        'content',
      );
    },
    hadlerInitEditData() {
      if (!this.$route.params.id) return;
      const {
        author,
        cid,
        content,
        contentJson,
        cover,
        isBanner,
        isHot,
        shareSynopsis,
        shareTitle,
        sort,
        synopsis,
        synopsisJson,
        title,
        titleJson,
        id,
      } = this.editData;
      this.pram.author = author;
      this.pram.cid = Number.parseInt(cid);
      this.pram.content = content;
      this.pram.contentJson = contentJson || '';
      this.pram.cover = cover;
      this.pram.isBanner = isBanner;
      this.pram.isHot = isHot;
      this.pram.shareSynopsis = shareSynopsis;
      this.pram.shareTitle = shareTitle;
      this.pram.sort = sort;
      this.pram.synopsis = synopsis;
      this.pram.synopsisJson = synopsisJson || '';
      this.pram.title = title;
      this.pram.titleJson = titleJson || '';
      this.pram.id = id;
      this.titleJsonForm = this.parseLangJson(titleJson);
      this.synopsisJsonForm = this.parseLangJson(synopsisJson);
      this.contentJsonForm = this.parseLangJson(contentJson);
      this.activeLang = resolveFormActiveLang(this);
    },
    handlerGetCategoryTreeData() {
      articleApi.articleCategoryListApi().then((data) => {
        this.categoryTreeData = data;
        let list = data.filter((item) => {
          return item.status;
        });
        localStorage.setItem('articleClass', JSON.stringify(list));
      });
    },
    buildPayload() {
      const titleJson = buildI18nNameJson(this.langOptions, this.titleJsonForm, this.defaultLangCode, this.pram.title);
      const synopsisJson = buildI18nNameJson(this.langOptions, this.synopsisJsonForm, this.defaultLangCode, this.pram.synopsis);
      const contentJson = buildI18nNameJson(this.langOptions, this.contentJsonForm, this.defaultLangCode, this.pram.content);
      return {
        ...this.pram,
        title: this.pram.title,
        titleJson,
        synopsis: this.pram.synopsis,
        synopsisJson,
        content: this.pram.content,
        contentJson,
        shareTitle: this.pram.title,
        shareSynopsis: this.pram.synopsis,
      };
    },
    handerSubmit: Debounce(function (form) {
      this.$refs[form].validate((valid) => {
        if (!valid) return;
        if (!this.$route.params.id) {
          this.handlerSave();
        } else {
          this.handlerUpdate();
        }
      });
    }),
    handlerUpdate() {
      this.loading = true;
      articleApi
        .UpdateArticle(this.buildPayload())
        .then((data) => {
          this.$message.success(this.$t('content.editArticleSuccess'));
          this.loading = false;
          this.$router.push({ path: '/marketing/content/articleManager' });
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handlerSave() {
      this.loading = true;
      articleApi
        .AddArticle(this.buildPayload())
        .then((data) => {
          this.$message.success(this.$t('content.addArticleSuccess'));
          this.loading = false;
          this.$router.push({ path: '/marketing/content/articleManager' });
        })
        .catch(() => {
          this.loading = false;
        });
    },
    setTagsViewTitle() {
      const title = this.$t('content.editArticle');
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.$route.params.id}` });
      this.$store.dispatch('tagsView/updateVisitedView', route);
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
</style>
