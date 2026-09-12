// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import Layout from '@/layout';

const productRouter = {
  path: '/product',
  component: Layout,
  redirect: '/product/list',
  name: 'Product',
  meta: {
    title: '{{ product.titleProduct }}',
    icon: 'clipboard',
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/product/index'),
      name: 'ProductList',
      meta: { title: '{{ product.titleProductList }}', icon: '' },
    },
    {
      path: 'cdkey',
      component: () => import('@/views/product/cdkey/index'),
      name: 'Cdkey',
      meta: { title: '{{ product.titleCdkey }}', icon: '' },
    },
    {
      //id:卡密库id
      path: 'cdkey/creatCdkey/:id?/:name?',
      component: () => import('@/views/product/cdkey/creatCdkey'),
      name: 'creatCdkey',
      meta: { title: '{{ product.titleCdkeyAdd }}', noCache: true, activeMenu: `/product/cdkey` },
      hidden: true,
    },
    {
      path: 'classify',
      component: () => import('@/views/product/category/index'),
      name: 'ProductClassify',
      meta: { title: '{{ product.titleCategory }}', icon: '' },
    },
    {
      path: 'attr',
      component: () => import('@/views/product/attr/index'),
      name: 'ProductAttr',
      meta: { title: '{{ product.titleAttr }}', icon: '' },
    },
    {
      path: 'comment',
      component: () => import('@/views/product/comment/index'),
      name: 'ProductComment',
      meta: { title: '{{ product.titleComment }}', icon: '' },
    },
    {
      //id:商品id，isDisabled：是否能编辑(1不能，2能)，isCopy：是否是采集商品(1是，2不是),productType:商品类型
      path: 'list/creatProduct/:id?/:isDisabled/:isCopy/:productType?',
      component: () => import('@/views/product/creatProduct/index'),
      name: 'creatProduct',
      meta: { title: '{{ product.titleProductAdd }}', noCache: true, activeMenu: `/product/list` },
      hidden: true,
    },
    {
      path: 'guarantee/group',
      component: () => import('@/views/product/guarantee/index'),
      name: 'ProductGuarantee',
      meta: { title: '{{ product.titleGuarantee }}', icon: '' },
    },
    {
      path: 'label',
      component: () => import('@/views/product/label/index'),
      name: 'ProductLabel',
      meta: { title: '{{ product.titleLabel }}', icon: '' },
    },
  ],
};

export default productRouter;
