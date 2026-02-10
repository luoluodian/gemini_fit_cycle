<template>
  <FoodItemCard 
    :food="food" 
    :status="status"
    is-snapshot
    :show-delete="status !== 'ghost'"
    @delete="handleRemove" 
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import FoodItemCard from "@/components/food/FoodItemCard.vue";

interface Props {
  food: any;
  status?: 'ghost' | 'completed' | 'custom';
}

interface Emits {
  (e: "delete", id: number): void;
  (e: "click", food: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'custom'
});

const emit = defineEmits<Emits>();

const handleRemove = () => {
  if (props.food.id) emit("delete", props.food.id);
};

const handleClick = () => {
  emit("click", props.food);
};
</script>
