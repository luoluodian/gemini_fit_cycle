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
    <view class="flex items-center justify-between mb-4">
      <view class="w-10 h-10 flex items-center justify-center text-gray-400 active:opacity-60" @click="handleClose">
        <Close :size="18"></Close>
      </view>
      <text class="text-base font-black text-gray-800 truncate px-2 flex-1 text-center">
        {{ food?.name || food?.foodName || "食物详情" }}
      </text>
      <view class="w-10 h-10 flex items-center justify-center">
        <view 
          v-if="showFavorite" 
          @click="$emit('toggleFavorite', food)"
          class="transition-all active:scale-90"
        >
          <HeartFill v-if="isFavorite" :size="22" color="#ef4444"></HeartFill>
          <Heart v-else :size="22" color="#d1d5db"></Heart>
        </view>
      </view>
    </view>

    <view v-if="food" class="pb-2">
      <view class="text-center mb-5">
        <text class="text-5xl mb-3 block leading-none animate-pop-in">{{ food.imageUrl || food.emoji || "🍎" }}</text>
        <view class="inline-block px-3 py-1 bg-emerald-50 rounded-full border border-solid border-emerald-100">
          <text class="text-[20rpx] font-black text-emerald-600">{{ getCategoryLabel(food.category) }}</text>
        </view>
      </view>

      <view class="bg-gray-50 rounded-2xl p-4 mb-6 border border-solid border-gray-100">
        <view class="flex items-center justify-center space-x-2 mb-4">
          <text class="text-[18rpx] text-gray-400 font-black">设定摄入</text>
          <text class="text-[18rpx] text-gray-500 font-black">{{ localQuantity }}{{ food.unit || "g" }}</text>
        </view>

        <view class="grid grid-cols-4 gap-1">
          <NutritionMacro label="热量" :value="displayNutrition.calories" unit="kcal" color="text-emerald-500" />
          <NutritionMacro label="蛋白质" :value="displayNutrition.protein" unit="g" color="text-rose-500" />
          <NutritionMacro label="碳水" :value="displayNutrition.carbs" unit="g" color="text-amber-500" />
          <NutritionMacro label="脂肪" :value="displayNutrition.fat" unit="g" color="text-blue-500" />
        </view>
      </view>

      <view class="space-y-6">
        <!-- 只有在确认录入模式下显示步进器 -->
        <view v-if="showConfirm" class="flex justify-center">
          <QuantityStepper v-model="localQuantity" :unit="food.unit || 'g'" />
        </view>

        <!-- 食材库查看模式下的额外操作 (自建食物) -->
        <view v-if="!showConfirm && isCustom" class="flex items-center justify-center gap-6 py-2">
          <view class="flex flex-col items-center gap-1 active:opacity-60" @click="$emit('edit', food)">
            <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-solid border-gray-200">
              <Edit :size="18" color="#6b7280"></Edit>
            </view>
            <text class="text-[20rpx] font-bold text-gray-500">修改</text>
          </view>
          <view class="flex flex-col items-center gap-1 active:opacity-60" @click="$emit('delete', food)">
            <view class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-solid border-red-100">
              <Del :size="18" color="#ef4444"></Del>
            </view>
            <text class="text-[20rpx] font-bold text-red-400">删除</text>
          </view>
        </view>

        <view class="flex gap-3">
          <view 
            class="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-black text-center active:scale-95 transition-all" 
            @click="handleClose"
          >
            {{ showConfirm ? '取消' : '关闭' }}
          </view>
          <view 
            v-if="showConfirm"
            class="flex-[2] bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-center active:scale-95 transition-all shadow-lg shadow-emerald-100" 
            @click="handleConfirm"
          >
            {{ isEditMode ? '保存修改' : '新增食物' }}
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
import NutritionMacro from "./NutritionMacro.vue";
import { Close, Heart, HeartFill, Edit, Del } from "@nutui/icons-vue-taro";
import { FOOD_CATEGORIES } from "@/constants/food-categories";

interface Props {
  visible: boolean;
  food: any | null;
  mode?: "view" | "edit";
  quantity?: number;
  showConfirm?: boolean;
  isFavorite?: boolean;
  showFavorite?: boolean;
}

const props = withDefaults(defineProps<Props>(), { 
  mode: "view",
  showConfirm: true,
  isFavorite: false,
  showFavorite: true
});
const emit = defineEmits(["close", "confirm", "toggleFavorite", "edit", "delete"]);

const localQuantity = ref(100);
const isEditMode = computed(() => props.mode === 'edit');

// 是否为自定义食物（允许编辑/删除）
const isCustom = computed(() => props.food?.type === 'custom' || props.food?.isCustom);

watch([() => props.visible, () => props.food], ([newVis, newFood]) => {
  if (newVis && newFood) {
    // 逻辑：修改模式取传入量，已有记录取记录量，新增取基准量
    const defaultQty = props.quantity ?? newFood.quantity ?? newFood.baseCount ?? 100;
    localQuantity.value = Number(defaultQty);
  }
}, { immediate: true });

const displayNutrition = computed(() => {
  if (!props.food) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const base = props.food.baseCount || 100;
  // 无论是什么对象，优先取快照基准值，否则取原始值
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
