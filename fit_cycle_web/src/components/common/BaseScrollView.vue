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
            class="w-[120rpx] h-[120rpx] bg-gray-50 rounded-full flex items-center justify-center mb-6"
          >
            <svg
              class="w-10 h-10 text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </view>
          <text class="text-sm text-gray-400 font-medium">{{ emptyText }}</text>
        </view>
      </slot>
    </view>

    <!-- 2. 正式内容区域 -->
    <view
      v-else
      :class="[
        scrollX
          ? 'inline-flex min-w-full h-full align-top'
          : 'block w-full min-h-full',
        contentClass,
      ]"
    >
      <slot></slot>

      <!-- 3. 上拉加载状态区 (仅纵向滚动且非空时显示) -->
      <view
        v-if="scrollY && !isEmpty"
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

const formatSize = (size: string | number) => {
  if (typeof size === "number") return `${size}rpx`;
  return size;
};

const scrollStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    width: formatSize(props.width),
    boxSizing: "border-box",
    whiteSpace: props.scrollX ? "nowrap" : "normal",
  };

  // 核心修复：如果是纵向滚动且没有显式指定高度，使用 flex:1 确保高度继承
  if (props.scrollY && props.height === "100%") {
    styles.flex = "1";
    styles.minHeight = "0";
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
