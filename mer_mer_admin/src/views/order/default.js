import { validatePhone } from '@/utils/toolsValidate';

export function getPostRules(vm) {
  const t = (key) => vm.$t(key);
  return {
    expressCode: [{ required: true, message: t('order.pleaseSelectExpressCompany'), trigger: 'change' }],
    expressNumber: [{ required: true, message: t('order.pleaseEnterExpressNo'), trigger: 'blur' }],
    deliveryCarrier: [{ required: true, message: t('order.pleaseEnterDeliveryStaff'), trigger: 'blur' }],
    carrierPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
    isSplit: [{ required: true, message: t('order.pleaseSelectSplitShipment'), trigger: 'change' }],
    toName: [{ required: true, message: t('order.pleaseEnterSenderName'), trigger: 'blur' }],
    expressTempId: [{ required: true, message: t('order.pleaseSelectElectronicWaybill'), trigger: 'blur' }],
    toTel: [{ required: true, message: t('order.pleaseEnterSenderPhone'), trigger: 'blur' }],
    toAddr: [{ required: true, message: t('order.pleaseEnterSenderAddress'), trigger: 'blur' }],
  };
}
