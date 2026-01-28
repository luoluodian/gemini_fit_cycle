<template>
  <GlassCard card-class="p-4 shadow-lg">
    <text class="text-lg font-semibold text-gray-800 mb-4 block">健康工具</text>
    <view class="space-y-1">
      <MenuItem 
        title="BMR/TDEE 计算器" 
        description="计算基础代谢率和每日消耗"
        icon-bg-class="bg-blue-50"
        @click="$emit('bmrCalculator')"
      >
        <template #icon>
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        </template>
      </MenuItem>
      
      <MenuItem 
        title="体重记录" 
        description="追踪体重变化趋势"
        icon-bg-class="bg-emerald-50"
        @click="$emit('weightTracker')"
      >
        <template #icon>
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
          </svg>
        </template>
      </MenuItem>
      
      <MenuItem 
        title="营养指南" 
        description="学习健康饮食知识"
        icon-bg-class="bg-purple-50"
        @click="$emit('nutritionGuide')"
      >
        <template #icon>
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </template>
      </MenuItem>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '../common/GlassCard.vue';
import MenuItem from '../common/MenuItem.vue';

defineEmits<{
  bmrCalculator: [];
  weightTracker: [];
  nutritionGuide: [];
}>();
</script>

