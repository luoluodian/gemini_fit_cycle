<template>
  <BaseModal
    :visible="visible"
    title="管理后台 - 激活码生成"
    position="center"
    @close="handleClose"
    body-class="p-4 bg-gray-50"
    style="width: 90vw"
  >
    <view class="space-y-4">
      <GlassCard
        card-class="p-6 border-[1rpx] border-solid border-gray-200"
        :border="false"
      >
        <view class="space-y-4">
          <!-- 生成数量 -->
          <view>
            <label class="block text-sm font-medium text-gray-700 mb-2">生成数量 (1-100)</label>
            <input 
              v-model.number="form.count" 
              type="number" 
              class="w-full px-4 border-[1rpx] border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white h-10 text-sm" 
              placeholder="请输入生成数量"
            />
          </view>

          <!-- 会员时长 -->
          <view>
            <label class="block text-sm font-medium text-gray-700 mb-2">会员时长 (天)</label>
            <input 
              v-model.number="form.durationDays" 
              type="number" 
              class="w-full px-4 border-[1rpx] border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white h-10 text-sm" 
              placeholder="请输入会员天数 (如 30)"
            />
          </view>
        </view>
      </GlassCard>

      <!-- 结果展示区 -->
      <view v-if="generatedCodes.length > 0" class="animate-fade-in">
        <GlassCard
          card-class="p-4 border-[1rpx] border-solid border-emerald-100 bg-emerald-50/30"
          :border="false"
        >
          <view class="flex items-center justify-between mb-3">
            <view class="flex items-center">
              <view class="w-1 h-3 bg-emerald-500 rounded-full mr-2"></view>
              <text class="text-sm font-semibold text-gray-700">生成结果 ({{ generatedCodes.length }})</text>
            </view>
            <text 
              class="text-xs font-bold text-emerald-600 active:opacity-60"
              @click="copyAll"
            >
              一键复制全部
            </text>
          </view>
          
          <view class="max-h-40 overflow-y-auto space-y-2 pr-1">
            <view 
              v-for="(item, index) in generatedCodes" 
              :key="index"
              class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-solid border-gray-100"
            >
              <text class="font-mono text-sm text-gray-800 select-all">{{ item.code }}</text>
              <text class="text-[18rpx] text-gray-400 font-bold">{{ item.durationDays }}天</text>
            </view>
          </view>
        </GlassCard>
      </view>
    </view>

    <template #footer>
      <view class="flex space-x-3 p-4 pt-0 bg-gray-50">
        <view 
          class="flex-1 bg-white border border-solid border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium text-center active:bg-gray-50 transition-colors text-sm" 
          @click="handleClose"
        >
          取消
        </view>
        <view 
          class="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-center shadow-md shadow-emerald-100 active:opacity-90 transition-all flex items-center justify-center text-sm" 
          @click="handleGenerate"
        >
          <text v-if="submitting" class="nut-icon nut-icon-loading rotate-animation mr-2"></text>
          {{ submitting ? '处理中...' : '立即生成' }}
        </view>
      </view>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import Taro from '@tarojs/taro';
import { httpRequest } from '@/services/http';
import { showSuccess, showError, showLoading, hideToast } from '@/utils/toast';
import BaseModal from '../common/BaseModal.vue';
import GlassCard from '../common/GlassCard.vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close']);

const form = reactive({
  count: 10,
  durationDays: 30,
  memberLevel: 1,
  // 默认有效期设为 10 年后，简化管理员操作
  expiredAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
});

const submitting = ref(false);
const generatedCodes = ref<any[]>([]);

const handleClose = () => {
  emit('close');
};

const handleGenerate = async () => {
  if (!form.count || form.count <= 0) return showError('请输入有效数量');
  if (!form.durationDays || form.durationDays <= 0) return showError('请输入有效时长');

  showLoading('正在生成...');
  submitting.value = true;
  try {
    const res: any = await httpRequest.post('/admin/activation-codes/batch-generate', form);
    generatedCodes.value = res || [];
    showSuccess(`成功生成 ${generatedCodes.value.length} 个激活码`);
  } catch (error: any) {
    console.error('[AdminActivation] Failed:', error);
    showError(error.message || '生成失败');
  } finally {
    submitting.value = false;
    hideToast();
  }
};

const copyAll = () => {
  const text = generatedCodes.value.map(c => c.code).join('\n');
  Taro.setClipboardData({
    data: text,
    success: () => {
      showSuccess('已复制到剪贴板');
    }
  });
};

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    generatedCodes.value = [];
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

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
