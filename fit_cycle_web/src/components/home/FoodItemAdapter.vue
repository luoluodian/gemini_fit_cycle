<template>
  <FoodItemCard 
    :food="food" 
    is-snapshot
    show-delete
    @delete="handleRemove" 
  />
</template>

<script setup lang="ts">
import FoodItemCard from "@/components/food/FoodItemCard.vue";
import type { MealLog } from "@/services/modules/record";

/**
 * 记录项适配器
 * 将 MealLog 实体适配到通用的 FoodItemCard 展示组件
 */
interface Props {
  food: MealLog;
}

interface Emits {
  (e: "delete", id: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleRemove = () => {
  emit("delete", props.food.id);
};
</script>