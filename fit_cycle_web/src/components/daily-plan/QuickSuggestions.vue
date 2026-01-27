<template>
  <view class="glass-card rounded-xl p-4 shadow-sm">
    <text class="font-medium text-gray-800 mb-3 block">快速建议</text>
    <view class="grid grid-cols-2 gap-2">
      <view
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="flex items-center justify-between p-2 rounded-lg border border-solid border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
        @click="handleAdd(suggestion)"
      >
        <view>
          <text class="font-medium text-gray-800 text-sm block">{{
            suggestion.name
          }}</text>
          <text class="text-xs text-gray-600 block"
            >{{ calculateNutrition(suggestion).calories }}kcal</text
          >
        </view>
        <text class="text-xs text-gray-500">+</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Food {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const props = defineProps<{
  suggestions: Food[];
}>();

const emit = defineEmits<{
  add: [food: Food];
}>();

const calculateNutrition = (food: Food) => {
  const ratio = food.quantity / 100;
  return {
    calories: Math.round(food.calories * ratio),
  };
};

const handleAdd = (food: Food) => {
  emit("add", food);
};
</script>
