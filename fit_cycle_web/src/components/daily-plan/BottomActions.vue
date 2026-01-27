<template>
  <view class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
    <view class="flex space-x-3">
      <view
        class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
        @click="handleSaveAndExit"
      >
        保存退出
      </view>
      <view
        class="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center"
        @click="handleSaveAndNext"
      >
        保存并下一天
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  "save-exit": [];
  "save-next": [];
}>();

const handleSaveAndExit = () => {
  emit("save-exit");
};

const handleSaveAndNext = () => {
  emit("save-next");
};
</script>

