<template>
  <div class="divBox">
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-show="showSearch && checkPermi(['platform:merchant:menu:list'])"
    >
      <div class="padding-add">
        <el-form :model="queryParams" ref="queryForm" inline label-position="right" @submit.native.prevent>
          <el-form-item :label="$t('menu.menuName')">
            <el-input
              v-model.trim="name"
              :placeholder="$t('menu.inputMenuName')"
              clearable
              size="small"
              class="selWidth bottomChange"
            />
          </el-form-item>
          <el-form-item :label="$t('menu.menuType')" prop="menuType">
            <el-select v-model.trim="queryParams.menuType" :placeholder="$t('common.type')" clearable size="small" class="selWidth">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleQuery">{{ $t('common.query') }}</el-button>
            <el-button size="small" @click="resetQuery">{{ $t('el.table.resetFilter') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <div class="acea-row">
        <el-button type="primary" size="small" @click="handleAdd" v-hasPermi="['platform:merchant:menu:add']"
          >{{ $t('user.addNew') }}</el-button
        >
        <el-button type="info" plain size="mini" @click="toggleExpandAll">{{ $t('menu.toggleExpand') }}</el-button>
      </div>
      <el-table
        v-if="refreshTable"
        v-loading="listLoading"
        :data="menuList"
        row-key="id"
        size="small"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="mt20"
      >
        <el-table-column :label="$t('menu.name')" :show-overflow-tooltip="true" min-width="160">
          <template slot-scope="scope">{{ getLocalizedMenuName(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="icon" :label="$t('menu.icon')" width="100">
          <template slot-scope="scope">
            <i :class="'el-icon-' + scope.row.icon" style="font-size: 20px" />
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('product.sort')" width="60"></el-table-column>
        <el-table-column prop="perms" :label="$t('menu.permissionTag')" :show-overflow-tooltip="true" min-width="170"></el-table-column>
        <el-table-column
          prop="component"
          :label="$t('menu.componentPathText')"
          :show-overflow-tooltip="true"
          min-width="170"
        ></el-table-column>
        <el-table-column prop="isShow" :label="$t('common.status')" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isShow ? '' : 'danger'">{{ scope.row.isShow ? $t('common.show') : $t('menu.hide') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="menuType" :label="$t('common.type')" width="80">
          <template slot-scope="scope">
            <span class="type_tag one" v-if="scope.row.menuType == 'M'">{{ $t('menu.directory') }}</span>
            <span class="type_tag two" v-else-if="scope.row.menuType == 'C'">{{ $t('menu.menu') }}</span>
            <span class="type_tag three" v-else type="info">{{ $t('menu.button') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="160" fixed="right">
          <template slot-scope="scope">
            <a @click="handleUpdate(scope.row)" v-hasPermi="['platform:merchant:menu:update']">{{ $t('common.modify') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a size="mini" type="text" @click="handleAdd(scope.row)" v-hasPermi="['platform:merchant:menu:add']"
              >{{ $t('user.addNew') }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <a size="mini" type="text" @click="handleDelete(scope.row)" v-hasPermi="['platform:merchant:menu:delete']"
              >{{ $t('common.delete') }}</a
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加或修改菜单对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="95px">
          <el-form-item :label="$t('menu.parentMenu')">
            <treeselect
              v-model="form.pid"
              :options="menuOptions"
              :normalizer="normalizer"
              :show-count="true"
              :placeholder="$t('menu.selectParentMenu')"
            />
          </el-form-item>
          <el-form-item :label="$t('menu.menuType')" prop="menuType">
            <el-radio-group v-model="form.menuType">
              <el-radio label="M">{{ $t('menu.directory') }}</el-radio>
              <el-radio label="C">{{ $t('menu.menu') }}</el-radio>
              <el-radio label="A">{{ $t('menu.button') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.menuType != 'A'" :label="$t('menu.menuIcon')">
            <el-form-item>
              <el-input :placeholder="$t('menu.selectMenuIcon')" v-model.trim="form.icon">
                <el-button slot="append" icon="el-icon-circle-plus-outline" @click="addIcon"></el-button>
              </el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item :label="$t('menu.menuName')" prop="name">
            <div class="lang-name-switch">
              <el-radio-group v-model="activeLang" size="small">
                <el-radio-button v-for="lang in langOptions" :key="lang.code" :label="lang.code">
                  {{ lang.label }}
                </el-radio-button>
              </el-radio-group>
              <el-input
                v-if="activeLang === defaultLangCode"
                v-model.trim="form.name"
                :placeholder="$t('menu.inputMenuName')"
                clearable
                class="lang-name-input"
              />
              <el-input
                v-else
                v-model.trim="nameJsonForm[activeLang]"
                :placeholder="$t('menu.inputNameInLang', { lang: activeLangLabel })"
                clearable
                class="lang-name-input"
              />
            </div>
          </el-form-item>
          <el-form-item prop="component" v-if="form.menuType !== 'A'">
            <span slot="label">
              <el-tooltip :content="$t('menu.componentPathTip')" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
              {{ $t('menu.componentPath') }}
            </span>
            <el-input v-model.trim="form.component" :placeholder="$t('menu.inputComponentPath')" />
          </el-form-item>
          <el-form-item :label="$t('menu.sort')" prop="sort">
            <el-input-number v-model.trim="form.sort" :min="$constants.NUM_Range.min" :max="$constants.NUM_Range.max" />
          </el-form-item>
          <el-form-item v-if="form.menuType === 'A'">
            <el-input v-model.trim="form.perms" :placeholder="$t('menu.inputPerms')" maxlength="100" />
            <span slot="label">
              <el-tooltip :content="$t('menu.permsTip')" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
              {{ $t('menu.perms') }}
            </span>
          </el-form-item>
          <el-form-item class="mb30" v-if="form.menuType != 'A'">
            <span slot="label">
              <el-tooltip :content="$t('menu.showStatusTip')" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
              {{ $t('menu.showStatus') }}
            </span>
            <el-radio-group v-model="form.isShow">
              <el-radio v-for="item in showStatus" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitForm" v-hasPermi="['platform:paid:member:benefits:edit']"
            >{{ $t('common.save') }}</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------
import { menuMerListApi, menuMerInfo, menuMerUpdate, menuMerAdd, menuMerDelete } from '@/api/merchant';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { Debounce } from '@/utils/validate';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import { getLocalizedName, resolveFormActiveLang, hasI18nNameContent, buildI18nNameJson, pickFormName } from '@/utils/localizedName';
export default {
  name: 'Menu',
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      listLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        name: '',
        menuType: '',
      },
      name: '',
      // 表单参数
      form: {},
      //请求到的menu数据
      menuDataList: [],
      // 多语言名称支持的语言（动态从后端获取启用的语言）
      langOptions: [],
      // 默认语言代码（对应菜单名称 name 字段）
      defaultLangCode: 'zh-cn',
      // 当前切换的语言代码（菜单名称多语言切换）
      activeLang: (this.$i18n && this.$i18n.locale) || 'zh-cn',
      // 多语言名称编辑对象（不含默认语言）
      nameJsonForm: {},
    };
  },
  computed: {
    // 当前切换语言的显示名称
    activeLangLabel() {
      const lang = this.langOptions.find((item) => item.code === this.activeLang);
      return lang ? lang.label : '';
    },
    // 表单校验（随语言切换）
    rules() {
      return {
        name: [{
          validator: (rule, value, callback) => {
            if (hasI18nNameContent(pickFormName(this), this.nameJsonForm)) callback();
            else callback(new Error(this.$t('menu.menuNameRequired')));
          },
          trigger: 'blur',
        }],
        sort: [{ required: true, message: this.$t('menu.sortRequired'), trigger: 'blur' }],
      };
    },
    // 菜单类型选项（随语言切换）
    statusOptions() {
      return [
        { value: 'M', label: this.$t('menu.directory') },
        { value: 'C', label: this.$t('menu.menu') },
        { value: 'A', label: this.$t('menu.button') },
      ];
    },
    // 显示/隐藏选项（随语言切换）
    showStatus() {
      return [
        { label: this.$t('menu.show'), value: true },
        { label: this.$t('menu.hide'), value: false },
      ];
    },
    currentLocale() {
      return (
        (this.$store.state.themeConfig &&
          this.$store.state.themeConfig.themeConfig &&
          this.$store.state.themeConfig.themeConfig.globalI18n) ||
        this.$i18n.locale ||
        'zh-cn'
      );
    },
  },
  created() {
    this.getLanguageList();
    if (checkPermi(['platform:merchant:menu:list'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedMenuName(row) {
      return getLocalizedName(row, this.currentLocale);
    },
    // 点击图标
    addIcon() {
      const _this = this;
      _this.$modalIcon(function (icon) {
        _this.form.icon = icon;
      });
    },
    /** 构建多语言名称编辑对象（不含默认语言） */
    emptyNameJsonForm() {
      const form = {};
      this.langOptions.forEach((lang) => {
        if (lang.code !== this.defaultLangCode) form[lang.code] = '';
      });
      return form;
    },
    /** 获取启用的语言列表，用于动态渲染菜单名称多语言输入 */
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
          this.nameJsonForm = this.emptyNameJsonForm();
          this.activeLang = resolveFormActiveLang(this);
        })
        .catch(() => {
          // 接口失败时回退到默认语言列表
          this.langOptions = defaultLangList.map((i) => ({ code: i.value, label: i.label }));
          this.nameJsonForm = this.emptyNameJsonForm();
          this.activeLang = resolveFormActiveLang(this);
        });
    },
    /** 解析多语言名称 JSON 字符串为编辑对象 */
    parseNameJson(nameJson) {
      const form = this.emptyNameJsonForm();
      if (!nameJson) return form;
      try {
        const obj = JSON.parse(nameJson);
        Object.keys(form).forEach((key) => {
          form[key] = obj[key] || '';
        });
      } catch (e) {
        // 解析失败时保持为空
      }
      return form;
    },
    /** 将多语言名称编辑对象序列化为 JSON 字符串 */
    buildNameJson() {
      return buildI18nNameJson(this.langOptions, this.nameJsonForm, this.defaultLangCode, pickFormName(this));
    },
    /** 查询菜单列表 */
    getList() {
      this.listLoading = true;
      this.queryParams.name = encodeURIComponent(this.name);
      menuMerListApi(this.queryParams).then((res) => {
        let obj = {},
          menuList = [];
        res.forEach((item) => {
          obj = item;
          obj.parentId = item.pid;
          obj.children = [];
          menuList.push(obj);
        });
        this.menuDataList = menuList;
        this.menuList = this.handleTree(menuList, 'menuId');
        this.getTreeselect();
        this.listLoading = false;
      });
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id ? node.id : 0,
        label: node.id ? this.getLocalizedMenuName(node) : this.$t('menu.mainDirectory'),
        children: node.children,
      };
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      this.menuOptions = [];
      const menu = { menuId: 0, menuName: this.$t('menu.mainCategory'), children: [] };
      menu.children = this.handleTree(this.menuDataList, 'menuId');
      this.menuOptions.push(menu);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        menuId: '',
        parentId: 0,
        name: '',
        icon: '',
        menuType: 'M',
        sort: 0,
        isShow: true,
        component: '',
        perms: '',
      };
      this.nameJsonForm = this.emptyNameJsonForm();
      this.activeLang = resolveFormActiveLang(this);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.name = '';
      this.queryParams = { name: '', menuType: '' };
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row != null && row.id) {
        this.form.pid = row.id;
      } else {
        this.form.pid = 0;
      }
      this.open = true;
      this.title = this.$t('menu.addMenu');
      this.getTreeselect();
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
      });
      this.reset();
      this.getTreeselect();
      menuMerInfo(row.id).then((response) => {
        this.form = response;
        this.nameJsonForm = this.parseNameJson(response.nameJson);
        this.open = true;
        this.title = this.$t('menu.editMenu');
        loading.close();
      });
    },
    /** 提交按钮 */
    submitForm: Debounce(function () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.form.nameJson = this.buildNameJson();
          if (this.form.id != undefined) {
            menuMerUpdate(this.form).then((response) => {
              this.$modal.msgSuccess(this.$t('category.updateSuccess'));
              this.open = false;
              this.getList();
            });
          } else {
            menuMerAdd(this.form).then((response) => {
              this.$modal.msgSuccess(this.$t('product.addSuccess'));
              this.open = false;
              this.getList();
            });
          }
        }
      });
    }),
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal
        .confirm(this.$t('merchant.deleteNamedConfirm', { name: this.getLocalizedMenuName(row) }))
        .then(function () {
          return menuMerDelete(row.id);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('product.deleteSuccess'));
        })
        .catch(() => {});
    },
  },
};
</script>
<style lang="scss" scoped>
.mb8 {
  margin-bottom: 8px;
}

