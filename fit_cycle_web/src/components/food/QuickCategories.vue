<template>
  <view class="glass-card rounded-lg p-4 mb-6 shadow-lg">
    <text class="text-lg font-semibold text-gray-800 mb-3 block">快速分类</text>
    <view class="grid grid-cols-4 gap-3">
      <view
        v-for="category in categories"
        :key="category.key"
        class="category-tab flex flex-col items-center p-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-emerald-100 hover:text-emerald-700"
        :class="{ active: selectedCategory === category.key }"
        @click="handleCategoryClick(category.key)"
      >
        <text class="text-2xl mb-1 block">{{ category.emoji }}</text>
        <text class="text-xs block">{{ category.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedCategory?: string;
}>();

const emit = defineEmits<{
  categoryChange: [category: string];
}>();

const categories = [
  { key: "protein", name: "蛋白质", emoji: "🥩" },
  { key: "vegetables", name: "蔬菜", emoji: "🥬" },
  { key: "fruits", name: "水果", emoji: "🍎" },
  { key: "grains", name: "谷物", emoji: "🌾" },
  { key: "dairy", name: "乳制品", emoji: "🥛" },
  { key: "nuts", name: "坚果", emoji: "🥜" },
  { key: "oils", name: "油脂", emoji: "🫒" },
  { key: "snacks", name: "零食", emoji: "🍿" },
];

const handleCategoryClick = (category: string) => {
  emit("categoryChange", category);
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.category-tab {
  transition: all 0.3s ease;
}

.category-tab.active {
  background: #10b981;
  color: white;
}
</style>

