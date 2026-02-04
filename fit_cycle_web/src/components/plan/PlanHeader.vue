<template>
  <PageHeader
    title="饮食计划"
    subtitle="管理你的健康目标"
    :show-back="false"
    :actions="[
      {
        key: 'create',
        label: '新建',
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


