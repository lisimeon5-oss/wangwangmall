<template>
  <div class="right-board">
    <el-tabs v-model="currentTab" class="center-tabs">
      <el-tab-pane :label="$t('formGenerator.componentProps')" name="field" />
      <el-tab-pane :label="$t('formGenerator.formProps')" name="form" />
    </el-tabs>
    <div class="field-box">
      <!-- <a class="document-link" target="_blank" :href="documentLink" title="查看组件文档">
        <i class="el-icon-link" />
      </a> -->
      <el-scrollbar class="right-scrollbar">
        <!-- 组件属性 -->
        <el-form v-show="currentTab === 'field' && showField" size="small" label-width="90px">
          <el-form-item v-if="activeData.__config__.changeTag" :label="$t('formGenerator.componentType')">
            <el-select
              v-model="activeData.__config__.tagIcon"
              :placeholder="$t('formGenerator.pleaseSelectComponentType')"
              :style="{ width: '100%' }"
              @change="tagChange"
            >
              <el-option-group v-for="group in tagList" :key="group.label" :label="fgT(group.label)">
                <el-option
                  v-for="item in group.options"
                  :key="item.__config__.label"
                  :label="fgT(item.__config__.label)"
                  :value="item.__config__.tagIcon"
                >
                  <svg-icon class="node-icon" :icon-class="item.__config__.tagIcon" />
                  <span> {{ fgT(item.__config__.label) }}</span>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeData.__vModel__ !== undefined" :label="$t('formGenerator.fieldName')">
            <el-input v-model.trim="activeData.__vModel__" :placeholder="$t('formGenerator.pleaseEnterFieldName')" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.componentName !== undefined" :label="$t('formGenerator.componentName')">
            {{ activeData.__config__.componentName }}
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'self-upload'" :label="$t('formGenerator.title')">
            <el-input :value="fgT(activeData.__config__.label)" :placeholder="$t('formGenerator.pleaseEnterTitle')" @input="onLabelInput" />
          </el-form-item>
          <el-form-item
            v-if="activeData.__config__.label !== undefined && activeData.__config__.tag !== 'self-upload'"
            :label="$t('formGenerator.title')"
          >
            <el-input :value="fgT(activeData.__config__.label)" :placeholder="$t('formGenerator.pleaseEnterTitle')" @input="onLabelInput" />
          </el-form-item>
          <el-form-item v-if="activeData.placeholder !== undefined" :label="$t('formGenerator.placeholderTip')">
            <el-input :value="fgT(activeData.placeholder)" :placeholder="$t('formGenerator.pleaseEnterPlaceholder')" @input="onPlaceholderInput" />
          </el-form-item>
          <el-form-item v-if="activeData['start-placeholder'] !== undefined" :label="$t('formGenerator.startPlaceholder')">
            <el-input :value="fgT(activeData['start-placeholder'])" :placeholder="$t('formGenerator.pleaseEnterPlaceholder')" @input="onStartPlaceholderInput" />
          </el-form-item>
          <el-form-item v-if="activeData['end-placeholder'] !== undefined" :label="$t('formGenerator.endPlaceholder')">
            <el-input :value="fgT(activeData['end-placeholder'])" :placeholder="$t('formGenerator.pleaseEnterPlaceholder')" @input="onEndPlaceholderInput" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.span !== undefined" :label="$t('formGenerator.formGrid')">
            <el-slider
              v-model="activeData.__config__.span"
              :max="24"
              :min="1"
              :marks="{ 12: '' }"
              @change="spanChange"
            />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.layout === 'rowFormItem'" :label="$t('formGenerator.gutter')">
            <el-input-number v-model.trim="activeData.gutter" :min="0" :placeholder="$t('formGenerator.gutter')" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.layout === 'rowFormItem'" :label="$t('formGenerator.layoutMode')">
            <el-radio-group v-model="activeData.type">
              <el-radio-button label="default" />
              <el-radio-button label="flex" />
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="activeData.justify !== undefined && activeData.type === 'flex'" :label="$t('formGenerator.horizontalAlign')">
            <el-select v-model="activeData.justify" :placeholder="$t('formGenerator.pleaseSelectHorizontal')" :style="{ width: '100%' }">
              <el-option v-for="(item, index) in justifyOptions" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeData.align !== undefined && activeData.type === 'flex'" :label="$t('formGenerator.verticalAlign')">
            <el-radio-group v-model="activeData.align">
              <el-radio-button label="top" />
              <el-radio-button label="middle" />
              <el-radio-button label="bottom" />
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="activeData.__config__.labelWidth !== undefined" :label="$t('formGenerator.labelWidth')">
            <el-input v-model.number="activeData.__config__.labelWidth" type="number" :placeholder="$t('formGenerator.pleaseEnterLabelWidth')" />
          </el-form-item>
          <el-form-item v-if="activeData.style && activeData.style.width !== undefined" :label="$t('formGenerator.componentWidth')">
            <el-input v-model.trim="activeData.style.width" :placeholder="$t('formGenerator.pleaseEnterComponentWidth')" clearable />
          </el-form-item>
          <el-form-item v-if="activeData.__vModel__ !== undefined" :label="$t('formGenerator.defaultValue')">
            <el-input
              :value="setDefaultValue(activeData.__config__.defaultValue)"
              :placeholder="$t('formGenerator.pleaseEnterDefaultValue')"
              @input="onDefaultValueInput"
            />
          </el-form-item>
          <el-form-item
            v-if="activeData.__config__.showLabel !== undefined && activeData.__config__.labelWidth !== undefined"
            :label="$t('formGenerator.showLabel')"
          >
            <el-switch v-model="activeData.__config__.showLabel" />
          </el-form-item>
          <el-form-item v-if="activeData.branding !== undefined" :label="$t('formGenerator.branding')">
            <el-switch v-model="activeData.branding" @input="changeRenderKey" />
          </el-form-item>
          <el-form-item v-if="activeData['allow-half'] !== undefined" :label="$t('formGenerator.allowHalf')">
            <el-switch v-model="activeData['allow-half']" />
          </el-form-item>
          <el-form-item v-if="activeData['show-text'] !== undefined" :label="$t('formGenerator.showText')">
            <el-switch v-model="activeData['show-text']" @change="rateTextChange" />
          </el-form-item>
          <el-form-item v-if="activeData['show-score'] !== undefined" :label="$t('formGenerator.showScore')">
            <el-switch v-model="activeData['show-score']" @change="rateScoreChange" />
          </el-form-item>
          <el-form-item v-if="activeData['show-stops'] !== undefined" :label="$t('formGenerator.showStops')">
            <el-switch v-model="activeData['show-stops']" />
          </el-form-item>
          <el-form-item v-if="activeData.range !== undefined" :label="$t('formGenerator.rangeSelect')">
            <el-switch v-model="activeData.range" @change="rangeChange" />
          </el-form-item>
          <el-form-item
            v-if="activeData.__config__.border !== undefined && activeData.__config__.optionType === 'default'"
            :label="$t('formGenerator.withBorder')"
          >
            <el-switch v-model="activeData.__config__.border" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-color-picker'" :label="$t('formGenerator.colorFormat')">
            <el-select
              v-model="activeData['color-format']"
              :placeholder="$t('formGenerator.pleaseSelectColorFormat')"
              :style="{ width: '100%' }"
              clearable
              @change="colorFormatChange"
            >
              <el-option
                v-for="(item, index) in colorFormatOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="
              activeData.size !== undefined &&
              (activeData.__config__.optionType === 'button' ||
                activeData.__config__.border ||
                activeData.__config__.tag === 'el-color-picker' ||
                activeData.__config__.tag === 'el-button')
            "
            :label="$t('formGenerator.componentSize')"
          >
            <el-radio-group v-model="activeData.size">
              <el-radio-button label="medium"> {{ $t('formGenerator.sizeMedium') }} </el-radio-button>
              <el-radio-button label="small"> {{ $t('formGenerator.sizeSmall') }} </el-radio-button>
              <el-radio-button label="mini"> {{ $t('formGenerator.sizeMini') }} </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="activeData['show-word-limit'] !== undefined" :label="$t('formGenerator.wordLimit')">
            <el-switch v-model="activeData['show-word-limit']" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-input-number'" :label="$t('formGenerator.stepStrictly')">
            <el-switch v-model="activeData['step-strictly']" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-cascader'" :label="$t('formGenerator.multiple')">
            <el-switch v-model="activeData.props.props.multiple" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-cascader'" :label="$t('formGenerator.showAllLevels')">
            <el-switch v-model="activeData['show-all-levels']" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-cascader'" :label="$t('formGenerator.filterable')">
            <el-switch v-model="activeData.filterable" />
          </el-form-item>
          <el-form-item v-if="activeData.clearable !== undefined" :label="$t('formGenerator.clearable')">
            <el-switch v-model="activeData.clearable" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.showTip !== undefined" :label="$t('formGenerator.showTip')">
            <el-switch v-model="activeData.__config__.showTip" />
          </el-form-item>
          <el-form-item
            v-if="activeData.__config__.tag === 'el-upload' || activeData.__config__.tag === 'self-upload'"
            :label="$t('formGenerator.multipleFile')"
          >
            <el-switch v-model="activeData.multiple" />
          </el-form-item>
          <el-form-item v-if="activeData['auto-upload'] !== undefined" :label="$t('formGenerator.autoUpload')">
            <el-switch v-model="activeData['auto-upload']" />
          </el-form-item>
          <el-form-item v-if="activeData.readonly !== undefined" :label="$t('formGenerator.readonly')">
            <el-switch v-model="activeData.readonly" />
          </el-form-item>
          <el-form-item v-if="activeData.disabled !== undefined" :label="$t('formGenerator.disabled')">
            <el-switch v-model="activeData.disabled" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-select'" :label="$t('formGenerator.canSearch')">
            <el-switch v-model="activeData.filterable" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-select'" :label="$t('formGenerator.multiple')">
            <el-switch v-model="activeData.multiple" @change="multipleChange" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.required !== undefined" :label="$t('formGenerator.required')">
            <el-switch v-model="activeData.__config__.required" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tips !== undefined" :label="$t('formGenerator.enableDesc')">
            <el-switch v-model="activeData.__config__.tips" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tips" :label="$t('formGenerator.descContent')">
            <el-input v-model="activeData.__config__.tipsDesc" :placeholder="$t('formGenerator.pleaseEnterDesc')" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tips" :label="$t('formGenerator.descLink')">
            <el-switch v-model="activeData.__config__.tipsIsLink" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tipsIsLink" :label="$t('formGenerator.linkUrl')">
            <el-input v-model="activeData.__config__.tipsLink" :placeholder="$t('formGenerator.pleaseEnterLink')" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-checkbox-group'" :label="$t('formGenerator.minSelect')">
            <el-input-number
              :value="activeData.min"
              :min="0"
              :placeholder="$t('formGenerator.minSelect')"
              @input="$set(activeData, 'min', $event ? $event : undefined)"
            />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-checkbox-group'" :label="$t('formGenerator.maxSelect')">
            <el-input-number
              :value="activeData.max"
              :min="0"
              :placeholder="$t('formGenerator.maxSelect')"
              @input="$set(activeData, 'max', $event ? $event : undefined)"
            />
          </el-form-item>
          <el-form-item v-if="activeData.__slot__ && activeData.__slot__.prepend !== undefined" :label="$t('formGenerator.prefix')">
            <el-input v-model.trim="activeData.__slot__.prepend" :placeholder="$t('formGenerator.pleaseEnterPrefix')" />
          </el-form-item>
          <el-form-item v-if="activeData.__slot__ && activeData.__slot__.append !== undefined" :label="$t('formGenerator.suffix')">
            <el-input v-model.trim="activeData.__slot__.append" :placeholder="$t('formGenerator.pleaseEnterSuffix')" />
          </el-form-item>
          <el-form-item v-if="activeData['prefix-icon'] !== undefined" :label="$t('formGenerator.prefixIcon')">
            <el-input v-model.trim="activeData['prefix-icon']" :placeholder="$t('formGenerator.pleaseEnterPrefixIcon')">
              <el-button slot="append" icon="el-icon-thumb" @click="openIconsDialog('prefix-icon')"> {{ $t('formGenerator.select') }} </el-button>
            </el-input>
          </el-form-item>
          <el-form-item v-if="activeData['suffix-icon'] !== undefined" :label="$t('formGenerator.suffixIcon')">
            <el-input v-model.trim="activeData['suffix-icon']" :placeholder="$t('formGenerator.pleaseEnterSuffixIcon')">
              <el-button slot="append" icon="el-icon-thumb" @click="openIconsDialog('suffix-icon')"> {{ $t('formGenerator.select') }} </el-button>
            </el-input>
          </el-form-item>
          <el-form-item
            v-if="activeData['icon'] !== undefined && activeData.__config__.tag === 'el-button'"
            :label="$t('formGenerator.buttonIcon')"
          >
            <el-input v-model.trim="activeData['icon']" :placeholder="$t('formGenerator.pleaseEnterButtonIcon')">
              <el-button slot="append" icon="el-icon-thumb" @click="openIconsDialog('icon')"> {{ $t('formGenerator.select') }} </el-button>
            </el-input>
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-cascader'" :label="$t('formGenerator.optionSeparator')">
            <el-input v-model.trim="activeData.separator" :placeholder="$t('formGenerator.pleaseEnterSeparator')" />
          </el-form-item>
          <el-form-item v-if="activeData.autosize !== undefined" :label="$t('formGenerator.minRows')">
            <el-input-number v-model.trim="activeData.autosize.minRows" :min="1" :placeholder="$t('formGenerator.minRows')" />
          </el-form-item>
          <el-form-item v-if="activeData.autosize !== undefined" :label="$t('formGenerator.maxRows')">
            <el-input-number v-model.trim="activeData.autosize.maxRows" :min="1" :placeholder="$t('formGenerator.maxRows')" />
          </el-form-item>
          <el-form-item v-if="isShowMin" :label="$t('formGenerator.minValue')">
            <el-input-number v-model.trim="activeData.min" :placeholder="$t('formGenerator.minValue')" />
          </el-form-item>
          <el-form-item v-if="isShowMax" :label="$t('formGenerator.maxValue')">
            <el-input-number v-model.trim="activeData.max" :placeholder="$t('formGenerator.maxValue')" />
          </el-form-item>
          <el-form-item v-if="activeData.height !== undefined" :label="$t('formGenerator.componentHeight')">
            <el-input-number v-model.trim="activeData.height" :placeholder="$t('formGenerator.height')" @input="changeRenderKey" />
          </el-form-item>
          <el-form-item v-if="isShowStep" :label="$t('formGenerator.step')">
            <el-input-number v-model.trim="activeData.step" :placeholder="$t('formGenerator.stepCount')" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-input-number'" :label="$t('formGenerator.precision')">
            <el-input-number v-model.trim="activeData.precision" :min="0" :placeholder="$t('formGenerator.precision')" />
          </el-form-item>
          <el-form-item v-if="activeData.__config__.tag === 'el-input-number'" :label="$t('formGenerator.buttonPosition')">
            <el-radio-group v-model="activeData['controls-position']">
              <el-radio-button label=""> {{ $t('formGenerator.default') }} </el-radio-button>
              <el-radio-button label="right"> {{ $t('formGenerator.rightSide') }} </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="activeData.maxlength !== undefined" :label="$t('formGenerator.maxInput')">
            <el-input v-model.trim="activeData.maxlength" :placeholder="$t('formGenerator.pleaseEnterLength')">
              <template slot="append"> {{ $t('formGenerator.chars') }} </template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="activeData['active-text'] !== undefined" :label="$t('formGenerator.activeTip')">
            <el-input v-model.trim="activeData['active-text']" :placeholder="$t('formGenerator.pleaseEnterActiveTip')" />
          </el-form-item>
          <el-form-item v-if="activeData['inactive-text'] !== undefined" :label="$t('formGenerator.inactiveTip')">
            <el-input v-model.trim="activeData['inactive-text']" :placeholder="$t('formGenerator.pleaseEnterInactiveTip')" />
          </el-form-item>
          <el-form-item v-if="activeData['active-value'] !== undefined" :label="$t('formGenerator.activeValue')">
            <el-input
              :value="setDefaultValue(activeData['active-value'])"
              :placeholder="$t('formGenerator.pleaseEnterActiveValue')"
              @input="onSwitchValueInput($event, 'active-value')"
            />
          </el-form-item>
          <el-form-item v-if="activeData['inactive-value'] !== undefined" :label="$t('formGenerator.inactiveValue')">
            <el-input
              :value="setDefaultValue(activeData['inactive-value'])"
              :placeholder="$t('formGenerator.pleaseEnterInactiveValue')"
              @input="onSwitchValueInput($event, 'inactive-value')"
            />
          </el-form-item>
          <el-form-item
            v-if="activeData.type !== undefined && 'el-date-picker' === activeData.__config__.tag"
            :label="$t('formGenerator.timeType')"
          >
            <el-select
              v-model="activeData.type"
              :placeholder="$t('formGenerator.pleaseSelectTimeType')"
              :style="{ width: '100%' }"
              @change="dateTypeChange"
            >
              <el-option v-for="(item, index) in dateOptions" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeData.name !== undefined" :label="$t('formGenerator.fileFieldName')">
            <el-input v-model.trim="activeData.name" :placeholder="$t('formGenerator.pleaseEnterFileField')" />
          </el-form-item>
          <el-form-item v-if="activeData.accept === 'image'" :label="$t('formGenerator.fileType')">
            <span>{{ $t('formGenerator.image') }}</span>
          </el-form-item>
          <el-form-item v-if="activeData.accept !== undefined && activeData.accept !== 'image'" :label="$t('formGenerator.fileType')">
            <el-select v-model="activeData.accept" :placeholder="$t('formGenerator.pleaseSelectFileType')" :style="{ width: '100%' }" clearable>
              <el-option :label="$t('formGenerator.video')" value="video/*" />
              <el-option :label="$t('formGenerator.audio')" value="audio/*" />
              <el-option label="excel" value=".xls,.xlsx" />
              <el-option label="word" value=".doc,.docx" />
              <el-option label="pdf" value=".pdf" />
              <el-option label="txt" value=".txt" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeData.__config__.fileSize !== undefined" :label="$t('formGenerator.fileSize')">
            <el-input v-model.number="activeData.__config__.fileSize" :placeholder="$t('formGenerator.pleaseEnterFileSize')">
              <el-select slot="append" v-model="activeData.__config__.sizeUnit" :style="{ width: '66px' }">
                <el-option label="KB" value="KB" />
                <el-option label="MB" value="MB" />
                <el-option label="GB" value="GB" />
              </el-select>
            </el-input>
          </el-form-item>
          <el-form-item v-if="activeData.action !== undefined" :label="$t('formGenerator.uploadUrl')">
            <el-input v-model.trim="activeData.action" :placeholder="$t('formGenerator.pleaseEnterUploadUrl')" clearable />
          </el-form-item>
          <el-form-item v-if="activeData['list-type'] !== undefined" :label="$t('formGenerator.listType')">
            <el-radio-group v-model="activeData['list-type']" size="small">
              <el-radio-button label="text"> text </el-radio-button>
              <el-radio-button label="picture"> picture </el-radio-button>
              <el-radio-button label="picture-card"> picture-card </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="activeData.type !== undefined && activeData.__config__.tag === 'el-button'"
            :label="$t('formGenerator.buttonType')"
          >
            <el-select v-model="activeData.type" :style="{ width: '100%' }">
              <el-option label="primary" value="primary" />
              <el-option label="success" value="success" />
              <el-option label="warning" value="warning" />
              <el-option label="danger" value="danger" />
              <el-option label="info" value="info" />
              <el-option label="text" value="text" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="activeData.__config__.buttonText !== undefined"
            v-show="'picture-card' !== activeData['list-type']"
            :label="$t('formGenerator.buttonText')"
          >
            <el-input :value="fgT(activeData.__config__.buttonText)" :placeholder="$t('formGenerator.pleaseEnterButtonText')" @input="onButtonTextInput" />
          </el-form-item>
          <el-form-item v-if="activeData['range-separator'] !== undefined" :label="$t('formGenerator.separator')">
            <el-input :value="fgT(activeData['range-separator'])" :placeholder="$t('formGenerator.pleaseEnterSep')" @input="onRangeSeparatorInput" />
          </el-form-item>
          <el-form-item v-if="activeData['picker-options'] !== undefined" :label="$t('formGenerator.timeRange')">
            <el-input v-model.trim="activeData['picker-options'].selectableRange" :placeholder="$t('formGenerator.pleaseEnterTimeRange')" />
          </el-form-item>
          <el-form-item v-if="activeData.format !== undefined" :label="$t('formGenerator.timeFormat')">
            <el-input :value="activeData.format" :placeholder="$t('formGenerator.pleaseEnterTimeFormat')" @input="setTimeValue($event)" />
          </el-form-item>
          <template v-if="['el-checkbox-group', 'el-radio-group', 'el-select'].indexOf(activeData.__config__.tag) > -1">
            <el-divider>{{ $t('formGenerator.options') }}</el-divider>
            <draggable :list="activeData.__slot__.options" :animation="340" group="selectItem" handle=".option-drag">
              <div v-for="(item, index) in activeData.__slot__.options" :key="index" class="select-item">
                <div class="select-line-icon option-drag">
                  <i class="el-icon-s-operation" />
                </div>
                <el-input :value="fgT(item.label)" :placeholder="$t('formGenerator.optionName')" size="small" @input="onOptionLabelInput(item, $event)" />
                <el-input :placeholder="$t('formGenerator.optionValue')" size="small" :value="item.value" @input="setOptionValue(item, $event)" />
                <div class="close-btn select-line-icon" @click="activeData.__slot__.options.splice(index, 1)">
                  <i class="el-icon-remove-outline" />
                </div>
              </div>
            </draggable>
            <div style="margin-left: 20px">
              <el-button
                style="padding-bottom: 0"
                icon="el-icon-circle-plus-outline"
                type="text"
                @click="addSelectItem"
              >
                {{ $t('formGenerator.addOption') }}
              </el-button>
            </div>
            <el-divider />
          </template>

          <template v-if="['el-cascader'].indexOf(activeData.__config__.tag) > -1">
            <el-divider>{{ $t('formGenerator.options') }}</el-divider>
            <el-form-item :label="$t('formGenerator.dataType')">
              <el-radio-group v-model="activeData.__config__.dataType" size="small">
                <el-radio-button label="dynamic"> {{ $t('formGenerator.dynamicData') }} </el-radio-button>
                <el-radio-button label="static"> {{ $t('formGenerator.staticData') }} </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <template v-if="activeData.__config__.dataType === 'dynamic'">
              <el-form-item :label="$t('formGenerator.labelKey')">
                <el-input v-model.trim="activeData.props.props.label" :placeholder="$t('formGenerator.pleaseEnterLabelKey')" />
              </el-form-item>
              <el-form-item :label="$t('formGenerator.valueKey')">
                <el-input v-model.trim="activeData.props.props.value" :placeholder="$t('formGenerator.pleaseEnterValueKey')" />
              </el-form-item>
              <el-form-item :label="$t('formGenerator.childrenKey')">
                <el-input v-model.trim="activeData.props.props.children" :placeholder="$t('formGenerator.pleaseEnterChildrenKey')" />
              </el-form-item>
            </template>

            <!-- 级联选择静态树 -->
            <el-tree
              v-if="activeData.__config__.dataType === 'static'"
              draggable
              :data="activeData.options"
              node-key="id"
              :expand-on-click-node="false"
              :render-content="renderContent"
            />
            <div v-if="activeData.__config__.dataType === 'static'" style="margin-left: 20px">
              <el-button style="padding-bottom: 0" icon="el-icon-circle-plus-outline" type="text" @click="addTreeItem">
                {{ $t('formGenerator.addParent') }}
              </el-button>
            </div>
            <el-divider />
          </template>

          <el-form-item v-if="activeData.__config__.optionType !== undefined" :label="$t('formGenerator.optionStyle')">
            <el-radio-group v-model="activeData.__config__.optionType">
              <el-radio-button label="default"> {{ $t('formGenerator.default') }} </el-radio-button>
              <el-radio-button label="button"> {{ $t('formGenerator.button') }} </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="activeData['active-color'] !== undefined" :label="$t('formGenerator.activeColor')">
            <el-color-picker v-model="activeData['active-color']" />
          </el-form-item>
          <el-form-item v-if="activeData['inactive-color'] !== undefined" :label="$t('formGenerator.inactiveColor')">
            <el-color-picker v-model="activeData['inactive-color']" />
          </el-form-item>
          <!-- <el-form-item v-if="activeData.__config__.bindInput !== undefined" label="绑定输入">
            <el-switch v-model="activeData.__config__.bindInput" />
          </el-form-item>
           <el-form-item v-if="activeData.__config__.bindInput" label="绑定内容">
            <el-input v-model="activeData.__config__.bindValve" placeholder="请输入内容" />
          </el-form-item> -->
          <template v-if="activeData.__config__.layoutTree">
            <el-divider>{{ $t('formGenerator.layoutTree') }}</el-divider>
            <el-tree
              :data="[activeData.__config__]"
              :props="layoutTreeProps"
              node-key="renderKey"
              default-expand-all
              draggable
            >
              <span slot-scope="{ node, data }">
                <span class="node-label">
                  <svg-icon class="node-icon" :icon-class="data.__config__ ? data.__config__.tagIcon : data.tagIcon" />
                  {{ node.label }}
                </span>
              </span>
            </el-tree>
          </template>

          <template v-if="activeData.__config__.layout === 'colFormItem'">
            <el-divider>{{ $t('formGenerator.regex') }}</el-divider>
            <div v-for="(item, index) in activeData.__config__.regList" :key="index" class="reg-item">
              <span class="close-btn" @click="activeData.__config__.regList.splice(index, 1)">
                <i class="el-icon-close" />
              </span>
              <el-form-item :label="$t('formGenerator.expression')">
                <el-input v-model="item.pattern" :placeholder="$t('formGenerator.pleaseEnterRegex')" />
              </el-form-item>
              <el-form-item :label="$t('formGenerator.errorTip')" style="margin-bottom: 0">
                <el-input v-model="item.message" :placeholder="$t('formGenerator.pleaseEnterErrorTip')" />
              </el-form-item>
            </div>
            <div style="margin-left: 20px">
              <el-button icon="el-icon-circle-plus-outline" type="text" @click="addReg"> {{ $t('formGenerator.addRule') }} </el-button>
            </div>
          </template>
        </el-form>
        <!-- 表单属性 -->
        <el-form v-show="currentTab === 'form'" size="small" label-width="90px">
          <el-form-item :label="$t('formGenerator.formName')">
            <el-input v-model="formConf.formRef" :placeholder="$t('formGenerator.pleaseEnterFormRef')" />
          </el-form-item>
          <el-form-item :label="$t('formGenerator.formModel')">
            <el-input v-model="formConf.formModel" :placeholder="$t('formGenerator.pleaseEnterFormModel')" />
          </el-form-item>
          <el-form-item :label="$t('formGenerator.formRules')">
            <el-input v-model="formConf.formRules" :placeholder="$t('formGenerator.pleaseEnterFormRules')" />
          </el-form-item>
          <el-form-item :label="$t('formGenerator.formSize')">
            <el-radio-group v-model="formConf.size">
              <el-radio-button label="medium"> {{ $t('formGenerator.sizeMedium') }} </el-radio-button>
              <el-radio-button label="small"> {{ $t('formGenerator.sizeSmall') }} </el-radio-button>
              <el-radio-button label="mini"> {{ $t('formGenerator.sizeMini') }} </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('formGenerator.labelAlign')">
            <el-radio-group v-model="formConf.labelPosition">
              <el-radio-button label="left"> {{ $t('formGenerator.alignLeft') }} </el-radio-button>
              <el-radio-button label="right"> {{ $t('formGenerator.alignRight') }} </el-radio-button>
              <el-radio-button label="top"> {{ $t('formGenerator.alignTop') }} </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('formGenerator.labelWidth')">
            <el-input v-model.number="formConf.labelWidth" type="number" :placeholder="$t('formGenerator.pleaseEnterLabelWidth')" />
          </el-form-item>
          <el-form-item :label="$t('formGenerator.gutter')">
            <el-input-number v-model="formConf.gutter" :min="0" :placeholder="$t('formGenerator.gutter')" />
          </el-form-item>
          <el-form-item :label="$t('formGenerator.disableForm')">
            <el-switch v-model="formConf.disabled" />
          </el-form-item>
          <el-form-item :label="$t('formGenerator.formButtons')">
            <el-switch v-model="formConf.formBtns" />
          </el-form-item>
          <el-form-item :label="$t('formGenerator.unfocusedBorder')">
            <el-switch v-model="formConf.unFocusedComponentBorder" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </div>

    <treeNode-dialog :visible.sync="dialogVisible" title="添加选项" @commit="addNode" />
    <icons-dialog :visible.sync="iconsVisible" :current="activeData[currentIconModel]" @select="setIcon" />
  </div>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import { isArray } from 'util';
