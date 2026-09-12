package com.zbkj.common.config;

import com.anji.captcha.properties.AjCaptchaProperties;
import com.anji.captcha.service.CaptchaService;
import com.anji.captcha.service.impl.AbstractCaptchaService;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.PriorityOrdered;

import java.lang.reflect.Field;

/**
 * Anji 滑块验证码把 {@code aj.captcha.water-mark} 画在底图上。
 * YAML 写成空字符串时，组件仍可能沿用默认文案；这里在属性绑定后、验证码初始化后强制清空。
 */
@Configuration
public class CaptchaWatermarkOffConfig {

    @Bean
    public static BeanPostProcessor captchaWatermarkOffProcessor() {
        return new CaptchaWatermarkOffProcessor();
    }

    @Bean
    public ApplicationRunner captchaWatermarkOffRunner() {
        return args -> clearStaticWaterMark();
    }

    private static final class CaptchaWatermarkOffProcessor implements BeanPostProcessor, PriorityOrdered {
        @Override
        public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
            if (bean instanceof AjCaptchaProperties) {
                ((AjCaptchaProperties) bean).setWaterMark("");
            }
            if (bean instanceof CaptchaService) {
                clearStaticWaterMark();
            }
            return bean;
        }

        @Override
        public int getOrder() {
            return HIGHEST_PRECEDENCE;
        }
    }

    private static void clearStaticWaterMark() {
        try {
            Field field = AbstractCaptchaService.class.getDeclaredField("waterMark");
            field.setAccessible(true);
            field.set(null, "");
        } catch (Exception ignored) {
            // ignore
        }
    }
}
