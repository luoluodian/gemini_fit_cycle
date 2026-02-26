<template>
  <view class="glass-card rounded-lg p-6 mb-8 shadow-lg max-w-72 w-full">
    <view class="text-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">欢迎使用</h2>
      <p class="text-gray-600 text-sm leading-relaxed mb-4">
        为保存您的饮食计划和记录，需要绑定微信账号。我们仅会获取您的昵称和头像，不会向好友或朋友圈主动发送消息。
      </p>
      <view class="bg-emerald-50 rounded-lg p-3">
        <view class="flex items-center text-sm text-emerald-700">
          <Check font-size="16" class="mr-2" />
          <span>我们承诺保护你的隐私安全</span>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Check } from '@nutui/icons-vue-taro'
// WelcomeCard组件 - 显示欢迎信息和隐私承诺
</script>
