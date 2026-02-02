<template>
  <view v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="handleBackdropClick">
    <view class="flex items-center justify-center min-h-screen p-4" @click.stop>
      <view class="bg-white rounded-lg w-full max-w-sm p-6">
        <view class="text-center mb-4">
          <text class="text-lg font-semibold text-gray-800 mb-2 block">关于应用</text>
          <text class="text-4xl mb-2 block">🍎</text>
          <text class="font-medium text-gray-800 block">健康饮食记录</text>
          <text class="text-sm text-gray-600 block">版本 1.0.0</text>
        </view>
        
        <view class="space-y-3 text-sm text-gray-600">
          <view class="flex justify-between">
            <text>开发者</text>
            <text>健康饮食团队</text>
          </view>
          <view class="flex justify-between">
            <text>发布日期</text>
            <text>2024年12月</text>
          </view>
          <view class="flex justify-between">
            <text>适用平台</text>
            <text>移动端 Web</text>
          </view>
        </view>
        
        <view class="mt-4 p-3 bg-gray-50 rounded-lg">
          <text class="font-medium text-gray-800 mb-2 block">功能特色</text>
          <view class="text-xs text-gray-600 space-y-1">
            <text class="block">• 智能饮食记录</text>
            <text class="block">• 个性化饮食计划</text>
            <text class="block">• 营养成分分析</text>
            <text class="block">• 健康数据追踪</text>
          </view>
        </view>
        
        <view class="w-full mt-4 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium text-center" @click="handleClose">
          关闭
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const handleClose = () => {
  emit('close');
};

const handleBackdropClick = (e: any) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
};
</script>

