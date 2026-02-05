<template>
  <view class="min-h-screen">
    <BaseNavBar title="今日记录" />
    <!-- Main Content -->
    <view class="px-4 py-6 pb-20">
      <!-- Date Navigation -->
      <DateNavigation v-model="currentDate" :plan="recordInfo?.plan" />

      <!-- Daily Goals Overview -->
      <DailyGoalsOverview
        v-if="recordInfo"
        :goals="recordInfo.nutritionGoals"
        :consumed="nutritionConsumed"
      />

      <!-- Meal Records -->
      <view class="space-y-4 mb-6">
        <MealCard
          v-for="mealRecord in recordInfo?.mealRecords || []"
          :key="mealRecord.meal_type"
          :meal-record="mealRecord"
          @add-food="handleAddFood"
          @add-planned-meal="handleAddPlannedMeal"
          @edit-food="handleEditFood"
        />
      </view>
    </view>

    <!-- Food Selection & Quantity Picker -->
    <FoodPicker
      v-model:visible="foodPickerVisible"
      title="记录饮食"
      @select="handleFoodPicked"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import DateNavigation from "@/components/home/DateNavigation.vue";
import DailyGoalsOverview from "@/components/home/DailyGoalsOverview.vue";
import MealCard from "@/components/home/HomeMealCard.vue";
import FoodPicker from "@/components/food/FoodPicker.vue";
import type { FoodItem } from "@/components/food/types";
import { type RecordInfoResponse, type MealFoodDetail } from "@/services";
import { useNavigationStore } from "@/stores/navigation";
import "./index.scss";

const recordInfo = ref<RecordInfoResponse | null>(null);
const currentDate = ref<string>(new Date().toISOString().split("T")[0]);
const navStore = useNavigationStore();

useDidShow(() => {
  navStore.setActiveTab(0);
  const page = Taro.getCurrentInstance().page;
  if (page && typeof page.getTabBar === "function" && page.getTabBar()) {
    page.getTabBar().setData({
      selected: 0,
    });
  }
});
watch(
  currentDate,
  (newDate) => {
    console.log("当前日期已更新为:", newDate);
  },
  { immediate: true }
);

const foodPickerVisible = ref(false);
const currentMealKey = ref("");

// 计算已摄入的营养数据
const nutritionConsumed = computed(() => {
  if (!recordInfo.value) {
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };
  }

  const consumed = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  recordInfo.value.mealRecords.forEach((meal) => {
    meal.details.forEach((detail) => {
      consumed.calories += detail.calories;
      consumed.protein += detail.protein;
      consumed.fat += detail.fat;
      consumed.carbs += detail.carbs;
    });
  });

  return consumed;
});

// 监听日期变化，重新加载记录信息
watch(currentDate, (newDate) => {
  if (newDate) {
    loadRecordInfo(newDate);
  }
});

// 加载记录信息
const loadRecordInfo = async (date?: string) => {
  // ... (existing loadRecordInfo implementation)
  try {
    const data = {
      date: date || currentDate.value,
      plan: {
        planId: "plan_001",
        planName: "6周减脂计划",
        currentDay: 7,
        cycleDays: 42,
        recordId: "record_001",
      },
      nutritionGoals: {
        calories: 2800,
        protein: 120,
        fat: 50,
        carbs: 180,
      },
      mealRecords: [
        {
          meal_type: "breakfast",
          meal_type_label: "早饭",
          details: [
            {
              mealFoodId: "MF_001",
              foodId: "FOOD_001",
              foodName: "燕麦粥",
              calories: 180,
              protein: 6,
              fat: 3,
              carbs: 30,
              consumedAmount: 50,
              baseUnit: "g",
              baseCount: 100,
              isRecorded: 1,
              isPlanned: 1,
            },
          ],
        },
        {
          meal_type: "lunch",
          meal_type_label: "午饭",
          details: [
            {
              mealFoodId: "MF_001",
              foodId: "FOOD_001",
              foodName: "燕麦粥",
              calories: 180,
              protein: 6,
              fat: 3,
              carbs: 30,
              consumedAmount: 50,
              baseUnit: "g",
              isRecorded: 1,
              isPlanned: 1,
            },
          ],
        },
      ],
    };

    recordInfo.value = data;
    currentDate.value = data.date;
  } catch (error) {
    console.error("加载记录信息失败:", error);
  }
};

// 初始化加载
onMounted(() => {
  loadRecordInfo(currentDate.value);
});

const handleAddFood = (mealKey: string) => {
  currentMealKey.value = mealKey;
  foodPickerVisible.value = true;
};

const handleAddPlannedMeal = (mealKey: string) => {
  // TODO: 实现按计划记录本餐逻辑
  console.log("按计划记录本餐", mealKey);
};

const handleEditFood = (mealKey: string, food: MealFoodDetail) => {
  // TODO: 记录域开发时实现编辑逻辑
  console.log("编辑食物", mealKey, food);
};

const handleFoodPicked = (result: { food: FoodItem; quantity: number }) => {
  // TODO: 记录域开发时实现真实的打卡保存逻辑
  console.log("首页打卡成功:", {
    date: currentDate.value,
    mealKey: currentMealKey.value,
    ...result
  });
  Taro.showToast({ title: '打卡逻辑待实现', icon: 'none' });
};
</script>
