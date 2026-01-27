<template>
  <PageHeader :title="dayName" :subtitle="dayDate" :show-back="true" />
</template>

<script setup lang="ts">
import PageHeader from "../common/PageHeader.vue";

defineProps<{
  dayName: string;
  dayDate: string;
  currentCalories: string;
}>();
</script>
