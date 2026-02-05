<template>
  <view class="meal-card glass-card rounded-lg p-4 shadow-lg">
    <view class="flex items-center justify-between mb-4">
      <text class="font-semibold text-gray-800">{{ mealName }}</text>
      <text class="text-sm text-gray-600">{{ mealCalories }} kcal</text>
    </view>

    <view class="space-y-2 mb-4">
      <FoodItemCard
        v-for="(food, index) in foods"
        :key="index"
        :food="food"
        :quantity="food.quantity"
        show-delete
        @delete="handleRemoveFood(index)"
      />
      <view v-if="foods.length === 0" class="text-center text-gray-500 py-8">
        <svg
          class="w-12 h-12 mx-auto mb-2 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
        <text class="block">还没有添加食物</text>
        <text class="text-sm block">点击下方按钮添加食物</text>
      </view>
    </view>

    <view
      class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors flex flex-col items-center justify-center cursor-pointer"
      @click="handleAddFood"
    >
      <svg
        class="w-6 h-6 mx-auto mb-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        ></path>
      </svg>
      <text class="block text-center">添加食物</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import FoodItemCard from "../food/FoodItemCard.vue";
import GlassCard from "./GlassCard.vue";

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
  mealName: string;
  mealCalories: number;
  foods: Food[];
}>();

const emit = defineEmits<{
  "add-food": [];
  "edit-food": [index: number];
  "remove-food": [index: number];
}>();

const handleAddFood = () => {
  emit("add-food");
};

const handleEditFood = (index: number) => {
  emit("edit-food", index);
};

const handleRemoveFood = (index: number) => {
  emit("remove-food", index);
};
</script>

