<template>
  <view class="fixed bottom-20 right-4">
    <view class="space-y-2">
      <view
        class="floating-btn w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
        @click="handleCopyMeal"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          ></path>
        </svg>
      </view>
      <view
        class="floating-btn w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
        @click="handleMarkComplete"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  "copy-meal": [];
  "mark-complete": [];
}>();

const handleCopyMeal = () => {
  emit("copy-meal");
};

const handleMarkComplete = () => {
  emit("mark-complete");
};
</script>