.type_tag {
  display: inline-block;
  height: 32px;
  padding: 0 10px;
  line-height: 30px;
  font-size: 12px;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}

.two {
  background: rgba(239, 156, 32, 0.1);
  color: rgba(239, 156, 32, 1);
}

.one {
  background: rgba(75, 202, 213, 0.1);
  color: rgba(75, 202, 213, 1);
}

.three {
  color: rgba(120, 128, 160, 1);
  background: rgba(120, 128, 160, 0.1);
}

::v-deep.bottomChange {
  margin-bottom: 0 !important;
}

.el-form-item__content {
  .el-form-item.el-form-item--small {
    margin-bottom: 0 !important;
  }
}

::v-deep .vue-treeselect__control:hover {
  border-color: var(--prev-color-primary);
}

::v-deep .vue-treeselect__x-container:hover {
  color: var(--prev-color-primary);
}

::v-deep .vue-treeselect__option--selected {
  color: var(--prev-color-primary);
}

::v-deep .vue-treeselect--focused:not(.vue-treeselect--open) .vue-treeselect__control {
  border-color: var(--prev-color-primary);
}

::v-deep .vue-treeselect:not(.vue-treeselect--disabled):not(.vue-treeselect--focused) .vue-treeselect__control:focus {
  border-color: var(--prev-color-primary);
}

.lang-name-switch {
  width: 100%;

  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}

.lang-name-input {
  margin-top: 10px;
}

</style>
