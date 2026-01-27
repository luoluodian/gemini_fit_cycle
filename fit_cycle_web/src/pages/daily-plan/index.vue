<template>
  <view class="min-h-screen pb-20">
    <!-- Header -->
    <DailyPlanHeader
      :day-name="dayName"
      :day-date="dayDate"
      :current-calories="currentCalories"
    />

    <!-- 营养目标 -->
    <view class="px-4 py-4">
      <NutritionTargets
        :targets="targets"
        :current-nutrition="currentNutrition"
        @edit="handleEditTargets"
      />
    </view>

    <!-- 餐次标签 -->
    <view class="px-4 py-2">
      <MealTabs :current-meal="currentMeal" @change="handleMealChange" />
    </view>

    <!-- 当前餐次内容 -->
    <view class="px-4 py-2">
      <MealCard
        :meal-name="currentMealName"
        :meal-calories="mealCalories"
        :foods="currentMealFoods"
        @add-food="handleAddFood"
        @edit-food="handleEditFood"
        @remove-food="handleRemoveFood"
      />
    </view>

    <!-- 快速建议 -->
    <view class="px-4 py-2">
      <QuickSuggestions
        :suggestions="quickSuggestions"
        @add="handleAddQuickFood"
      />
    </view>

    <!-- 浮动操作按钮 -->
    <FloatingButtons
      @copy-meal="handleCopyMeal"
      @mark-complete="handleMarkComplete"
    />

    <!-- 底部操作栏 -->
    <BottomActions
      @save-exit="handleSaveAndExit"
      @save-next="handleSaveAndNext"
    />

    <!-- 添加食物模态框 -->
    <FoodModal
      :visible="foodModalVisible"
      @close="handleCloseFoodModal"
      @select="handleSelectFood"
    />

    <!-- 编辑目标模态框 -->
    <TargetsModal
      :visible="targetsModalVisible"
      :targets="targets"
      @close="handleCloseTargetsModal"
      @save="handleSaveTargets"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DailyPlanHeader from "@/components/daily-plan/DailyPlanHeader.vue";
import NutritionTargets from "@/components/daily-plan/NutritionTargets.vue";
import MealTabs from "@/components/daily-plan/MealTabs.vue";
import MealCard from "@/components/common/MealCard.vue";
import QuickSuggestions from "@/components/daily-plan/QuickSuggestions.vue";
import FloatingButtons from "@/components/daily-plan/FloatingButtons.vue";
import BottomActions from "@/components/daily-plan/BottomActions.vue";
import FoodModal from "@/components/daily-plan/FoodModal.vue";
import TargetsModal from "@/components/daily-plan/TargetsModal.vue";
import { navigateBack } from "@/router";
import { useRouterParams } from "@/router/hooks";
import { getStorage, setStorage } from "@/utils/storage";
import { showSuccess, showError, showModal } from "@/utils/toast";
import "./index.scss";

interface Food {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface DayTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface DayPlan {
  id: string;
  name: string;
  date: string;
  targets: DayTargets;
  meals: {
    breakfast: Food[];
    lunch: Food[];
    dinner: Food[];
    snacks: Food[];
  };
  isCompleted: boolean;
  isConfigured: boolean;
}

interface Plan {
  id: string;
  name: string;
  dailyPlans: DayPlan[];
}

const routerParams = useRouterParams<{ planId?: string; dayId?: string }>();
const planId = ref<string>(routerParams.planId || "");
const dayId = ref<string>(routerParams.dayId || "");
const plan = ref<Plan | null>(null);
const day = ref<DayPlan | null>(null);
const currentMeal = ref<"breakfast" | "lunch" | "dinner" | "snacks">(
  "breakfast"
);
const foodModalVisible = ref(false);
const targetsModalVisible = ref(false);

const dayName = computed(() => day.value?.name || "第1天");
const dayDate = computed(() => {
  if (!day.value) return "2025年1月1日";
  return formatDate(new Date(day.value.date));
});

const targets = computed(
  () =>
    day.value?.targets || {
      calories: 1800,
      protein: 120,
      fat: 50,
      carbs: 180,
    }
);

const currentMealFoods = computed(() => {
  if (!day.value) return [];
  return day.value.meals[currentMeal.value] || [];
});

const currentMealName = computed(() => {
  const names = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snacks: "加餐",
  };
  return names[currentMeal.value];
});

const mealCalories = computed(() => {
  const foods = currentMealFoods.value;
  return foods.reduce((total, food) => {
    const ratio = food.quantity / 100;
    return total + Math.round(food.calories * ratio);
  }, 0);
});

