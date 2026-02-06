<template>
  <view
    :class="[
      'plan-card bg-white rounded-xl p-4 shadow-sm border-[1rpx] border-solid transition-all duration-300 active:scale-[0.98]',
      plan.isActive 
        ? 'border-emerald-500 ring-1 ring-emerald-100' 
        : 'border-gray-100'
    ]"
    @tap="handleAction('view', plan.id)"
  >
    <view class="flex items-start justify-between mb-3">
      <view class="flex-1">
        <view class="flex items-center justify-between mb-2">
          <h3 class="font-black text-gray-800 text-lg truncate flex-1">
            {{ plan.name }}
          </h3>
          <view class="flex ml-2">
            <span
              v-for="tag in plan.tags"
              :key="tag"
              :class="['ml-1.5 px-2 py-0.5 text-[18rpx] font-black rounded-full', getTagClass(tag)]"
            >
              {{ tag }}
            </span>
          </view>
        </view>
        <p class="text-[22rpx] text-gray-400 mb-3 flex items-center font-bold">
          {{ plan.description }}
          <span class="mx-2 opacity-30">|</span>
          {{ plan.targets }}
        </p>
        
        <!-- Linear Progress Bar -->
        <view v-if="plan.progress !== undefined" class="flex items-center">
          <view class="flex-1 bg-gray-50 rounded-full h-1.5 mr-3 overflow-hidden">
            <view 
              class="h-full rounded-full transition-all duration-1000" 
              :style="{ width: plan.progress + '%', backgroundColor: plan.progressColor || '#10b981' }"
            ></view>
          </view>
          <span class="text-[20rpx] font-black text-gray-400">{{ plan.progress }}%</span>
        </view>
        <view v-else class="text-[20rpx] font-black text-gray-300">{{ plan.progressText }}</view>
      </view>
    </view>
    
    <!-- Actions -->
    <view class="flex space-x-2 mt-3 pt-3 border-t border-solid border-gray-50">
      <view
        v-for="action in plan.actions"
        :key="action.label"
        @tap.stop="handleAction(action.type, plan.id)"
        :class="[
          'py-2 px-4 rounded-xl text-xs font-black transition-all active:scale-95 text-center',
          action.class || 'bg-gray-100 text-gray-700 active:bg-gray-200',
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
