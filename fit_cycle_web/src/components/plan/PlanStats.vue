<template>
  <view class="grid grid-cols-2 gap-4 mb-6">
    <view class="glass-card rounded-2xl p-4 shadow-lg text-center bg-white">
      <view class="text-2xl font-bold text-emerald-600">
        {{ activeCount }}
      </view>
      <view class="text-sm text-gray-600">进行中计划</view>
    </view>
    <view class="glass-card rounded-2xl p-4 shadow-lg text-center bg-white">
      <view class="text-2xl font-bold text-orange-500">
        {{ completedCount }}
      </view>
      <view class="text-sm text-gray-600">已完成计划</view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  activeCount: number;
  completedCount: number;
}>();
</script>
