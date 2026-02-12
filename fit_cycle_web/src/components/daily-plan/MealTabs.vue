<template>
  <BaseTabs
    :tabs="meals"
    :active-tab="currentMeal"
    type="pills"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import BaseTabs from "../common/BaseTabs.vue";

defineProps<{
  currentMeal: "breakfast" | "lunch" | "dinner" | "snacks";
}>();

const emit = defineEmits<{
  change: [meal: "breakfast" | "lunch" | "dinner" | "snacks"];
}>();

const meals = [
  { key: "breakfast", label: "早餐" },
  { key: "lunch", label: "午餐" },
  { key: "dinner", label: "晚餐" },
  { key: "snacks", label: "加餐" },
];

const handleChange = (tab: string) => {
  emit("change", tab as "breakfast" | "lunch" | "dinner" | "snacks");
};
</script>

