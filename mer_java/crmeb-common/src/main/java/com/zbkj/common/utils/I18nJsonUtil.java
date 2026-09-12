package com.zbkj.common.utils;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.zbkj.common.model.merchant.Merchant;
import com.zbkj.common.model.product.Product;
import com.zbkj.common.model.product.ProductCategory;
import com.zbkj.common.vo.ProCategoryCacheVo;

/**
 * 多语言 JSON 校验与解析：至少有一个语言的文案非空。
 */
public final class I18nJsonUtil {

    private I18nJsonUtil() {
    }

    public static boolean hasAnyText(String json) {
        if (StrUtil.isBlank(json)) {
            return false;
        }
        try {
            JSONObject obj = JSON.parseObject(json);
            if (obj == null || obj.isEmpty()) {
                return false;
            }
            for (String key : obj.keySet()) {
                if (StrUtil.isNotBlank(obj.getString(key))) {
                    return true;
                }
            }
        } catch (Exception ignored) {
            return false;
        }
        return false;
    }

    public static String emptyToBlank(String name) {
        return name == null ? "" : name;
    }

    public static String resolveLocalized(String defaultText, String json, String lang) {
        JSONObject obj = parseJson(json);
        if (obj != null && StrUtil.isNotBlank(lang)) {
            for (String key : langLookupKeys(lang)) {
                String localized = jsonValueToText(obj.get(key));
                if (StrUtil.isNotBlank(localized)) {
                    return localized;
                }
            }
            for (String jsonKey : obj.keySet()) {
                if (jsonKey != null && jsonKey.equalsIgnoreCase(lang)) {
                    String localized = jsonValueToText(obj.get(jsonKey));
                    if (StrUtil.isNotBlank(localized)) {
                        return localized;
                    }
                }
            }
            String langPrefix = lang.trim().toLowerCase().replace('_', '-');
            if (langPrefix.contains("-")) {
                langPrefix = langPrefix.substring(0, langPrefix.indexOf('-'));
            }
            for (String jsonKey : obj.keySet()) {
                if (jsonKey == null) {
                    continue;
                }
                String keyNorm = jsonKey.toLowerCase().replace('_', '-');
                if (keyNorm.equals(langPrefix) || keyNorm.startsWith(langPrefix + "-")) {
                    String localized = jsonValueToText(obj.get(jsonKey));
                    if (StrUtil.isNotBlank(localized)) {
                        return localized;
                    }
                }
            }
            String scriptHit = firstValueMatchingScript(obj, lang);
            if (StrUtil.isNotBlank(scriptHit)) {
                return scriptHit;
            }
        }
        if (StrUtil.isNotBlank(defaultText)) {
            return defaultText;
        }
        if (obj != null) {
            String zh = obj.getString("zh-cn");
            if (StrUtil.isBlank(zh)) {
                zh = obj.getString("zh-CN");
            }
            if (StrUtil.isNotBlank(zh)) {
                return zh;
            }
            for (String key : obj.keySet()) {
                if (StrUtil.isNotBlank(obj.getString(key))) {
                    return obj.getString(key);
                }
            }
        }
        return defaultText;
    }

    private static java.util.List<String> langLookupKeys(String lang) {
        java.util.LinkedHashSet<String> uniq = new java.util.LinkedHashSet<String>();
        String raw = lang == null ? "" : lang.trim();
        String lower = raw.toLowerCase();
        uniq.add(raw);
        uniq.add(lower);
        if (lower.startsWith("en")) {
            uniq.add("en");
            uniq.add("en-us");
            uniq.add("en-US");
            uniq.add("en_us");
            uniq.add("en_US");
        }
        if (lower.startsWith("zh")) {
            uniq.add("zh-cn");
            uniq.add("zh-CN");
            uniq.add("zh_cn");
        }
        if (lower.startsWith("th")) {
            uniq.add("th");
            uniq.add("th-th");
            uniq.add("th-TH");
            uniq.add("th_th");
            uniq.add("th_TH");
        }
        if (lower.startsWith("my") || lower.startsWith("mm")) {
            uniq.add("my");
            uniq.add("mm");
        }
        uniq.remove("");
        uniq.remove(null);
        return new java.util.ArrayList<String>(uniq);
    }

    private static String firstValueMatchingScript(JSONObject obj, String lang) {
        if (obj == null || StrUtil.isBlank(lang)) {
            return "";
        }
        String lower = lang.trim().toLowerCase();
        java.util.regex.Pattern script = null;
        if (lower.startsWith("th")) {
            script = java.util.regex.Pattern.compile("[\\u0E00-\\u0E7F]");
        } else if (lower.startsWith("my") || lower.startsWith("mm")) {
            script = java.util.regex.Pattern.compile("[\\u1000-\\u109F]");
        }
        if (script == null) {
            return "";
        }
        for (String jsonKey : obj.keySet()) {
            String localized = jsonValueToText(obj.get(jsonKey));
            if (StrUtil.isNotBlank(localized) && script.matcher(localized).find()) {
                return localized;
            }
        }
        return "";
    }

