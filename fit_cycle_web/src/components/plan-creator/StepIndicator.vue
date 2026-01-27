<template>
  <view class="px-4 py-4">
    <view class="flex items-center justify-center">
      <view
        v-for="(step, index) in stepsList"
        :key="index"
        class="flex items-center"
      >
        <view class="flex flex-col items-center justify-center mt-8 space-y-2">
          <view
            :class="[
              'step-indicator w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium ',
              getStepClass(index + 1),
            ]"
          >
            {{ index + 1 }}
          </view>
          <span
            :class="{
              'text-emerald-600 font-medium': step.isActive,
              'text-gray-600': !step.isActive,
            }"
          >
            {{ step.stepLabel }}
          </span>
        </view>
        <view
          v-if="index < stepsList.length - 1"
          :class="['w-8 h-1', getConnectorClass(index + 1)]"
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface StepItem {
  stepLabel: string;
  isActive: boolean;
}

interface Props {
  // 步骤列表，包含标签和激活状态
  stepsList: StepItem[];
}

const props = withDefaults(defineProps<Props>(), {
  stepsList: () => [
    {
      stepLabel: "基础信息",
      isActive: true,
    },
    {
      stepLabel: "每日列表",
      isActive: false,
    },
    {
      stepLabel: "每日计划",
      isActive: false,
    },
  ],
});

// 计算当前激活的步骤索引（从1开始）
const currentStep = computed(() => {
  const activeIndex = props.stepsList.findIndex((step) => step.isActive);
  return activeIndex >= 0 ? activeIndex + 1 : 1;
});

// 获取步骤样式类
const getStepClass = (stepIndex: number) => {
  if (stepIndex < currentStep.value) {
    return "step-indicator completed bg-emerald-600 text-white";
  } else if (stepIndex === currentStep.value) {
    return "step-indicator active bg-emerald-500 text-white";
  } else {
    return "bg-gray-200 text-gray-600";
  }
};

// 获取连接线样式类
const getConnectorClass = (stepIndex: number) => {
  return stepIndex < currentStep.value ? "bg-emerald-500" : "bg-gray-200";
};
</script>

<style scoped>
.step-indicator {
  transition: all 0.3s ease;
}
</style>

