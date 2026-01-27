<template>
  <view class="plan-creator-page min-h-screen">
    <!-- Header -->
    <view class="bg-white shadow-sm">
      <view class="px-4 py-6">
        <view class="flex items-center justify-between">
          <view class="flex items-center">
            <h1 class="hero-title text-xl font-bold text-gray-800 ml-2">
              创建饮食计划
            </h1>
          </view>
        </view>
      </view>
    </view>

    <!-- Step Indicator -->
    <StepIndicator :steps-list="stepsList" />

    <!-- Main Content -->
    <view class="px-4">
      <!-- 步骤1：基础信息 -->
      <view :class="['step-container', currentStep !== 1 ? 'hidden' : '']">
        <BasicInfoStep
          :form-data="basicInfoData"
          @update:form-data="handleBasicInfoUpdate"
        />
      </view>

      <!-- 步骤2：周期设置 -->
      <view :class="['step-container', currentStep !== 2 ? 'hidden' : '']">
        <CycleSettingsStep
          :form-data="cycleData"
          @update:form-data="handleCycleUpdate"
        />
      </view>

      <!-- 步骤3：确认创建 -->
      <view :class="['step-container', currentStep !== 3 ? 'hidden' : '']">
        <ConfirmStep
          :summary="summary"
          :confirmed="confirmed"
          @update:confirmed="confirmed = $event"
        />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view
      class="btm_bottom bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg"
    >
      <view class="flex space-x-3 max-w-md mx-auto">
        <view
          v-if="currentStep > 1"
          @click="handlePrevStep"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors active:bg-gray-300"
        >
          上一步
        </view>
        <view
          @click="handleNextStep"
          :class="[
            'flex-1 py-3 px-4 rounded-lg font-medium transition-colors active:opacity-80 text-center ',
            currentStep === totalSteps
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md',
          ]"
        >
          {{ currentStep === totalSteps ? "创建计划" : "下一步" }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Taro from "@tarojs/taro";
import StepIndicator from "@/components/plan-creator/StepIndicator.vue";
import BasicInfoStep from "@/components/plan-creator/BasicInfoStep.vue";
import CycleSettingsStep from "@/components/plan-creator/CycleSettingsStep.vue";
import ConfirmStep from "@/components/plan-creator/ConfirmStep.vue";
import { showSuccess, showError } from "@/utils/toast";
import { getStorage, setStorage } from "@/utils/storage";
import { navigateTo } from "@/router";

const totalSteps = 3;
const currentStep = ref(1);
const confirmed = ref(false);
const stepLabels = ["基础信息", "每日列表", "每日计划"];

// 步骤列表，用于新的 StepIndicator 组件
const stepsList = computed(() => {
  return stepLabels.map((label, index) => ({
    stepLabel: label,
    isActive: index + 1 === currentStep.value,
  }));
});
console.log(stepsList.value);

// 基础信息数据
const basicInfoData = ref({
  name: "",
  type: "",
  startDate: "",
  setActive: true,
});

// 周期设置数据
const cycleData = ref({
  cycleDays: 7,
  cycleCount: 3,
  targetMode: "individual",
  defaultCalories: 1800,
  defaultProtein: 120,
  defaultFat: 50,
  defaultCarbs: 180,
});

// 设置默认日期
const setDefaultDate = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split("T")[0];
  basicInfoData.value.startDate = dateString;
};

// 计划类型映射
const typeNames: Record<string, string> = {
  "fat-loss": "减脂",
  "muscle-gain": "增肌",
  maintenance: "维持",
  custom: "自定义",
};

// 确认页面的摘要信息
const summary = computed(() => {
  const totalDays = cycleData.value.cycleDays * cycleData.value.cycleCount;
  return {
    name: basicInfoData.value.name || "-",
    type: typeNames[basicInfoData.value.type] || "-",
    days: `${totalDays} 天`,
    cycle: `${cycleData.value.cycleDays}天 × ${cycleData.value.cycleCount}周期`,
    calories: `${cycleData.value.defaultCalories} kcal`,
  };
});

