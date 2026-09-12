package com.zbkj.front.controller;

import com.zbkj.common.model.system.SystemLanguage;
import com.zbkj.common.result.CommonResult;
import com.zbkj.service.service.SystemLanguageService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 会员端语言列表
 */
@Slf4j
@RestController
@RequestMapping("api/front/language")
@Api(tags = "会员端语言")
public class LanguageController {

    @Autowired
    private SystemLanguageService systemLanguageService;

    @ApiOperation(value = "获取启用的语言列表")
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public CommonResult<List<SystemLanguage>> getEnableList() {
        return CommonResult.success(systemLanguageService.getEnableList());
    }
}
