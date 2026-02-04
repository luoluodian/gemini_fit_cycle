<template>
  <view v-if="planStore.draft?.carbCycleConfig" class="carb-cycle-setup-page h-screen flex flex-col overflow-hidden">
    <BaseNavBar title="碳循环设置" :show-back="true" />

    <BaseScrollView :flex="true" scroll-view-class="py-6" content-class="px-4 space-y-6">
      <!-- 1. 当前体重 (⚖️) -->
      <view class="animate-fade-in-up">
        <GlassCard
          background="#ffffff"
          card-class="p-5 border-[1rpx] border-solid border-gray-200"
          radius="xl"
          :border="false"
        >
          <view class="flex items-center justify-between">
            <view class="flex items-center">
              <view
                class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3"
              >
                <text class="text-xl">⚖️</text>
              </view>
              <view>
                <text class="text-lg font-bold text-gray-800 block"
                  >当前体重</text
                >
                <text class="text-xs text-gray-400">用于计算营养素摄入量</text>
              </view>
            </view>
            <view class="flex items-center bg-gray-50 px-3 py-1 rounded-xl">
              <input
                v-model.number="planStore.draft.carbCycleConfig.weight"
                type="digit"
                class="w-16 h-10 text-xl font-black text-emerald-600 text-center"
              />
              <text class="ml-1 text-sm font-bold text-gray-500">kg</text>
            </view>
          </view>
        </GlassCard>
      </view>

      <!-- 2. 营养素配比 (⚡) -->
      <view class="animate-fade-in-up delay-100">
        <GlassCard
          background="#ffffff"
          card-class="p-5 border-[1rpx] border-solid border-gray-200"
          radius="xl"
          :border="false"
        >
          <view class="flex items-center justify-between mb-4">
            <text class="text-lg font-bold text-gray-800">营养素配比</text>
            <text class="text-[20rpx] text-gray-400 font-bold uppercase"
              >每kg体重 / 天</text
            >
          </view>

          <view class="grid grid-cols-3 gap-3">
            <!-- 蛋白 -->
            <view class="bg-blue-50/50 rounded-2xl p-3 text-center border border-solid border-blue-100">
              <text class="block text-xl mb-1">🍗</text>
              <text class="block text-[20rpx] font-black text-blue-700 mb-2"
                >蛋白质</text
              >
              <input
                v-model.number="planStore.draft.carbCycleConfig.baseRatios.protein"
                type="digit"
                class="w-full h-8 bg-white border border-solid border-blue-200 rounded-lg text-center text-sm font-bold"
              />
            </view>
            <!-- 碳水 -->
            <view class="bg-yellow-50/50 rounded-2xl p-3 text-center border border-solid border-yellow-100">
              <text class="block text-xl mb-1">⚡</text>
              <text class="block text-[20rpx] font-black text-yellow-700 mb-2"
                >碳水</text
              >
              <input
                v-model.number="planStore.draft.carbCycleConfig.baseRatios.carbs"
                type="digit"
                class="w-full h-8 bg-white border border-solid border-yellow-200 rounded-lg text-center text-sm font-bold"
              />
            </view>
            <!-- 脂肪 -->
            <view class="bg-red-50/50 rounded-2xl p-3 text-center border border-solid border-red-100">
              <text class="block text-xl mb-1">🥑</text>
              <text class="block text-[20rpx] font-black text-red-700 mb-2"
                >脂肪</text
              >
              <input
                v-model.number="planStore.draft.carbCycleConfig.baseRatios.fat"
                type="digit"
                class="w-full h-8 bg-white border border-solid border-red-200 rounded-lg text-center text-sm font-bold"
              />
            </view>
          </view>

          <view class="mt-4 p-3 bg-gray-50/80 rounded-xl text-center border border-solid border-gray-100">
            <text class="text-[20rpx] text-gray-400 font-bold"
              >本周期 ({{ cycleDays }}天) 总量预计</text
            >
            <view class="flex items-center justify-center space-x-2 mt-1">
              <text class="text-xs font-black text-gray-600"
                >蛋 {{ algoResult.summary.totalProtein }}g</text
              >
              <text class="text-gray-300">·</text>
              <text class="text-xs font-black text-gray-600"
                >碳 {{ algoResult.summary.totalCarbs }}g</text
              >
              <text class="text-gray-300">·</text>
              <text class="text-xs font-black text-gray-600"
                >脂 {{ algoResult.summary.totalFat }}g</text
              >
            </view>
          </view>
        </GlassCard>
      </view>

      <!-- 3. 阶段分配 -->
      <view class="space-y-4">
        <!-- 高碳 -->
        <view class="animate-fade-in-up delay-200">
          <PhaseCard
            type="high"
            title="高碳日"
            desc="高碳水配置"
            icon="🔥"
            v-model:days="planStore.draft.carbCycleConfig.phases.high.days"
            v-model:protein-ratio="planStore.draft.carbCycleConfig.phases.high.proteinRatio"
            v-model:carb-ratio="planStore.draft.carbCycleConfig.phases.high.carbRatio"
            v-model:fat-ratio="planStore.draft.carbCycleConfig.phases.high.fatRatio"
            :result="algoResult.phaseResults.high"
          />
        </view>
        <!-- 中碳 -->
        <view class="animate-fade-in-up delay-300">
          <PhaseCard
            type="medium"
            title="中碳日"
            desc="基准配置"
            icon="⚖️"
            v-model:days="planStore.draft.carbCycleConfig.phases.medium.days"
            v-model:protein-ratio="planStore.draft.carbCycleConfig.phases.medium.proteinRatio"
            v-model:carb-ratio="planStore.draft.carbCycleConfig.phases.medium.carbRatio"
            v-model:fat-ratio="planStore.draft.carbCycleConfig.phases.medium.fatRatio"
            :result="algoResult.phaseResults.medium"
          />
        </view>
        <!-- 低碳 -->
        <view class="animate-fade-in-up delay-400">
          <PhaseCard
            type="low"
            title="低碳日"
            desc="低碳水配置"
            icon="❄️"
            v-model:days="planStore.draft.carbCycleConfig.phases.low.days"
            v-model:protein-ratio="planStore.draft.carbCycleConfig.phases.low.proteinRatio"
            v-model:carb-ratio="planStore.draft.carbCycleConfig.phases.low.carbRatio"
            v-model:fat-ratio="planStore.draft.carbCycleConfig.phases.low.fatRatio"
            :result="algoResult.phaseResults.low"
          />
        </view>
      </view>

      <!-- 4. 天数检查 -->
      <view class="animate-fade-in-up delay-500 pb-10">
        <view
          :class="[
            'p-4 rounded-2xl text-center border border-solid transition-all duration-300 shadow-sm',
            checkStatus.class,
          ]"
        >
          <view class="flex items-center justify-center space-x-2">
            <text class="text-sm font-black">{{ checkStatus.text }}</text>
            <text class="text-base font-black"
              >{{ totalAllocatedDays }} / {{ cycleDays }}</text
            >
            <text class="text-sm font-bold">天</text>
          </view>
          <text class="text-[20rpx] mt-1 block opacity-80">{{
            checkStatus.subText
          }}</text>
        </view>
      </view>
    </BaseScrollView>

    <!-- 底部操作 -->
    <view class="p-4 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <view class="flex space-x-3">
        <BaseButton class="flex-1" type="secondary" @click="handleBack"
          >上一步</BaseButton
        >
        <BaseButton
          class="flex-1"
          type="primary"
          :disabled="!algoResult.isBalanced || planStore.draft.carbCycleConfig.weight <= 0"
          @click="handleNext"
          >下一步</BaseButton
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Taro from "@tarojs/taro";
import BaseNavBar from "@/components/common/BaseNavBar.vue";
import BaseScrollView from "@/components/common/BaseScrollView.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import PhaseCard from "@/components/carb-cycle-setup/PhaseCard.vue";
import { usePlanStore } from "@/stores/plan";
import { calculateCarbCycle } from "@/utils/carb-cycle-algo";
import { showError } from "@/utils/toast";

