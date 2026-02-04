<template>
  <view class="plan-templates-page h-screen flex flex-col overflow-hidden">
    <!-- 1. Header (恢复标准用法) -->
    <BaseNavBar 
      title="配置日模板" 
      :show-back="true"
    />

    <!-- 2. Main Content -->
    <BaseScrollView :flex="true" scroll-view-class="px-4 py-6" content-class="space-y-6">
      <TemplateManagementStep
        v-model:templates="planStore.draft.templates"
        :basic-info="planStore.draft"
        :cycle-info="planStore.draft"
        @edit="handleEditTemplate"
        @add="handleAddTemplate"
        @auto-fill="handleAutoFill"
        @copy="handleCopyTemplate"
        @delete="handleDeleteTemplate"
        @move="handleMoveTemplate"
        @long-press="handleLongPress"
      />
      <!-- Placeholder -->
      <view class="h-10 w-full"></view>
    </BaseScrollView>

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
import Taro, { useRouter } from "@tarojs/taro";
import BaseNavBar from "@/components/common/BaseNavBar.vue";
import TemplateManagementStep from "@/components/plan-creator/TemplateManagementStep.vue";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { convertTemplatesToDto } from "@/utils/plan-converter";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";

const planStore = usePlanStore();
const router = useRouter();
const isEditMode = router.params.mode === 'edit';
const existingPlanId = Number(router.params.id);

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

const handleMoveTemplate = (from: number, to: number) => {
  planStore.reorderTemplate(from, to);
};

const handleLongPress = (index: number) => {
  const options = ["上移一天", "下移一天", "复制该天", "删除该天"];
  Taro.showActionSheet({
    itemList: options,
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          handleMoveTemplate(index, index - 1);
          break;
        case 1:
          handleMoveTemplate(index, index + 1);
          break;
        case 2:
          handleCopyTemplate(index);
          break;
        case 3:
          handleDeleteTemplate(index);
          break;
      }
    },
  });
};

const handleAutoFill = () => {
  if (planStore.draft.type === "carb-cycle") {
    showSuccess("正在根据算法重新计算...");
    // 碳循环流程的自动填充逻辑 (P-8/P-16 整合)
  }
};

const handleSave = async () => {
  try {
    showLoading(isEditMode ? "正在更新计划..." : "正在保存计划...");
    
    let planId: number;

    if (isEditMode && existingPlanId) {
      // 更新现有计划基础信息
      await planService.updatePlan(existingPlanId, {
        name: planStore.draft.name,
        type: planStore.draft.type as any,
        cycleDays: planStore.draft.cycleDays,
        cycleCount: planStore.draft.cycleCount,
        carbCycleConfig: planStore.draft.carbCycleConfig,
      });
      planId = existingPlanId;
    } else {
      // 创建新计划基础信息
      const createRes = await planService.createPlan({
        name: planStore.draft.name,
        type: planStore.draft.type as any,
        cycleDays: planStore.draft.cycleDays,
        cycleCount: planStore.draft.cycleCount,
        carbCycleConfig: planStore.draft.carbCycleConfig,
      });
      planId = createRes?.id;
    }

    if (!planId) throw new Error(isEditMode ? "计划更新失败" : "计划创建失败");

    // 2. 转换并保存每日模板 (包含具体的食材)
    showLoading("正在同步每日配置...");
    const dtoList = convertTemplatesToDto(planStore.draft.templates);
    await planService.savePlanTemplates(planId, { templates: dtoList });

    // 3. 激活计划 (仅在新建模式且勾选时)
    if (planStore.draft.setActive && !isEditMode) {
      showLoading("正在激活计划...");
      await planService.activatePlan(planId);
    }

    showSuccess(isEditMode ? "计划更新成功！" : "计划创建成功！");
    planStore.resetDraft();
    
    // 延迟返回
    setTimeout(() => {
      if (isEditMode) {
        Taro.navigateBack({ delta: 2 }); // 跳过向导回退到详情页
      } else {
        Taro.switchTab({ url: "/pages/plan/index" });
      }
    }, 1500);
  } catch (e: any) {
    console.error("Save Plan Error:", e);
    showError(e.message || "保存失败，请重试");
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
