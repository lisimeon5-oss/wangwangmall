<template>
	<view class='my-coupon' :data-theme="theme">
		<view class='header'>
			<view class='nav acea-row'>
				<view class='item' :class='type==0 ? "on": ""' @click="statusClick(0)">
					<view>{{$t('全部')}}</view>
				</view>
				<view class='item' :class='type==3 ? "on": ""' @click="statusClick(3)">
					<view>{{$t('通用')}}</view>
				</view>
				<view class='item' :class='type==4 ? "on": ""' @click="statusClick(4)">
					<view>{{$t('品类')}}</view>
				</view>
				<view class='item' :class='type==2 ? "on": ""' @click="statusClick(2)">
					<view>{{$t('商品')}}</view>
				</view>
				<view class='item' :class='type==5 ? "on": ""' @click="statusClick(5)">
					<view>{{$t('品牌')}}</view>
				</view>
				<view class='item' :class='type==6 ? "on": ""' @click="statusClick(6)">
					<view>{{$t('跨店')}}</view>
				</view>
			</view>
		</view>
		<view class="listBox">
			<view v-for="item in list" :key='item.id'>
				<view class="list acea-row"
					:style="{'background-image': `url(${urlDomain}crmebimage/presets/get_coupon_bg.png)`}">
					<view class="left" @click="goList(item)">
						<view class="left-head acea-row row-middle">
							<view class="couponlogo">{{item.category | couponTypeFilter}}</view>
							<view class="tips">{{item.name || ''}}</view>
						</view>
						<view class="info" v-if="productThumbs(item).length">
							<view class="info-box" v-for="(items,index) in productThumbs(item)" :key='index'>
								<view class="relative">
									<view v-show="items.stock===0" class="sellOut">{{$t('已售罄')}}</view>
									<image v-if="items.image" :src="items.image" mode="aspectFill"></image>
								</view>
								<view class="money" v-if="items.price !== undefined && items.price !== null && items.price !== ''">฿ {{items.price}}</view>
							</view>
						</view>
					</view>
					<view class="right" :style="{'background-image': `url(${rightBg})`}">
						<view class="coupon-stamp" v-if="item.lastTotal === 0 && item.isLimited">{{$t('已领完')}}</view>
						<view class="coupon-stamp" v-else-if="item.isUserReceive">{{$t('已领取')}}</view>
						<view class="right-inner"
							:class="item.lastTotal === 0 && item.isLimited?'text--w111-ccc':'font-color'">
							<view class="price-wrap">
								<view class="price-row">
									<text class='font1'>฿</text>
									<text class='font2'>{{parsePrice(item.money)}}</text>
								</view>
								<view class="font3" v-if="item.minPrice == 0">{{$t('无使用门槛')}}</view>
								<view class="font3" v-else>{{$t('满')}}{{parsePrice(item.minPrice)}}{{$t('铢可用')}}</view>
							</view>
							<view v-if="item.lastTotal === 0 && item.isLimited" class="action-wrap">
								<view class='btn bg-color-hui'>{{$t('已领完')}}</view>
							</view>
							<view v-else class="action-wrap">
								<view class="btn bg-color" v-if="!item.isUserReceive" @click.stop="receiveCoupon(item)">{{$t('立即领取')}}
								</view>
								<view class='btn bg-color' v-if="item.lastTotal > 0 && item.isUserReceive" @click.stop="goList(item)">{{$t('去使用')}}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="loadingicon acea-row row-center-wrapper">
			<text class="loading iconfont icon-jiazai" :hidden="loading == false" style="color:#33;"></text>
		</view>
		<view class="empty-boxs noContent" v-if="!list.length && loaded">
			<emptyPage :title="$t('暂无优惠券可领取哦~')" mTop="13%" :imgSrc="urlDomain + 'crmebimage/presets/noCoupon.png'">
			</emptyPage>
		</view>
	</view>
</template>

