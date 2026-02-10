<template>
  <view class="glass-card rounded-lg p-4 mb-6 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">今日目标</h3>
    <view class="grid grid-cols-2 gap-4">
      <view class="text-center">
        <view class="text-2xl font-bold text-emerald-600">{{
          goals.targetCalories
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
    
    <!-- 蛋白质 -->
    <view class="mt-4">
      <view class="flex justify-between text-sm text-gray-600 mb-1">
        <span>蛋白质</span>
        <span>{{ proteinText }}</span>
      </view>
      <view class="w-full bg-gray-200 rounded-lg h-2">
        <view
          class="progress-bar h-2 rounded-lg bg-emerald-500"
          :style="{ width: proteinPercent + '%' }"
        ></view>
      </view>
    </view>

    <!-- 脂肪 -->
    <view class="mt-3">
      <view class="flex justify-between text-sm text-gray-600 mb-1">
        <span>脂肪</span>
        <span>{{ fatText }}</span>
      </view>
      <view class="w-full bg-gray-200 rounded-lg h-2">
        <view
          class="progress-bar h-2 rounded-lg bg-orange-400"
          :style="{ width: fatPercent + '%' }"
        ></view>
      </view>
    </view>

    <!-- 碳水 -->
    <view class="mt-3">
      <view class="flex justify-between text-sm text-gray-600 mb-1">
        <span>碳水化合物</span>
        <span>{{ carbText }}</span>
      </view>
      <view class="w-full bg-gray-200 rounded-lg h-2">
        <view
          class="progress-bar h-2 rounded-lg bg-sky-500"
          :style="{ width: carbPercent + '%' }"
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * 对齐后端 DailyRecord 实体快照字段
 */
interface NutritionGoals {
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
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

// --- 计算百分比逻辑 ---
const proteinPercent = computed(() => {
  if (!props.goals.targetProtein) return 0;
  return Math.min(100, Math.round((props.consumed.protein / props.goals.targetProtein) * 100));
});

const fatPercent = computed(() => {
  if (!props.goals.targetFat) return 0;
  return Math.min(100, Math.round((props.consumed.fat / props.goals.targetFat) * 100));
});

const carbPercent = computed(() => {
  if (!props.goals.targetCarbs) return 0;
  return Math.min(100, Math.round((props.consumed.carbs / props.goals.targetCarbs) * 100));
});

// --- 展示文本逻辑 ---
const proteinText = computed(() => {
  return `${Math.round(props.consumed.protein)} / ${props.goals.targetProtein}g`;
});

const fatText = computed(() => {
  return `${Math.round(props.consumed.fat)} / ${props.goals.targetFat}g`;
});

const carbText = computed(() => {
  return `${Math.round(props.consumed.carbs)} / ${props.goals.targetCarbs}g`;
});
</script>