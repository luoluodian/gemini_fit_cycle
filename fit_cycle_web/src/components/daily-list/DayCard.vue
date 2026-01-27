<template>
  <view
    :class="[
      'day-card glass-card rounded-xl p-4 shadow-sm transition-all',
      statusClass,
    ]"
  >
    <view class="flex items-center justify-between">
      <view class="flex-1">
        <view class="flex items-center space-x-2 mb-2">
          <text class="font-semibold text-gray-800">{{ day.name }}</text>
          <text
            class="text-sm text-gray-600 block justify-center flex items-center"
            >( {{ formattedDate }} )</text
          >
          <text
            v-if="isToday"
            class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
          >
            今天
          </text>
          <text
            v-if="day.isCompleted"
            class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
          >
            已完成
          </text>
          <text
            v-else-if="day.isConfigured"
            class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
          >
            已配置
          </text>
        </view>

        <view
          class="flex items-center space-x-4 text-xs text-gray-500 justify-around mr-10"
        >
          <view class="flex flex-col justify-center flex items-center">
            <text>{{ day.targets.calories }}kcal</text>
            <text>热量</text>
          </view>
          <view class="flex flex-col justify-center flex items-center">
            <text>{{ day.targets.protein }}g</text>
            <text>蛋白质</text>
          </view>

          <view class="flex flex-col justify-center flex items-center">
            <text>{{ day.targets.carbs }}g</text>
            <text>碳水</text>
          </view>

          <view class="flex flex-col justify-center flex items-center">
            <text>{{ day.targets.fat }}g</text>
            <text>脂肪</text>
          </view>
        </view>
      </view>
      <view class="flex flex-col items-end space-y-2">
        <button
          :class="[
            'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
            day.isCompleted
              ? 'bg-gray-100 text-gray-600'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
          ]"
          @click="handleEdit"
        >
          {{ day.isCompleted ? "查看" : day.isConfigured ? "编辑" : "配置" }}
        </button>
        <button
          v-if="day.isConfigured"
          class="px-3 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          @click="handleCopy"
        >
          复制
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface DayTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayPlan {
  id: string;
  name: string;
  date: string;
  isCompleted: boolean;
  isConfigured: boolean;
  targets: DayTargets;
}

interface Props {
  day: DayPlan;
}

interface Emits {
  (e: "edit", dayId: string): void;
  (e: "copy", dayId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentDate = new Date();

const isToday = computed(() => {
  const date = new Date(props.day.date);
  return date.toDateString() === currentDate.toDateString();
});

const statusClass = computed(() => {
  if (props.day.isCompleted) return "completed";
  if (props.day.isConfigured) return "configured";
  if (isToday.value) return "active";
  return "";
});

const formattedDate = computed(() => {
  const date = new Date(props.day.date);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
});

const handleEdit = () => {
  emit("edit", props.day.id);
};

const handleCopy = () => {
  emit("copy", props.day.id);
};
</script>

<style scoped>
.day-card {
  cursor: pointer;
}
.day-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
.day-card.completed {
  border-left: 4px solid #10b981;
}
.day-card.configured {
  border-left: 4px solid #3b82f6;
}
.day-card.active {
  border-left: 4px solid #f59e0b;
}
</style>
