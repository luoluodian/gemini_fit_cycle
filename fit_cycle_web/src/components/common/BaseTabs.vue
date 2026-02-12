<template>
  <view :class="containerClass">
    <view class="flex space-x-2 overflow-x-auto scrollbar-hide">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer text-center hover:opacity-80 px-4 py-2',
          type === 'line' ? 'border-b-2' : 'border-[1rpx] border-solid rounded-lg',
          getTabClass(tab.key),
        ]"
        @click="handleTabClick(tab.key)"
      >
        {{ tab.label || tab.key }}
      </view>
    </view>
    <view class="tab-content mt-4" v-if="$slots[activeTab]">
      <slot :name="activeTab"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">

interface TabItem {
  key: string;
  label?: string;
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
      ? "text-emerald-600 border-emerald-600"
      : "text-gray-600 border-transparent";
  } else {
    return isActive ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-50 text-gray-500 border-gray-100";
  }
};

const handleTabClick = (key: string) => {
  emit("change", key);
};
</script>

<style scoped lang="scss">
.scrollbar-hide {
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    color: transparent;
  }
}
</style>
