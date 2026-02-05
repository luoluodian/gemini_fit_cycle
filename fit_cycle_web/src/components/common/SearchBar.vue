<template>
  <view :class="['relative', containerClass]">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="search-input px-4 py-2 pl-10 border-[1rpx] border-solid border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-sm bg-white/90"
      @input="handleInput"
    />
    <view class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
      <Search font-size="16" color="#9ca3af"></Search>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Search } from "@nutui/icons-vue-taro";

interface Props {
  modelValue: string;
  placeholder?: string;
  containerClass?: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: "搜索...",
  containerClass: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "input": [value: string];
}>();

const handleInput = (e: any) => {
  const value = e.detail?.value || e.target?.value || "";
  emit("update:modelValue", value);
  emit("input", value);
};
</script>

<style scoped lang="scss">
.search-input {
  width: 100%;
  box-sizing: border-box;
}
</style>