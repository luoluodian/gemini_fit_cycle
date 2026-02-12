<template>
  <view class="base-nav-bar-wrapper" :style="{ height: navBarHeight + 'px' }">
    <view
      class="base-nav-bar fixed top-0 left-0 right-0 z-[9999]"
      :class="[transparent ? 'bg-transparent' : 'bg-white border-b border-gray-100']"
      :style="{
        height: navBarHeight + 'px',
        background: customBackground,
      }"
    >
      <!-- 1. 状态栏占位 (电量、时间区域) -->
      <view :style="{ height: statusBarHeight + 'px' }"></view>

      <!-- 2. 内容区 (标题与操作) -->
      <view
        class="nav-content relative flex items-center px-4 w-[100vw]"
        :style="{ height: titleBarHeight + 'px' }"
      >
        <!-- 左侧操作区 -->
        <view class="nav-left flex items-center justify-start min-w-[120rpx] z-10">
          <!-- 优先渲染插槽 -->
          <slot v-if="$slots.left" name="left"></slot>

          <!-- 默认按钮模式 -->
          <block v-else-if="backMode !== 'none'">
            <!-- 返回上一页 -->
            <view
              v-if="backMode === 'back'"
              class="flex items-center justify-center p-2 -ml-2 active:opacity-60 transition-opacity"
              @click="handleAction('back')"
            >
              <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </view>

            <!-- 返回首页 -->
            <view
              v-if="backMode === 'home'"
              class="flex items-center justify-center p-2 -ml-2 active:opacity-60 transition-opacity"
              @click="handleAction('home')"
            >
              <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </view>
          </block>
        </view>

        <!-- 标题区 (绝对居中) -->
        <view
          class="nav-title absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[50%] flex justify-center pointer-events-none"
        >
          <text class="text-lg font-bold text-gray-900 truncate pointer-events-auto">{{ title }}</text>
        </view>

        <!-- 右侧操作区 (通常留白供胶囊按钮使用) -->
        <view class="nav-right ml-auto flex items-center justify-end min-w-[120rpx] z-10">
          <slot name="right"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Taro from "@tarojs/taro";
import { navigateBack, reLaunch, ROUTES } from "@/router";

interface Props {
  title?: string;
  /** 左侧按钮模式: back(返回), home(首页), none(隐藏) */
  backMode?: "back" | "home" | "none";
  /** 是否开启沉浸式透明背景 */
  transparent?: boolean;
  /** 自定义背景色 (如线性渐变) */
  customBackground?: string;
  /** 是否由父组件完全接管返回动作 */
  manualHandleBack?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  backMode: "back",
  transparent: false,
  customBackground: "",
  manualHandleBack: false,
});

const emit = defineEmits<{
  back: [];
  home: [];
}>();

// --- 布局适配逻辑 ---
const statusBarHeight = ref(20);
const titleBarHeight = ref(44);
const navBarHeight = computed(() => statusBarHeight.value + titleBarHeight.value);

onMounted(() => {
  const systemInfo = Taro.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;

  if (process.env.TARO_ENV !== "h5") {
    try {
      const menuButton = Taro.getMenuButtonBoundingClientRect();
      if (menuButton.top > 0) {
        titleBarHeight.value = (menuButton.top - statusBarHeight.value) * 2 + menuButton.height;
      }
    } catch (e) {
      titleBarHeight.value = 44; // 极端情况降级
    }
  }
});

// --- 行为分发逻辑 ---
const handleAction = (type: "back" | "home") => {
  if (type === "back") {
    emit("back");
    if (!props.manualHandleBack) {
      const pages = Taro.getCurrentPages();
      if (pages.length > 1) {
        navigateBack();
      } else {
        reLaunch(ROUTES.HOME);
      }
    }
  } else if (type === "home") {
    emit("home");
    if (!props.manualHandleBack) {
      reLaunch(ROUTES.HOME);
    }
  }
};
</script>

<style lang="scss">
.base-nav-bar-wrapper {
  width: 100%;
}
.base-nav-bar {
  transition: background 0.3s ease;
  box-sizing: border-box;
}
</style>
