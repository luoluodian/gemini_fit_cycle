<template>
  <view class="text-center">
    <text class="text-[18rpx] text-gray-400 mb-1 block font-black">{{ label }}</text>
    <text class="text-sm font-black block" :class="color">
      {{ value }}<text class="text-[10px] ml-0.5" v-if="unit">{{ unit }}</text>
    </text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}>();
</script>
