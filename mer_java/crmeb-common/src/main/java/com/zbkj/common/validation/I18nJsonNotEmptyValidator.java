package com.zbkj.common.validation;

import com.zbkj.common.utils.I18nJsonUtil;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class I18nJsonNotEmptyValidator implements ConstraintValidator<I18nJsonNotEmpty, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return I18nJsonUtil.hasAnyText(value);
    }
}
