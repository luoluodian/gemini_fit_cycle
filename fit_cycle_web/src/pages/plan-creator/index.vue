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
          @tap="handleCancel"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-black active:bg-gray-200 transition-colors text-center"
        >
          取消
        </view>
        <view
          @tap="handleNext"
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
import PageLayout from "@/components/common/PageLayout.vue";
import BasicInfoStep from "@/components/plan-creator/BasicInfoStep.vue";
import CycleSettingsStep from "@/components/plan-creator/CycleSettingsStep.vue";
import { usePlanStore } from "@/stores/plan";
import { showError } from "@/utils/toast";

const planStore = usePlanStore();

const handleUpdate = (data: any) => {
  Object.assign(planStore.draft, data);
};

const handleNext = () => {
  if (!planStore.draft.name.trim()) {
    showError("请输入计划名称");
    return;
  }

  if (planStore.draft.type === "carb-cycle") {
    // 碳循环流程：跳转到 Step 1.5 核心参数配置
    Taro.navigateTo({ url: "/pages/carb-cycle-setup/index" });
  } else {
    // 常规流程：直接初始化模板并跳转到 Step 2 周期列表
    planStore.initTemplates();
    Taro.navigateTo({ url: "/pages/plan-templates/index" });
  }
};

const handleGoBack = () => Taro.navigateBack();

const handleCancel = () => {
  Taro.showModal({
    title: '确认取消',
    content: '确定要放弃创建计划吗？',
    success: (res) => { if (res.confirm) Taro.switchTab({ url: '/pages/plan/index' }); }
  });
};
</script>

<style scoped>
.hero-title {
  font-family: 'Noto Serif SC', serif;
}
</style>