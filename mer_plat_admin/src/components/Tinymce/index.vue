<template>
  <div :class="{ fullscreen: fullscreen }" class="tinymce-container editor-container">
    <textarea :id="tinymceId" class="tinymce-textarea" />
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

import plugins from './plugins';
import toolbar from './toolbar';
import {uploadImage} from "@/utils/ZBKJIutil";

export default {
  name: 'Tinymce',
  props: {
    id: {
      type: String,
      default: function () {
        return 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '');
      },
    },
    value: {
      type: String,
      default: '',
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    menubar: {
      type: String,
      default: 'file edit insert view format table',
    },
    height: {
      type: Number,
      required: false,
      default: 400,
    },
  },
  data() {
    return {
      hasChange: false,
      hasInit: false,
      tinymceId: this.id,
      fullscreen: false,
      languageTypeList: {
        'zh-cn': 'zh_CN',
        en: 'en',
        th: 'th',
        my: 'my',
      },
    };
  },
  computed: {
    currentLocale() {
      return (
        (this.$store &&
          this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        (this.$i18n && this.$i18n.locale) ||
        'zh-cn'
      );
    },
    language() {
      return this.languageTypeList[this.currentLocale] || 'en';
    },
  },
  watch: {
    value(val) {
      if (!this.hasChange && this.hasInit) {
        this.$nextTick(() => window.tinymce.get(this.tinymceId).setContent(val || ''));
      }
    },
    language() {
      this.destroyTinymce();
      this.$nextTick(() => this.initTinymce());
    },
  },
  mounted() {
    this.initTinymce();
  },
  activated() {
    this.initTinymce();
  },
  deactivated() {
    this.destroyTinymce();
  },
  destroyed() {
    this.destroyTinymce();
  },
  methods: {
    initTinymce() {
      const _this = this;
      const lang = this.language;
      const i18nApi = window.tinymce && window.tinymce.util && window.tinymce.util.I18n;
      if (i18nApi && typeof i18nApi.setCode === 'function') {
        i18nApi.setCode(lang);
      }
      const initConfig = {
        language: lang,
        selector: `#${this.tinymceId}`,
        height: this.height,
        body_class: 'panel-body ',
        object_resizing: false,
        toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
        menubar: this.menubar,
        plugins: plugins,
        end_container_on_empty_block: true,
        powerpaste_word_import: 'clean',
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: 'square',
        advlist_number_styles: 'default',
        imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
        default_link_target: '_blank',
        link_title: false,
        convert_urls: false, //防止路径被转化为相对路径
        paste_data_images: true, // 默认是false的，记得要改为true才能粘贴
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        init_instance_callback: (editor) => {
          if (_this.value) {
            editor.setContent(_this.value);
          }
          _this.hasInit = true;
          editor.on('NodeChange Change KeyUp SetContent', () => {
            this.hasChange = true;
            this.$emit('input', editor.getContent());
          });
        },
        setup(editor) {
          editor.addButton('Upload', {
            icon: 'image',
            tooltip: _this.$t('tinymce.uploadImage'),
            onclick: function () {
              _this.modalPicTap(true)
            },
          });
        },
        images_upload_handler: async (blobInfo, succFun, failFun) => {
          var file = blobInfo.blob(); //转化为易于理解的file对象
          const formData = new FormData();
          const data = {
            model: 'product',
            pid: 0,
          };
          formData.append('multipart', file);
          try {
            let res = await uploadImage(formData, data);
            succFun(res.url);
          } catch (e) {}
        },
      };
      if (lang && lang !== 'en') {
        initConfig.language_url = `${process.env.BASE_URL || '/'}static/tinymce4.7.5/langs/${lang}.js`;
      }
      window.tinymce.init(initConfig);
    },
    modalPicTap(multiple) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          let arr = [];
          if (img.length > 10) return this.$message.warning(_this.$t('tinymce.maxSelectImages'));
          img.map((item) => {
            arr.push(item.sattDir);
          });
          _this.imageSuccessCBK(arr);
        },
        multiple,
        'content',
      );
    },
    destroyTinymce() {
      const tinymce = window.tinymce.get(this.tinymceId);
      if (this.fullscreen) {
        tinymce.execCommand('mceFullScreen');
      }

      if (tinymce) {
        tinymce.destroy();
      }
    },
    setContent(value) {
      window.tinymce.get(this.tinymceId).setContent(value);
    },
    getContent() {
      window.tinymce.get(this.tinymceId).getContent();
    },
    imageSuccessCBK(arr) {
      const _this = this;
      arr.forEach((v) => {
        if (this.getFileType(v) == 'video') {
          window.tinymce.get(_this.tinymceId).insertContent(`<video class="wscnph" src="${v}" controls muted></video>`);
        } else {
          window.tinymce.get(_this.tinymceId).insertContent(`<img class="wscnph" src="${v}" />`);
        }
      });
    },
    getFileType(fileName) {
      // 后缀获取
      let suffix = '';
      // 获取类型结果
      let result = '';
      try {
        const flieArr = fileName.split('.');
        suffix = flieArr[flieArr.length - 1];
      } catch (err) {
        suffix = '';
      }
      // fileName无后缀返回 false
      if (!suffix) {
        return false;
      }
      suffix = suffix.toLocaleLowerCase();
      // 图片格式
      const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
      // 进行图片匹配
      result = imglist.find((item) => item === suffix);
      if (result) {
        return 'image';
      }
      // 匹配 视频
      const videolist = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v'];
      result = videolist.find((item) => item === suffix);
      if (result) {
        return 'video';
      }
      // 其他 文件类型
      return 'other';
    },
  },
};
</script>

<style scoped>
.tinymce-container {
  position: relative;
  line-height: normal;
}
.tinymce-container >>> .mce-fullscreen {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  /*z-index: 2005;*/
}
.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}
.editor-upload-btn {
  display: inline-block;
}
</style>
