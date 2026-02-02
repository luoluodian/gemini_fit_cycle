<template>
  <view
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 z-50"
    @click="handleClose"
  >
    <view
      class="flex items-center justify-center min-h-screen p-4"
      @click.stop
    >
      <view class="bg-white rounded-lg w-full max-w-sm p-6">
        <view class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">导入计划</h3>
          <view @click="handleClose" class="text-gray-400 hover:text-gray-600">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </view>
        </view>

        <view class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >分享码</label
          >
          <input
            v-model="shareCode"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="输入分享码，如：PLAN-XXXX"
          />
        </view>

        <view class="flex space-x-3">
          <view
            @click="handleClose"
            class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
          >
            取消
          </view>
          <view
            @click="handleImport"
            class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center"
          >
            导入
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Emits {
  (e: 'close'): void
  (e: 'import', shareCode: string): void
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<Emits>()

const shareCode = ref('')

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      shareCode.value = ''
    }
  }
)

const handleClose = () => {
  emit('close')
}

const handleImport = () => {
  const code = shareCode.value.trim()
  if (code) {
    emit('import', code)
    handleClose()
  } else {
    alert('请输入有效的分享码！')
  }
}
</script>


