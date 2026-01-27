<template>
  <view class="min-h-screen pb-20">
    <!-- Header -->
    <view class="bg-white shadow-sm">
      <view class="px-4 py-6">
        <view class="flex items-center justify-between">
          <view class="flex items-center">
            <view class="ml-2">
              <text class="hero-title text-xl font-bold text-gray-800 block">{{
                planName
              }}</text>
              <text class="text-sm text-gray-600 block">{{ planInfo }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="px-4 py-4">
      <view class="grid grid-cols-3 gap-3">
        <StatsCard :count="completedCount" label="已完成" type="completed" />
        <StatsCard :count="configuredCount" label="已配置" type="configured" />
        <StatsCard :count="remainingCount" label="待配置" type="remaining" />
      </view>
    </view>

    <!-- 筛选和排序 -->
    <view class="px-4">
      <view class="flex items-center justify-between">
        <FilterButtons
          :current-filter="currentFilter"
          @change="handleFilterChange"
        />
        <view
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors bg-white cursor-pointer flex items-center justify-center mb-4"
          @click="handleToggleSortOrder"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            ></path>
          </svg>
        </view>
      </view>
    </view>

    <!-- 每日列表 -->
    <view class="px-4 py-2">
      <view class="space-y-3">
        <DayCard
          v-for="day in filteredDays"
          :key="day.id"
          :day="day"
          @edit="handleEditDay"
          @copy="handleCopyDay"
        />
      </view>
    </view>

    <!-- 快速操作 -->
    <view class="fixed bottom-20 right-4">
      <view class="space-y-2">
        <view
          class="floating-btn w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
          @click="handleBatchConfigure"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </view>
        <view
          class="floating-btn w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
          @click="handleCopyPlan"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            ></path>
          </svg>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="btm_bottom bg-white border-t border-gray-200 px-4 py-3">
      <view class="flex space-x-3">
        <view
          class="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          @click="handleGoToToday"
        >
          回到今天
        </view>
        <view
          class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          @click="handleViewNutritionSummary"
        >
          营养统计
        </view>
      </view>
    </view>

    <!-- 批量配置模态框 -->
    <BatchModal
      :visible="batchModalVisible"
      @close="handleCloseBatchModal"
      @execute="handleExecuteBatchAction"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DayCard from "@/components/daily-list/DayCard.vue";
import StatsCard from "@/components/daily-list/StatsCard.vue";
import FilterButtons from "@/components/daily-list/FilterButtons.vue";
import BatchModal from "@/components/daily-list/BatchModal.vue";
import { navigateBack } from "@/router";
import { getStorage, setStorage } from "@/utils/storage";
import { showError, showSuccess, showModal } from "@/utils/toast";
import { useRouterParams } from "@/router/hooks";
import "./index.scss";

interface DayTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayPlan {
  id: string;
  name: string;
  date: string;
  isCompleted: boolean;
  isConfigured: boolean;
  targets: DayTargets;
}

interface Plan {
  id: string;
  name: string;
  totalDays: number;
  cycleCount: number;
  dailyPlans: DayPlan[];
}

const routerParams = useRouterParams<{ planId?: string }>();
const planId = ref<string>(routerParams.planId || "1");
const plan = ref<Plan | null>(null);
const currentFilter = ref<string>("all");
const sortOrder = ref<"asc" | "desc">("asc");
const currentDate = ref<Date>(new Date());
const batchModalVisible = ref(false);

const planName = computed(() => plan.value?.name || "饮食计划");
const planInfo = computed(() => {
  if (!plan.value) return "共 0 天 · 第 0 周期";
  return `共 ${plan.value.totalDays} 天 · ${plan.value.cycleCount} 周期`;
});

const completedCount = computed(() => {
  if (!plan.value) return 0;
  return plan.value.dailyPlans.filter((day) => day.isCompleted).length;
});

const configuredCount = computed(() => {
  if (!plan.value) return 0;
  return plan.value.dailyPlans.filter((day) => day.isConfigured).length;
});

const remainingCount = computed(() => {
  if (!plan.value) return 0;
  return plan.value.totalDays - configuredCount.value;
});

const progressText = computed(() => {
  if (!plan.value) return "0/0";
  return `${completedCount.value}/${plan.value.totalDays}`;
});

const progressPercent = computed(() => {
  if (!plan.value || plan.value.totalDays === 0) return 0;
  return (completedCount.value / plan.value.totalDays) * 100;
});

const filteredDays = computed(() => {
  if (!plan.value) return [];

  let days = [...plan.value.dailyPlans];

  // 应用筛选
  if (currentFilter.value !== "all") {
    switch (currentFilter.value) {
      case "active":
        days = days.filter((day) => isActiveDay(day));
        break;
      case "configured":
        days = days.filter((day) => day.isConfigured);
        break;
      case "completed":
        days = days.filter((day) => day.isCompleted);
        break;
    }
  }

  // 应用排序
  if (sortOrder.value === "desc") {
    days.reverse();
  }

  return days;
});

const loadPlan = () => {
  // 使用写死的模拟数据，不依赖缓存
  const mockPlan: Plan = {
    id: planId.value || "1",
    name: "21天健康饮食计划",
    totalDays: 21,
    cycleCount: 1,
    dailyPlans: [
      {
        id: "day-1",
        name: "第1天",
        date: "2024-01-01",
        isCompleted: true,
        isConfigured: true,
        targets: {
          calories: 1800,
          protein: 120,
          carbs: 200,
          fat: 60,
        },
      },
      {
        id: "day-2",
        name: "第2天",
        date: "2024-01-02",
        isCompleted: true,
        isConfigured: true,
        targets: {
          calories: 1750,
          protein: 115,
          carbs: 190,
          fat: 58,
        },
      },
      {
        id: "day-3",
        name: "第3天",
        date: "2024-01-03",
        isCompleted: false,
        isConfigured: true,
        targets: {
          calories: 1850,
          protein: 125,
          carbs: 210,
          fat: 62,
        },
      },
    ],
  };

  plan.value = mockPlan;
};

const isActiveDay = (day: DayPlan) => {
  const date = new Date(day.date);
  return isToday(date);
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const handleGoBack = () => {
  navigateBack();
};

const handleFilterChange = (filter: string) => {
  currentFilter.value = filter;
};

const handleToggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const handleEditDay = (dayId: string) => {
  // TODO: 跳转到每日计划页面
  // navigateTo(ROUTES.DAILY_PLAN, { planId: planId.value, dayId });
  showError("每日计划页面开发中...");
};

const handleCopyDay = (dayId: string) => {
  if (!plan.value) return;

  const day = plan.value.dailyPlans.find((d) => d.id === dayId);
  if (day) {
    setStorage("copiedDay", day);
    showSuccess("日期配置已复制");
  }
};

const handleGoToToday = () => {
  if (!plan.value) return;

  const today = new Date();
  const todayDay = plan.value.dailyPlans.find((day) => {
    const date = new Date(day.date);
    return date.toDateString() === today.toDateString();
  });

  if (todayDay) {
    handleEditDay(todayDay.id);
  } else {
    showError("今天没有计划");
  }
};

const handleViewNutritionSummary = () => {
  showError("营养统计功能开发中...");
};

const handleBatchConfigure = () => {
  batchModalVisible.value = true;
};

const handleCloseBatchModal = () => {
  batchModalVisible.value = false;
};

const handleExecuteBatchAction = async (action: string) => {
  switch (action) {
    case "copy":
      const copiedDay = getStorage<DayPlan>("copiedDay");
      if (copiedDay) {
        // TODO: 实现批量复制逻辑
        showError("批量复制功能开发中...");
      } else {
        showError("请先复制一个日期配置");
      }
      break;
    case "template":
      showError("模板功能开发中...");
      break;
    case "reset":
      const confirmed = await showModal({
        content: "确定要重置所有配置吗？",
      });
      if (confirmed) {
        showError("重置功能开发中...");
      }
      break;
  }

  handleCloseBatchModal();
};

const handleCopyPlan = () => {
  showError("复制计划功能开发中...");
};

onMounted(() => {
  loadPlan();
});
</script>
