<template>
  <GlassCard
    background="#ffffff"
    card-class="p-3 border-[1rpx] border-solid border-gray-200"
    :border="false"
  >
    <!-- 标题栏 -->
    <view class="flex items-center justify-between mb-3 text-xs">
      <view class="flex items-center space-x-2">
        <text class="text-gray-400 font-black">当日营养参数</text>
        <template v-if="isCarbCycle">
          <text class="text-sm">{{ phaseInfo.icon }}</text>
          <text class="font-black text-gray-800">{{ phaseInfo.name }}</text>
        </template>
      </view>
      <!-- 总热量对比 -->
      <view class="flex items-baseline space-x-1">
        <text class="text-[18rpx] text-gray-400 font-black">热量</text>
        <text class="text-base font-black text-emerald-600">{{ Math.round(current.calories) }}</text>
        <template v-if="target.calories > 0">
          <text class="text-[16rpx] text-gray-300 font-black">/</text>
          <text class="text-xs font-black text-gray-400">{{ target.calories }}</text>
        </template>
        <text class="text-[14rpx] text-gray-400 font-bold ml-0.5">{{ displayUnit('kcal') }}</text>
      </view>
    </view>

    <!-- 营养目标进度网格 -->
    <view class="grid grid-cols-3 gap-2">
      <!-- 蛋白质 -->
      <view class="bg-blue-50/50 rounded-xl p-2 border border-solid border-blue-100">
        <view class="flex items-center justify-between mb-1">
          <text class="text-[16rpx] font-black text-blue-600">蛋白质</text>
          <text class="text-[16rpx] font-black text-blue-400">{{ Math.round(current.protein) }}{{ displayUnit('g') }}</text>
        </view>
        <view class="text-sm font-black text-blue-700 mb-1.5">{{ target.protein }}{{ displayUnit('g') }}</view>
        <view class="w-full bg-blue-100 rounded-full h-1 overflow-hidden">
          <view
            class="h-full rounded-full bg-blue-500 transition-all duration-500"
            :style="{ width: getPercent(current.protein, target.protein) + '%' }"
          ></view>
        </view>
      </view>

      <!-- 碳水 -->
      <view class="bg-yellow-50/50 rounded-xl p-2 border border-solid border-yellow-100">
        <view class="flex items-center justify-between mb-1">
          <text class="text-[16rpx] font-black text-yellow-600">碳水</text>
          <text class="text-[16rpx] font-black text-yellow-500">{{ Math.round(current.carbs) }}{{ displayUnit('g') }}</text>
        </view>
        <view class="text-sm font-black text-yellow-700 mb-1.5">{{ target.carbs }}{{ displayUnit('g') }}</view>
        <view class="w-full bg-yellow-100 rounded-full h-1 overflow-hidden">
          <view
            class="h-full rounded-full bg-yellow-500 transition-all duration-500"
            :style="{ width: getPercent(current.carbs, target.carbs) + '%' }"
          ></view>
        </view>
      </view>

      <!-- 脂肪 -->
      <view class="bg-red-50/50 rounded-xl p-2 border border-solid border-red-100">
        <view class="flex items-center justify-between mb-1">
          <text class="text-[16rpx] font-black text-red-600">脂肪</text>
          <text class="text-[16rpx] font-black text-red-400">{{ Math.round(current.fat) }}{{ displayUnit('g') }}</text>
        </view>
        <view class="text-sm font-black text-red-700 mb-1.5">{{ target.fat }}{{ displayUnit('g') }}</view>
        <view class="w-full bg-red-100 rounded-full h-1 overflow-hidden">
          <view
            class="h-full rounded-full bg-red-500 transition-all duration-500"
            :style="{ width: getPercent(current.fat, target.fat) + '%' }"
          ></view>
        </view>
      </view>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlassCard from "../common/GlassCard.vue";
import { displayUnit } from "@/utils";

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  target: Nutrition;
  current: Nutrition;
  carbType?: "high" | "medium" | "low";
  isCarbCycle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCarbCycle: false
});

const getPercent = (curr: number, tar: number) => {
  if (!tar || isNaN(tar) || tar <= 0) return 0;
  const currentVal = isNaN(curr) ? 0 : curr;
  return Math.min(100, Math.round((currentVal / tar) * 100));
};

const phaseInfo = computed(() => {
  const map = {
    high: { icon: "🔥", name: "高碳日" },
    medium: { icon: "⚖️", name: "中碳日" },
    low: { icon: "❄️", name: "低碳日" },
  };
  return map[props.carbType || "medium"];
});
</script>
