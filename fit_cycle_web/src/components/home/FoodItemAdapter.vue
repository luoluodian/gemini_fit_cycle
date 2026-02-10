<template>
  <FoodItemCard 
    :food="food" 
    :status="status"
    is-snapshot
    :show-delete="status !== 'ghost'"
    :show-edit="status !== 'ghost'"
    @delete="handleRemove" 
    @edit="handleEdit"
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
  (e: "delete", food: any): void;
  (e: "edit", food: any): void;
  (e: "click", food: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  status: undefined // 关键修复：移除默认值
});

const emit = defineEmits<Emits>();

const handleRemove = (food: any) => {
  emit("delete", food);
};

const handleEdit = (food: any) => {
  emit("edit", food);
};

const handleClick = () => {
  emit("click", props.food);
};
</script>