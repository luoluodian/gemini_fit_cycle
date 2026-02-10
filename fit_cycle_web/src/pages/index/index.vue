<template>
  <view class="min-h-screen bg-gray-50">
    <BaseNavBar title="今日记录" />
    
    <view class="px-4 py-6 pb-20">
      <!-- 1. 日期导航 -->
      <DateNavigation 
        v-model="currentDate" 
        :plan-id="currentRecord?.planId" 
      />

      <!-- 2. 营养汇总 -->
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
import Taro, { useDidShow } from "@tarojs/taro";
import { getTodayString } from "@/utils";
import { useNutritionStats } from "@/composables/useNutritionStats";
import { useRecordStore } from "@/stores/record";
import DateNavigation from "@/components/home/DateNavigation.vue";
import DailyGoalsOverview from "@/components/home/DailyGoalsOverview.vue";
import MealCard from "@/components/home/HomeMealCard.vue";
import FoodPicker from "@/components/food/FoodPicker.vue";
import { useNavigationStore } from "@/stores/navigation";
import "./index.scss";

// --- 核心逻辑归口 ---
const { 
  currentRecord, 
  isLoading, 
  summary, 
  getMealsByType, 
  fetchRecord 
} = useNutritionStats();

const recordStore = useRecordStore();
const currentDate = ref<string>(getTodayString());
const foodPickerVisible = ref(false);
const currentMealType = ref<string>("");
const isSubmitting = ref(false);
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
    console.error("Load failed", e);
  }
};

const handleAddFood = (type: string) => {
  currentMealType.value = type;
  foodPickerVisible.value = true;
};

/**
 * I-4.1: 处理打卡保存
 */
const handleFoodPicked = async (payload: { food: any; quantity: number }) => {
  if (isSubmitting.value) return;
  
  try {
    isSubmitting.value = true;
    Taro.showLoading({ title: '记录中...', mask: true });
    
    await recordStore.addMealLogAction({
      date: currentDate.value,
      mealType: currentMealType.value,
      foodId: payload.food.id,
      quantity: payload.quantity
    });
    
    Taro.showToast({ title: '记录成功', icon: 'success' });
    foodPickerVisible.value = false;
  } catch (e: any) {
    Taro.showToast({ 
      title: e.message || '记录失败，请重试', 
      icon: 'none' 
    });
  } finally {
    isSubmitting.value = false;
    Taro.hideLoading();
  }
};

useDidShow(() => {
  navStore.setActiveTab(0);
});

watch(currentDate, (newDate) => {
  loadData(newDate);
}, { immediate: true });
</script>