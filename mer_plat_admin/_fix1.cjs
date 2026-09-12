const fs = require('fs');

function fix(path, replacements) {
  let s = fs.readFileSync(path, 'utf8');
  for (const r of replacements) {
    if (r instanceof RegExp) {
      if (!r.test(s)) { console.log('WARN regex not found in ' + path + ': ' + r); continue; }
      s = s.replace(r, r.replacement);
    } else {
      const [from, to] = r;
      if (from instanceof RegExp) {
        if (!from.test(s)) { console.log('WARN regex not found in ' + path + ': ' + from); continue; }
        s = s.replace(from, to);
      } else {
        if (!s.includes(from)) { console.log('WARN not found in ' + path + ': ' + from.slice(0, 60)); continue; }
        s = s.split(from).join(to);
      }
    }
  }
  fs.writeFileSync(path, s);
  console.log('fixed ' + path);
}

fix('src/views/product/index.vue', [
  ["scope.row.specType ? '[多规格]' : '[单规格]'", "scope.row.specType ? $t('product.multiSpec') : $t('product.singleSpec')"],
  ['<span style="padding-right:5px;">操作</span>', '<span style="padding-right:5px;">{this.$t(\'common.operate\')}</span>'],
]);

fix('src/views/community/comments/index.vue', [
  ['>原因: {{ scope.row.refusal }}</span', ">{{ $t('common.reasonLabel') }}{{ scope.row.refusal }}</span"],
  ['>审核结果：{{ commentsInfo.auditStatus | communityStatusFilter }}', ">{{ $t('community.auditResultLabel') }}{{ commentsInfo.auditStatus | communityStatusFilter }}"],
]);

fix('src/views/community/content/index.vue', [
  ['>拒绝原因{{ scope.row.refusal }}', ">{{ $t('product.rejectReason') }}：{{ scope.row.refusal }}"],
]);

fix('src/views/distribution/config/index.vue', [
  [/content="所有用户[\s\S]*?注册的用户"/, ':content="$t(\'distribution.allUsersTip\')"'],
]);

fix('src/views/distribution/index.vue', [
  ["this.$modalSure('解除【' + row.nickname + '】的上级推广人吗')", "this.$modalSure(this.$t('distribution.releaseSuperiorConfirm', { name: row.nickname }))"],
]);

fix('src/views/login/verifition/Verify/SilderVerify.vue', [
  [')s验证成功`', ')s${this.$t(\'login.verifySuccess\')}`'],
]);

fix('src/views/login/verifition/Verify/verifySlider.vue', [
  [')s验证成功`', ')s${this.$t(\'login.verifySuccess\')}`'],
]);
