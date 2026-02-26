<template>
  <PageLayout
    :title="dayName"
    :manual-handle-back="true"
    @back="handleBack"
  >
    <template #nav-right>
      <view class="text-right pr-2">
        <view class="text-[18rpx] text-gray-400 font-bold">当日摄入</view>
        <view class="text-sm font-black text-emerald-600 leading-none">
          {{ Math.round(recordStore.displaySummary.calories) }}/{{ targets.calories }}
        </view>
      </view>
    </template>

    <!-- 营养目标 -->
    <view class="px-0 pt-2">
      <NutritionTargets
        :targets="targets"
        :current-nutrition="recordStore.displaySummary"
        @edit="handleEditTargets"
      />
    </view>

    <!-- 餐次标签 -->
    <view class="px-0">
      <MealTabs :current-meal="currentMeal" @change="handleMealChange" />
    </view>

    <!-- 当前餐次内容 -->
    <view class="px-0">
      <MealCard
        :meal-name="currentMealName"
        :meal-calories="mealCalories"
        :foods="mappedMealFoods"
        @add-food="handleAddFood"
        @remove-food="handleRemoveFood"
      />
    </view>

    <!-- 快速建议 (根据计划建议) -->
    <view class="px-0" v-if="plannedSuggestions.length > 0">
      <QuickSuggestions
        :suggestions="plannedSuggestions"
        @add="handleAddQuickFood"
      />
    </view>

    <!-- 浮动操作按钮 -->
    <FloatingButtons
      @copy-meal="handleCopyMeal"
      @mark-complete="handleMarkComplete"
    />

    <template #footer>
      <!-- 底部操作栏 -->
      <BottomActions
        @save-exit="handleBack"
        @save-next="handleSaveAndNext"
      />
    </template>

    <!-- 添加食物模态框 -->
    <FoodPicker
      v-model:visible="foodModalVisible"
      title="选择食材"
      @select="handleSelectFood"
    />

    <!-- 编辑目标模态框 -->
    <TargetsModal
      :visible="targetsModalVisible"
      :targets="targets"
      @close="handleCloseTargetsModal"
      @save="handleSaveTargets"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Taro from "@tarojs/taro";
import PageLayout from "@/components/common/PageLayout.vue";
import NutritionTargets from "@/components/daily-plan/NutritionTargets.vue";
import MealTabs from "@/components/daily-plan/MealTabs.vue";
import MealCard from "@/components/common/MealCard.vue";
import QuickSuggestions from "@/components/daily-plan/QuickSuggestions.vue";
import FloatingButtons from "@/components/daily-plan/FloatingButtons.vue";
import BottomActions from "@/components/daily-plan/BottomActions.vue";
import FoodPicker from "@/components/food/FoodPicker.vue";
import TargetsModal from "@/components/daily-plan/TargetsModal.vue";
import { navigateBack, navigateTo, ROUTES } from "@/router";
import { useRouterParams } from "@/router/hooks";
import { showSuccess, showError, showModal, showLoading, hideToast } from "@/utils/toast";
import { useRecordStore } from "@/stores/record";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { Food } from "@/services/modules/record";
import { addDays, getDisplayDate } from "@/utils/date";
import "./index.scss";

const routerParams = useRouterParams<{ planId?: string; day?: string }>();
const planId = Number(routerParams.planId);
const dayNumber = Number(routerParams.day || 1);

const recordStore = useRecordStore();
const planStore = usePlanStore();

const planDetail = ref<any>(null);
const currentMeal = ref<"breakfast" | "lunch" | "dinner" | "snacks">("breakfast");
const foodModalVisible = ref(false);
const targetsModalVisible = ref(false);

const dayName = computed(() => `第 ${dayNumber} 天`);

// 核心日期计算 - 增加健壮性
const targetDate = computed(() => {
  const start = planDetail.value?.startDate;
  if (!start || isNaN(new Date(start).getTime())) return "";
  return addDays(start, dayNumber - 1);
});

// 目标营养素 (优先取记录快照，次之取计划模板)
const targets = computed(() => {
  if (recordStore.currentRecord?.id) {
    const r = recordStore.currentRecord;
    return {
      calories: r.targetCalories,
      protein: r.targetProtein,
      fat: r.targetFat,
      carbs: r.targetCarbs
    };
  }
  
  // 查找计划模板
  const template = planDetail.value?.planDays?.find((d: any) => d.dayNumber === dayNumber);
  return {
    calories: template?.targetCalories || 1800,
    protein: template?.targetProtein || 120,
    fat: template?.targetFat || 50,
    carbs: template?.targetCarbs || 180,
  };
});

