-- 系统语言表
CREATE TABLE `eb_system_language`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '语言ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '语言名称',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '语言代码',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否默认 0-否 1-是',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用 0-否 1-是',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统语言表' ROW_FORMAT = DYNAMIC;

-- 初始化语言数据
INSERT INTO `eb_system_language` (`name`, `code`, `is_default`, `status`, `sort`, `create_time`, `update_time`) VALUES
('简体中文', 'zh-cn', 1, 1, 1, NOW(), NOW()),
('English', 'en', 0, 1, 2, NOW(), NOW()),
('ไทย', 'th', 0, 1, 3, NOW(), NOW()),
('မြန်မာ', 'my', 0, 1, 4, NOW(), NOW());

-- 新增业务名称 *_json 后，必须在 I18nJsonColumnRegistry 登记表名与列名，模糊搜索才会自动 OR JSON 列。

-- 商品多语言名称字段
ALTER TABLE `eb_product` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商品名称(JSON)' AFTER `name`;

-- 商品多语言单位字段
ALTER TABLE `eb_product` ADD COLUMN `unit_name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商品单位(JSON)' AFTER `unit_name`;

-- 商品多语言简介字段
ALTER TABLE `eb_product` ADD COLUMN `intro_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商品简介(JSON)' AFTER `intro`;

-- 系统菜单多语言名称字段
ALTER TABLE `eb_system_menu` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言菜单名称(JSON)' AFTER `name`;

-- 商品分类多语言名称字段
ALTER TABLE `eb_product_category` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言分类名称(JSON)' AFTER `name`;

-- 商品保障服务多语言名称字段
ALTER TABLE `eb_product_guarantee` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言保障条款名称(JSON)' AFTER `name`;

-- 商品保障服务组合多语言名称字段
ALTER TABLE `eb_product_guarantee_group` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言组合名称(JSON)' AFTER `name`;

-- 商品品牌多语言名称字段
ALTER TABLE `eb_product_brand` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言品牌名称(JSON)' AFTER `name`;

-- 商品标签多语言名称字段
ALTER TABLE `eb_product_tag` ADD COLUMN `tag_name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言标签名称(JSON)' AFTER `tag_name`;

-- 商户分类多语言名称字段
ALTER TABLE `eb_merchant_category` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商户分类名称(JSON)' AFTER `name`;

-- 商户多语言名称字段
ALTER TABLE `eb_merchant` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商户名称(JSON)' AFTER `name`;
ALTER TABLE `eb_merchant` ADD COLUMN `intro_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商户简介(JSON)' AFTER `intro`;

-- 店铺类型多语言字段
ALTER TABLE `eb_merchant_type` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言店铺类型名称(JSON)' AFTER `name`;
ALTER TABLE `eb_merchant_type` ADD COLUMN `info_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言店铺类型要求说明(JSON)' AFTER `info`;

-- 用户标签多语言名称字段
ALTER TABLE `eb_user_tag` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言用户标签名称(JSON)' AFTER `name`;

-- 用户等级多语言名称字段
ALTER TABLE `eb_system_user_level` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言用户等级名称(JSON)' AFTER `name`;

-- 积分区间等多语言名称（eb_group_config.name，tag=12 为积分区间）
ALTER TABLE `eb_group_config` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言名称(JSON)' AFTER `name`;

-- 付费会员权益多语言字段
ALTER TABLE `eb_group_config` ADD COLUMN `value_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言展示名称(JSON)' AFTER `value`;
ALTER TABLE `eb_group_config` ADD COLUMN `message_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言权益简介(JSON)' AFTER `message`;
ALTER TABLE `eb_group_config` ADD COLUMN `expand_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言权益说明(JSON)' AFTER `expand`;
ALTER TABLE `eb_group_config` ADD COLUMN `image_url_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言图片地址(JSON)' AFTER `image_url`;

-- 付费会员卡多语言字段
ALTER TABLE `eb_paid_member_card` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言会员卡名称(JSON)' AFTER `name`;
ALTER TABLE `eb_paid_member_card` ADD COLUMN `label_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言卡片标签(JSON)' AFTER `label`;

-- 优惠券多语言名称
ALTER TABLE `eb_coupon` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言优惠券名称(JSON)' AFTER `name`;

-- 秒杀时段多语言名称
ALTER TABLE `eb_seckill_time_interval` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言秒杀时段名称(JSON)' AFTER `name`;

-- 秒杀活动多语言名称
ALTER TABLE `eb_seckill_activity` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言秒杀活动名称(JSON)' AFTER `name`;

