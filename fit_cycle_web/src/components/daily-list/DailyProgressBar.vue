<template>
  <view class="px-4 py-2">
    <view class="bg-gray-200 rounded-full h-2">
      <view class="progress-bar" :style="{ width: `${progressPercent}%` }"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  progressPercent: number;
}>();
</script>

<style scoped>
.progress-bar {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  height: 4px;
  border-radius: 2px;
  transition: width 0.5s ease;
}
</style>

