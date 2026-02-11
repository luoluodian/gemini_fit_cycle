<template>
  <GlassCard 
    card-class="rounded-2xl p-4 shadow-lg border-[1rpx] border-solid border-white/30 flex flex-col"
  >
    <BaseTabs
      :tabs="tabs"
      :active-tab="activeTab"
      type="pills"
      @change="handleTabChange"
      class="flex-shrink-0"
    />
    <view class="plan-list-container mt-2">
      <slot :name="activeTab"></slot>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import BaseTabs from "../common/BaseTabs.vue";
import GlassCard from "../common/GlassCard.vue";

interface Props {
  activeTab: "active" | "completed" | "archived";
}

interface Emits {
  (e: "change", tab: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const tabs = [
  { key: "active", label: "进行中" },
  { key: "completed", label: "已完成" },
];

const handleTabChange = (tab: string) => {
  emit("change", tab);
};
</script>
