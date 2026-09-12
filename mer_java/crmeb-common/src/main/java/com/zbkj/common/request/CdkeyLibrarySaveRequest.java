package com.zbkj.common.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import com.zbkj.common.validation.I18nJsonNotEmpty;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;

/**
 * 卡密库保存对象
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
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@ApiModel(value = "CdkeyLibrarySaveRequest", description = "卡密库保存对象")
public class CdkeyLibrarySaveRequest implements Serializable {

    private static final long serialVersionUID = -7053809553211774431L;

    @ApiModelProperty(value = "卡密库ID,编辑时必填")
    private Integer id;

    @ApiModelProperty(value = "卡密库名称")
    @Length(max = 32, message = "卡密库名称长度不能超过32个字符")
    private String name;

    @ApiModelProperty(value = "多语言卡密库名称(JSON)", required = true)
    @I18nJsonNotEmpty(message = "多语言卡密库名称不能为空")
    private String nameJson;

    @ApiModelProperty(value = "备注")
    @Length(max = 200, message = "备注长度不能超过200个字符")
    private String remark;

    @ApiModelProperty(value = "多语言备注(JSON)")
    private String remarkJson;
}
