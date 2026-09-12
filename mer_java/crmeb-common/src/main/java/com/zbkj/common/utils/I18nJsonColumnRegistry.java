package com.zbkj.common.utils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 多语言 JSON 列登记。表新增 *_json 后必须在此登记，模糊搜索才会自动 OR 对应 JSON 列。
 */
public final class I18nJsonColumnRegistry {

    private static final Map<String, Map<String, String>> TABLE_COLUMNS = new HashMap<>();

    static {
        register("eb_product", "name", "name_json");
        register("eb_product", "unit_name", "unit_name_json");
        register("eb_product", "intro", "intro_json");
        register("eb_product_attribute", "attribute_name", "attribute_name_json");
        register("eb_product_attribute_option", "option_name", "option_name_json");
        register("eb_system_menu", "name", "name_json");
        register("eb_system_role", "role_name", "role_name_json");
        register("eb_product_category", "name", "name_json");
        register("eb_merchant_product_category", "name", "name_json");
        register("eb_cdkey_library", "name", "name_json");
        register("eb_cdkey_library", "remark", "remark_json");
        register("eb_product_rule", "rule_name", "rule_name_json");
        register("eb_shipping_templates", "name", "name_json");
        register("eb_category", "name", "name_json");
        register("eb_product_guarantee", "name", "name_json");
        register("eb_product_guarantee_group", "name", "name_json");
        register("eb_product_brand", "name", "name_json");
        register("eb_product_tag", "tag_name", "tag_name_json");
        register("eb_merchant_category", "name", "name_json");
        register("eb_merchant", "name", "name_json");
        register("eb_merchant", "intro", "intro_json");
        register("eb_merchant_type", "name", "name_json");
        register("eb_merchant_type", "info", "info_json");
        register("eb_user_tag", "name", "name_json");
        register("eb_system_user_level", "name", "name_json");
        register("eb_paid_member_card", "name", "name_json");
        register("eb_paid_member_card", "label", "label_json");
        register("eb_coupon", "name", "name_json");
        register("eb_seckill_time_interval", "name", "name_json");
        register("eb_seckill_activity", "name", "name_json");
        register("eb_group_buy_activity", "group_name", "group_name_json");
        register("eb_group_config", "name", "name_json");
        register("eb_group_config", "value", "value_json");
        register("eb_group_config", "message", "message_json");
        register("eb_group_config", "expand", "expand_json");
        register("eb_group_config", "image_url", "image_url_json");
        register("eb_community_category", "name", "name_json");
        register("eb_community_topic", "name", "name_json");
        register("eb_article_category", "name", "name_json");
        register("eb_article", "title", "title_json");
        register("eb_article", "synopsis", "synopsis_json");
        register("eb_activity_style", "name", "name_json");
        register("eb_page_diy", "name", "name_json");
        register("eb_page_diy", "title", "title_json");
        register("eb_system_form_temp", "name", "name_json");
        register("eb_system_form_temp", "info", "info_json");
        register("eb_system_group", "name", "name_json");
        register("eb_system_group", "info", "info_json");
    }

    private I18nJsonColumnRegistry() {
    }

    public static void register(String table, String column, String jsonColumn) {
        TABLE_COLUMNS.computeIfAbsent(norm(table), k -> new HashMap<String, String>()).put(norm(column), norm(jsonColumn));
    }

    public static String jsonColumn(String table, String column) {
        if (table == null || column == null) {
            return null;
        }
        Map<String, String> columns = TABLE_COLUMNS.get(norm(table));
        if (columns == null) {
            return null;
        }
        return columns.get(norm(column));
    }

    public static boolean hasTable(String table) {
        return table != null && TABLE_COLUMNS.containsKey(norm(table));
    }

    public static Map<String, Map<String, String>> all() {
        return Collections.unmodifiableMap(TABLE_COLUMNS);
    }

    public static String norm(String name) {
        if (name == null) {
            return "";
        }
        return name.replace("`", "").trim().toLowerCase(Locale.ROOT);
    }
}
