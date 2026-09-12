<script>
import render from '@/components/FormGenerator/components/render/render.js';
import { translateFormConfig, translateText } from '@/utils/i18nText';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { parseLangJsonMap, resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson } from '@/utils/localizedName';

const ruleTrigger = {
  'el-input': 'blur',
  'el-input-number': 'blur',
  'el-select': 'change',
  'el-radio-group': 'change',
  'el-checkbox-group': 'change',
  'el-cascader': 'change',
  'el-time-picker': 'change',
  'el-date-picker': 'change',
  'el-rate': 'change',
};

const I18N_INPUT_FIELDS = ['name', 'title', 'tag', 'label', 'info'];
const I18N_TEXTAREA_FIELDS = ['stor_reason', 'recharge_attention'];

function jsonFieldOf(field) {
  return `${field}Json`;
}

function textareaJsonFieldOf(field) {
  return `${field}_json`;
}

function isI18nTextarea(scheme) {
  if (!scheme || !scheme.__vModel__) return false;
  if (I18N_TEXTAREA_FIELDS.indexOf(scheme.__vModel__) > -1) return true;
  const label = (scheme.__config__ && scheme.__config__.label) || '';
  return String(label).indexOf('充值注意事项') > -1;
}

function isI18nInput(scheme, config) {
  return scheme && I18N_INPUT_FIELDS.indexOf(scheme.__vModel__) > -1 && config && config.tag === 'el-input';
}

function renderFrom(h) {
  const { formConfCopy } = this;
  return (
    <el-row gutter={formConfCopy.gutter}>
      <el-form
        size={formConfCopy.size}
        label-position={formConfCopy.labelPosition}
        disabled={formConfCopy.disabled}
        label-width={`${formConfCopy.labelWidth}px`}
        ref={formConfCopy.formRef}
        // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
        props={{ model: this[formConfCopy.formModel] }}
        rules={this[formConfCopy.formRules]}
      >
        {renderFormItem.call(this, h, formConfCopy.fields)}
        {formConfCopy.formBtns && formBtns.call(this, h)}
      </el-form>
    </el-row>
  );
}

function formBtns(h) {
  return (
    <el-col>
      <el-form-item size="mini">
        <el-button type="primary" v-debounceClick={this.submitForm}>
          {this.$t('common.submit')}
        </el-button>
      </el-form-item>
    </el-col>
  );
}

function renderFormItem(h, elementList) {
  if (!Array.isArray(elementList)) return null;
  return elementList.map((scheme) => {
    const config = scheme && scheme.__config__;
    if (!config || !config.layout) return null;
    const layout = layouts[config.layout];
    if (layout) {
      return layout.call(this, h, scheme);
    }
    return null;
  });
}

function renderChildren(h, scheme) {
  const config = scheme.__config__;
  if (!Array.isArray(config.children)) return null;
  return renderFormItem.call(this, h, config.children);
}

function setValue(event, config, scheme) {
  this.$set(config, 'defaultValue', event);
  this.$set(this[this.formConf.formModel], scheme.__vModel__, event);
}

