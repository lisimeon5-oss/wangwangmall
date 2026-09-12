// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
import i18n from '@/i18n';

export function merCreateTypeFilter(status) {
  const statusMap = {
    admin: i18n.t('merchant.adminCreated'),
    apply: i18n.t('merchant.merchantApply'),
  };
  return statusMap[status];
}

export function selfTypeFilter(status) {
  const statusMap = {
    true: i18n.t('merchant.selfOperated'),
    false: i18n.t('merchant.notSelfOperated'),
  };
  return statusMap[status];
}
