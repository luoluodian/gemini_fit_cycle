<template>
  <view class="grid grid-cols-2 gap-4 mb-6">
    <GlassCard card-class="p-4 text-center stat-card" shadow="lg" :opacity="1">
      <text class="text-2xl font-bold text-emerald-600 block">{{ totalDays }}</text>
      <text class="text-sm text-gray-600 block">坚持使用天数</text>
    </GlassCard>
    <GlassCard card-class="p-4 text-center stat-card" shadow="lg" :opacity="1">
      <text class="text-2xl font-bold text-orange-500 block">{{ completedPlans }}</text>
      <text class="text-sm text-gray-600 block">完成计划数</text>
    </GlassCard>
  </view>
</template>

<script setup lang="ts">
import GlassCard from '../common/GlassCard.vue';

defineProps<{
  totalDays: number;
  completedPlans: number;
}>();
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%) !important;
}
</style>

