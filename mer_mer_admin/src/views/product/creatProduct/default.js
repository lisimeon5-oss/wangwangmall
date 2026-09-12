import i18n from '@/i18n';
export const defaultObj = {
  image: '',
  sliderImages: [],
  sliderImage: '',
  name: '',
  nameJson: {},
  intro: '',
  introJson: {},
  imageJson: {},
  sliderImagesJson: {},
  contentJson: {},
  keyword: '',
  cateIds: [], // 商品分类id
  cateId: null, // 商品分类id传值
  unitName: '',
  unitNameJson: {},
  sort: 0,
  isShow: false,
  tempId: '',
  header: [],
  attrValueList: [
    {
      image: '',
      brokerage: 0,
      brokerageTwo: 0,
      price: 0.01,
      vipPrice: 0.01,
      cost: 0.01,
      otPrice: 0.01,
      stock: 0,
      barCode: '',
      itemNumber: '',
      weight: 0,
      volume: 0,
      cdkeyId: null,
      cdkeyLibraryName: '',
      expand: '',
      isShow: true,
    },
  ], // 数据提交用
  attrList: [], // 数据提交用
  attrs: [], ////数据渲染用
  selectRule: '',
  isSub: false,
  isPaidMember: false,
  content: '',
  specType: false,
  id: undefined,
  couponIds: [],
  coupons: [],
  categoryId: 0,
  guaranteeIds: '',
  guaranteeIdsList: null,
  brandId: '',
  type: 0, // 商品类型
  isAutoSubmitAudit: false, //是否自动提审
  isAutoUp: false, //是否自动上架
  deliveryMethodList: ['1'],
  deliveryMethod: '',
  systemFormId: null,
  refundSwitch: true,
};
export const objTitle = () => ({
  price: {
    title: i18n.t('product.salePrice'),
  },
  vipPrice: {
    title: i18n.t('product.memberPrice'),
  },
  cost: {
    title: i18n.t('product.costPrice'),
  },
  otPrice: {
    title: i18n.t('product.strikePrice'),
  },
  stock: {
    title: i18n.t('product.stock'),
  },
  barCode: {
    title: i18n.t('product.productCode'),
  },
  itemNumber: {
    title: i18n.t('product.productBarcode'),
  },
  weight: {
    title: i18n.t('product.weightKG'),
  },
  volume: {
    title: i18n.t('product.volumeM3'),
  },
  brokerage: {
    title: i18n.t('product.firstCommission'),
  },
  brokerageTwo: {
    title: i18n.t('product.secondCommission'),
  },
});
