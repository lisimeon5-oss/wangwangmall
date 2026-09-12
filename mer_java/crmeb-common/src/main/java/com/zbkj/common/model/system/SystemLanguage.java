package com.zbkj.common.model.system;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Date;

/**
 * <p>
 * 系统语言表
 * </p>
 *
 * @author CRMEB
 * @since 2026-08-23
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("eb_system_language")
@ApiModel(value = "SystemLanguage对象", description = "系统语言表")
public class SystemLanguage implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "语言ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "语言名称")
    private String name;

    @ApiModelProperty(value = "语言代码")
    private String code;

    @ApiModelProperty(value = "是否默认 0-否 1-是")
    private Boolean isDefault;

    @ApiModelProperty(value = "是否启用 0-否 1-是")
    private Boolean status;

    @ApiModelProperty(value = "排序")
    private Integer sort;

    @ApiModelProperty(value = "创建时间")
    private Date createTime;

    @ApiModelProperty(value = "更新时间")
    private Date updateTime;
}