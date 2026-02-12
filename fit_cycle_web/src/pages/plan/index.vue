<template>
  <view class="h-screen flex flex-col overflow-hidden">
    <!-- Header -->
    <BaseNavBar title="饮食计划" back-mode="none">
      <template #left>
        <view
          class="flex items-center justify-center p-3 border-[1rpx] border-solid border-emerald-600 text-emerald-600 rounded-lg active:scale-95 transition-all ml-2 shadow-sm"
          data-test-id="btn-nav-create"
          @click="createNewPlan"
        >
          <Uploader font-size="18"></Uploader>
        </view>
      </template>
    </BaseNavBar>

    <!-- Main Content -->
    <view class="px-4 py-4 pb-5 flex-1 min-h-0 flex flex-col">
      <!-- Plan Categories -->
      <PlanTabs :active-tab="currentTab" @change="handleTabChange" class="flex-1 min-h-0 flex flex-col">
        <template #active>
          <BaseScrollView
            :is-empty="activePlans.length === 0"
            content-class="space-y-3 pr-2 pt-2 animate-fade-in"
          >
            <template #empty>
              <EmptyPlanState
                text="暂无进行中的计划"
                action-text="创建新计划"
                data-test-id="btn-create-plan"
                @action="createNewPlan"
              />
            </template>
            <PlanCard
              v-for="plan in activePlans"
              :key="plan.id"
              :plan="plan"
              @action="handlePlanAction"
            />
          </BaseScrollView>
        </template>

        <template #completed>
          <BaseScrollView
            :is-empty="completedPlans.length === 0"
            content-class="space-y-3 pr-2 pt-2  animate-fade-in"
          >
            <template #empty>
              <EmptyPlanState text="暂无已完成的计划" />
            </template>
            <PlanCard
              v-for="plan in completedPlans"
              :key="plan.id"
              :plan="plan"
              @action="handlePlanAction"
            />
          </BaseScrollView>
        </template>
      </PlanTabs>

      <!-- Quick Stats (Hidden for UI match) -->
      <!-- <PlanStats
        :active-count="activePlans.length"
        :completed-count="completedPlans.length"
      /> -->

      <!-- Recommended Plans (Hidden per request) -->
      <!-- <RecommendedPlans @create="handleCreateRecommendedPlan" /> -->

      <!-- Floating Action Button (Hidden for UI match) -->
      <!-- <view
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
      </view> -->
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
    <CreateOptionsModal
      v-model:visible="showCreateOptionsModal"
      @create="handleSelectCreate"
      @import="showImportPlan"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import { navigateTo, ROUTES } from "@/router";
import PlanTabs from "@/components/plan/PlanTabs.vue";
import PlanCard from "@/components/plan/PlanCard.vue";
import NewPlanModal from "@/components/plan/NewPlanModal.vue";
import ImportPlanModal from "@/components/plan/ImportPlanModal.vue";
import CreateOptionsModal from "@/components/plan/CreateOptionsModal.vue";
import EmptyPlanState from "@/components/plan/EmptyPlanState.vue";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";
import { useNavigationStore } from "@/stores/navigation";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { PlanStatus } from "@/types/plan";
import { Uploader } from "@nutui/icons-vue-taro";

type TabType = "active" | "completed" | "archived";

const navStore = useNavigationStore();
const planStore = usePlanStore();

useDidShow(() => {
  navStore.setActiveTab(1);
  const page = Taro.getCurrentInstance().page;
  if (page && typeof page.getTabBar === "function" && page.getTabBar()) {
    page.getTabBar().setData({
      selected: 1,
    });
  }
  // 每次显示页面时刷新数据
  loadPlanData();
});

