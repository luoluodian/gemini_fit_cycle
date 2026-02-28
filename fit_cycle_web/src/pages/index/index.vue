<template>
  <view class="min-h-screen bg-gray-50">
    <BaseNavBar title="今日记录" />
    
    <view class="px-4 py-6 pb-tabbar">
      <DateNavigation v-model="currentDate" :plan="computedPlanInfo" />

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
          @edit="handleRequestEdit"
          @delete="handlePerformDelete"
        />

        <!-- 🚀 补全入口：如果计划外还有未显示的分类，提供快速入口 -->
        <view 
          v-if="availableExtraMeals.length > 0"
          class="p-4 bg-gray-100/50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center space-x-4 active:bg-gray-100 transition-colors"
          @click="handleShowExtraMenu"
        >
          <text class="text-xs text-gray-400 font-bold tracking-widest">+ 记录计划外餐次</text>
        </view>
      </view>
    </view>

    <!-- 食材库选择弹窗 (新增用) -->
    <FoodPicker v-model:visible="foodPickerVisible" @select="handleFoodPicked" />

    <!-- 🚀 核心优化：修改弹窗 -->
    <FoodDetailModal
      :visible="editModalVisible"
      :food="editingFood"
      mode="edit"
      @close="closeEditModal"
      @confirm="handleConfirmEdit"
      @sync="handleSyncFoodData"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import { getTodayString, getDateDiff } from "@/utils";
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
const editModalVisible = ref(false);
const editingFood = ref<any>(null);
const currentMealType = ref("");
const isSubmitting = ref(false);
const navStore = useNavigationStore();

/**
 * 🚀 核心优化：动态餐次列表
 * 将标准 4 餐与计划中的自定义餐次合并并去重
 */
const mealTypes = computed(() => {
  const standard = [
    { key: 'breakfast', label: '早餐', order: 1 },
    { key: 'lunch', label: '午餐', order: 2 },
    { key: 'dinner', label: '晚餐', order: 3 },
    { key: 'snacks', label: '加餐', order: 4 }
  ];

  const plannedDay = recordStore.plannedDay;
  const actualLogs = recordStore.mealLogs || [];
  const result: { key: string; label: string; order: number }[] = [];

  // 1. 提取计划中的餐次
  if (plannedDay?.planMeals) {
    plannedDay.planMeals.forEach((pm: any) => {
      const code = pm.mealType?.code;
      const text = pm.note || pm.mealType?.text;
      const order = pm.mealType?.value || pm.mealType?.sortOrder || 99;
      const finalKey = code || `custom_${pm.id}`;
      if (!result.some(r => r.key === finalKey)) {
        result.push({ key: finalKey, label: text || '自定义餐次', order });
      }
    });
  }

  // 2. 核心补全：如果某标准餐次不在计划中，但已有记录，必须显示
  standard.forEach(s => {
    const hasLogs = actualLogs.some(log => log.mealType === s.key);
    if (hasLogs && !result.some(r => r.key === s.key)) {
      result.push(s);
    }
  });

  // 3. 兜底策略：如果没有任何餐次（空计划），显示标准 4 餐以供记录
  if (result.length === 0) {
    return standard;
  }

  return result.sort((a, b) => a.order - b.order);
});

/**
 * 聚合计划展示信息
 */
const computedPlanInfo = computed(() => {
  const plan = currentRecord.value?.plan;
  if (!plan) return undefined;

  const dayOffset = getDateDiff(plan.startDate, currentDate.value);
  const totalDays = plan.cycleDays * plan.cycleCount;
  
  return {
    planName: plan.name,
    currentDay: dayOffset + 1,
    cycleDays: totalDays
  };
});

// 计算还未显示的标准餐次
const availableExtraMeals = computed(() => {
  const standard = [
    { key: 'breakfast', label: '早餐' },
    { key: 'lunch', label: '午餐' },
    { key: 'dinner', label: '晚餐' },
    { key: 'snacks', label: '加餐' }
  ];
  const shownKeys = mealTypes.value.map(t => t.key);
  return standard.filter(s => !shownKeys.includes(s.key));
});

const handleShowExtraMenu = () => {
  const options = availableExtraMeals.value.map(m => m.label);
  Taro.showActionSheet({
    itemList: options,
    success: (res) => {
      const selected = availableExtraMeals.value[res.tapIndex];
      handleShowPicker(selected.key);
    }
  });
};

const handleShowPicker = (type: string) => {
  currentMealType.value = type;
  foodPickerVisible.value = true;
};

/**
 * 业务核心：修改逻辑重构
 * 1. 弹出询问是否修改
 * 2. 如果是，弹出 FoodDetailModal
 * 3. 确认后设为未记录并保存
 */
const handleRequestEdit = (food: any) => {
  if (!food.id) return;
  
  Taro.showModal({
    title: '确认修改',
    content: '确定要修改这项记录吗？修改完成后将变为“未记录”状态（需再次点击打卡确认）。',
    success: (res) => {
      if (res.confirm) {
        editingFood.value = food;
        editModalVisible.value = true;
      }
    }
  });
};

const closeEditModal = () => {
  editModalVisible.value = false;
  editingFood.value = null;
};

const handleConfirmEdit = async (payload: { food: any; quantity: number }) => {
  if (!editingFood.value?.id) return;
  
  try {
    Taro.showLoading({ title: '正在同步...', mask: true });
    // 设为未记录 (false) 并更新摄入量
    await recordStore.updateMealAction(editingFood.value.id, { 
      quantity: payload.quantity,
      isRecorded: false 
    });
    
    closeEditModal();
    Taro.showToast({ title: '修改成功', icon: 'success' });
  } catch (e) {
    Taro.showToast({ title: '修改失败', icon: 'none' });
  } finally {
    Taro.hideLoading();
  }
};

const handleSyncFoodData = async (latestFoodItem: any) => {
  if (!editingFood.value?.id) return;
  try {
    Taro.showLoading({ title: '同步数据中...', mask: true });
    await recordStore.syncMealAction(editingFood.value.id, latestFoodItem);
    Taro.showToast({ title: '同步完成', icon: 'success' });
    closeEditModal();
  } catch (e) {
    Taro.showToast({ title: '同步失败', icon: 'none' });
  } finally {
    Taro.hideLoading();
  }
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