<template>
  <view
    :class="[
      'plan-card bg-white rounded-xl p-4 shadow-sm',
      plan.isActive ? 'active' : '',
    ]"
  >
    <view class="flex items-start justify-between mb-3">
      <view class="flex-1">
        <view class="flex items-center mb-2">
          <h3 class="font-semibold text-gray-800 text-lg">
            {{ plan.name }}
          </h3>
          <span
            v-for="tag in plan.tags"
            :key="tag"
            :class="['ml-2 px-2 py-1 text-xs rounded-full', getTagClass(tag)]"
          >
            {{ tag }}
          </span>
        </view>
        <p class="text-sm text-gray-600 mb-2">
          {{ plan.description }}
        </p>
        <p class="text-sm text-gray-500">
          {{ plan.targets }}
        </p>
      </view>
      <view v-if="plan.progress !== undefined" class="relative w-16 h-16">
        <svg class="progress-ring w-16 h-16" viewBox="0 0 120 120">
          <circle
            class="progress-ring-circle"
            stroke="#e5e7eb"
            stroke-width="8"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
          />
          <circle
            class="progress-ring-circle"
            :stroke="plan.progressColor || '#10b981'"
            stroke-width="8"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
            :stroke-dasharray="327"
            :stroke-dashoffset="327 - (327 * plan.progress) / 100"
          />
        </svg>
        <view class="absolute inset-0 flex items-center justify-center ml-5">
          <span class="text-sm font-semibold text-gray-800"
            >{{ plan.progress }}%</span
          >
        </view>
      </view>
      <view v-else class="text-center">
        <view :class="['text-2xl font-bold', plan.statusIconClass]">
          {{ plan.statusIcon }}
        </view>
        <view class="text-xs text-gray-500">{{ plan.progressText }}</view>
      </view>
    </view>
    <view class="flex space-x-2">
      <view
        v-for="action in plan.actions"
        :key="action.label"
        @click="handleAction(action.type, plan.id)"
        :class="[
          'py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center',
          action.class || 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ]"
      >
        {{ action.label }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface PlanAction {
  label: string;
  type: string;
  class?: string;
}

interface Plan {
  id: string;
  name: string;
  tags: string[];
  description: string;
  targets: string;
  progress?: number;
  progressColor?: string;
  statusIcon?: string;
  statusIconClass?: string;
  progressText?: string;
  isActive?: boolean;
  actions: PlanAction[];
}

interface Emits {
  (e: "action", type: string, planId: string): void;
}

const props = defineProps<{
  plan: Plan;
}>();

const emit = defineEmits<Emits>();

const getTagClass = (tag: string) => {
  const tagMap: Record<string, string> = {
    进行中: "bg-emerald-100 text-emerald-700",
    当前使用: "bg-blue-100 text-blue-700",
    暂停中: "bg-yellow-100 text-yellow-700",
    已完成: "bg-green-100 text-green-700",
    已归档: "bg-gray-100 text-gray-700",
  };
  return tagMap[tag] || "bg-gray-100 text-gray-700";
};

const handleAction = (type: string, planId: string) => {
  emit("action", type, planId);
};
</script>
