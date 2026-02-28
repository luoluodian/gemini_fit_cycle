<template>
  <PageLayout v-if="planStore.draft?.carbCycleConfig" title="碳循环设置">
    <!-- 1. 当前体重 (⚖️) -->
    <view class="animate-fade-in-up">
      <GlassCard
        background="#ffffff"
        card-class="border-[1rpx] border-solid border-gray-200"
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
              :value="planStore.draft.carbCycleConfig.weight"
              type="digit"
              class="w-16 h-10 text-xl font-black text-emerald-600 text-center"
              @input="
                (e) =>
                  (planStore.draft.carbCycleConfig.weight =
                    parseFloat(e.detail.value) || 0)
              "
            />
            <text class="ml-1 text-sm font-bold text-gray-500">{{ displayUnit('kg') }}</text>
          </view>
        </view>
      </GlassCard>
    </view>

    <!-- 2. 营养素配比 (⚡) -->
    <view class="animate-fade-in-up delay-100">
      <GlassCard
        background="#ffffff"
        card-class="border-[1rpx] border-solid border-gray-200"
        :border="false"
      >
        <view class="flex items-center justify-between mb-4">
          <text class="text-lg font-bold text-gray-800">营养素配比</text>
          <text class="text-[20rpx] text-gray-400 font-bold"
            >每{{ displayUnit('kg') }}体重 / 天</text
          >
        </view>

        <view class="grid grid-cols-3 gap-3">
          <!-- 蛋白 -->
          <view
            class="bg-blue-50/50 rounded-2xl p-3 text-center border border-solid border-blue-100"
          >
            <text class="block text-xl mb-1">🍗</text>
            <text class="block text-[20rpx] font-black text-blue-700 mb-2"
              >蛋白质</text
            >
            <input
              :value="planStore.draft.carbCycleConfig.baseRatios.protein"
              type="digit"
              class="w-full h-8 bg-white border border-solid border-blue-200 rounded-lg text-center text-sm font-bold"
              @input="
                (e) =>
                  (planStore.draft.carbCycleConfig.baseRatios.protein =
                    parseFloat(e.detail.value) || 0)
              "
            />
          </view>
          <!-- 碳水 -->
          <view
            class="bg-yellow-50/50 rounded-2xl p-3 text-center border border-solid border-yellow-100"
          >
            <text class="block text-xl mb-1">⚡</text>
            <text class="block text-[20rpx] font-black text-yellow-700 mb-2"
              >碳水</text
            >
            <input
              :value="planStore.draft.carbCycleConfig.baseRatios.carbs"
              type="digit"
              class="w-full h-8 bg-white border border-solid border-yellow-200 rounded-lg text-center text-sm font-bold"
              @input="
                (e) =>
                  (planStore.draft.carbCycleConfig.baseRatios.carbs =
                    parseFloat(e.detail.value) || 0)
              "
            />
          </view>
          <!-- 脂肪 -->
          <view
            class="bg-red-50/50 rounded-2xl p-3 text-center border border-solid border-red-100"
          >
            <text class="block text-xl mb-1">🥑</text>
            <text class="block text-[20rpx] font-black text-red-700 mb-2"
              >脂肪</text
            >
            <input
              :value="planStore.draft.carbCycleConfig.baseRatios.fat"
              type="digit"
              class="w-full h-8 bg-white border border-solid border-red-200 rounded-lg text-center text-sm font-bold"
              @input="
                (e) =>
                  (planStore.draft.carbCycleConfig.baseRatios.fat =
                    parseFloat(e.detail.value) || 0)
              "
            />
          </view>
        </view>

        <view
          class="mt-4 p-3 bg-gray-50/80 rounded-xl text-center border border-solid border-gray-100"
        >
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
          v-model:protein-ratio="
            planStore.draft.carbCycleConfig.phases.high.proteinRatio
          "
          v-model:carb-ratio="
            planStore.draft.carbCycleConfig.phases.high.carbRatio
          "
          v-model:fat-ratio="
            planStore.draft.carbCycleConfig.phases.high.fatRatio
          "
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
          v-model:protein-ratio="
            planStore.draft.carbCycleConfig.phases.medium.proteinRatio
          "
          v-model:carb-ratio="
            planStore.draft.carbCycleConfig.phases.medium.carbRatio
          "
          v-model:fat-ratio="
            planStore.draft.carbCycleConfig.phases.medium.fatRatio
          "
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
          v-model:protein-ratio="
            planStore.draft.carbCycleConfig.phases.low.proteinRatio
          "
          v-model:carb-ratio="
            planStore.draft.carbCycleConfig.phases.low.carbRatio
          "
          v-model:fat-ratio="
            planStore.draft.carbCycleConfig.phases.low.fatRatio
          "
          :result="algoResult.phaseResults.low"
        />
      </view>
    </view>

    <!-- 4. 天数检查 -->
    <view class="animate-fade-in-up delay-500">
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

    <template #footer>
      <view class="flex space-x-3">
        <BaseButton class="flex-1" type="secondary" @click="handleBack"
          >上一步</BaseButton
        >
        <BaseButton
          class="flex-1"
          type="primary"
          :disabled="
            !algoResult.isBalanced ||
            planStore.draft.carbCycleConfig.weight <= 0
          "
          @click="handleNext"
          >下一步</BaseButton
        >
      </view>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import Taro, { useRouter } from "@tarojs/taro";
