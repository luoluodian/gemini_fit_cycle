<template>
  <view 
    class="menu-item flex items-center p-3 rounded-xl transition-all active:bg-emerald-50 active:translate-x-1"
    @click="$emit('click')"
  >
    <!-- 左侧图标插槽 -->
    <view 
      v-if="$slots.icon || iconColor" 
      :class="[
        'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
        iconBgClass || 'bg-gray-100'
      ]"
    >
      <slot name="icon"></slot>
    </view>

    <!-- 中间文本 -->
    <view class="flex-1">
      <text class="font-medium text-gray-800 block text-base">{{ title }}</text>
      <text v-if="description" class="text-sm text-gray-500 block mt-0.5">{{ description }}</text>
    </view>

    <!-- 右侧箭头 -->
    <svg 
      v-if="showArrow"
      class="w-5 h-5 text-gray-300" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
    </svg>
  </view>
</template>

<script setup lang="ts">
/**
 * MenuItem - 通用列表项组件
 */
interface Props {
  title: string;
  description?: string;
  showArrow?: boolean;
  iconBgClass?: string; // e.g. 'bg-blue-100'
}

withDefaults(defineProps<Props>(), {
  showArrow: true,
});

defineEmits<{
  click: [];
}>();
</script>

<style scoped lang="scss">
.menu-item {
  -webkit-tap-highlight-color: transparent;
}
</style>
