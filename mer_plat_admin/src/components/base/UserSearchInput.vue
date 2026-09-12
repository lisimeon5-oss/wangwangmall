<template>
  <div>
    <el-input
      v-model="tableFromNew.content"
      :placeholder="$t('common.pleaseEnterUserInfo')"
      :type="tableFromNew.searchType === 'phone' || tableFromNew.searchType === 'uid' ? 'number' : 'text'"
      @input="handleChangeContent"
      clearable
      class="selWidth"
    >
      <el-select @change="handleChangeType" v-model="tableFromNew.searchType" slot="prepend" style="width: 130px">
        <el-option value="all" :label="$t('common.all')"></el-option>
        <el-option value="uid" :label="$t('common.userId')"></el-option>
        <el-option value="phone" :label="$t('common.phoneNumber')"></el-option>
        <el-option value="nickname" :label="$t('common.userNickname')"></el-option>
      </el-select>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'UserSearchInput',
  data() {
    return {
      tableFromNew: this.value,
    };
  },
  props: {
    value: {
      type: Object,
      default: {},
    },
  },
  watch: {
    tableFromNew: {
      handler(newVal) {
        this.$emit('input', newVal);
      },
      deep: true,
    },
  },
  methods: {
    handleChangeType() {
      this.tableFromNew.content = '';
    },
    handleChangeContent(event) {
      if (this.tableFromNew.searchType === 'phone' || this.tableFromNew.searchType === 'uid')
        this.tableFromNew.content = event.replace(/[^0-9]/g, '');
      if (this.tableFromNew.content > 99999999999) {
        this.tableFromNew.content = ''; // 设置最大值为100
      }
    },
  },
};
</script>
