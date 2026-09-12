<template>
  <div class="divBox">
    <el-card class="box-card" shadow="never" :bordered="false" :body-style="{ padding: '40px 50px' }">
      <div class="detail-section">
        <div class="detail-title">{{ $t('application.instructions') }}</div>
        <div class="detail-centent">
          {{ $t('application.shippingIntro') }}<br />
          {{ $t('application.miniProgramCond1') }}<br />

          {{ $t('application.miniProgramCond2') }}<br />

          {{ $t('application.miniProgramCond3') }}<br />

          {{ $t('application.miniProgramCond4') }}<br />
          <br />
          {{ $t('application.shippingMenuTip1') }}<el-link :underline="false" type="primary"
            >{{ $t('application.legend') }}<el-image
              class="images"
              :src="require('@/assets/imgs/wxtu.png')"
              :preview-src-list="[require('@/assets/imgs/wxtu.png')]"
            ></el-image></el-link
          >，<span class="textE93323"
            >{{ $t('application.shippingMenuTip3') }}</span
          >{{ $t('application.shippingMenuTip2') }}<br />
          {{ $t('application.expressLogisticsTip') }}<br />
          {{ $t('application.selfPickupTip') }}<br />
          <div class="acea-row">
            {{ $t('application.seeDetailsAt') }}<a
              target="_blank"
              href="https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#一、发货信息录入接口"
              >{{ $t('application.shippingInfoService') }}</a
            >
            <a
              target="_blank"
              href="https://developers.weixin.qq.com/miniprogram/product/jiaoyilei/yunyingguifan.html#_1-2-商品规范"
              >{{ $t('application.tradeMiniProgramSpec') }}</a
            >
          </div>
          <div
            v-hasPermi="['platform:wechat:mini:shipping:switch:update', 'platform:wechat:mini:shipping:switch:get']"
            class="mt20"
          >
            {{ $t('application.shippingConfig') }}<el-switch
              v-model="shippingSwitch"
              active-value="1"
              inactive-value="0"
              class="ml10"
              :active-text="$t('common.open')"
              :inactive-text="$t('common.close')"
              @change="handleStatusChange"
            ></el-switch>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { checkPermi } from '@/utils/permission';
import { Debounce } from '@/utils/validate';
import { wechatGetShippingSwitchApi, wechatUpdateShippingSwitchApi } from '@/api/wxApi'; // 权限判断函数
export default {
  name: 'deliveryManagement',
  data() {
    return {
      delivery: false,
      shippingSwitch: '0',
    };
  },
  mounted() {
    if (checkPermi(['platform:wechat:mini:shipping:switch:get'])) this.getWechatShippingSwitch();
  },
  methods: {
    checkPermi,
    getWechatShippingSwitch() {
      wechatGetShippingSwitchApi().then(async (res) => {
        this.shippingSwitch = res.value;
      });
    },
    //修改状态
    handleStatusChange: Debounce(function () {
      wechatUpdateShippingSwitchApi({ value: this.shippingSwitch }).then((res) => {
        this.$message.success(this.$t('user.updateStatusSuccess'));
        this.getWechatShippingSwitch();
      });
    }),
  },
};
</script>

<style scoped lang="scss">
.images {
  opacity: 0;
  position: absolute;
  width: 54px;
  height: 27px;
  left: 3px;
}
.detail-centent {
  line-height: 30px;
  font-size: 14px;
}
a {
  color: var(--prev-color-primary);
}
</style>
