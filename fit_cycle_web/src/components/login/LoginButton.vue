<template>
  <view class="w-full max-w-sm space-y-4">
    <button
      @click="$emit('login')"
      class="wechat-btn w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg transition-transform hover:scale-105"
    >
      <view class="flex items-center justify-center">
        <svg
          class="w-6 h-6 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          ></path>
        </svg>
        微信一键登录
      </view>
    </button>
  </view>
</template>

<script setup lang="ts">
// LoginButton组件 - 微信登录按钮
defineEmits<{
  login: [];
}>();
</script>

