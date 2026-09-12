package com.zbkj.common.request;

import com.zbkj.common.validation.I18nJsonNotEmpty;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;


/**
 * @ClassName CommunityTopicSaveRequest
 * @Description 添加社区话题请求对象
 * @Author HZW
 * @Date 2023/3/7 11:32
 * @Version 1.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@ApiModel(value = "CommunityTopicSaveRequest对象", description = "添加社区话题请求对象")
public class CommunityTopicSaveRequest implements Serializable {

    private static final long serialVersionUID = 6106214552849609391L;

    @ApiModelProperty("话题ID，编辑时必填")
    private Integer id;

    @ApiModelProperty("话题名称")
    @Length(max = 10, message = "话题名称最多为10个字符")
    private String name;

    @ApiModelProperty(value = "多语言话题名称(JSON)", required = true)
    @I18nJsonNotEmpty(message = "多语言话题名称不能为空")
    private String nameJson;
}
