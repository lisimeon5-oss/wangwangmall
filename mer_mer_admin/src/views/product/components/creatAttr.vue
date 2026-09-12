<template>
  <div>
    <el-row :gutter="24">
      <el-col :span="24">
        <el-form-item :label="$t('product.commissionSetting')" props="isSub">
          <el-radio-group v-model="formValidate.isSub" :disabled="isDisabled" @change="changeAttrVal">
            <el-radio :label="true" class="radio">{{ $t('product.separateSetting') }}</el-radio>
            <el-radio :label="false">{{ $t('product.defaultSetting') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('product.searchMemberProduct')" required>
          <el-radio-group v-model="formValidate.isPaidMember" :disabled="isDisabled" @change="changeAttrVal">
            <el-radio :label="true" class="radio">{{ $t('product.yes') }}</el-radio>
            <el-radio :label="false">{{ $t('product.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('product.specTypeLabel')" props="specType">
          <el-radio-group
            v-model="formValidate.specType"
            @change="onChangeSpec(formValidate.specType)"
            :disabled="isDisabled"
          >
            <el-radio :label="false" class="radio">{{ $t('product.singleSpec') }}</el-radio>
            <el-radio :label="true">{{ $t('product.multiSpec') }}</el-radio>
          </el-radio-group>
          <el-dropdown
            :disabled="isDisabled"
            v-if="formValidate.specType && ruleList.length"
            class="ml20 dropdown-menu-box"
            @command="confirm"
            trigger="hover"
          >
            <span class="el-dropdown-link"> {{ $t('product.selectSpecTemplate') }}<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item, index) in ruleList" :key="item.id || index" :command="item.id">{{
                displayRuleName(item)
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>
      </el-col>
      <!-- 多规格添加-->
      <el-col v-if="formValidate.specType && !isDisabled" :span="24" class="noForm">
        <el-form-item :label="$t('product.productSpecLabel')">
          <div class="lang-name-switch mb10" v-if="langOptions && langOptions.length">
            <el-radio-group :value="activeLang" size="mini" @input="onSpecLangChange">
              <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                {{ lang.label }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="specifications">
            <draggable
              group="specifications"
              :disabled="formValidate.attrs.length < 2"
              :list="formValidate.attrs"
              handle=".move-icon"
              @end="onMoveSpec"
              animation="300"
            >
              <div
                class="specifications-item active"
                v-for="(item, index) in formValidate.attrs"
                :key="index"
                @click="changeCurrentIndex(index)"
              >
                <div class="move-icon">
                  <span class="iconfont icon-drag2"></span>
                </div>
                <i class="del el-icon-error" @click="handleRemoveRole(index, item.value)"></i>
                <div class="specifications-item-box">
                  <div class="lineBox"></div>
                  <div class="specifications-item-name mb18">
                    <el-input
                      v-if="isDefaultSpecLang"
                      size="small"
                      v-model="item.value"
                      :placeholder="$t('product.specNameInput')"
                      @change="attrChangeValue(index, item.value)"
                      @focus="handleFocus(item.value)"
                      class="specifications-item-name-input"
                      maxlength="30"
                      show-word-limit
                    ></el-input>
                    <el-input
                      v-else
                      size="small"
                      :value="specNameLangValue(item)"
                      :placeholder="$t('product.pleaseEnterProductName')"
                      @input="(val) => onSpecNameLangInput(item, index, val)"
                      class="specifications-item-name-input"
                      maxlength="30"
                      show-word-limit
                    ></el-input>
                    <el-checkbox
                      class="ml20"
                      v-model="item.add_pic"
                      :disabled="!item.add_pic && !canSel"
                      :true-label="1"
                      :false-label="0"
                      @change="(e) => addPic(e, index)"
                      >{{ $t('product.addSpecImage') }}</el-checkbox
                    >
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="$t('product.specImageTip')"
                      placement="right"
                    >
                      <i class="el-icon-info"></i>
                    </el-tooltip>
                  </div>
                  <div class="rulesBox">
                    <draggable
                      class="item"
                      :list="item.detail"
                      :disabled="item.detail.length < 2"
                      handle=".drag"
                      @end="onMoveSpec"
                    >
                      <div v-for="(det, indexn) in item.detail" :key="indexn" class="mr10 spec drag">
                        <i class="el-icon-error" @click="handleRemove2(item.detail, indexn, det.value)"></i>
                        <el-input
                          v-if="isDefaultSpecLang"
                          style="width: 430px"
                          size="small"
                          v-model="det.value"
                          :placeholder="$t('product.specValue')"
                          @change="attrDetailChangeValue(det.value, index)"
                          @focus="handleFocus(det.value)"
                          maxlength="30"
                          show-word-limit
                          @blur="handleBlur()"
                        >
                          <template slot="prefix">
                            <span class="iconfont icon-drag2"></span>
                          </template>
                        </el-input>
                        <el-input
                          v-else
                          style="width: 430px"
                          size="small"
                          :value="specValueLangValue(det)"
                          :placeholder="$t('product.specValue')"
                          @input="(val) => onSpecValueLangInput(det, val, index)"
                          maxlength="30"
                          show-word-limit
                        >
                          <template slot="prefix">
                            <span class="iconfont icon-drag2"></span>
                          </template>
                        </el-input>
                        <div class="img-popover" v-if="item.add_pic">
                          <div class="popper-arrow"></div>
                          <div class="popper" @click="handleSelImg(det, indexn)">
                            <img class="img" v-if="det.image" :src="det.image" />
                            <i v-else class="el-icon-plus"></i>
                          </div>
                          <i v-if="det.image" class="img-del el-icon-error" @click="handleRemoveImg(det)"></i>
                        </div>
                      </div>
                      <el-popover
                        :ref="'popoverRef_' + index"
                        placement=""
                        width="420"
                        trigger="click"
                        @after-enter="handleShowPop(index)"
                      >
                        <el-input
                          :ref="'inputRef_' + index"
                          size="small"
                          :placeholder="$t('product.specValuePlaceholder')"
                          v-model="formDynamic.attrsVal"
                          @keyup.enter.native="createAttr(formDynamic.attrsVal, index)"
                          @blur="createAttr(formDynamic.attrsVal, index)"
                          maxlength="30"
                          show-word-limit
                        >
                        </el-input>
                        <div class="addfont" slot="reference">{{ $t('product.addSpecValue') }}</div>
                      </el-popover>
                    </draggable>
                  </div>
                </div>
              </div>
            </draggable>
          </div>
          <div class="flex">
            <el-button @click="handleAddRole">{{ $t('product.addNewSpec') }}</el-button>
            <el-button v-if="formValidate.attrs.length >= 1" type="text" @click="handleSaveAsTemplate()"
              >{{ $t('product.saveAsTemplate') }}</el-button
            >
          </div>
        </el-form-item>
      </el-col>
      <el-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
        <!-- 单规格表格-->
        <el-form-item v-if="formValidate.specType === false">
          <el-alert :title="$t('product.priceRange')" type="info"> </el-alert>
          <el-table :data="OneattrValue" border class="tabNumWidth" size="small">
            <el-table-column :label="$t('product.image')" width="60" align="center">
              <template slot-scope="scope">
                <div class="upLoadPicBox" @click="modalPicTap('1', 'dan', 'pi')">
                  <div v-if="scope.row.image" class="pictrue tabPic"><img :src="scope.row.image" /></div>
                  <div v-else class="upLoad tabPic">
                    <i class="el-icon-camera cameraIconfont" />
                  </div>
                </div>
              </template>
            </el-table-column>
            <template v-if="formValidate.isSub">
              <el-table-column :label="$t('product.firstCommission')" min-width="120" align="center">
                <template slot-scope="scope">
                  <el-input
                    maxlength="6"
                    :disabled="isDisabled"
                    v-model.trim="scope.row.brokerage"
                    min="0"
                    class="priceBox"
                    @keyup.native="keyupEventBrokerage('brokerage', scope.$index, 2)"
                  />
                </template>
              </el-table-column>
              <el-table-column :label="$t('product.secondCommission')" min-width="120" align="center">
                <template slot-scope="scope">
                  <el-input
                    maxlength="6"
                    :disabled="isDisabled"
                    v-model.trim="scope.row.brokerageTwo"
                    min="0"
                    class="priceBox"
                    @keyup.native="keyupEventBrokerage('brokerageTwo', scope.$index, 2)"
                  />
                </template>
              </el-table-column>
            </template>
            <el-table-column
              v-for="(item, iii) in tableAttrValue"
              :key="iii"
              :label="formThead[iii].title"
              min-width="160"
              align="center"
            >
              <template slot-scope="scope">
                <el-input
                  v-if="iii === 'barCode' || iii === 'itemNumber'"
                  :disabled="isDisabled"
                  v-model="scope.row[iii]"
                  maxlength="40"
                  type="test"
                  class="priceBox"
                  :readonly="false"
                />
                <el-input-number
                  v-else
                  v-model.trim="scope.row[iii]"
                  :disabled="isDisabled || (iii === 'stock' && formValidate.type == 6 ? true : false)"
                  :min="iii === 'stock' || iii === 'weight' || iii === 'volume' ? 0 : 0.01"
                  :max="formValidate.isPaidMember && iii === 'vipPrice' ? Number(scope.row.price) - 0.01 : 999999.99"
                  :step="iii === 'stock' ? 1 : 0.01"
                  controls-position="right"
                  step-strictly
                ></el-input-number>
              </template>
            </el-table-column>
            <template v-if="formValidate.type == 5">
              <el-table-column :label="$t('product.cloudDiskSettings')" min-width="120" align="center">
                <template slot-scope="scope">
                  <el-button v-if="!scope.row.expand" size="small" @click="handleAddVirtually(0, 'OneattrValue', 1)"
                    >{{ $t('product.addLink') }}</el-button
                  >
                  <el-button
                    v-else
                    class="seeCatMy pointer"
                    type="text"
                    size="small"
                    @click="seeVirtually(OneattrValue[0], 'OneattrValue', 0, 1)"
                    >{{ $t('product.set') }}</el-button
                  >
                </template>
              </el-table-column>
            </template>
            <template v-if="formValidate.type == 6">
              <el-table-column :label="$t('product.cdkeySettings')" min-width="120" align="center">
                <template slot-scope="scope">
                  <el-button v-if="!scope.row.cdkeyId" size="small" @click="handleAddVirtually(0, 'OneattrValue', 2)"
                    >{{ $t('product.addCdkey') }}</el-button
                  >
                  <el-button
                    v-else
                    type="text"
                    class="seeCatMy pointer"
                    @click="seeVirtually(OneattrValue[0], 'OneattrValue', 0, 2)"
                    >{{ displayCdkeyLibraryName(scope.row) }}</el-button
                  >
                </template>
              </el-table-column>
            </template>
          </el-table>
        </el-form-item>
        <el-form-item :label="$t('product.allSku')" v-if="$route.params.id && showAll">
          <el-button type="default" @click="showAllSku()" :disabled="isDisabled">{{ $t('product.display') }}</el-button>
        </el-form-item>
        <!-- 多规格表格-->
        <el-form-item
          v-if="formValidate.attrs.length > 0 && formValidate.specType"
          :label="$t('product.productAttrLabel')"
          class="labeltop"
          :class="isDisabled ? 'disLabel' : 'disLabelmoren'"
        >
          <el-alert :title="$t('product.priceRange')" type="info"> </el-alert>
          <el-table
            :data="ManyAttrValue"
            border
            class="tabNumWidth"
            size="small"
            :span-method="objectSpanMethod"
            :cell-class-name="tableCellClassName"
            :key="tableKey"
          >
            <el-table-column
              v-for="(item, index) in formValidate.header"
              :key="index"
              :label="item.title"
              :min-width="item.minWidth || '100'"
            >
              <template slot-scope="scope">
                <!-- 批量设置 -->
                <template v-if="scope.$index == 0">
                  <template v-if="item.key">
                    <div
                      v-if="formValidate.attrs.length && formValidate.attrs[scope.column.index] && ManyAttrValue.length"
                    >
                      <el-select v-model="oneFormBatch[0][item.title]" :placeholder="$t('product.pleaseSelect') + item.title" clearable>
                        <el-option
                          v-for="val in formValidate.attrs[scope.column.index].detail"
                          :key="val.value"
                          :label="displaySpecOption(formValidate.attrs[scope.column.index], val.value)"
                          :value="val.value"
                        >
                        </el-option>
                      </el-select>
                    </div>
                  </template>
                  <template v-else-if="item.slot === 'image'">
                    <div class="upLoadPicBox specPictrue" @click="modalPicTap('1', 'pi', scope.$index)">
                      <div class="upLoad tabPic" v-if="oneFormBatch[0].image">
                        <img v-lazy="oneFormBatch[0].image" />
                      </div>
                      <div class="upLoad tabPic" v-else>
                        <i class="el-icon-camera cameraIconfont"></i>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="item.slot === 'brokerage' && formValidate.isSub">
                    <el-input v-model="oneFormBatch[0].brokerage"></el-input>
                  </template>
                  <template v-else-if="item.slot === 'brokerageTwo' && formValidate.isSub">
                    <el-input v-model="oneFormBatch[0].brokerageTwo"></el-input>
                  </template>
                  <template v-else-if="item.slot === 'price'">
                    <el-input-number
                      :controls="false"
                      v-model="oneFormBatch[0].price"
                      :min="0.01"
                      :max="999999.99"
                      :step="0.01"
                      controls-position="right"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'vipPrice' && formValidate.isPaidMember">
                    <el-input-number
                      :controls="false"
                      v-model="oneFormBatch[0].vipPrice"
                      :min="0.01"
                      :max="999999.99"
                      :step="0.01"
                      controls-position="right"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'cost'">
                    <el-input-number
                      :controls="false"
                      v-model="oneFormBatch[0].cost"
                      :min="0.01"
                      :max="999999.99"
                      :step="0.01"
                      controls-position="right"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'otPrice'">
                    <el-input-number
                      :controls="false"
                      v-model="oneFormBatch[0].otPrice"
                      :min="0.01"
                      :max="999999.99"
                      :step="0.01"
                      controls-position="right"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'stock'">
                    <el-input-number
                      :controls="false"
                      v-model="oneFormBatch[0].stock"
                      :disabled="formValidate.type === OrderSecondTypeEnum.CardPassword ? true : false"
                      :min="0"
                      :step="1"
                      controls-position="right"
                      :max="999999"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'fictitious'"> -- </template>
                  <template v-else-if="item.slot === 'barCode'">
                    <el-input v-model="oneFormBatch[0].barCode" maxlength="40" class="priceBox"></el-input>
                  </template>
                  <template v-else-if="item.slot === 'itemNumber' && formValidate.type === OrderSecondTypeEnum.Normal">
                    <el-input v-model="oneFormBatch[0].itemNumber" maxlength="40" class="priceBox"></el-input>
                  </template>
                  <template v-else-if="item.slot === 'weight'">
                    <el-input-number
                      :controls="false"
                      v-model="oneFormBatch[0].weight"
                      :step="0.1"
                      :min="0"
                      :max="999999"
                      controls-position="right"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'volume'">
                    <el-input-number
                      :controls="false"
                      v-model="oneFormBatch[0].volume"
                      :step="0.1"
                      :min="0"
                      :max="999999"
                      controls-position="right"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'isDefault'"> -- </template>
                  <template v-else-if="item.slot === 'action'">
                    <a type="text" size="mini" @click="batchAdd">{{ $t('product.batchModify') }}</a>
                    <a type="text" size="mini" @click="batchDel">{{ $t('product.clear') }}</a>
                  </template>
                </template>
                <template v-else>
                  <template v-if="item.key">
                    <div class="text-center">
                      <span>{{ displaySpecOptionByKey(item.key, scope.row.attrValueShow[item.key]) }}</span>
                    </div>
                  </template>
                  <template v-if="item.slot === 'image'">
                    <div class="upLoadPicBox specPictrue" @click="modalPicTap('1', 'duo', scope.$index)">
                      <div class="upLoad tabPic" v-if="scope.row.image">
                        <img :src="scope.row.image" />
                      </div>
                      <div class="upLoad tabPic" v-else>
                        <i class="el-icon-camera cameraIconfont" style="font-size: 24px"></i>
                      </div>
                    </div>
                  </template>
                  <template v-if="item.slot === 'price'">
                    <el-input-number
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].price"
                      :min="0.01"
                      :max="999999.99"
                      class="priceBox"
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'vipPrice' && formValidate.isPaidMember">
                    <el-input-number
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].vipPrice"
                      :min="0.01"
                      :max="999999.99"
                      class="priceBox"
                      clearable
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'cost'">
                    <el-input-number
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].cost"
                      :min="0.01"
                      :max="999999.99"
                      class="priceBox"
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'otPrice'">
                    <el-input-number
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].otPrice"
                      :min="0.01"
                      :max="999999.99"
                      class="priceBox"
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'stock'">
                    <el-input-number
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].stock"
                      :disabled="formValidate.type === OrderSecondTypeEnum.CardPassword ? true : false"
                      :min="0"
                      :max="999999"
                      :precision="0"
                      class="priceBox"
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'barCode'">
                    <el-input v-model="ManyAttrValue[scope.$index].barCode" maxlength="40" class="priceBox"></el-input>
                  </template>
                  <template v-else-if="item.slot === 'itemNumber' && formValidate.type === OrderSecondTypeEnum.Normal">
                    <el-input
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].itemNumber"
                      maxlength="40"
                      class="priceBox"
                    ></el-input>
                  </template>
                  <template v-else-if="item.slot === 'brokerage' && formValidate.isSub">
                    <el-input v-model="ManyAttrValue[scope.$index].brokerage"></el-input>
                  </template>
                  <template v-else-if="item.slot === 'brokerageTwo' && formValidate.isSub">
                    <el-input v-model="ManyAttrValue[scope.$index].brokerageTwo"></el-input>
                  </template>
                  <template v-else-if="item.slot === 'weight'">
                    <el-input-number
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].weight"
                      :step="0.1"
                      :max="999999"
                      class="priceBox"
                    ></el-input-number>
                  </template>
                  <template v-else-if="item.slot === 'volume'">
                    <el-input-number
                      :controls="false"
                      v-model="ManyAttrValue[scope.$index].volume"
                      :step="0.1"
                      :min="0"
                      :max="999999"
                      class="priceBox"
                    ></el-input-number>
                  </template>
                  <template
                    v-else-if="item.slot === 'fictitious' && formValidate.type == OrderSecondTypeEnum.CloudDrive"
                  >
                    <div>
                      <el-button
                        v-if="!scope.row.expand"
                        size="small"
                        @click="handleAddVirtually(scope.$index, 'ManyAttrValue', 1)"
                        >{{ $t('product.addLink') }}</el-button
                      >
                      <el-button
                        v-else
                        class="seeCatMy pointer"
                        type="text"
                        size="small"
                        @click="seeVirtually(ManyAttrValue[scope.$index], 'ManyAttrValue', scope.$index, 1)"
                        >{{ $t('product.set') }}</el-button
                      >
                    </div>
                  </template>

                  <template
                    v-else-if="item.slot === 'fictitious' && formValidate.type == OrderSecondTypeEnum.CardPassword"
                    slot-scope="scope"
                  >
                    <div>
                      <el-button
                        v-if="!scope.row.cdkeyId"
                        size="small"
                        @click="handleAddVirtually(scope.$index, 'ManyAttrValue', 2)"
                        >{{ $t('product.addCdkey') }}</el-button
                      >
                      <el-button
                        v-else
                        type="text"
                        class="seeCatMy pointer"
                        @click="seeVirtually(ManyAttrValue[scope.$index], 'ManyAttrValue', scope.$index, 2)"
                        >{{ displayCdkeyLibraryName(scope.row) }}</el-button
                      >
                    </div>
                  </template>
                  <template v-else-if="item.slot === 'isDefault'">
                    <el-switch
                      v-model="ManyAttrValue[scope.$index].isDefault"
                      :active-value="true"
                      :inactive-value="false"
                      :active-text="$t('product.default')"
                      @change="(e) => changeDefaultSelect(e, scope.$index)"
                    />
                  </template>
                  <template v-else-if="item.slot === 'action'">
                    <el-switch
                      class="defineSwitch"
                      v-model="ManyAttrValue[scope.$index].isShow"
                      :active-text="$t('product.show')"
                      :inactive-text="$t('product.hide')"
                      :active-value="true"
                      :inactive-value="false"
                      @change="changeDefaultShow(scope.$index)"
                    />
                  </template>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-col>
    </el-row>
    <!-- 添加云盘-->
    <add-cloud-disk
      ref="cloudDiskRef"
      :cloudDisk="cloudDisk"
      @handlerSubSuccess="handlerSubSuccessCloudDisk"
      @closeCloudDisk="closeCloudDisk"
    ></add-cloud-disk>

    <!-- 选择卡密库-->
    <cdkey-library
      ref="cdkeyLibraryRef"
      :cdkeyLibraryInfo="cdkeyLibraryInfo"
      @handlerSubSuccess="handlerChangeCdkeyIdSubSuccess"
    ></cdkey-library>
  </div>
