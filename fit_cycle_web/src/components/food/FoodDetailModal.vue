<template>
  <BaseModal
    :visible="modalVisible"
    :show-header="false"
    position="center"
    @close="handleClose"
    @update:visible="(val) => (modalVisible = val)"
    content-class="w-[85vw] overflow-x-hidden bg-white rounded-3xl"
  >
    <!-- Custom Top Bar -->
    <view class="flex items-center justify-between mb-4 px-1">
      <view
        class="p-2 text-gray-400 active:opacity-60 transition-all"
        @click="handleClose"
      >
        <Close font-size="18"></Close>
      </view>

      <text
        class="text-base font-black text-gray-800 truncate px-2 flex-1 text-center"
        >{{ food?.name || "食物名称" }}</text
      >

      <!-- Favorite Button (Only in view mode or if specified) -->
      <view
        v-if="mode === 'view'"
        class="p-2 transition-all active:scale-95"
        @click="handleToggleFavorite"
      >
        <HeartFill v-if="isFavorite" font-size="24" color="#ef4444"></HeartFill>
        <Heart v-else font-size="24" color="#d1d5db"></Heart>
      </view>
      <view v-else class="w-10"></view>
    </view>

    <view v-if="food" class="pb-6 px-4 overflow-x-hidden">
      <!-- Hero: Icon + Category -->
      <view class="text-center mb-5">
        <text class="text-5xl mb-3 block leading-none animate-pop-in">{{
          food.imageUrl || food.emoji || "🍎"
        }}</text>
        <view
          class="inline-block px-3 py-1 bg-emerald-50 rounded-full border border-solid border-emerald-100"
        >
          <text class="text-[20rpx] font-black text-emerald-600 leading-none">{{
            getCategoryLabel(food.category)
          }}</text>
        </view>
      </view>

      <!-- Description -->
      <view v-if="food.description" class="mb-5 px-2">
        <text
          class="text-[22rpx] text-gray-400 text-center leading-relaxed block break-all font-bold"
          >{{ food.description }}</text
        >
      </view>

      <!-- Nutrition Card (Dynamic based on quantity if in edit mode) -->
      <view
        class="bg-gray-50 rounded-2xl p-4 mb-6 border border-solid border-gray-100"
      >
        <view class="flex items-center justify-center space-x-2 mb-4">
          <text class="text-[18rpx] text-gray-400 font-black"
            >预计摄入营养</text
          >
          <text class="text-[18rpx] text-gray-200">|</text>
          <text class="text-[18rpx] text-gray-500 font-black">
            {{ mode === "edit" ? localQuantity : food.baseCount || 100
            }}{{ food.unit || "g" }}
          </text>
        </view>

        <view class="grid grid-cols-4 gap-1">
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block font-black"
              >碳水</text
            >
            <text class="text-sm font-black text-amber-500 block"
              >{{ displayNutrition.carbs }}g</text
            >
          </view>
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block font-black"
              >蛋白质</text
            >
            <text class="text-sm font-black text-rose-500 block"
              >{{ displayNutrition.protein }}g</text
            >
          </view>
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block font-black"
              >脂肪</text
            >
            <text class="text-sm font-black text-blue-500 block"
              >{{ displayNutrition.fat }}g</text
            >
          </view>
          <view class="text-center">
            <text class="text-[18rpx] text-gray-400 mb-1 block font-black"
              >热量</text
            >
            <text class="text-sm font-black text-emerald-500 block">{{
              displayNutrition.calories
            }}</text>
          </view>
        </view>
      </view>

      <!-- Mode: Edit (Quantity Selector + Actions) -->
      <view v-if="mode === 'edit'" class="space-y-6">
        <view class="flex justify-center">
          <QuantityStepper v-model="localQuantity" :unit="food.unit || 'g'" />
        </view>

        <view class="flex gap-3">
          <view
            class="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-black text-center active:scale-[0.98] transition-all"
            @tap="handleClose"
          >
            取消
          </view>
          <view
            class="flex-[2] bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-center active:scale-[0.98] transition-all shadow-lg shadow-emerald-100"
            @tap="handleConfirm"
          >
            确认添加
          </view>
        </view>
      </view>

      <!-- Slot for extra content (backward compatibility) -->
      <slot name="footer"></slot>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "../common/BaseModal.vue";
import QuantityStepper from "./QuantityStepper.vue";
import { Heart, HeartFill, Close } from "@nutui/icons-vue-taro";
import { FOOD_CATEGORIES } from "@/constants/food-categories";

interface Props {
  visible: boolean;
  food: any | null;
  isFavorite?: boolean;
  mode?: "view" | "edit";
  quantity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "view",
  isFavorite: false,
});

const emit = defineEmits<{
  close: [];
  toggleFavorite: [food: any];
  confirm: [result: { food: any; quantity: number }];
}>();

const localQuantity = ref(100);

// Sync local quantity when modal opens or food changes
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.food) {
      localQuantity.value = props.quantity || props.food.baseCount || 100;
    }
  },
);

const displayNutrition = computed(() => {
  if (!props.food) return { calories: 0, protein: 0, fat: 0, carbs: 0 };

  const baseCount = props.food.baseCount || 100;
  // View 模式下显示基准营养，Edit 模式下显示 localQuantity 对应的营养
  const targetQuantity =
    props.mode === "edit" ? localQuantity.value : baseCount;
  const ratio = targetQuantity / baseCount;

  return {
    calories: Math.round((props.food.calories || 0) * ratio),
    protein: (Math.round((props.food.protein || 0) * ratio * 10) / 10).toFixed(
      1,
    ),
    fat: (Math.round((props.food.fat || 0) * ratio * 10) / 10).toFixed(1),
    carbs: (Math.round((props.food.carbs || 0) * ratio * 10) / 10).toFixed(1),
  };
});

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) emit("close");
  },
});

const getCategoryLabel = (cat: string) => {
  const target = FOOD_CATEGORIES.find((c) => c.key === cat);
  return target ? target.label : "其他";
};

const handleClose = () => emit("close");
const handleToggleFavorite = () =>
  props.food && emit("toggleFavorite", props.food);
const handleConfirm = () => {
  if (props.food) {
    emit("confirm", { food: props.food, quantity: localQuantity.value });
  }
};
</script>

<style scoped lang="scss">
@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-pop-in {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
