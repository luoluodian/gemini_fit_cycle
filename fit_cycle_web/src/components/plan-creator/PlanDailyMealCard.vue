<template>
  <GlassCard
    background="#ffffff"
    :card-class="[
      'border-[1rpx] border-solid border-gray-200 flex flex-col min-h-0',
      flex ? 'flex-1 h-full' : '',
    ]"
    :border="false"
  >
    <!-- 头部 -->
    <view class="flex items-center justify-between mb-4 flex-shrink-0">
      <view class="flex items-center">
        <view class="w-1 h-4 bg-orange-500 rounded-full mr-2"></view>
        <text class="text-sm font-black text-gray-800">当日餐单</text>
      </view>
      <text class="text-[16rpx] text-gray-300 font-black">
        {{ totalFoodsCount }} 个食物
      </text>
    </view>

    <!-- 滚动列表 -->
    <BaseScrollView
      :height="flex ? undefined : maxHeight"
      content-class="pb-1"
    >
      <MealSection
        v-for="meal in mealOrder"
        :key="meal"
        :title="getMealLabel(meal)"
        :icon="getMealIcon(meal)"
        :foods="meals[meal] || []"
        :is-expanded="expandedMealKey === meal"
        @edit="$emit('edit-meal', meal)"
        @delete-food="(idx) => $emit('delete-food', meal, idx)"
        @show-menu="$emit('meal-menu', meal)"
        @toggle="handleToggleMeal(meal)"
      />

      <!-- 添加餐次按钮 -->
      <view
        v-if="showAddButton"
        class="w-full py-3 border-[1rpx] border-dashed border-emerald-100 bg-emerald-50/10 rounded-xl flex items-center justify-center active:bg-emerald-50 transition-all mt-1"
        @click="$emit('add-meal')"
      >
        <text class="text-[20rpx] font-black text-emerald-600/60"
          >+ 添加自定义餐次</text
        >
      </view>
    </BaseScrollView>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import GlassCard from "../common/GlassCard.vue";
import BaseScrollView from "../common/BaseScrollView.vue";
import MealSection from "./MealSection.vue";

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
  mealOrder: string[];
  meals: Record<string, Food[]>;
  showAddButton?: boolean;
  maxHeight?: string | number;
  flex?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAddButton: false,
  maxHeight: "500rpx",
  flex: false,
});

defineEmits(["edit-meal", "delete-food", "add-meal", "meal-menu"]);

const expandedMealKey = ref<string | null>(null);

const handleToggleMeal = (key: string) => {
  expandedMealKey.value = expandedMealKey.value === key ? null : key;
};

const totalFoodsCount = computed(() => {
  return Object.values(props.meals).reduce((acc, curr) => acc + curr.length, 0);
});

const getMealLabel = (type: string) => {
  const map: any = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snacks: "加餐",
  };
  return map[type] || type;
};

const getMealIcon = (type: string) => {
  const map: any = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snacks: "🍎" };
  return map[type] || "🍽️";
};
</script>