function buildListeners(scheme) {
  const config = scheme.__config__;
  const methods = this.formConf.__methods__ || {};
  const listeners = {};

  // 给__methods__中的方法绑定this和event
  Object.keys(methods).forEach((key) => {
    listeners[key] = (event) => methods[key].call(this, event);
  });
  // 响应 render.js 中的 vModel $emit('input', val)
  listeners.input = (event) => setValue.call(this, event, config, scheme);

  return listeners;
}
const layouts = {
  colFormItem(h, scheme) {
    const config = scheme.__config__;
    const listeners = buildListeners.call(this, scheme);
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null;
    if (config.showLabel === false) labelWidth = '0';
    if (isI18nTextarea(scheme)) {
      const field = scheme.__vModel__;
      const placeholder =
        field === 'stor_reason'
          ? this.$t('systemSetting.returnReasonLineTip')
          : this.namePlaceholder(config.label);
      return (
        <el-col span={config.span}>
          <el-form-item label-width={labelWidth} prop={field} label={config.showLabel ? translateText(config.label) : ''}>
            <div class="lang-name-switch">
              <el-radio-group
                value={this.activeLang}
                size="mini"
                onInput={(val) => {
                  this.activeLang = val;
                }}
              >
                {this.langOptions.map((lang) => (
                  <el-radio-button key={lang.code} label={lang.code}>
                    {lang.label}
                  </el-radio-button>
                ))}
              </el-radio-group>
            </div>
            <el-input
              type="textarea"
              rows={field === 'recharge_attention' ? 8 : 6}
              value={this.getI18nTextarea(field)}
              placeholder={placeholder}
              onInput={(val) => this.setI18nTextarea(field, val)}
            />
          </el-form-item>
        </el-col>
      );
    }
    if (isI18nInput(scheme, config)) {
      const field = scheme.__vModel__;
      return (
        <el-col span={config.span}>
          <el-form-item label-width={labelWidth} prop={field} label={config.showLabel ? translateText(config.label) : ''}>
            <div class="lang-name-switch">
              <el-radio-group
                value={this.activeLang}
                size="mini"
                onInput={(val) => {
                  this.activeLang = val;
                }}
              >
                {this.langOptions.map((lang) => (
                  <el-radio-button key={lang.code} label={lang.code}>
                    {lang.label}
                  </el-radio-button>
                ))}
              </el-radio-group>
            </div>
            <el-input
              value={this.getI18nField(field)}
              maxlength={scheme.maxlength || 11}
              show-word-limit={scheme['show-word-limit']}
              placeholder={this.namePlaceholder(config.label)}
              onInput={(val) => this.setI18nField(field, val)}
            />
          </el-form-item>
        </el-col>
      );
    }
    if (config.tips && !config.tipsIsLink) {
      return (
        <el-col span={config.span}>
          <el-form-item label-width={labelWidth} prop={scheme.__vModel__} label={config.showLabel ? translateText(config.label) : ''}>
            <render conf={scheme} {...{on: listeners}} />

            <div>
              <span className="tips-info" class="tips-info">{translateText(config.tipsDesc)}</span>
            </div>

          </el-form-item>
        </el-col>
      );
    } else if (config.tips && config.tipsIsLink) {
      return (
        <el-col span={config.span}>
          <el-form-item label-width={labelWidth} prop={scheme.__vModel__} label={config.showLabel ? translateText(config.label) : ''}>
            <render conf={scheme} {...{on: listeners}} />
            <div>
              <el-link className="tips-info" class="tips-info" type="info" href={config.tipsLink}
                       target="_blank">{translateText(config.tipsDesc)}</el-link>
            </div>
          </el-form-item>
        </el-col>
      );
    } else {
      return (
        <el-col span={config.span}>
          <el-form-item label-width={labelWidth} prop={scheme.__vModel__} label={config.showLabel ? translateText(config.label) : ''}>
            <render conf={scheme} {...{on: listeners}} />

          </el-form-item>
        </el-col>
      );
    }
  },
  rowFormItem(h, scheme) {
    let child = renderChildren.apply(this, arguments);
    if (scheme.type === 'flex') {
      child = (
        <el-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
          {child}
        </el-row>
      );
    }
    return (
      <el-col span={scheme.span}>
        <el-row gutter={scheme.gutter}>{child}</el-row>
      </el-col>
    );
  },
};