import { navigateTo, navigateBack, ROUTES } from "@/router";
import PageLayout from "@/components/common/PageLayout.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import PhaseCard from "@/components/carb-cycle-setup/PhaseCard.vue";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { calculateCarbCycle } from "@/utils/carb-cycle-algo";
import { showLoading, hideToast, showError } from "@/utils/toast";
import { displayUnit } from "@/utils";

const planStore = usePlanStore();
const router = useRouter();
const planId = Number(router.params.planId);
const cycleDays = computed(() => planStore.draft.cycleDays);

// 使用计算属性封装算法调用
const algoResult = computed(() => {
  const config = planStore.draft?.carbCycleConfig;
  if (!config) return {
    isBalanced: false,
    summary: { totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    phaseResults: {
      high: { protein: 0, carbs: 0, fat: 0, calories: 0 },
      medium: { protein: 0, carbs: 0, fat: 0, calories: 0 },
      low: { protein: 0, carbs: 0, fat: 0, calories: 0 }
    }
  };

  return calculateCarbCycle({
    weight: config.weight,
    cycleDays: planStore.draft.cycleDays,
    baseRatios: config.baseRatios,
    phases: config.phases,
  });
});

const totalAllocatedDays = computed(
  () =>
    (Number(planStore.draft?.carbCycleConfig?.phases?.high?.days) || 0) +
    (Number(planStore.draft?.carbCycleConfig?.phases?.medium?.days) || 0) +
    (Number(planStore.draft?.carbCycleConfig?.phases?.low?.days) || 0),
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
    const total =
      (Number(phases?.high?.days) || 0) +
      (Number(phases?.medium?.days) || 0) +
      (Number(phases?.low?.days) || 0);

    if (total !== newVal) {
      Taro.showModal({
        title: "周期变动提示",
        content: "检测到周期总天数已修改，请重新分配各阶段天数。",
        showCancel: false,
      });
    }
  },
);

const handleBack = () => navigateBack();

const handleNext = async () => {
  if (!algoResult.value.isBalanced) {
    showError("请先平衡阶段天数");
    return;
  }
  if (planStore.draft.carbCycleConfig.weight <= 0) {
    showError("请输入有效体重");
    return;
  }

  try {
    showLoading("检查计划状态...");
    const currentPlan: any = await planService.getPlanDetail(planId);
    const planRaw = currentPlan.data || currentPlan;
    const hasConfiguredDays = planRaw.planDays?.some((d: any) => d.isConfigured);

    if (hasConfiguredDays) {
      // 🚀 核心优化：增加 isDirty 检测，只有参数变动才弹窗
      const isSameCycle = planRaw.cycleDays === Number(planStore.draft.cycleDays);
      const isSameWeight = Number(planRaw.carbCycleConfig?.weight) === Number(planStore.draft.carbCycleConfig.weight);
      
      // 数值对比，防止 2.00 vs 2 的字符串对比陷阱
      const oldRatios = planRaw.carbCycleConfig?.baseRatios || {};
      const newRatios = planStore.draft.carbCycleConfig.baseRatios || {};
      const isSameRatios = 
        Number(oldRatios.protein) === Number(newRatios.protein) &&
        Number(oldRatios.carbs) === Number(newRatios.carbs) &&
        Number(oldRatios.fat) === Number(newRatios.fat);
      
      const isDirty = !isSameWeight || !isSameRatios || !isSameCycle;

      if (isDirty) {
        const confirmRes = await Taro.showModal({
          title: isSameCycle ? "更新营养目标" : "重置确认",
          content: isSameCycle 
            ? "检测到该计划已有日程配置。由于配置参数已变动，我们将更新每日营养目标并【保留】您已配置的食材明细（需自行根据新目标微调食材），确定继续吗？"
            : "由于周期天数发生变化，重新生成将【清空】您之前在“日模板”中配置的所有食材明细，确定继续吗？",
          confirmText: isSameCycle ? "确认更新" : "确认重置",
          cancelText: "取消",
          confirmColor: isSameCycle ? "#10b981" : "#ef4444",
        });

        if (!confirmRes.confirm) return;
      } else {
        // 参数没变，直接跳转，不重新执行初始化接口（保护数据且提升速度）
        hideToast();
        navigateTo(ROUTES.PLAN_TEMPLATES, { id: String(planId) });
        return;
      }
    }

    showLoading(hasConfiguredDays ? "正在更新数据..." : "正在生成周期数据...");
    
    // 2. 转换算法序列为后端 DTO 格式
    const days = algoResult.value.sequence.map((item, i) => ({
      dayNumber: i + 1,
      carbType: item.type,
      targetCalories: item.calories,
      targetProtein: item.protein,
      targetFat: item.fat,
      targetCarbs: item.carbs
    }));

    // 3. 调用批量初始化接口
    await planService.initPlanDays(planId, { 
      days, 
      force: true 
    });

    hideToast();
    
    // 4. 跳转到日模板列表页
    navigateTo(ROUTES.PLAN_TEMPLATES, { id: String(planId) });
  } catch (e: any) {
    showError(e.message || "初始化日程失败");
  } finally {
    hideToast();
  }
};
</script>

<style scoped lang="scss">
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

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
.delay-400 {
  animation-delay: 0.4s;
}
.delay-500 {
  animation-delay: 0.5s;
}
</style>
