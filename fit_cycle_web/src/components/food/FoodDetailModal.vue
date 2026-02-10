<template>
  <BaseModal
    :visible="modalVisible"
    :show-header="false"
    position="center"
    :z-index="200000"
    @close="handleClose"
    @update:visible="(val) => (modalVisible = val)"
    content-class="w-[85vw] overflow-x-hidden bg-white rounded-3xl"
  >
    <!-- 头部栏 -->
    <view class="flex items-center justify-between mb-4 pt-4 px-4">
      <view class="w-10 h-10 flex items-center justify-center text-gray-400 active:opacity-60" @click="handleClose">
        <Close :size="18"></Close>
      </view>
      <text class="text-base font-black text-gray-800 truncate px-2 flex-1 text-center">
        {{ isEditMode ? '修改记录' : (food?.name || "食物详情") }}
      </text>
      <view class="w-10 h-10"></view>
    </view>

    <view v-if="food" class="pb-6 px-4">
      <!-- 食物图标 -->
      <view class="text-center mb-5">
        <text class="text-5xl mb-3 block leading-none animate-pop-in">{{ food.imageUrl || food.emoji || "🍎" }}</text>
        <view class="inline-block px-3 py-1 bg-emerald-50 rounded-full border border-solid border-emerald-100">
          <text class="text-[20rpx] font-black text-emerald-600">{{ getCategoryLabel(food.category) }}</text>
        </view>
      </view>

      <!-- 营养统计卡片 (动态计算) -->
      <view class="bg-gray-50 rounded-2xl p-4 mb-6 border border-solid border-gray-100">
        <view class="flex items-center justify-center space-x-2 mb-4">
          <text class="text-[18rpx] text-gray-400 font-black">当前设定摄入</text>
          <text class="text-[18rpx] text-gray-500 font-black">{{ localQuantity }}{{ food.unit || "g" }}</text>
        </view>

        <view class="grid grid-cols-4 gap-1">
          <NutritionMacro label="热量" :value="displayNutrition.calories" unit="kcal" color="text-emerald-500" />
          <NutritionMacro label="蛋白质" :value="displayNutrition.protein" unit="g" color="text-rose-500" />
          <NutritionMacro label="碳水" :value="displayNutrition.carbs" unit="g" color="text-amber-500" />
          <NutritionMacro label="脂肪" :value="displayNutrition.fat" unit="g" color="text-blue-500" />
        </view>
      </view>

      <!-- 交互区 -->
      <view class="space-y-6">
        <view class="flex justify-center">
          <QuantityStepper v-model="localQuantity" :unit="food.unit || 'g'" />
        </view>

        <view class="flex gap-3">
          <view class="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-black text-center active:scale-95 transition-all" @click="handleClose">
            取消
          </view>
          <view 
            class="flex-[2] bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-center active:scale-95 transition-all shadow-lg shadow-emerald-100" 
            @click="handleConfirm"
          >
            {{ isEditMode ? '保存修改' : '确认添加' }}
          </view>
        </view>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "../common/BaseModal.vue";
import QuantityStepper from "./QuantityStepper.vue";
import NutritionMacro from "./NutritionMacro.vue"; // 抽离的小组件
import { Close } from "@nutui/icons-vue-taro";
import { FOOD_CATEGORIES } from "@/constants/food-categories";

interface Props {
  visible: boolean;
  food: any | null;
  mode?: "view" | "edit";
  quantity?: number;
}

const props = withDefaults(defineProps<Props>(), { mode: "view" });
const emit = defineEmits(["close", "confirm"]);

const localQuantity = ref(100);
const isEditMode = computed(() => props.mode === 'edit');

watch([() => props.visible, () => props.food], ([newVis, newFood]) => {
  if (newVis && newFood) {
    // 如果是编辑已有记录，使用传入的 quantity，否则使用食材默认 baseCount
    localQuantity.value = props.quantity || newFood.quantity || newFood.baseCount || 100;
  }
}, { immediate: true });

const displayNutrition = computed(() => {
  if (!props.food) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const base = props.food.baseCount || 100;
  // 统一计算：所有 food 对象现在都应包含 base_ 系列快照或原始数值
  const calories = props.food.baseCalories || props.food.calories || 0;
  const protein = props.food.baseProtein || props.food.protein || 0;
  const fat = props.food.baseFat || props.food.fat || 0;
  const carbs = props.food.baseCarbs || props.food.carbs || 0;
  
  const ratio = localQuantity.value / base;
  return {
    calories: Math.round(calories * ratio),
    protein: (protein * ratio).toFixed(1),
    fat: (fat * ratio).toFixed(1),
    carbs: (carbs * ratio).toFixed(1),
  };
});

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => !val && emit("close")
});

const getCategoryLabel = (cat: string) => FOOD_CATEGORIES.find(c => c.key === cat)?.label || "其他";
const handleClose = () => emit("close");
const handleConfirm = () => emit("confirm", { food: props.food, quantity: localQuantity.value });
</script>