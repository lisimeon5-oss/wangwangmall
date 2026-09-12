package com.zbkj.service.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.zbkj.common.constants.RedisConstants;
import com.zbkj.common.exception.CrmebException;
import com.zbkj.common.model.product.ProductBrand;
import com.zbkj.common.model.product.ProductBrandCategory;
import com.zbkj.common.page.CommonPage;
import com.zbkj.common.request.BrandCategorySearchRequest;
import com.zbkj.common.request.PageParamRequest;
import com.zbkj.common.request.ProductBrandRequest;
import com.zbkj.common.response.ProductBrandListResponse;
import com.zbkj.common.response.ProductBrandResponse;
import com.zbkj.common.result.CommonResultCode;
import com.zbkj.common.result.ProductResultCode;
import com.zbkj.common.utils.RedisUtil;
import com.zbkj.common.utils.RequestUtil;
import com.zbkj.service.dao.ProductBrandDao;
import com.zbkj.service.service.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ProductBrandServiceImpl 接口实现
 * +----------------------------------------------------------------------
 * | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
 * +----------------------------------------------------------------------
 * | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
 * +----------------------------------------------------------------------
 * | Author: CRMEB Team <admin@crmeb.com>
 * +----------------------------------------------------------------------
 */
@Service
public class ProductBrandServiceImpl extends ServiceImpl<ProductBrandDao, ProductBrand> implements ProductBrandService {

    @Resource
    private ProductBrandDao dao;

    @Autowired
    private TransactionTemplate transactionTemplate;
    @Autowired
    private SystemAttachmentService systemAttachmentService;
    @Autowired
    private ProductBrandCategoryService brandCategoryService;
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private ProductService productService;
    @Autowired
    private CouponService couponService;

    /**
     * 品牌分页列表
     *
     * @param pageParamRequest 分页参数
     * @return PageInfo
     */
    @Override
    public PageInfo<ProductBrandListResponse> getAdminPage(PageParamRequest pageParamRequest) {
        Page<ProductBrand> page = PageHelper.startPage(pageParamRequest.getPage(), pageParamRequest.getLimit());
        LambdaQueryWrapper<ProductBrand> lqw = Wrappers.lambdaQuery();
        lqw.eq(ProductBrand::getIsDel, false);
        lqw.orderByDesc(ProductBrand::getSort);
        List<ProductBrand> brandList = dao.selectList(lqw);
        if (CollUtil.isEmpty(brandList)) {
            return CommonPage.copyPageInfo(page, CollUtil.newArrayList());
        }
        List<ProductBrandListResponse> responseList = brandList.stream().map(e -> {
            ProductBrandListResponse response = new ProductBrandListResponse();
            BeanUtils.copyProperties(e, response);
            List<ProductBrandCategory> list = brandCategoryService.getListByBrandId(e.getId());
            if (CollUtil.isEmpty(list)) {
                response.setCategoryIds("");
            } else {
                List<String> cidList = list.stream().map(bc -> bc.getCid().toString()).collect(Collectors.toList());
                response.setCategoryIds(String.join(",", cidList));
            }
            return response;
        }).collect(Collectors.toList());
        return CommonPage.copyPageInfo(page, responseList);
    }

    /**
     * 添加品牌
     *
     * @param request 添加参数
     * @return Boolean
     */
    @Override
    public Boolean add(ProductBrandRequest request) {
        validateName(request.getName());
        ProductBrand brand = new ProductBrand();
        BeanUtils.copyProperties(request, brand);
        brand.setId(null);
        if (StrUtil.isNotBlank(brand.getIcon())) {
            brand.setIcon(systemAttachmentService.clearPrefix(brand.getIcon()));
        }
        Boolean execute = transactionTemplate.execute(e -> {
            save(brand);
            if (StrUtil.isNotBlank(request.getCategoryIds())) {
                List<ProductBrandCategory> initList = brandCategoryInit(brand.getId(), request.getCategoryIds());
                brandCategoryService.saveBatch(initList, 100);
            }
            return Boolean.TRUE;
        });
        if (execute) {
            redisUtil.delete(RedisConstants.PRODUCT_ALL_BRAND_LIST_KEY);
        }
        return execute;
    }

