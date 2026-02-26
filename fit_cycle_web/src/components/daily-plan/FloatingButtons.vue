<template>
  <view class="fixed bottom-20 right-4">
    <view class="space-y-2">
      <view
        class="floating-btn w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 bg-emerald-500"
        @click="handleCopyMeal"
      >
        <Horizontal font-size="20" color="#ffffff" />
      </view>
      <view
        class="floating-btn w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 bg-blue-500"
        @click="handleMarkComplete"
      >
        <Check font-size="20" color="#ffffff" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Horizontal, Check } from '@nutui/icons-vue-taro'

const emit = defineEmits<{
  "copy-meal": [];
  "mark-complete": [];
}>();

const handleCopyMeal = () => {
  emit("copy-meal");
};

const handleMarkComplete = () => {
  emit("mark-complete");
};
</script>