interface Plan {
  id: number | string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  status: PlanStatus;
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

const currentTab = ref<TabType>("active");
const showNewPlanModal = ref(false);
const showImportPlanModal = ref(false);
const showCreateOptionsModal = ref(false);
const allPlans = ref<Plan[]>([]);
const newPlanInitialData = ref<Partial<any>>({});

// 计算属性：按状态分类计划
const activePlans = computed(() => {
  return formatPlans(
    allPlans.value.filter(
      (p) =>
        p.status === "active" || p.status === "paused" || p.status === "draft",
    ),
  );
});

const completedPlans = computed(() => {
  return formatPlans(allPlans.value.filter((p) => p.status === "completed"));
});

const _archivedPlans = computed(() => {
  return formatPlans(allPlans.value.filter((p) => p.status === "archived"));
});

// 格式化计划数据用于显示
function formatPlans(plans: Plan[]) {
  return plans.map((plan) => {
    const isActive = plan.status === "active";
    const tags: string[] = [];
    let description = "";
    let targets = "";
    let progress = plan.progress || 0;
    let progressColor = "#10b981";
    let statusIcon = "";
    let statusIconClass = "";
    let progressText = "";

    if (plan.status === "active") {
      tags.push("进行中", "当前使用");
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
        "carb-cycle": "碳循环",
      };
      const typeText = typeMap[plan.type] || plan.type;
      const daysLeft = plan.endDate ? calculateDaysLeft(plan.endDate) : 0;
      description = `类型：${typeText} | 剩余：${daysLeft}天`;
      targets = `目标热量：${plan.targetCalories || 0} kcal`;
      progressColor = "#10b981";
    } else if (plan.status === "draft") {
      tags.push("草稿", "待配置");
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
        "carb-cycle": "碳循环",
      };
      const typeText = typeMap[plan.type] || plan.type;
      description = `类型：${typeText} | 创建时间：${formatDate(plan.createdAt)}`;
      targets = `目标：未正式开启`;
      progressColor = "#9ca3af";
    } else if (plan.status === "paused") {
      tags.push("暂停中");
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
        "carb-cycle": "碳循环",
      };
      const typeText = typeMap[plan.type] || plan.type;
      const daysLeft = plan.endDate ? calculateDaysLeft(plan.endDate) : 0;
      description = `类型：${typeText} | 剩余：${daysLeft}天`;
      targets = `目标热量：${plan.targetCalories || 0} kcal`;
      progressColor = "#f59e0b";
    } else if (plan.status === "completed") {
      tags.push("已完成");
      const typeMap: Record<string, string> = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        maintenance: "维持",
        custom: "自定义",
        "carb-cycle": "碳循环",
      };
      const typeText = typeMap[plan.type] || plan.type;
      const completedDays =
        plan.startDate && plan.endDate
          ? calculateCompletedDays(plan.startDate, plan.endDate)
          : 0;
      description = `类型：${typeText} | 已完成：${completedDays}天`;
      targets = `完成时间：${plan.endDate ? formatDate(plan.endDate) : "-"}`;
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
        "carb-cycle": "碳循环",
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
    if (
      plan.status === "active" ||
      plan.status === "paused" ||
      plan.status === "draft"
    ) {
      actions.push({
        label: plan.status === "draft" ? "继续配置" : "查看详情",
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
        // 激活状态下不需要编辑，或者进入详情编辑
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
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
}

// 计算已完成天数
function calculateCompletedDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 加载计划数据
async function loadPlanData() {
  try {
    showLoading("加载中...");
    // 显式传递分页参数，避免潜在的参数解析错误
    const res: any = await planService.getPlans({ page: 1, limit: 20 });
    // 适配后端分页结构 { items, total } 或 直接数组 (兜底)
    allPlans.value = res.items || (Array.isArray(res) ? res : []);
  } catch (error) {
    console.error("加载计划失败:", error);
    showError("加载计划失败");
  } finally {
    hideToast();
  }
}

// 保存计划 (已废弃，改用后端存储)
// function savePlans() { ... }

// 事件处理
const handleTabChange = (tab: string) => {
  currentTab.value = tab as TabType;
};

const showImportPlan = () => {
  // 延迟打开，避免与 CreateOptionsModal 关闭动画冲突
  setTimeout(() => {
    showImportPlanModal.value = true;
  }, 300);
};

const closeImportPlanModal = () => {
  showImportPlanModal.value = false;
};

const handleImportPlan = async (shareCode: string) => {
  if (!shareCode.trim()) {
    showError("请输入分享码");
    return;
  }
  try {
    showLoading("导入中...");
    await planService.importPlan(shareCode);
    showSuccess("计划导入成功！");
    closeImportPlanModal();
    loadPlanData();
  } catch (error) {
    showError("计划导入失败");
  } finally {
    hideToast();
  }
};

const _showPlanTypes = () => {
  showSuccess("推荐计划已显示在页面下方");
};

// 打开选项弹窗（对应原型中的 "新建" 按钮逻辑）
const createNewPlan = () => {
  showCreateOptionsModal.value = true;
};

// 从选项弹窗点击 "创建新计划"
const handleSelectCreate = () => {
  planStore.resetDraft();
  navigateTo(ROUTES.PLAN_CREATOR);
};

const closeNewPlanModal = () => {
  showNewPlanModal.value = false;
};

const handleCreatePlan = async (_formData: any) => {
  // ... (existing handleCreatePlan code)
};

let isNavigating = false;
const handlePlanAction = async (type: string, planId: string | number) => {
  if (isNavigating) return;

  switch (type) {
    case "view":
      isNavigating = true;
      navigateTo(ROUTES.PLAN_DETAIL, { id: String(planId) }).then(() => {
        isNavigating = false;
      }).catch(() => {
        isNavigating = false;
      });
      break;
    case "activate":
      try {
        showLoading("正在激活...");
        await planService.activatePlan(Number(planId));
        showSuccess("激活成功");
        loadPlanData();
      } catch (e) {
        showError("激活失败");
      }
      break;
    case "edit":
      showError("编辑功能开发中");
      break;
    case "menu":
      // 可以展示更多操作
      Taro.showActionSheet({
        itemList: ["分享计划", "编辑名称", "删除计划"],
        success: async (res) => {
          if (res.tapIndex === 0) {
            // 分享逻辑
            try {
              showLoading("生成分享码...");
              const { code } = await planService.sharePlan(Number(planId));
              Taro.showModal({
                title: "分享成功",
                content: `分享码: ${code}\n复制此码发给好友即可导入计划。`,
                confirmText: "复制码",
                success: (mRes) => {
                  if (mRes.confirm) {
                    Taro.setClipboardData({ data: code });
                  }
                },
              });
            } catch (e) {
              showError("生成分享码失败");
            } finally {
              hideToast();
            }
          } else if (res.tapIndex === 2) {
            Taro.showModal({
              title: "确认删除",
              content: "确定要删除此计划吗？",
              success: async (mRes) => {
                if (mRes.confirm) {
                  await planService.deletePlan(Number(planId));
                  showSuccess("已删除");
                  loadPlanData();
                }
              },
            });
          }
        },
      });
      break;
  }
};

// ... (existing methods)

// 创建推荐计划
const _handleCreateRecommendedPlan = (_type: string) => {
  planStore.resetDraft();
  // 模拟原型：根据类型预设部分数据
  const presets: any = {
    "fat-loss": { name: "30天减脂挑战", type: "carb-cycle", cycleDays: 7 },
    "muscle-gain": { name: "增肌训练计划", type: "custom", cycleDays: 7 },
    balanced: { name: "均衡营养计划", type: "custom", cycleDays: 1 },
  };

  if (presets[_type]) {
    Object.assign(planStore.draft, presets[_type]);
  }

  navigateTo(ROUTES.PLAN_CREATOR, { type: _type });
};

// 页面加载时初始化
onMounted(() => {
  loadPlanData();
});

// 暴露给自动化测试
defineExpose({
  createNewPlan,
});
</script>

<style lang="scss" scoped>
@import "./index.scss";

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>