import TreeNodeDialog from './TreeNodeDialog';
import { isNumberStr } from '../utils/index';
import IconsDialog from './IconsDialog';
import {
  inputComponents,
  selectComponents,
  layoutComponents,
} from '@/components/FormGenerator/components/generator/config';
import { saveFormConf } from '../utils/db';
import formGeneratorI18n from '../utils/formGeneratorI18n';
import { toSourceZh } from '@/utils/i18nText';
import Templates from '../../../views/application/wxAccount/wxTemplate/index';

const dateTimeFormat = {
  date: 'yyyy-MM-dd',
  week: 'yyyy 第 WW 周',
  month: 'yyyy-MM',
  year: 'yyyy',
  datetime: 'yyyy-MM-dd HH:mm:ss',
  daterange: 'yyyy-MM-dd',
  monthrange: 'yyyy-MM',
  datetimerange: 'yyyy-MM-dd HH:mm:ss',
};

export default {
  mixins: [formGeneratorI18n],
  components: {
    Templates,
    TreeNodeDialog,
    IconsDialog,
  },
  props: ['showField', 'activeData', 'formConf'],
  data() {
    return {
      currentTab: 'field',
      currentNode: null,
      dialogVisible: false,
      iconsVisible: false,
      currentIconModel: null,
      colorFormatOptions: [
        {
          label: 'hex',
          value: 'hex',
        },
        {
          label: 'rgb',
          value: 'rgb',
        },
        {
          label: 'rgba',
          value: 'rgba',
        },
        {
          label: 'hsv',
          value: 'hsv',
        },
        {
          label: 'hsl',
          value: 'hsl',
        },
      ],
      justifyOptions: [
        {
          label: 'start',
          value: 'start',
        },
        {
          label: 'end',
          value: 'end',
        },
        {
          label: 'center',
          value: 'center',
        },
        {
          label: 'space-around',
          value: 'space-around',
        },
        {
          label: 'space-between',
          value: 'space-between',
        },
      ],
      layoutTreeProps: {
        label(data, node) {
          const config = data.__config__;
          return data.componentName || `${config.label}: ${data.__vModel__}`;
        },
      },
    };
  },
  computed: {
      dateTypeOptions() {
        return [
          { label: this.$t('formGenerator.dateTypeDate'), value: 'date' },
          { label: this.$t('formGenerator.dateTypeWeek'), value: 'week' },
          { label: this.$t('formGenerator.dateTypeMonth'), value: 'month' },
          { label: this.$t('formGenerator.dateTypeYear'), value: 'year' },
          { label: this.$t('formGenerator.dateTypeDatetime'), value: 'datetime' },
        ];
      },
      dateRangeTypeOptions() {
        return [
          { label: this.$t('formGenerator.dateTypeDaterange'), value: 'daterange' },
          { label: this.$t('formGenerator.dateTypeMonthrange'), value: 'monthrange' },
          { label: this.$t('formGenerator.dateTypeDatetimerange'), value: 'datetimerange' },
        ];
      },
      // documentLink() {
    //   return (
    //     this.activeData.__config__.document
    //     || 'https://element.eleme.cn/#/zh-CN/component/installation'
    //   )
    // },
    dateOptions() {
      if (this.activeData.type !== undefined && this.activeData.__config__.tag === 'el-date-picker') {
        if (this.activeData['start-placeholder'] === undefined) {
          return this.dateTypeOptions;
        }
        return this.dateRangeTypeOptions;
      }
      return [];
    },
    tagList() {
      return [
        {
          label: '输入型组件',
          options: inputComponents,
        },
        {
          label: '选择型组件',
          options: selectComponents,
        },
      ];
    },
    activeTag() {
      return this.activeData.__config__.tag;
    },
    isShowMin() {
      return ['el-input-number', 'el-slider'].indexOf(this.activeTag) > -1;
    },
    isShowMax() {
      return ['el-input-number', 'el-slider', 'el-rate'].indexOf(this.activeTag) > -1;
    },
    isShowStep() {
      return ['el-input-number', 'el-slider'].indexOf(this.activeTag) > -1;
    },
  },
  watch: {
    formConf: {
      handler(val) {
        saveFormConf(val);
      },
      deep: true,
    },
  },
  mounted() {
    saveFormConf(this.formConf);
  },
  methods: {
    addReg() {
      this.activeData.__config__.regList.push({
        pattern: '',
        message: '',
      });
    },
    onLabelInput(val) {
      if (!this.activeData || !this.activeData.__config__) return;
      const current = this.activeData.__config__.label;
      if (this.fgT(current) === val) return;
      this.activeData.__config__.label = toSourceZh(val);
    },
    onPlaceholderInput(val) {
      if (!this.activeData) return;
      const current = this.activeData.placeholder;
      if (this.fgT(current) === val) return;
      this.activeData.placeholder = toSourceZh(val);
    },
    onStartPlaceholderInput(val) {
      if (!this.activeData) return;
      const current = this.activeData['start-placeholder'];
      if (this.fgT(current) === val) return;
      this.activeData['start-placeholder'] = toSourceZh(val);
    },
    onEndPlaceholderInput(val) {
      if (!this.activeData) return;
      const current = this.activeData['end-placeholder'];
      if (this.fgT(current) === val) return;
      this.activeData['end-placeholder'] = toSourceZh(val);
    },
    onButtonTextInput(val) {
      if (!this.activeData || !this.activeData.__config__) return;
      const current = this.activeData.__config__.buttonText;
      if (this.fgT(current) === val) return;
      this.activeData.__config__.buttonText = toSourceZh(val);
    },
    onRangeSeparatorInput(val) {
      if (!this.activeData) return;
      const current = this.activeData['range-separator'];
      if (this.fgT(current) === val) return;
      this.activeData['range-separator'] = toSourceZh(val);
    },
    onOptionLabelInput(item, val) {
      if (!item) return;
      if (this.fgT(item.label) === val) return;
      item.label = toSourceZh(val);
    },
    addSelectItem() {
      this.activeData.__slot__.options.push({
        label: '',
        value: '',
      });
    },
    addTreeItem() {
      ++this.idGlobal;
      this.dialogVisible = true;
      this.currentNode = this.activeData.options;
    },
    renderContent(h, { node, data, store }) {
      return (
        <div class="custom-tree-node">
          <span>{this.fgT(node.label)}</span>
          <span class="node-operation">
            <i on-click={() => this.append(data)} class="el-icon-plus" title={this.$t('formGenerator.add')}></i>
            <i on-click={() => this.remove(node, data)} class="el-icon-delete" title={this.$t('common.delete')}></i>
          </span>
        </div>
      );
    },
    append(data) {
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      this.dialogVisible = true;
      this.currentNode = data.children;
    },
    remove(node, data) {
      this.activeData.__config__.defaultValue = []; // 避免删除时报错
      const { parent } = node;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d) => d.id === data.id);
      children.splice(index, 1);
    },
    addNode(data) {
      this.currentNode.push(data);
    },
    setOptionValue(item, val) {
      item.value = isNumberStr(val) ? +val : val;
    },
    setDefaultValue(val) {
      if (Array.isArray(val)) {
        return val.join(',');
      }
      // if (['string', 'number'].indexOf(typeof val) > -1) {
      //   return val
      // }
      if (typeof val === 'boolean') {
        return `${val}`;
      }
      return val;
    },
    onDefaultValueInput(str) {
      if (isArray(this.activeData.__config__.defaultValue)) {
        // 数组
        this.$set(
          this.activeData.__config__,
          'defaultValue',
          str.split(',').map((val) => (isNumberStr(val) ? +val : val)),
        );
      } else if (['true', 'false'].indexOf(str) > -1) {
        // 布尔
        this.$set(this.activeData.__config__, 'defaultValue', JSON.parse(str));
      } else {
        // 字符串和数字
        this.$set(this.activeData.__config__, 'defaultValue', isNumberStr(str) ? +str : str);
      }
    },
    onSwitchValueInput(val, name) {
      if (['true', 'false'].indexOf(val) > -1) {
        this.$set(this.activeData, name, JSON.parse(val));
      } else {
        this.$set(this.activeData, name, isNumberStr(val) ? +val : val);
      }
    },
    setTimeValue(val, type) {
      const valueFormat = type === 'week' ? dateTimeFormat.date : val;
      this.$set(this.activeData.__config__, 'defaultValue', null);
      this.$set(this.activeData, 'value-format', valueFormat);
      this.$set(this.activeData, 'format', val);
    },
    spanChange(val) {
      this.formConf.span = val;
    },
    multipleChange(val) {
      this.$set(this.activeData.__config__, 'defaultValue', val ? [] : '');
    },
    dateTypeChange(val) {
      this.setTimeValue(dateTimeFormat[val], val);
    },
    rangeChange(val) {
      this.$set(
        this.activeData.__config__,
        'defaultValue',
        val ? [this.activeData.min, this.activeData.max] : this.activeData.min,
      );
    },
    rateTextChange(val) {
      if (val) this.activeData['show-score'] = false;
    },
    rateScoreChange(val) {
      if (val) this.activeData['show-text'] = false;
    },
    colorFormatChange(val) {
      this.activeData.__config__.defaultValue = null;
      this.activeData['show-alpha'] = val.indexOf('a') > -1;
      this.activeData.__config__.renderKey = +new Date(); // 更新renderKey,重新渲染该组件
    },
    openIconsDialog(model) {
      this.iconsVisible = true;
      this.currentIconModel = model;
    },
    setIcon(val) {
      this.activeData[this.currentIconModel] = val;
    },
    tagChange(tagIcon) {
      let target = inputComponents.find((item) => item.__config__.tagIcon === tagIcon);
      if (!target) target = selectComponents.find((item) => item.__config__.tagIcon === tagIcon);
      this.$emit('tag-change', target);
    },
    changeRenderKey() {
      this.activeData.__config__.renderKey = +new Date();
    },
  },
};
</script>

