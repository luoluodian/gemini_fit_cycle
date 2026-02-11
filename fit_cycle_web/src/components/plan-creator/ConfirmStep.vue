<template>
  <view class="glass-card rounded-lg p-4 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">确认创建</h3>

    <view class="space-y-4">
      <view class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-800 mb-3">计划概览</h4>
        <view class="space-y-2 text-sm text-gray-600">
          <view class="flex justify-between">
            <span>计划名称：</span>
            <span class="font-medium">{{ summary.name || "-" }}</span>
          </view>
          <view class="flex justify-between">
            <span>计划类型：</span>
            <span class="font-medium">{{ summary.type || "-" }}</span>
          </view>
          <view class="flex justify-between">
            <span>执行天数：</span>
            <span class="font-medium">{{ summary.days || "-" }}</span>
          </view>
          <view class="flex justify-between">
            <span>周期设置：</span>
            <span class="font-medium">{{ summary.cycle || "-" }}</span>
          </view>
          <view class="flex justify-between">
            <span>默认热量：</span>
            <span class="font-medium">{{ summary.calories || "-" }}</span>
          </view>
        </view>
      </view>

      <view class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-medium text-blue-800 mb-2">下一步</h4>
        <p class="text-sm text-blue-700">
          创建完成后，你需要为每一天配置具体的饮食计划。系统将为你生成每日列表，你可以：
        </p>
        <ul class="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>为每一天设置不同的营养目标</li>
          <li>为每一餐添加具体的食物</li>
          <li>复制已有的日期配置到其他日期</li>
          <li>拖拽调整日期顺序</li>
        </ul>
      </view>

      <view class="flex items-center">
        <view
          class="custom-checkbox flex items-center cursor-pointer"
          @click="handleConfirmChange(!confirmed)"
        >
          <view
            :class="[
              'w-4 h-4 border-2 rounded mr-2 flex items-center justify-center border border-solid border-gray-100',
              confirmed
                ? 'bg-emerald-600 border-emerald-600'
                : 'bg-white border-gray-300 hover:border-emerald-500',
            ]"
          >
            <text v-if="confirmed" class="text-white text-xs">✓</text>
          </view>
          <text class="text-sm text-gray-700"
            >我已确认以上信息，准备创建计划</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Summary {
  name: string;
  type: string;
  days: string;
  cycle: string;
  calories: string;
}

interface Props {
  summary: Summary;
  confirmed: boolean;
}

interface Emits {
  (e: "update:confirmed", value: boolean): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleConfirmChange = (value: boolean) => {
  emit("update:confirmed", value);
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
