<template>
  <FoodItemCard 
    :food="adaptedFood" 
    :quantity="food.consumedAmount"
    show-edit
    show-delete
    @edit="handleEdit" 
    @delete="handleRemove" 
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import FoodItemCard from "@/components/food/FoodItemCard.vue";
import type { MealFoodDetail } from "@/services/modules/record";

interface Props {
  food: MealFoodDetail;
}

interface Emits {
  (e: "edit", food: MealFoodDetail): void;
  (e: "delete", food: MealFoodDetail): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 将 MealFoodDetail 转换为 FoodItemCard 期望的基础分量格式
const adaptedFood = computed(() => {
  const baseCount = props.food.baseCount || 100;
  const consumedAmount = props.food.consumedAmount || baseCount;
  
  // 反推基础值：实际值 / (consumedAmount / baseCount)
  const ratio = consumedAmount / baseCount;
  return {
    id: props.food.foodId,
    name: props.food.foodName,
    unit: props.food.baseUnit || 'g',
    baseCount: baseCount,
    // 如果 ratio 为 0，则直接使用原值
    calories: ratio > 0 ? Math.round(props.food.calories / ratio) : props.food.calories,
    protein: ratio > 0 ? Math.round((props.food.protein / ratio) * 10) / 10 : props.food.protein,
    fat: ratio > 0 ? Math.round((props.food.fat / ratio) * 10) / 10 : props.food.fat,
    carbs: ratio > 0 ? Math.round((props.food.carbs / ratio) * 10) / 10 : props.food.carbs,
    imageUrl: "🥗", // 默认，或从数据中获取（如果 MealFoodDetail 包含的话）
    category: "custom", // 默认
  };
});

const handleEdit = () => {
  emit("edit", props.food);
};

const handleRemove = () => {
  emit("delete", props.food);
};
</script>

