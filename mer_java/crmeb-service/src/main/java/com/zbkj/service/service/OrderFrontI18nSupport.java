package com.zbkj.service.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.zbkj.common.constants.ProductConstants;
import com.zbkj.common.model.merchant.Merchant;
import com.zbkj.common.model.order.OrderDetail;
import com.zbkj.common.model.product.Product;
import com.zbkj.common.model.product.ProductAttribute;
import com.zbkj.common.model.seckill.SeckillProduct;
import com.zbkj.common.response.InfoReplyResponse;
import com.zbkj.common.response.OrderInfoFrontDataResponse;
import com.zbkj.common.response.PreOrderMerchantInfoResponse;
import com.zbkj.common.response.RefundOrderInfoResponse;
import com.zbkj.common.response.RefundOrderResponse;
import com.zbkj.common.utils.I18nJsonUtil;
import com.zbkj.common.utils.ProductSpecI18nUtil;
import com.zbkj.common.vo.PreOrderInfoDetailVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * C 端订单/售后展示：店铺名、商品名、规格按请求语言解析（不改订单快照落库）。
 */
@Component
public class OrderFrontI18nSupport {

    @Autowired
    private ProductService productService;
    @Autowired
    private ProductAttributeService productAttributeService;
    @Autowired
    private SeckillProductService seckillProductService;
    @Autowired
    private MerchantService merchantService;

    public void applyOrderInfoList(List<OrderInfoFrontDataResponse> list) {
        applyLines(list,
                OrderInfoFrontDataResponse::getProductId,
                OrderInfoFrontDataResponse::getProductMarketingType,
                OrderInfoFrontDataResponse::getProductName,
                OrderInfoFrontDataResponse::getSku,
                OrderInfoFrontDataResponse::setProductName,
                OrderInfoFrontDataResponse::setSku);
    }

    public void applyOrderDetails(List<OrderDetail> list) {
        applyLines(list,
                OrderDetail::getProductId,
                OrderDetail::getProductMarketingType,
                OrderDetail::getProductName,
                OrderDetail::getSku,
                OrderDetail::setProductName,
                OrderDetail::setSku);
        if (CollUtil.isEmpty(list)) {
            return;
        }
        Set<Integer> merIds = list.stream().map(OrderDetail::getMerId).filter(id -> id != null && id > 0).collect(Collectors.toSet());
        Map<Integer, Merchant> merchantMap = loadMerchants(merIds);
        for (OrderDetail item : list) {
            if (item.getMerId() != null && item.getMerId() > 0) {
                item.setMerName(I18nJsonUtil.resolveMerchantName(merchantMap.get(item.getMerId())));
            }
        }
    }

    public void applyReplyList(List<InfoReplyResponse> list) {
        applyLines(list,
                InfoReplyResponse::getProductId,
                r -> null,
                InfoReplyResponse::getProductName,
                InfoReplyResponse::getSku,
                InfoReplyResponse::setProductName,
                InfoReplyResponse::setSku);
    }

    public void applyPreMerchantInfoList(List<PreOrderMerchantInfoResponse> list) {
        if (CollUtil.isEmpty(list)) {
            return;
        }
        List<PreOrderInfoDetailVo> details = new ArrayList<>();
        Set<Integer> merIds = new HashSet<>();
        for (PreOrderMerchantInfoResponse mer : list) {
            if (mer.getMerId() != null && mer.getMerId() > 0) {
                merIds.add(mer.getMerId());
            }
            if (CollUtil.isNotEmpty(mer.getOrderInfoList())) {
                details.addAll(mer.getOrderInfoList());
            }
        }
        applyLines(details,
                PreOrderInfoDetailVo::getProductId,
                PreOrderInfoDetailVo::getProductMarketingType,
                PreOrderInfoDetailVo::getProductName,
                PreOrderInfoDetailVo::getSku,
                PreOrderInfoDetailVo::setProductName,
                PreOrderInfoDetailVo::setSku);
        Map<Integer, Merchant> merchantMap = loadMerchants(merIds);
        for (PreOrderMerchantInfoResponse mer : list) {
            if (mer.getMerId() != null && mer.getMerId() > 0) {
                mer.setMerName(I18nJsonUtil.resolveMerchantName(merchantMap.get(mer.getMerId())));
            }
        }
    }

    public void applyRefundDetail(RefundOrderInfoResponse response) {
        if (response == null) {
            return;
        }
        applyOne(response.getProductId(), null, response.getProductName(), response.getSku(),
                response::setProductName, response::setSku);
    }

    public void applyRefundList(List<RefundOrderResponse> list) {
        applyLines(list,
                RefundOrderResponse::getProductId,
                r -> null,
                RefundOrderResponse::getProductName,
                RefundOrderResponse::getSku,
                RefundOrderResponse::setProductName,
                RefundOrderResponse::setSku);
    }

    public String localizeSku(Integer masterProductId, String sku) {
        if (masterProductId == null || StrUtil.isBlank(sku)) {
            return sku;
        }
        List<ProductAttribute> attrs = productAttributeService.findListWithOptionsByProductId(masterProductId);
        return ProductSpecI18nUtil.localizeSku(sku, attrs);
    }

