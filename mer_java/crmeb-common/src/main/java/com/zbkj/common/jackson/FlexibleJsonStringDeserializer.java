package com.zbkj.common.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;

/**
 * nameJson 既可能是 JSON 字符串，也可能是对象，统一转成字符串入库。
 */
public class FlexibleJsonStringDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonToken token = p.getCurrentToken();
        if (token == JsonToken.VALUE_NULL) {
            return null;
        }
        if (token == JsonToken.VALUE_STRING) {
            return p.getValueAsString();
        }
        JsonNode node = p.getCodec().readTree(p);
        return node == null || node.isNull() ? null : node.toString();
    }
}