</template>

<script>
import addCdkey from '@/views/product/components/addCdkey.vue';
import addCloudDisk from '@/views/product/components/addCloudDisk.vue';
import vuedraggable from 'vuedraggable';
import { attrCreatApi, templateListApi } from '@/api/product';
import { arraysEqual } from '@/utils';
import { parseLangJsonMap, getLocalizedName, getUiLocale, buildI18nNameJson, localizeProductSpecName, localizeProductSpecValue, localizeSpecSku } from '@/utils/localizedName';
import product from '@/mixins/product';
import { defaultObj } from '../creatProduct/default';
import CdkeyLibrary from '@/views/product/components/cdkeyLibrary';
import {
  commissionTableHead,
  FictitiousTableHead,
  GoodsTableHead,
  imageTableHead,
  vipPriceTableHead,
  VirtualTableHead,
  VirtualTableHead2,
} from '../creatProduct/TableHeadList.js';
import { OrderSecondTypeEnum } from '@/enums/productEnums';
import i18n from '@/i18n';
export default {
  name: 'creatAttr',
  mixins: [product], //此js存放商品的部分函数方法
  components: {
    draggable: vuedraggable,
    addCdkey,
    addCloudDisk,
    CdkeyLibrary,
  },
  computed: {
    uiLocale() {
      return (this.$i18n && this.$i18n.locale) || getUiLocale(this);
    },
    tableAttrValue() {
      const obj = Object.assign({}, defaultObj.attrValueList[0]);
      delete obj.isShow;
      delete obj.image;
      delete obj.brokerage;
      delete obj.brokerageTwo;
      delete obj.cdkeyId;
      delete obj.expand;
      delete obj.cdkeyLibraryName;
      if (!this.formValidate.isPaidMember) {
        delete obj.vipPrice;
      } else {
        obj.vipPrice = Object.assign({}, defaultObj.attrValueList[0]).vipPrice;
      }
      if (this.formValidate.type === 2) {
        delete obj.itemNumber;
      }
      if (this.formValidate.type === 5) {
        delete obj.volume;
        delete obj.weight;
        delete obj.itemNumber;
      }
      if (this.formValidate.type === 6) {
        delete obj.volume;
        delete obj.weight;
        delete obj.itemNumber;
      }
      return obj;
    },
    isDefaultSpecLang() {
      return this.activeLang === this.defaultLangCode;
    },
    activeLangLabel() {
      const lang = (this.langOptions || []).find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
  },
  data() {
    return {
      OrderSecondTypeEnum: OrderSecondTypeEnum,
      carMytabIndex: 0,
      carMytabName: '',
      cdkeyId: null, //卡密库id
      cdkeyLibraryInfo: null, //卡密库对象
      cloudDisk: '', //云盘地址
      showAll: false,
      formValidate: this.value,
      ruleList: [],
      // // 规格数据
      formDynamic: {
        attrsName: '',
        attrsVal: '',
      },
      formDynamics: {
        ruleName: '',
        ruleValue: [],
      },
      tableFrom: {
        page: 1,
        limit: 9999,
        keywords: '',
      },
      columnsInstalM: [],
      changeAttrValue: '', //修改的规格值
      currentIndex: 0,
      canSel: true, // 规格图片添加判断
      tableKey: 0,
    };
  },
  props: {
    value: {
      type: Object,
      default: function () {
        return {};
      },
    },
    // 生成规格表格中的头部标题
    manyTabDate: {
      type: Object,
      default: function () {
        return {};
      },
    },
    //生成规格的表格中填写的值
    formThead: {
      type: Object,
      default: function () {
        return {};
      },
    },
    //生成表格的头部标题
    manyTabTit: {
      type: Object,
      default: function () {
        return {};
      },
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    // 单规格
    OneattrValue: {
      type: Array,
      default: function () {
        return [];
      },
    },
    // 多规格
    ManyAttrValue: {
      type: Array,
      default: function () {
        return [];
      },
    },
    //批量添加规格
    oneFormBatch: {
      type: Array,
      default: function () {
        return [];
      },
    },
    langOptions: {
      type: Array,
      default: function () {
        return [];
      },
    },
    defaultLangCode: {
      type: String,
      default: 'zh-cn',
    },
    activeLang: {
      type: String,
      default: 'zh-cn',
    },
  },
  watch: {
    formValidate: {
      handler(newVal) {
        this.$emit('input', newVal);
      },
      deep: true,
    },
    '$i18n.locale'() {
      this.refreshSpecHeader();
    },
    activeLang() {
      this.refreshSpecHeader();
    },
  },
  mounted() {
    if (this.formValidate.specType) this.productGetRule(); //加载商品规格选项
    if (
      this.formValidate.specType &&
      ((this.$route.params.id && this.$route.params.id != 0) || this.$route.params.isCopy === '1')
    ) {
      this.formValidate.attrs = this.formValidate.attrList.map((i) => {
        return {
          value: i.attributeName,
          valueJson: parseLangJsonMap(i.attributeNameJson),
          detail: i.optionList.map((val) => ({
            value: val.optionName,
            valueJson: parseLangJsonMap(val.optionNameJson),
            image: val.image,
          })),
          add_pic: i.isShowImage ? 1 : 0,
        };
      });
      this.createBnt = true;
      // 采集商品只有规格，没有规格列表，这里判断使用 方法，attrValueList.length为0，走生成规格方法
      if (this.formValidate.attrValueList.length) {
        this.generateHeader(this.formValidate.attrs);
      } else {
        this.generateAttr(this.formValidate.attrs);
      }
    }
  },
  methods: {
    displayCdkeyLibraryName(row) {
      return getLocalizedName({ name: row.cdkeyLibraryName, nameJson: row.cdkeyLibraryNameJson }, this.uiLocale);
    },
    displayRuleName(item) {
      return getLocalizedName({ name: item.ruleName, nameJson: item.ruleNameJson }, this.uiLocale) || item.ruleName;
    },
    specLang() {
      return this.activeLang || this.uiLocale;
    },
    refreshSpecHeader() {
      if (this.formValidate && this.formValidate.attrs && this.formValidate.attrs.length) {
        this.generateHeader(this.formValidate.attrs);
      }
    },
    displaySpecAttrTitle(attr) {
      return localizeProductSpecName(attr, this.specLang()) || (attr && attr.value) || '';
    },
    displaySpecOption(attr, optionValue) {
      const text = localizeProductSpecValue(attr, optionValue, this.specLang());
      return localizeSpecSku(text, this.$t.bind(this));
    },
    displaySpecOptionByKey(specKey, optionValue) {
      const attr = (this.formValidate.attrs || []).find((item) => item.value === specKey);
      return this.displaySpecOption(attr, optionValue);
    },
    handleShowPop(index) {
      this.$refs['inputRef_' + index][0].focus();
    },
    // 删除属性
    handleRemove2(item, index, val) {
      item.splice(index, 1);
      this.delAttrTable(val);
    },
    // 新增规格
    handleAddRole() {
      let data = {
        value: this.formDynamic.attrsName,
        valueJson: {},
        add_pic: 0,
        detail: [],
      };
      this.formValidate.attrs.push(data);
    },
    onSpecLangChange(lang) {
      this.$emit('update:activeLang', lang);
    },
    specNameLangValue(item) {
      if (!item.valueJson) this.$set(item, 'valueJson', {});
      return item.valueJson[this.activeLang] || '';
    },
    specValueLangValue(det) {
      if (!det.valueJson) this.$set(det, 'valueJson', {});
      return det.valueJson[this.activeLang] || '';
    },
    onSpecNameLangInput(item, index, val) {
      if (!item.valueJson) this.$set(item, 'valueJson', {});
      this.$set(item.valueJson, this.activeLang, val);
      if (!item.value && val) {
        item.value = val;
        this.attrChangeValue(index, item.value);
      }
    },
    onSpecValueLangInput(det, val, index) {
      if (!det.valueJson) this.$set(det, 'valueJson', {});
      this.$set(det.valueJson, this.activeLang, val);
      if (!det.value && val) {
        det.value = val;
        this.attrDetailChangeValue(det.value, index);
      }
    },
    // 规格名称改变
    attrChangeValue(i, val) {
      if (val.trim().length && this.formValidate.attrs[i].detail.length) {
        this.generateHeader(this.formValidate.attrs);
        if (this.ManyAttrValue.length) {
          this.ManyAttrValue.map((item, i) => {
            if (i > 0) {
              if (Object.keys(item.attrValueShow).includes(this.changeAttrValue)) {
                item.attrValueShow[val] = item.attrValueShow[this.changeAttrValue];
                item[val] = item[this.changeAttrValue];
                delete item.attrValueShow[this.changeAttrValue];
                delete item[this.changeAttrValue];
              }
            }
          });
          this.changeAttrValue = val;
        }
      } else {
        this.generateAttr(this.formValidate.attrs);
      }
    },
    // 规格值改变
    attrDetailChangeValue(val, i) {
      if (this.ManyAttrValue.length) {
        let key = this.formValidate.attrs[i].value;
        this.ManyAttrValue.map((item, i) => {
          if (i > 0) {
            if (Object.keys(item.attrValueShow).includes(key) && item.attrValueShow[key] === this.changeAttrValue) {
              item.attrValueShow[key] = val;
              let index = item.attr_arr.findIndex((item) => item === this.changeAttrValue);
              item.attr_arr[index] = val;
            }
          }
        });
        this.changeAttrValue = val;
      } else {
        this.generateAttr(this.formValidate.attrs, 1);
      }
      this.$nextTick(() => {
        this.$emit('changeManyAttrValue',[...this.ManyAttrValue])
      });
    },
    changeCurrentIndex(i) {
      this.currentIndex = i;
    },
    // 新增一条属性
    addOneAttr(val, val2) {
      this.generateAttr(this.formValidate.attrs, val2);
    },
    handleFocus(val) {
      this.changeAttrValue = val;
    },
    handleBlur() {
      this.changeAttrValue = '';
    },
    // 规格拖拽排序后
    onMoveSpec() {
      this.generateAttr(this.formValidate.attrs);
    },
    handleRemoveImg(item) {
      item.image = '';
    },
    // 合并单元格
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 && rowIndex > 0) {
        let lable = column.label;
        //这里判断第几列需要合并
        const tagFamily = this.ManyAttrValue[rowIndex].attrValueShow[lable];
        const index = this.ManyAttrValue.findIndex((item, index) => {
          if (index > 0) return item.attrValueShow[lable] == tagFamily;
        });
        if (rowIndex == index) {
          let len = 1;
          for (let i = index + 1; i < this.ManyAttrValue.length; i++) {
            if (this.ManyAttrValue[i].attrValueShow[lable] !== tagFamily) {
              break;
            }
            len++;
          }
          return {
            rowspan: len,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
    /*
     * 生成属性
     * @param {Array} data 规格数据
     * */
    generateAttr(data, val) {
      // 判断该段Js执行时间
      this.generateHeader(data);
      const combinations = this.generateCombinations(data);
      let rows = combinations.map((combination) => {
        const row = {
          attr_arr: combination,
          attrValueShow: {},
          image: '',
          price: 0.01,
          vipPrice: 0.01,
          cost: 0.01,
          otPrice: 0.01,
          barCode: '',
          itemNumber: '',
          stock: 0,
          weight: 0,
          volume: 0,
          brokerage: 0,
          brokerageTwo: 0,
          cdkeyId: null,
          cdkeyLibraryName: '',
          expand: '',
          isShow: true,
        };
        // 判断商品类型是卡密/优惠券
        let virtualType = this.formValidate.type;
        if (virtualType == this.OrderSecondTypeEnum.CardPassword) {
          //卡密
          this.$set(row, 'expand', '');
        } else if (virtualType == this.OrderSecondTypeEnum.CloudDrive) {
          //云盘
          this.$set(row, 'cdkey', {});
          this.$set(row, 'cdkeyId', '');
        }
        for (let i = 0; i < combination.length; i++) {
          const value = combination[i];
          this.$set(row, data[i].value, value);
          this.$set(row, 'title', data[i].value);
          this.$set(row, 'key', data[i].value);
          this.$set(row.attrValueShow, data[i].value, value);
          // 如果manyFormValidate中存在该属性值，则赋值
          for (let k = 0; k < this.ManyAttrValue.length; k++) {
            const manyItem = this.ManyAttrValue[k];
            // 对比两个数组是否完全相等
            if (k > 0 && manyItem.attr_arr && arraysEqual(manyItem.attr_arr, combination)) {
              Object.assign(row, {
                price: manyItem.price,
                cost: manyItem.cost,
                otPrice: manyItem.otPrice,
                stock: manyItem.stock,
                image: manyItem.image,
                sku: manyItem.sku || '',
                weight: manyItem.weight || '',
                isDefault: manyItem.isDefault || 0,
                volume: manyItem.volume || 0,
                barCode: manyItem.barCode || '',
                itemNumber: manyItem.itemNumber || '',
                brokerage: manyItem.brokerage,
                brokerageTwo: manyItem.brokerageTwo,
                vipPrice: manyItem.vipPrice,
              });
            } else if (k > 0 && manyItem.attr_arr.length && data[i].add_pic && combination.includes(val)) {
              // data[i].detail中的value是规格值 存在与 manyItem.attr_arr 中的某一项
              data[i].detail.map((e, ii) => {
                combination.includes(e.value) && this.$set(row, 'image', e.image);
              });
            }
          }
        }
        return row;
      });
      this.$nextTick(() => {
        // rows数组第一项 新增默认数据 oneFormBatch
        this.$emit('changeManyAttrValue', [...this.oneFormBatch, ...rows]);
      });
    },
    //分佣设置 会员商品操作
    changeAttrVal() {
      this.generateHeader(this.formValidate.attrs);
    },
    // 生成商品规格表头
    generateHeader(data) {
      let specificationsColumns = data.map((item) => ({
        title: this.displaySpecAttrTitle(item),
        key: item.value,
        minWidth: 140,
        fixed: 'left',
      }));
      let arr;
      //云盘商品
      if (this.formValidate.type == this.OrderSecondTypeEnum.CloudDrive) {
        // 开启分佣设置
        if (this.formValidate.isSub && this.formValidate.isPaidMember) {
          arr = [
            ...specificationsColumns,
            ...imageTableHead(),
            ...commissionTableHead(),
            ...vipPriceTableHead(),
            ...VirtualTableHead(),
          ];
        } else if (this.formValidate.isSub) {
          arr = [...specificationsColumns, ...imageTableHead(), ...commissionTableHead(), ...VirtualTableHead()];
        } else if (this.formValidate.isPaidMember) {
          //开启会员
          arr = [...specificationsColumns, ...imageTableHead(), ...vipPriceTableHead(), ...VirtualTableHead()];
        } else {
          arr = [...specificationsColumns, ...imageTableHead(), ...VirtualTableHead()];
        }
        // 找到slot 等于 fictitious 将title改为规格名称
        this.formValidate.header.map((item) => {
          if (item.slot === 'fictitious') {
            item.title = i18n.t('product.cloudDiskSettings');
          }
        });
      } else if (this.formValidate.type == this.OrderSecondTypeEnum.CardPassword) {
        //卡密商品
        // 开启分佣设置
        if (this.formValidate.isSub && this.formValidate.isPaidMember) {
          arr = [
            ...specificationsColumns,
            ...imageTableHead(),
            ...commissionTableHead(),
            ...vipPriceTableHead(),
            ...VirtualTableHead2(),
          ];
        } else if (this.formValidate.isSub) {
          arr = [...specificationsColumns, ...imageTableHead(), ...commissionTableHead(), ...VirtualTableHead2()];
        } else if (this.formValidate.isPaidMember) {
          //开启会员
          arr = [...specificationsColumns, ...imageTableHead(), ...vipPriceTableHead(), ...VirtualTableHead2()];
        } else {
          arr = [...specificationsColumns, ...imageTableHead(), ...VirtualTableHead2()];
        }
      } else if (this.formValidate.type == this.OrderSecondTypeEnum.Fictitious) {
        //虚拟商品
        // 开启分佣设置
        if (this.formValidate.isSub && this.formValidate.isPaidMember) {
          arr = [
            ...specificationsColumns,
            ...imageTableHead(),
            ...commissionTableHead(),
            ...vipPriceTableHead(),
            ...FictitiousTableHead(),
          ];
        } else if (this.formValidate.isSub) {
          arr = [...specificationsColumns, ...imageTableHead(), ...commissionTableHead(), ...FictitiousTableHead()];
        } else if (this.formValidate.isPaidMember) {
          //开启会员
          arr = [...specificationsColumns, ...imageTableHead(), ...vipPriceTableHead(), ...FictitiousTableHead()];
        } else {
          arr = [...specificationsColumns, ...imageTableHead(), ...FictitiousTableHead()];
        }
      } else {
        // 开启分佣设置
        if (this.formValidate.isSub && this.formValidate.isPaidMember) {
          arr = [
            ...specificationsColumns,
            ...imageTableHead(),
            ...commissionTableHead(),
            ...vipPriceTableHead(),
            ...GoodsTableHead(),
          ];
        } else if (this.formValidate.isSub) {
          arr = [...specificationsColumns, ...imageTableHead(), ...commissionTableHead(), ...GoodsTableHead()];
        } else if (this.formValidate.isPaidMember) {
          //开启会员
          arr = [...specificationsColumns, ...imageTableHead(), ...vipPriceTableHead(), ...GoodsTableHead()];
        } else {
          arr = [...specificationsColumns, ...imageTableHead(), ...GoodsTableHead()];
        }
      }
      this.$set(this.formValidate, 'header', arr);
      this.tableKey += 1;
      this.columnsInstalM = arr;
    },
    // 生成规格组合
    generateCombinations(arr, prefix = []) {
      if (arr.length === 0) {
        return [prefix];
      }
      const [first, ...rest] = arr;
      return first.detail.flatMap((detail) => this.generateCombinations(rest, [...prefix, detail.value]));
    },
    // 另存为模板
    handleSaveAsTemplate() {
      this.$prompt('', this.$t('product.templateName'), {
        confirmButtonText: this.$t('product.confirm'),
        cancelButtonText: this.$t('product.cancel'),
        inputValidator: (value) => {
          if (value === null) {
            return this.$t('product.inputRequired');
          }
          if (value.length > 30) return this.$t('product.inputLimit30');
        },
      })
        .then(({ value }) => {
          let spec = this.formValidate.attrs.map((item) => {
            return {
              value: item.value,
              valueJson: item.valueJson && typeof item.valueJson === 'object' ? { ...item.valueJson } : {},
              detail: item.detail.map((e) => e.value),
              detailJson: item.detail.map((e) =>
                e.valueJson && typeof e.valueJson === 'object' ? { ...e.valueJson } : {},
              ),
            };
          });
          const extra = {};
          if (this.activeLang && this.activeLang !== this.defaultLangCode) {
            extra[this.activeLang] = value;
          }
          const data = {
            id: 0,
            ruleName: value,
            ruleNameJson: buildI18nNameJson(this.langOptions, extra, this.defaultLangCode, value),
            ruleValue: JSON.stringify(spec),
          };
          attrCreatApi(data)
            .then((res) => {
              this.$message.success(this.$t('product.submitSuccess'));
              this.productGetRule();
              this.clear();
              this.loading = false;
              this.loadingBtn = false;
            })
            .catch(() => {
              this.loading = false;
              this.loadingBtn = false;
            });
        })
        .catch(() => {});
    },
    // 在规格中选择规格图片
    handleSelImg(item) {
      const _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          item.image = img[0].sattDir;
          _this.changeSpecImg([item.value], img[0].sattDir);
        },
        '1',
        'content',
      );
    },
    changeSpecImg(arr, img) {
      // 判断是否存在规格图
      let isHas = false;
      for (let i = 1; i < this.ManyAttrValue.length; i++) {
        let item = this.ManyAttrValue[i];
        if (item.image && this.isSubset(item.attr_arr, arr)) {
          isHas = true;
          break;
        }
      }
      if (isHas) {
        this.$confirm(this.$t('product.replaceSpecImageConfirm'), this.$t('product.tip'), {
          confirmButtonText: this.$t('product.replace'),
          cancelButtonText: this.$t('product.notNow'),
          type: 'warning',
        })
          .then(() => {
            for (let val of this.ManyAttrValue) {
              if (this.isSubset(val.attr_arr, arr)) {
                this.$set(val, 'image', img);
              }
            }
          })
          .catch(() => {});
      } else {
        for (let val of this.ManyAttrValue) {
          if (this.isSubset(val.attr_arr, arr)) {
            this.$set(val, 'image', img);
          }
        }
      }
    },
    // 规格图片添加开关
    addPic(e, i) {
      if (e) {
        this.formValidate.attrs.map((item, ii) => {
          if (ii !== i) {
            this.$set(item, 'add_pic', 0);
          }
        });
        this.canSel = false;
      } else {
        this.canSel = true;
      }
    },
    // 生成列表 行 列 数据
    tableCellClassName({ row, column, rowIndex, columnIndex }) {
      //注意这里是解构
      //利用单元格的 className 的回调方法，给行列索引赋值
      row.index = rowIndex || '';
      column.index = columnIndex;
    },
    //返佣输入
    keyupEventBrokerage(val, index, num) {
      switch (num) {
        case 1:
          this.oneFormBatch[index][val] =
            this.oneFormBatch[index][val] > 0 ? parseInt(this.oneFormBatch[index][val]) : 0;
          break;
        case 2:
          this.OneattrValue[index][val] =
            this.OneattrValue[index][val] > 0 ? parseInt(this.OneattrValue[index][val]) : 0;
          break;
        default:
          this.ManyAttrValue[index][val] =
            this.ManyAttrValue[index][val] > 0 ? parseInt(this.ManyAttrValue[index][val]) : 0;
      }
    },
    // 添加规则；
    addRule() {
      const _this = this;
      this.$modalAttr(this.formDynamics, function () {
        _this.productGetRule();
      });
    },
    // 选择规格
    onChangeSpec(num) {
      if (num) {
        this.productGetRule();
        if (this.$route.params.id != 0) this.formValidate.attrs = [];
      } else {
        this.formValidate.attrs = [];
        this.formValidate.attrList = [];
      }
    },
    // 选择属性确认
    confirm(ruleId) {
      this.createBnt = true;
      this.canSel = true;
      const selected = this.ruleList.find((item) => item.id === ruleId) || this.ruleList.find((item) => item.ruleName === ruleId);
      this.formValidate.selectRule = selected ? selected.ruleName : ruleId;
      if (!selected) {
        return this.$message.warning(this.$t('product.selectAttr'));
      }
      const dataAttrList = [];
      const dataAttrs = [];
      selected.ruleValue.forEach((i, idx) => {
        const valueJson = parseLangJsonMap(i.valueJson);
        dataAttrList.push({
          attributeName: i.value,
          attributeNameJson: valueJson,
          optionList: (i.detail || []).map((val, vi) => ({
            optionName: val,
            optionNameJson: parseLangJsonMap(i.detailJson && i.detailJson[vi]),
            image: '',
            sort: 0,
          })),
          id: 0,
          isShowImage: false,
          sort: idx + 1,
        });
        dataAttrs.push({
          value: i.value,
          valueJson,
          detail: (i.detail || []).map((val, vi) => ({
            value: val,
            valueJson: parseLangJsonMap(i.detailJson && i.detailJson[vi]),
            image: '',
          })),
          id: 0,
          add_pic: 0,
          sort: idx + 1,
        });
      });
      this.formValidate.attrList = dataAttrList;
      this.formValidate.attrs = dataAttrs;
      // this.attrs.map((item, ii) => {
      //   this.$set(item, 'isShowImage', false);
      // });
      // this.canSel = true;
      this.generateAttr(this.formValidate.attrs);
    },
    // 获取商品属性模板；
    productGetRule() {
      templateListApi(this.tableFrom).then((res) => {
        const list = res.list;
        for (var i = 0; i < list.length; i++) {
          list[i].ruleValue = JSON.parse(list[i].ruleValue);
        }
        this.ruleList = list;
      });
    },
    // 删除表格中的属性
    delAttrTable(val) {
      for (let i = 0; i < this.ManyAttrValue.length; i++) {
        let item = this.ManyAttrValue[i];
        if (item.attr_arr && item.attr_arr.includes(val)) {
          this.ManyAttrValue.splice(i, 1);
          i--;
        }
      }
    },
    isSubset(arr1, arr2) {
      // 将数组转换为 Set，以便进行高效的包含检查
      const set1 = new Set(arr1);
      const set2 = new Set(arr2);

      // 检查 set2 中的每个元素是否都在 set1 中
      for (let elem of set2) {
        if (!set1.has(elem)) {
          return false;
        }
      }
      return true;
    },
    // 切换默认选中规格
    changeDefaultSelect(e, index) {
      this.$emit('changeDefault', e, index);
      // 一个开启 其他关闭
      // this.ManyAttrValue.map((item, i) => {
      //   if (i !== index) {
      //     item.isDefault = false;
      //   }
      // });
      // if (e) this.ManyAttrValue[index].isShow = true;
    },
    // 改变是否显示
    changeDefaultShow(index) {
      // 如果默认选中开启 则不可隐藏
      if (this.ManyAttrValue[index].isDefault === true) {
        this.ManyAttrValue[index].isShow = true;
        this.$message.error(this.$t('product.defaultSpecCannotHide'));
      }
    },
    // 清空批量规格信息
    batchDel() {
      this.$emit('handleBatchDel');
    },
    // 批量添加
    batchAdd() {
      let arr = [];
      for (let val of this.formValidate.attrs) {
        if (this.oneFormBatch[0][val.value]) {
          arr.push(this.oneFormBatch[0][val.value]);
        }
      }
      this.ManyAttrValue.forEach((val) => {
        if (val.attrValueShow) {
          if (arr.length) {
            let attrVal = val.attrValueShow;
            //   let data = Object.values(val.attrValueShow).map((item) => item.val);
            if (this.isSubset(Object.values(attrVal), arr)) {
              this.batchData(val);
            }
          } else {
            this.batchData(val);
          }
        }
      });
    },
    // 批量数据
    batchData(val) {
      if (this.oneFormBatch[0].image) this.$set(val, 'image', this.oneFormBatch[0].image);
      if (this.oneFormBatch[0].price > 0) this.$set(val, 'price', this.oneFormBatch[0].price);
      if (this.oneFormBatch[0].cost > 0) this.$set(val, 'cost', this.oneFormBatch[0].cost);
      if (this.oneFormBatch[0].otPrice > 0) this.$set(val, 'otPrice', this.oneFormBatch[0].otPrice);
      if (this.oneFormBatch[0].barCode) this.$set(val, 'barCode', this.oneFormBatch[0].barCode);
      if (this.oneFormBatch[0].stock >= 0) this.$set(val, 'stock', this.oneFormBatch[0].stock);
      if (this.oneFormBatch[0].weight >= 0) this.$set(val, 'weight', this.oneFormBatch[0].weight);
      if (this.oneFormBatch[0].volume >= 0) this.$set(val, 'volume', this.oneFormBatch[0].volume);
      if (this.oneFormBatch[0].brokerage > 0) this.$set(val, 'brokerage', this.oneFormBatch[0].brokerage);
      if (this.oneFormBatch[0].brokerageTwo > 0) this.$set(val, 'brokerageTwo', this.oneFormBatch[0].brokerageTwo);
      if (this.oneFormBatch[0].vipPrice > 0) this.$set(val, 'vipPrice', this.oneFormBatch[0].vipPrice);
      if (this.oneFormBatch[0].itemNumber) this.$set(val, 'itemNumber', this.oneFormBatch[0].itemNumber);
    },
    // 添加按钮
    addBtn() {
      this.clearAttr();
      this.isBtn = true;
    },
    clearAttr() {
      this.formDynamic.attrsName = '';
      this.formDynamic.attrsVal = '';
    },
    // 删除规格
    handleRemoveRole(index) {
      this.formValidate.attrs.splice(index, 1);
      this.ManyAttrValue.splice(index, 1);
      if (!this.formValidate.attrs.length) {
        this.formValidate.header = [];
        this.ManyAttrValue = [];
      } else {
        this.generateAttr(this.formValidate.attrs);
      }
    },

    // 添加属性
    createAttr(num, idx) {
      if (num) {
        // 判断是否存在同样熟悉
        var isExist = this.formValidate.attrs[idx].detail.some((item) => item.value === num);
        if (isExist) {
          this.$message.error(this.$t('product.specValueExists'));
          return;
        }

        this.formValidate.attrs[idx].detail.push({
          value: num,
          valueJson: this.isDefaultSpecLang ? {} : { [this.activeLang]: num },
          image: '',
        });
        if (this.ManyAttrValue.length) {
          this.addOneAttr(this.formValidate.attrs[idx].value, num);
        } else {
          this.generateAttr(this.formValidate.attrs);
        }
        this.$refs['popoverRef_' + idx][0].doClose(); //关闭的
        this.clearAttr();
        setTimeout(() => {
          if (this.$refs['popoverRef_' + idx]) {
            //重点是以下两句
            this.$refs['popoverRef_' + idx][0].doShow(); //打开的
            //重点是以上两句
          }
        }, 20);
      } else {
        this.$refs['popoverRef_' + idx][0].doClose(); //关闭的
      }
    },

    //清空卡密
    virtualListClear() {
      // this.$set(this[this.carMytabName][this.carMytabIndex], 'cdkey', []);
      this[this.carMytabName][this.carMytabIndex].cdkeyId = [];
    },
    //添加倒入卡密的值
    changeVirtual(e) {
      this.virtualList = this.virtualList.concat(e);
    },
    closeCloudDisk() {
      this.$refs.cloudDiskRef.cloudDiskShow = false;
    },
    //确认保存云盘链接
    handlerSubSuccessCloudDisk(e) {
      this.cloudDisk = e;
      this[this.carMytabName][this.carMytabIndex].expand = JSON.parse(JSON.stringify(e));
      this.$refs.cloudDiskRef.cloudDiskShow = false;
    },
    //选择卡密库回调
    handlerChangeCdkeyIdSubSuccess(row) {
      this[this.carMytabName][this.carMytabIndex].cdkeyLibraryName = row.name;
      this[this.carMytabName][this.carMytabIndex].cdkeyLibraryNameJson = row.nameJson;
      this[this.carMytabName][this.carMytabIndex].cdkeyId = row.id;
      this[this.carMytabName][this.carMytabIndex].stock = row.stock;
    },
    //查看已设置的虚拟商品
    seeVirtually(data, name, index, type) {
      this.carMytabName = name;
      this.carMytabIndex = index;
      if (type === 1) {
        this.cloudDisk = data.expand;
        this[this.carMytabName][this.carMytabIndex].expand = data.expand;
        this.$refs.cloudDiskRef.cloudDiskShow = true;
      } else {
        this.cdkeyLibraryInfo = {
          id: data.cdkeyId,
          name: data.cdkeyLibraryName,
          nameJson: data.cdkeyLibraryNameJson,
        };
        this.$refs.cdkeyLibraryRef.cdkeyShow = true;
      }
    },
    // 添加虚拟链接
    handleAddVirtually(index, name, type) {
      this.carMytabIndex = index;
      this.carMytabName = name;
      //this.virtualListClear();
      if (type === 1) {
        this.cloudDisk = '';
        this.$refs.cloudDiskRef.cloudDiskShow = true;
      } else {
        this.cdkeyLibraryInfo = {};
        this.$refs.cdkeyLibraryRef.cdkeyShow = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.lang-name-switch {
  width: 100%;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
.el-dropdown-menu {
  border-color: #ebeef5;
  max-height: 650px !important;
  overflow-y: scroll !important;
}

.priceBox {
  width: 100%;
  ::v-deep.el-input__inner {
    text-align: center;
  }
}
// 多规格设置
.addfont {
  display: inline-block;
  font-size: 12px;
  font-weight: 400;
  color: var(--prev-color-primary);
  margin-left: 14px;
  cursor: pointer;
}
.specifications {
  .specifications-item:hover {
    background-color: var(--prev-color-primary-light-9);
  }
  .specifications-item:hover .del {
    display: block;
  }
  .specifications-item:last-child {
    margin-bottom: 14px;
  }
  .specifications-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 20px 15px;
    transition: all 0.1s;
    background-color: #fafafa;
    margin-bottom: 10px;
    border-radius: 4px;

    .del {
      display: none;
      position: absolute;
      right: 15px;
      top: 15px;
      font-size: 22px;
      color: var(--prev-color-primary);
      cursor: pointer;
      z-index: 9;
    }
    .specifications-item-box {
      position: relative;
      .lineBox {
        position: absolute;
        left: 13px;
        top: 30px;
        width: 30px;
        height: 45px;
        border-radius: 6px;
        border-left: 1px solid #dcdfe6;
        border-bottom: 1px solid #dcdfe6;
      }
      .specifications-item-name {
        .el-icon-info {
          color: var(--prev-color-primary);
          font-size: 12px;
          margin-left: 5px;
        }
      }
      .specifications-item-name-input {
        width: 300px;
      }
    }
  }
}

.rulesBox {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .item {
    display: flex;
    flex-wrap: wrap;
  }
  .addfont {
    margin-top: 5px;
    margin-left: 0px;
  }
  ::v-deep .el-popover {
    border: none;
    box-shadow: none;
    padding: 0;
    margin-top: 5px;
    line-height: 1.5;
  }
}
.spec {
  display: block;
  margin: 5px 0;
  position: relative;

  .el-icon-error {
    position: absolute;
    display: none;
    right: -3px;
    top: -3px;
    z-index: 9;
    color: var(--prev-color-primary);
  }
}
.img-popover {
  cursor: pointer;
  width: 76px;
  height: 76px;
  padding: 6px;
  margin-top: 12px;
  background-color: #fff;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover .img-del {
    display: block;
  }
  .img-del {
    display: none;
    position: absolute;
    right: -4px;
    top: -5px;
    font-size: 16px;
    color: var(--prev-color-primary);
    cursor: pointer;
    z-index: 9;
  }
  .popper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
  .popper-arrow,
  .popper-arrow:after {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
  }
  .popper-arrow {
    top: -13px;
    border-top-width: 0;
    border-bottom-color: #dcdfe6;
    border-width: 6px;
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
    &::after {
      top: -5px;
      margin-left: -6px;
      border-top-width: 0;
      border-bottom-color: #fff;
      content: ' ';
      border-width: 6px;
    }
  }
}
.spec:hover {
  .el-icon-error {
    display: block;
    z-index: 999;
    cursor: pointer;
  }
}
// 多规格设置
.specifications {
  .specifications-item:hover {
    background: var(--prev-color-primary-light-9) !important;
  }
  .specifications-item:hover .del {
    display: block;
  }
  .specifications-item:last-child {
    margin-bottom: 14px;
  }
  .specifications-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 20px 15px;
    transition: all 0.1s;
    background-color: #fafafa;
    margin-bottom: 10px;
    border-radius: 4px;

    .del {
      display: none;
      position: absolute;
      right: 15px;
      top: 15px;
      font-size: 22px;
      color: var(--prev-color-primary);
      cursor: pointer;
      z-index: 9;
    }
    .specifications-item-box {
      position: relative;
      .lineBox {
        position: absolute;
        left: 13px;
        top: 24px;
        width: 30px;
        height: 45px;
        border-radius: 6px;
        border-left: 1px solid #dcdfe6;
        border-bottom: 1px solid #dcdfe6;
      }
      .specifications-item-name {
        .el-icon-info {
          color: var(--prev-color-primary);
          font-size: 12px;
          margin-left: 5px;
        }
      }
      .specifications-item-name-input {
        width: 430px;
      }
    }
  }
}
</style>
