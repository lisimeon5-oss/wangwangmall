package com.zbkj.common.response.groupbuy;

import com.zbkj.common.model.product.ProductAttribute;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author stivepeim
 * @date 2024/8/19 11:31
 * @description GroupBuyActivityProductResponse
 */
@Data
public class GroupBuyActivityProductResponse {

    @ApiModelProperty(value = "拼团基础商品id")
    private Integer productId;

    @ApiModelProperty(value = "商品名称")
    private String productName;

    @ApiModelProperty(value = "多语言商品名称(JSON)")
    private String productNameJson;

    @ApiModelProperty(value = "商品主图")
    private String image;

    @ApiModelProperty(value = "规格及规格值（含 optionNameJson，后台展示翻译用）")
    private List<ProductAttribute> attrList;

    @ApiModelProperty(value = "拼团商品")
    private List<GroupBuyActivitySkuResponse> groupBuyActivitySkuResponses;

}
