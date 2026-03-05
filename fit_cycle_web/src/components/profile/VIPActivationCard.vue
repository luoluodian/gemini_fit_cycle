<template>
  <GlassCard @tap="handleActivate">
    <view class="flex items-center justify-between mb-4">
      <view class="flex items-center space-x-3">
        <view class="icon-container bg-amber-100 p-2 rounded-xl">
          <text class="nut-icon nut-icon-crown text-amber-500 text-xl"></text>
        </view>
        <text class="text-lg font-semibold text-gray-800">VIP 激活码兑换</text>
      </view>
      <BaseButton
        type="primary"
        size="sm"
        :block="false"
        class="flex-none !w-20 !px-0 !rounded-lg !py-2.5 !bg-amber-500 !border-amber-500"
        style="margin: 0"
        @click.stop="handleActivate"
      >
        兑换
      </BaseButton>
    </view>
    <text class="text-sm text-gray-600 block">解锁无限计划数量，开启进阶功能</text>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from "../common/GlassCard.vue";
import BaseButton from "../common/BaseButton.vue";

const emit = defineEmits(['activate']);

const handleActivate = () => {
  emit('activate');
};
</script>

<style lang="scss">
</style>
