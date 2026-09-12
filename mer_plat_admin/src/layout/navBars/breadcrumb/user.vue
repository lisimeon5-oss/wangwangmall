<template>
  <div class="layout-navbars-breadcrumb-user" :style="{ flex: layoutUserFlexNum }">
    <div class="layout-navbars-breadcrumb-user-icon" @click="refresh">
      <i class="el-icon-refresh-right" :title="$t('layout.refresh')"></i>
    </div>
    <div class="layout-navbars-breadcrumb-user-icon" @click="onSearchClick">
      <i class="el-icon-search" :title="$t('layout.menuSearch')"></i>
    </div>

    <!-- <div class="layout-navbars-breadcrumb-user-icon">
      <el-dropdown trigger="click" :hide-on-click="true" placement="top" @visible-change="getTodoList">
        <span class="item">
          <i class="el-icon-bell"></i>
          <i v-if="dealtList.length > 0" class="icon-tip"></i>
        </span>
        <el-dropdown-menu slot="dropdown" class="noticedrop">
          <el-dropdown-item class="clearfix">
            <el-tabs>
              <el-card v-if="dealtList.length > 0" class="box-card">
                <div slot="header" class="clearfix">
                  <span>系统通知</span>
                </div>
                <router-link
                  v-for="(item, i) in dealtList"
                  :key="i"
                  class="text item_content"
                  :to="{ path: item.path }"
                >
                  <div class="title">{{ item.title }}</div>
                  <div class="message">{{ item.message }}</div>
                </router-link>
                <div
                  v-if="list.length > 3 && list.length != dealtList.length"
                  class="moreBtn"
                  @click.stop="dealtList = list"
                >
                  展开全部<span class="el-icon-arrow-down"></span>
                </div>
              </el-card>
              <el-card v-else class="box-card">
                <div slot="header" class="clearfix">
                  <span>系统通知</span>
                </div>
                <div class="tab-empty">
                  <img src="@/assets/images/no-message.png" class="empty-img" alt="" />
                  <div class="empty-text">暂无系统通知</div>
                </div>
              </el-card>
            </el-tabs>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div> -->
    <div class="layout-navbars-breadcrumb-user-icon" @click="onScreenfullClick">
      <i
        :title="isScreenfull ? $t('layout.closeFullScreen') : $t('layout.openFullScreen')"
        :class="!isScreenfull ? 'el-icon-full-screen' : 'el-icon-crop'"
      ></i>
    </div>
    <el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
      <div class="layout-navbars-breadcrumb-user-icon">
        <i class="el-icon-guide" :title="$t('common.language')"></i>
        <span class="i18n-label">{{ currentLangLabel }}</span>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="item in langList"
          :key="item.value"
          :command="item.value"
          :disabled="disabledI18n === item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="layout-navbars-breadcrumb-user-icon">
      <div class="platformLabel">{{ $t('layout.platform') }}</div>
    </div>
    <el-dropdown :show-timeout="70" :hide-timeout="50" @command="onDropdownCommand">
      <span class="layout-navbars-breadcrumb-user-link">
        {{ getUserInfos.name }}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="users">{{ $t('layout.personalCenter') }}</el-dropdown-item>
        <el-dropdown-item command="password">{{ $t('layout.changePassword') }}</el-dropdown-item>
        <el-dropdown-item divided command="logOut">{{ $t('layout.logout') }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="layout-navbars-breadcrumb-user-icon" @click="onLayoutSetingClick">
      <i class="el-icon-setting" :title="$t('layout.layoutConfig')"></i>
    </div>
    <Search ref="searchRef" />
  </div>
</template>

<script>
import screenfull from 'screenfull';
import { Session, Local } from '@/utils/storage.js';
import UserNews from '@/layout/navBars/breadcrumb/userNews.vue';
import Search from '@/layout/navBars/breadcrumb/search.vue';
import Cookies from 'js-cookie';
// todo 消息
import { editFormApi } from '@/api/user';
import { systemLanguageList } from '@/api/systemLanguage';
import { defaultLangList } from '@/i18n/defaultLangList';
import getPageTitle from '@/utils/get-page-title';
export default {
  name: 'layoutBreadcrumbUser',
  components: { UserNews, Search },
  data() {
    return {
      isScreenfull: false,
      isShowUserNewsPopover: true,
      disabledI18n: 'zh-cn',
      disabledSize: '',
      langList: defaultLangList,
      isDot: false,
      label: {
        mer_name: 'admin',
      },
      list: [],
      dealtList: [],
    };
  },
  computed: {
    // 获取用户信息
    getUserInfos() {
      return this.$store.state.user;
    },
    // 当前语言显示名称
    currentLangLabel() {
      const item = this.langList.find((i) => i.value === this.disabledI18n);
      return item ? item.label : defaultLangList[0].label;
    },
    // 设置弹性盒子布局 flex
    layoutUserFlexNum() {
      let { layout, isClassicSplitMenu } = this.$store.state.themeConfig.themeConfig;
      let num = '';
      if (layout === 'defaults' || (layout === 'classic' && !isClassicSplitMenu) || layout === 'columns') num = 1;
      else num = null;
      return num;
    },
  },
  mounted() {
    this.getLanguageList();
    if (Local.get('JavaPlatThemeConfigPrev')) {
      this.initI18n();
      this.initComponentSize();
    }
  },
  methods: {
    initIsDot(status) {
      this.isDot = status;
    },
    openNews() {
      // this.isShowUserNewsPopover = !this.isShowUserNewsPopover;
      this.isDot = false;
    },
    // 搜索点击
    onSearchClick() {
      this.$refs.searchRef.openSearch();
    },
    // 布局配置点击
    onLayoutSetingClick() {
      this.bus.$emit('openSetingsDrawer');
    },
    refresh() {
      this.bus.$emit('onTagsViewRefreshRouterView', this.$route.path);
    },
    // 全屏点击
    onScreenfullClick() {
      if (!screenfull.isEnabled) {
        this.$message.warning(this.$t('layout.fullscreenUnsupported'));
        return false;
      }
      screenfull.toggle();
      screenfull.on('change', () => {
        if (screenfull.isFullscreen) this.isScreenfull = true;
        else this.isScreenfull = false;
      });
      // 监听菜单 horizontal.vue 滚动条高度更新
      this.bus.$emit('updateElScrollBar');
    },
    // 初始化全局组件大小
    initComponentSize() {
      switch (Local.get('JavaPlatThemeConfigPrev').globalComponentSize) {
        case '':
          this.disabledSize = '';
          break;
        case 'medium':
          this.disabledSize = 'medium';
          break;
        case 'small':
          this.disabledSize = 'small';
          break;
        case 'mini':
          this.disabledSize = 'mini';
          break;
      }
    },
    // 获取启用的语言列表
    getLanguageList() {
      systemLanguageList()
        .then((list) => {
          if (!list || list.length === 0) {
            return;
          }
          this.langList = list.map((item) => ({
            label: item.name,
            value: item.code,
          }));
        })
        .catch(() => {
          // 接口失败时保留默认语言列表
        });
    },
    // 语言切换
    onLanguageChange(lang) {
      Local.remove('JavaPlatThemeConfigPrev');
      this.$store.state.themeConfig.themeConfig.globalI18n = lang;
      Local.set('JavaPlatThemeConfigPrev', this.$store.state.themeConfig.themeConfig);
      this.$i18n.locale = lang;
      this.initI18n();
      document.title = getPageTitle(this.$route.meta.title);
      // 重新拉取菜单，使菜单标题随语言切换（后端按 lang 返回多语言标题）
      // 拉取完成后广播 routesListChange，让侧栏/面包屑等布局组件重新过滤渲染，避免必须刷新页面才生效
      this.$store.dispatch('user/getMenus').then(() => {
        this.$store.commit('menu/syncTagTitlesFromMenus', this.$store.state.user);
        this.bus.$emit('routesListChange');
      });
      this.$store.dispatch('product/getAdminProductClassify');
      this.$store.dispatch('merchant/getMerchantClassify');
      this.$store.dispatch('merchant/getMerchantType');
    },
    // 初始化言语国际化
    initI18n() {
      const prev = Local.get('JavaPlatThemeConfigPrev');
      if (prev && prev.globalI18n) {
        this.disabledI18n = prev.globalI18n;
      }
    },
    // `dropdown 下拉菜单` 当前项点击
    onDropdownCommand(path) {
      if (path === 'logOut') {
        setTimeout(() => {
          this.$msgbox({
            closeOnClickModal: false,
            closeOnPressEscape: false,
            title: this.$t('common.tip'),
            message: this.$t('layout.logoutConfirm'),
            showCancelButton: true,
            confirmButtonText: this.$t('common.confirm'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning',
            beforeClose: async (action, instance, done) => {
              if (action === 'confirm') {
                instance.confirmButtonLoading = true;
                instance.confirmButtonText = this.$t('layout.loggingOut');
                setTimeout(async () => {
                  await this.$store.dispatch('user/handleLogout');
                  this.$router.push(`/login?redirect=${this.$route.fullPath}`);
                  done();
                }, 150);
              } else {
                done();
              }
            },
          })
            .then(() => {
              // 清除缓存/token等
              Session.clear();
              // 使用 reload 时，不需要调用 resetRoute() 重置路由
              window.location.reload();
            })
            .catch(() => {});
        }, 150);
      } else {
        this.$router.push(`/operation/maintain/user/${path}`);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &-link {
    height: 100%;
    display: flex;
    align-items: center;
    white-space: nowrap;

    &-photo {
      width: 30px;
      height: 30px;
      border-radius: 100%;
    }
  }

  i {
    line-height: 50px;
  }

  &-icon {
    padding: 0 10px;
    cursor: pointer;
    color: var(--prev-bg-topBarColor);
    line-height: 50px;
    display: flex;
    align-items: center;

    &:hover {
      background: var(--prev-color-hover);

      i {
        display: inline-block;
        animation: logoAnimation 0.3s ease-in-out;
      }
    }

    .item {
      position: relative;
    }

    .icon-tip {
      position: absolute;
      background: #f56464;
      width: 6px;
      height: 6px;
      border-radius: 100%;
      top: -1px;
      right: 0px;
    }

    .el-icon-bell {
      font-size: 15px;
      color: var(--prev-bg-topBarColor);
    }
  }

  & ::v-deep .el-dropdown {
    color: var(--prev-bg-topBarColor);
    cursor: pointer;
  }

  & ::v-deep .el-badge {
    height: 40px;
    line-height: 40px;
    display: flex;
    align-items: center;
  }

  & ::v-deep .el-badge__content.is-fixed {
    top: 12px;
  }
}

.i18n-label {
  margin-left: 4px;
  font-size: 12px;
}

.platformLabel {
  display: inline-block;
  background: var(--prev-color-primary);
  color: #fff;
  vertical-align: text-bottom;
  font-size: 12px;
  padding: 0 8px;
  height: 26px;
  line-height: 26px;
  border-radius: 10px;
  position: relative;
  width: 40px;
}

.noticedrop {
  padding: 0;
}

.noticedrop .el-dropdown-menu {
  padding: 0;
}

.noticedrop .el-dropdown-menu__item {
  background-color: #ffffff;
  padding: 0;
  border-radius: 6px;
}

.item_content {
  display: inline-block;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 10px;
  line-height: 20px;
  font-size: 13px;
}

.item_content .title {
  color: #333333;
  font-weight: bold;
}

.item_content .message {
  color: #666666;
}

.moreBtn {
  color: #666666;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
}

::v-deep .el-card__body {
  padding: 0 24px 10px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}

.clearfix:after {
  clear: both;
}

.box-card {
  width: 240px;
}

::v-deep .el-tabs__header {
  margin: 0;
}

::v-deep .el-card__header {
  padding: 10px 24px 0;
  font-weight: bold;
  border: none;
}

.tab-empty {
  text-align: center;
  margin-top: 15px;
}

.empty-text {
  color: #999999;
  font-size: 12px;
}

.empty-img {
  display: inline-block;
  width: 160px;
  height: 123px;
}
</style>
