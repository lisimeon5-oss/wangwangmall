package com.zbkj.common.utils;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;

/**
 * 业务名称模糊搜索：默认列 + 多语言 JSON 列。
 */
public final class I18nSearchUtil {

    private I18nSearchUtil() {
    }

    public static <T> void likeName(LambdaQueryWrapper<T> wrapper, SFunction<T, ?> name,
                                   SFunction<T, ?> nameJson, String keyword) {
        if (wrapper == null || StrUtil.isBlank(keyword)) {
            return;
        }
        wrapper.and(w -> w.like(name, keyword).or().like(nameJson, keyword));
    }
}
