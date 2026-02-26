<template>
  <scroll-view
    :scroll-y="scrollY"
    :scroll-x="scrollX"
    :enhanced="true"
    :show-scrollbar="false"
    :lower-threshold="lowerThreshold"
    :class="['base-scroll-view block relative', scrollViewClass]"
    :style="scrollStyle"
    @scroll="onScroll"
    @scrolltolower="onReachEnd"
  >
    <!-- 1. 空状态区域 -->
    <view
      v-if="isEmpty"
      class="flex flex-col items-center justify-center w-full h-full py-16"
    >
      <slot name="empty">
        <view class="flex flex-col items-center">
          <view
            class="w-[120rpx] h-[120rpx] bg-emerald-50/50 rounded-full flex items-center justify-center mb-6"
          >
            <Order font-size="36" color="#d1d5db" />
          </view>
          <text class="text-sm text-gray-400 font-medium">{{ emptyText }}</text>
        </view>
      </slot>
    </view>

    <!-- 2. 正式内容区域 -->
    <view
      v-else
      class="scroll-content-wrapper"
      :class="[
        scrollX
          ? 'inline-flex min-w-full h-full align-top'
          : 'block w-full min-h-full',
        contentClass,
      ]"
    >
      <slot></slot>

      <!-- 3. 上拉加载状态区 (仅在有状态需要反馈时显示) -->
      <view
        v-if="scrollY && !isEmpty && (loading || finished)"
        class="py-5 flex items-center justify-center gap-3"
      >
        <template v-if="loading">
          <view
            class="w-7 h-7 border-[3rpx] border-solid border-emerald-500 border-t-transparent rounded-full animate-spin"
          ></view>
          <text class="text-[22rpx] text-gray-400 font-medium tracking-wider"
            >正在加载更多...</text
          >
        </template>
        <template v-else-if="finished">
          <text class="text-[22rpx] text-gray-400 font-medium tracking-wider">{{
            finishedText
          }}</text>
        </template>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import { Order } from "@nutui/icons-vue-taro";

interface Props {
  height?: string | number;
  width?: string | number;
  scrollY?: boolean;
  scrollX?: boolean;
  isEmpty?: boolean;
  loading?: boolean;
  finished?: boolean;
  emptyText?: string;
  finishedText?: string;
  lowerThreshold?: number;
  scrollViewClass?: string;
  contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: "100%",
  width: "100%",
  scrollY: true,
  scrollX: false,
  isEmpty: false,
  loading: false,
  finished: false,
  emptyText: "暂无数据",
  finishedText: "— 已经到底啦 —",
  lowerThreshold: 80, // 距离底部 80rpx 触发加载
  scrollViewClass: "",
  contentClass: "",
});

const emit = defineEmits<{
  (e: "scroll", event: any): void;
  (e: "reach-end"): void;
}>();

const formatSize = (size: string | number | undefined | null) => {
  if (size === undefined || size === null || size === "") return "";
  if (typeof size === "number") {
    if (size === 0 || isNaN(size)) return "0px";
    return `${size}rpx`;
  }
  return size;
};

const scrollStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    width: formatSize(props.width),
    boxSizing: "border-box",
    whiteSpace: props.scrollX ? "nowrap" : "normal",
  };

  if (props.scrollY && props.height === "100%") {
    styles.flex = "1";
    styles.minHeight = "0px";
    styles.height = "100%";
  } else {
    styles.height = formatSize(props.height);
  }

  return styles;
});

const onScroll = (e: any) => emit("scroll", e);
const onReachEnd = () => {
  if (props.loading || props.finished || props.isEmpty) return;
  emit("reach-end");
};
</script>

<style lang="scss">
.base-scroll-view {
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    color: transparent;
  }
}
</style>
