<template>
  <div>
    <el-form ref="pram" :model="pram" label-width="80px" @submit.native.prevent>
      <el-form-item
        :label="$t('systemSetting.roleNameLabel')"
        prop="roleName"
        :rules="[{ required: true, validator: validateRoleName, trigger: ['blur', 'change'] }]"
      >
        <div class="lang-name-switch">
          <el-radio-group v-model="activeLang" size="small">
            <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
              {{ lang.label }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-if="activeLang === defaultLangCode"
            v-model.trim="pram.roleName"
            :placeholder="$t('systemSetting.identityName')"
          />
          <el-input
            v-else
            v-model.trim="nameJsonForm[activeLang]"
            :placeholder="$t('marketing.inputNameInLang', { lang: activeLangLabel })"
          />
        </div>
      </el-form-item>
      <el-form-item :label="$t('user.statusColon')">
        <el-switch
          v-model="pram.status"
          :active-text="$t('common.open')"
          :inactive-text="$t('common.close')"
          :active-value="true"
          :inactive-value="false"
        />
      </el-form-item>
      <el-form-item :label="$t('systemSetting.menuPermissionLabel')">
        <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">{{ $t('menu.toggleExpand') }}</el-checkbox>
        <!-- <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox> -->
        <el-checkbox v-model="menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')"
          >{{ $t('systemSetting.parentChildLinkage') }}</el-checkbox
        >
        <el-tree
          class="tree-border"
          :data="menuOptions"
          show-checkbox
          ref="menu"
          node-key="id"
          :default-expand-all="expandAll"
          :check-strictly="!menuCheckStrictly"
          :empty-text="$t('systemSetting.loadingPleaseWait')"
          :props="defaultProps"
        ></el-tree>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button size="small" @click="close">{{ $t('common.cancel') }}</el-button>
      <el-button
        :loading="loading"
        size="small"
        type="primary"
        @click="handlerSubmit('pram')"
        v-hasPermi="['merchant:admin:role:update']"
        >{{ isCreate === 0 ? $t('common.confirm') : $t('systemSetting.update') }}</el-button
      >
    </div>
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

import * as roleApi from '@/api/role.js';
import { Debounce } from '@/utils/validate';
import Cookies from 'js-cookie';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import {
  buildI18nNameJson,
  hasI18nNameContent,
  pickFormName,
  resolveFormActiveLang,
} from '@/utils/localizedName';
export default {
  name: 'roleEdit',
  props: {
    isCreate: {
      type: Number,
      required: 0,
    },
    editData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      expandAll: false,
      loading: false,
      pram: {
        roleName: null,
        roleNameJson: '',
        rules: '',
        status: null,
        id: null,
        merId: JSON.parse(Cookies.get('JavaMerInfo')).id,
      },
      langOptions: defaultLangList.map((i) => ({ code: i.value, label: i.label })),
      defaultLangCode: 'zh-cn',
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      nameJsonForm: {},
      menuExpand: false,
      menuNodeAll: false,
      menuOptions: [],
      menuCheckStrictly: true,
      currentNodeId: [],
      defaultProps: {
        children: 'childList',
        label: 'name',
      },
      menuIds: [],
    };
  },
  mounted() {
    this.getLanguageList();
    this.initEditData();
    this.getCacheMenu();
  },
  computed: {
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : this.activeLang;
    },
  },
  methods: {
    validateRoleName(rule, value, callback) {
      if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
      else callback(new Error(this.$t('systemSetting.pleaseEnterRoleName')));
    },
    emptyNameJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    parseNameJson(nameJson) {
      const form = this.emptyNameJsonForm();
      if (!nameJson) return form;
      try {
        const obj = typeof nameJson === 'string' ? JSON.parse(nameJson) : nameJson;
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    buildNameJson() {
      return buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, pickFormName(this));
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
          this.nameJsonForm = this.parseNameJson(this.pram && this.pram.roleNameJson);
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.parseNameJson(this.pram && this.pram.roleNameJson);
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    close() {
      this.$emit('hideEditDialog');
    },
    initEditData() {
      if (this.isCreate !== 1) return;
      const { roleName, roleNameJson, status, id, merId } = this.editData;
      this.pram.roleName = roleName;
      this.pram.roleNameJson = roleNameJson || '';
      this.nameJsonForm = this.parseNameJson(this.pram.roleNameJson);
      this.pram.status = status;
      this.pram.id = id;
      this.pram.merId = JSON.parse(Cookies.get('JavaMerInfo')).id;
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
      });
      roleApi.getInfo(id).then((res) => {
        this.pram.roleName = res.roleName;
        this.pram.roleNameJson = res.roleNameJson || '';
        this.nameJsonForm = this.parseNameJson(this.pram.roleNameJson);
        this.menuOptions = res.menuList;
        this.checkDisabled(this.menuOptions);
        loading.close();
        this.getTreeId(res.menuList);
        this.$nextTick(() => {
          this.menuIds.forEach((i, n) => {
            var node = this.$refs.menu.getNode(i);
            if (node.isLeaf) {
              this.$refs.menu.setChecked(node, true);
            }
          });
        });
      });
    },
    handlerSubmit: Debounce(function (form) {
      this.$refs[form].validate((valid) => {
        if (!valid) return;
        let roles = this.getMenuAllCheckedKeys().toString();
        this.pram.rules = roles;
        this.pram.roleNameJson = this.buildNameJson();
        if (this.isCreate === 0) {
          this.handlerSave();
        } else {
          this.handlerEdit();
        }
      });
    }),
    handlerSave() {
      this.loading = true;
      roleApi
        .addRole(this.pram)
        .then((data) => {
          this.$message.success(this.$t('systemSetting.createIdentitySuccess'));
          this.$emit('hideEditDialog');
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    handlerEdit() {
      this.loading = true;
      roleApi
        .updateRole(this.pram)
        .then((data) => {
          this.$message.success(this.$t('systemSetting.updateIdentitySuccess'));
          this.$emit('hideEditDialog');
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    rulesSelect(selectKeys) {
      this.pram.rules = selectKeys;
    },
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      // this.expandAll = true
      this.expandAll = this.menuExpand ? true : false;
      if (type == 'menu') {
        let treeList = this.menuOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type == 'menu') {
        this.menuCheckStrictly = value ? true : false;
      }
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = this.$refs.menu.getCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    getCacheMenu() {
      if (this.isCreate !== 0) return;
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
      });
      roleApi.menuCacheList().then((res) => {
        this.menuOptions = res;
        this.checkDisabled(this.menuOptions);
        loading.close();
      });
    },
    getTreeId(datas) {
      for (var i in datas) {
        if (datas[i].checked) this.menuIds.push(datas[i].id);
        if (datas[i].childList) {
          this.getTreeId(datas[i].childList);
        }
      }
    },
    checkDisabled(data) {
      //设置公共权限默认勾选且不可操作
      data.forEach((item) => {
        if (item.id === 179 || item.id === 180) {
          item.disabled = true;
          item.childList.forEach((item1) => {
            item1.disabled = true;
            this.$nextTick(() => {
              var node = this.$refs.menu.getNode(item1.id);
              if (node.isLeaf) {
                this.$refs.menu.setChecked(node, true);
              }
            });
          });
        }
      });
    },
  },
};
</script>

<style scoped>
.lang-name-switch {
  width: 100%;
}
.lang-name-switch .el-radio-group {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
</style>
