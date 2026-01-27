<template>
  <PageHeader
    title="饮食计划"
    subtitle="管理你的健康饮食计划"
    :show-back="false"
    :actions="[
      {
        key: 'import',
        icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        type: 'secondary',
      },
      {
        key: 'create',
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
        type: 'primary',
      },
    ]"
    @action="handleAction"
  />
</template>

<script setup lang="ts">
import PageHeader from "../common/PageHeader.vue";

interface Emits {
  (e: "import"): void;
  (e: "create"): void;
}

const emit = defineEmits<Emits>();

const handleAction = (action: any) => {
  if (action.key === "import") {
    emit("import");
  } else if (action.key === "create") {
    emit("create");
  }
};
</script>


