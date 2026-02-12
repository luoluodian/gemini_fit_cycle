<template>
  <GlassCard
    background="#ffffff"
    :card-class="['p-5 border-[1rpx] border-solid relative overflow-hidden', styles.border]"
    :border="false"
  >
    <!-- 侧边色条 -->
    <view :class="['absolute left-0 top-0 bottom-0 w-1.5', styles.bar]"></view>

    <!-- 标题行 -->
    <view class="flex items-center justify-between mb-4">
      <view class="flex items-center">
        <view
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm',
            styles.iconBg,
          ]"
        >
          <text class="text-xl">{{ icon }}</text>
        </view>
        <view>
          <text class="text-lg font-bold text-gray-800 block">{{ title }}</text>
          <text :class="['text-xs font-bold', styles.descColor]">{{ desc }}</text>
        </view>
      </view>
      <view class="flex items-center bg-gray-50 px-3 py-1 rounded-xl border border-solid border-gray-100">
        <text class="text-xs text-gray-400 font-bold mr-2 uppercase tracking-tighter">天数</text>
        <input
          :value="days"
          type="number"
          class="w-10 h-8 text-lg font-black text-gray-800 text-center"
          @input="e => $emit('update:days', parseInt(e.detail.value) || 0)"
        />
      </view>
    </view>

    <!-- 系数输入网格 -->
    <view class="grid grid-cols-3 gap-3 mb-4">
      <view class="text-center">
        <text class="text-[18rpx] text-gray-400 font-black block mb-1 uppercase">蛋白质 ×</text>
        <input
          :value="proteinRatio"
          type="digit"
          class="w-full h-9 bg-white border border-solid border-gray-200 rounded-xl text-center text-sm font-bold shadow-sm"
          @input="e => $emit('update:proteinRatio', parseFloat(e.detail.value) || 0)"
        />
      </view>
      <view class="text-center">
        <text class="text-[18rpx] text-gray-400 font-black block mb-1 uppercase">碳水 ×</text>
        <input
          :value="carbRatio"
          type="digit"
          :class="['w-full h-9 bg-white border border-solid rounded-xl text-center text-sm font-bold shadow-sm', styles.inputBorder]"
          @input="e => $emit('update:carbRatio', parseFloat(e.detail.value) || 0)"
        />
      </view>
      <view class="text-center">
        <text class="text-[18rpx] text-gray-400 font-black block mb-1 uppercase">脂肪 ×</text>
        <input
          :value="fatRatio"
          type="digit"
          class="w-full h-9 bg-white border border-solid border-gray-200 rounded-xl text-center text-sm font-bold shadow-sm"
          @input="e => $emit('update:fatRatio', parseFloat(e.detail.value) || 0)"
        />
      </view>
    </view>

    <!-- 计算结果预览 -->
    <view :class="['rounded-2xl p-3 grid grid-cols-4 gap-2 text-center border border-solid shadow-inner', styles.resultBg, styles.resultBorder]">
      <view>
        <text class="text-[18rpx] text-gray-400 font-bold block">蛋白质</text>
        <text class="text-sm font-black text-blue-600">{{ result.protein }}g</text>
      </view>
      <view>
        <text class="text-[18rpx] text-gray-400 font-bold block">碳水</text>
        <text :class="['text-sm font-black', styles.carbColor]">{{ result.carbs }}g</text>
      </view>
      <view>
        <text class="text-[18rpx] text-gray-400 font-bold block">脂肪</text>
        <text class="text-sm font-black text-red-600">{{ result.fat }}g</text>
      </view>
      <view>
        <text class="text-[18rpx] text-gray-400 font-bold block">热量</text>
        <text class="text-sm font-black text-gray-700">{{ result.calories }}</text>
      </view>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlassCard from "@/components/common/GlassCard.vue";

interface Props {
  type: "high" | "medium" | "low";
  title: string;
  desc: string;
  icon: string;
  days: number;
  proteinRatio: number;
  carbRatio: number;
  fatRatio: number;
  result: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
}

const props = defineProps<Props>();
defineEmits([
  "update:days",
  "update:proteinRatio",
  "update:carbRatio",
  "update:fatRatio",
]);

const styles = computed(() => {
  const configs = {
    high: {
      border: "border-yellow-100",
      bar: "bg-yellow-400",
      iconBg: "bg-yellow-100",
      descColor: "text-yellow-600",
      inputBorder: "border-yellow-300",
      resultBg: "bg-yellow-50/50",
      resultBorder: "border-yellow-100",
      carbColor: "text-yellow-600",
    },
    medium: {
      border: "border-emerald-100",
      bar: "bg-emerald-400",
      iconBg: "bg-emerald-100",
      descColor: "text-emerald-600",
      inputBorder: "border-emerald-300",
      resultBg: "bg-emerald-50/50",
      resultBorder: "border-emerald-100",
      carbColor: "text-emerald-600",
    },
    low: {
      border: "border-blue-100",
      bar: "bg-blue-400",
      iconBg: "bg-blue-100",
      descColor: "text-blue-600",
      inputBorder: "border-blue-300",
      resultBg: "bg-blue-50/50",
      resultBorder: "border-blue-100",
      carbColor: "text-blue-600",
    },
  };
  return configs[props.type];
});
</script>
