// 导出TableHead 数据
import i18n from '@/i18n';
export const GoodsTableHead = () => [
  {
    title: i18n.t('product.salePriceShort'),
    slot: 'price',
    align: 'center',
    minWidth: '130px',
  },
  {
    title: i18n.t('product.costPriceShort'),
    slot: 'cost',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.strikePriceShort'),
    slot: 'otPrice',
    align: 'center',
    minWidth: '150px',
  },
  {
    title: i18n.t('product.stock'),
    slot: 'stock',
    align: 'center',
    minWidth: '90px',
  },
  {
    title: i18n.t('product.productCode'),
    slot: 'barCode',
    align: 'center',
    minWidth: '120px',
  },
  {
    title: i18n.t('product.productBarcode'),
    slot: 'itemNumber',
    align: 'center',
    minWidth: '120px',
  },
  {
    title: i18n.t('product.weightKG'),
    slot: 'weight',
    align: 'center',
    minWidth: '130px',
  },
  {
    title: i18n.t('product.volumeM3'),
    slot: 'volume',
    align: 'center',
    minWidth: '120px',
  },
  {
    title: i18n.t('product.defaultSelectedSpec'),
    slot: 'isDefault',
    fixed: 'right',
    align: 'center',
    minWidth: '100px',
  },
  {
    title: i18n.t('product.operate'),
    slot: 'action',
    fixed: 'right',
    align: 'center',
    minWidth: '120px',
  },
];

// 佣金
export const commissionTableHead = () => [
  {
    title: i18n.t('product.firstCommission'),
    slot: 'brokerage',
    align: 'center',
    minWidth: 100,
  },
  {
    title: i18n.t('product.secondCommission'),
    slot: 'brokerageTwo',
    align: 'center',
    minWidth: 100,
  },
];

// 图片
export const imageTableHead = () => [
  {
    title: i18n.t('product.image'),
    slot: 'image',
    align: 'center',
    minWidth: 60,
  },
];

// 会员价
export const vipPriceTableHead = () => [
  {
    title: i18n.t('product.memberPriceShort'),
    slot: 'vipPrice',
    align: 'center',
    minWidth: 120,
  },
];

// 云盘
export const VirtualTableHead = () => [
  {
    title: i18n.t('product.salePriceShort'),
    slot: 'price',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.costPriceShort'),
    slot: 'cost',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.strikePriceShort'),
    slot: 'otPrice',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.stock'),
    slot: 'stock',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.productCode'),
    slot: 'barCode',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.cloudDiskSettings'),
    slot: 'fictitious',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.defaultSelectedSpec'),
    slot: 'isDefault',
    fixed: 'right',
    align: 'center',
    minWidth: 90,
  },
  {
    title: i18n.t('product.operate'),
    slot: 'action',
    fixed: 'right',
    align: 'center',
    minWidth: 120,
  },
];
//   卡密设置
export const VirtualTableHead2 = () => [
  {
    title: i18n.t('product.salePriceShort'),
    slot: 'price',
    align: 'center',
    minWidth: 100,
  },
  {
    title: i18n.t('product.costPriceShort'),
    slot: 'cost',
    align: 'center',
    minWidth: 100,
  },
  {
    title: i18n.t('product.strikePriceShort'),
    slot: 'otPrice',
    align: 'center',
    minWidth: 100,
  },
  {
    title: i18n.t('product.stock'),
    slot: 'stock',
    align: 'center',
    minWidth: 100,
  },
  {
    title: i18n.t('product.productCode'),
    slot: 'barCode',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.cdkeySettings'),
    slot: 'fictitious',
    align: 'center',
    minWidth: 150,
  },
  {
    title: i18n.t('product.defaultSelectedSpec'),
    slot: 'isDefault',
    fixed: 'right',
    align: 'center',
    minWidth: 90,
  },
  {
    title: i18n.t('product.operate'),
    slot: 'action',
    fixed: 'right',
    align: 'center',
    minWidth: 120,
  },
];

//虚拟商品
export const FictitiousTableHead = () => [
  {
    title: i18n.t('product.salePriceShort'),
    slot: 'price',
    align: 'center',
    minWidth: '130px',
  },
  {
    title: i18n.t('product.costPriceShort'),
    slot: 'cost',
    align: 'center',
    minWidth: 120,
  },
  {
    title: i18n.t('product.strikePriceShort'),
    slot: 'otPrice',
    align: 'center',
    minWidth: '150px',
  },
  {
    title: i18n.t('product.stock'),
    slot: 'stock',
    align: 'center',
    minWidth: '90px',
  },
  {
    title: i18n.t('product.productCode'),
    slot: 'barCode',
    align: 'center',
    minWidth: '120px',
  },
  {
    title: i18n.t('product.weightKG'),
    slot: 'weight',
    align: 'center',
    width: '130px',
  },
  {
    title: i18n.t('product.volumeM3'),
    slot: 'volume',
    align: 'center',
    minWidth: '120px',
  },
  {
    title: i18n.t('product.defaultSelectedSpec'),
    slot: 'isDefault',
    fixed: 'right',
    align: 'center',
    minWidth: '100px',
  },
  {
    title: i18n.t('product.operate'),
    slot: 'action',
    fixed: 'right',
    align: 'center',
    minWidth: '120px',
  },
];
