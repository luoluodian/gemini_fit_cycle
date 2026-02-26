<template>
  <view class="glass-card rounded-lg p-4 shadow-sm">
    <text class="font-medium text-gray-800 mb-3 block">计划建议记录</text>
    <view class="grid grid-cols-2 gap-2">
      <view
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="flex items-center justify-between p-2 rounded-lg border border-solid border-gray-200 active:border-emerald-300 active:bg-emerald-50 transition-colors"
        @click="handleAdd(suggestion)"
      >
        <view class="flex-1 min-w-0 pr-1">
          <text class="font-bold text-gray-800 text-sm block truncate">{{
            suggestion.name
          }}</text>
          <text class="text-[20rpx] text-gray-400 block"
            >{{ Math.round(suggestion.calories) }}{{ displayUnit('kcal') }}</text
          >
        </view>
        <text class="text-xs text-emerald-500 font-bold">+</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { displayUnit } from "@/utils";
import { Food } from "@/services/modules/record";

defineProps<{
  suggestions: Food[];
}>();

const emit = defineEmits<{
  add: [food: Food];
}>();

const handleAdd = (food: Food) => {
  emit("add", food);
};
</script>
