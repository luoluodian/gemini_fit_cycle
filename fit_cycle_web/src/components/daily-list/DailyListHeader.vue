<template>
  <PageHeader
    :title="planName"
    :subtitle="planInfo"
    :show-back="true"
    @back="$emit('back')"
  >
    <template #actions>
      <view class="text-right">
        <view class="text-sm text-gray-600">完成进度</view>
        <view class="text-lg font-bold text-emerald-600">{{ progressText }}</view>
      </view>
    </template>
  </PageHeader>
</template>

<script setup lang="ts">
import PageHeader from "../common/PageHeader.vue";

defineProps<{
  planName: string;
  planInfo: string;
  progressText: string;
}>();

defineEmits<{
  back: [];
}>();
</script>

