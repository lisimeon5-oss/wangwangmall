package com.zbkj.common.config;

import com.zbkj.common.interceptor.I18nJsonLikeInterceptor;
import org.apache.ibatis.plugin.Interceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class I18nMybatisConfig {

    @Bean
    public Interceptor i18nJsonLikeInterceptor() {
        return new I18nJsonLikeInterceptor();
    }
}
