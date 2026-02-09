<template>
  <PageLayout v-if="planData" title="配置日模板" :use-scroll-view="false">
    <!-- 1. 顶部固定区：计划摘要与进度 (Sticky) -->
    <template #fixed-top>
      <view class="px-4 pt-4">
        <TemplateManagementStep
          :templates="planData.planDays"
          :basic-info="planData"
          :cycle-info="planData"
          mode="header"
        />
      </view>
    </template>

    <!-- 2. 中间内容区：日模板列表 (Flex-1 + Scroll) -->
    <view class="flex-1 min-h-0 flex flex-col p-4 h-full">
      <TemplateManagementStep
        :templates="planData.planDays"
        :basic-info="planData"
        :cycle-info="planData"
        mode="list"
        @edit="handleEditTemplate"
        @add="handleAddTemplate"
        @copy="handleCopyTemplate"
        @delete="handleDeleteTemplate"
        @move="handleMoveTemplate"
        @long-press="handleLongPress"
      />
    </view>

    <template #footer>
      <view class="flex space-x-3">
        <view
          @click="handleBack"
          class="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-black active:bg-gray-200 transition-colors text-center"
        >
          上一步
        </view>
        <view
          @click="handleSave"
          class="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black active:bg-emerald-700 transition-colors text-center shadow-sm"
        >
          确认计划
        </view>
      </view>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import Taro, { useRouter, useDidShow } from "@tarojs/taro";
import { ref } from "vue";
import PageLayout from "@/components/common/PageLayout.vue";
import TemplateManagementStep from "@/components/plan-creator/TemplateManagementStep.vue";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";

const planStore = usePlanStore();
const router = useRouter();
const planId = Number(router.params.id || router.params.planId);

const planData = ref<any>(null);

useDidShow(() => {
  loadData();
});

const loadData = async () => {
  if (!planId) return;
  try {
    showLoading("加载中...");
    const res: any = await planService.getPlanDetail(planId);
    planData.value = res.data || res;
  } catch (e) {
    showError("加载失败");
  } finally {
    hideToast();
  }
};

const handleBack = () => Taro.navigateBack();

const handleEditTemplate = (index: number) => {
  const day = planData.value.planDays[index];
  if (!day) return;
  Taro.navigateTo({
    url: `/pages/edit-template/index?dayId=${day.id}&planId=${planId}`,
  });
};

const handleAddTemplate = async () => {
  if (planData.value.planDays.length >= planData.value.cycleDays) {
    Taro.showToast({ title: "已达到周期天数上限", icon: "none" });
    return;
  }

  try {
    showLoading("正在添加...");
    await planService.createPlanDay(planId, {
      dayNumber: planData.value.planDays.length + 1,
    });
    loadData();
  } catch (e) {
    showError("添加失败");
  }
};

const handleCopyTemplate = async () => {
  showError("克隆功能开发中");
};

const handleDeleteTemplate = async (index: number) => {
  const day = planData.value.planDays[index];
  if (!day) return;

  if (planData.value.planDays.length <= 1) {
    Taro.showToast({ title: "至少保留一天", icon: "none" });
    return;
  }

  try {
    showLoading("正在删除...");
    await planService.removePlanDay(day.id);
    loadData();
  } catch (e) {
    showError("删除失败");
  }
};

const handleMoveTemplate = () => {
  showError("移动功能开发中");
};

const handleLongPress = (index: number) => {
  const options = ["删除该天"];
  Taro.showActionSheet({
    itemList: options,
    success: (res) => {
      if (res.tapIndex === 0) handleDeleteTemplate(index);
    },
  });
};

const handleSave = async () => {
  try {
    showLoading("正在提交...");
    await planService.updatePlan(planId, {
      status: "configured" as any,
    });
    showSuccess("计划配置完成！");
    planStore.resetDraft();
    setTimeout(() => {
      Taro.switchTab({ url: "/pages/plan/index" });
    }, 1500);
  } catch (e: any) {
    showError(e.message || "提交失败");
  } finally {
    hideToast();
  }
};
</script>

<style scoped>
.hero-title {
  font-family: "Noto Serif SC", serif;
}
</style>
