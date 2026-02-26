<template>
  <PageLayout title="新建饮食计划">
    <BasicInfoStep
      :form-data="planStore.draft"
      @update:form-data="handleUpdate"
    />
    <CycleSettingsStep
      :form-data="planStore.draft"
      @update:form-data="handleUpdate"
    />

    <template #footer>
      <view class="flex space-x-3">
        <view
          @click="handleCancel"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-black active:bg-gray-200 transition-colors text-center"
        >
          取消
        </view>
        <view
          @click="handleNext"
          class="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-black active:bg-emerald-700 transition-colors text-center shadow-sm"
        >
          下一步
        </view>
      </view>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Taro, { useRouter } from "@tarojs/taro";
import { navigateTo, navigateBack, switchTab, ROUTES } from "@/router";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import BasicInfoStep from "@/components/plan-creator/BasicInfoStep.vue";
import CycleSettingsStep from "@/components/plan-creator/CycleSettingsStep.vue";
import PageLayout from "@/components/common/PageLayout.vue";
import { showLoading, hideToast, showError } from "@/utils/toast";

const planStore = usePlanStore();
const router = useRouter();

onMounted(async () => {
  const routerId = router.params.id || router.params.planId;
  if (routerId) {
    const planId = Number(routerId);
    // 只有在 Store 中 ID 缺失时才拉取数据（防止覆盖已在内存中的修改）
    if (planStore.draft.id !== planId) {
      try {
        showLoading("加载计划信息...");
        const res: any = await planService.getPlanDetail(planId);
        const data = res.data || res;
        
        // 恢复草稿状态
        planStore.draft.id = planId;
        planStore.draft.name = data.name;
        planStore.draft.type = data.type;
        planStore.draft.cycleDays = data.cycleDays;
        planStore.draft.cycleCount = data.cycleCount;
        if (data.carbCycleConfig) {
          planStore.draft.carbCycleConfig = data.carbCycleConfig;
        }
      } catch (e) {
        console.error("Failed to recover draft info", e);
      } finally {
        hideToast();
      }
    }
  }
});

const handleUpdate = (data: any) => {
  Object.assign(planStore.draft, data);
};

const handleNext = async () => {
  if (!planStore.draft.name.trim()) {
    showError("请输入计划名称");
    return;
  }

  try {
    const isEdit = !!planStore.draft.id;
    let planId = planStore.draft.id;

    if (isEdit) {
      showLoading("正在更新计划...");
      await planService.updatePlan(planId!, {
        name: planStore.draft.name,
        type: planStore.draft.type as any,
        cycleDays: Number(planStore.draft.cycleDays),
        cycleCount: Number(planStore.draft.cycleCount),
      });
    } else {
      showLoading("正在创建计划...");
      const res = await planService.createPlan({
        name: planStore.draft.name,
        type: planStore.draft.type as any,
        cycleDays: Number(planStore.draft.cycleDays),
        cycleCount: Number(planStore.draft.cycleCount),
      });
      planId = res.id;
      planStore.draft.id = planId;
    }

    hideToast();

    if (planStore.draft.type === "carb-cycle") {
      // 检查是否需要跳转配置页或直接生成日程
      if (!planStore.draft.carbCycleConfig) {
        planStore.draft.carbCycleConfig = {
          weight: 70,
          baseRatios: { protein: 2.0, carbs: 3.0, fat: 0.8 },
          phases: {
            high: { days: 1, proteinRatio: 1, carbRatio: 1.5, fatRatio: 0.8 },
            medium: { days: 1, proteinRatio: 1, carbRatio: 1, fatRatio: 1 },
            low: { days: 1, proteinRatio: 1, carbRatio: 0.5, fatRatio: 1.2 },
          },
        };
      }
      navigateTo(ROUTES.CARB_CYCLE_SETUP, { planId });
    } else {
      // 常规流程：检查是否需要重置日程
      let shouldInit = true;
      if (isEdit) {
        const currentPlan: any = await planService.getPlanDetail(planId!);
        const detail = currentPlan.data || currentPlan;
        const hasData = detail.planDays?.some((d: any) => d.isConfigured);
        
        // 如果周期没变且已有数据，则询问
        if (detail.cycleDays === Number(planStore.draft.cycleDays) && hasData) {
          const confirmRes = await Taro.showModal({
            title: "保持现有配置？",
            content: "检测到该计划已有日程配置，是否保留现有配置进入下一步？",
            confirmText: "保留配置",
            cancelText: "重新生成",
          });
          shouldInit = !confirmRes.confirm;
        }
      }

      if (shouldInit) {
        showLoading("正在生成日程...");
        const days = [];
        for (let i = 1; i <= planStore.draft.cycleDays; i++) {
          days.push({ dayNumber: i, carbType: null });
        }
        await planService.initPlanDays(planId!, { days, force: true });
      }

      navigateTo(ROUTES.PLAN_TEMPLATES, { id: String(planId) });
    }
  } catch (e: any) {
    showError(e.message || "操作失败");
  } finally {
    hideToast();
  }
};

const _handleGoBack = () => navigateBack();

const handleCancel = () => {
  Taro.showModal({
    title: "确认取消",
    content: "确定要放弃创建计划吗？",
    success: (res) => {
      if (res.confirm) switchTab(ROUTES.PLAN_OVERVIEW);
    },
  });
};
</script>

<style scoped>
.hero-title {
  font-family: "Noto Serif SC", serif;
}
</style>
