<template>
  <PageHeader
    title="食材库"
    subtitle="发现和管理你的健康食材"
    :show-back="false"
    :actions="[
      {
        key: 'search',
        icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        type: 'secondary',
      },
    ]"
    @action="handleAction"
  />
</template>

<script setup lang="ts">
import PageHeader from "../common/PageHeader.vue";

const emit = defineEmits<{
  toggleSearch: [];
}>();

const handleAction = (action: any) => {
  if (action.key === "search") {
    emit("toggleSearch");
  }
};
</script>