    private <T> void applyLines(List<T> list,
                                Function<T, Integer> productIdFn,
                                Function<T, Integer> marketingTypeFn,
                                Function<T, String> nameFn,
                                Function<T, String> skuFn,
                                BiConsumer<T, String> setName,
                                BiConsumer<T, String> setSku) {
        if (CollUtil.isEmpty(list)) {
            return;
        }
        Set<Integer> seckillIds = new HashSet<>();
        Set<Integer> productIds = new HashSet<>();
        for (T item : list) {
            Integer productId = productIdFn.apply(item);
            if (productId == null) {
                continue;
            }
            Integer marketingType = marketingTypeFn.apply(item);
            productIds.add(productId);
            if (ProductConstants.PRODUCT_MARKETING_TYPE_SECKILL.equals(marketingType)) {
                seckillIds.add(productId);
            }
        }
        Map<Integer, Integer> seckillToProduct = loadSeckillProductMap(seckillIds);
        productIds.addAll(seckillToProduct.values());
        Map<Integer, Product> productMap = loadProducts(productIds);
        Map<Integer, List<ProductAttribute>> attrMap = new HashMap<>();
        for (Integer pid : productMap.keySet()) {
            attrMap.put(pid, productAttributeService.findListWithOptionsByProductId(pid));
        }
        for (T item : list) {
            Integer rawId = productIdFn.apply(item);
            Integer masterId = toMasterProductId(rawId, marketingTypeFn.apply(item), seckillToProduct);
            Product product = masterId == null ? null : productMap.get(masterId);
            if (product == null && rawId != null) {
                product = productMap.get(rawId);
                masterId = rawId;
            }
            String fallbackName = nameFn.apply(item);
            if (product != null) {
                setName.accept(item, I18nJsonUtil.resolveByRequest(product.getName(), product.getNameJson()));
            } else {
                setName.accept(item, fallbackName);
            }
            List<ProductAttribute> attrs = masterId == null ? null : attrMap.get(masterId);
            setSku.accept(item, ProductSpecI18nUtil.localizeSku(skuFn.apply(item), attrs));
        }
    }

    private void applyOne(Integer productId, Integer marketingType, String fallbackName, String fallbackSku,
                          Consumer<String> setName,
                          Consumer<String> setSku) {
        Integer masterId = productId;
        if (ProductConstants.PRODUCT_MARKETING_TYPE_SECKILL.equals(marketingType) && productId != null) {
            SeckillProduct seckillProduct = seckillProductService.getById(productId);
            if (seckillProduct != null && seckillProduct.getProductId() != null) {
                masterId = seckillProduct.getProductId();
            }
        }
        Product product = masterId == null ? null : productService.getById(masterId);
        if (product == null && productId != null) {
            product = productService.getById(productId);
            masterId = productId;
        }
        if (product != null) {
            setName.accept(I18nJsonUtil.resolveByRequest(product.getName(), product.getNameJson()));
        } else {
            setName.accept(fallbackName);
        }
        setSku.accept(localizeSku(masterId, fallbackSku));
    }

    private Integer toMasterProductId(Integer productId, Integer marketingType, Map<Integer, Integer> seckillToProduct) {
        if (productId == null) {
            return null;
        }
        if (ProductConstants.PRODUCT_MARKETING_TYPE_SECKILL.equals(marketingType)) {
            Integer mapped = seckillToProduct.get(productId);
            return mapped != null ? mapped : productId;
        }
        return productId;
    }

    private Map<Integer, Integer> loadSeckillProductMap(Set<Integer> seckillIds) {
        if (CollUtil.isEmpty(seckillIds)) {
            return Collections.emptyMap();
        }
        Map<Integer, Integer> map = new HashMap<>();
        Collection<SeckillProduct> list = seckillProductService.listByIds(seckillIds);
        if (CollUtil.isEmpty(list)) {
            return map;
        }
        for (SeckillProduct seckillProduct : list) {
            if (seckillProduct != null && seckillProduct.getProductId() != null) {
                map.put(seckillProduct.getId(), seckillProduct.getProductId());
            }
        }
        return map;
    }

    private Map<Integer, Product> loadProducts(Set<Integer> productIds) {
        if (CollUtil.isEmpty(productIds)) {
            return Collections.emptyMap();
        }
        List<Product> list = productService.findByIds(new ArrayList<>(productIds));
        if (CollUtil.isEmpty(list)) {
            return Collections.emptyMap();
        }
        Map<Integer, Product> map = new HashMap<>();
        for (Product product : list) {
            if (product != null && product.getId() != null) {
                map.put(product.getId(), product);
            }
        }
        return map;
    }

    private Map<Integer, Merchant> loadMerchants(Set<Integer> merIds) {
        if (CollUtil.isEmpty(merIds)) {
            return Collections.emptyMap();
        }
        Map<Integer, Merchant> map = merchantService.getMerIdMapByIdList(new ArrayList<>(merIds));
        return map == null ? Collections.emptyMap() : map;
    }
}
