<template>
  <BaseModal
    :visible="visible"
    position="bottom"
    :title="title"
    content-class="bg-white rounded-t-3xl min-h-[85vh] flex flex-col"
    body-class="flex flex-col overflow-hidden flex-1"
    @close="handleClose"
    @update:visible="(val) => !val && handleClose()"
  >
    <!-- 1. Search & Filter Area (Fixed) -->
    <view class="px-4 pt-2 space-y-4 flex-shrink-0">
      <!-- Search Bar -->
      <SearchBar
        v-model="searchQuery"
        placeholder="搜索食材..."
        @input="handleInput"
      />

      <!-- Horizontal Categories -->
      <view class="mb-2">
        <FoodCategoryBar v-model="selectedCategory" @update:model-value="handleCategoryChange" />
      </view>
    </view>

    <!-- 2. Result List (Scrollable) -->
    <view class="flex-1 min-h-0 flex flex-col relative mt-2">
      <BaseScrollView 
        flex
        :is-empty="!loading && items.length === 0"
        :finished="!hasNext"
        empty-text="未找到相关食材"
        scroll-view-class="px-4 pb-6 h-full"
        content-class="space-y-1"
        @load-more="handleLoadMore"
      >
        <FoodItemCard 
          v-for="item in items" 
          :key="item.id"
          :food="item"
          @click="handleSelect(item)"
        />
      </BaseScrollView>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import SearchBar from '../common/SearchBar.vue';
import FoodCategoryBar from './FoodCategoryBar.vue';
import FoodItemCard from './FoodItemCard.vue';
import BaseScrollView from '../common/BaseScrollView.vue';
import { FoodCategory, searchFoodItems } from '../../services/modules/food';
import type { FoodItem } from '../../services/modules/food';
import { debounce } from 'lodash-es';

interface Props {
  visible: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择食材'
});

const emit = defineEmits<{
  close: [];
  select: [food: FoodItem];
}>();

// 状态管理
const items = ref<FoodItem[]>([]);
const loading = ref(false);
const page = ref(1);
const hasNext = ref(true);
const searchQuery = ref('');
const selectedCategory = ref<string>('all');

// 加载数据
const fetchItems = async (isLoadMore = false) => {
  if (loading.value) return;
  if (isLoadMore && !hasNext.value) return;

  loading.value = true;
  if (!isLoadMore) {
    page.value = 1;
    items.value = [];
  }

  try {
    const res = await searchFoodItems({
      q: searchQuery.value,
      category: selectedCategory.value === 'all' ? undefined : (selectedCategory.value as FoodCategory),
      page: page.value,
      pageSize: 20
    });

    if (isLoadMore) {
      items.value = [...items.value, ...res.items];
    } else {
      items.value = res.items;
    }

    hasNext.value = items.value.length < res.total;
    if (hasNext.value) page.value++;
  } catch (error) {
    console.error('Failed to fetch food items:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索防抖
const debouncedFetch = debounce(() => {
  fetchItems();
}, 500);

const handleInput = () => {
  debouncedFetch();
};

const handleCategoryChange = (key: string) => {
  selectedCategory.value = key;
  fetchItems();
};

const handleLoadMore = () => {
  fetchItems(true);
};

const handleSelect = (food: FoodItem) => {
  emit('select', food);
};

const handleClose = () => {
  emit('close');
};

// 监听可见性
watch(() => props.visible, (newVal) => {
  if (newVal && items.value.length === 0) {
    fetchItems();
  }
});
</script>

<style scoped lang="scss">
.fixed {
  transition: all 0.3s ease;
}
</style>
