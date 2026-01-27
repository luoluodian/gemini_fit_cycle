<template>
  <view class="mb-4">
    <text class="text-sm font-medium text-gray-700 mb-2 block">常用食材</text>
    <scroll-view scroll-x class="pb-2" enable-flex>
      <view class="flex space-x-2">
        <view
          v-for="food in foods"
          :key="food.id"
          class="food-card flex-shrink-0 bg-white rounded-lg p-3 border border-gray-200 min-w-[120px] text-center"
        >
          <text class="text-2xl mb-1 block">{{ food.emoji }}</text>
          <text class="text-xs font-medium text-gray-800 block">{{ food.name }}</text>
          <text class="text-xs text-gray-500 block">{{ food.calories }} kcal</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
interface Food {
  id: string;
  name: string;
  emoji: string;
  calories: number;
}

defineProps<{
  foods: Food[];
}>();
</script>

<style scoped>
.food-card {
  transition: all 0.3s ease;
}
</style>

