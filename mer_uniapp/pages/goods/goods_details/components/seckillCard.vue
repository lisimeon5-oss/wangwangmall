<template>
	<view :data-theme="theme">
		<view class="seckill_activity pad-30 acea-row row-between acea-no-warp" :style="bannerStyle">
			<!-- 非中文才叠翻译标题；中文直接用底图原样式 -->
			<view v-if="showI18nTitle" class="seckill-logo-title">
				<text class="iconfont icon-miaosha1"></text>
				<text class="logo-txt">{{ $t('限时秒杀') }}</text>
			</view>
			<view class="acea-row items-baseline">
				<text class="title">{{$t('秒杀价')}}</text>
				<text class="biao">฿</text>
				<text class="price semiBold">{{productPrice.price}}</text>
				<text class="ot-price text-dec">{{productPrice.otPrice}}</text>
			</view>
			<view class="acea-row row-column seckillTime">
				<text class="f-s-24 text-right mb12"
					:class="seckillStatus == 2 ? 'end_title' : 'text-white'">{{seckillStatus === 0? $t('活动已结束') : seckillStatus === 2 || seckillStatus === 3? $t('距活动开始') : $t('距活动结束')}}</text>
				<countDown v-if="seckillStatus > 0" :is-day="true" :tip-text="' '" :day-text="' '" :hour-text="' : '"
					:minute-text="' : '" :second-text="' '" :datatime="seckillTime" :isCol="false" :bgColor="bgColor">
				</countDown>
			</view>
		</view>
	</view>

</template>

<script>
	import svipPrice from '@/components/svipPrice.vue';
	import countDown from "@/components/countDown";
	import {
		mapGetters
	} from "vuex";
	const app = getApp();
	export default {
		computed: {
			...mapGetters(["globalData"]),
			showI18nTitle() {
				const loc = (this.i18nLocale || 'zh-cn').toLowerCase();
				return loc !== 'zh-cn' && loc !== 'zh';
			},
			bannerStyle() {
				const url = require('@/pages/goods/static/images/' + this.theme + '.png');
				const c = this.coverColor;
				if (!this.showI18nTitle) {
					// 中文：完全保持底图原样式，不做任何遮盖
					return {
						backgroundImage: 'url(' + url + ')'
					};
				}
				// 其它语言：盖住底图中文标题 + 左下角黄晕后再画翻译
				return {
					backgroundColor: c,
					backgroundImage: `linear-gradient(${c}, ${c}), linear-gradient(${c}, ${c}), url(${url})`,
					backgroundSize: '48px 55%, 260px 56px, cover',
					backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
					backgroundPosition: 'left bottom, left top, center'
				};
			}
		},
		components: {
			countDown,
			svipPrice
		},
		props: {
			// 0=已结束 1=抢购中 2=即将开始 3=明日预告
			seckillStatus: {
				type: Number,
				default: 0
			},
			productInfo: {
				type: Object,
				default: () => {}
			},
			seckillTime: {
				type: Number,
				default: 0
			},
			//选中的价格
			productPrice: {
				type: Object,
				default: () => {},
			}
		},
		data() {
			const theme = this.$Cache.get("theme") || app.globalData.theme || 'theme1';
			return {
				theme,
				coverColor: this.themeColor(theme),
				bgColor: {
					'bgColor': '#fff',
					'Color': this.themeColor(theme),
					'width': '36rpx',
					'timeTxtwidth': '16rpx',
					'isDay': true
				},
			}
		},
		methods: {
			themeColor(theme) {
				switch (theme) {
					case 'theme2':
						return '#FE5C2D';
					case 'theme3':
						return '#42CA4D';
					case 'theme4':
						return '#1DB0FC';
					case 'theme5':
						return '#FF448F';
					default:
						return '#e93323';
				}
			}
		},
	}
</script>

<style scoped lang="scss">
	.pad-30 {
		padding: 0 30rpx;
	}

	.mb12 {
		margin-bottom: 12rpx;
	}

	.seckill_activity {
		width: 750rpx;
		height: 303rpx;
		color: #fff;
		background-size: cover;
		padding: 0 30rpx;
		position: relative;
		overflow: hidden;

		.seckill-logo-title {
			position: absolute;
			left: 24rpx;
			top: 20rpx;
			z-index: 2;
			display: flex;
			align-items: center;
			max-width: 480rpx;

			.icon-miaosha1 {
				flex-shrink: 0;
				font-size: 40rpx;
				margin-right: 10rpx;
				color: #ffd24a;
				line-height: 1;
			}

			.logo-txt {
				color: #fff;
				font-size: 40rpx;
				font-weight: 700;
				line-height: 1.15;
				letter-spacing: 2rpx;
				white-space: nowrap;
			}
		}

		.title,
		.ot-price {

			font-size: 22rpx;
			margin-top: 96rpx;
		}

		.biao {
			font-size: 22rpx;
			font-weight: 800;
			margin-top: 96rpx;
			margin-left: 6rpx;
		}

		.price {

			font-size: 50rpx;
			margin-top: 72rpx;

			margin-right: 6rpx;
		}

		.seckillTime {
			margin-top: 35rpx;
		}
	}
</style>