<script>
	import {
		getCouponLstApi,
		couponReceiveApi
	} from '@/api/activity.js';
	import emptyPage from '@/components/emptyPage.vue';
	let app = getApp();
	export default {
		components: {
			emptyPage
		},
		data() {
			return {
				type: '',
				urlDomain: this.$Cache.get("imgHost"),
				list: [],
				loading: false,
				loaded: false,
				page: 1,
				limit: 15,
				theme: app.globalData.theme,
			}
		},
		onLoad: function() {
			this.statusClick(0);

		},
		computed: {
			rightBg() {
				let theme = this.$Cache.get('theme');
				switch (theme) {
					case 'theme1':
						return this.urlDomain + 'crmebimage/presets/right_red.png'
						break;
					case 'theme2':
						return this.urlDomain + 'crmebimage/presets/right_orange.png'
						break;
					case 'theme3':
						return this.urlDomain + 'crmebimage/presets/right_green.png'
						break;
					case 'theme4':
						return this.urlDomain + 'crmebimage/presets/right_blue.png'
						break;
					case 'theme5':
						return this.urlDomain + 'crmebimage/presets/right_pink.png'
						break;
					default:
						break;
				}
			},
			gray_bg() {
				return this.urlDomain + 'crmebimage/presets/right_gray.png'
			}
		},
		methods: {
			productThumbs(item) {
				const list = (item && item.productVoList) || [];
				return list.filter(p => p && p.image).slice(0, 3);
			},
			parsePrice(price) {
				if (price >= 100) {
					return parseFloat(price)
				} else {
					return price
				}
			},
			// 领取优惠券
			receiveCoupon(item) {
				let that = this;
				couponReceiveApi(item.id).then(res => {
					item.isUserReceive = true;
					uni.showToast({
						title: this.$t('领取成功'),
						icon: 'none'
					})
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: 'none'
					})
				})
			},
			getList() {
				if (this.loading || this.loaded) return;
				this.loading = true;
				getCouponLstApi({
					category: this.type,
					page: this.page,
					limit: this.limit
				}).then(res => {
					this.list = this.list.concat(res.data.list);
					this.loading = false;
					this.loaded = res.data.list.length != this.limit;
					this.page++;
				})
			},
			//切换类型
			statusClick: function(status) {
				if (status === this.type) return;
				this.loaded = false;
				this.loading = false;
				this.page = 1;
				this.list = [];
				this.type = status;
				this.getList()
			},
			goList(item) {
				uni.navigateTo({
					url: `/pages/goods/coupon_goods_list/index?type=1&userCouponId=${item.id}&money=${item.money}&minPrice=${item.minPrice}&isUserReceive=${item.isUserReceive}`
				})
			}
		},
		onReachBottom: function() {
			this.getList();
		}
	}
</script>

