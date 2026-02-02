<template>
  <GlassCard class="rounded-lg p-4 mb-6 shadow-lg">
    <BaseTabs
      :tabs="tabs"
      :active-tab="activeTab"
      type="pills"
      @change="handleTabChange"
    />
    <slot :name="activeTab"></slot>
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

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tabs = [
  { key: "active", label: "进行中" },
  { key: "completed", label: "已完成" },
  { key: "archived", label: "已归档" },
];

const handleTabChange = (tab: string) => {
  emit("change", tab);
};
</script>
