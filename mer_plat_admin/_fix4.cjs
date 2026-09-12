const fs = require('fs');
function fix(path, replacements) {
  let s = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!s.includes(from)) { console.log('WARN not found: ' + from.slice(0, 60)); continue; }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(path, s);
  console.log('fixed ' + path);
}

fix('src/views/videoChannel/weChatcategoryAndBrand/brandList.vue', [
  ["'第 ' + item + ' 类'", "$t('videoChannel.stepPrefix') + item + ' ' + $t('videoChannel.categoryUnit')"],
  ['>第 "{{ item }}" 类', ">{{ $t('videoChannel.stepPrefix') }} \"{{ item }}\" {{ $t('videoChannel.categoryUnit') }}"],
]);

fix('src/views/videoChannel/info.vue', [
  ['资质类型说明：{{ productQualification }}', "{{ $t('videoChannel.qualificationTypeDescLabel') }}{{ productQualification }}"],
]);

fix('src/views/systemSetting/administratorAuthority/permissionRules/index.vue', [
  ['.confirm(\'是否确认删除名称为"\' + row.name + \'"的数据项？\')', ".confirm(this.$t('merchant.deleteNamedConfirm', { name: row.name }))"],
]);

fix('src/views/systemSetting/notification/index.vue', [
  ['小程序经营类目：生活服务 > {{', "{{ $t('systemSetting.miniProgramCategoryLabel') }}{{"],
]);
