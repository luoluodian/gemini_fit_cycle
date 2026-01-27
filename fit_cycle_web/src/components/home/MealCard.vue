<template>
  <view class="meal-card rounded-2xl p-4 shadow-sm">
    <view class="flex items-center justify-between mb-3">
      <h4 class="font-semibold text-gray-800">
        {{ mealEmoji }} {{ mealRecord.meal_type_label }}
      </h4>
      <view class="text-sm text-gray-500">{{ totalCalories }} kcal</view>
    </view>
    <view class="space-y-2">
      <FoodItemAdapter
        v-for="(food, index) in mealRecord.details"
        :key="food.mealFoodId || index"
        :food="food"
        @edit="handleEditFood"
        @delete="handleDeleteFood"
      />
    </view>
    <view class="mt-3 flex space-x-2">
      <view
        class="flex-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors text-center"
        @click="handleAddPlannedMeal"
      >
        记录本餐
      </view>
      <view
        class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
        @click="handleAddFood"
      >
        添加食物
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import FoodItemAdapter from "./FoodItemAdapter.vue";
import type { MealFoodDetail } from "@/services/modules/record";

interface MealRecord {
  meal_type: string;
  meal_type_label: string;
  details: MealFoodDetail[];
}

interface Props {
  mealRecord: MealRecord;
}

interface Emits {
  (e: "add-food", mealKey: string): void;
  (e: "add-planned-meal", mealKey: string): void;
  (e: "edit-food", mealKey: string, food: MealFoodDetail): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const mealEmojiMap: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snacks: "🍎",
};

const mealEmoji = computed(
  () => mealEmojiMap[props.mealRecord.meal_type] || "🍽️"
);

const totalCalories = computed(() => {
  return props.mealRecord.details.reduce((sum, item) => sum + item.calories, 0);
});

const handleAddFood = () => {
  emit("add-food", props.mealRecord.meal_type);
};

const handleAddPlannedMeal = () => {
  emit("add-planned-meal", props.mealRecord.meal_type);
};

const handleEditFood = (food: MealFoodDetail) => {
  emit("edit-food", props.mealRecord.meal_type, food);
};

const handleDeleteFood = (food: MealFoodDetail) => {
  // TODO: 实现删除功能
  console.log("删除食物", food);
};
</script>