const planStore = usePlanStore();
const cycleDays = computed(() => planStore.draft.cycleDays);

// 使用计算属性封装算法调用
const algoResult = computed(() => {
  const config = planStore.draft?.carbCycleConfig;
  if (!config) return null;
  
  return calculateCarbCycle({
    weight: config.weight,
    cycleDays: planStore.draft.cycleDays,
    baseRatios: config.baseRatios,
    phases: config.phases
  });
});

const totalAllocatedDays = computed(
  () => (Number(planStore.draft?.carbCycleConfig?.phases?.high?.days) || 0) + 
        (Number(planStore.draft?.carbCycleConfig?.phases?.medium?.days) || 0) + 
        (Number(planStore.draft?.carbCycleConfig?.phases?.low?.days) || 0)
);

const checkStatus = computed(() => {
  const diff = (Number(cycleDays.value) || 0) - totalAllocatedDays.value;
  if (diff === 0) {
    return {
      class: "bg-emerald-100 border-emerald-200 text-emerald-700",
      text: "✓ 阶段天数与周期天数匹配",
      subText: "配置已就绪，可以生成计划列表",
    };
  } else if (diff > 0) {
    return {
      class: "bg-yellow-100 border-yellow-200 text-yellow-700",
      text: "天数配置不足",
      subText: `还需配置 ${diff} 天以平衡周期`,
    };
  } else {
    return {
      class: "bg-red-100 border-red-200 text-red-700",
      text: "天数配置超出",
      subText: `已超出 ${Math.abs(diff)} 天，请减少分配`,
    };
  }
});

