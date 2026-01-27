<template>
  <view class="glass-card rounded-xl p-3 text-center">
    <text :class="['text-lg font-bold', colorClass]">{{ count }}</text>
    <text class="text-xs text-gray-600 block mt-1">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  count: number;
  label: string;
  type: "completed" | "configured" | "remaining";
}

const props = defineProps<Props>();

const colorClass = computed(() => {
  switch (props.type) {
    case "completed":
      return "text-emerald-600";
    case "configured":
      return "text-blue-600";
    case "remaining":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
});
</script>


