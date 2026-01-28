<template>
  <GlassCard card-class="p-4 shadow-lg">
    <text class="text-lg font-semibold text-gray-800 mb-4 block">设置</text>
    <view class="space-y-1">
      <MenuItem 
        title="应用设置" 
        description="通知、隐私等设置"
        @click="$emit('settings')"
      >
        <template #icon>
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </template>
      </MenuItem>
      
      <MenuItem 
        title="帮助与反馈" 
        description="使用帮助和意见反馈"
        icon-bg-class="bg-yellow-50"
        @click="$emit('help')"
      >
        <template #icon>
          <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </template>
      </MenuItem>
      
      <MenuItem 
        title="关于应用" 
        description="版本信息和更新日志"
        icon-bg-class="bg-indigo-50"
        @click="$emit('about')"
      >
        <template #icon>
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </template>
      </MenuItem>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '../common/GlassCard.vue';
import MenuItem from '../common/MenuItem.vue';

defineEmits<{
  settings: [];
  help: [];
  about: [];
}>();
</script>

