<template>
  <BaseModal
    :visible="visible"
    title="导入计划"
    position="center"
    @close="handleClose"
    body-class="p-6"
    style="width: 90vw"
  >
    <view class="mb-4">
      <text class="block text-sm font-medium text-gray-700 mb-2">分享码</text>
      <input 
        v-model="shareCode" 
        type="text" 
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all" 
        placeholder="输入分享码，如：PLAN-XXXX"
        :focus="visible"
      />
    </view>
    
    <template #footer>
      <view class="flex space-x-3 p-4 pt-0">
        <view class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium text-center active:opacity-70 transition-opacity" @click="handleClose">
          取消
        </view>
        <view class="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium text-center active:opacity-90 shadow-lg shadow-emerald-100 transition-all" @click="handleImport">
          导入
        </view>
      </view>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { showError } from '@/utils/toast';
import BaseModal from '../common/BaseModal.vue';

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