export default {
  components: {
    render,
  },
  props: {
    formConf: {
      type: Object,
      required: true,
    },
    formEditData: {
      type: Object,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    if (this.isEdit && this.formConf && Array.isArray(this.formConf.fields)) {
      // 初始化待编辑数据
      this.formConf.fields.forEach((conf) => {
        if (!conf || !conf.__config__) return;
        // 设置现有的数据
        const hasValueForEdit = this.formEditData && this.formEditData[conf.__vModel__];
        if (hasValueForEdit) {
          conf.__config__.defaultValue = hasValueForEdit;
        }
        // 如果是el-select标签 判断数据后改变实现默认选中效果
        if (conf.__config__.tag === 'el-select' || conf.__config__.tag === 'el-radio-group') {
          const options = (conf.__slot__ && conf.__slot__.options) || [];
          const perValue = options.filter((option) => option.value == (this.formEditData && this.formEditData[conf.__vModel__]));
          if (perValue.length > 0) {
            // 有表单数据
            conf.__config__.defaultValue = perValue[0].value;
          }
        }
      });
    }
    const formConfCopy = JSON.parse(JSON.stringify(this.formConf));
    translateFormConfig(formConfCopy);
    const data = {
      formConfCopy,
      [this.formConf.formModel]: {},
      [this.formConf.formRules]: {},
    };
    this.initFormData(data.formConfCopy.fields, data[this.formConf.formModel]);
    this.buildRules(data.formConfCopy.fields, data[this.formConf.formRules]);
    I18N_TEXTAREA_FIELDS.forEach((field) => {
      const hasField =
        this.formConf &&
        Array.isArray(this.formConf.fields) &&
        this.formConf.fields.some((item) => item && item.__vModel__ === field);
      if (!hasField) return;
      const jsonKey = textareaJsonFieldOf(field);
      const jsonVal = this.formEditData && this.formEditData[jsonKey];
      if (jsonVal && typeof jsonVal === 'object') {
        data[this.formConf.formModel][jsonKey] = JSON.stringify(jsonVal);
      } else {
        data[this.formConf.formModel][jsonKey] = jsonVal || '';
      }
    });
    (this.formConf.fields || []).forEach((item) => {
      if (!isI18nTextarea(item)) return;
      const jsonKey = textareaJsonFieldOf(item.__vModel__);
      if (data[this.formConf.formModel][jsonKey] !== undefined) return;
      const jsonVal = this.formEditData && this.formEditData[jsonKey];
      if (jsonVal && typeof jsonVal === 'object') {
        data[this.formConf.formModel][jsonKey] = JSON.stringify(jsonVal);
      } else {
        data[this.formConf.formModel][jsonKey] = jsonVal || '';
      }
    });
    I18N_INPUT_FIELDS.forEach((field) => {
      const hasField =
        this.formConf &&
        Array.isArray(this.formConf.fields) &&
        this.formConf.fields.some((item) => item && item.__vModel__ === field);
      if (!hasField) return;
      const jsonKey = jsonFieldOf(field);
      const jsonVal = this.formEditData && this.formEditData[jsonKey];
      if (jsonVal && typeof jsonVal === 'object') {
        data[this.formConf.formModel][jsonKey] = JSON.stringify(jsonVal);
      } else {
        data[this.formConf.formModel][jsonKey] = jsonVal || '';
      }
    });
    data.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
    data.defaultLangCode = 'zh-cn';
    data.activeLang = (this.$i18n && this.$i18n.locale) || 'zh-cn';
    return data;
  },
  watch: {
    '$i18n.locale'() {
      this.refreshFormI18n();
    },
  },
  methods: {
    namePlaceholder(label) {
      const enter = this.$t('formGenerator.pleaseEnter');
      const name = label || this.$t('formGenerator.navName');
      const locale = String((this.$i18n && this.$i18n.locale) || '').toLowerCase();
      const join = locale.startsWith('zh') ? '' : ' ';
      return `${enter}${join}${name}`.trim();
    },
    getI18nField(field) {
      const model = this[this.formConf.formModel] || {};
      if (this.activeLang === this.defaultLangCode) return model[field] || '';
      return parseLangJsonMap(model[jsonFieldOf(field)])[this.activeLang] || '';
    },
    setI18nField(field, val) {
      const model = this[this.formConf.formModel];
      if (!model) return;
      if (this.activeLang === this.defaultLangCode) {
        this.$set(model, field, val);
        return;
      }
      const jsonKey = jsonFieldOf(field);
      const map = parseLangJsonMap(model[jsonKey]);
      if (String(val || '').trim()) map[this.activeLang] = val;
      else delete map[this.activeLang];
      this.$set(model, jsonKey, Object.keys(map).length ? JSON.stringify(map) : '');
    },
    hasI18nInputField() {
      return (
        this.formConf &&
        Array.isArray(this.formConf.fields) &&
        this.formConf.fields.some((item) => item && I18N_INPUT_FIELDS.indexOf(item.__vModel__) > -1)
      );
    },
    syncI18nNameJson() {
      if (!this.hasI18nInputField()) return;
      const model = this[this.formConf.formModel];
      if (!model) return;
      const fields = (this.formConf.fields || [])
        .map((item) => item && item.__vModel__)
        .filter((name) => I18N_INPUT_FIELDS.indexOf(name) > -1);
      fields.forEach((field) => {
        const jsonKey = jsonFieldOf(field);
        model[jsonKey] = buildI18nNameJson(
          this.langOptions,
          parseLangJsonMap(model[jsonKey]),
          this.defaultLangCode,
          model[field],
        );
      });
    },
    getI18nTextarea(field) {
      const model = this[this.formConf.formModel] || {};
      if (this.activeLang === this.defaultLangCode) return model[field] || '';
      return parseLangJsonMap(model[textareaJsonFieldOf(field)])[this.activeLang] || '';
    },
    setI18nTextarea(field, val) {
      const model = this[this.formConf.formModel];
      if (!model) return;
      if (this.activeLang === this.defaultLangCode) {
        this.$set(model, field, val);
        return;
      }
      const jsonKey = textareaJsonFieldOf(field);
      const map = parseLangJsonMap(model[jsonKey]);
      if (String(val || '').trim()) map[this.activeLang] = val;
      else delete map[this.activeLang];
      this.$set(model, jsonKey, Object.keys(map).length ? JSON.stringify(map) : '');
    },
    hasI18nTextareaField() {
      return (
        this.formConf &&
        Array.isArray(this.formConf.fields) &&
        this.formConf.fields.some((item) => isI18nTextarea(item))
      );
    },
    syncI18nTextareaJson() {
      if (!this.hasI18nTextareaField()) return;
      const model = this[this.formConf.formModel];
      if (!model) return;
      (this.formConf.fields || []).forEach((item) => {
        if (!isI18nTextarea(item)) return;
        const field = item.__vModel__;
        const jsonKey = textareaJsonFieldOf(field);
        model[jsonKey] = buildI18nNameJson(
          this.langOptions,
          parseLangJsonMap(model[jsonKey]),
          this.defaultLangCode,
          model[field],
        );
      });
    },
    getLanguageList() {
      systemLanguageList()
        .then((list) => {
          if (!list || list.length === 0) {
            this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          } else {
            this.langOptions = list.map((item) => ({
              code: item.code,
              label: item.name,
              isDefault: item.isDefault,
            }));
            const defaultLang = list.find((item) => item.isDefault);
            this.defaultLangCode = defaultLang ? defaultLang.code : 'zh-cn';
          }
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    refreshFormI18n() {
      const formConfCopy = JSON.parse(JSON.stringify(this.formConf));
      translateFormConfig(formConfCopy);
      this.formConfCopy = formConfCopy;
      this[this.formConf.formRules] = {};
      this.buildRules(formConfCopy.fields, this[this.formConf.formRules]);
    },
    initFormData(componentList, formData) {
      componentList.forEach((cur) => {
        const config = cur.__config__;
        if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue;
        if (config.children) this.initFormData(config.children, formData);
      });
    },
    buildRules(componentList, rules) {
      componentList.forEach((cur) => {
        const config = cur.__config__;
        if (Array.isArray(config.regList)) {
          if (config.required) {
            const required = { required: config.required, message: cur.placeholder };
            if (Array.isArray(config.defaultValue)) {
              required.type = 'array';
              required.message = `请至少选择一个${config.label}`;
            }
            required.message === undefined && (required.message = `${config.label}不能为空`);
            if (I18N_INPUT_FIELDS.indexOf(cur.__vModel__) > -1) {
              const field = cur.__vModel__;
              required.required = false;
              required.validator = (rule, value, callback) => {
                const model = this[this.formConf.formModel] || {};
                if (hasI18nNameContent(model[field], parseLangJsonMap(model[jsonFieldOf(field)]))) callback();
                else callback(new Error(required.message || this.$t('formGenerator.pleaseFillName')));
              };
            }
            if (isI18nTextarea(cur)) {
              const field = cur.__vModel__;
              required.required = false;
              required.validator = (rule, value, callback) => {
                const model = this[this.formConf.formModel] || {};
                if (hasI18nNameContent(model[field], parseLangJsonMap(model[textareaJsonFieldOf(field)]))) callback();
                else callback(new Error(required.message || this.$t('formGenerator.pleaseFillName')));
              };
            }
            config.regList.push(required);
          }
          rules[cur.__vModel__] = config.regList.map((item) => {
            item.pattern && (item.pattern = eval(item.pattern));
            item.trigger = ruleTrigger && ruleTrigger[config.tag];
            return item;
          });
        }
        if (config.children) this.buildRules(config.children, rules);
      });
    },
    resetForm() {
      this.$emit('resetForm', this.formConf);
      const formConfCopy = JSON.parse(JSON.stringify(this.formConf));
      translateFormConfig(formConfCopy);
      this.formConfCopy = formConfCopy;
      this.$refs[this.formConf.formRef].resetFields();
    },
    submitForm() {
      this.$refs[this.formConf.formRef].validate((valid) => {
        if (!valid) return false;
        this.syncI18nNameJson();
        this.syncI18nTextareaJson();
        // 触发sumit事件
        this.$emit('submit', this[this.formConf.formModel]);
        return true;
      });
    },
  },
  mounted() {
    if (this.hasI18nTextareaField() || this.hasI18nInputField()) this.getLanguageList();
  },
  render(h) {
    return renderFrom.call(this, h);
  },
};
</script>
<style>
.tips-info {
  line-height: 18px;
  color: #c0c4cc;
  font-size: 12px;
}
.lang-name-switch {
  width: 100%;
  margin: 0 0 10px;
}
.lang-name-switch .el-radio-group {
  display: flex;
  flex-wrap: wrap;
}
</style>
