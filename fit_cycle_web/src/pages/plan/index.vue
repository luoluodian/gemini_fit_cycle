<template>
  <view class="min-h-screen">
    <!-- Header -->
    <PlanHeader @import="showImportPlan" @create="showPlanTypes" />

    <!-- Main Content -->
    <view class="px-4 py-6 pb-20">
      <!-- Plan Categories -->
      <PlanTabs :active-tab="activeTab" @change="handleTabChange">
        <template #active>
          <view class="space-y-3">
            <PlanCard
              v-for="plan in activePlans"
              :key="plan.id"
              :plan="plan"
              @action="handlePlanAction"
            />
          </view>
        </template>

        <template #completed>
          <view class="space-y-3">
            <PlanCard
              v-for="plan in completedPlans"
              :key="plan.id"
              :plan="plan"
              @action="handlePlanAction"
            />
          </view>
        </template>

        <template #archived>
          <view class="space-y-3">
            <PlanCard
              v-for="plan in archivedPlans"
              :key="plan.id"
              :plan="plan"
              @action="handlePlanAction"
            />
          </view>
        </template>
      </PlanTabs>

      <!-- Quick Stats -->
      <PlanStats
        :active-count="activePlans.length"
        :completed-count="completedPlans.length"
      />

      <!-- Recommended Plans -->
      <RecommendedPlans @create="handleCreateRecommendedPlan" />

      <!-- Floating Action Button -->
      <view
        class="floating-btn fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
        @click="createNewPlan"
      >
        <svg
          class="w-6 h-6"
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
    </view>

    <!-- Modals -->
    <NewPlanModal
      :visible="showNewPlanModal"
      :initial-data="newPlanInitialData"
      @close="closeNewPlanModal"
      @submit="handleCreatePlan"
    />
    <ImportPlanModal
      :visible="showImportPlanModal"
      @close="closeImportPlanModal"
      @import="handleImportPlan"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Taro from "@tarojs/taro";
import PlanHeader from "@/components/plan/PlanHeader.vue";
import PlanTabs from "@/components/plan/PlanTabs.vue";
import PlanCard from "@/components/plan/PlanCard.vue";
import PlanStats from "@/components/plan/PlanStats.vue";
import RecommendedPlans from "@/components/plan/RecommendedPlans.vue";
import NewPlanModal from "@/components/plan/NewPlanModal.vue";
import ImportPlanModal from "@/components/plan/ImportPlanModal.vue";
import { getStorage, setStorage } from "@/utils/storage";
import { showSuccess, showError, showModal } from "@/utils/toast";

type TabType = "active" | "completed" | "archived";

interface Plan {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  status: "active" | "paused" | "completed" | "archived";
  createdAt: string;
  progress: number;
  tags?: string[];
  description?: string;
  targets?: string;
  progressColor?: string;
  statusIcon?: string;
  statusIconClass?: string;
  progressText?: string;
  isActive?: boolean;
  actions?: any[];
}

const STORAGE_KEY = "dietPlans";
const ACTIVE_PLAN_KEY = "activePlanId";

const activeTab = ref<TabType>("active");
const showNewPlanModal = ref(false);
const showImportPlanModal = ref(false);
const allPlans = ref<Plan[]>([]);
const newPlanInitialData = ref<Partial<any>>({});

// 计算属性：按状态分类计划
const activePlans = computed(() => {
  return formatPlans(
    allPlans.value.filter((p) => p.status === "active" || p.status === "paused")
  );
});

const completedPlans = computed(() => {
  return formatPlans(allPlans.value.filter((p) => p.status === "completed"));
});

const archivedPlans = computed(() => {
  return formatPlans(allPlans.value.filter((p) => p.status === "archived"));
});

