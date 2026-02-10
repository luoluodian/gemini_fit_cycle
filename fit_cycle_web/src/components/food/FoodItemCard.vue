<template>
  <view
    class="flex items-center p-3 bg-white rounded-2xl active:bg-gray-50 transition-all mb-2 border border-solid border-gray-100 shadow-sm"
    @click="$emit('click', food)"
  >
    <!-- 1. Emoji/Icon Section -->
    <view
      class="w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
      :class="getCategoryBg(food.category)"
    >
      <text class="text-2xl leading-none">{{ food.imageUrl || food.emoji || "🥗" }}</text>
    </view>

    <!-- 2. Content Section -->
    <view class="flex-1 min-w-0 flex flex-col justify-center">
      <!-- Top Row: Name + Weight/Cal -->
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-1.5 min-w-0 flex-1 pr-3">
          <text class="font-black text-gray-800 text-sm truncate">{{ food.name || food.foodName }}</text>
          <text
            v-if="!isSnapshot && !quantity"
            class="px-1 py-0.5 text-[14rpx] rounded font-bold bg-gray-100 text-gray-400 flex-shrink-0"
          >
            {{ food.type === "system" ? "系统" : "我的" }}
          </text>
        </view>
        
        <view class="flex items-center gap-2 flex-shrink-0 ml-auto">
           <text class="text-[20rpx] font-black" :class="quantity || isSnapshot ? 'text-emerald-600' : 'text-gray-400'">
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
    <view v-if="showEdit || showDelete || $slots['right-extra']" class="flex items-center gap-1.5 ml-3" @click.stop>
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
      <slot name="right-extra"></slot>
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
  isSnapshot?: boolean; // 新增：是否为快照模式
}

const props = withDefaults(defineProps<Props>(), {
  showEdit: false,
  showDelete: false,
  isSnapshot: false,
});

defineEmits(["click", "edit", "delete"]);

/**
 * 核心逻辑：根据模式决定展示数值
 */
const displayNutrition = computed(() => {
  const { food, quantity, isSnapshot } = props;
  
  // 快照模式：直接读取后端计算好的值
  if (isSnapshot) {
    return {
      calories: Math.round(food.calories || 0),
      protein: Number(food.protein || 0).toFixed(1),
      fat: Number(food.fat || 0).toFixed(1),
      carbs: Number(food.carbs || 0).toFixed(1),
    };
  }

  // 库搜索模式：实时计算比例
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
  const { food, quantity, isSnapshot } = props;
  if (isSnapshot) return `${food.quantity}${food.unit || 'g'}`;
  return quantity ? `${quantity}${food.unit || 'g'}` : `${food.baseCount || 100}${food.unit || 'g'}`;
});

const getCategoryBg = (cat: string) => {
  const target = FOOD_CATEGORIES.find((c) => c.key === cat);
  return target ? target.theme.bg : "bg-gray-50";
};
</script>

<style scoped lang="scss">
.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
