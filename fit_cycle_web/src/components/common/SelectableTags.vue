<template>
  <view class="flex items-center gap-2 py-1 overflow-hidden">
    <text
      v-if="label"
      class="text-sm font-medium text-gray-700 whitespace-nowrap"
      >{{ label }}</text
    >
    <view class="flex-1" style="min-width: 0">
      <BaseScrollView
        :scroll-x="true"
        :scroll-y="false"
        :height="height"
        content-class="items-center gap-2 pr-4"
      >
        <view
          v-for="item in options"
          :key="item[itemKey]"
          class="px-3 py-1 text-[22rpx] rounded-lg border border-solid transition-all whitespace-nowrap inline-flex items-center flex-shrink-0 active:opacity-70"
          :style="
            String(modelValue) === String(item[itemKey])
              ? 'background-color: #10b981; color: #fff; border-color: #10b981;'
              : 'background-color: #fff; color: #6b7280; border-color: #e5e7eb;'
          "
          @click="handleSelect(item)"
        >
          <text v-if="itemEmoji && item[itemEmoji]" class="mr-1">{{
            item[itemEmoji]
          }}</text>
          <text>{{ item[itemLabel] }}</text>
        </view>
      </BaseScrollView>
    </view>
  </view>
</template>

<script setup lang="ts">
import BaseScrollView from "./BaseScrollView.vue";

interface Props {
  label?: string;
  options: any[];
  modelValue: any;
  itemKey?: string;
  itemLabel?: string;
  itemEmoji?: string;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  itemKey: "value",
  itemLabel: "label",
  itemEmoji: "",
  height: "70rpx",
});

console.log("SelectableTags props:", props);
const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [item: any];
}>();

const handleSelect = (item: any) => {
  const val = item[props.itemKey];
  emit("update:modelValue", val);
  emit("change", item);
};
</script>
