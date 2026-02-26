<template>
  <view
    class="page-layout relative w-full h-screen flex flex-col overflow-hidden box-border"
    :class="bgClass"
  >
    <!-- 1. 顶部：导航栏 (固定高度) -->
    <view class="flex-shrink-0 z-[100] w-full">
      <BaseNavBar 
        :title="title" 
        :back-mode="backMode" 
        :manual-handle-back="manualHandleBack"
        @back="$emit('back')"
      >
        <template #left v-if="$slots['nav-left']">
          <slot name="nav-left" />
        </template>
        <template #right>
          <slot name="nav-right" />
        </template>
      </BaseNavBar>
    </view>

    <!-- 2. 顶部固定扩展区 (不随主体滚动) -->
    <view v-if="$slots['fixed-top']" class="flex-shrink-0 z-10 w-full">
      <slot name="fixed-top" />
    </view>

    <!-- 3. 中间：内容区 (弹性自适应) -->
    <view class="flex-1 min-h-0 w-full relative overflow-hidden flex flex-col">
      <!-- 模式 A: 自动开启滚动 -->
      <BaseScrollView
        v-if="useScrollView"
        :scroll-view-class="'h-full w-full'"
        :content-class="[
          'px-4', 
          Array.isArray(scrollContainerClass) ? scrollContainerClass.join(' ') : scrollContainerClass,
          scrollContentClass
        ].filter(Boolean).join(' ')"
        height="100%"
      >
        <slot />
      </BaseScrollView>

      <!-- 模式 B: 自定义布局 (内层需自行处理 px-4) -->
      <view v-else class="flex-1 min-h-0 w-full overflow-hidden px-4">
        <slot />
      </view>
    </view>

    <!-- 4. 底部：固定操作区 (自动适配安全区) -->
    <view
      v-if="$slots.footer"
      class="bg-white border-t border-solid border-gray-100 flex-shrink-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe w-full"
    >
      <view class="px-4 pt-3 pb-2 w-full box-border">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import BaseNavBar from "./BaseNavBar.vue";
import BaseScrollView from "./BaseScrollView.vue";

interface Props {
  title: string;
  backMode?: "back" | "home" | "none";
  manualHandleBack?: boolean;
  useScrollView?: boolean;
  scrollContainerClass?: string | string[];
  scrollContentClass?: string;
  bgClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  backMode: "back",
  manualHandleBack: false,
  useScrollView: true,
  scrollContainerClass: "py-4",
  scrollContentClass: "space-y-6",
  bgClass: "default-bg",
});

defineEmits<{
  back: [];
}>();
</script>

<style scoped lang="scss">
.page-layout {
  /* 深度覆盖编译产生的 NaNrpx 错误，确保弹性收缩机制生效 */
  :deep(.min-h-0),
  .min-h-0 {
    min-height: 0 !important;
  }
  
  :deep(.flex-1),
  .flex-1 {
    flex: 1 1 0% !important;
  }
}

.default-bg {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.pb-safe {
  padding-bottom: calc(constant(safe-area-inset-bottom) + 40rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
}
</style>
