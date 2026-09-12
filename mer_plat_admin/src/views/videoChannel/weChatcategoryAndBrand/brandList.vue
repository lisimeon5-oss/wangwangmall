<template>
  <div>
    <el-card class="box-card" :bordered="false" shadow="never">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" @click.native="submitBrandAudit.visible = true">{{ $t('product.addBrand') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="listLoading"
        :data="tableData.data"
        style="width: 100%"
        size="small"
        row-key="value"
        ref="multipleTable"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="brandId" min-width="70px" :label="$t('videoChannel.brandId')"></el-table-column>
        <el-table-column prop="auditId" min-width="200px" :label="$t('videoChannel.auditOrderId')"></el-table-column>
        <el-table-column prop="license" min-width="150px" :label="$t('videoChannel.businessLicense')">
          <template slot-scope="scope">
            <img v-for="(imgSrc, key) in scope.row.license.split(',')" :key="key" :src="imgSrc" height="80px" />
          </template>
        </el-table-column>
        <el-table-column prop="brandAuditType" min-width="150px" :label="$t('videoChannel.certAuditType')"></el-table-column>
        <el-table-column prop="trademarkType" min-width="150px" :label="$t('videoChannel.trademarkCategory')"></el-table-column>
        <el-table-column prop="brandManagementType" min-width="150px" :label="$t('videoChannel.brandOperationType')"></el-table-column>
        <el-table-column prop="commodityOriginType" min-width="150px" :label="$t('videoChannel.productImportedOrigin')"></el-table-column>
        <el-table-column prop="brandWording" min-width="150px" :label="$t('videoChannel.trademarkBrandWord')"></el-table-column>
        <el-table-column prop="saleAuthorization" min-width="150px" :label="$t('videoChannel.salesAuthorization')"></el-table-column>
        <el-table-column
          prop="trademarkRegistrationCertificate"
          min-width="150px"
          :label="$t('videoChannel.trademarkRegistrationCertificate')"
        ></el-table-column>
        <el-table-column prop="trademarkChangeCertificate" min-width="150px" :label="$t('videoChannel.trademarkChangeCertificate')"></el-table-column>
        <el-table-column prop="trademarkRegistrant" min-width="150px" :label="$t('videoChannel.trademarkRegistrantName')"></el-table-column>
        <el-table-column prop="trademarkRegistrantNu" min-width="150px" :label="$t('videoChannel.trademarkRegNo')"></el-table-column>
        <el-table-column prop="trademarkAuthorizationPeriod" min-width="150px" :label="$t('videoChannel.trademarkValidity')"></el-table-column>
        <el-table-column
          prop="trademarkRegistrationApplication"
          min-width="150px"
          :label="$t('videoChannel.trademarkApplicationNotice')"
        ></el-table-column>
        <el-table-column prop="trademarkApplicant" min-width="150px" :label="$t('videoChannel.trademarkApplicantName')"></el-table-column>
        <el-table-column prop="trademarkApplicationTime" min-width="150px" :label="$t('videoChannel.trademarkApplicationTime')"></el-table-column>
        <!--        中华人民共和国海关进口货物报关单-->
        <el-table-column prop="importedGoodsForm" :label="$t('videoChannel.customsDeclaration')"></el-table-column>
        <!--        审核状态, 0：审核中，1：审核成功，9：审核拒绝-->
        <el-table-column prop="status" fixed="right" :label="$t('product.auditStatus')">
          <template slot-scope="scope">
            <el-tag class="doingTag tag-background" v-if="scope.row.status === 0" type="warning">{{ $t('common.auditing') }}</el-tag>
            <el-tag class="endTag tag-background" v-if="scope.row.status === 1" type="success">{{ $t('common.auditSuccess') }}</el-tag>
            <el-popover
              placement="top-start"
              :title="$t('product.rejectReason')"
              width="200"
              trigger="hover"
              :content="scope.row.rejectReason"
            >
              <el-tag class="notStartTag tag-background" v-if="scope.row.status === 9" slot="reference" type="danger"
                >{{ $t('product.auditRejected') }}</el-tag
              >
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" fixed="right" :label="$t('product.createTime')"></el-table-column>
        <el-table-column :label="$t('common.operate')" fixed="right" width="150">
          <template slot-scope="scope">
            <el-button type="text" v-if="scope.row.status === 0" @click.native="getCatAndBrandResult(scope.row.auditId)"
              >{{ $t('videoChannel.manualUpdate') }}</el-button
            >
            <span v-else> - </span>
          </template>
        </el-table-column>
      </el-table>
      <div class="block mb20">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="tableData.data.limit"
          :current-page="tableFrom.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>
    <el-dialog
      :title="submitBrandAudit.title"
      :visible="submitBrandAudit.visible"
      @close="submitBrandAudit.visible = false"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        :model="submitBrandAudit"
        inline
        :rules="brandSubmitFromRules"
        ref="brandSubmitFromRules"
        label-width="200px"
        size="mini"
      >
        <el-form-item :label="$t('videoChannel.trademarkCategory')" prop="pramData.auditReq.brandInfo.trademarkType">
          <el-select v-model="submitBrandAudit.pramData.auditReq.brandInfo.trademarkType">
            <el-option v-for="item in 45" :key="item" :value="item" :label="$t('videoChannel.stepPrefix') + item + ' ' + $t('videoChannel.categoryUnit')"
              >{{ $t('videoChannel.stepPrefix') }} "{{ item }}" {{ $t('videoChannel.categoryUnit') }}</el-option
            >
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.selectBrandOperationType')">
          <el-select v-model="submitBrandAudit.pramData.auditReq.brandInfo.brandManagementType">
            <el-option value="1" :label="$t('videoChannel.ownBrand')">{{ $t('videoChannel.ownBrand') }}</el-option>
            <el-option value="2" :label="$t('videoChannel.agencyBrand')">{{ $t('videoChannel.agencyBrand') }}</el-option>
            <el-option value="3" :label="$t('videoChannel.noBrand')">{{ $t('videoChannel.noBrand') }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.productImportedOrigin')">
          <el-select v-model="submitBrandAudit.pramData.auditReq.brandInfo.commodityOriginType">
            <el-option value="1" :label="$t('common.yes')">{{ $t('common.yes') }}</el-option>
            <el-option value="2" :label="$t('common.no')">{{ $t('common.no') }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkValidity')">
          <el-date-picker
            v-model="submitBrandAudit.pramData.auditReq.brandInfo.trademarkAuthorizationPeriod"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :placeholder="$t('videoChannel.selectTrademarkValidity')"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkBrandWord')">
          <el-input v-model.trim="submitBrandAudit.pramData.auditReq.brandInfo.brandWording"></el-input>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkApplicationTime')">
          <el-date-picker
            v-model="submitBrandAudit.pramData.auditReq.brandInfo.trademarkApplicationTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :placeholder="$t('videoChannel.selectTrademarkApplicationTime')"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkRegistrantName')">
          <el-input v-model.trim="submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrant"></el-input>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkRegNo')">
          <el-input v-model.trim="submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrantNu"></el-input>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.certAuditType')">
          <el-select v-model="submitBrandAudit.pramData.auditReq.brandInfo.brandAuditType">
            <el-option value="1" :label="$t('videoChannel.domesticBrandR')"></el-option>
            <el-option value="2" :label="$t('videoChannel.domesticBrandTM')"></el-option>
            <el-option value="3" :label="$t('videoChannel.overseasBrandR')"></el-option>
            <el-option value="4" :label="$t('videoChannel.overseasBrandTM')"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkApplicantName')">
          <el-input v-model.trim="submitBrandAudit.pramData.auditReq.brandInfo.trademarkApplicant"></el-input>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.businessLicense')" prop="pramData.auditReq.license">
          <div class="upLoadPicBox" @click="modalPicTap(false, '1')">
            <div v-if="submitBrandAudit.pramData.auditReq.license" class="pictrue">
              <img :src="submitBrandAudit.pramData.auditReq.license" />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.salesAuthorizationTip')">
          <span class="upLoadPicBox" @click="modalPicTap(true, '2')">
            <div v-if="submitBrandAudit.pramData.auditReq.brandInfo.saleAuthorizationArr.length > 0" class="pictrue">
              <img
                v-for="imgSrc in submitBrandAudit.pramData.auditReq.brandInfo.saleAuthorizationArr"
                :key="imgSrc"
                :src="imgSrc"
              />
            </div>
            <div v-if="submitBrandAudit.pramData.auditReq.brandInfo.saleAuthorizationArr.length <= 10" class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </span>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkRegistrationCertificate')">
          <div class="upLoadPicBox" @click="modalPicTap(true, '3')">
            <div
              v-if="submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationCertificateArr.length > 0"
              class="pictrue"
            >
              <img
                v-for="imgSrc in submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationCertificateArr"
                :key="imgSrc"
                :src="imgSrc"
              />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkChangeCertificate')">
          <div class="upLoadPicBox" @click="modalPicTap(true, '4')">
            <div
              v-if="submitBrandAudit.pramData.auditReq.brandInfo.trademarkChangeCertificateArr.length > 0"
              class="pictrue"
            >
              <img
                v-for="imgSrc in submitBrandAudit.pramData.auditReq.brandInfo.trademarkChangeCertificateArr"
                :key="imgSrc"
                :src="imgSrc"
              />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.trademarkApplicationNotice')">
          <div class="upLoadPicBox" @click="modalPicTap(true, '5')">
            <div
              v-if="submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationApplicationArr.length > 0"
              class="pictrue"
            >
              <img
                v-for="imgSrc in submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationApplicationArr"
                :key="imgSrc"
                :src="imgSrc"
              />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('videoChannel.customsImportDeclaration')">
          <div class="upLoadPicBox" @click="modalPicTap(true, '6')">
            <div v-if="submitBrandAudit.pramData.auditReq.brandInfo.importedGoodsFormArr.length > 0" class="pictrue">
              <img
                v-for="imgSrc in submitBrandAudit.pramData.auditReq.brandInfo.importedGoodsFormArr"
                :key="imgSrc"
                :src="imgSrc"
              />
            </div>
            <div v-else class="upLoad">
              <i class="el-icon-camera cameraIconfont" />
            </div>
          </div>
        </el-form-item>
        <el-form-item align="right">
          <el-button
            v-hasPermi="['platform:pay:component:shop:brand:audit']"
            type="primary"
            @click.native="handleSubmitBrandAudit('brandSubmitFromRules')"
            >{{ $t('common.submit') }}</el-button
          >
          <el-button @click.native="submitBrandAudit.visible = false">{{ $t('el.messagebox.cancel') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
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
import { brandCatAuditResultApi, brandListApi, shopImgUploadApi, submitBrandAuditApi } from '@/api/videoChannel';
export default {
  name: 'brandList',
  data() {
    return {
      listLoading: false,
      tableData: {
        // 列表数据对象
        data: [],
        total: 0,
      },
      tableFrom: {
        // 列表参数
        page: 1,
        limit: 20,
        brandWording: null, // 类目名称
      },
      submitBrandAudit: {
        title: this.$t('videoChannel.customTradingBrandApplication'),
        visible: false,
        pramData: {
          auditReq: {
            license: null,
            brandInfo: {
              brandAuditType: null, // 认证审核类型 RegisterType，字符类型，最长不超过20
              trademarkType: null, // 商标分类 TrademarkType，字符类型，最长不超过10
              brandManagementType: null, // 选择品牌经营类型 BrandManagementType，字符类型，最长不超过10
              commodityOriginType: null, // 商品产地是否进口不能为空
              brandWording: null, // 商标/品牌词不能为空
              saleAuthorizationArr: [], // String list 销售授权书（如商持人为自然人，还需提供有其签名的身份证正反面扫描件)，图片url/media_id，图片类型，最多不超过10张
              saleAuthorization: null,
              trademarkRegistrationCertificateArr: [], // String list 商标注册证书，图片url/media_id，图片类型，最多不超过1张
              trademarkRegistrationCertificate: null,
              trademarkChangeCertificateArr: [], // String list 商标变更证明，图片url/media_id，图片类型，最多不超过5张
              trademarkChangeCertificate: null,
              trademarkRegistrant: null, // 商标注册人姓名，字符类型，最长不超过100
              trademarkRegistrantNu: null, // 商标注册号/申请号，最长不超过10
              trademarkAuthorizationPeriod: null, // 商标有效期，yyyy-MM-dd HH:mm:ss，字符类型，最长不超过30
              trademarkRegistrationApplicationArr: [], // 商标注册申请受理通知书，图片url/media_id，图片类型，最多不超过1张
              trademarkRegistrationApplication: null,
              trademarkApplicant: null, // 商标申请人姓名，字符类型，最长不超过100
              trademarkApplicationTime: null, // 商标申请时间，yyyy-MM-dd HH:mm:ss，字符类型，最长不超过30
              importedGoodsFormArr: [], // 中华人民共和国海关进口货物报关单，图片url/media_id，图片类型，最多不超过5张
              importedGoodsForm: null,
            },
          },
        },
      },
      brandSubmitFromRules: {
        'pramData.auditReq.brandInfo.trademarkType': [{ required: true, message: this.$t('videoChannel.pleaseSelectTrademarkCategory'), trigger: 'blur' }],
        'pramData.auditReq.license': [
          { required: true, message: this.$t('videoChannel.businessLicenseRequired'), trigger: 'blur' },
        ],
      },
    };
  },
  mounted() {
    this.handleSearch();
  },
  methods: {
    handleSearch() {
      this.tableFrom.page = 1;
      this.tableFrom.limit = 20;
      this.getList(this.tableFrom);
    },
    // 提交品牌审核
    handleSubmitBrandAudit(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.submitBrandAudit.pramData.auditReq.license = (
            await this.getShopImgUpload([this.submitBrandAudit.pramData.auditReq.license], [])
          ).join(',');
          this.submitBrandAudit.pramData.auditReq.brandInfo.saleAuthorization = await this.getShopImgUpload(
            this.submitBrandAudit.pramData.auditReq.brandInfo.saleAuthorizationArr,
            [],
          );
          this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationCertificate =
            await this.getShopImgUpload(
              this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationCertificateArr,
              [],
            );
          this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkChangeCertificate = await this.getShopImgUpload(
            this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkChangeCertificateArr,
            [],
          );
          this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationApplication =
            await this.getShopImgUpload(
              this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationApplicationArr,
              [],
            );
          this.submitBrandAudit.pramData.auditReq.brandInfo.importedGoodsForm = await this.getShopImgUpload(
            this.submitBrandAudit.pramData.auditReq.brandInfo.importedGoodsFormArr,
            [],
          );
          const _pram = JSON.parse(JSON.stringify(this.submitBrandAudit.pramData));
          delete _pram.auditReq.brandInfo.importedGoodsFormArr;
          delete _pram.auditReq.brandInfo.saleAuthorizationArr;
          delete _pram.auditReq.brandInfo.trademarkChangeCertificateArr;
          delete _pram.auditReq.brandInfo.trademarkRegistrationApplicationArr;
          delete _pram.auditReq.brandInfo.trademarkRegistrationCertificateArr;

          submitBrandAuditApi(_pram)
            .then((res) => {
              this.getList(this.tableFrom);
            })
            .finally(() => {
              this.submitBrandAudit.visible = false;
            });
        } else {
          return false;
        }
      });
    },
    getCatAndBrandResult(auditId) {
      brandCatAuditResultApi({ audit_id: auditId })
        .then((res) => {
          this.getList(this.tableFrom);
        })
        .catch((err) => {
          this.$message.error(this.$t('videoChannel.manualSyncAuditFailed') + err);
        })
        .finally(() => {
          this.$message.info(this.$t('videoChannel.manualSyncAuditDone'));
        });
    },
    getList(pram) {
      this.listLoading = true;
      brandListApi(pram)
        .then((res) => {
          this.tableData.data = res.list;
          this.tableData.total = res.total;
          this.listLoading = false;
        })
        .catch((err) => {})
        .finally(() => {
          this.listLoading = false;
        });
    },
    pageChange(page) {
      this.tableFrom.page = page;
      this.getList(this.tableFrom);
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val;
      this.getList(this.tableFrom);
    },
    // 点击商品图
    modalPicTap(multiple, num) {
      let _this = this;
      this.$modalUpload(
        function (img) {
          if (!img) return;
          if (num === '1') {
            // 设置第一个值 营业执照或组织机构证件
            _this.submitBrandAudit.pramData.auditReq.license = img[0].sattDir;
          }
          if (num === '2') {
            // String list 销售授权书（如商持人为自然人，还需提供有其签名的身份证正反面扫描件)，图片url/media_id，图片类型，最多不超过10张
            img.map((item) => {
              _this.submitBrandAudit.pramData.auditReq.brandInfo.saleAuthorizationArr.push(item.sattDir);
            });
          }
          if (num === '3') {
            // String list 商标注册证书，图片url/media_id，图片类型，最多不超过1张
            img.map((item) => {
              _this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationCertificateArr.push(item.sattDir);
            });
          }
          if (num === '4') {
            // String list 商标变更证明，图片url/media_id，图片类型，最多不超过5张
            img.map((item) => {
              _this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkChangeCertificateArr.push(item.sattDir);
            });
          }
          if (num === '5') {
            // 商标注册申请受理通知书，图片url/media_id，图片类型，最多不超过1张
            img.map((item) => {
              _this.submitBrandAudit.pramData.auditReq.brandInfo.trademarkRegistrationApplicationArr.push(item.sattDir);
            });
          }
          if (num === '6') {
            // 中华人民共和国海关进口货物报关单，图片url/media_id，图片类型，最多不超过5张
            img.map((item) => {
              _this.submitBrandAudit.pramData.auditReq.brandInfo.importedGoodsFormArr.push(item.sattDir);
            });
          }
        },
        multiple,
        'payComponent',
      );
    },
    async getShopImgUpload(attrs, arr) {
      for (const key in attrs) {
        let res = await this.getImgData(attrs[key]);
        arr.push(res);
      }
      return arr;
    },
    // 转换当前素材为视频号素材链接
    getImgData(imgUrl) {
      return new Promise((resolve, reject) => {
        shopImgUploadApi({
          imgUrl: imgUrl,
          respType: 1,
          uploadType: 1,
        }).then((res) => {
          resolve(res.img_info.temp_img_url);
        });
      });
    },
  },
};
</script>

<style scoped></style>