    /**
     * 删除品牌
     *
     * @param id 品牌ID
     * @return Boolean
     */
    @Override
    public Boolean delete(Integer id) {
        ProductBrand brand = getByIdException(id);
        // 判断商品是否使用品牌
        if (productService.isUseBrand(brand.getId())) {
            throw new CrmebException(ProductResultCode.PRODUCT_BRAND_USED);
        }
        brand.setIsDel(true);
        Boolean execute = transactionTemplate.execute(e -> {
            updateById(brand);
            brandCategoryService.deleteByBid(brand.getId());
            // 删除品牌关联的优惠券
            couponService.deleteByBrandId(brand.getId());
            return Boolean.TRUE;
        });
        if (execute) {
            redisUtil.delete(RedisConstants.PRODUCT_ALL_BRAND_LIST_KEY);
        }
        return execute;
    }

    /**
     * 编辑品牌
     *
     * @param request 修改参数
     * @return Boolean
     */
    @Override
    public Boolean edit(ProductBrandRequest request) {
        if (ObjectUtil.isNull(request.getId())) {
            throw new CrmebException(CommonResultCode.VALIDATE_FAILED, "品牌id不能为空");
        }
        ProductBrand oldBrand = getByIdException(request.getId());
        if (!oldBrand.getName().equals(request.getName())) {
            validateName(request.getName());
        }
        ProductBrand brand = new ProductBrand();
        BeanUtils.copyProperties(request, brand);
        // 未传多语言名称字段(null)时保留原多语言名称，传空字符串则清空多语言名称
        if (ObjectUtil.isNull(request.getNameJson())) {
            brand.setNameJson(oldBrand.getNameJson());
        }
        if (StrUtil.isNotBlank(brand.getIcon())) {
            brand.setIcon(systemAttachmentService.clearPrefix(brand.getIcon()));
        }
        Boolean execute = transactionTemplate.execute(e -> {
            updateById(brand);
            brandCategoryService.deleteByBid(brand.getId());
            if (StrUtil.isNotBlank(request.getCategoryIds())) {
                List<ProductBrandCategory> initList = brandCategoryInit(brand.getId(), request.getCategoryIds());
                brandCategoryService.saveBatch(initList, 100);
            }
            return Boolean.TRUE;
        });
        if (execute) {
            redisUtil.delete(RedisConstants.PRODUCT_ALL_BRAND_LIST_KEY);
        }
        return execute;
    }

    /**
     * 修改品牌显示状态
     *
     * @param id 品牌ID
     * @return Boolean
     */
    @Override
    public Boolean updateShowStatus(Integer id) {
        ProductBrand brand = getByIdException(id);
        brand.setIsShow(!brand.getIsShow());
        boolean update = updateById(brand);
        if (update) {
            redisUtil.delete(RedisConstants.PRODUCT_ALL_BRAND_LIST_KEY);
        }
        return update;
    }

    /**
     * 品牌缓存列表(全部)
     *
     * @return List
     */
    @Override
    public List<ProductBrandResponse> getCacheAllList() {
        List<ProductBrandResponse> cachedList;
        if (redisUtil.exists(RedisConstants.PRODUCT_ALL_BRAND_LIST_KEY)) {
            cachedList = redisUtil.get(RedisConstants.PRODUCT_ALL_BRAND_LIST_KEY);
        } else {
            LambdaQueryWrapper<ProductBrand> lqw = Wrappers.lambdaQuery();
            lqw.eq(ProductBrand::getIsDel, false);
            lqw.orderByDesc(ProductBrand::getSort);
            List<ProductBrand> brandList = dao.selectList(lqw);
            if (CollUtil.isEmpty(brandList)) {
                return CollUtil.newArrayList();
            }
            cachedList = brandList.stream().map(e -> {
                ProductBrandResponse brandResponse = new ProductBrandResponse();
                BeanUtils.copyProperties(e, brandResponse);
                return brandResponse;
            }).collect(Collectors.toList());
            redisUtil.set(RedisConstants.PRODUCT_ALL_BRAND_LIST_KEY, cachedList);
        }
        if (CollUtil.isEmpty(cachedList)) {
            return CollUtil.newArrayList();
        }
        return cachedList.stream().map(e -> {
            ProductBrandResponse copy = new ProductBrandResponse();
            BeanUtils.copyProperties(e, copy);
            copy.setName(resolveLocalizedName(e.getName(), e.getNameJson()));
            return copy;
        }).collect(Collectors.toList());
    }

