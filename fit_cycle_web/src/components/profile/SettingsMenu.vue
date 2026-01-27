<template>
  <view class="glass-card rounded-2xl p-4 shadow-lg">
    <text class="text-lg font-semibold text-gray-800 mb-4 block">设置</text>
    <view class="space-y-2">
      <view class="menu-item flex items-center p-3 rounded-lg" @click="handleSettings">
        <view class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </view>
        <view class="flex-1">
          <text class="font-medium text-gray-800 block">应用设置</text>
          <text class="text-sm text-gray-600 block">通知、隐私等设置</text>
        </view>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </view>
      
      <view class="menu-item flex items-center p-3 rounded-lg" @click="handleHelp">
        <view class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </view>
        <view class="flex-1">
          <text class="font-medium text-gray-800 block">帮助与反馈</text>
          <text class="text-sm text-gray-600 block">使用帮助和意见反馈</text>
        </view>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </view>
      
      <view class="menu-item flex items-center p-3 rounded-lg" @click="handleAbout">
        <view class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </view>
        <view class="flex-1">
          <text class="font-medium text-gray-800 block">关于应用</text>
          <text class="text-sm text-gray-600 block">版本信息和更新日志</text>
        </view>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  settings: [];
  help: [];
  about: [];
}>();

const handleSettings = () => {
  emit('settings');
};

const handleHelp = () => {
  emit('help');
};

const handleAbout = () => {
  emit('about');
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.menu-item {
  transition: all 0.3s ease;
}
.menu-item:active {
  transform: translateX(4px);
  background: rgba(16, 185, 129, 0.05);
}
</style>

