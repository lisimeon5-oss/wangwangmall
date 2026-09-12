<template>
  <div>
    <el-form ref="editPram" :rules="rules" :model="editPram" label-width="90px">
      <el-form-item :label="$t('user.relatedUserLabel')" prop="uid">
        <div class="upLoadPicBox" @click="userVisible = true">
          <div v-if="editPram.userAvatar" class="pictrue">
            <img :src="editPram.userAvatar" />
          </div>
          <div v-else class="upLoad">
            <i class="el-icon-camera cameraIconfont" />
          </div>
          <div class="nick">{{ editPram.nickname }}</div>
          <div class="from-tips">{{ $t('user.staffMustFollowStore') }}</div>
        </div>
      </el-form-item>
      <el-form-item :label="$t('user.staffAvatarLabel')" prop="avatar">
        <div class="upLoadPicBox" @click="modalPicTap('1')">
          <div v-if="editPram.avatar" class="pictrue">
            <img :src="editPram.avatar" />
          </div>
          <div v-else class="upLoad">
            <i class="el-icon-camera cameraIconfont" />
          </div>
          <div class="from-tips">{{ $t('user.staffAvatarTip') }}</div>
        </div>
      </el-form-item>
      <el-form-item :label="$t('user.staffNameLabel')" prop="name">
        <el-input v-model="editPram.name" :placeholder="$t('user.pleaseEnterStaffName')" />
      </el-form-item>
      <el-form-item :label="$t('user.phoneLabel')" prop="phone">
        <el-input v-model="editPram.phone" :placeholder="$t('user.pleaseEnterPhone')" />
      </el-form-item>
      <el-form-item :label="$t('user.managementPermissionLabel')" prop="role">
        <el-checkbox-group v-model="editPram.role">
          <el-checkbox label="1">{{ $t('user.orderManagement') }}</el-checkbox>
          <el-checkbox label="2">{{ $t('user.productManagement') }}</el-checkbox>
          <el-checkbox label="3">{{ $t('user.afterSalesManagement') }}</el-checkbox>
          <el-checkbox label="5">{{ $t('user.orderVerification') }}</el-checkbox>
          <el-checkbox label="6">{{ $t('user.salesUserStatistics') }}</el-checkbox>
        </el-checkbox-group>
        <div class="from-tips">{{ $t('user.managementPermissionTip') }}</div>
      </el-form-item>
      <el-form-item :label="$t('user.statusColon')" prop="status">
        <el-switch v-model="editPram.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-inner">
      <el-button @click="handlerClose()">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handlerSubmit('editPram')">{{ $t('common.confirm') }}</el-button>
    </div>
    <!-- 关联用户弹窗 -->
    <el-dialog
      :title="$t('user.relatedUserList')"
      :visible.sync="userVisible"
      width="900px"
      :append-to-body="true"
      :close-on-click-modal="false"
    >
      <userList @getRow="getRow" v-if="userVisible"></userList>
    </el-dialog>
  </div>
</template>

<script>
import userList from '../user/list';
import { employeeAddRole, employeeUpdateRole } from '@/api/staff';
import { validatePhone } from '@/utils/toolsValidate';

export default {
  components: { userList },
  props: ['editData', 'isCreate'],
  data() {
    return {
      selectedRow: null,
      userVisible: false,
      editPram: {
        avatar: null,
        name: null,
        uid: null,
        phone: null,
        status: false,
        role: [],
        id: null,
        nickname: null,
        userAvatar: null,
      },
      rules: {
        avatar: [{ required: true, message: this.$t('user.pleaseSetAvatar'), trigger: 'change' }],
        role: [{ required: true, message: this.$t('user.pleaseSetManagementPermission'), trigger: 'change' }],
        uid: [{ required: true, message: this.$t('user.pleaseRelateUser'), trigger: 'change' }],
        name: [{ required: true, message: this.$t('user.pleaseEnterName'), trigger: 'change' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
      },
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      if (this.isCreate == 1) {
        for (const key in this.editData) {
          this.editPram[key] = this.editData[key];
        }
        this.editPram.role = this.editPram.role.split(',');
      }
    },
    close() {
      this.userVisible = false;
    },
    getUser() {
      this.editPram.userAvatar = this.selectedRow.avatar;
      this.editPram.uid = this.selectedRow.id;
      this.editPram.nickname = this.selectedRow.nickname;
      this.userVisible = false;
    },
    getRow(row) {
      this.selectedRow = row;
      this.getUser();
    },
    //取消
    handlerClose() {
      this.$emit('hideEditDialog', 0);
    },
    //表单确认
    handlerSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let pram = { ...this.editPram };
        pram.role = pram.role.join(',');
        pram.status = pram.status ? 1 : 0;
        pram.uid = +pram.uid;
        if (this.isCreate == 0) {
          employeeAddRole(pram).then((res) => {
            this.$emit('hideEditDialog', 1, 0);
          });
        } else {
          employeeUpdateRole(pram).then((res) => {
            this.$emit('hideEditDialog', 1, 1);
          });
        }
      });
    },
    //点击头像
    modalPicTap(tit, num, i) {
      const _this = this;
      const attr = [];
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (tit === '1' && !num) {
            _this.editPram.avatar = img[0].sattDir;
          }
          if (tit === '2' && !num) {
            img.map((item) => {
              attr.push(item.attachment_src);
              _this.formValidate.slider_image.push(item);
            });
          }
        },
        tit,
        'store',
      );
    },
  },
};
</script>

<style scoped lang="scss">
.upLoadPicBox {
  position: relative;
  .nick {
    width: 100%;
    position: absolute;
    left: 70px;
    top: 15px;
  }
}
::v-deep .el-dialog__title {
  font-weight: 600 !important;
}
::v-deep .el-dialog__body {
  padding-top: 20px !important;
}
::v-deep .el-card__body {
  padding: 0 0 20px !important;
}
</style>
