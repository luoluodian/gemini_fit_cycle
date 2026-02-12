<template>
  <GlassCard
    card-class="p-6 border-[1rpx] border-solid border-gray-200"
    :border="false"
  >
    <h3 class="text-lg font-semibold text-gray-800 mb-4">周期设置</h3>

    <view class="space-y-4">
      <view class="grid grid-cols-2 gap-4">
        <view>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >每周期天数</label
          >
          <input
            type="number"
            :value="formData.cycleDays"
            @input="handleCycleDaysChange"
            class="px-4 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            placeholder="7"
            min="1"
            max="14"
          />
          <text class="text-[20rpx] text-gray-500 mt-1 block">建议 3~7 天</text>
        </view>
        <view>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >周期数量</label
          >
          <input
            type="number"
            :value="formData.cycleCount"
            @input="handleCycleCountChange"
            class="px-4 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            placeholder="3"
            min="1"
            max="10"
          />
        </view>
      </view>

      <view class="bg-emerald-50 rounded-lg p-3">
        <view class="flex items-center justify-between">
          <text class="text-sm font-medium text-gray-700">总天数</text>
          <text class="text-lg font-bold text-emerald-600"
            >{{ totalDays }} 天</text
          >
        </view>
      </view>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlassCard from "../common/GlassCard.vue";

interface Props {
  formData: {
    cycleDays: number;
    cycleCount: number;
  };
}
const props = defineProps<Props>();
const emit = defineEmits(["update:formData"]);

const totalDays = computed(
  () => (props.formData.cycleDays || 0) * (props.formData.cycleCount || 0),
);

const handleCycleDaysChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { cycleDays: parseInt(value) || 0 });
};

const handleCycleCountChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { cycleCount: parseInt(value) || 0 });
};
</script>

<style scoped></style>
