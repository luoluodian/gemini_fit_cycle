<template>
  <view
    class="flex items-center p-3 rounded-2xl active:bg-gray-50 transition-all mb-2 border border-solid shadow-sm"
    :class="[
      status === 'ghost' ? 'bg-gray-50 border-dashed border-gray-200 opacity-60 grayscale' : 'bg-white border-gray-100',
      status === 'completed' ? 'bg-emerald-50 border-emerald-100' : ''
    ]"
    @click="$emit('click', food)"
  >
    <!-- 1. Emoji/Icon Section -->
    <view
      class="w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
      :class="status === 'ghost' ? 'bg-gray-200' : getCategoryBg(food.category)"
    >
      <text class="text-2xl leading-none">{{ food.imageUrl || food.emoji || "🥗" }}</text>
    </view>

    <!-- 2. Content Section -->
    <view class="flex-1 min-w-0 flex flex-col justify-center">
      <!-- Top Row -->
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-1.5 min-w-0 flex-1 pr-3">
          <text 
            class="font-black text-sm truncate"
            :class="status === 'completed' ? 'text-emerald-700' : 'text-gray-800'"
          >
            {{ food.name || food.foodName || '未知食材' }}
          </text>
          <text
            v-if="status === 'ghost'"
            class="px-1 py-0.5 text-[14rpx] rounded font-bold bg-gray-200 text-gray-500"
          >推荐</text>
        </view>
        
        <view class="flex items-center gap-2 flex-shrink-0 ml-auto">
           <text class="text-[20rpx] font-black" :class="status === 'completed' ? 'text-emerald-600' : 'text-gray-400'">
             {{ displayQuantity }}
           </text>
           <text class="text-[20rpx] font-black text-gray-800 whitespace-nowrap">{{ displayNutrition.calories }}<text class="text-[14rpx] font-bold text-gray-400 ml-0.5">kcal</text></text>
        </view>
      </view>

      <!-- Bottom Row: Macros -->
      <view class="flex items-center justify-between mt-1">
        <view class="flex items-center gap-3">
          <view class="flex items-center gap-1">
            <view class="w-1 h-1 rounded-full bg-blue-400"></view>
            <text class="text-[18rpx] text-gray-400 font-bold">蛋 {{ displayNutrition.protein }}g</text>
          </view>
          <view class="flex items-center gap-1">
            <view class="w-1 h-1 rounded-full bg-amber-400"></view>
            <text class="text-[18rpx] text-gray-400 font-bold">碳 {{ displayNutrition.carbs }}g</text>
          </view>
          <view class="flex items-center gap-1">
            <view class="w-1 h-1 rounded-full bg-rose-400"></view>
            <text class="text-[18rpx] text-gray-400 font-bold">脂 {{ displayNutrition.fat }}g</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. Actions Section -->
    <view v-if="status !== 'ghost' && (showEdit || showDelete)" class="flex items-center gap-1.5 ml-3" @click.stop>
      <view 
        v-if="showDelete"
        class="w-7 h-7 flex items-center justify-center bg-red-50 rounded-lg active:bg-red-100 transition-colors"
        @click="$emit('delete', food)"
      >
        <Del font-size="12" color="#ef4444"></Del>
      </view>
      <view 
        v-if="showEdit"
        class="w-7 h-7 flex items-center justify-center bg-gray-50 rounded-lg active:bg-gray-100 transition-colors"
        @click="$emit('edit', food)"
      >
        <Edit font-size="12" color="#9ca3af"></Edit>
      </view>
    </view>
    <view v-else-if="status === 'ghost'" class="ml-3">
      <view class="px-2 py-1 bg-emerald-500 text-white text-[18rpx] rounded-lg font-bold">打卡</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Edit, Del } from "@nutui/icons-vue-taro";
import { FOOD_CATEGORIES } from "@/constants/food-categories";

interface Props {
  food: any;
  quantity?: number;
  showEdit?: boolean;
  showDelete?: boolean;
  isSnapshot?: boolean;
  status?: 'ghost' | 'completed' | 'custom'; // 新增状态支持
}

const props = withDefaults(defineProps<Props>(), {
  showEdit: false,
  showDelete: false,
  isSnapshot: false,
  status: 'custom'
});

defineEmits(["click", "edit", "delete"]);

const displayNutrition = computed(() => {
  const { food, quantity, isSnapshot, status } = props;
  
  if (isSnapshot || status === 'ghost') {
    return {
      calories: Math.round(food.calories || 0),
      protein: Number(food.protein || 0).toFixed(1),
      fat: Number(food.fat || 0).toFixed(1),
      carbs: Number(food.carbs || 0).toFixed(1),
    };
  }

  const baseCount = food.baseCount || 100;
  const ratio = quantity ? (quantity / baseCount) : 1;

  return {
    calories: Math.round((food.calories || 0) * ratio),
    protein: (Math.round((food.protein || 0) * ratio * 10) / 10).toFixed(1),
    fat: (Math.round((food.fat || 0) * ratio * 10) / 10).toFixed(1),
    carbs: (Math.round((food.carbs || 0) * ratio * 10) / 10).toFixed(1),
  };
});

const displayQuantity = computed(() => {
  const { food, quantity, isSnapshot, status } = props;
  if (isSnapshot || status === 'ghost') return `${food.quantity || food.baseCount || 100}${food.unit || 'g'}`;
  return quantity ? `${quantity}${food.unit || 'g'}` : `${food.baseCount || 100}${food.unit || 'g'}`;
});

const getCategoryBg = (cat: string) => {
  const target = FOOD_CATEGORIES.find((c) => c.key === cat);
  return target ? target.theme.bg : "bg-gray-50";
};
</script>