<style lang="scss" scoped>
	::v-deep .sellOut {
		width: 96rpx;
		height: 32rpx;
		line-height: 28rpx;
		font-size: 20rpx;
	}

	.header {
		min-height: 120rpx;
		padding-bottom: 88rpx;
		@include main_bg_color(theme);
		border-bottom-left-radius: 10%;
		border-bottom-right-radius: 10%;

		.nav {
			border-radius: 6rpx;
			padding-top: 16rpx;
			position: fixed;
			width: 100%;
			z-index: 99;
			@include main_bg_color(theme);
			padding-bottom: 8rpx;
			box-sizing: border-box;
			overflow-x: auto;
			flex-wrap: nowrap;

			.item {
				flex: 0 0 auto;
				text-align: center;
				font-size: 24rpx;
				color: #FFFFFF;
				padding: 16rpx 20rpx 14rpx;
				opacity: 0.7;
				line-height: 1.45;
				white-space: nowrap;
			}

			.item.on {
				opacity: 1;
				font-weight: bold;
				border-bottom: 5rpx solid #FFFFFF;
			}
		}
	}

	.listBox {
		margin: -56rpx auto 0 auto;
		padding: 0 24rpx;

		.list {
			width: 100%;
			min-height: 240rpx;
			height: auto;
			overflow: hidden;
			background-size: 100% 100%;
			border-radius: 12rpx;
			margin-bottom: 25rpx;
			align-items: stretch;

			.left {
				flex: 1;
				min-width: 0;
				min-height: 220rpx;
				margin: 16rpx 0 16rpx 16rpx;
				text-align: left;
				padding: 16rpx 12rpx 16rpx 18rpx;
				background-color: #FFFFFF;
				border-radius: 12rpx 0 0 12rpx;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;

				.left-head {
					align-items: flex-start;
				}

				.couponlogo {
					flex-shrink: 0;
					display: inline-block;
					width: auto;
					max-width: 46%;
					height: auto;
					min-height: 32rpx;
					line-height: 1.4;
					border-radius: 16rpx;
					padding: 4rpx 12rpx;
					font-size: 20rpx;
					margin-right: 12rpx;
					font-weight: 400;
					text-align: center;
					word-break: break-word;
					@include main_color(theme);
					@include coupons_border_color(theme);
					@include cate-two-btn(theme);
				}

				.tips {
					flex: 1;
					min-width: 0;
					font-size: 26rpx;
					font-weight: 600;
					color: #282828;
					line-height: 1.4;
					word-break: break-word;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}

				.info {
					margin-top: 16rpx;
					display: flex;
					justify-content: flex-start;
					flex-wrap: nowrap;
					overflow: hidden;

					.info-box {
						margin-right: 16rpx;
						flex-shrink: 0;

						image {
							display: block;
							width: 108rpx;
							height: 108rpx;
							border-radius: 8rpx;
							background: #f5f5f5;
						}

						.money {
							text-align: center;
							font-size: 22rpx;
							font-weight: 400;
							color: #666666;
							margin-top: 4rpx;
							line-height: 1.3;
						}
					}
				}
			}

			.right {
				width: 220rpx;
				flex-shrink: 0;
				min-height: 240rpx;
				background-size: 100% 100%;
				position: relative;
				display: flex;
				align-items: center;

				.coupon-stamp {
					position: absolute;
					right: 8rpx;
					bottom: 56rpx;
					z-index: 2;
					width: 112rpx;
					height: 112rpx;
					border-radius: 50%;
					border: 5rpx solid currentColor;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					text-align: center;
					font-size: 22rpx;
					font-weight: 700;
					line-height: 1.2;
					padding: 8rpx;
					opacity: 0.45;
					transform: rotate(-18deg);
					pointer-events: none;
					word-break: break-word;
					@include main_color(theme);
				}

				.right-inner {
					width: 100%;
					position: relative;
					z-index: 1;
					padding: 20rpx 10rpx 16rpx;
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
				}

				.price-wrap {
					text-align: center;
				}

				.price-row {
					line-height: 1;
					margin-bottom: 8rpx;
				}

				.font1 {
					font-size: 28rpx;
					font-weight: 600;
					margin-right: 2rpx;
				}

				.font2 {
					font-size: 52rpx;
					font-weight: 600;
				}

				.font3 {
					font-size: 22rpx;
					font-weight: 400;
					line-height: 1.4;
					padding: 0 6rpx;
					word-break: break-word;
				}

				.action-wrap {
					width: 100%;
					position: relative;
					margin-top: 12rpx;
				}

				.btn {
					width: auto;
					min-width: 132rpx;
					max-width: 92%;
					margin: 0 auto;
					padding: 8rpx 14rpx;
					border-radius: 28rpx;
					font-size: 22rpx;
					font-weight: 400;
					color: #FFFFFF;
					line-height: 1.35;
					text-align: center;
					word-break: break-word;
					box-sizing: border-box;

					&.disabled {
						pointer-events: none;
						background: #ccc;
						color: #fff;
						border-color: #ccc;
						cursor: not-allowed;
					}
				}
			}
		}
	}

	.noCommodity {
		width: 100%;
		margin: -72rpx auto 0 auto;
		padding: 0 30rpx;

		.pictrue {
			width: 100%;
			height: 600rpx;
			background-color: #fff;
			border-radius: 6px;
			margin-bottom: 12px;
			text-align: center;
			color: #999;

			image {
				width: 400rpx;
			}
		}
	}
</style>