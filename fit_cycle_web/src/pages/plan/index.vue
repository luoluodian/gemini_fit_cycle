<template>
  <view class="h-screen flex flex-col overflow-hidden">
    <!-- 1. Header (Fixed) -->
    <BaseNavBar title="饮食计划" back-mode="none" class="flex-shrink-0">
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

    <!-- 2. Main Body (参考 food 模块的结构) -->
    <view
      class="flex-1 min-h-0 flex flex-col px-4 pt-4 overflow-hidden space-y-4 pb-tabbar"
    >
      <!-- 2.1 Tab 控制区 -->
      <view class="flex-shrink-0">
        <BaseTabs
          :tabs="tabs"
          :active-tab="currentTab"
          type="pills"
          @change="handleTabChange"
        />
      </view>

      <!-- 2.1.5 超额警告横幅 -->
      <view 
        v-if="allPlans.length > currentLimit" 
        class="flex-shrink-0 bg-red-50 border border-solid border-red-100 rounded-2xl p-3 flex items-start animate-fade-in"
      >
        <text class="text-base mr-2">⚠️</text>
        <view class="flex-1">
          <text class="text-xs font-black text-red-800 block">计划配额已超限</text>
          <text class="text-[18rpx] text-red-600 font-bold mt-0.5 block leading-relaxed">
            由于会员过期或调整，当前计划数 ({{ allPlans.length }}) 已超过上限 ({{ currentLimit }}个)。现有计划仍可使用，但删除至上限以下前将无法创建或导入新计划。
          </text>
        </view>
      </view>

      <!-- 2.2 列表内容区 -->
      <GlassCard
        card-class="flex-1 flex flex-col min-h-0 overflow-hidden"
        class="animate-fade-in-up delay-200 flex-1 min-h-0"
      >
        <view class="flex items-center justify-between mb-4 flex-shrink-0">
          <view class="flex items-center gap-2">
            <view class="w-1.5 h-3.5 bg-emerald-500 rounded-full"></view>
            <text class="text-sm font-black text-gray-700"
              >{{ currentTabLabel }}计划</text
            >
          </view>
          <view class="flex flex-col items-end">
            <text class="text-[18rpx] text-gray-300 font-black">
              共 {{ filteredPlans.length }} 个计划
            </text>
            <text 
              :class="[
                'text-[16rpx] font-black mt-0.5',
                isLimitReached ? 'text-red-500' : 'text-emerald-400'
              ]"
            >
              {{ isLimitReached && allPlans.length > currentLimit ? '已超额' : '配额' }}: {{ allPlans.length }}/{{ currentLimit }}
            </text>
          </view>
        </view>

        <!-- 核心滑动层：显式设置 flex-1 min-h-0 -->
        <BaseScrollView
          :is-empty="filteredPlans.length === 0"
          content-class="space-y-3 pr-2 pt-2 "
          scroll-view-class="flex-1 min-h-0"
        >
          <template #empty>
            <EmptyPlanState
              :text="
                currentTab === 'active'
                  ? '暂无进行中的计划'
                  : '暂无已完成的计划'
              "
              :action-text="currentTab === 'active' ? '创建新计划' : ''"
              @action="createNewPlan"
            />
          </template>

          <PlanCard
            v-for="plan in filteredPlans"
            :key="plan.id"
            :plan="plan"
            @action="handlePlanAction"
          />
        </BaseScrollView>
      </GlassCard>
    </view>

    <!-- 3. Modals -->
    <CreateOptionsModal
      v-model:visible="showCreateOptionsModal"
      @create="handleSelectCreate"
      @import="showImportPlan"
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
import Taro, { useDidShow } from "@tarojs/taro";
import { navigateTo, ROUTES } from "@/router";
import BaseTabs from "@/components/common/BaseTabs.vue";
import PlanCard from "@/components/plan/PlanCard.vue";
import ImportPlanModal from "@/components/plan/ImportPlanModal.vue";
import CreateOptionsModal from "@/components/plan/CreateOptionsModal.vue";
import EmptyPlanState from "@/components/plan/EmptyPlanState.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import BaseScrollView from "@/components/common/BaseScrollView.vue";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";
import { useNavigationStore } from "@/stores/navigation";
import { usePlanStore } from "@/stores/plan";
import { useUserStore } from "@/stores/user";
import { planService } from "@/services";
import { Uploader } from "@nutui/icons-vue-taro";
import { displayUnit } from "@/utils";

