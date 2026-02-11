<template>
  <view class="flex flex-col items-center justify-center py-12">
    <view
      class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4"
    >
      <svg
        class="w-10 h-10 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        ></path>
      </svg>
    </view>
    <text class="text-gray-400 text-sm font-medium">{{ text }}</text>
    <view v-if="actionText" class="mt-4">
      <view
        class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium active:bg-emerald-100 transition-colors"
        :data-test-id="dataTestId"
        @click="handleAction"
      >
        {{ actionText }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  text?: string;
  actionText?: string;
  dataTestId?: string;
}

interface Emits {
  (e: "action"): void;
}

withDefaults(defineProps<Props>(), {
  text: "暂无计划",
  actionText: "",
  dataTestId: "",
});

const emit = defineEmits<Emits>();

const handleAction = () => {
  emit("action");
};
</script>
