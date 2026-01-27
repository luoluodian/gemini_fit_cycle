<template>
  <view class="food-card bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <view class="flex items-center justify-between">
      <view class="flex items-center">
        <view
          class="w-12 h-12 rounded-lg flex items-center justify-center mr-3"
          :class="iconBgClass"
        >
          <text class="text-xl">{{ food.emoji }}</text>
        </view>
        <view>
          <text class="font-semibold text-gray-800 block">{{ food.name }}</text>
          <text class="text-sm text-gray-600 block">{{ food.description }}</text>
          <view class="flex items-center text-xs text-gray-500 mt-1">
            <text>蛋白质: {{ food.protein }}g</text>
            <text class="mx-1">·</text>
            <text>脂肪: {{ food.fat }}g</text>
            <text class="mx-1">·</text>
            <text>碳水: {{ food.carbs }}g</text>
          </view>
        </view>
      </view>
      <view class="text-right">
        <text class="text-lg font-semibold text-gray-800 block">{{ food.calories }} kcal</text>
        <text class="text-xs text-gray-500 block">每{{ food.unit }}</text>
        <view class="flex items-center mt-1">
          <text
            class="px-2 py-1 text-xs rounded-full"
            :class="food.type === 'system' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
          >
            {{ food.type === "system" ? "系统" : "我的" }}
          </text>
        </view>
      </view>
    </view>
    <view class="flex space-x-2 mt-3">
      <view
        class="flex-1 bg-emerald-100 text-emerald-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors text-center"
        @click="handleAddToMeal"
      >
        <text>添加到餐食</text>
      </view>
      <view
        v-if="food.type === 'system'"
        class="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
        @click="handleViewDetail"
      >
        <text>详情</text>
      </view>
      <view
        v-if="food.type === 'system'"
        class="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
        @click="handleToggleFavorite"
      >
        <text>{{ food.isFavorite ? "❤️" : "🤍" }}</text>
      </view>
      <view
        v-if="food.type === 'custom'"
        class="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
        @click="handleEdit"
      >
        <text>编辑</text>
      </view>
      <view
        v-if="food.type === 'custom'"
        class="bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors text-center"
        @click="handleDelete"
      >
        <text>删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
  food: Food;
}>();

const emit = defineEmits<{
  addToMeal: [food: Food];
  viewDetail: [food: Food];
  toggleFavorite: [food: Food];
  edit: [food: Food];
  delete: [food: Food];
}>();

const iconBgClass = computed(() => {
  const categoryColors: Record<string, string> = {
    protein: "bg-red-100",
    vegetables: "bg-green-100",
    fruits: "bg-red-100",
    grains: "bg-yellow-100",
    dairy: "bg-blue-100",
    nuts: "bg-yellow-100",
    oils: "bg-yellow-100",
    snacks: "bg-purple-100",
    custom: "bg-purple-100",
  };
  return categoryColors[props.food.category] || "bg-gray-100";
});

const handleAddToMeal = () => {
  emit("addToMeal", props.food);
};

const handleViewDetail = () => {
  emit("viewDetail", props.food);
};

const handleToggleFavorite = () => {
  emit("toggleFavorite", props.food);
};

const handleEdit = () => {
  emit("edit", props.food);
};

const handleDelete = () => {
  emit("delete", props.food);
};
</script>

<style scoped>
.food-card {
  transition: all 0.3s ease;
}

.food-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
</style>

