package com.zbkj.service.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zbkj.common.model.system.SystemLanguage;
import com.zbkj.service.dao.SystemLanguageDao;
import com.zbkj.service.service.SystemLanguageService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * SystemLanguageServiceImpl 接口实现
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
public class SystemLanguageServiceImpl extends ServiceImpl<SystemLanguageDao, SystemLanguage> implements SystemLanguageService {

    @Resource
    private SystemLanguageDao dao;

    /**
     * 获取启用的语言列表
     *
     * @return List<SystemLanguage>
     */
    @Override
    public List<SystemLanguage> getEnableList() {
        LambdaQueryWrapper<SystemLanguage> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(SystemLanguage::getStatus, true);
        lambdaQueryWrapper.orderByAsc(SystemLanguage::getSort);
        lambdaQueryWrapper.orderByAsc(SystemLanguage::getId);
        return dao.selectList(lambdaQueryWrapper);
    }
}