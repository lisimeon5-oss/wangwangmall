<template>
  <div class="divBox">
    <el-card class="box-card" :bordered="false" shadow="never">
      <div slot="header" class="clearfix">{{ $t('videoChannel.accessVideoChannelSteps') }}</div>
      <div class="mb20">
        <h1 v-if="toRegister.errcode === 1040002">{{ $t('videoChannel.alreadyAccessCustomTrading') }}</h1>
        <h1 v-else>{{ $t('videoChannel.accessing') }}{{ toRegister }}</h1>
      </div>
      <el-timeline>
        <el-timeline-item :timestamp="$t('videoChannel.createVideoChannel')" placement="top">
          <el-card shadow="never" :bordered="false">
            <el-form inline>
              <el-form-item>
                <p>{{ $t('videoChannel.wechatSetupTip') }}</p>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click.native="">{{ $t('videoChannel.goApply') }}</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-timeline-item>
        <el-timeline-item :timestamp="$t('videoChannel.applyCustomTradingComponent')" placement="top">
          <el-card :bordered="false" shadow="never">
            <el-form inline>
              <el-form-item>
                <p>
                  {{ $t('videoChannel.customTradingComponentTip') }}
                </p>
              </el-form-item>
              <el-form-item v-hasPermi="['platform:pay:component:shop:register:finish']">
                <el-button type="primary" @click.native="handleRegisterCheck()">{{ $t('common.finish') }}</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-timeline-item>
        <el-timeline-item :timestamp="$t('videoChannel.customTradingApprovedSceneTest')" placement="top">
          <el-card :bordered="false" shadow="never">
            <el-form>
              <el-form-item>
                <p>
                  {{ $t('videoChannel.customTradingVersionTip') }}
                </p>
                <router-link to="/marketing/videoChannel/draftList">
                  <el-tag type="warning">{{ $t('videoChannel.auditVideoChannelProductsTip') }}</el-tag>
                </router-link>
              </el-form-item>
              <el-form-item>
                <el-form>
                  <el-form-item>
                    <span
                      >{{ $t('videoChannel.accessScene') }}
                      {{ registerCheckData.data.scene_group_list[0].group_id === 1 ? $t('product.videoProduct') : $t('videoChannel.officialAccountScene') }}</span
                    >
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.sceneNameLabel') }} {{ registerCheckData.data.scene_group_list[0].name }}</span>
                  </el-form-item>
                  <el-form-item>
                    <span
                      >{{ $t('product.auditStatus') }}
                      <span v-if="registerCheckData.data.scene_group_list[0].status === 0">{{ $t('common.auditing') }}</span>
                      <span v-if="registerCheckData.data.scene_group_list[0].status === 1">{{ $t('videoChannel.auditCompleted') }}</span>
                      <span v-if="registerCheckData.data.scene_group_list[0].status === 2">{{ $t('common.auditFailed') }}</span>
                    </span>
                  </el-form-item>
                  <el-form-item>
                    <span
                      >{{ $t('videoChannel.sceneAuditResult') }}
                      <span
                        v-for="(item, key) in registerCheckData.data.scene_group_list[0].scene_group_ext_list"
                        :key="key"
                      >
                        <span v-if="item.ext_id === 1">{{ $t('videoChannel.customerServiceAfterSales') }} -》</span>
                        <span v-if="item.ext_id === 2">{{ $t('videoChannel.ecommercePlatform') }} -》</span>
                        <el-tag>
                          <span v-if="item.status === 0">{{ $t('common.auditing') }}</span>
                          <span v-if="item.status === 1">{{ $t('common.auditSuccess') }}</span>
                          <span v-if="item.status === 2">{{ $t('common.auditFailed') }}</span>
                          <span v-if="item.status === 3">{{ $t('product.notAudited') }}</span>
                        </el-tag>
                      </span>
                    </span>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.auditReasonLabel') }} {{ registerCheckData.data.scene_group_list[0].reason }}</span>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.uploadProductAuditSuccess') }} </span>
                    <el-tag>{{
                      registerCheckData.data.access_info.spu_audit_success === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.productApiDebugDone') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.spu_audit_finished === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.initiateOrderPaySuccess') }}</span>
                    <el-tag>{{ registerCheckData.data.access_info.ec_order_success === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success') }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.orderApiDebugDone') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.ec_order_finished === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.logisticsApiCallSuccess') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.send_delivery_success === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.logisticsApiDebugDone') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.send_delivery_finished === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.afterSalesApiCallSuccess') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.ec_after_sale_success === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.afterSalesApiDebugDone') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.ec_after_sale_finished === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.testCompleted') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.test_api_finished === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                  <el-form-item>
                    <span>{{ $t('videoChannel.releaseDone') }}</span>
                    <el-tag>{{
                      registerCheckData.data.access_info.deploy_wxa_finished === 0 ? $t('videoChannel.notSuccess') : $t('onePass.success')
                    }}</el-tag>
                  </el-form-item>
                </el-form>
              </el-form-item>
            </el-form>
          </el-card>
        </el-timeline-item>
        <el-timeline-item :timestamp="$t('videoChannel.customTradingActivated')" placement="top"> </el-timeline-item>
      </el-timeline>
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
// 开通视频号步骤页面
import { videoChanelRegisterApply, registerCheck } from '@/api/videoChannel';
import { checkPermi } from '@/utils/permission'; // 权限判断函数
export default {
  name: 'index',
  data() {
    return {
      // 申请接入
      toRegister: {
        errcode: 0, // 1040002 已经接入
        errmsg: '',
      },
      // 接入状态检查
      registerCheckData: {
        errcode: 0,
        errmsg: null,
        data: {
          status: 2,
          reject_reason: '',
          access_info: {
            spu_audit_success: 0, // 上传商品并审核成功，0:未成功，1:成功
            spu_audit_finished: 0, // 商品接口调试完成，0:未完成，1:已完成
            ec_order_success: 0, // 发起一笔订单并支付成功，0:未成功，1:成功
            ec_order_finished: 0, // 订单接口调试完成，0:未完成，1:已完成
            send_delivery_finished: 0, // 物流接口调试完成，0:未完成，1:已完成
            send_delivery_success: 0, // 物流接口调用成功，0:未成功，1:成功
            ec_after_sale_finished: 0, // 售后接口调试完成，0:未完成，1:已完成
            ec_after_sale_success: 0, // 售后接口调用成功，0:未成功，1:成功
            test_api_finished: 0, // 测试完成，0:未完成，1:已完成
            deploy_wxa_finished: 0, // 发版完成，0:未完成，1:已完成
            open_product_task_finished: 0, // 完成自定义组件全部任务 0:未完成 1:已完成
          },
          scene_group_list: [
            {
              group_id: 1, // 场景枚举，1:视频号、公众号场景
              reason: '', // 审核理由
              name: '', // 场景名称
              status: 0, // 审核状态，0:审核中，1:审核完成，2:审核失败，3未审核
              scene_group_ext_list: [
                // 场景相关审核结果
                {
                  ext_id: 1, // 审核事项id，1:客服售后，2:电商平台
                  status: 1, // 场景相关审核结果，0:审核中，1:审核成功，2:审核失败，3未审核
                },
              ],
            },
          ],
        },
      },
    };
  },
  created() {
    if (checkPermi(['platform:pay:component:shop:register:scene', 'platform:pay:component:shop:register']))
      this.registerApply();
    if (checkPermi(['platform:pay:component:shop:register:check'])) this.handleRegisterCheck();
  },
  methods: {
    checkPermi,
    // 申请接入 如果多次接入及时关闭再次开启 这个状态检查有可能直接 开通
    registerApply() {
      videoChanelRegisterApply().then((res) => {
        this.toRegister = res;
      });
    },
    // 接入状态检查
    handleRegisterCheck() {
      registerCheck()
        .then((res) => {
          this.registerCheckData = res;
        })
        .finally(() => {
          this.$message.success(this.$t('videoChannel.checkAccessStatusUpdated'));
        });
    },
  },
};
</script>

<style scoped></style>
