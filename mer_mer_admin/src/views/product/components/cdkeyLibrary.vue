<template>
  <el-dialog
    :visible.sync="cdkeyShow"
    :title="$t('product.setCdkey')"
    :append-to-body="true"
    width="610px"
    :close-on-click-modal="false"
  >
    <div class="carMywrapper">
      <div class="type-radio">
        <el-form label-width="100px" :model="carMyValidateForm" ref="carMyValidateForm" :inline="true">
          <el-form-item
            :label="$t('product.relatedCdkeyLibrary')"
            :rules="{
              required: true,
              message: $t('product.cdkeyLibraryRequired'),
              trigger: 'change',
            }"
          >
            <el-select
              class="from-ipt-width"
              value-key="id"
              @change="handleChange($event)"
              v-model="carMyValidateForm.cdkeyInfo"
              :placeholder="$t('product.relatedCdkeyLibraryPlaceholder')"
              clearable
              filterable
            >
              <el-option
                :value="item"
                v-for="(item, index) in cdkeyLibraryList"
                :key="index"
                :label="getLocalizedName(item, uiLocale) || item.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog-footer-inner dialog-bottom-top" slot="footer">
        <el-button class="btns" size="small" @click="cdkeyShow = false">{{ $t('product.cancel') }}</el-button>
        <el-button
          :loading="btnloading"
          type="primary"
          class="btns"
          size="small"
          @click="submitForm('carMyValidateForm')"
          >{{ $t('product.save') }}</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { productUnrelatedListApi } from '@/api/productCdkey';
import { getLocalizedName, getUiLocale } from '@/utils/localizedName';

export default {
  name: 'cdkeyLibrary',
  props: {
    cdkeyLibraryInfo: {
      type: Object,
      default: function () {
        return null;
      },
    },
  },
  computed: {
    uiLocale() {
      return (this.$i18n && this.$i18n.locale) || getUiLocale(this);
    },
  },
  data() {
    return {
      cdkeyShow: false,
      header: {}, //请求头部信息
      carMyValidateForm: { cdkeyInfo: null }, //卡密对象
      btnloading: false,
      cdkeyLibraryList: [],
    };
  },
  watch: {
    cdkeyLibraryInfo: {
      handler(nVal, oVal) {
        this.carMyValidateForm.cdkeyInfo = nVal;
        this.getCdkeyLibraryList();
      },
      deep: true,
    },
  },
  mounted() {
    this.carMyValidateForm.cdkeyInfo = this.cdkeyLibraryInfo;
  },
  methods: {
    getLocalizedName,
    //卡密列表
    getCdkeyLibraryList() {
      productUnrelatedListApi().then((res) => {
        if (this.carMyValidateForm.cdkeyInfo.id) {
          // 使用 Array.some() 方法检查数组中是否包含该对象
          let isObjectFound = res.some((item) => {
            return JSON.stringify(item).id === JSON.stringify(this.carMyValidateForm.cdkeyInfo).id;
          });
          if (!isObjectFound) {
            // 如果数组中不包含该对象，则将其添加到数组中
            res.push(this.carMyValidateForm.cdkeyInfo);
          }
        }
        this.cdkeyLibraryList = res;
      });
    },
    handleChange(event) {
      this.carMyValidateForm.cdkeyInfo = event;
    },
    //保存
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.cdkeyShow = false;
          this.$emit('handlerSubSuccess', this.carMyValidateForm.cdkeyInfo);
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.dialog-footer-inner {
  padding-bottom: 20px;
}
::v-deep .el-form-item {
  margin-right: 0 !important;
}
</style>
