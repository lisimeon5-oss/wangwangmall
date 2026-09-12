<template>
  <div>
    <transition name="el-zoom-in-center">
      <ul
        class="el-dropdown-menu el-popper el-dropdown-menu--medium custom-contextmenu"
        :style="`top: ${dropdowns.y}px;left: ${dropdowns.x}px;`"
        x-placement="bottom-end"
        id="contextmenu"
        v-show="isShow"
      >
        <li
          class="el-dropdown-menu__item"
          v-for="(v, k) in dropdownList"
          :key="k"
          @click="onCurrentContextmenuClick(v.id)"
        >
          <template v-if="!v.affix">
            <i :class="v.icon"></i>
            <span>{{ v.txt }}</span>
          </template>
        </li>
        <div x-arrow class="popper__arrow" :style="{ left: `${arrowLeft}px` }"></div>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'layoutTagsViewContextmenu',
  props: {
    dropdown: {
      type: Object,
    },
  },
  data() {
    return {
      isShow: false,
      hideClose: false,
      path: {},
      arrowLeft: 5,
    };
  },
  computed: {
    dropdownList() {
      return [
        { id: 0, txt: this.$t('common.refresh'), affix: false, icon: 'el-icon-refresh-right' },
        { id: 1, txt: this.$t('common.close'), affix: this.hideClose, icon: 'el-icon-close' },
        { id: 2, txt: this.$t('common.closeOthers'), affix: false, icon: 'el-icon-circle-close' },
        { id: 3, txt: this.$t('common.closeAll'), affix: false, icon: 'el-icon-folder-delete' },
      ];
    },
    dropdowns() {
      // 99 为 `Dropdown 下拉菜单` 的宽度
      if (this.dropdown.x + 99 > document.documentElement.clientWidth) {
        return {
          x: document.documentElement.clientWidth - 99 - 5,
          y: this.dropdown.y,
        };
      } else {
        return this.dropdown;
      }
    },
  },
  mounted() {
    // 监听页面监听进行右键菜单的关闭
    document.body.addEventListener('click', this.closeContextmenu);
  },
  methods: {
    // 当前项菜单点击
    onCurrentContextmenuClick(id) {
      this.$emit('currentContextmenuClick', { id, path: this.path });
    },
    // 打开右键菜单：判断是否固定，固定则不显示关闭按钮
    openContextmenu(item) {
      this.path = item.path;
      this.hideClose = !!(item.meta && item.meta.isAffix);
      this.closeContextmenu();
      setTimeout(() => {
        this.isShow = true;
      }, 80);
    },
    // 关闭右键菜单
    closeContextmenu() {
      this.isShow = false;
    },
  },
  destroyed() {
    // 页面卸载时，移除右键菜单监听事件
    document.body.removeEventListener('click', this.closeContextmenu);
  },
  // 监听下拉菜单位置
  watch: {
    dropdown: {
      handler({ x }) {
        if (x + 99 > document.documentElement.clientWidth)
          this.arrowLeft = 99 - (document.documentElement.clientWidth - x);
        else this.arrowLeft = 10;
      },
      deep: true,
    },
  },
};
</script>

<style scoped lang="scss">
.custom-contextmenu {
  transform-origin: center top;
  z-index: 2190;
  position: fixed;
  .el-dropdown-menu__item {
    font-size: 12px !important;
    white-space: nowrap;
    i {
      font-size: 12px !important;
    }
  }
}
</style>
