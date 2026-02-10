<template>
  <view class="min-h-screen bg-gray-50">
    <BaseNavBar title="今日记录" />
    
    <view class="px-4 py-6 pb-20">
      <!-- 1. 日期导航 -->
      <DateNavigation 
        v-model="currentDate" 
        :plan-id="currentRecord?.planId" 
      />

      <!-- 2. 营养汇总 (由 Store 驱动) -->
      <view v-if="isLoading" class="animate-pulse space-y-4 mb-6">
        <view class="h-48 bg-white rounded-2xl"></view>
      </view>
      <DailyGoalsOverview
        v-else-if="currentRecord"
        :goals="currentRecord"
        :consumed="summary"
      />

      <!-- 3. 餐次列表 -->
      <view class="space-y-4 mb-6 mt-6">
        <MealCard
          v-for="type in mealTypes"
          :key="type.key"
          :title="type.label"
          :meal-type="type.key"
          :meals="getMealsByType(type.key)"
          :date="currentDate"
          @add="handleAddFood"
          @refresh="loadData"
        />
      </view>
    </view>

    <!-- 食物选择弹窗 -->
    <FoodPicker
      v-model:visible="foodPickerVisible"
      @select="handleFoodPicked"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDidShow } from "@tarojs/taro";
import { getTodayString } from "@/utils";
import { useNutritionStats } from "@/composables/useNutritionStats";
import DateNavigation from "@/components/home/DateNavigation.vue";
import DailyGoalsOverview from "@/components/home/DailyGoalsOverview.vue";
import MealCard from "@/components/home/HomeMealCard.vue";
import FoodPicker from "@/components/food/FoodPicker.vue";
import { useNavigationStore } from "@/stores/navigation";
import "./index.scss";

// --- 核心逻辑归口：使用 Composable ---
const { 
  currentRecord, 
  isLoading, 
  summary, 
  getMealsByType, 
  fetchRecord 
} = useNutritionStats();

const currentDate = ref<string>(getTodayString());
const foodPickerVisible = ref(false);
const currentMealType = ref<string>("");
const navStore = useNavigationStore();

const mealTypes = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snacks', label: '加餐' }
];

const loadData = async (date: string) => {
  try {
    await fetchRecord(date);
  } catch (e) {
    // 错误处理已在 Store 中包含通用逻辑，此处可根据需要补充 UI 反馈
  }
};

const handleAddFood = (type: string) => {
  currentMealType.value = type;
  foodPickerVisible.value = true;
};

const handleFoodPicked = async (payload: any) => {
  // 记录保存逻辑将由 R-3 最终对接
};

useDidShow(() => {
  navStore.setActiveTab(0);
});

// 日期切换触发全量加载
watch(currentDate, (newDate) => {
  loadData(newDate);
}, { immediate: true });
</script>
