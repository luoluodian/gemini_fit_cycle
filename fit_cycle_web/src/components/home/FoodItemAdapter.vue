<template>
  <FoodItemCard 
    :food="food" 
    :status="status"
    is-snapshot
    :show-delete="status !== 'ghost'"
    :show-edit="status === 'completed'"
    @delete="handleRemove" 
    @edit="handleEdit"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import FoodItemCard from "@/components/food/FoodItemCard.vue";

interface Props {
  food: any;
  status?: 'ghost' | 'completed' | 'custom' | 'draft';
}

interface Emits {
  (e: "delete", food: any): void;
  (e: "edit", food: any): void;
  (e: "click", food: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleRemove = (food: any) => emit("delete", food);
const handleEdit = (food: any) => emit("edit", food);
const handleClick = () => emit("click", props.food);
</script>
