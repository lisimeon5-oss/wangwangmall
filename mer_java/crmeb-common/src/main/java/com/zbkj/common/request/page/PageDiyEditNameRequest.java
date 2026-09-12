package com.zbkj.common.request.page;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * @Auther: 大粽子
 * @Date: 2023/5/16 11:44
 * @Description: 页面分类和DIY用到的实体参数
 */
@Data
public class PageDiyEditNameRequest {

    @ApiModelProperty(value = "id")
    @NotNull(message = "模版id 不能为空")
    private Integer id;

    @ApiModelProperty(value = "页面名称")
    private String name;

    @ApiModelProperty(value = "多语言模板名称(JSON)")
    private String nameJson;
}
