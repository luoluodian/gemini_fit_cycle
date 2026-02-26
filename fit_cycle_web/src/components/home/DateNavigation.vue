<template>
  <view class="glass-card rounded-lg p-4 mb-6 shadow-lg">
    <view class="flex items-center justify-between">
      <view
        class="p-2 rounded-lg bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"
        @click="handlePrevDate"
      >
        <Left font-size="18" color="#4b5563" />
      </view>
      <view class="text-center">
        <view class="text-lg font-semibold text-gray-800">{{ dateText }}</view>
        <view class="text-sm text-gray-500">{{ planText }}</view>
      </view>
      <view
        class="p-2 rounded-lg bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"
        @click="handleNextDate"
      >
        <Right font-size="18" color="#4b5563" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Left, Right } from "@nutui/icons-vue-taro";

interface PlanInfo {
  planName: string;
  currentDay: number;
  cycleDays: number;
}

interface Props {
  modelValue?: string;
  plan?: PlanInfo;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 内部日期状态
const internalDate = ref(
  props.modelValue || new Date().toISOString().split("T")[0]
);

// 监听外部传入的日期变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== internalDate.value) {
      internalDate.value = newValue;
    }
  }
);

// 监听内部日期变化，触发双向绑定更新
watch(internalDate, (newValue) => {
  emit("update:modelValue", newValue);
});

const dateText = computed(() => {
  const date = new Date(internalDate.value);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return isToday ? `今天 · ${month}月${day}日` : `${month}月${day}日`;
});

const planText = computed(() => {
  if (!props.plan) return "当前计划：6周减脂计划";
  const { planName, currentDay, cycleDays } = props.plan;
  return `当前计划：${planName} (第${currentDay}/${cycleDays}天)`;
});

const handlePrevDate = () => {
  const currentDate = new Date(internalDate.value);
  currentDate.setDate(currentDate.getDate() - 1);
  internalDate.value = currentDate.toISOString().split("T")[0];
};

const handleNextDate = () => {
  const currentDate = new Date(internalDate.value);
  currentDate.setDate(currentDate.getDate() + 1);
  internalDate.value = currentDate.toISOString().split("T")[0];
};
</script>
<style scoped lang="scss"></style>
