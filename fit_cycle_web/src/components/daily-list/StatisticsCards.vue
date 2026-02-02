<template>
  <view class="px-4 py-4">
    <view class="grid grid-cols-3 gap-3">
      <view class="glass-card rounded-lg p-3 text-center">
        <view class="text-lg font-bold text-emerald-600">{{ completedCount }}</view>
        <view class="text-xs text-gray-600">已完成</view>
      </view>
      <view class="glass-card rounded-lg p-3 text-center">
        <view class="text-lg font-bold text-blue-600">{{ configuredCount }}</view>
        <view class="text-xs text-gray-600">已配置</view>
      </view>
      <view class="glass-card rounded-lg p-3 text-center">
        <view class="text-lg font-bold text-orange-600">{{ remainingCount }}</view>
        <view class="text-xs text-gray-600">待配置</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  completedCount: number;
  configuredCount: number;
  remainingCount: number;
}>();
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>

