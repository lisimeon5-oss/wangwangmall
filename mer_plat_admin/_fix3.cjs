const fs = require('fs');
function fix(path, replacements) {
  let s = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (from instanceof RegExp) {
      if (!from.test(s)) { console.log('WARN regex not found: ' + from); continue; }
      s = s.replace(from, to);
    } else {
      if (!s.includes(from)) { console.log('WARN not found: ' + from.slice(0, 60)); continue; }
      s = s.split(from).join(to);
    }
  }
  fs.writeFileSync(path, s);
  console.log('fixed ' + path);
}

fix('src/views/maintain/authCRMEB/index.vue', [
  ['>授权码：{{ authCode }}', ">{{ $t('maintain.authCodeLabel') }}{{ authCode }}"],
]);

fix('src/views/onePass/smsConfig/components/loginFrom.vue', [
  [/content="\s*一号通为我司一个第三方平台[\s\S]*?登录成功后根据提示购买自己需要用到的服务即可"/, ':content="$t(\'onePass.onePassIntro\')"'],
]);

fix('src/views/onePass/smsConfig/index.vue', [
  ['}}，祝您每一天开心！', "}}{{ $t('onePass.haveANiceDay') }}"],
  [/一号通为我司一个第三方平台专门提供短信[\s\S]*?登录成功后根据提示购买自己需要用到的服务即可/, "{{ $t('onePass.onePassIntro') }}"],
]);

fix('src/views/onePass/smsConfig/components/tableList.vue', [
  ['}}未开通哦</span>', "}}{{ $t('onePass.notActivated') }}</span>"],
  ['点击立即开通按钮，即可使用{{', "{{ $t('onePass.activatePromptPrefix') }}{{"],
  ['}}服务哦～～～</span>', "}}{{ $t('onePass.activatePromptSuffix') }}</span>"],
  ['>开通{{ tableFrom.type | onePassTypeFilter }}服务</span>', ">{{ $t('onePass.activatePrefix') }}{{ tableFrom.type | onePassTypeFilter }}{{ $t('onePass.serviceWord') }}</span>"],
  ['>物流公司：{{ logisticsInfo.com }}', ">{{ $t('onePass.logisticsCompanyLabel') }}{{ logisticsInfo.com }}"],
  ['>物流单号：{{ logisticsInfo.num }}', ">{{ $t('onePass.logisticsNoLabel') }}{{ logisticsInfo.num }}"],
  ['`确定开通${', '`${this.$t(\'onePass.confirmActivatePrefix\')}${'],
  ['}吗?`', "}${this.$t('onePass.activateQuestion')}`"],
]);

fix('src/views/onePass/smsPay/index.vue', [
  ['}}条数: {{ item.num }}', "}}{{ $t('onePass.countLabel') }}: {{ item.num }}"],
  ["'  （ 支付码过期时间：' + code.invalid + ' ）'", "'（' + $t('onePass.paymentCodeExpiryLabel') + code.invalid + ' ）'"],
]);

fix('src/views/videoChannel/apply/index.vue', [
  ['>接入中{{ toRegister }}', ">{{ $t('videoChannel.accessing') }}{{ toRegister }}"],
  ['完成自定义版交易组件接入后，小程序即可在视频号中实现商品展示和带货等功能，进一步提升经营能力。若您已开通标准化交易组件，则暂不支持切换', "{{ $t('videoChannel.customTradingComponentTip') }}"],
  [/自定义交易组件开通后[\s\S]*?发布新的小程序\(跳转小程序下载页面\)/, "{{ $t('videoChannel.customTradingVersionTip') }}"],
  ['>接入场景', ">{{ $t('videoChannel.accessScene') }}"],
  ['>场景名称 {{', ">{{ $t('videoChannel.sceneNameLabel') }} {{"],
  ['客服售后 -》', "{{ $t('videoChannel.customerServiceAfterSales') }} -》"],
  ['电商平台 -》', "{{ $t('videoChannel.ecommercePlatform') }} -》"],
  ['>审核理由 {{', ">{{ $t('videoChannel.auditReasonLabel') }} {{"],
]);
