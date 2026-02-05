<template>
  <view 
    class="meal-section-item bg-white/80 rounded-2xl p-4 border-[2rpx] border-solid border-gray-200 active:scale-[0.98] transition-all mb-3 shadow-sm"
  >
    <!-- 头部：餐次汇总信息 -->
    <view class="flex items-center justify-between mb-2">
      <!-- 左侧点击区域：进入配置 -->
      <view class="flex items-center flex-1 min-w-0" @tap="$emit('edit')">
        <text class="text-xl mr-2">{{ icon }}</text>
        <view>
          <text class="text-sm font-black text-gray-800">{{ title }}</text>
          <text 
            :class="['text-[16rpx] font-bold block', foods.length > 0 ? 'text-emerald-600' : 'text-gray-400']"
          >
            {{ foods.length > 0 ? foods.length + ' 个食物' : '未配置' }}
          </text>
        </view>
      </view>

      <!-- 右侧操作区域 -->
      <view class="flex items-center space-x-2">
        <view class="text-right mr-1" @tap="$emit('edit')">
          <view class="text-sm font-black text-gray-700">{{ Math.round(totalCalories || 0) }} kcal</view>
          <view class="flex items-center space-x-2 text-[18rpx] text-gray-400 font-black mt-0.5">
            <text>🍞 {{ Math.round(totalCarbs || 0) }}g</text>
            <text>🥩 {{ Math.round(totalProtein || 0) }}g</text>
            <text>🥑 {{ Math.round(totalFat || 0) }}g</text>
          </view>
        </view>
        
        <!-- 统一的更多操作按钮 (⋮) -->
        <view 
          class="w-8 h-8 flex items-center justify-center rounded-lg active:bg-black/5 transition-colors"
          @tap.stop="$emit('show-menu')"
        >
          <view class="flex flex-col space-y-0.5 items-center">
            <view class="w-1 h-1 rounded-full bg-gray-300"></view>
            <view class="w-1 h-1 rounded-full bg-gray-300"></view>
            <view class="w-1 h-1 rounded-full bg-gray-300"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部：详细食物列表 -->
    <view v-if="foods.length > 0" class="space-y-1 mt-2 pt-2 border-t border-dashed border-gray-200">
      <FoodItemCard
        v-for="(food, idx) in foods" 
        :key="idx" 
        :food="food"
        :quantity="food.quantity"
        show-delete
        @delete="$emit('delete-food', idx)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
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

interface Props {
  title: string;
  icon: string;
  foods: Food[];
}

const props = defineProps<Props>();
defineEmits(["edit", "delete-food", "show-menu"]);

const totalCalories = computed(() => props.foods.reduce((s, f) => s + (f.calories || 0), 0));
const totalProtein = computed(() => props.foods.reduce((s, f) => s + (f.protein || 0), 0));
const totalFat = computed(() => props.foods.reduce((s, f) => s + (f.fat || 0), 0));
const totalCarbs = computed(() => props.foods.reduce((s, f) => s + (f.carbs || 0), 0));
</script>