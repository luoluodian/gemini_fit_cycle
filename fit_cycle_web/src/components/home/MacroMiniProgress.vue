<template>
  <view class="flex flex-col items-center">
    <view class="relative w-12 h-12 flex items-center justify-center mb-2">
      <!-- 背景圆环 -->
      <view class="absolute inset-0 border-4 border-solid border-gray-100 rounded-full"></view>
      <!-- 进度圆环 (简化版使用 clip-path 或简单背景) -->
      <view 
        class="absolute inset-0 border-4 border-solid rounded-full transition-all duration-500"
        :class="[`border-${color}-500`]"
        :style="{ clipPath: `inset(${100 - percentage}% 0 0 0)` }"
      ></view>
      <text class="text-[16rpx] font-black text-gray-800">{{ percentage }}%</text>
    </view>
    <text class="text-[18rpx] text-gray-400 font-bold mb-0.5">{{ label }}</text>
    <text class="text-[18rpx] font-black text-gray-600">{{ Math.round(current) }}<text class="text-[14rpx] text-gray-300 ml-0.5">g</text></text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  label: string;
  current: number;
  target: number;
  color: string;
}

const props = defineProps<Props>();

const percentage = computed(() => {
  if (!props.target) return 0;
  return Math.min(100, Math.round((props.current / props.target) * 100));
});
</script>