// 数据映射：MealLog -> MealCard Food 接口
const mappedMealFoods = computed(() => {
  return recordStore.mealLogs
    .filter(log => log.mealType === currentMeal.value)
    .map(log => ({
      id: log.id, // 保留原 ID 以便删除
      name: log.foodName,
      quantity: log.quantity,
      unit: log.unit,
      calories: log.calories,
      protein: log.protein,
      fat: log.fat,
      carbs: log.carbs
    }));
});

// 计划建议食物 (显示在 QuickSuggestions)
const plannedSuggestions = computed(() => {
  if (!planDetail.value) return [];
  const template = planDetail.value.planDays?.find((d: any) => d.dayNumber === dayNumber);
  const typeIdMap: any = { breakfast: 1, lunch: 2, dinner: 3, snacks: 4 };
  const meal = template?.planMeals?.find((m: any) => m.mealTypeId === typeIdMap[currentMeal.value] || m.mealType?.id === typeIdMap[currentMeal.value]);
  
  return meal?.mealItems?.map((item: any) => ({
    foodId: item.foodId,
    name: item.customName,
    quantity: item.quantity,
    unit: item.unit,
    calories: item.calories,
    protein: item.protein,
    fat: item.fat,
    carbs: item.carbs
  })) || [];
});

const currentMealName = computed(() => {
  const names = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snacks: "加餐" };
  return names[currentMeal.value];
});

const mealCalories = computed(() => {
  return mappedMealFoods.value.reduce((total, food) => total + food.calories, 0);
});

const loadData = async () => {
  if (!planId) return;
  try {
    showLoading("数据同步中...");
    // 1. 获取计划详情
    const res = await planService.getPlanDetail(planId);
    planDetail.value = res.data || res;

    // 2. 获取实际记录
    if (targetDate.value) {
      await recordStore.fetchRecord(targetDate.value);
    }
  } catch (e) {
    showError("加载数据失败");
  } finally {
    hideToast();
  }
};

const handleMealChange = (meal: any) => {
  currentMeal.value = meal;
};

const handleAddFood = () => {
  foodModalVisible.value = true;
};

const handleRemoveFood = async (index: number) => {
  const food = mappedMealFoods.value[index];
  if (!food || !food.id) return;

  const confirmed = await showModal({
    content: `确定要删除「${food.name}」吗？`,
  });

  if (confirmed) {
    try {
      await recordStore.removeMealAction(food.id);
      recordStore.invalidateAllCache();
      showSuccess("已删除");
    } catch (e) {
      showError("删除失败");
    }
  }
};

// 处理食材库选择
const handleSelectFood = async (result: { food: any; quantity: number }) => {
  const { food, quantity } = result;
  try {
    showLoading("记录中...");
    await recordStore.addMealLogAction({
      date: targetDate.value,
      mealType: currentMeal.value,
      foodId: food.id,
      quantity: quantity,
      isPlanned: false
    });
    recordStore.invalidateAllCache();
    foodModalVisible.value = false;
    showSuccess("添加成功");
  } catch (e) {
    showError("添加失败");
  } finally {
    hideToast();
  }
};

// 处理快速建议点击 (从计划同步)
const handleAddQuickFood = async (food: any) => {
  try {
    showLoading("同步计划中...");
    await recordStore.addMealLogAction({
      date: targetDate.value,
      mealType: currentMeal.value,
      foodId: food.foodId,
      quantity: food.quantity,
      isPlanned: true
    });
    recordStore.invalidateAllCache();
    showSuccess(`已记录 ${food.name}`);
  } catch (e) {
    showError("同步失败");
  } finally {
    hideToast();
  }
};

const handleEditTargets = () => {
  targetsModalVisible.value = true;
};

const handleCloseTargetsModal = () => {
  targetsModalVisible.value = false;
};

const handleSaveTargets = async (newTargets: any) => {
  // 目前 DailyRecord 快照由后端在首次打卡时自动生成，暂不支持手动修改快照
  // 提示用户此操作将影响当日进度显示
  showError("单日目标修改功能暂未开放，请在计划配置中统一修改");
};

const handleCopyMeal = () => {
  showError("功能开发中");
};

const handleMarkComplete = async () => {
  const confirmed = await showModal({
    title: "确认打卡",
    content: "确定要将这一天标记为已完成吗？",
  });

  if (confirmed) {
    showSuccess("打卡成功！");
    // TODO: 调用后端完成接口
  }
};

const handleBack = () => {
  navigateBack();
};

const handleSaveAndNext = () => {
  if (dayNumber < (planDetail.value?.cycleDays || 0)) {
    navigateTo(ROUTES.DAILY_PLAN, { 
      planId: String(planId), 
      day: String(dayNumber + 1) 
    });
  } else {
    showSuccess("已完成周期最后一天");
    navigateBack();
  }
};

onMounted(() => {
  loadData();
});
</script>
