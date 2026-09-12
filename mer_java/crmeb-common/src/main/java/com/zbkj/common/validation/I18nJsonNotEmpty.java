package com.zbkj.common.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = I18nJsonNotEmptyValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface I18nJsonNotEmpty {

    String message() default "多语言名称不能为空";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
