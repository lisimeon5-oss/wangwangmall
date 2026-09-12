<template>
	<view :data-theme="theme" class="seckill ">
		<view class="seckill_activity pad-30 acea-row row-between acea-no-warp" :style="[...bgImage]">
			<view class="" >
				<!-- 中文：底图 czpt.png 原封不动；其它语言盖住中文图标后显示翻译 -->
				<image v-if="!showI18nTitle" class="img" src="../../static/images/czpt.png" mode=""></image>
				<view v-else class="group-logo-title">
					<text class="logo-txt">{{ $t('超值拼团') }}</text>
				</view>
				<view class="acea-row price-box">
					<text class="title">{{$t('拼团价')}}</text>
					<text class="biao">฿</text>
					<text class="price semiBold">{{productInfo.groupPrice}}</text>
					<text class="ot-price text-dec">฿{{productInfo.price}}</text>
				</view>
			</view>
			<view class="acea-row row-column groupFoter">
				<view class="groupNum">{{groupBuyActivityResponse.buyCount}}{{$t('人团')}}</view>
				<view class="status">{{$t('活动进行中')}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import svipPrice from '@/components/svipPrice.vue';
	const app = getApp();
	export default {
		components: {
			svipPrice
		},
		props:['productInfo','groupBuyActivityResponse'],
		data() {
			return {
				urlDomain: this.$Cache.get("imgHost"),
				theme: app.globalData.theme,
				bgColor: {
					'bgColor': '#fff',
					'Color': '',
					'width': '36rpx',
					'timeTxtwidth': '16rpx',
					'isDay': true
				},
			}
		},
		computed: {
			showI18nTitle() {
				const loc = (this.i18nLocale || 'zh-cn').toLowerCase();
				return loc !== 'zh-cn' && loc !== 'zh';
			},
			bgImage() {
				return [
					{
						'background':`url(${this.urlDomain}crmebimage/presets/groupMb.png)`
					},
					{
						'background-size':`cover`
					}
				]
			}
		},
	}
</script>

<style scoped lang="scss">
	.pad-30 {
		padding: 0 30rpx;
	}
	.seckill_activity {
		width: 750rpx;
		height: 303rpx;
		color: #fff;
		padding: 0 30rpx;
		background-size: cover;
		.title,
		.ot-price {
			font-size: 22rpx;
			margin-top: 25rpx;
		}

		.biao {
			font-size: 22rpx;
			margin-top: 25rpx;
		}

		.price {
			font-size: 50rpx;
			margin-right: 8rpx;
			margin-top: 4rpx;
		}

		.groupFoter {
			margin-top: 28rpx;
			text-align: right;
			.groupNum{
				background: #FFFFFF;
				opacity: 0.9;
				font-size: 26rpx;
				color: #E93323;
				text-align: center;
				padding: 6rpx 16rpx;
				border-radius: 50rpx 40rpx 40rpx 0;
			}
			.status{
				margin-top: 20rpx;
				font-size: 26rpx;
			}
		}
		.img{
			width: 150rpx;
			height: 30rpx;
			margin-top: 28rpx;
		}
		.group-logo-title {
			margin-top: 24rpx;
			height: 36rpx;
			display: flex;
			align-items: center;
			max-width: 420rpx;
			.logo-txt {
				color: #FFE14D;
				font-size: 34rpx;
				font-weight: 700;
				line-height: 1.1;
				letter-spacing: 1rpx;
				font-style: italic;
				transform: skewX(-8deg);
				white-space: nowrap;
				text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.25);
			}
		}
		.price-box{
			margin-top: 10rpx;
		}
	}
</style>
