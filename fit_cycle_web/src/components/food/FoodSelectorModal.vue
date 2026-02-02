<template>
  <view v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4" @click="handleBackdropClick">
    <view 
      class="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" 
      @click.stop
    >
      <!-- Header -->
      <view class="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <text class="text-lg font-bold text-gray-800">{{ title }}</text>
        <view @click="handleClose" class="p-1">
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTY5RkExIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTYgMThMMTggNk02IDZsMTIgMTIiLz48L3N2Zz4="
            class="w-6 h-6 opacity-60"
          />
        </view>
      </view>

      <!-- Search & Filter Area -->
      <view class="p-4 space-y-4">
        <!-- Search Bar -->
        <view class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索食材..."
            class="w-full px-4 py-3 pl-10 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            @input="handleInput"
          />
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTY5RkExIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTIxIDIxbC02LTZtMi01YTcgNyAwIDExLTE0IDAgNyA3IDAgMDExNCAweiIvPjwvc3ZnPg=="
            class="w-5 h-5 absolute left-3 top-3 opacity-40"
          />
        </view>

        <!-- Horizontal Categories -->
        <scroll-view scroll-x class="whitespace-nowrap pb-2">
          <view class="flex space-x-2">
            <view
              v-for="cat in categoryOptions"
              :key="cat.key"
              class="px-4 py-2 rounded-full text-xs font-medium transition-all"
              :class="selectedCategory === cat.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
              @click="handleCategoryChange(cat.key)"
            >
              {{ cat.label }}
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Result List -->
      <scroll-view 
        scroll-y 
        class="flex-1 px-4 pb-6"
        @scrolltolower="handleLoadMore"
      >
        <view v-if="loading && items.length === 0" class="py-10 text-center">
          <text class="text-sm text-gray-400">正在加载中...</text>
        </view>
        
        <view v-else-if="items.length === 0" class="py-10 text-center">
          <text class="text-sm text-gray-400">未找到相关食材</text>
        </view>

        <view v-else class="space-y-3">
          <view 
            v-for="item in items" 
            :key="item.id"
            class="flex items-center p-3 bg-white border border-gray-100 rounded-xl active:bg-gray-50 transition-all"
            @click="handleSelect(item)"
          >
            <view class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <text class="text-xl">{{ item.imageUrl || '🥗' }}</text>
            </view>
            <view class="flex-1 min-w-0">
              <text class="font-semibold text-gray-800 block text-sm truncate">{{ item.name }}</text>
              <text class="text-xs text-gray-500 block mt-0.5">每{{ item.unit }} · {{ item.calories }}kcal</text>
              <view class="flex items-center text-[10px] text-gray-400 mt-1 space-x-2">
                <text>P: {{ item.protein }}g</text>
                <text>F: {{ item.fat }}g</text>
                <text>C: {{ item.carbs }}g</text>
              </view>
            </view>
            <view class="text-emerald-600 font-bold text-lg ml-2">+</view>
          </view>
          
          <view v-if="loading && items.length > 0" class="py-4 text-center">
            <text class="text-xs text-gray-400">正在加载更多...</text>
          </view>
          <view v-else-if="!hasNext && items.length > 0" class="py-4 text-center">
            <text class="text-xs text-gray-300">没有更多了</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { FoodItem, FoodCategory, searchFoodItems } from '@/services/modules/food';
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

const categoryOptions = [
  { key: 'all', label: '全部' },
  { key: 'protein', label: '蛋白质' },
  { key: 'vegetables', label: '蔬菜' },
  { key: 'fruits', label: '水果' },
  { key: 'grains', label: '主食' },
  { key: 'dairy', label: '乳制品' },
  { key: 'nuts', label: '坚果' },
  { key: 'oils', label: '油脂' },
];

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

const handleBackdropClick = (e: any) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
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
