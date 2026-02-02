<template>
  <GlassCard class="rounded-lg p-4 mb-6 shadow-lg">
    <BaseTabs
      :tabs="tabs"
      :active-tab="currentTab"
      type="pills"
      @change="handleTabChange"
    />
  </GlassCard>
</template>

<script setup lang="ts">
import BaseTabs from "../common/BaseTabs.vue";
import GlassCard from "../common/GlassCard.vue";

const props = defineProps<{
  currentTab: string;
}>();

const emit = defineEmits<{
  tabChange: [tab: string];
}>();

const tabs = [
  { key: "all", label: "全部" },
  { key: "system", label: "系统食材" },
  { key: "custom", label: "我的食材" },
];

const handleTabChange = (tab: string) => {
  emit("tabChange", tab);
};
</script>


