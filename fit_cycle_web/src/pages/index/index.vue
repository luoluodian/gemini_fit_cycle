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

    <!-- Food Selection Modal -->
    <FoodSelectionModal
      :visible="foodModalVisible"
      :foods="availableFoods"
      @close="handleCloseFoodModal"
      @select="handleSelectFood"
    />

    <!-- Quantity Input Modal -->
    <QuantityInputModal
      :visible="quantityModalVisible"
      :food-name="selectedFood?.foodName || ''"
      :food-unit="selectedFood?.baseUnit || ''"
      :mode="quantityModalVisibleTyle"
      @close="handleCloseQuantityModal"
      @confirm="handleConfirmAddFood"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import DateNavigation from "@/components/home/DateNavigation.vue";
import DailyGoalsOverview from "@/components/home/DailyGoalsOverview.vue";
import MealCard from "@/components/home/MealCard.vue";
import FoodSelectionModal from "@/components/common/FoodSelectionModal.vue";
import QuantityInputModal from "@/components/common/QuantityInputModal.vue";
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

const foodModalVisible = ref(false);
const quantityModalVisible = ref(false);
const quantityModalVisibleTyle = ref<"add" | "edit">("add");
const currentMealKey = ref("");
const selectedFood = ref<{
  foodId: string;
  foodName: string;
  calories: number;
  baseUnit: string;
  protein: number;
  fat: number;
  carbs: number;
  baseCount: number;
} | null>(null);

const availableFoods = ref([
  {
    foodId: "FOOD_001",
    foodName: "苹果",
    calories: 52,
    baseUnit: "个",
    protein: 0.3,
    fat: 0.2,
    carbs: 14,
    baseCount: 1,
  },
  {
    foodId: "FOOD_002",
    foodName: "香蕉",
    calories: 89,
    baseUnit: "个",
    protein: 1.1,
    fat: 0.3,
    carbs: 23,
    baseCount: 1,
  },
  {
    foodId: "FOOD_003",
    foodName: "鸡胸肉",
    calories: 165,
    baseUnit: "g",
    protein: 31,
    fat: 3.6,
    carbs: 0,
    baseCount: 100,
  },
  {
    foodId: "FOOD_004",
    foodName: "三文鱼",
    calories: 208,
    baseUnit: "g",
    protein: 25,
    fat: 13,
    carbs: 0,
    baseCount: 100,
  },
  {
    foodId: "FOOD_005",
    foodName: "燕麦",
    calories: 389,
    baseUnit: "g",
    protein: 17,
    fat: 7,
    carbs: 66,
    baseCount: 100,
  },
  {
    foodId: "FOOD_006",
    foodName: "糙米",
    calories: 111,
    baseUnit: "g",
    protein: 2.6,
    fat: 0.9,
    carbs: 23,
    baseCount: 100,
  },
]);

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
  try {
    // const data = await getRecordInfo(date);
    const data = {
      date: date || currentDate.value,
      // 计划名称 & 进度  date-navigation 需要
      plan: {
        // 计划id
        planId: "plan_001",
        // 计划名称
        planName: "6周减脂计划",
        //  当前是第几天
        currentDay: 7,
        // 计划总天数
        cycleDays: 42,
        // 记录id
        recordId: "record_001",
      },
      // 每日目标 营养素摄入量  daily-goals-card 需要
      nutritionGoals: {
        // 热量(kcal)
        calories: 2800,
        // 蛋白质(g)
        protein: 120,
        // 脂肪(g)
        fat: 50,
        // 碳水化合物(g)
        carbs: 180,
      },
      // 当前记录列表 meal-record-card 需要
      mealRecords: [
        {
          // 餐次类型
          meal_type: "breakfast",
          // 餐次名称
          meal_type_label: "早饭",
          // 餐次详情
          details: [
            {
              // 餐次ID  编辑时需要传入弹框
              mealFoodId: "MF_001",
              // 食物ID
              foodId: "FOOD_001",
              // 食物名称
              foodName: "燕麦粥",
              // 营养信息
              calories: 180,
              // 蛋白质(g)
              protein: 6,
              // 脂肪(g)
              fat: 3,
              // 碳水化合物(g)
              carbs: 30,
              // 摄入量
              consumedAmount: 50,
              // 单位
              baseUnit: "g",
              baseCount: 100,
              // 是否已记录
              isRecorded: 1,
              // 是否为计划内食物
              isPlanned: 1,
            },
          ],
        },
        {
          // 餐次类型
          meal_type: "lunch",
          // 餐次名称
          meal_type_label: "午饭",
          // 餐次详情
          details: [
            {
              // 餐次ID  编辑时需要传入弹框
              mealFoodId: "MF_001",
              // 食物ID
              foodId: "FOOD_001",
              // 食物名称
              foodName: "燕麦粥",
              // 营养信息
              calories: 180,
              // 蛋白质(g)
              protein: 6,
              // 脂肪(g)
              fat: 3,
              // 碳水化合物(g)
              carbs: 30,
              // 摄入量
              consumedAmount: 50,
              // 单位
              baseUnit: "g",
              // 是否已记录
              isRecorded: 1,
              // 是否为计划内食物
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
  foodModalVisible.value = true;
};

const handleAddPlannedMeal = (mealKey: string) => {
  // TODO: 实现按计划记录本餐逻辑
  console.log("按计划记录本餐", mealKey);
};

const handleEditFood = (mealKey: string, food: MealFoodDetail) => {
  // TODO: 实现编辑食物逻辑
  console.log("编辑食物", mealKey, food);
  selectedFood.value = food;
  quantityModalVisible.value = true;
  quantityModalVisibleTyle.value = "edit";

  // 可以打开编辑弹框，传入 mealFoodId
};

const handleCloseFoodModal = () => {
  foodModalVisible.value = false;
};

const handleSelectFood = (food: {
  foodId: string;
  foodName: string;
  calories: number;
  baseUnit: string;
  protein: number;
  fat: number;
  carbs: number;
  baseCount: number;
}) => {
  selectedFood.value = food;
  quantityModalVisible.value = true;
  quantityModalVisibleTyle.value = "add";
};

const handleCloseQuantityModal = () => {
  quantityModalVisible.value = false;
  selectedFood.value = null;
};

const handleConfirmAddFood = (quantity: number, unit: string) => {
  // TODO: 实现添加食物到对应餐次的逻辑
  console.log("确认添加食物", {
    mealKey: currentMealKey.value,
    food: selectedFood.value,
    quantity,
    unit,
  });
  handleCloseQuantityModal();
  // 添加成功后重新加载数据

  // loadRecordInfo(currentDate.value);
};
</script>
