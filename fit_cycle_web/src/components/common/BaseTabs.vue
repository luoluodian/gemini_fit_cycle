<template>
  <view :class="['mb-4', containerClass]">
    <view class="flex space-x-2 overflow-x-auto">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer text-center hover:opacity-80 border-[1rpx] border-solid',
          type === 'pills' ? 'px-4 py-2 rounded-lg' : 'px-4 py-2 rounded-xxl',
          getTabClass(tab.key),
        ]"
        @tap="handleTabClick(tab.key)"
      >
        {{ tab.label || tab.name }}
      </view>
    </view>
    <slot :name="activeTab"></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface TabItem {
  key: string;
  label?: string;
  name?: string;
}

interface Props {
  tabs: TabItem[];
  activeTab: string;
  type?: "pills" | "line" | "card";
  containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "pills",
  containerClass: "",
});

const emit = defineEmits<{
  change: [tab: string];
}>();

const getTabClass = (key: string) => {
  const isActive = props.activeTab === key;
  if (props.type === "pills") {
    return isActive 
      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
      : "bg-gray-50 text-gray-500 border-gray-100";
  } else if (props.type === "line") {
    return isActive
      ? "text-emerald-600 border-b-2 border-emerald-600"
      : "text-gray-600 border-transparent";
  } else {
    return isActive ? "bg-emerald-600 text-white" : "bg-gray-50 text-gray-500";
  }
};

const handleTabClick = (key: string) => {
  emit("change", key);
};
</script>
