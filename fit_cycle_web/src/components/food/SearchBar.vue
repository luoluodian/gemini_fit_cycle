<template>
  <view v-if="visible" class="px-4 py-3 bg-white border-b border-gray-200">
    <view class="relative">
      <input
        :value="searchValue"
        type="text"
        placeholder="搜索食材..."
        class="search-input w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        @input="handleInput"
      />
      <svg
        class="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  search: [value: string];
}>();

const searchValue = ref("");

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      searchValue.value = "";
      emit("search", "");
    }
  }
);

const handleInput = (e: any) => {
  const value = e.detail?.value || e.target?.value || "";
  searchValue.value = value;
  emit("search", value);
};
</script>

<style scoped>
.search-input {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
</style>