    /**
     * 通过分类查询品牌分页列表
     *
     * @param request          查询参数
     * @param pageParamRequest 分页参数
     * @return PageInfo
     */
    @Override
    public PageInfo<ProductBrandResponse> getPageListByCategory(BrandCategorySearchRequest request, PageParamRequest pageParamRequest) {
        Page<ProductBrand> page = PageHelper.startPage(pageParamRequest.getPage(), pageParamRequest.getLimit());
        Map<String, Object> map = CollUtil.newHashMap();
        map.put("cid", request.getCid());
        if (StrUtil.isNotBlank(request.getBrandName())) {
            map.put("brandName", request.getBrandName());
        }
        List<ProductBrand> brandList = dao.getPageListByCategory(map);
        if (CollUtil.isEmpty(brandList)) {
            return CommonPage.copyPageInfo(page, CollUtil.newArrayList());
        }
        List<ProductBrandResponse> responseList = brandList.stream().map(e -> {
            ProductBrandResponse brandResponse = new ProductBrandResponse();
            BeanUtils.copyProperties(e, brandResponse);
            return brandResponse;
        }).collect(Collectors.toList());
        return CommonPage.copyPageInfo(page, responseList);
    }

    /**
     * 根据ID列表获取品牌列表
     *
     * @param brandIdList 品牌ID列表
     */
    @Override
    public List<ProductBrand> findByIdList(List<Integer> brandIdList) {
        LambdaQueryWrapper<ProductBrand> lqw = Wrappers.lambdaQuery();
        lqw.eq(ProductBrand::getIsDel, false);
        lqw.in(ProductBrand::getId, brandIdList);
        List<ProductBrand> list = dao.selectList(lqw);
        if (CollUtil.isNotEmpty(list)) {
            list.forEach(item -> item.setName(resolveLocalizedName(item.getName(), item.getNameJson())));
        }
        return list;
    }

    private String getRequestLanguage() {
        HttpServletRequest request = RequestUtil.getRequest();
        String language = null;
        if (request != null) {
            language = request.getHeader("lang");
        }
        return StrUtil.isBlank(language) ? "zh-cn" : language;
    }

    /**
     * 按请求语言解析品牌名称，缺省回退默认 name
     */
    private String resolveLocalizedName(String name, String nameJson) {
        String language = getRequestLanguage();
        if (StrUtil.isBlank(language) || "zh-cn".equals(language) || StrUtil.isBlank(nameJson)) {
            return name;
        }
        try {
            JSONObject jsonObject = JSON.parseObject(nameJson);
            String localized = jsonObject.getString(language);
            if (StrUtil.isNotBlank(localized)) {
                return localized;
            }
        } catch (Exception ignored) {
            // 解析失败时保留默认名称
        }
        return name;
    }

    private ProductBrand getByIdException(Integer id) {
        ProductBrand brand = getById(id);
        if (ObjectUtil.isNull(brand) || brand.getIsDel()) {
            throw new CrmebException(ProductResultCode.PRODUCT_BRAND_NOT_EXIST);
        }
        return brand;
    }

    /**
     * 初始化品牌分类关联
     *
     * @param categoryIds 分类ids
     * @return List<ProductBrandCategory>
     */
    private List<ProductBrandCategory> brandCategoryInit(Integer bid, String categoryIds) {
        String[] split = categoryIds.split(",");
        return Arrays.stream(split).map(e -> {
            ProductBrandCategory brandCategory = new ProductBrandCategory();
            brandCategory.setBid(bid);
            brandCategory.setCid(Integer.valueOf(e));
            return brandCategory;
        }).collect(Collectors.toList());
    }

    /**
     * 校验品牌名是否重复
     *
     * @param name 品牌名
     */
    private void validateName(String name) {
        if (StrUtil.isBlank(name)) {
            return;
        }
        LambdaQueryWrapper<ProductBrand> lqw = Wrappers.lambdaQuery();
        lqw.eq(ProductBrand::getIsDel, false);
        lqw.eq(ProductBrand::getName, name);
        lqw.last(" limit 1");
        ProductBrand brand = dao.selectOne(lqw);
        if (ObjectUtil.isNotNull(brand)) {
            throw new CrmebException(ProductResultCode.PRODUCT_BRAND_EXIST);
        }
    }
}

