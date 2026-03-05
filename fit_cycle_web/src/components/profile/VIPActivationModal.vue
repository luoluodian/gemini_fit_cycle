<template>
  <BaseModal
    :visible="visible"
    title="VIP 激活码兑换"
    position="center"
    @close="handleClose"
    body-class="p-6"
    style="width: 90vw"
  >
    <view class="text-sm text-gray-500 mb-6">请输入激活码，立即升级 VIP 权益</view>

    <!-- Input Area -->
    <view class="mb-6">
      <text class="block text-sm font-medium text-gray-700 mb-2">激活码</text>
      <input 
        v-model="code" 
        type="text" 
        class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all uppercase" 
        placeholder="输入 12 位激活码 (FIT-XXXX-XXXX)"
        :focus="visible"
      />
    </view>

    <!-- Benefits Info -->
    <view class="mb-8 bg-amber-50 p-4 rounded-xl border border-amber-100">
      <view class="text-amber-800 font-bold text-sm mb-3 flex items-center">
        <text class="nut-icon nut-icon-crown text-amber-500 mr-2 text-sm"></text>
        VIP 专属权益：
      </view>
      <view class="space-y-2">
        <view class="flex items-start text-xs text-amber-700 leading-relaxed">
          <text class="nut-icon nut-icon-check text-amber-500 mr-2 mt-0.5 text-xs"></text>
          <text>计划存储上限提升至 100 个 (原 5 个)</text>
        </view>
        <view class="flex items-start text-xs text-amber-700 leading-relaxed">
          <text class="nut-icon nut-icon-check text-amber-500 mr-2 mt-0.5 text-xs"></text>
          <text>解锁进阶碳循环算法与计划导入功能</text>
        </view>
        <view class="flex items-start text-xs text-amber-700 leading-relaxed">
          <text class="nut-icon nut-icon-check text-amber-500 mr-2 mt-0.5 text-xs"></text>
          <text>优先体验营养趋势深度分析等进阶工具</text>
        </view>
      </view>
    </view>

    <!-- Action Buttons -->
    <template #footer>
      <view class="flex space-x-3 p-4 pt-0">
        <view 
          class="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold text-center active:opacity-70 transition-opacity" 
          @click="handleClose"
        >
          取消
        </view>
        <view 
          class="flex-1 bg-amber-500 text-white py-3 rounded-xl font-semibold text-center shadow-lg shadow-amber-200 active:opacity-90 transition-opacity flex items-center justify-center" 
          @click="handleSubmit"
        >
          <text v-if="loading" class="nut-icon nut-icon-loading rotate-animation mr-2"></text>
          立即兑换
        </view>
      </view>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { showSuccess, showError } from '@/utils/toast';
import { httpRequest } from '@/services/http';
import BaseModal from '../common/BaseModal.vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close', 'activated']);

const code = ref('');
const loading = ref(false);

const handleClose = () => {
  code.value = '';
  emit('close');
};

const handleSubmit = async () => {
  if (!code.value.trim()) {
    return showError('请输入激活码');
  }

  loading.value = true;
  try {
    const res: any = await httpRequest.post('/user/activate', { 
      code: code.value.trim().toUpperCase() 
    });
    
    showSuccess(res.message || '激活成功！');
    emit('activated', res);
    handleClose();
  } catch (error: any) {
    console.error('[VIPActivation] Failed:', error);
    showError(error.message || '激活码无效或已过期');
  } finally {
    loading.value = false;
  }
};

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    code.value = '';
  }
});
</script>

<style lang="scss">
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.rotate-animation {
  animation: rotate 1s linear infinite;
}
</style>