// 格式化计划数据用于显示
function formatPlans(plans: Plan[]) {
  const activePlanId = getStorage<string>(ACTIVE_PLAN_KEY);
  return plans.map((plan) => {
    const isActive = plan.id === activePlanId;
    const tags: string[] = [];
    let description = "";
    let targets = "";
    let progress = plan.progress || 0;
    let progressColor = "#10b981";
    let statusIcon = "";
    let statusIconClass = "";
    let progressText = "";

    if (plan.status === "active") {
      if (isActive) {
        tags.push("进行中", "当前使用");
      } else {
        tags.push("进行中");
      }
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
      };
      const typeText = typeMap[plan.type] || plan.type;
      const daysLeft = calculateDaysLeft(plan.endDate);
      description = `类型：${typeText} | 剩余：${daysLeft}天`;
      targets = `每日目标：${plan.calories} kcal | 蛋白质${plan.protein}g | 脂肪${plan.fat}g | 碳水${plan.carbs}g`;
      progressColor = "#10b981";
    } else if (plan.status === "paused") {
      tags.push("暂停中");
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
      };
      const typeText = typeMap[plan.type] || plan.type;
      const daysLeft = calculateDaysLeft(plan.endDate);
      description = `类型：${typeText} | 剩余：${daysLeft}天`;
      targets = `每日目标：${plan.calories} kcal | 蛋白质${plan.protein}g | 脂肪${plan.fat}g | 碳水${plan.carbs}g`;
      progressColor = "#f59e0b";
    } else if (plan.status === "completed") {
      tags.push("已完成");
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
      };
      const typeText = typeMap[plan.type] || plan.type;
      const completedDays = calculateCompletedDays(
        plan.startDate,
        plan.endDate
      );
      description = `类型：${typeText} | 已完成：${completedDays}天`;
      targets = `完成时间：${formatDate(plan.endDate)}`;
      statusIcon = "✓";
      statusIconClass = "text-2xl font-bold text-green-600";
      progressText = "100%";
      progress = 100;
    } else if (plan.status === "archived") {
      tags.push("已归档");
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
      };
      const typeText = typeMap[plan.type] || plan.type;
      description = `类型：${typeText} | 进行中：${plan.progress}%`;
      targets = `归档时间：${formatDate(plan.createdAt)}`;
      statusIcon = "⏸";
      statusIconClass = "text-lg font-bold text-gray-400";
      progressText = `${plan.progress}%`;
    }

    // 生成操作按钮
    const actions: any[] = [];
    if (plan.status === "active" || plan.status === "paused") {
      actions.push({
        label: "查看详情",
        type: "view",
        class: "flex-1 bg-emerald-600 text-white hover:bg-emerald-700",
      });
      if (plan.status === "paused") {
        actions.push({
          label: "激活",
          type: "activate",
          class: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        });
      } else {
        actions.push({
          label: "编辑",
          type: "edit",
          class: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        });
      }
      actions.push({
        label: "⋮",
        type: "menu",
        class: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      });
    } else if (plan.status === "completed") {
      actions.push({
        label: "查看详情",
        type: "view",
        class: "flex-1 bg-gray-600 text-white hover:bg-gray-700",
      });
      actions.push({
        label: "再次使用",
        type: "reuse",
        class: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      });
    } else if (plan.status === "archived") {
      actions.push({
        label: "查看详情",
        type: "view",
        class: "flex-1 bg-gray-600 text-white hover:bg-gray-700",
      });
      actions.push({
        label: "恢复",
        type: "restore",
        class: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      });
    }

    return {
      ...plan,
      tags,
      description,
      targets,
      progress,
      progressColor,
      statusIcon,
      statusIconClass,
      progressText,
      isActive,
      actions,
    };
  });
}

// 计算剩余天数
function calculateDaysLeft(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
}

