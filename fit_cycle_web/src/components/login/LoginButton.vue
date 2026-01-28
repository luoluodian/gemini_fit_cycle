<template>
  <view class="w-full max-w-sm space-y-4">
    <!-- 微信登录 -->
    <BaseButton type="wechat" size="lg" @click="$emit('login')">
      <template #icon>
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
      </template>
      微信一键登录
    </BaseButton>

    <!-- 游客模式 -->
    <BaseButton type="secondary" size="md" @click="$emit('guest')">
      先体验一下
    </BaseButton>
  </view>
</template>

<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

/**
 * LoginButton组件 - 提供微信登录和游客模式入口
 */
defineEmits<{
  login: [];
  guest: [];
}>();
</script>

