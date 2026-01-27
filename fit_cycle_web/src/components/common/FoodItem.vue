<template>
  <view
    class="food-item flex items-center justify-between p-3 rounded-lg border border-solid border-gray-200"
  >
    <view class="flex-1">
      <text
        class="font-medium text-gray-800 block flex flex-row justify-start items-center"
      >
        {{ food.name }}
        <text class="text-xs text-gray-500 block ml-4">
          {{ food.quantity }}{{ food.unit }} · {{ nutrition.calories }}kcal
        </text>
      </text>
      <text class="text-xs text-gray-500 mt-1 block">
        蛋白质 {{ nutrition.protein }}g · 脂肪 {{ nutrition.fat }}g · 碳水
        {{ nutrition.carbs }}g
      </text>
    </view>
    <view class="flex items-center space-x-2">
      <view
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        @click="handleEdit"
      >
        <svg
          class="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          ></path>
        </svg>
      </view>
      <view
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        @click="handleRemove"
      >
        <svg
          class="w-4 h-4 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          ></path>
        </svg>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
  food: Food;
}>();

const emit = defineEmits<{
  edit: [];
  remove: [];
}>();

const nutrition = computed(() => {
  const ratio = props.food.quantity / 100;
  return {
    calories: Math.round(props.food.calories * ratio),
    protein: Math.round(props.food.protein * ratio * 10) / 10,
    fat: Math.round(props.food.fat * ratio * 10) / 10,
    carbs: Math.round(props.food.carbs * ratio * 10) / 10,
  };
});

const handleEdit = () => {
  emit("edit");
};

const handleRemove = () => {
  emit("remove");
};
</script>