// 计算已完成天数
function calculateCompletedDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 加载计划数据
function loadPlanData() {
  const savedPlans = getStorage<Plan[]>(STORAGE_KEY);
  if (savedPlans && Array.isArray(savedPlans)) {
    allPlans.value = savedPlans;
  } else {
    // 初始化示例数据
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    allPlans.value = [
      {
        id: "plan1",
        name: "6周减脂计划",
        type: "fat-loss",
        startDate: today.toISOString().split("T")[0],
        endDate: nextMonth.toISOString().split("T")[0],
        calories: 1800,
        protein: 120,
        fat: 50,
        carbs: 180,
        status: "active",
        createdAt: today.toISOString(),
        progress: 40,
      },
      {
        id: "plan2",
        name: "增肌训练计划",
        type: "muscle-gain",
        startDate: today.toISOString().split("T")[0],
        endDate: nextMonth.toISOString().split("T")[0],
        calories: 2200,
        protein: 150,
        fat: 60,
        carbs: 250,
        status: "paused",
        createdAt: today.toISOString(),
        progress: 30,
      },
    ];
    setStorage(STORAGE_KEY, allPlans.value);
    setStorage(ACTIVE_PLAN_KEY, "plan1");
  }
}

// 保存计划
function savePlans() {
  setStorage(STORAGE_KEY, allPlans.value);
}

// 事件处理
const handleTabChange = (tab: string) => {
  activeTab.value = tab as TabType;
};

const showImportPlan = () => {
  showImportPlanModal.value = true;
};

const closeImportPlanModal = () => {
  showImportPlanModal.value = false;
};

const handleImportPlan = (shareCode: string) => {
  if (!shareCode.trim()) {
    showError("请输入分享码");
    return;
  }
  if (!shareCode.startsWith("PLAN-")) {
    showError("分享码格式不正确");
    return;
  }
  showSuccess("计划导入成功！");
  closeImportPlanModal();
  loadPlanData();
};

const showPlanTypes = () => {
  // 滚动到推荐计划区域（简单实现）
  showSuccess("推荐计划已显示在页面下方");
};

const createNewPlan = () => {
  showNewPlanModal.value = true;
};

const closeNewPlanModal = () => {
  showNewPlanModal.value = false;
};

const handleCreatePlan = (formData: any) => {
  // 验证必填字段
  if (!formData.name || !formData.startDate || !formData.dailyCalories) {
    showError("请填写必填字段");
    return;
  }

  // 验证数值合理性
  if (formData.dailyCalories < 800 || formData.dailyCalories > 4000) {
    showError("热量目标应在800-4000 kcal之间");
    return;
  }

  // 创建计划对象
  const plan: Plan = {
    id: "plan_" + Date.now(),
    name: formData.name,
    type: formData.type,
    startDate: formData.startDate,
    endDate: formData.endDate,
    calories: formData.dailyCalories || 0,
    protein: formData.protein || 0,
    fat: formData.fat || 0,
    carbs: formData.carb || 0,
    status: formData.setActive ? "active" : "paused",
    createdAt: new Date().toISOString(),
    progress: 0,
  };

  // 保存计划
  allPlans.value.push(plan);
  savePlans();

  // 如果设置为激活，更新激活计划ID
  if (formData.setActive) {
    setStorage(ACTIVE_PLAN_KEY, plan.id);
    // 取消其他激活计划
    allPlans.value.forEach((p) => {
      if (p.id !== plan.id && p.status === "active") {
        p.status = "paused";
      }
    });
    savePlans();
  }

  closeNewPlanModal();
  showSuccess("计划创建成功！");
  loadPlanData();
};

const handlePlanAction = (type: string, planId: string) => {
  switch (type) {
    case "view":
      showSuccess("计划详情功能开发中...");
      break;
    case "edit":
      showSuccess("编辑计划功能开发中...");
      break;
    case "menu":
      handlePlanMenu(planId);
      break;
    case "activate":
      activatePlan(planId);
      break;
    case "reuse":
      reusePlan(planId);
      break;
    case "restore":
      restorePlan(planId);
      break;
  }
};

