<template>
  <BaseModal
    :visible="modalVisible"
    :show-header="false"
    position="center"
    @close="handleClose"
    @update="(val) => (modalVisible = val)"
    content-class="w-[85vw] overflow-x-hidden"
  >
    <!-- Custom Top Bar -->
    <view class="flex items-center justify-between mb-4 px-1">
      <!-- Close Button -->
      <view
        class="p-1 text-gray-400 active:opacity-60 transition-all"
        @click="handleClose"
      >
        <Close font-size="18"></Close>
      </view>

      <!-- Title -->
      <text class="text-base font-bold text-gray-800 truncate px-2">{{
        food?.name || "食物名称"
      }}</text>

      <!-- Favorite Button -->
      <view
        class="p-1 transition-all active:scale-95"
        @click="handleToggleFavorite"
      >
        <Follow v-if="isFavorite" font-size="18" color="#ef4444"></Follow>
        <Addfollow v-else font-size="18" color="#d1d5db"></Addfollow>
      </view>
    </view>

    <view v-if="food" class="pb-2 overflow-x-hidden">
      <!-- Hero: Icon + Category -->
      <view class="text-center mb-5">
        <text class="text-5xl mb-3 block leading-none">{{ food.imageUrl || "🍎" }}</text>
        <view class="inline-block px-3 py-1 bg-emerald-100 rounded-full">
          <text class="text-[20rpx] font-medium text-emerald-600 leading-none">{{
            getCategoryLabel(food.category)
          }}</text>
        </view>
      </view>

      <!-- Description -->
      <view class="mb-5 px-4">
        <text class="text-[22rpx] text-gray-400 text-center leading-relaxed block break-all">{{
          food.description || "暂无描述"
        }}</text>
      </view>

      <!-- Nutrition Card -->
      <view
        class="bg-gray-50 rounded-lg p-3 mb-4 border border-solid border-gray-200"
      >
        <view class="flex items-center justify-center gap-2 mb-3">
          <text class="text-[18rpx] text-gray-400">营养成分</text>
          <text class="text-[18rpx] text-gray-300">|</text>
          <text class="text-[18rpx] text-gray-500">每{{ food.baseCount || 100 }}{{ food.unit }}</text>
        </view>

        <view class="grid grid-cols-4 gap-1">
          <!-- 统一紧凑栅格 -->
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block">碳水</text>
            <text class="text-sm font-bold text-amber-500 block"
              >{{ food.carbs }}g</text
            >
          </view>
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block">蛋白质</text>
            <text class="text-sm font-bold text-rose-500 block"
              >{{ food.protein }}g</text
            >
          </view>
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block">脂肪</text>
            <text class="text-sm font-bold text-blue-500 block"
              >{{ food.fat }}g</text
            >
          </view>
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block">热量</text>
            <text class="text-sm font-bold text-emerald-500 block">{{
              food.calories
            }}</text>
          </view>
        </view>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { Addfollow, Follow, Close } from "@nutui/icons-vue-taro";
import { FoodCategory } from "@/services/modules/food";
import type { FoodItem } from "@/services/modules/food";
import { getFoodCategoryConfig } from "@/constants/food-categories";

// Define a simplified interface for props if FoodItem is too complex or just use FoodItem
interface Food extends FoodItem {
  emoji?: string; // Compatibility
}

const props = defineProps<{
  visible: boolean;
  food: Food | null;
  isFavorite?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  addToMeal: [food: Food];
  toggleFavorite: [food: Food];
}>();

// Sync visible prop with BaseModal
const modalVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) emit("close");
  },
});

const getCategoryLabel = (cat: string) => {
  const config = getFoodCategoryConfig(cat);
  return config ? config.label : "其他";
};

const handleClose = () => {
  emit("close");
};

const handleToggleFavorite = () => {
  if (props.food) {
    emit("toggleFavorite", props.food);
  }
};
</script>

<style scoped>
/* 移除之前的 modal-overlay 等手动样式 */
</style>
