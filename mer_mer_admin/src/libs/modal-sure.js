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
 * 再次确定弹窗组件
 * @param title 标题
 * @returns {Promise<any>}
 */
export default function modalSure(title) {
  return new Promise((resolve, reject) => {
    this.$confirm(`${this.$t('common.confirmPrefix')}${title || this.$t('common.permanentDelete')}`, this.$t('el.messagebox.title'), {
      confirmButtonText: this.$t('el.messagebox.confirm'),
      cancelButtonText: this.$t('el.messagebox.cancel'),
      type: 'warning',
      customClass: 'deleteConfirm',
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
        this.$message({
          type: 'info',
          message: this.$t('common.cancelled'),
        });
      });
  });
}
