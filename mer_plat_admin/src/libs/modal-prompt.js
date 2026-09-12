// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

/**
 * $prompt一行内容input提交封装
 * @param inputType input type 类型
 * @param title 标题
 * @param val 回显的值
 * @returns {Promise<any>}
 */
export default function modalPrompt(inputType, title, val) {
  const locale = String((this.$i18n && this.$i18n.locale) || 'zh-cn').toLowerCase();
  const join = locale.startsWith('zh') ? '' : ' ';
  const pleaseEnter = `${this.$t('formGenerator.pleaseEnter')}${join}${title}`.trim();
  return new Promise((resolve) => {
    this.$prompt('', `${title}`, {
      confirmButtonText: this.$t('el.messagebox.confirm'),
      cancelButtonText: this.$t('el.messagebox.cancel'),
      inputErrorMessage: pleaseEnter,
      inputType: inputType,
      inputValue: val ? val : '',
      showClose: true,
      closeOnClickModal: false,
      customClass: 'prompt-form',
      inputPlaceholder: pleaseEnter,
      inputValidator: (value) => {
        if (value === null) {
          return true;
        }
        if (!value) return this.$t('common.inputCannotBeEmpty');
        if (value.indexOf(' ') !== -1) return this.$t('common.inputCannotBeEmpty');
        if (value.length > 50) return this.$t('common.inputMax50');
      },
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true;
          instance.confirmButtonText = this.$t('common.executing');
          setTimeout(() => {
            done();
            instance.confirmButtonLoading = false;
          }, 200);
        } else {
          done();
        }
      },
    })
      .then(({ value }) => {
        resolve(value);
      })
      .catch(() => {
        this.$message.info(this.$t('common.cancelInput'));
      });
  });
}