type TabType = "active" | "completed";

const navStore = useNavigationStore();
const planStore = usePlanStore();
const userStore = useUserStore();

const PLAN_LIMITS = {
  NORMAL: 5,
  VIP: 100
};

const currentLimit = computed(() => {
  const user = userStore.userInfo?.user;
  if (!user) return PLAN_LIMITS.NORMAL;
  
  // 🚀 核心纠偏：前端同步增加过期判定
  const memberLevel = user.memberLevel || 0;
  const expiresAt = user.memberExpiresAt ? new Date(user.memberExpiresAt).getTime() : 0;
  const isExpired = expiresAt > 0 && expiresAt < Date.now();
  const isAdmin = user.role === 'admin';
  
  const isVip = (memberLevel === 1 && !isExpired) || isAdmin;
  return isVip ? PLAN_LIMITS.VIP : PLAN_LIMITS.NORMAL;
});

const isLimitReached = computed(() => {
  return allPlans.value.length >= currentLimit.value;
});

const tabs = [
  { key: "active", label: "进行中" },
  { key: "completed", label: "已完成" },
];

const currentTab = ref<TabType>("active");
const currentTabLabel = computed(
  () => tabs.find((t) => t.key === currentTab.value)?.label,
);

const showImportPlanModal = ref(false);
const showCreateOptionsModal = ref(false);
const allPlans = ref<any[]>([]);

useDidShow(() => {
  navStore.setActiveTab(1);
  const page = Taro.getCurrentInstance().page;
  if (page && typeof page.getTabBar === "function" && page.getTabBar()) {
    page.getTabBar().setData({ selected: 1 });
  }
  // 🚀 核心纠偏：同步用户信息
  userStore.fetchUserProfile();
  loadPlanData();
});