-- 拼团活动多语言名称
ALTER TABLE `eb_group_buy_activity` ADD COLUMN `group_name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言拼团活动名称(JSON)' AFTER `group_name`;

-- 签到规则说明多语言：默认语言仍用 eb_system_config.name = 'sign_rule_description '（原 key 末尾有空格），其它语言存 sign_rule_description_json（保存配置时自动写入）
-- 充值注意事项多语言：默认语言仍用 eb_system_config.name = 'recharge_attention'，其它语言存 recharge_attention_json（保存充值配置时自动写入）

-- 商品规格名/规格值多语言（C 端选规格展示）
ALTER TABLE `eb_product_attribute` ADD COLUMN `attribute_name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言规格名称(JSON)' AFTER `attribute_name`;
ALTER TABLE `eb_product_attribute_option` ADD COLUMN `option_name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言规格值(JSON)' AFTER `option_name`;

-- 种草社区分类多语言名称
ALTER TABLE `eb_community_category` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言分类名称(JSON)' AFTER `name`;

-- 种草社区话题多语言名称
ALTER TABLE `eb_community_topic` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言话题名称(JSON)' AFTER `name`;

-- 文章分类多语言名称
ALTER TABLE `eb_article_category` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言分类名称(JSON)' AFTER `name`;

-- 文章标题/简介/内容多语言
ALTER TABLE `eb_article` ADD COLUMN `title_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言文章标题(JSON)' AFTER `title`;
ALTER TABLE `eb_article` ADD COLUMN `synopsis_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言文章简介(JSON)' AFTER `synopsis`;
ALTER TABLE `eb_article` ADD COLUMN `content_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言文章内容(JSON)' AFTER `content`;

-- 氛围图/活动边框多语言活动名称
ALTER TABLE `eb_activity_style` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言活动名称(JSON)' AFTER `name`;

-- DIY 模板名称、页面标题多语言
ALTER TABLE `eb_page_diy` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言模板名称(JSON)' AFTER `name`;
ALTER TABLE `eb_page_diy` ADD COLUMN `title_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言页面标题(JSON)' AFTER `title`;

-- 平台视频号「待审核列表」应对草稿审核页（相对路径 product 会被解析成直播间商品）
UPDATE `eb_system_menu`
SET `component` = '/marketing/videoChannel/draftList'
WHERE `type` = 3
  AND `menu_type` = 'C'
  AND (
    `id` = 417
    OR `name` = '待审核列表'
    OR (`name_json` IS NOT NULL AND `name_json` LIKE '%"zh-cn":"待审核列表"%')
  );

-- 身份/角色多语言名称
ALTER TABLE `eb_system_role` ADD COLUMN `role_name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言角色名称(JSON)' AFTER `role_name`;

-- 表单模板名称、简介多语言
ALTER TABLE `eb_system_form_temp` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言表单名称(JSON)' AFTER `name`;
ALTER TABLE `eb_system_form_temp` ADD COLUMN `info_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言表单简介(JSON)' AFTER `info`;

-- 组合数据组名称、简介多语言
ALTER TABLE `eb_system_group` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言数据组名称(JSON)' AFTER `name`;
ALTER TABLE `eb_system_group` ADD COLUMN `info_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言数据简介(JSON)' AFTER `info`;

-- 配置/附件等通用分类名称多语言
ALTER TABLE `eb_category` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言分类名称(JSON)' AFTER `name`;

-- 商户商品分类名称多语言
ALTER TABLE `eb_merchant_product_category` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言分类名称(JSON)' AFTER `name`;

-- 卡密库名称、备注多语言
ALTER TABLE `eb_cdkey_library` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言卡密库名称(JSON)' AFTER `name`;
ALTER TABLE `eb_cdkey_library` ADD COLUMN `remark_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言备注(JSON)' AFTER `remark`;

-- 商品规格模板名称多语言
ALTER TABLE `eb_product_rule` ADD COLUMN `rule_name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言规格名称(JSON)' AFTER `rule_name`;

-- 运费模板名称多语言
ALTER TABLE `eb_shipping_templates` ADD COLUMN `name_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言运费模板名称(JSON)' AFTER `name`;

-- 订单退货理由其它语言：保存订单配置时写入 eb_system_config.name = stor_reason_json，无需改表结构

-- 协议其它语言：保存协议时写入 eb_system_config.name = {原协议key}_json，无需改表结构

-- 商品封面图/轮播图多语言（其它语言未上传则 C 端回退默认中文列）
ALTER TABLE `eb_product` ADD COLUMN `image_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商品封面图(JSON)' AFTER `image`;
ALTER TABLE `eb_product` ADD COLUMN `slider_image_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商品轮播图(JSON)' AFTER `slider_image`;

-- 商品详情多语言
ALTER TABLE `eb_product_description` ADD COLUMN `description_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '多语言商品详情(JSON)' AFTER `description`;



