<template>
  <GlassCard card-class="p-4 mb-4" :opacity="0.2" :border="false">
    <view class="flex items-center justify-between mb-2 text-white">
      <text class="font-semibold">当前计划</text>
      <text class="text-xs bg-white/30 px-2 py-1 rounded-full">进行中</text>
    </view>
    <text class="font-medium mb-1 text-white block text-lg">{{ currentPlan.name }}</text>
    <text class="text-white/80 text-sm block mb-4">第 {{ currentPlan.week }} 周 · 剩余 {{ currentPlan.remainingDays }} 天</text>
    <view class="flex space-x-3">
      <BaseButton 
        type="ghost" 
        size="sm" 
        class="!bg-white/20 !text-white !border-transparent flex-1"
        @click="$emit('viewPlan')"
      >
        查看计划
      </BaseButton>
      <BaseButton 
        type="ghost" 
        size="sm" 
        class="!bg-white/10 !text-white/80 !border-transparent flex-initial w-20"
        @click="$emit('editPlan')"
      >
        编辑
      </BaseButton>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '../common/GlassCard.vue';
import BaseButton from '../common/BaseButton.vue';

interface CurrentPlan {
  name: string;
  week: number;
  remainingDays: number;
}

defineProps<{
  currentPlan: CurrentPlan;
}>();

defineEmits<{
  viewPlan: [];
  editPlan: [];
}>();
</script>
