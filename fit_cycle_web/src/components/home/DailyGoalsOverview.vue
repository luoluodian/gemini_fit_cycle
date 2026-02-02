<template>
  <view class="glass-card rounded-lg p-4 mb-6 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">今日目标</h3>
    <view class="grid grid-cols-2 gap-4">
      <view class="text-center">
        <view class="text-2xl font-bold text-emerald-600">{{
          goals.calories
        }}</view>
        <view class="text-xs text-gray-500">目标热量 (kcal)</view>
      </view>
      <view class="text-center">
        <view class="text-2xl font-bold text-orange-500">{{
          consumed.calories
        }}</view>
        <view class="text-xs text-gray-500">已摄入 (kcal)</view>
      </view>
    </view>
    <view class="mt-4">
      <view class="flex justify-between text-sm text-gray-600 mb-1">
        <span>蛋白质</span>
        <span>{{ proteinText }}</span>
      </view>
      <view class="w-full bg-gray-200 rounded-lg h-2">
        <view
          class="progress-bar h-2 rounded-lg"
          :style="{ width: proteinPercent + '%' }"
        ></view>
      </view>
    </view>
    <view class="mt-3">
      <view class="flex justify-between text-sm text-gray-600 mb-1">
        <span>脂肪</span>
        <span>{{ fatText }}</span>
      </view>
      <view class="w-full bg-gray-200 rounded-lg h-2">
        <view
          class="progress-bar h-2 rounded-lg"
          :style="{ width: fatPercent + '%' }"
        ></view>
      </view>
    </view>
    <view class="mt-3">
      <view class="flex justify-between text-sm text-gray-600 mb-1">
        <span>碳水化合物</span>
        <span>{{ carbText }}</span>
      </view>
      <view class="w-full bg-gray-200 rounded-lg h-2">
        <view
          class="progress-bar h-2 rounded-lg"
          :style="{ width: carbPercent + '%' }"
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface NutritionConsumed {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Props {
  goals: NutritionGoals;
  consumed: NutritionConsumed;
}

const props = defineProps<Props>();

const proteinPercent = computed(() => {
  if (props.goals.protein === 0) return 0;
  return Math.min(
    100,
    Math.round((props.consumed.protein / props.goals.protein) * 100)
  );
});

const fatPercent = computed(() => {
  if (props.goals.fat === 0) return 0;
  return Math.min(
    100,
    Math.round((props.consumed.fat / props.goals.fat) * 100)
  );
});

const carbPercent = computed(() => {
  if (props.goals.carbs === 0) return 0;
  return Math.min(
    100,
    Math.round((props.consumed.carbs / props.goals.carbs) * 100)
  );
});

const proteinText = computed(() => {
  return `${Math.round(props.consumed.protein)} / ${props.goals.protein}g`;
});

const fatText = computed(() => {
  return `${Math.round(props.consumed.fat)} / ${props.goals.fat}g`;
});

const carbText = computed(() => {
  return `${Math.round(props.consumed.carbs)} / ${props.goals.carbs}g`;
});
</script>
