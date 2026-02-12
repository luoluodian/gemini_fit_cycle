<template>
  <BaseTabs
    :tabs="filters"
    :active-tab="currentFilter"
    type="pills"
    container-class="w-full flex justify-center"
    @change="handleFilterChange"
  />
</template>

<script setup lang="ts">
import BaseTabs from "../common/BaseTabs.vue";

interface Props {
  currentFilter: string;
}

interface Emits {
  (e: "change", filter: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const filters = [
  { key: "all", label: "全部" },
  { key: "active", label: "进行中" },
  { key: "configured", label: "已配置" },
  { key: "completed", label: "已完成" },
];

const handleFilterChange = (filter: string) => {
  emit("change", filter);
};
</script>
