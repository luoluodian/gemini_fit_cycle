<template>
  <view class="flex flex-col items-center justify-center py-12">
    <view
      class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4"
    >
      <Order font-size="40" color="#d1d5db" />
    </view>
    <text class="text-gray-400 text-sm font-medium">{{ text }}</text>
    <view v-if="actionText" class="mt-4">
      <view
        class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium active:bg-emerald-100 transition-colors"
        :data-test-id="dataTestId"
        @click="handleAction"
      >
        {{ actionText }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Order } from "@nutui/icons-vue-taro";
interface Props {
  text?: string;
  actionText?: string;
  dataTestId?: string;
}

interface Emits {
  (e: "action"): void;
}

withDefaults(defineProps<Props>(), {
  text: "暂无计划",
  actionText: "",
  dataTestId: "",
});

const emit = defineEmits<Emits>();

const handleAction = () => {
  emit("action");
};
</script>
