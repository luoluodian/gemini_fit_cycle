<template>
  <view class="min-h-screen bg-gray-50">
    <BaseNavBar title="今日记录" />
    
    <view class="px-4 py-6 pb-20">
      <!-- 1. 日期导航 -->
      <DateNavigation v-model="currentDate" :plan-id="currentRecord?.planId" />

      <!-- 2. 营养汇总 -->
      <view v-if="isLoading" class="animate-pulse mb-6">
        <view class="h-48 bg-white rounded-2xl shadow-sm"></view>
      </view>
      <DailyGoalsOverview v-else-if="currentRecord" :goals="currentRecord" :consumed="summary" />

      <!-- 3. 餐次列表 -->
      <view class="space-y-4 mb-6 mt-6">
        <MealCard
          v-for="type in mealTypes"
          :key="type.key"
          :title="type.label"
          :meal-type="type.key"
          :meals="getMealsByType(type.key)"
          :date="currentDate"
          @add="handleShowPicker"
          @edit="handleShowEditor"
          @delete="handlePerformDelete"
        />
      </view>
    </view>

    <!-- 弹窗：食材选择器 -->
    <FoodPicker v-model:visible="foodPickerVisible" @select="handleFoodPicked" />

    <!-- 弹窗：修改编辑器 -->
    <FoodDetailModal
      :visible="editorVisible"
      :food="editingLog"
      mode="edit"
      :quantity="editingLog?.quantity"
      @close="editorVisible = false"
      @confirm="handleConfirmEditToUnrecord"
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
import FoodDetailModal from "@/components/food/FoodDetailModal.vue";
import { useNavigationStore } from "@/stores/navigation";
import "./index.scss";

const { currentRecord, isLoading, summary, getMealsByType, fetchRecord } = useNutritionStats();
const recordStore = useRecordStore();
const currentDate = ref(getTodayString());
const foodPickerVisible = ref(false);
const editorVisible = ref(false);
const editingLog = ref<any>(null);
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

const handleShowEditor = (log: any) => {
  editingLog.value = log;
  editorVisible.value = true;
};

/**
 * 业务 1: 处理删除
 */
const handlePerformDelete = (food: any) => {
  if (!food.id) return;
  Taro.showModal({
    title: '确认删除',
    content: `确定要移除「${food.foodName || '这项记录'}」吗？`,
    confirmColor: '#ef4444',
    success: async (res) => {
      if (res.confirm) {
        await recordStore.removeMealAction(food.id);
        Taro.showToast({ title: '已移除', icon: 'success' });
      }
    }
  });
};

/**
 * 业务 2: 处理新增 (正确传递 mode)
 */
const handleFoodPicked = async (payload: { food: any; quantity: number }) => {
  if (isSubmitting.value) return;
  try {
    isSubmitting.value = true;
    Taro.showLoading({ title: '记录中...', mask: true });
    await recordStore.addMealLogAction({
      date: currentDate.value,
      mealType: currentMealType.value,
      foodId: Number(payload.food.id),
      quantity: Number(payload.quantity)
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

/**
 * 业务 3: 修改变回未记录逻辑 (Req 1 & 4)
 * 点击修改保存后，直接执行物理删除，使 UI 回归灰色建议态
 */
const handleConfirmEditToUnrecord = async () => {
  if (!editingLog.value?.id) return;
  
  Taro.showModal({
    title: '确认修改',
    content: '修改后该食材将变为未记录状态，确定保存吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          Taro.showLoading({ title: '正在处理...', mask: true });
          // 执行物理删除，UI 匹配算法会自动将其变回灰色 ghost
          await recordStore.removeMealAction(editingLog.value.id);
          editorVisible.value = false;
          Taro.showToast({ title: '已重置为未记录', icon: 'success' });
        } catch (e) {
          Taro.showToast({ title: '操作失败', icon: 'none' });
        } finally {
          Taro.hideLoading();
        }
      }
    }
  });
};

useDidShow(() => {
  navStore.setActiveTab(0);
  fetchRecord(currentDate.value);
});

watch(currentDate, (newDate) => fetchRecord(newDate));
</script>
