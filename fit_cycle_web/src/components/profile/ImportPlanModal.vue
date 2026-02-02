<template>
  <view v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="handleBackdropClick">
    <view class="flex items-center justify-center min-h-screen p-4" @click.stop>
      <view class="bg-white rounded-lg w-full max-w-sm p-6">
        <view class="flex items-center justify-between mb-4">
          <text class="text-lg font-semibold text-gray-800">导入计划</text>
          <view @click="handleClose" class="text-gray-400">
            <image 
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTZBRUIzIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTYgMThMMTggNk02IDZsMTIgMTIiLz48L3N2Zz4="
              class="w-6 h-6"
            />
          </view>
        </view>
        
        <view class="mb-4">
          <text class="block text-sm font-medium text-gray-700 mb-2">分享码</text>
          <input 
            v-model="shareCode" 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg" 
            placeholder="输入分享码，如：PLAN-XXXX"
          />
        </view>
        
        <view class="flex space-x-3">
          <view class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-center" @click="handleClose">
            取消
          </view>
          <view class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium text-center" @click="handleImport">
            导入
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { showError } from '@/utils/toast';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  import: [code: string];
}>();

const shareCode = ref('');

const handleClose = () => {
  shareCode.value = '';
  emit('close');
};

const handleBackdropClick = (e: any) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
};

const handleImport = () => {
  const code = shareCode.value.trim();
  
  if (!code) {
    showError('请输入分享码');
    return;
  }
  
  if (!code.startsWith('PLAN-')) {
    showError('分享码格式不正确');
    return;
  }
  
  emit('import', code);
  handleClose();
};

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    shareCode.value = '';
  }
});
</script>

