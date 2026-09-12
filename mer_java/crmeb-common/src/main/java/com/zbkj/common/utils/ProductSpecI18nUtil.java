package com.zbkj.common.utils;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.zbkj.common.model.product.ProductAttribute;
import com.zbkj.common.model.product.ProductAttributeOption;
import com.zbkj.common.response.ProductAttrValueResponse;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * C 端规格名/规格值按请求语言替换，并同步 sku 键，保证选规格仍能匹配。
 */
public final class ProductSpecI18nUtil {

    private ProductSpecI18nUtil() {
    }

    public static void localizeForFront(List<ProductAttribute> attrs, Map<String, ProductAttrValueResponse> skuMap) {
        String lang = RequestUtil.getLang();
        if (CollUtil.isEmpty(attrs)) {
            return;
        }
        Map<String, String> optionRename = new HashMap<>();
        for (ProductAttribute attr : attrs) {
            attr.setAttributeName(I18nJsonUtil.resolveLocalized(attr.getAttributeName(), attr.getAttributeNameJson(), lang));
            if (CollUtil.isEmpty(attr.getOptionList())) {
                continue;
            }
            for (ProductAttributeOption opt : attr.getOptionList()) {
                String oldName = opt.getOptionName();
                String newName = I18nJsonUtil.resolveLocalized(opt.getOptionName(), opt.getOptionNameJson(), lang);
                opt.setOptionName(newName);
                if (StrUtil.isNotBlank(oldName) && StrUtil.isNotBlank(newName) && !oldName.equals(newName)) {
                    optionRename.put(oldName, newName);
                }
            }
        }
        if (skuMap == null || skuMap.isEmpty() || optionRename.isEmpty()) {
            return;
        }
        LinkedHashMap<String, ProductAttrValueResponse> next = new LinkedHashMap<>();
        for (Map.Entry<String, ProductAttrValueResponse> entry : skuMap.entrySet()) {
            String newSku = renameSku(entry.getKey(), optionRename);
            ProductAttrValueResponse val = entry.getValue();
            if (val != null) {
                val.setSku(newSku);
            }
            next.put(newSku, val);
        }
        skuMap.clear();
        skuMap.putAll(next);
    }

    /**
     * 将订单快照中的 sku（默认规格值，逗号拼接）替换为当前语言。
     */
    public static String localizeSku(String sku, List<ProductAttribute> attrs) {
        if (StrUtil.isBlank(sku) || CollUtil.isEmpty(attrs)) {
            return sku;
        }
        String lang = RequestUtil.getLang();
        Map<String, String> optionRename = new HashMap<>();
        for (ProductAttribute attr : attrs) {
            if (CollUtil.isEmpty(attr.getOptionList())) {
                continue;
            }
            for (ProductAttributeOption opt : attr.getOptionList()) {
                String oldName = opt.getOptionName();
                String newName = I18nJsonUtil.resolveLocalized(oldName, opt.getOptionNameJson(), lang);
                if (StrUtil.isNotBlank(oldName) && StrUtil.isNotBlank(newName)) {
                    optionRename.put(oldName, newName);
                }
            }
        }
        if (optionRename.isEmpty()) {
            return sku;
        }
        String exact = optionRename.get(sku);
        if (StrUtil.isNotBlank(exact)) {
            return exact;
        }
        String viaComma = renameSku(sku, ",", optionRename);
        if (!viaComma.equals(sku)) {
            return viaComma;
        }
        if (sku.contains("-")) {
            return renameSku(sku, "-", optionRename);
        }
        return sku;
    }

    private static String renameSku(String sku, String delimiter, Map<String, String> optionRename) {
        if (sku == null || sku.isEmpty()) {
            return sku;
        }
        String[] parts = sku.split(java.util.regex.Pattern.quote(delimiter));
        boolean changed = false;
        for (int i = 0; i < parts.length; i++) {
            String mapped = optionRename.get(parts[i]);
            if (mapped != null) {
                parts[i] = mapped;
                changed = true;
            }
        }
        return changed ? String.join(delimiter, parts) : sku;
    }

    private static String renameSku(String sku, Map<String, String> optionRename) {
        return renameSku(sku, ",", optionRename);
    }
}