// 验证步骤
const validateStep = (step: number): boolean => {
  switch (step) {
    case 1:
      if (!basicInfoData.value.name.trim()) {
        showError("请输入计划名称");
        return false;
      }
      if (!basicInfoData.value.type) {
        showError("请选择计划类型");
        return false;
      }
      return true;
    case 2:
      if (cycleData.value.cycleDays < 1 || cycleData.value.cycleDays > 14) {
        showError("周期天数应在 1-14 天之间");
        return false;
      }
      if (cycleData.value.cycleCount < 1 || cycleData.value.cycleCount > 10) {
        showError("周期数量应在 1-10 个之间");
        return false;
      }
      return true;
    case 3:
      if (!confirmed.value) {
        showError("请确认创建计划");
        return false;
      }
      return true;
    default:
      return true;
  }
};

// 下一步
const handleNextStep = () => {
  if (!validateStep(currentStep.value)) {
    return;
  }

  if (currentStep.value === totalSteps) {
    handleCreatePlan();
    return;
  }

  currentStep.value++;
};

// 上一步
const handlePrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 返回
const handleGoBack = () => {
  Taro.navigateBack();
};

// 更新基础信息
const handleBasicInfoUpdate = (data: Partial<typeof basicInfoData.value>) => {
  basicInfoData.value = { ...basicInfoData.value, ...data };
};

// 更新周期设置
const handleCycleUpdate = (data: Partial<typeof cycleData.value>) => {
  cycleData.value = { ...cycleData.value, ...data };
};

// 生成每日计划
const generateDailyPlans = () => {
  const dailyPlans = <any>[];
  const totalDays = cycleData.value.cycleDays * cycleData.value.cycleCount;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(basicInfoData.value.startDate);
    date.setDate(date.getDate() + i);

    const dayNumber = (i % cycleData.value.cycleDays) + 1;
    const cycleNumber = Math.floor(i / cycleData.value.cycleDays) + 1;

    dailyPlans.push({
      id: `day_${i + 1}`,
      date: date.toISOString().split("T")[0],
      dayNumber: dayNumber,
      cycleNumber: cycleNumber,
      name: `第${cycleNumber}周期 - 第${dayNumber}天`,
      targets: {
        calories: cycleData.value.defaultCalories,
        protein: cycleData.value.defaultProtein,
        fat: cycleData.value.defaultFat,
        carbs: cycleData.value.defaultCarbs,
      },
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
      isCompleted: false,
      isConfigured: false,
    });
  }

  return dailyPlans;
};

// 创建计划
const handleCreatePlan = () => {
  const planId = "plan_" + Date.now();

  const plan = {
    id: planId,
    name: basicInfoData.value.name,
    type: basicInfoData.value.type,
    startDate: basicInfoData.value.startDate,
    cycleDays: cycleData.value.cycleDays,
    cycleCount: cycleData.value.cycleCount,
    totalDays: cycleData.value.cycleDays * cycleData.value.cycleCount,
    targetMode: cycleData.value.targetMode,
    defaultTargets: {
      calories: cycleData.value.defaultCalories,
      protein: cycleData.value.defaultProtein,
      fat: cycleData.value.defaultFat,
      carbs: cycleData.value.defaultCarbs,
    },
    dailyPlans: generateDailyPlans(),
    createdAt: new Date().toISOString(),
    isActive: basicInfoData.value.setActive,
  };

  // 保存到本地存储
  const plans = getStorage<any[]>("dietPlans") || [];
  plans.push(plan);
  setStorage("dietPlans", plans);

  // 如果设置为激活状态，更新激活计划
  if (plan.isActive) {
    setStorage("activePlanId", plan.id);
  }

  showSuccess("计划创建成功！");

  // 跳转到计划列表页面
  setTimeout(() => {
    navigateTo("/pages/plan/index");
  }, 1500);
};

onMounted(() => {
  setDefaultDate();
});
</script>

<style scoped></style>