    private static String jsonValueToText(Object raw) {
        if (raw == null) {
            return "";
        }
        if (raw instanceof com.alibaba.fastjson.JSONArray) {
            com.alibaba.fastjson.JSONArray arr = (com.alibaba.fastjson.JSONArray) raw;
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < arr.size(); i++) {
                String line = StrUtil.blankToDefault(arr.getString(i), "").trim();
                if (StrUtil.isBlank(line)) {
                    continue;
                }
                if (sb.length() > 0) {
                    sb.append('\n');
                }
                sb.append(line);
            }
            return sb.toString();
        }
        return StrUtil.blankToDefault(String.valueOf(raw), "").trim();
    }

    private static JSONObject parseJson(String json) {
        if (StrUtil.isBlank(json)) {
            return null;
        }
        try {
            Object parsed = JSON.parse(json.trim());
            if (parsed instanceof JSONObject) {
                return (JSONObject) parsed;
            }
            if (parsed instanceof String) {
                parsed = JSON.parse((String) parsed);
                if (parsed instanceof JSONObject) {
                    return (JSONObject) parsed;
                }
            }
        } catch (Exception ignored) {
            return null;
        }
        return null;
    }

    public static java.util.Map<String, String> toLangMap(String json) {
        java.util.Map<String, String> map = new java.util.LinkedHashMap<String, String>();
        JSONObject obj = parseJson(json);
        if (obj == null) {
            return map;
        }
        for (String key : obj.keySet()) {
            String val = obj.getString(key);
            if (StrUtil.isNotBlank(val)) {
                map.put(key, val);
            }
        }
        return map;
    }

    public static String resolveByRequest(String defaultText, String json) {
        return resolveLocalized(defaultText, json, RequestUtil.getLang());
    }

    public static String resolveMerchantName(Merchant merchant) {
        if (merchant == null) {
            return "";
        }
        return resolveByRequest(merchant.getName(), merchant.getNameJson());
    }

    /**
     * 名称与 nameJson 互相补齐：至少一种语言有值即可。
     * 默认语言写 name，其它语言在 JSON；若只填了 name，则写入 zh-cn。
     */
    public static void fillNameAndJson(java.util.function.Consumer<String> setName,
                                       java.util.function.Consumer<String> setJson,
                                       String name, String nameJson) {
        String json = nameJson;
        if (!hasAnyText(json) && StrUtil.isNotBlank(name)) {
            JSONObject obj = new JSONObject();
            obj.put("zh-cn", name.trim());
            json = obj.toJSONString();
        }
        String resolvedName = emptyToBlank(name);
        if (StrUtil.isBlank(resolvedName)) {
            resolvedName = emptyToBlank(firstNonBlank("", json));
        }
        setName.accept(resolvedName);
        setJson.accept(json);
    }

    public static String firstNonBlank(String defaultText, String json) {
        if (StrUtil.isNotBlank(defaultText)) {
            return defaultText;
        }
        if (StrUtil.isBlank(json)) {
            return defaultText;
        }
        try {
            JSONObject obj = JSON.parseObject(json);
            if (obj == null) {
                return defaultText;
            }
            for (String key : obj.keySet()) {
                if (StrUtil.isNotBlank(obj.getString(key))) {
                    return obj.getString(key);
                }
            }
        } catch (Exception ignored) {
            // 解析失败时回退默认文案
        }
        return defaultText;
    }

    /**
     * 轮播图 JSON：当前语言有非空数组则用该数组，否则回退默认 sliderImage。
     */
    public static String resolveLocalizedSlider(String defaultSlider, String json, String lang) {
        JSONObject obj = parseJson(json);
        if (obj != null && StrUtil.isNotBlank(lang)) {
            for (String key : langLookupKeys(lang)) {
                String hit = sliderValueToJson(obj.get(key));
                if (StrUtil.isNotBlank(hit)) {
                    return hit;
                }
            }
            for (String jsonKey : obj.keySet()) {
                if (jsonKey != null && jsonKey.equalsIgnoreCase(lang)) {
                    String hit = sliderValueToJson(obj.get(jsonKey));
                    if (StrUtil.isNotBlank(hit)) {
                        return hit;
                    }
                }
            }
        }
        return defaultSlider;
    }

    private static String sliderValueToJson(Object raw) {
        if (raw == null) {
            return "";
        }
        if (raw instanceof com.alibaba.fastjson.JSONArray) {
            com.alibaba.fastjson.JSONArray arr = (com.alibaba.fastjson.JSONArray) raw;
            return arr.isEmpty() ? "" : arr.toJSONString();
        }
        String s = String.valueOf(raw).trim();
        if (s.startsWith("[")) {
            try {
                com.alibaba.fastjson.JSONArray arr = JSON.parseArray(s);
                if (arr != null && !arr.isEmpty()) {
                    return arr.toJSONString();
                }
            } catch (Exception ignored) {
                return "";
            }
        }
        return "";
    }

    /** 遍历 JSON 对象中的字符串或字符串数组，用于去掉 CDN 前缀 */
    public static String transformMediaJson(String json, java.util.function.UnaryOperator<String> mapper) {
        JSONObject obj = parseJson(json);
        if (obj == null || mapper == null) {
            return json;
        }
        for (String key : obj.keySet()) {
            Object raw = obj.get(key);
            if (raw instanceof com.alibaba.fastjson.JSONArray) {
                com.alibaba.fastjson.JSONArray arr = (com.alibaba.fastjson.JSONArray) raw;
                for (int i = 0; i < arr.size(); i++) {
                    String item = arr.getString(i);
                    arr.set(i, mapper.apply(item == null ? "" : item));
                }
            } else if (raw != null) {
                obj.put(key, mapper.apply(String.valueOf(raw)));
            }
        }
        return obj.toJSONString();
    }

    /** JSON 里任意语言的第一段非空字符串（封面/详情回退） */
    public static String firstNonBlankJsonString(String json) {
        JSONObject obj = parseJson(json);
        if (obj == null) {
            return "";
        }
        for (String key : obj.keySet()) {
            Object raw = obj.get(key);
            if (raw instanceof com.alibaba.fastjson.JSONArray) {
                continue;
            }
            String val = raw == null ? "" : String.valueOf(raw).trim();
            if (StrUtil.isNotBlank(val)) {
                return val;
            }
        }
        return "";
    }

    public static boolean isBlankHtml(String html) {
        if (StrUtil.isBlank(html)) {
            return true;
        }
        String raw = html.toLowerCase();
        if (raw.contains("<img") || raw.contains("<video") || raw.contains("<iframe") || raw.contains("<embed") || raw.contains("<source")) {
            return false;
        }
        String text = html.replaceAll("(?i)<[^>]+>", " ").replace("&nbsp;", " ").replace('\u00a0', ' ');
        return StrUtil.isBlank(text);
    }

    public static String firstNonBlankHtml(String json) {
        JSONObject obj = parseJson(json);
        if (obj == null) {
            return "";
        }
        for (String key : obj.keySet()) {
            Object raw = obj.get(key);
            if (raw instanceof com.alibaba.fastjson.JSONArray) {
                continue;
            }
            String val = raw == null ? "" : String.valueOf(raw);
            if (!isBlankHtml(val)) {
                return val;
            }
        }
        return "";
    }

    public static String resolveLocalizedHtml(String defaultHtml, String json, String lang) {
        JSONObject obj = parseJson(json);
        if (obj != null && StrUtil.isNotBlank(lang)) {
            for (String key : langLookupKeys(lang)) {
                String localized = jsonValueToText(obj.get(key));
                if (!isBlankHtml(localized)) {
                    return localized;
                }
            }
            for (String jsonKey : obj.keySet()) {
                if (jsonKey != null && jsonKey.equalsIgnoreCase(lang)) {
                    String localized = jsonValueToText(obj.get(jsonKey));
                    if (!isBlankHtml(localized)) {
                        return localized;
                    }
                }
            }
        }
        if (!isBlankHtml(defaultHtml)) {
            return defaultHtml;
        }
        String any = firstNonBlankHtml(json);
        return StrUtil.isNotBlank(any) ? any : (defaultHtml == null ? "" : defaultHtml);
    }

    /** JSON 里任意语言的第一组非空轮播 */
    public static String firstNonEmptySliderJson(String json) {
        JSONObject obj = parseJson(json);
        if (obj == null) {
            return "";
        }
        for (String key : obj.keySet()) {
            String hit = sliderValueToJson(obj.get(key));
            if (StrUtil.isNotBlank(hit)) {
                return hit;
            }
        }
        return "";
    }

    public static void applyProductDisplay(Product product) {
        if (product == null) {
            return;
        }
        String lang = RequestUtil.getLang();
        product.setName(resolveLocalized(product.getName(), product.getNameJson(), lang));
        product.setUnitName(resolveLocalized(product.getUnitName(), product.getUnitNameJson(), lang));
        product.setIntro(resolveLocalized(product.getIntro(), product.getIntroJson(), lang));
        product.setImage(resolveLocalized(product.getImage(), product.getImageJson(), lang));
        product.setSliderImage(resolveLocalizedSlider(product.getSliderImage(), product.getSliderImageJson(), lang));
    }

    public static void applyProductDisplayList(java.util.Collection<Product> list) {
        if (CollUtil.isEmpty(list)) {
            return;
        }
        for (Product product : list) {
            applyProductDisplay(product);
        }
    }

    public static void applyCategoryTree(java.util.List<ProCategoryCacheVo> list) {
        if (CollUtil.isEmpty(list)) {
            return;
        }
        for (ProCategoryCacheVo vo : list) {
            applyCategoryVo(vo);
        }
    }

    public static void applyCategoryVo(ProCategoryCacheVo vo) {
        if (vo == null) {
            return;
        }
        vo.setName(resolveByRequest(vo.getName(), vo.getNameJson()));
        applyCategoryTree(vo.getChildList());
    }

    public static void applyProductCategoryList(java.util.List<ProductCategory> list) {
        if (CollUtil.isEmpty(list)) {
            return;
        }
        for (ProductCategory category : list) {
            if (category != null) {
                category.setName(resolveByRequest(category.getName(), category.getNameJson()));
            }
        }
    }
}
