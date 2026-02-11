<template>
  <view class="min-h-screen bg-gray-50">
    <BaseNavBar title="今日记录" />
    
    <view class="px-4 py-6 pb-20">
      <DateNavigation v-model="currentDate" :plan-id="currentRecord?.planId" />

      <view v-if="isLoading" class="animate-pulse mb-6">
        <view class="h-48 bg-white rounded-2xl shadow-sm"></view>
      </view>
      <DailyGoalsOverview v-else-if="currentRecord" :goals="currentRecord" :consumed="summary" />

      <view class="space-y-4 mb-6 mt-6">
        <MealCard
          v-for="type in mealTypes"
          :key="type.key"
          :title="type.label"
          :meal-type="type.key"
          :meals="getMealsByType(type.key)"
          :date="currentDate"
          @add="handleShowPicker"
          @edit="handleRequestToggleStatus"
          @delete="handlePerformDelete"
        />
      </view>
    </view>

    <!-- 仅用于新增的弹窗 -->
    <FoodPicker v-model:visible="foodPickerVisible" @select="handleFoodPicked" />
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

const { currentRecord, isLoading, summary, getMealsByType, fetchRecord } = useNutritionStats();
const recordStore = useRecordStore();
const currentDate = ref(getTodayString());
const foodPickerVisible = ref(false);
const currentMealType = ref("");
const isSubmitting = ref(false);
const navStore = useNavigationStore();

const mealTypes = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snacks', label: '加餐' }
];

const handleShowPicker = (type: string) => {
  currentMealType.value = type;
  foodPickerVisible.value = true;
};

/**
 * 业务核心：修改仅改变颜色状态 (Req 1 & 4)
 * 点击修改图标 -> 弹出确认 -> 设为未记录 (变灰)
 */
const handleRequestToggleStatus = (food: any) => {
  if (!food.id) return;
  
  Taro.showModal({
    title: '确认修改',
    content: '修改后该食材将变为未记录状态，确定吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await recordStore.updateMealAction(food.id, { isRecorded: false });
          Taro.showToast({ title: '已设为未记录', icon: 'none' });
        } catch (e) {
          console.error("状态切换失败", e);
        }
      }
    }
  });
};

const handlePerformDelete = (food: any) => {
  if (!food.id) return;
  Taro.showModal({
    title: '确认删除',
    content: `确定要移除「${food.foodName || '这项记录'}」吗？`,
    confirmColor: '#ef4444',
    success: async (res) => {
      if (res.confirm) {
        await recordStore.removeMealAction(food.id);
        Taro.showToast({ title: '已删除', icon: 'success' });
      }
    }
  });
};

const handleFoodPicked = async (payload: { food: any; quantity: number }) => {
  if (isSubmitting.value) return;
  try {
    isSubmitting.value = true;
    Taro.showLoading({ title: '记录中...', mask: true });
    await recordStore.addMealLogAction({
      date: currentDate.value,
      mealType: currentMealType.value,
      foodId: Number(payload.food.id),
      quantity: Number(payload.quantity),
      isPlanned: false // 手动新增的项
    });
    foodPickerVisible.value = false;
    Taro.showToast({ title: '记录成功', icon: 'success' });
  } catch (e: any) {
    Taro.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    isSubmitting.value = false;
    Taro.hideLoading();
  }
};

useDidShow(() => {
  navStore.setActiveTab(0);
  fetchRecord(currentDate.value);
});

watch(currentDate, (newDate) => fetchRecord(newDate));
</script>