<template>
  <view
    class="page-layout flex flex-col overflow-hidden"
    :class="bgClass"
    style="height: 100vh"
  >
    <!-- 1. 顶部：导航栏 (固定) -->
    <BaseNavBar 
      :title="title" 
      :back-mode="backMode" 
      :manual-handle-back="manualHandleBack"
      @back="$emit('back')"
    >
      <template #right>
        <slot name="nav-right" />
      </template>
    </BaseNavBar>

    <!-- 2. 顶部固定扩展区 (如营养汇总卡片，不随主体滚动) -->
    <view v-if="$slots['fixed-top']" class="flex-shrink-0 z-10">
      <slot name="fixed-top" />
    </view>

    <!-- 3. 中间：内容区 (Flex 自适应) -->
    <view class="flex-1 min-h-0 relative flex flex-col overflow-hidden">
      <!-- 模式 A: 自动开启滚动 (适用于标准表单、简单列表) -->
      <BaseScrollView
        v-if="useScrollView"
        :flex="true"
        :scroll-view-class="scrollContainerClass"
        :content-class="scrollContentClass"
      >
        <slot />
      </BaseScrollView>

      <!-- 模式 B: 自定义布局 (适用于需要内部精确控制滚动的复杂页面，如 meal-config) -->
      <view v-else class="h-full flex flex-col overflow-hidden">
        <slot />
      </view>
    </view>

    <!-- 4. 底部：固定操作区 (自动适配安全区) -->
    <view
      v-if="$slots.footer"
      class="bg-white border-t border-solid border-gray-200 px-4 pt-3 flex-shrink-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
    >
      <view class="max-w-md mx-auto mb-2 space-y-2">
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
  scrollContainerClass?: string;
  scrollContentClass?: string;
  bgClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  backMode: "back",
  manualHandleBack: false,
  useScrollView: true,
  scrollContainerClass: "py-4 px-4",
  scrollContentClass: "space-y-6 ",
  bgClass: "default-bg",
});

defineEmits<{
  back: [];
}>();
</script>

<style scoped lang="scss">
.default-bg {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.pb-safe {
  padding-bottom: calc(constant(safe-area-inset-bottom) + 10px);
  padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
}
</style>
