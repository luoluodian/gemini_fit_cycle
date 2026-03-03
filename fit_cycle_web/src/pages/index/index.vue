<template>
  <view class="min-h-screen bg-gray-50">
    <BaseNavBar title="今日记录" back-mode="none" />
    
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
 * 🚀 核心优化：动态餐次列表 (智能排序)
 * 排序逻辑：
 * 1. 待办优先：包含 ghost (计划待记录) 或 draft (已添加待确认) 的餐次置顶
 * 2. 时间匹配：匹配当前小时所属的餐次紧随其后 (早 5-10, 午 11-14, 晚 17-21)
 * 3. 自然顺序：早餐 -> 午餐 -> 晚餐 -> 加餐
 */
const mealTypes = computed(() => {
  const standard = [
    { key: "breakfast", label: "早餐", order: 1, range: [5, 10] },
    { key: "lunch", label: "午餐", order: 2, range: [11, 14] },
    { key: "dinner", label: "晚餐", order: 3, range: [17, 21] },
    { key: "snacks", label: "加餐", order: 4, range: [0, 24] },
  ];

  const plannedDay = recordStore.plannedDay;
  const actualLogs = recordStore.mealLogs || [];
  const result: {
    key: string;
    label: string;
    order: number;
    range?: number[];
  }[] = [];

  // 1. 提取计划中的餐次
  if (plannedDay?.planMeals) {
    plannedDay.planMeals.forEach((pm: any) => {
      const code = pm.mealType?.code;
      const text = pm.note || pm.mealType?.text;
      const order = pm.mealType?.value || pm.mealType?.sortOrder || 99;
      const finalKey = code || `custom_${pm.id}`;
      if (!result.some((r) => r.key === finalKey)) {
        // 尝试匹配标准时间范围
        const std = standard.find((s) => s.key === code);
        result.push({
          key: finalKey,
          label: text || "自定义餐次",
          order,
          range: std?.range,
        });
      }
    });
  }

  // 2. 核心补全：如果某标准餐次不在计划中，但已有记录，必须显示
  standard.forEach((s) => {
    const hasLogs = actualLogs.some((log) => log.mealType === s.key);
    if (hasLogs && !result.some((r) => r.key === s.key)) {
      result.push(s);
    }
  });

  // 3. 兜底策略：如果没有任何餐次（空计划），显示标准 4 餐以供记录
  const finalResult = result.length === 0 ? [...standard] : result;

  // 4. 执行智能排序 (多维权重)
  const currentHour = new Date().getHours();

  return finalResult.sort((a, b) => {
    // 维度 1: 检查是否有未完成项 (Pending Status) - 绝对最高优先级
    const checkPending = (key: string) => {
      const logs = actualLogs.filter((l) => l.mealType === key);
      // 如果有任何项 isRecorded 为 false (或者是 0)，即为 pending
      const hasUnconfirmed = logs.some((l) => Number(l.isRecorded) === 0);

      // 检查计划中是否有 ghost (计划中有但 logs 中没对应的)
      let hasGhost = false;
      const pMeal = plannedDay?.planMeals?.find(
        (pm: any) => (pm.mealType?.code || `custom_${pm.id}`) === key,
      );
      if (pMeal?.mealItems) {
        hasGhost = pMeal.mealItems.some((pItem: any) => {
          const pFoodId = pItem.foodItemId || pItem.foodId;
          const pName = pItem.customName || pItem.foodName;
          return !logs.some(
            (l) =>
              (l.foodId && pFoodId && String(l.foodId) === String(pFoodId)) ||
              l.foodName === pName,
          );
        });
      }
      return hasUnconfirmed || hasGhost;
    };

    const isAPending = checkPending(a.key);
    const isBPending = checkPending(b.key);
    if (isAPending !== isBPending) return isAPending ? -1 : 1;

    // 维度 2: 检查当前时间匹配 (Time Focus) - 针对有定义范围的标准餐次
    const isATime =
      a.range && currentHour >= a.range[0] && currentHour <= a.range[1];
    const isBTime =
      b.range && currentHour >= b.range[0] && currentHour <= b.range[1];
    if (isATime !== isBTime) return isATime ? -1 : 1;

    // 维度 3: 最近操作活跃度 (Activity Focus) - 针对所有餐次，尤其是非标准餐次
    const getLatestTime = (key: string) => {
      const logs = actualLogs.filter((l) => l.mealType === key);
      if (logs.length === 0) return 0;
      return Math.max(
        ...logs.map((l) =>
          new Date(l.updatedAt || l.createdAt || 0).getTime(),
        ),
      );
    };
    const lastA = getLatestTime(a.key);
    const lastB = getLatestTime(b.key);
    if (lastA !== lastB) return lastB - lastA; // 刚录入过或修改过的往前排

    // 维度 4: 默认自然顺序 (Order) - 保底逻辑
    return a.order - b.order;
  });
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