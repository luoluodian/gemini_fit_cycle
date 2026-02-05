<template>
  <BaseScrollView
    :scroll-x="true"
    :scroll-y="false"
    width="100%"
    height="100rpx"
    scroll-view-class="pb-2"
    content-class="inline-block min-w-max pr-4"
  >
    <view
      v-for="cat in unifiedCategories"
      :key="cat.key"
      class="inline-flex px-4 py-1.5 rounded-lg text-xs font-medium transition-all items-center space-x-1.5 border border-solid mr-2"
      :class="
        modelValue === cat.key
          ? 'bg-emerald-600 text-white shadow-sm border-emerald-600 scale-[1.02]'
          : 'bg-white/80 text-gray-400 border-gray-100'
      "
      @click="$emit('update:modelValue', cat.key)"
    >
      <text v-if="cat.emoji" class="text-sm">{{ cat.emoji }}</text>
      <text>{{ cat.label }}</text>
    </view>
  </BaseScrollView>
</template>

<script setup lang="ts">
import BaseScrollView from "@/components/common/BaseScrollView.vue";
import { FOOD_CATEGORIES } from "@/constants/food-categories";

defineProps<{
  modelValue: string;
}>();

defineEmits(["update:modelValue"]);

const unifiedCategories = [
  { key: "all", label: "全部", emoji: "📊" },
  { key: "favorites", label: "我的收藏", emoji: "❤️" },
  { key: "custom", label: "我的创建", emoji: "📝" },
  { key: "system", label: "系统食材", emoji: "🏪" },
  ...FOOD_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    emoji: cat.emoji,
  })),
];
</script>