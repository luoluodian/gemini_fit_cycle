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
import Taro from "@tarojs/taro";
import { navigateTo, navigateBack, switchTab, ROUTES } from "@/router";
import PageLayout from "@/components/common/PageLayout.vue";
import BasicInfoStep from "@/components/plan-creator/BasicInfoStep.vue";
import CycleSettingsStep from "@/components/plan-creator/CycleSettingsStep.vue";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { showLoading, hideToast, showError } from "@/utils/toast";

const planStore = usePlanStore();

const handleUpdate = (data: any) => {
  Object.assign(planStore.draft, data);
};

const handleNext = async () => {
  if (!planStore.draft.name.trim()) {
    showError("请输入计划名称");
    return;
  }

  try {
    showLoading("正在创建计划...");
    // 1. 调用接口创建 DRAFT 状态的计划
    const res = await planService.createPlan({
      name: planStore.draft.name,
      type: planStore.draft.type as any,
      cycleDays: Number(planStore.draft.cycleDays),
      cycleCount: Number(planStore.draft.cycleCount),
    });

    const planId = res.id;
    hideToast();

    if (planStore.draft.type === "carb-cycle") {
      // 关键修复：确保跳转前配置对象已初始化
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
      // 常规流程：确保此时 carbType 是空的
      showLoading("正在生成日程...");
      const days = [];
      for (let i = 1; i <= planStore.draft.cycleDays; i++) {
        days.push({ dayNumber: i, carbType: null }); // 显式传 null
      }
      await planService.initPlanDays(planId, { days });

      navigateTo(ROUTES.PLAN_TEMPLATES, { id: String(planId) });
    }
  } catch (e: any) {
    showError(e.message || "创建失败");
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
