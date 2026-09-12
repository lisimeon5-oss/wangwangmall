// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import axios from 'axios';
import { MessageBox, Message } from 'element-ui';
import store from '@/store';
import { getToken } from '@/utils/auth';
import SettingMer from '@/utils/settingMer';
import { isPhone } from '@/libs/wechat';
import i18n from '@/i18n';
import { backendMessageMap } from '@/i18n/backendMessageMap';

function translateApiMessage(message) {
  if (!message) return i18n.t('common.requestFailed');
  const key = backendMessageMap[message];
  return key ? i18n.t(key) : message;
}

const service = axios.create({
  baseURL: SettingMer.apiBaseURL,
  timeout: 60000, // 过期时间
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    // 发送请求之前做的
    const token = !store.getters.token ? sessionStorage.getItem('token') : store.getters.token;
    if (token) {
      config.headers['Authori-zation'] = token;
    }
    // 传递当前语言，供后端多语言接口返回对应语言内容
    config.headers['lang'] = i18n.locale;
    if (/get/i.test(config.method)) {
      config.params = config.params || {};
      config.params.temp = Date.parse(new Date()) / 1000;
      config.params.lang = i18n.locale;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // if the custom code is not 20000, it is judged as an error.
    if (res.code === 401) {
      Message.error(i18n.t('common.sessionInvalid'));
      if (window.location.pathname !== '/login') location.href = '/login';
    } else if (res.code === 403) {
      Message.error(i18n.t('common.noAccess'));
    }
    if (res.code !== 200 && res.code !== 401) {
      if (isPhone()) {
        //移动端
        return Promise.reject(res || 'Error');
      }
      Message({
        message: translateApiMessage(res.message),
        type: 'error',
        duration: 5 * 1000,
      });
      return Promise.reject();
    } else {
      return res.data;
    }
  },
  (error) => {
    Message({
      message: translateApiMessage(error.message),
      type: 'error',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  },
);

export default service;
