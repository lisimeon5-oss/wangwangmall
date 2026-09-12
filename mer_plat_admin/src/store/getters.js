// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import { localizeNamedTree } from '@/utils/localizedName';

const getters = {
  sidebar: (state) => state.app.sidebar,
  size: (state) => state.app.size,
  device: (state) => state.app.device,
  visitedViews: (state) => state.tagsView.visitedViews,
  cachedViews: (state) => state.tagsView.cachedViews,
  token: (state) => state.user.token,
  avatar: (state) => state.user.avatar,
  name: (state) => state.user.name,
  introduction: (state) => state.user.introduction,
  roles: (state) => state.user.roles,
  permission_routes: (state) => state.permission.routes,
  permissions: (state) => state.user.permissions,
  sidebarRouters: (state) => state.permission.sidebarRouters,
  errorLogs: (state) => state.errorLog.logs,
  isLogin: (state) => state.user.isLogin,
  merPlatProductClassify: (state) =>
    localizeNamedTree(
      state.product.merPlatProductClassify,
      (state.themeConfig && state.themeConfig.themeConfig && state.themeConfig.themeConfig.globalI18n) || 'zh-cn',
    ),
  productBrand: (state) => state.product.productBrand,
  merchantClassify: (state) =>
    localizeNamedTree(
      state.merchant.merchantClassify,
      (state.themeConfig && state.themeConfig.themeConfig && state.themeConfig.themeConfig.globalI18n) || 'zh-cn',
    ),
  merchantType: (state) =>
    localizeNamedTree(
      state.merchant.merchantType,
      (state.themeConfig && state.themeConfig.themeConfig && state.themeConfig.themeConfig.globalI18n) || 'zh-cn',
    ),
  frontDomain: (state) => state.settings.frontDomain,
  mediaDomain: (state) => state.settings.mediaDomain,
  mobileTheme: (state) => state.settings.mobileTheme,
};
export default getters;
