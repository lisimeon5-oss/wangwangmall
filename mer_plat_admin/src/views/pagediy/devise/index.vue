<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <div class="acea-row">
        <div class="tab_view" :key="'pagediy-tabs-' + ($i18n.locale || '')">
          <div
            class="cell_item"
            :class="{ tab_active: listActive === index }"
            v-for="(item, index) in tabList"
            :key="index"
            @click="ProductNavTab(index)"
          >
            {{ item }}
          </div>
        </div>
        <div v-if="listActive === 0" class="rightModel acea-row">
          <div class="leftModel">
            <div class="current_home">
              <div class="model_header">
                <iframe id="iframe" class="iframe-box" :src="frontDomain" frameborder="0" ref="iframe"></iframe>
              </div>
              <div class="mask"></div>
            </div>
          </div>
          <div style="width: 100%">
            <el-row>
              <el-col v-bind="grid">
                <div class="flex_between">
                  <el-button
                    v-hasPermi="['platform:pagediy:update', 'platform:pagediy:getdefault', 'platform:pagediy:info']"
                    type="primary"
                    @click="handlerDiyHomePage()"
                    size="small"
                    class="mb35"
                    style="font-size: 12px"
                    >{{ $t('pagediy.homePageDecoration') }}</el-button>
                  <el-card
                    body-style="background-color: #F9F9F9;"
                    class="mb20 Qrcode-card"
                    shadow="never"
                    :bordered="false"
                  >
                    <el-row>
                      <el-col v-bind="grid2">
                        <div class="acea-row row-between-wrapper Qrcode-box">
                          <div>
                            <div class="title mb20">{{ $t('pagediy.wechatMiniProgram') }}</div>
                            <div class="tips">{{ $t('pagediy.scanQrCodeToView') }}</div>
                          </div>
                        </div>
                      </el-col>
                      <el-col v-bind="grid2">
                        <div style="text-align: right">
                          <el-image :src="Qrcode" class="Qrcode_img"></el-image>
                        </div>
                      </el-col>
                    </el-row>
                  </el-card>
                  <el-card body-style="background-color: #F9F9F9;" class="Qrcode-card" shadow="never" :bordered="false">
                    <el-row>
                      <el-col v-bind="grid2">
                        <div class="acea-row row-between-wrapper Qrcode-box">
                          <div>
                            <div class="title mb20">{{ $t('common.publicAccount') }}</div>
                            <div class="tips">{{ $t('pagediy.scanQrCodeToView') }}</div>
                          </div>
                        </div>
                      </el-col>
                      <el-col v-bind="grid2">
                        <div class="acea-row" style="justify-content: right">
                          <div id="diyQrcode"></div>
                        </div>
                      </el-col>
                    </el-row>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div v-else class="rightModel">
          <div slot="header" class="clearfix mb20">
            <div class="container" v-hasPermi="['platform:pagediy:list']">
              <el-form size="small" inline @submit.native.prevent>
                <el-form-item :label="$t('pagediy.templateNameLabel')">
                  <el-input
                    v-model.trim="name"
                    :placeholder="$t('onePass.pleaseEnterTemplateName')"
                    class="selWidth"
                    clearable
                    @keyup.enter.native="getList(1)"
                  >
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="small" @click="getList(1)">{{ $t('common.query') }}</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-button
              type="primary"
              v-hasPermi="['platform:pagediy:save']"
              @click="handlerEditDiyPage(0, 'add')"
              size="small"
              style="font-size: 12px"
              ><i class="el-icon-plus" style="margin-right: 4px" />{{ $t('common.add') }}</el-button
            >
            <el-button v-hasPermi="['platform:pagediy:list']" @click="getList(1)" size="small" style="font-size: 12px"
              >{{ $t('common.refresh') }}</el-button
            >
          </div>
          <el-table
            v-loading="listLoading"
            :data="tableData.data"
            size="small"
            class="table"
            @row-dblclick="handleName"
            highlight-current-row
            :cell-class-name="tableCellClassName"
          >
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column :label="$t('onePass.templateName')" prop="name" min-width="210" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <div class="acea-row row-middle">
                  <el-tag v-show="scope.row.isDefault === 1" effect="plain" class="mr5">{{ $t('pagediy.homeTag') }}</el-tag>
                  <!--v-if去判断双击的是不是当前单元格-->
                  <el-input
                    @blur="hideInput(scope.row)"
                    size="mini"
                    maxlength="15"
                    :ref="scope.row.index + ',' + scope.column.index"
                    v-model="scope.row.name"
                    v-if="
                      scope.row.index + ',' + scope.column.index == currentCell &&
                      checkPermi(['platform:pagediy:updatename'])
                    "
                  >
                  </el-input>
                  <div v-else style="cursor: pointer" class="line1">{{ getLocalizedName(scope.row) }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('marketing.addTime')" min-width="180" />
            <el-table-column prop="updateTime" :label="$t('maintain.updateTime')" min-width="180" />
            <el-table-column :label="$t('common.operate')" width="190" fixed="right">
              <template slot-scope="scope">
                <a
                  v-hasPermi="['platform:pagediy:update', 'platform:pagediy:info']"
                  @click="handlerEditDiyPage(scope.row.id, 'edit')"
                  >{{ $t('pagediy.design') }}</a
                >
                <el-divider direction="vertical"></el-divider>
                <template v-if="scope.row.isDefault !== 1 && checkPermi(['platform:pagediy:setdefault'])">
                  <a @click="setHomepage(scope.row.id)">{{ $t('pagediy.setAsHome') }}</a>
                  <el-divider direction="vertical"></el-divider>
                </template>
                <el-dropdown trigger="click">
                  <span class="el-dropdown-link"> {{ $t('user.more') }}<i class="el-icon-arrow-down el-icon--right" /> </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-hasPermi="['platform:pagediy:save', 'platform:pagediy:info']"
                      @click.native="handlerEditDiyPage(scope.row.id, 'copy')"
                      >{{ $t('marketing.copy') }}</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="scope.row.isDefault !== 1 && checkPermi(['platform:pagediy:delete'])"
                      @click.native="handleDelete(scope.row.id, scope.$index)"
                      >{{ $t('common.delete') }}</el-dropdown-item
                    >
                    <el-dropdown-item @click.native="previewProtol(scope.row.id)">{{ $t('user.preview') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <div class="block">
            <el-pagination
              background
              :page-sizes="[10, 20, 30]"
              :page-size="tableForm.limit"
              :current-page="tableForm.page"
              layout="total, sizes, prev, pager, next, jumper"
              :total="tableData.total"
              @size-change="handleSizeChange"
              @current-change="pageChange"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!--    列表预览弹窗-->
    <el-dialog
      :visible.sync="perViewDia.visible"
      title=""
      width="430px"
      top="7vh"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <iframe
        v-if="perViewDia.visible"
        id="ifPerviewShop"
        :src="perViewDia.perViewUrl"
        style="width: 390px; height: 800px"
        frameborder="0"
      />
    </el-dialog>
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
import {
  pagediyListApi,
  pagediySetdefaultApi,
  pagediyDeleteApi,
  pagediyGetSetHome,
  wechatQrcodeApi,
  pagediyUpdatenameApi,
} from '@/api/devise';
import QRcode from 'qrcodejs2';
import { checkPermi } from '@/utils/permission';
import { handleDeleteTable } from '@/libs/public'; // 权限判断函数
import { getLocalizedName, hasI18nNameContent, parseLangJsonMap } from '@/utils/localizedName';
export default {
  name: 'index',
  data() {
    return {
      grid: {
        xl: 16,
        lg: 20,
        md: 20,
        sm: 24,
        xs: 24,
      },
      grid2: {
        xl: 12,
        lg: 12,
        md: 20,
        sm: 24,
        xs: 24,
      },
      listActive: 0,
      tableForm: {
        page: 1,
        limit: 10,
        name: '',
      },
      name: '',
      listLoading: false,
      tableData: {
        data: [],
        total: 0,
      },
      frontDomain: '',
      perViewDia: {
        // 列表二维码预览
        visible: false,
        perViewUrl: '',
      },
      Qrcode: '', //小程序二维码
      // 用一个字符串来保存当前双击的是哪一个单元格
      currentCell: null,
    };
  },
  computed: {
    tabList() {
      return [this.$t('pagediy.mallHomePage'), this.$t('pagediy.customPage')];
    },
  },
  mounted() {
    this.frontDomain = `${this.$selfUtil.getFrontDomainUrl()}/pages/index/index`;
    if (checkPermi(['platform:pagediy:list'])) this.getList();
    this.getWechatQrcode();
    this.getQRcode();
  },
  methods: {
    checkPermi,
    getLocalizedName,
    tableCellClassName({ row, column, rowIndex, columnIndex }) {
      row.index = rowIndex;
      column.index = columnIndex;
    },
    handleName(row, column) {
      this.currentCell = row.index + ',' + column.index;
      setTimeout(() => {
        this.$refs[row.index + ',' + column.index].focus();
      });
    },
    hideInput(item) {
      if (!hasI18nNameContent(item.name, parseLangJsonMap(item.nameJson))) {
        return this.$message.warning(this.$t('pagediy.templateNameRequired'));
      } else {
        this.currentCell = null;
      }
      pagediyUpdatenameApi({
        id: item.id,
        name: item.name,
        nameJson: item.nameJson,
      }).then((res) => {
        this.$message.success(this.$t('product.editSuccess'));
      });
    },
    //微信二维码
    getQRcode() {
      const el = document.getElementById('diyQrcode');
      if (!el || !this.frontDomain) return;
      el.innerHTML = '';
      new QRcode('diyQrcode', { width: 120, height: 120, text: this.frontDomain });
    },
    //小程序二维码
    getWechatQrcode() {
      // env_version	默认值为："release"，要打开的小程序版本。正式版为"release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
      wechatQrcodeApi({
        scene: 'id=0',
        path: 'pages/index/index',
        env_version: 'release',
      }).then((res) => {
        this.Qrcode = res.code;
      });
    },
    //点击左侧菜单
    ProductNavTab(index) {
      this.listActive = index;
    },
    //预览
    previewProtol(id) {
      if (!id) return;
      this.perViewDia.perViewUrl = this.frontDomain + '?id=' + id;
      this.perViewDia.visible = true;
    },
    // 使用模板
    setHomepage(id) {
      this.$modalSure(this.$t('pagediy.setAsHomeTemplate')).then(() => {
        pagediySetdefaultApi(id).then((res) => {
          this.$message.success(this.$t('product.operateSuccess'));
          this.getList();
        });
      });
    },
    // DIY 编辑首页
    handlerDiyHomePage() {
      pagediyGetSetHome().then((homePageId) => {
        this.handlerEditDiyPage(homePageId, 'edit');
      });
    },
    // 添加
    handlerEditDiyPage(id, type) {
      const { href } = this.$router.resolve({
        path: `/page/design/creatDevise/${id}/${type}`,
      });
      window.open(href);
    },
    getList(num) {
      this.listLoading = true;
      this.tableForm.page = num ? num : this.tableForm.page;
      this.tableForm.name = encodeURIComponent(this.name);
      pagediyListApi(this.tableForm)
        .then((res) => {
          this.listLoading = false;
          this.tableData.data = res.list;
          this.tableData.total = res.total;
        })
        .then((res) => {
          this.listLoading = false;
        });
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure(this.$t('pagediy.deleteTemplateConfirm')).then(() => {
        pagediyDeleteApi({ id: id }).then((res) => {
          this.$message.success(this.$t('product.deleteSuccess'));
          handleDeleteTable(this.tableData.data.length, this.tableForm);
          this.getList();
        });
      });
    },
    handleSizeChange(val) {
      this.tableForm.limit = val;
      this.getList();
    },
    pageChange(val) {
      this.tableForm.page = val;
      this.getList();
    },
  },
};
</script>

<style scoped lang="scss">
.current_home {
  position: relative;
}

.mask {
  position: absolute;
  left: 0;
  width: 100%;
  top: 0;
  height: 100%;
  background-color: transparent;
}

.Qrcode-box {
  width: 100%;
  height: 120px;
}

.Qrcode_img {
  width: 120px;
}

.flex_between {
  margin-left: 60px;
  width: 100%;
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #eeeeee;
  position: relative;
  padding: 20px;

  &:before {
    content: '';
    width: 0px;
    height: 0px;
    border-right: 10px solid #eeeeee;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    position: absolute;
    top: 23px;
    left: -10px;
  }

  &:after {
    content: '';
    width: 0px;
    height: 0px;
    border-right: 9px solid #ffffff;
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    position: absolute;
    top: 24px;
    left: -9px;
  }
}

.title {
  font-size: 20px;
  font-weight: 800;
  color: #303133;
}

.tips {
  font-size: 14px;
  color: #909399;
}

.tab_view {
  width: 200px;
  border-right: 1px solid #eee;
  margin-right: 40px;
  display: flex;
  flex-direction: column;

  .cell_item {
    height: 50px;
    font-size: 14px;
    line-height: 50px;
    text-align: left;
    padding-left: 30px;
    cursor: pointer;
  }
}

.tab_active {
  color: var(--prev-color-primary);
  border-right: 1px solid var(--prev-color-primary);
}

.rightModel {
  width: 100%;
  min-width: 700px;
}

.acea-row {
  flex-wrap: nowrap !important;
}

.model_header {
  width: 350px;
}

.iframe-box {
  width: 350px;
  height: 669px;
  border-radius: 10px;
  border: 1px solid #eee;
}
</style>
