<template>
  <view class="flex items-center gap-1">
    <view class="w-1 h-1 rounded-full" :class="[`bg-${color}-400`]"></view>
    <text class="text-[18rpx] text-gray-400 font-bold">{{ label }} {{ value }}{{ displayUnit('g') }}</text>
  </view>
</template>

<script setup lang="ts">
import { displayUnit } from "@/utils";

defineProps<{
  label: string;
  value: string | number;
  color: string;
}>();
</script>
