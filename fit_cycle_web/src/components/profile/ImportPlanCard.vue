<template>
  <view class="glass-card rounded-2xl p-4 shadow-lg">
    <view class="flex items-center justify-between mb-4">
      <text class="text-lg font-semibold text-gray-800">导入计划</text>
      <view class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium text-center" @click="handleImport">
        导入
      </view>
    </view>
    <text class="text-sm text-gray-600 block">通过分享码导入朋友的饮食计划</text>
  </view>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  import: [];
}>();

const handleImport = () => {
  emit('import');
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>

