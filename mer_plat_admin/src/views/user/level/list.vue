<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false">
      <el-button type="primary" @click="add" size="small" v-hasPermi="['platform:system:user:level:save']"
        >{{ $t('user.addUserLevel') }}</el-button
      >
      <el-table v-loading="listLoading" :data="tableData.data" size="small" class="mt20">
        <el-table-column prop="grade" :label="$t('user.levelGradeCol')" min-width="100" />
        <el-table-column :label="$t('user.levelIcon')" min-width="80">
          <template slot-scope="scope">
            <div class="demo-image__preview line-heightOne">
              <el-image :src="scope.row.icon" :preview-src-list="[scope.row.icon]" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user.levelNameCol')" min-width="100">
          <template slot-scope="{ row }">
            <span>{{ getLocalizedLevelName(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="experience" :label="$t('user.requiredGrowthCol')" min-width="100" />
        <!-- <el-table-column prop="discount" :label="$t('user.discountEnjoyed')" min-width="100" /> -->
        <el-table-column :label="$t('common.status')" min-width="100" fixed="right">
          <template slot-scope="scope">
            <el-switch
              v-if="checkPermi(['platform:system:user:level:use'])"
              v-model="scope.row.isShow"
              :active-value="true"
              :inactive-value="false"
              :active-text="$t('user.on')"
              :inactive-text="$t('user.off')"
              disabled
              @click.native="onchangeIsShow(scope.row)"
            />
            <div v-else>{{ scope.row.isShow ? $t('user.on') : $t('user.off') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="120" fixed="right">
          <template slot-scope="scope">
            <a @click="handleEdit(scope.row)" v-hasPermi="['platform:system:user:level:update']">{{ $t('common.edit') }}</a>
            <el-divider direction="vertical"></el-divider>
            <a @click="handleDelete(scope.row.id, scope.$index)" v-hasPermi="['platform:system:user:level:delete']"
              >{{ $t('common.delete') }}</a
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <creat-level ref="grades" v-if="userInfo" :userInfo="userInfo" :levelNumData="levelNumData"></creat-level>
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
import { userListApi, groupListApi, levelListApi, levelUseApi, levelDeleteApi } from '@/api/user';
import i18n from '@/i18n';
import creatLevel from './creatLevel';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
import { getLocalizedName } from '@/utils/localizedName';
const obj = {
  name: '',
  nameJson: '',
  grade: 1,
  icon: '',
  backImage: '',
  id: null,
  backColor: '',
  experience: '',
};
export default {
  name: 'Grade',
  filters: {
    typeFilter(status) {
      const statusMap = {
        wechat: i18n.t('user.wechatUser'),
        routine: i18n.t('user.routineUser'),
        h5: i18n.t('user.h5User'),
      };
      return statusMap[status];
    },
  },
  components: { creatLevel },
  data() {
    return {
      listLoading: true,
      userInfo: Object.assign({}, obj),
      tableData: {
        data: [],
        total: 0,
      },
      levelNumData: [],
    };
  },
  computed: {
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
  mounted() {
    if (checkPermi(['platform:system:user:level:list'])) this.getList();
  },
  methods: {
    checkPermi,
    getLocalizedLevelName(row) {
      return getLocalizedName(row, this.currentLocale);
    },
    seachList() {
      this.getList();
    },
    add() {
      this.userInfo = Object.assign({}, obj);
      this.$refs.grades.dialogVisible = true;
    },
    //编辑
    handleEdit(row) {
      this.tableData.data.map((item) => {
        this.levelNumData.push(item.grade);
      });
      this.userInfo = JSON.parse(JSON.stringify(row));
      this.$refs.grades.dialogVisible = true;
    },
    // 列表
    getList() {
      this.listLoading = true;
      this.levelNumData = [];
      levelListApi()
        .then((res) => {
          this.tableData.data = res;
          this.listLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
        });
    },
    // 删除
    handleDelete(id, idx) {
      this.$modalSure(this.$t('user.deleteLevelConfirm')).then(() => {
        levelDeleteApi(id).then(() => {
          this.$message.success(this.$t('user.deleteSuccess'));
          this.tableData.data.splice(idx, 1);
        });
      });
    },
    onchangeIsShow(row) {
      if (row.isShow == false) {
        row.isShow = !row.isShow;
        levelUseApi({ id: row.id, isShow: row.isShow })
          .then(() => {
            this.$message.success(this.$t('user.modifySuccess'));
            this.getList();
          })
          .catch(() => {
            row.isShow = !row.isShow;
          });
      } else {
        this.$modalSure(this.$t('user.hideLevelConfirm')).then(() => {
          row.isShow = !row.isShow;
          levelUseApi({ id: row.id, isShow: row.isShow })
            .then(() => {
              this.$message.success(this.$t('user.modifySuccess'));
              this.getList();
            })
            .catch(() => {
              row.isShow = !row.isShow;
            });
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.el-switch.is-disabled {
  opacity: 1;
}
::v-deep .el-switch__label {
  cursor: pointer !important;
}
</style>
