package com.zbkj.service.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zbkj.common.model.product.ProductAttribute;

import java.util.List;

/**
 * @author HZW
 * @description ProductAttributeService 接口
 * @date 2024-11-11
 */
public interface ProductAttributeService extends IService<ProductAttribute> {

    /**
     * 商品变更导致的删除
     */
    Boolean deleteByProductUpdate(Integer proId);

    /**
     * 获取商品的规格列表
     */
    List<ProductAttribute> findListByProductId(Integer proId);

    /**
     * 规格 + 规格值（含 optionNameJson），供后台按语言展示 SKU
     */
    List<ProductAttribute> findListWithOptionsByProductId(Integer proId);
}