<template>
  <view class="glass-card rounded-lg p-4 mb-6 shadow-lg">
    <view class="flex items-center justify-between mb-4">
      <text class="text-lg font-semibold text-gray-800">食材列表</text>
      <text class="text-sm text-gray-500">显示 {{ foods.length }} 种食材</text>
    </view>

    <view v-if="foods.length === 0" class="text-center py-8 text-gray-500">
      <text class="block">没有找到匹配的食材</text>
      <text class="text-sm mt-1 block">试试创建自定义食材</text>
    </view>

    <view v-else class="space-y-3">
      <FoodCard
        v-for="food in foods"
        :key="food.id"
        :food="food"
        @add-to-meal="handleAddToMeal"
        @view-detail="handleViewDetail"
        @toggle-favorite="handleToggleFavorite"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import FoodCard from "./FoodCard.vue";

interface Food {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  unit: string;
  description: string;
  category: string;
  type: "system" | "custom";
  isFavorite?: boolean;
}

const props = defineProps<{
  foods: Food[];
}>();

const emit = defineEmits<{
  addToMeal: [food: Food];
  viewDetail: [food: Food];
  toggleFavorite: [food: Food];
  edit: [food: Food];
  delete: [food: Food];
}>();

const handleAddToMeal = (food: Food) => {
  emit("addToMeal", food);
};

const handleViewDetail = (food: Food) => {
  emit("viewDetail", food);
};

const handleToggleFavorite = (food: Food) => {
  emit("toggleFavorite", food);
};

const handleEdit = (food: Food) => {
  emit("edit", food);
};

const handleDelete = (food: Food) => {
  emit("delete", food);
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>

