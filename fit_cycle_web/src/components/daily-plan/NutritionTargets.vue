<template>
  <view class="glass-card rounded-lg p-4 shadow-lg">
    <view class="flex items-center justify-between mb-3">
      <text class="font-semibold text-gray-800">营养目标</text>
      <view
        class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        @click="handleEdit"
      >
        编辑
      </view>
    </view>
    <view class="grid grid-cols-2 gap-4">
      <view>
        <view class="flex justify-between text-sm mb-1">
          <text class="text-gray-600">热量</text>
          <text class="font-medium">{{ caloriesText }}</text>
        </view>
        <view class="bg-gray-200 rounded-lg h-2">
          <view
            class="nutrition-bar bg-emerald-500"
            :style="{ width: `${caloriesPercent}%` }"
          ></view>
        </view>
      </view>
      <view>
        <view class="flex justify-between text-sm mb-1">
          <text class="text-gray-600">蛋白质</text>
          <text class="font-medium">{{ proteinText }}</text>
        </view>
        <view class="bg-gray-200 rounded-lg h-2">
          <view
            class="nutrition-bar bg-blue-500"
            :style="{ width: `${proteinPercent}%` }"
          ></view>
        </view>
      </view>
      <view>
        <view class="flex justify-between text-sm mb-1">
          <text class="text-gray-600">脂肪</text>
          <text class="font-medium">{{ fatText }}</text>
        </view>
        <view class="bg-gray-200 rounded-lg h-2">
          <view
            class="nutrition-bar bg-orange-500"
            :style="{ width: `${fatPercent}%` }"
          ></view>
        </view>
      </view>
      <view>
        <view class="flex justify-between text-sm mb-1">
          <text class="text-gray-600">碳水</text>
          <text class="font-medium">{{ carbsText }}</text>
        </view>
        <view class="bg-gray-200 rounded-lg h-2">
          <view
            class="nutrition-bar bg-purple-500"
            :style="{ width: `${carbsPercent}%` }"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Targets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const props = defineProps<{
  targets: Targets;
  currentNutrition: Nutrition;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const caloriesText = computed(() => {
  return `${Math.round(props.currentNutrition.calories)}/${
    props.targets.calories
  } kcal`;
});

const proteinText = computed(() => {
  const current = Math.round(props.currentNutrition.protein * 10) / 10;
  return `${current}/${props.targets.protein} g`;
});

const fatText = computed(() => {
  const current = Math.round(props.currentNutrition.fat * 10) / 10;
  return `${current}/${props.targets.fat} g`;
});

const carbsText = computed(() => {
  const current = Math.round(props.currentNutrition.carbs * 10) / 10;
  return `${current}/${props.targets.carbs} g`;
});

const caloriesPercent = computed(() => {
  if (props.targets.calories <= 0) return 0;
  return Math.min(
    (props.currentNutrition.calories / props.targets.calories) * 100,
    100
  );
});

const proteinPercent = computed(() => {
  if (props.targets.protein <= 0) return 0;
  return Math.min(
    (props.currentNutrition.protein / props.targets.protein) * 100,
    100
  );
});

const fatPercent = computed(() => {
  if (props.targets.fat <= 0) return 0;
  return Math.min((props.currentNutrition.fat / props.targets.fat) * 100, 100);
});

const carbsPercent = computed(() => {
  if (props.targets.carbs <= 0) return 0;
  return Math.min(
    (props.currentNutrition.carbs / props.targets.carbs) * 100,
    100
  );
});

const handleEdit = () => {
  emit("edit");
};
</script>
