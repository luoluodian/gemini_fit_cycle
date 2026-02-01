<template>
  <GlassCard card-class="p-4 mb-4" :opacity="0.2" :border="false">
    <view class="flex items-center justify-between mb-2 text-white">
      <text class="font-semibold">当前计划</text>
      <text class="text-xs bg-white/20 px-2 py-2 rounded-lg">进行中</text>
    </view>
    <text class="font-medium mb-1 text-white block">{{
      currentPlan.name
    }}</text>
    <text class="text-white/80 text-sm block mb-3"
      >第 {{ currentPlan.week }} 周 · 剩余
      {{ currentPlan.remainingDays }} 天</text
    >
    <view class="flex gap-2">
      <BaseButton
        type="ghost"
        size="sm"
        :block="false"
        class="!bg-white/30 !text-white !border-transparent flex-1 !rounded-xl !py-2.5"
        @click="$emit('viewPlan')"
      >
        查看计划
      </BaseButton>
      <BaseButton
        type="ghost"
        size="sm"
        :block="false"
        class="!bg-white/20 !text-white !border-transparent flex-none !w-20 !rounded-xl !py-2.5"
        style="margin-top: 0"
        @click="$emit('editPlan')"
      >
        编辑
      </BaseButton>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from "../common/GlassCard.vue";
import BaseButton from "../common/BaseButton.vue";

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
