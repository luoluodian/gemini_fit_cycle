<template>
  <view class="grid grid-cols-2 gap-4 mb-6">
    <view class="stat-card rounded-2xl p-4 shadow-lg text-center">
      <text class="text-2xl font-bold text-emerald-600 block">{{ totalDays }}</text>
      <text class="text-sm text-gray-600 block">坚持使用天数</text>
    </view>
    <view class="stat-card rounded-2xl p-4 shadow-lg text-center">
      <text class="text-2xl font-bold text-orange-500 block">{{ completedPlans }}</text>
      <text class="text-sm text-gray-600 block">完成计划数</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  totalDays: number;
  completedPlans: number;
}>();
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
}
</style>

