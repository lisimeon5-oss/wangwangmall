<template>
  <div>
    <el-cascader
      :key="'mer-use-category-' + currentLocale"
      v-model="merIds"
      class="selWidth"
      :show-all-levels="false"
      :options="merSelect"
      :props="merProps"
      filterable
      clearable
      :placeholder="$t('merchant.pleaseSelectMerchant')"
      @change="onChangeMerId"
    />
  </div>
</template>

<script>
import * as merchant from '@/api/merchant';
import { localizeNamedTree, getUiLocale } from '@/utils/localizedName';
export default {
  name: 'index',
  props: {
    multiple: {
      type: Boolean,
      default: true,
    },
    merIdChecked: {
      type: [Array, String, Number],
      default: () => null,
    },
  },
  watch: {
    merIdChecked(n) {
      this.merIds = n;
    },
    currentLocale() {
      this.applyLocalizedMerSelect();
    },
  },
  computed: {
    currentLocale() {
      return getUiLocale(this);
    },
  },
  data() {
    return {
      merProps: {
        value: 'id',
        label: 'name',
        children: 'merchantList',
        expandTrigger: 'hover',
        emitPath: false,
        multiple: this.multiple,
      },
      merSelectRaw: [],
      merSelect: [],
      merIds: null,
    };
  },
  mounted() {
    this.merIds = this.merIdChecked;
    this.getMerList();
  },
  methods: {
    applyLocalizedMerSelect() {
      this.merSelect = localizeNamedTree(this.merSelectRaw, this.currentLocale, 'merchantList');
    },
    getMerList() {
      merchant.merCategoryListApi().then((res) => {
        this.merSelectRaw = res || [];
        this.applyLocalizedMerSelect();
      });
    },
    onChangeMerId() {
      this.$emit('getMerId', this.merIds);
    },
  },
};
</script>
<style lang="scss">
::v-deep.el-cascader__search-input {
  color: white;
  opacity: 0 !important;
}
</style>
