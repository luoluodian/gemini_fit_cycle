<template>
  <view
    class="flex items-center p-3 rounded-2xl active:bg-gray-50 transition-all mb-2 border border-solid shadow-sm"
    :class="{
      'bg-gray-50 border-dashed border-gray-200 grayscale': status === 'ghost',
      'bg-emerald-50 border-emerald-100': status === 'completed',
      'bg-white border-gray-100': !status || status === 'custom'
    }"
    @click="$emit('click', food)"
  >
    <!-- 1. Icon -->
    <view
      class="w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
      :class="status === 'ghost' ? 'bg-gray-200' : getCategoryBg(food.category)"
    >
      <text class="text-2xl leading-none">{{ food.imageUrl || food.emoji || "🥗" }}</text>
    </view>

    <!-- 2. Content -->
    <view class="flex-1 min-w-0 flex flex-col justify-center">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-1.5 min-w-0 flex-1 pr-3">
          <text 
            class="font-black text-sm truncate"
            :class="status === 'ghost' ? 'text-gray-500' : 'text-emerald-700'"
          >
            {{ food.name || food.foodName || '未知食材' }}
          </text>
          <text
            v-if="status === 'ghost'"
            class="px-1 py-0.5 text-[14rpx] rounded font-bold bg-gray-200 text-gray-500"
          >计划建议</text>
        </view>
        
        <view class="flex items-center gap-2 flex-shrink-0 ml-auto">
           <text class="text-[20rpx] font-black" :class="status === 'ghost' ? 'text-gray-400' : 'text-emerald-600'">
             {{ displayQuantity }}
           </text>
           <text class="text-[20rpx] font-black text-gray-800 whitespace-nowrap">{{ displayNutrition.calories }}<text class="text-[14rpx] font-bold text-gray-400 ml-0.5">kcal</text></text>
        </view>
      </view>

      <view class="flex items-center justify-between mt-1">
        <view class="flex items-center gap-3">
          <NutritionMacroSmall label="蛋" :value="displayNutrition.protein" color="blue" />
          <NutritionMacroSmall label="碳" :value="displayNutrition.carbs" color="amber" />
          <NutritionMacroSmall label="脂" :value="displayNutrition.fat" color="rose" />
        </view>
      </view>
    </view>

    <!-- 3. Actions -->
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
        class="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg active:bg-gray-200 transition-colors border border-solid border-gray-200"
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
import NutritionMacroSmall from "./NutritionMacroSmall.vue";

interface Props {
  food: any;
  quantity?: number;
  showEdit?: boolean;
  showDelete?: boolean;
  isSnapshot?: boolean;
  status?: 'ghost' | 'completed' | 'custom';
}

const props = withDefaults(defineProps<Props>(), {
  showEdit: false,
  showDelete: false,
  isSnapshot: false,
  status: undefined // 关键修复：移除默认值，防止误判为记录项
});

defineEmits(["click", "edit", "delete"]);

const displayNutrition = computed(() => {
  const { food, isSnapshot, status } = props;
  if (isSnapshot || status === 'ghost') {
    return {
      calories: Math.round(food.calories || 0),
      protein: Number(food.protein || 0).toFixed(1),
      fat: Number(food.fat || 0).toFixed(1),
      carbs: Number(food.carbs || 0).toFixed(1),
    };
  }
  return { calories: 0, protein: '0', fat: '0', carbs: '0' };
});

const displayQuantity = computed(() => {
  const { food, status } = props;
  const qty = food.quantity || food.baseCount || 100;
  // 防御性逻辑：物理去除单位中可能存在的 100 字样
  const cleanUnit = (food.unit || 'g').replace(/[0-9]/g, '');
  return `${qty}${cleanUnit}`;
});

const getCategoryBg = (cat: string) => FOOD_CATEGORIES.find(c => c.key === cat)?.theme.bg || "bg-gray-50";
</script>