import { productCouponListApi } from '@/api/product';
import { defaultObj } from '@/views/product/creatProduct/default';

export default {
  data() {
    return {
      formValidate: Object.assign({}, defaultObj, { nameJson: {}, unitNameJson: {}, introJson: {}, imageJson: {}, sliderImagesJson: {}, contentJson: {} }),
      attrInfo: {},
    };
  },
  computed: {
    isProductDefaultLang() {
      return (this.activeLang || 'zh-cn') === (this.defaultLangCode || 'zh-cn');
    },
    currentCover() {
      if (this.isProductDefaultLang) return this.formValidate.image;
      const map = this.formValidate.imageJson || {};
      return map[this.activeLang] || '';
    },
    currentProductContent: {
      get() {
        if (this.isProductDefaultLang) return this.formValidate.content || '';
        const map = this.formValidate.contentJson || {};
        return map[this.activeLang] || '';
      },
      set(val) {
        if (this.isProductDefaultLang) {
          this.formValidate.content = val;
          return;
        }
        if (!this.formValidate.contentJson || typeof this.formValidate.contentJson !== 'object') {
          this.$set(this.formValidate, 'contentJson', {});
        }
        this.$set(this.formValidate.contentJson, this.activeLang, val);
      },
    },
    currentSliderList() {
      if (this.isProductDefaultLang) return this.formValidate.sliderImages || [];
      if (!this.formValidate.sliderImagesJson || typeof this.formValidate.sliderImagesJson !== 'object') {
        return [];
      }
      const list = this.formValidate.sliderImagesJson[this.activeLang];
      return Array.isArray(list) ? list : [];
    },
    displayProductContent() {
      const map = this.formValidate.contentJson || {};
      if (this.isProductDefaultLang) {
        if (!this.isProductHtmlBlank(this.formValidate.content)) return this.formValidate.content;
      } else if (!this.isProductHtmlBlank(map[this.activeLang])) {
        return map[this.activeLang];
      }
      if (!this.isProductHtmlBlank(this.formValidate.content)) return this.formValidate.content;
      const hit = Object.keys(map)
        .map((k) => map[k])
        .find((v) => !this.isProductHtmlBlank(v));
      return hit || '';
    },
    headTab() {
      return [
        { tit: this.$t('product.productInfoTab'), name: '1' },
        { tit: this.$t('product.specStockTab'), name: '2' },
        { tit: this.$t('product.productDetailTab'), name: '3' },
        { tit: this.$t('product.otherSettingsTab'), name: '4' },
      ];
    },
  },
  methods: {
    // 解析多语言字段 JSON 字符串（商品名称、单位等）
    parseLangJson(json) {
      if (!json) return {};
      if (typeof json === 'object') return json;
      try {
        const parsed = JSON.parse(json);
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        return {};
      }
    },
    parseImageJson(json) {
      const obj = this.parseLangJson(json);
      const out = {};
      Object.keys(obj).forEach((k) => {
        const val = obj[k];
        out[k] = val ? this.$selfUtil.setDomain(val) : '';
      });
      return out;
    },
    parseSliderImagesJson(json) {
      const obj = this.parseLangJson(json);
      const out = {};
      Object.keys(obj).forEach((k) => {
        let v = obj[k];
        if (typeof v === 'string') {
          try {
            v = JSON.parse(v);
          } catch (e) {
            v = v ? [v] : [];
          }
        }
        if (!Array.isArray(v)) v = [];
        out[k] = v.map((u) => this.$selfUtil.setDomain(u));
      });
      return out;
    },
    localizeContentJson(map) {
      const out = {};
      Object.keys(map || {}).forEach((k) => {
        out[k] = map[k] ? this.$selfUtil.replaceImgSrcHttps(map[k]) : '';
      });
      return out;
    },
    ensureSliderLang() {
      if (!this.formValidate.sliderImagesJson || typeof this.formValidate.sliderImagesJson !== 'object') {
        this.$set(this.formValidate, 'sliderImagesJson', {});
      }
      if (!this.isProductDefaultLang && !Array.isArray(this.formValidate.sliderImagesJson[this.activeLang])) {
        this.$set(this.formValidate.sliderImagesJson, this.activeLang, []);
      }
    },
    hasAnyProductCover() {
      if (String((this.formValidate && this.formValidate.image) || '').trim()) return true;
      const map = (this.formValidate && this.formValidate.imageJson) || {};
      return Object.keys(map).some((k) => String(map[k] || '').trim());
    },
    hasAnyProductSlider() {
      const def = this.formValidate && this.formValidate.sliderImages;
      if (Array.isArray(def) && def.length) return true;
      const map = (this.formValidate && this.formValidate.sliderImagesJson) || {};
      return Object.keys(map).some((k) => Array.isArray(map[k]) && map[k].length);
    },
    isProductHtmlBlank(html) {
      if (html == null || String(html).trim() === '') return true;
      const raw = String(html);
      if (/<(img|video|iframe|embed|source)\b/i.test(raw)) return false;
      const text = raw
        .replace(/<[^>]+>/gi, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return !text;
    },
    hasAnyProductContent() {
      if (!this.isProductHtmlBlank(this.formValidate && this.formValidate.content)) return true;
      const map = (this.formValidate && this.formValidate.contentJson) || {};
      return Object.keys(map).some((k) => !this.isProductHtmlBlank(map[k]));
    },
    fillDefaultMediaFromAnyLang() {
      if (!String(this.formValidate.image || '').trim()) {
        const map = this.formValidate.imageJson || {};
        const hit = Object.keys(map)
          .map((k) => map[k])
          .find((v) => String(v || '').trim());
        if (hit) {
          this.formValidate.image = hit;
          if (this.OneattrValue && this.OneattrValue[0] && !this.OneattrValue[0].image) {
            this.OneattrValue[0].image = hit;
          }
        }
      }
      if (!Array.isArray(this.formValidate.sliderImages) || !this.formValidate.sliderImages.length) {
        const map = this.formValidate.sliderImagesJson || {};
        const hit = Object.keys(map)
          .map((k) => map[k])
          .find((v) => Array.isArray(v) && v.length);
        if (hit) this.formValidate.sliderImages = [...hit];
      }
      if (this.isProductHtmlBlank(this.formValidate.content)) {
        const map = this.formValidate.contentJson || {};
        const hit = Object.keys(map)
          .map((k) => map[k])
          .find((v) => !this.isProductHtmlBlank(v));
        if (hit) this.formValidate.content = hit;
      }
    },
    setCurrentCover(url) {
      if (this.isProductDefaultLang) {
        this.formValidate.image = url;
        if (this.OneattrValue && this.OneattrValue[0]) this.OneattrValue[0].image = url;
      } else {
        if (!this.formValidate.imageJson || typeof this.formValidate.imageJson !== 'object') {
          this.$set(this.formValidate, 'imageJson', {});
        }
        this.$set(this.formValidate.imageJson, this.activeLang, url);
      }
      this.$nextTick(() => {
        if (this.$refs.formValidate) this.$refs.formValidate.validateField('image');
      });
    },
    getData(res, type) {
      let info = res;
      this.formValidate.content = '';
      this.formValidate = {
        ...info,
        image: this.$selfUtil.setDomain(info.image),
        nameJson: this.parseLangJson(info.nameJson),
        unitNameJson: this.parseLangJson(info.unitNameJson),
        introJson: this.parseLangJson(info.introJson),
        imageJson: this.parseImageJson(info.imageJson),
        sliderImagesJson: this.parseSliderImagesJson(info.sliderImageJson),
        contentJson: this.localizeContentJson(this.parseLangJson(info.contentJson)),
        sliderImages: JSON.parse(info.sliderImage),
        cateIds: info.cateId ? info.cateId.split(',') : [], // 商品分类id
        sort: info.sort ? info.sort : 0,
        attrList: info.attrList ? info.attrList : [],
        attrValueList: info.attrValueList ? info.attrValueList : [],
        isSub: info.isSub ? info.isSub : false,
        content: info.content ? this.$selfUtil.replaceImgSrcHttps(info.content) : '',
        id: info.id ? info.id : 0,
        coupons: info.coupons ? info.coupons : [],
        couponIds: info.couponIds ? info.couponIds : [],
        type: info.type ? info.type : Number(this.$route.params.productType),
        guaranteeIdsList: info.guaranteeIds ? info.guaranteeIds.split(',').map(Number) : [], //保障服务
        isPaidMember: info.isPaidMember ? info.isPaidMember : false,
        deliveryMethodList: info.deliveryMethod ? info.deliveryMethod.split(',') : ['1'],
        systemFormId: info.systemFormId ? info.systemFormId : null,
        refundSwitch: type === 'add' ? info.refundSwitch : true,
        // categoryId: info.categoryId ? info.categoryId : '',
        // brandId: info.brandId ? info.brandId : ''
      };
      this.htmlKey++;
      this.labelarr = info.keyword ? info.keyword.split(',') : [];
      if (this.formValidate.categoryId) {
        this.getbrandList();
        this.brandList.push({ name: '其他', id: 0 });
      }
      if (this.formValidate.couponIds && this.formValidate.couponIds.length) {
        productCouponListApi().then((res) => {
          let ids = this.formValidate.couponIds.toString();
          let arr = res;
          let obj = {};
          for (let i in arr) {
            obj[arr[i].id] = arr[i];
          }
          let strArr = ids.split(',');
          let newArr = [];
          for (let item of strArr) {
            if (obj[item]) {
              newArr.push(obj[item]);
            }
          }
          this.$set(this.formValidate, 'coupons', newArr); //在编辑回显时，让返回数据中的优惠券id，通过接口匹配显示,
        });
      }

      let imgs = JSON.parse(info.sliderImage);
      let imgss = [];
      Object.keys(imgs).map((i) => {
        imgss.push(this.$selfUtil.setDomain(imgs[i]));
      });
      this.formValidate.sliderImages = [...imgss];
      if (this.getFileType(this.formValidate.sliderImages[0]) == 'video') {
        //如果返回数据轮播图的第一张是视频，就将其赋值给videoLink做渲染，同时将其在轮播图中删除
        this.$set(this, 'videoLink', this.formValidate.sliderImages[0]);
        this.formValidate.sliderImages.splice(0, 1);
      }
      if (info.specType) {
        if (info.attrValueList) {
          info.attrValueList.forEach((val) => {
            val.image = this.$selfUtil.setDomain(val.image);
            val.attrValueShow = JSON.parse(val.attrValue);
            val.attr_arr = val.sku.split(',');
            val.brokerage = val.brokerage || 0;
            val.brokerageTwo = val.brokerageTwo || 0;
            val.vipPrice = val.vipPrice || 0;
          });
          this.ManyAttrValue = [...this.oneFormBatch, ...info.attrValueList];
        } else {
          if (this.formValidate.attrList.length) {
            this.oneFormBatch[0].image = this.$selfUtil.setDomain(info.image);
          }
        }
      } else {
        this.OneattrValue = info.attrValueList;
      }
      if (typeof this.applyLangList === 'function' && this.langList && this.langList.length) {
        this.applyLangList(this.langList);
      }
    },
    // 点击商品图
    modalPicTap(tit, num, i, status) {
      const _this = this;
      if (_this.isDisabled) return;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (tit === '1' && !num) {
            _this.setCurrentCover(img[0].sattDir);
          }
          if (tit === '2' && !num) {
            _this.ensureSliderLang();
            const list = _this.isProductDefaultLang ? _this.formValidate.sliderImages : _this.formValidate.sliderImagesJson[_this.activeLang];
            if (img.length > 10) return this.$message.warning(this.$t('upload.maxSelectImages'));
            if (img.length + list.length > 10) return this.$message.warning(this.$t('upload.maxSelectImages'));
            img.map((item) => {
              list.push(item.sattDir);
            });
            _this.$nextTick(() => {
              if (_this.$refs.formValidate) _this.$refs.formValidate.validateField('sliderImages');
            });
          }
          if (tit === '1' && num === 'dan') {
            _this.OneattrValue[0].image = img[0].sattDir;
          }
          if (tit === '1' && num === 'duo') {
            _this.ManyAttrValue[i].image = img[0].sattDir;
          }
          if (tit === '1' && num === 'pi') {
            _this.oneFormBatch[0].image = img[0].sattDir;
          }
        },
        tit,
        'content',
      );
    },
    // 移动
    handleDragStart(e, item) {
      if (!this.isDisabled) this.dragging = item;
    },
    handleDragEnd(e, item) {
      if (!this.isDisabled) this.dragging = null;
    },
    handleDragOver(e) {
      if (!this.isDisabled) e.dataTransfer.dropEffect = 'move';
    },
    // 移动关键代码，包含轮播图、规格
    handleDragEnter(e, item, index) {
      if (!this.isDisabled) {
        e.dataTransfer.effectAllowed = 'move';
        if (item === this.dragging) {
          return;
        }
        let newItems = [];
        this.ensureSliderLang();
        newItems = this.isProductDefaultLang
          ? [...this.formValidate.sliderImages]
          : [...(this.formValidate.sliderImagesJson[this.activeLang] || [])];
        const src = newItems.indexOf(this.dragging);
        const dst = newItems.indexOf(item);
        newItems.splice(dst, 0, ...newItems.splice(src, 1));
        if (this.isProductDefaultLang) {
          this.formValidate.sliderImages = newItems;
        } else {
          this.$set(this.formValidate.sliderImagesJson, this.activeLang, newItems);
        }
      }
    },
  },
};
