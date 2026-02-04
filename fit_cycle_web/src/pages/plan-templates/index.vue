<template>
  <view class="plan-templates-page min-h-screen flex flex-col">
    <!-- 1. Header (恢复标准用法) -->
    <BaseNavBar 
      title="配置日模板" 
      :show-back="true"
    />

    <!-- 2. Main Content -->
    <view class="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <TemplateManagementStep
        v-model:templates="planStore.draft.templates"
        :basic-info="planStore.draft"
        :cycle-info="planStore.draft"
        @edit="handleEditTemplate"
        @add="handleAddTemplate"
        @auto-fill="handleAutoFill"
        @copy="handleCopyTemplate"
        @delete="handleDeleteTemplate"
      />
      <!-- Placeholder -->
      <view class="h-10 w-full"></view>
    </view>

    <!-- 3. Footer -->
    <view 
      class="bg-white border-t border-gray-200 px-4 pt-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <view class="flex space-x-3 max-w-md mx-auto mb-3">
        <view
          @tap="handleBack"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-black active:bg-gray-200 transition-colors text-center"
        >
          上一步
        </view>
        <view
          @tap="handleSave"
          class="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-black active:bg-emerald-700 transition-colors text-center shadow-sm"
        >
          确认计划
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import BaseNavBar from "@/components/common/BaseNavBar.vue";
import TemplateManagementStep from "@/components/plan-creator/TemplateManagementStep.vue";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";

const planStore = usePlanStore();

const handleBack = () => Taro.navigateBack();

const handleEditTemplate = (index: number) => {
  planStore.currentDayIndex = index;
  Taro.navigateTo({ url: "/pages/edit-template/index" });
};

const handleAddTemplate = () => {
  if (planStore.draft.templates.length >= planStore.draft.cycleDays) {
    Taro.showToast({ title: "已达到周期天数上限", icon: "none" });
    return;
  }
  planStore.addTemplate();
};

const handleCopyTemplate = (index: number) => {
  if (planStore.draft.templates.length >= planStore.draft.cycleDays) {
    Taro.showToast({ title: "已达到周期天数上限", icon: "none" });
    return;
  }
  planStore.copyTemplate(index);
  Taro.showToast({ title: "已复制", icon: "none" });
};

const handleDeleteTemplate = (index: number) => {
  if (planStore.draft.templates.length <= 1) {
    Taro.showToast({ title: "至少保留一天", icon: "none" });
    return;
  }
  planStore.deleteTemplate(index);
};

const handleAutoFill = () => {
  if (planStore.draft.type === "carb-cycle") {
    showSuccess("正在根据算法重新计算...");
    // 碳循环流程的自动填充逻辑 (P-8/P-16 整合)
  }
};

const handleSave = async () => {
  try {
    showLoading("正在保存...");
    const res = await planService.createPlan({
      name: planStore.draft.name,
      type: planStore.draft.type as any,
      cycleDays: planStore.draft.cycleDays,
      cycleCount: planStore.draft.cycleCount,
    });

    if (planStore.draft.setActive && res?.id) {
      await planService.activatePlan(res.id);
    }

    showSuccess("计划创建成功！");
    planStore.resetDraft();
    setTimeout(() => Taro.switchTab({ url: "/pages/plan/index" }), 1500);
  } catch (e) {
    showError("保存失败");
  } finally {
    hideToast();
  }
};
</script>

<style scoped>
.plan-templates-page {
  min-height: 100vh;
}
.hero-title {
  font-family: "Noto Serif SC", serif;
}
</style>
