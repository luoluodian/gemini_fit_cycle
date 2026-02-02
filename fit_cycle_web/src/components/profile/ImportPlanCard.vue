<template>
  <GlassCard card-class="p-4 shadow-lg">
    <view class="flex items-center justify-between mb-4">
      <text class="text-lg font-semibold text-gray-800">导入计划</text>
      <BaseButton
        type="primary"
        size="sm"
        :block="false"
        class="flex-none !w-20 !px-0 !rounded-lg !py-2.5"
        style="margin: 0"
        @click="$emit('import')"
      >
        导入
      </BaseButton>
    </view>
    <text class="text-sm text-gray-600 block"
      >通过分享码导入朋友的饮食计划</text
    >
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from "../common/GlassCard.vue";
import BaseButton from "../common/BaseButton.vue";

defineEmits<{
  import: [];
}>();
</script>