// 计算属性：按状态分类计划并格式化
const filteredPlans = computed(() => {
  const filtered = allPlans.value.filter((p) => {
    if (currentTab.value === "active") {
      return (
        p.status === "active" ||
        p.status === "paused" ||
        p.status === "draft" ||
        p.status === "configured"
      );
    }
    return p.status === "completed";
  });

  // 🚀 核心优化：多维排序逻辑
  // 1. 进行中 (active) 优先级最高，置顶
  // 2. 其余按最后修改时间 (updatedAt) 降序排列，若无则按创建时间 (createdAt)
  const sorted = filtered.sort((a, b) => {
    const isAActive = a.status === "active";
    const isBActive = b.status === "active";

    if (isAActive && !isBActive) return -1;
    if (!isAActive && isBActive) return 1;

    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return formatPlans(sorted);
});

// 格式化计划数据 (保持原有逻辑)
function formatPlans(plans: any[]) {
  return plans.map((plan) => {
    const isActive = plan.status === "active";
    const tags: string[] = [];
    let description = "";
    let targets = "";
    let progress = plan.progress || 0;
    let progressColor = "#10b981";

    if (plan.status === "active") {
      tags.push("进行中", "当前使用");
      const typeMap: any = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        "carb-cycle": "碳循环",
      };
      description = `类型：${typeMap[plan.type] || plan.type} | 剩余：${calculateDaysLeft(plan.endDate)}天`;
      targets = `目标热量：${plan.targetCalories || 0} ${displayUnit("kcal")}`;
    } else if (plan.status === "draft") {
      tags.push("草稿", "待配置");
      description = `创建时间：${formatDate(plan.createdAt)}`;
      targets = `目标：未正式开启`;
      progressColor = "#9ca3af";
    } else if (plan.status === "configured") {
      tags.push("已就绪", "待开启");
      const typeMap: any = {
        "fat-loss": "减脂",
        "muscle-gain": "增肌",
        "carb-cycle": "碳循环",
      };
      description = `类型：${typeMap[plan.type] || plan.type} | ${plan.cycleDays}天 × ${plan.cycleCount}周期`;
      targets = `目标热量：${plan.targetCalories || 0} ${displayUnit("kcal")}`;
      progressColor = "#10b981";
    } else if (plan.status === "paused") {
      tags.push("暂停中");
      description = `剩余：${calculateDaysLeft(plan.endDate)}天`;
      targets = `目标热量：${plan.targetCalories || 0} ${displayUnit("kcal")}`;
      progressColor = "#f59e0b";
    } else if (plan.status === "completed") {
      tags.push("已完成");
      description = `结束日期：${formatDate(plan.updatedAt || plan.endDate)}`;
      targets = `目标热量：${plan.targetCalories || 0} ${displayUnit("kcal")}`;
      progress = 100;
      progressColor = "#10b981";
    }

    const actions: any[] = [];
    actions.push({
      label: plan.status === "draft" ? "继续配置" : "查看详情",
      type: "view",
      class: "flex-1 bg-emerald-600 text-white hover:bg-emerald-700",
    });
    if (plan.status === "paused" || plan.status === "configured") {
      actions.push({
        label: "激活",
        type: "activate",
        class: "bg-blue-100 text-blue-700",
      });
    }

    return {
      ...plan,
      tags,
      description,
      targets,
      progress,
      progressColor,
      isActive,
      actions,
    };
  });
}

function calculateDaysLeft(endDate: string): number {
  if (!endDate) return 0;
  const diff = Math.ceil(
    (new Date(endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

async function loadPlanData() {
  try {
    showLoading("加载中...");
    const res: any = await planService.getPlans({ page: 1, limit: 50 });
    allPlans.value = res.items || (Array.isArray(res) ? res : []);
  } catch (error) {
    showError("加载计划失败");
  } finally {
    hideToast();
  }
}

const handleTabChange = (tab: string) => {
  currentTab.value = tab as TabType;
};

const createNewPlan = () => {
  showCreateOptionsModal.value = true;
};

const checkQuota = () => {
  if (isLimitReached.value) {
    Taro.showModal({
      title: "配额已满",
      content: `您的计划数量已达上限(${currentLimit.value}个)，请删除旧计划或升级 VIP。`,
      confirmText: "了解 VIP",
      cancelText: "返回",
      success: (res) => {
        if (res.confirm) {
          showError("升级功能开发中...");
        }
      }
    });
    return false;
  }
  return true;
};

const handleSelectCreate = () => {
  if (!checkQuota()) return;
  planStore.resetDraft();
  navigateTo(ROUTES.PLAN_CREATOR);
};

const showImportPlan = () => {
  if (!checkQuota()) return;
  setTimeout(() => {
    showImportPlanModal.value = true;
  }, 300);
};
const closeImportPlanModal = () => {
  showImportPlanModal.value = false;
};

const handleImportPlan = async (shareCode: string) => {
  if (!shareCode.trim()) return showError("请输入分享码");
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

let isNavigating = false;
const handlePlanAction = async (type: string, planId: string | number) => {
  if (isNavigating) return;
  const targetPlan = allPlans.value.find(
    (p) => String(p.id) === String(planId),
  );

  switch (type) {
    case "view":
      isNavigating = true;
      const route =
        targetPlan?.status === "draft"
          ? ROUTES.PLAN_TEMPLATES
          : ROUTES.PLAN_DETAIL;
      navigateTo(route, { id: String(planId) }).finally(() => {
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
    case "menu":
      Taro.showActionSheet({
        itemList: ["分享计划", "删除计划"],
        success: async (res) => {
          if (res.tapIndex === 0) {
            try {
              showLoading("生成分享码...");
              const shareRes: any = await planService.sharePlan(Number(planId));
              const code = shareRes?.code || shareRes?.data?.code;
              if (code) {
                Taro.showModal({
                  title: "分享成功",
                  content: `分享码: ${code}`,
                  confirmText: "复制码",
                  success: (m) =>
                    m.confirm && Taro.setClipboardData({ data: code }),
                });
              }
            } catch (e) {
              showError("生成失败");
            } finally {
              hideToast();
            }
          } else if (res.tapIndex === 1) {
            Taro.showModal({
              title: "确认删除",
              content: "确定要删除此计划吗？",
              success: async (m) => {
                if (m.confirm) {
                  await planService.deletePlan(Number(planId));
                  showSuccess("已删除");
                  loadPlanData();
                }
              },
            });
          }
        },
        fail: () => {},
      }).catch(() => {});
      break;
  }
};

onMounted(() => {
  loadPlanData();
});
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
