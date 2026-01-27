<template>
  <FoodItem :food="adaptedFood" @edit="handleEdit" @remove="handleRemove" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import FoodItem from "@/components/common/FoodItem.vue";
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

// 将 MealFoodDetail 转换为 Food 格式
// MealFoodDetail 中的营养值已经是根据 consumedAmount 计算后的实际值
// FoodItem 期望基础值（每100g/个），所以需要反推
const adaptedFood = computed(() => {
  const baseCount = props.food.baseCount || 100;
  const consumedAmount = props.food.consumedAmount;
  
  // 如果 consumedAmount 等于 baseCount，说明是1:1，直接使用
  // 否则需要反推基础值
  if (consumedAmount === baseCount) {
    return {
      name: props.food.foodName,
      quantity: consumedAmount,
      unit: props.food.baseUnit,
      calories: props.food.calories,
      protein: props.food.protein,
      fat: props.food.fat,
      carbs: props.food.carbs,
    };
  }
  
  // 反推基础值：实际值 / (consumedAmount / baseCount)
  const ratio = consumedAmount / baseCount;
  return {
    name: props.food.foodName,
    quantity: consumedAmount,
    unit: props.food.baseUnit,
    calories: ratio > 0 ? Math.round(props.food.calories / ratio) : props.food.calories,
    protein: ratio > 0 ? Math.round((props.food.protein / ratio) * 10) / 10 : props.food.protein,
    fat: ratio > 0 ? Math.round((props.food.fat / ratio) * 10) / 10 : props.food.fat,
    carbs: ratio > 0 ? Math.round((props.food.carbs / ratio) * 10) / 10 : props.food.carbs,
  };
});

const handleEdit = () => {
  emit("edit", props.food);
};

const handleRemove = () => {
  emit("delete", props.food);
};
</script>