const currentNutrition = computed(() => {
  if (!day.value) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }

  const allMeals = Object.values(day.value.meals).flat();
  return allMeals.reduce(
    (total, food) => {
      const ratio = food.quantity / 100;
      return {
        calories: total.calories + Math.round(food.calories * ratio),
        protein: total.protein + Math.round(food.protein * ratio * 10) / 10,
        fat: total.fat + Math.round(food.fat * ratio * 10) / 10,
        carbs: total.carbs + Math.round(food.carbs * ratio * 10) / 10,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
});

const currentCalories = computed(() => {
  return `${Math.round(currentNutrition.value.calories)}/${
    targets.value.calories
  }`;
});

const quickSuggestions = ref<Food[]>([
  {
    name: "煮鸡蛋",
    quantity: 1,
    unit: "个",
    calories: 70,
    protein: 6,
    fat: 5,
    carbs: 1,
  },
  {
    name: "燕麦片",
    quantity: 50,
    unit: "g",
    calories: 180,
    protein: 6,
    fat: 3,
    carbs: 30,
  },
  {
    name: "牛奶",
    quantity: 250,
    unit: "ml",
    calories: 150,
    protein: 8,
    fat: 8,
    carbs: 12,
  },
  {
    name: "香蕉",
    quantity: 1,
    unit: "根",
    calories: 90,
    protein: 1,
    fat: 0,
    carbs: 23,
  },
]);

const loadData = () => {
  // 使用写死的数据，不依赖缓存
  const mockPlan: Plan = {
    id: "plan-001",
    name: "健康饮食计划",
    dailyPlans: [
      {
        id: "day-001",
        name: "第1天",
        date: "2025-01-07",
        targets: {
          calories: 1800,
          protein: 120,
          fat: 50,
          carbs: 180,
        },
        meals: {
          breakfast: [
            {
              name: "煮鸡蛋",
              quantity: 2,
              unit: "个",
              calories: 140,
              protein: 12,
              fat: 10,
              carbs: 2,
            },
            {
              name: "燕麦片",
              quantity: 50,
              unit: "g",
              calories: 180,
              protein: 6,
              fat: 3,
              carbs: 30,
            },
          ],
          lunch: [
            {
              name: "鸡胸肉",
              quantity: 150,
              unit: "g",
              calories: 248,
              protein: 46,
              fat: 5,
              carbs: 0,
            },
            {
              name: "糙米饭",
              quantity: 100,
              unit: "g",
              calories: 111,
              protein: 2.6,
              fat: 0.9,
              carbs: 23,
            },
          ],
          dinner: [
            {
              name: "三文鱼",
              quantity: 120,
              unit: "g",
              calories: 208,
              protein: 22,
              fat: 12,
              carbs: 0,
            },
            {
              name: "西兰花",
              quantity: 200,
              unit: "g",
              calories: 68,
              protein: 4.6,
              fat: 0.8,
              carbs: 13,
            },
          ],
          snacks: [
            {
              name: "苹果",
              quantity: 1,
              unit: "个",
              calories: 95,
              protein: 0.5,
              fat: 0.3,
              carbs: 25,
            },
          ],
        },
        isCompleted: false,
        isConfigured: true,
      },
    ],
  };

  plan.value = mockPlan;
  day.value = mockPlan.dailyPlans[0];
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

const savePlan = () => {
  // 使用写死的数据，不需要实际保存到存储
  // 只显示保存成功的提示
  console.log("保存功能：数据已更新（使用写死数据）");
};

const handleMealChange = (
  meal: "breakfast" | "lunch" | "dinner" | "snacks"
) => {
  currentMeal.value = meal;
};

const handleAddFood = () => {
  foodModalVisible.value = true;
};

const handleEditFood = (index: number) => {
  showError("编辑食物功能开发中...");
};

const handleRemoveFood = async (index: number) => {
  if (!day.value) return;

  const confirmed = await showModal({
    content: "确定要删除这个食物吗？",
  });

  if (confirmed) {
    day.value.meals[currentMeal.value].splice(index, 1);
    day.value.isConfigured = true;
    savePlan();
    showSuccess("已删除食物");
  }
};

const handleAddQuickFood = (food: Food) => {
  if (!day.value) return;

  if (!day.value.meals[currentMeal.value]) {
    day.value.meals[currentMeal.value] = [];
  }

  day.value.meals[currentMeal.value].push(food);
  day.value.isConfigured = true;
  savePlan();
  showSuccess(`已添加 ${food.name}`);
};

const handleSelectFood = (food: Food) => {
  handleAddQuickFood(food);
  handleCloseFoodModal();
};

const handleCloseFoodModal = () => {
  foodModalVisible.value = false;
};

const handleEditTargets = () => {
  targetsModalVisible.value = true;
};

const handleCloseTargetsModal = () => {
  targetsModalVisible.value = false;
};

const handleSaveTargets = (newTargets: DayTargets) => {
  if (!day.value) return;

  day.value.targets = newTargets;
  savePlan();
  handleCloseTargetsModal();
  showSuccess("营养目标已更新");
};

const handleCopyMeal = () => {
  if (!day.value) return;

  const mealData = day.value.meals[currentMeal.value];
  if (mealData && mealData.length > 0) {
    // 使用写死数据，不实际保存到存储
    console.log("复制餐次功能：", mealData);
    showSuccess("餐次已复制（演示模式）");
  } else {
    showError("当前餐次没有食物");
  }
};

const handleMarkComplete = async () => {
  if (!day.value) return;

  const confirmed = await showModal({
    content: "确定要将这一天标记为已完成吗？",
  });

  if (confirmed) {
    day.value.isCompleted = true;
    savePlan();
    showSuccess("已标记为完成");
  }
};

const handleSaveAndExit = () => {
  savePlan();
  showSuccess("已保存");
  setTimeout(() => {
    navigateBack();
  }, 1000);
};

const handleSaveAndNext = () => {
  if (!plan.value || !day.value) return;

  savePlan();

  const currentIndex = plan.value.dailyPlans.findIndex(
    (d) => d.id === dayId.value
  );
  const nextIndex = currentIndex + 1;

  if (nextIndex < plan.value.dailyPlans.length) {
    const nextDay = plan.value.dailyPlans[nextIndex];
    showSuccess("已保存，跳转到下一天");
    setTimeout(() => {
      // TODO: 使用路由跳转到下一天
      showError("跳转功能开发中...");
    }, 1000);
  } else {
    showError("已是最后一天");
    setTimeout(() => {
      navigateBack();
    }, 1000);
  }
};

onMounted(() => {
  loadData();
});
</script>
