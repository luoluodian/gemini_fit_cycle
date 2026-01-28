<template>
  <view class="w-full max-w-[280px] flex flex-col space-y-4">
    <!-- 微信登录 -->
    <BaseButton type="wechat" size="lg" @click="$emit('login')">
      微信一键登录
    </BaseButton>

    <!-- 游客模式 - 优化后的次级按钮 -->
    <BaseButton type="secondary" size="lg" @click="$emit('guest')">
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
