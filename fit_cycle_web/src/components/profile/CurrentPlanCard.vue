<template>
  <view class="bg-white/20 rounded-2xl p-4 mb-4">
    <view class="flex items-center justify-between mb-2">
      <text class="font-semibold">当前计划</text>
      <text class="text-xs bg-white/30 px-2 py-1 rounded-full">进行中</text>
    </view>
    <text class="font-medium mb-1 block">{{ currentPlan.name }}</text>
    <text class="text-white/80 text-sm mb-3 block">第 {{ currentPlan.week }} 周 · 剩余 {{ currentPlan.remainingDays }} 天</text>
    <view class="flex space-x-2">
      <view class="flex-1 bg-white/30 text-white py-2 px-4 rounded-lg text-sm font-medium text-center" @click="handleViewPlan">
        查看计划
      </view>
      <view class="bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium text-center" @click="handleEditPlan">
        编辑
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface CurrentPlan {
  name: string;
  week: number;
  remainingDays: number;
}

const props = defineProps<{
  currentPlan: CurrentPlan;
}>();

const emit = defineEmits<{
  viewPlan: [];
  editPlan: [];
}>();

const handleViewPlan = () => {
  emit('viewPlan');
};

const handleEditPlan = () => {
  emit('editPlan');
};
</script>

