<template>
  <view v-if="message" class="mt-6 p-4 bg-red-50 rounded-lg max-w-xs w-full">
    <view class="flex items-center">
      <svg
        class="w-5 h-5 text-red-500 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        ></path>
      </svg>
      <span class="text-red-700 text-sm">{{ message }}</span>
    </view>
  </view>
</template>

<script setup lang="ts">
// ErrorMessage组件 - 错误提示信息
defineProps<{
  message?: string;
}>();
</script>