// 监听周期天数变化（防呆逻辑）
watch(
  () => planStore.draft?.cycleDays,
  (newVal) => {
    // 重新获取当前分配的总天数
    const phases = planStore.draft?.carbCycleConfig?.phases;
    const total = (Number(phases?.high?.days) || 0) + (Number(phases?.medium?.days) || 0) + (Number(phases?.low?.days) || 0);
    
    if (total !== newVal) {
      Taro.showModal({
        title: "周期变动提示",
        content: "检测到周期总天数已修改，请重新分配各阶段天数。",
        showCancel: false,
      });
    }
  }
);

const handleBack = () => Taro.navigateBack();

const handleNext = async () => {
  if (!algoResult.value.isBalanced) {
    showError("请先平衡阶段天数");
    return;
  }
  if (planStore.draft.carbCycleConfig.weight <= 0) {
    showError("请输入有效体重");
    return;
  }

  // 如果已经有模板内容，提醒用户将覆盖
  if (planStore.draft.templates.length > 0) {
    const res = await Taro.showModal({
      title: "重新生成确认",
      content: "修改碳循环配置将覆盖已有的日模板设置，确定继续吗？",
      confirmColor: "#10b981",
    });
    if (!res.confirm) return;
  }

  // 1. 根据算法生成的 sequence 初始化模板列表
  // 映射关系：algoResult.sequence -> planStore.draft.templates
  const list = algoResult.value.sequence.map((item, i) => ({
    tempId: "temp_" + Date.now() + "_" + i,
    name: "", // 不设名称，触发组件显示营养目标预览
    targetCalories: item.calories,
    protein: item.protein,
    fat: item.fat,
    carbs: item.carbs,
    isConfigured: true,
    carbType: item.type, // 'high' | 'medium' | 'low'
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
  }));

  // 2. 更新 Store
  planStore.draft.templates = list;
  
  // 3. 跳转到配置日模板页面
  Taro.navigateTo({ url: "/pages/plan-templates/index" });
};
</script>

<style scoped lang="scss">
.carb-cycle-setup-page {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
</style>