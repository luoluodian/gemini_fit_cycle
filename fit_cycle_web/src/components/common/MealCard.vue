<template>
  <GlassCard card-class="mb-4">
    <view class="flex items-center justify-between mb-4">
      <view class="flex items-center gap-2">
        <text class="text-xl">{{ mealEmoji }}</text>
        <text class="font-black text-gray-800 text-base">{{ mealName }}</text>
      </view>
      <view class="bg-gray-50 px-2 py-1 rounded-lg border border-solid border-gray-100">
        <text class="text-sm font-black text-emerald-600">{{ Math.round(mealCalories) }}</text>
        <text class="text-[18rpx] text-gray-400 ml-0.5 font-bold">kcal</text>
      </view>
    </view>

    <view class="space-y-2 mb-4">
      <FoodItemCard
        v-for="(food, index) in foods"
        :key="index"
        :food="food"
        :quantity="food.quantity"
        show-delete
        is-snapshot
        @delete="handleRemoveFood(index)"
      />
      
      <!-- Empty State -->
      <view v-if="foods.length === 0" class="py-10 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <view class="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
          <text class="text-2xl opacity-30">🥣</text>
        </view>
        <text class="text-xs text-gray-400 font-bold">还没有添加任何食物</text>
      </view>
    </view>

    <!-- Action Button -->
    <view
      class="w-full bg-emerald-50/50 border-[1rpx] border-dashed border-emerald-200 rounded-xl py-3 flex items-center justify-center active:scale-[0.98] transition-all"
      @click="handleAddFood"
    >
      <text class="text-xs font-black text-emerald-600">+ 添加食物</text>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlassCard from "./GlassCard.vue";
import FoodItemCard from "../food/FoodItemCard.vue";

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
  mealName: string;
  mealCalories: number;
  foods: Food[];
}>();

const emit = defineEmits<{
  "add-food": [];
  "edit-food": [index: number];
  "remove-food": [index: number];
}>();

const mealEmojiMap: Record<string, string> = { 
  "早餐": "🌅", "午餐": "☀️", "晚餐": "🌙", "加餐": "🍎" 
};
const mealEmoji = computed(() => mealEmojiMap[props.mealName] || "🍽️");

const handleAddFood = () => emit("add-food");
const handleRemoveFood = (index: number) => emit("remove-food", index);
</script>