// 激活计划
function activatePlan(planId: string) {
  const plan = allPlans.value.find((p) => p.id === planId);
  if (!plan) return;

  // 取消当前激活的计划
  allPlans.value.forEach((p) => {
    if (p.status === "active" && p.id !== planId) {
      p.status = "paused";
    }
  });

  // 激活选中的计划
  plan.status = "active";
  setStorage(ACTIVE_PLAN_KEY, planId);
  savePlans();
  showSuccess("计划已激活！");
  loadPlanData();
}

// 再次使用计划
function reusePlan(planId: string) {
  const plan = allPlans.value.find((p) => p.id === planId);
  if (!plan) return;

  showSuccess("计划已复制到草稿");
  setTimeout(() => {
    createNewPlan();
  }, 1000);
}

// 恢复计划
function restorePlan(planId: string) {
  const plan = allPlans.value.find((p) => p.id === planId);
  if (!plan) return;

  plan.status = "paused";
  savePlans();
  showSuccess("计划已从归档恢复");
  loadPlanData();
}

// 计划菜单
function handlePlanMenu(planId: string) {
  Taro.showActionSheet({
    itemList: ["编辑计划", "分享计划", "复制计划", "归档计划", "删除计划"],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          showSuccess("编辑计划功能开发中...");
          break;
        case 1:
          sharePlan(planId);
          break;
        case 2:
          duplicatePlan(planId);
          break;
        case 3:
          archivePlan(planId);
          break;
        case 4:
          deletePlan(planId);
          break;
      }
    },
  });
}

// 分享计划
function sharePlan(_planId: string) {
  const shareCode =
    "PLAN-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  Taro.setClipboardData({
    data: shareCode,
    success: () => {
      showSuccess("分享码已复制到剪贴板！");
    },
  });
}

// 复制计划
function duplicatePlan(planId: string) {
  const plan = allPlans.value.find((p) => p.id === planId);
  if (!plan) return;

  const newPlan: Plan = {
    ...plan,
    id: "plan_" + Date.now(),
    name: plan.name + " (副本)",
    status: "paused",
    createdAt: new Date().toISOString(),
  };
  allPlans.value.push(newPlan);
  savePlans();
  showSuccess("计划复制成功！");
  loadPlanData();
}

// 归档计划
function archivePlan(planId: string) {
  const plan = allPlans.value.find((p) => p.id === planId);
  if (!plan) return;

  plan.status = "archived";
  savePlans();
  showSuccess("计划已归档！");
  loadPlanData();
}

// 删除计划
async function deletePlan(planId: string) {
  const confirmed = await showModal({
    title: "确认删除",
    content: "确定要删除这个计划吗？此操作不可撤销。",
  });
  if (confirmed) {
    allPlans.value = allPlans.value.filter((p) => p.id !== planId);
    savePlans();
    showSuccess("计划已删除！");
    loadPlanData();
  }
}

// 创建推荐计划
const handleCreateRecommendedPlan = (type: string) => {
  const planTemplates: Record<string, any> = {
    "fat-loss": {
      name: "30天减脂挑战",
      type: "fat-loss",
      calories: 1600,
      protein: 120,
      fat: 45,
      carbs: 160,
    },
    "muscle-gain": {
      name: "增肌训练计划",
      type: "muscle-gain",
      calories: 2200,
      protein: 150,
      fat: 60,
      carbs: 250,
    },
    balanced: {
      name: "均衡营养计划",
      type: "maintenance",
      calories: 2000,
      protein: 100,
      fat: 65,
      carbs: 200,
    },
  };

  const template = planTemplates[type];
  if (!template) return;

  // 设置默认日期
  const today = new Date();
  const nextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  // 填充表单数据
  newPlanInitialData.value = {
    name: template.name,
    type: template.type,
    startDate: today.toISOString().split("T")[0],
    endDate: nextMonth.toISOString().split("T")[0],
    dailyCalories: template.calories,
    protein: template.protein,
    fat: template.fat,
    carb: template.carbs,
    setActive: false,
  };

  // 打开创建计划模态框
  createNewPlan();
};

// 页面加载时初始化
onMounted(() => {
  loadPlanData();
});
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