<style lang="scss" scoped>
.center-tabs {
  padding-left: 10px;
  box-sizing: border-box;
}
.right-board {
  width: 350px;
  position: absolute;
  right: 0;
  top: 0;
  padding-top: 3px;
  .field-box {
    position: relative;
    height: calc(100vh - 42px);
    box-sizing: border-box;
    overflow: hidden;
  }
  .el-scrollbar {
    height: 100%;
  }
}
.select-item {
  display: flex;
  border: 1px dashed #fff;
  box-sizing: border-box;
  & .close-btn {
    cursor: pointer;
    color: #f56c6c;
  }
  & .el-input + .el-input {
    margin-left: 4px;
  }
}
.select-item + .select-item {
  margin-top: 4px;
}
.select-item.sortable-chosen {
  border: 1px dashed #409eff;
}
.select-line-icon {
  line-height: 32px;
  font-size: 22px;
  padding: 0 4px;
  color: #777;
}
.option-drag {
  cursor: move;
}
.time-range {
  .el-date-editor {
    width: 227px;
  }
  ::v-deep .el-icon-time {
    display: none;
  }
}
.document-link {
  position: absolute;
  display: block;
  width: 26px;
  height: 26px;
  top: 0;
  left: 0;
  cursor: pointer;
  background: #409eff;
  z-index: 1;
  border-radius: 0 0 6px 0;
  text-align: center;
  line-height: 26px;
  color: #fff;
  font-size: 18px;
}
.node-label {
  font-size: 14px;
}
.node-icon {
  color: #bebfc3;
}
</style>
