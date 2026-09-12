// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import * as store from '@/api/product';
import * as logistics from '@/api/logistics';
const state = {
  merPlatProductClassify: JSON.parse(localStorage.getItem('merPlatProductClassifyV2') || 'null') || [] /** 平台商品分类 **/,
  merProductClassify: JSON.parse(localStorage.getItem('merProductClassifyV2') || 'null') || [] /** 商户商品分类 **/,
  productBrand: [] /** 商品品牌 **/,
  shippingTemplates: JSON.parse(localStorage.getItem('shippingTemplates')) || [] /** 运费模板 **/,
};

const mutations = {
  SET_AdminProductClassify: (state, merPlatProductClassify) => {
    state.merPlatProductClassify = merPlatProductClassify;
    localStorage.removeItem('merPlatProductClassify');
    if (!merPlatProductClassify.length) localStorage.removeItem('merPlatProductClassifyV2');
    else localStorage.setItem('merPlatProductClassifyV2', JSON.stringify(merPlatProductClassify));
  },
  SET_MerProductClassify: (state, merProductClassify) => {
    state.merProductClassify = merProductClassify;
    localStorage.removeItem('merProductClassify');
    if (!merProductClassify.length) localStorage.removeItem('merProductClassifyV2');
    else localStorage.setItem('merProductClassifyV2', JSON.stringify(merProductClassify));
  },
  SET_ProductBrand: (state, productBrand) => {
    state.productBrand = productBrand;
    if (!productBrand.length) localStorage.removeItem('productBrand');
  },
  SET_ShippingTemplates: (state, shippingTemplates) => {
    state.shippingTemplates = shippingTemplates;
    if (!shippingTemplates.length) localStorage.removeItem('shippingTemplates');
  },
};

const actions = {
  /** 平台商品分类 **/
  getAdminProductClassify({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      store
        .categoryApi()
        .then(async (res) => {
          commit('SET_AdminProductClassify', changeNodes(res));
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /** 商户商品分类 **/
  getMerProductClassify({ commit }) {
    return new Promise((resolve, reject) => {
      store
        .storeCategoryAllApi()
        .then(async (res) => {
          commit('SET_MerProductClassify', changeNodes(res));
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /** 商品品牌 **/
  getMerProductBrand({ commit }) {
    return new Promise((resolve, reject) => {
      store
        .brandAllApi()
        .then(async (res) => {
          commit('SET_ProductBrand', res);
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /** 运费模板 **/
  getShippingTemplates({ commit }) {
    return new Promise((resolve, reject) => {
      logistics
        .shippingTemplatesList({
          keywords: '',
          page: 1,
          limit: 9999,
        })
        .then(async (res) => {
          commit('SET_ShippingTemplates', res.list);
          localStorage.setItem('shippingTemplates', JSON.stringify(res.list));
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

/** tree去除 childList=[] 的结构**/
const changeNodes = function (data) {
  if (data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      if (!data[i].isShow) {
        data[i].disabled = true;
      }
      if (!data[i].childList || data[i].childList.length < 1) {
        data[i].childList = undefined;
      } else {
        changeNodes(data[i].childList);
      }
    }
  }
  return data;
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  changeNodes,
};
