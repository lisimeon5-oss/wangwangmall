<template>
	<view class="refund-type-icon" :class="'refund-type-icon--' + size">
		<text v-if="kind === 'money'" class="refund-type-icon__sym">฿</text>
		<view v-else class="refund-type-icon__pkg">
			<view class="refund-type-icon__lid"></view>
		</view>
		<view class="refund-type-icon__badge"></view>
	</view>
</template>
<script>
	export default {
		name: 'RefundTypeIcon',
		props: {
			kind: {
				type: String,
				default: 'money'
			},
			size: {
				type: String,
				default: 'md'
			}
		}
	}
</script>
<style scoped lang="scss">
	.refund-type-icon {
		position: relative;
		box-sizing: border-box;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3rpx solid currentColor;
		border-radius: 50%;
	}

	.refund-type-icon--md {
		width: 44rpx;
		height: 44rpx;
	}

	.refund-type-icon--sm {
		width: 32rpx;
		height: 32rpx;
		border-width: 2rpx;
	}

	.refund-type-icon__sym {
		font-size: 24rpx;
		font-weight: 700;
		line-height: 1;
		font-family: Arial, "Noto Sans Thai", sans-serif;
	}

	.refund-type-icon--sm .refund-type-icon__sym {
		font-size: 18rpx;
	}

	.refund-type-icon__pkg {
		width: 16rpx;
		height: 12rpx;
		border: 2rpx solid currentColor;
		border-radius: 2rpx;
		position: relative;
		box-sizing: border-box;
	}

	.refund-type-icon--sm .refund-type-icon__pkg {
		width: 12rpx;
		height: 10rpx;
		border-width: 2rpx;
	}

	.refund-type-icon__lid {
		position: absolute;
		top: -6rpx;
		left: 50%;
		width: 10rpx;
		height: 5rpx;
		border: 2rpx solid currentColor;
		border-bottom: 0;
		border-radius: 2rpx 2rpx 0 0;
		transform: translateX(-50%);
		box-sizing: border-box;
	}

	.refund-type-icon--sm .refund-type-icon__lid {
		top: -5rpx;
		width: 8rpx;
		height: 4rpx;
	}

	.refund-type-icon__badge {
		position: absolute;
		top: -4rpx;
		right: -6rpx;
		width: 16rpx;
		height: 16rpx;
		border: 2rpx solid currentColor;
		border-radius: 50%;
		background: #fff;
		box-sizing: border-box;
	}

	.refund-type-icon__badge::after {
		content: '';
		position: absolute;
		top: 3rpx;
		left: 2rpx;
		width: 6rpx;
		height: 6rpx;
		border-top: 2rpx solid currentColor;
		border-left: 2rpx solid currentColor;
		transform: rotate(-45deg);
	}

	.refund-type-icon--sm .refund-type-icon__badge {
		width: 12rpx;
		height: 12rpx;
		top: -3rpx;
		right: -4rpx;
	}

	.refund-type-icon--sm .refund-type-icon__badge::after {
		top: 2rpx;
		left: 1rpx;
		width: 4rpx;
		height: 4rpx;
	}
</style>
