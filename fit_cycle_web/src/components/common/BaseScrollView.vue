<template>
  <scroll-view
    :scroll-y="scrollY"
    :scroll-x="scrollX"
    :enhanced="enhanced"
    :show-scrollbar="showScrollbar"
    :class="['relative', !width && 'w-full', scrollViewClass]"
    :style="scrollStyle"
    :refresher-enabled="refresherEnabled"
    :refresher-triggered="refresherTriggered"
    :refresher-threshold="refresherThreshold"
    :refresher-default-style="refresherDefaultStyle"
    :refresher-background="refresherBackground"
    @scroll="onScroll"
    @scrolltolower="onScrollToLower"
    @scrolltoupper="onScrollToUpper"
    @refresherrefresh="onRefresh"
    @refresherrestore="onRestore"
    @refresherabort="onAbort"
  >
    <!-- 空状态 -->
    <view v-if="isEmpty" class="flex flex-col items-center justify-center py-20">
      <slot name="empty">
        <view class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </view>
        <text class="text-gray-400 text-sm">{{ emptyText }}</text>
      </slot>
    </view>

    <!-- 正常列表内容 -->
    <view v-else :class="[scrollX && 'inline-block min-w-full', contentClass]">
      <slot></slot>
      
      <!-- 加载更多 / 已完成状态 -->
      <view v-if="showFooter" :class="['py-4 flex justify-center items-center', scrollX && 'inline-flex px-4']">
        <slot name="footer">
          <view v-if="loading" class="flex items-center space-x-2">
            <view class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></view>
            <text class="text-xs text-gray-400">{{ loadingText }}</text>
          </view>
          <text v-else-if="finished" class="text-xs text-gray-300">{{ finishedText }}</text>
        </slot>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

interface Props {
  /**
   * 滚动区域高度
   * 支持数字 (自动转为 rpx) 或 字符串 (如 '100vh', '500rpx')
   */
  height?: string | number;
  /**
   * 滚动区域宽度
   * 支持数字 (自动转为 rpx) 或 字符串 (如 '100%', '750rpx')
   */
  width?: string | number;
  /** 是否允许纵向滚动 */
  scrollY?: boolean;
  /** 是否允许横向滚动 */
  scrollX?: boolean;
  /** 容器类名 */
  scrollViewClass?: string;
  /** 内容区类名 */
  contentClass?: string;
  /** 是否启用增强特性 */
  enhanced?: boolean;
  /** 是否显示滚动条 */
  showScrollbar?: boolean;
  
  // 空状态相关
  /** 是否为空状态 */
  isEmpty?: boolean;
  /** 空状态提示文本 */
  emptyText?: string;
  
  // 加载更多相关
  /** 是否正在加载更多 */
  loading?: boolean;
  /** 是否已加载完所有数据 */
  finished?: boolean;
  /** 加载中提示文本 */
  loadingText?: string;
  /** 加载完成提示文本 */
  finishedText?: string;

  // 下拉刷新相关
  /** 是否开启自定义下拉刷新 */
  refresherEnabled?: boolean;
  /** 设置当前下拉刷新状态 */
  refresherTriggered?: boolean;
  /** 设置下拉刷新阈值 */
  refresherThreshold?: number;
  /** 下拉刷新默认样式 */
  refresherDefaultStyle?: "black" | "white" | "none";
  /** 下拉刷新区域背景颜色 */
  refresherBackground?: string;
}

const props = withDefaults(defineProps<Props>(), {
  scrollY: true,
  scrollX: false,
  scrollViewClass: "",
  contentClass: "",
  enhanced: false,
  showScrollbar: false,
  isEmpty: false,
  emptyText: "暂无数据",
  loading: false,
  finished: false,
  loadingText: "加载中...",
  finishedText: "— 没有更多了 —",
  refresherEnabled: false,
  refresherTriggered: false,
  refresherThreshold: 45,
  refresherDefaultStyle: "black",
  refresherBackground: "transparent",
});

const emit = defineEmits<{
  (e: "scroll", event: any): void;
  (e: "scrollToLower"): void;
  (e: "scrollToUpper"): void;
  (e: "refresh"): void;
  (e: "restore"): void;
  (e: "abort"): void;
}>();

const formatSize = (size?: string | number) => {
  if (size === undefined || size === null) return undefined;
  return typeof size === "number" ? `${size}rpx` : size;
};

const scrollStyle = computed<CSSProperties>(() => ({
  height: formatSize(props.height),
  width: formatSize(props.width),
  whiteSpace: props.scrollX ? 'nowrap' : 'normal'
}));

const showFooter = computed(() => props.loading || props.finished);

const onScroll = (e: any) => emit("scroll", e);
const onScrollToLower = () => emit("scrollToLower");
const onScrollToUpper = () => emit("scrollToUpper");
const onRefresh = () => emit("refresh");
const onRestore = () => emit("restore");
const onAbort = () => emit("abort");
</script>

<style scoped>
/* 隐藏默认滚动条 (如果 showScrollbar 为 false) */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}
</style>
