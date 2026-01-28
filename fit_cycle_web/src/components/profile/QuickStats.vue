<template>
  <view class="grid grid-cols-2 gap-4 mb-6">
    <GlassCard card-class="p-4 shadow-lg text-center" :opacity="1">
      <text class="text-2xl font-bold text-emerald-600 block">{{ totalDays }}</text>
      <text class="text-sm text-gray-600 block">坚持使用天数</text>
    </GlassCard>
    <GlassCard card-class="p-4 shadow-lg text-center" :opacity="1">
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

