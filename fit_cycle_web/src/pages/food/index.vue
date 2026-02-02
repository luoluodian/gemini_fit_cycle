<template>
  <view class="min-h-screen">
    <!-- Header Area -->
    <view class="px-4 pt-6 pb-2 animate-fade-in-up">
      <view class="flex items-center justify-between">
        <view>
          <text class="text-xl font-bold text-gray-800 block">食材库</text>
          <text class="text-sm text-gray-500 mt-0.5 block">管理你的健康食材</text>
        </view>
        <view class="flex items-center space-x-2">
          <view @click="handleToggleSearch" class="p-2 bg-gray-100 rounded-lg active:scale-95 transition-all">
            <image 
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjNEI1NTYzIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTIxIDIxbC02LTZtMi01YTcgNyAwIDExLTE0IDAgNyA3IDAgMDExNCAweiIvPjwvc3ZnPg=="
              class="w-5 h-5"
            />
          </view>
          <view 
            class="flex items-center space-x-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium active:scale-95 transition-all shadow-sm"
            @click="handleCreateCustomFood"
          >
            <image 
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJ3aGl0ZSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xMiA2djZtMCAwdjZtMC02aDZtLTYgMEg2Ii8+PC9zdmc+"
              class="w-4 h-4 mr-1"
            />
            <text>新建</text>
          </view>
        </view>
      </view>

      <!-- Search Bar -->
      <view v-if="showSearchBar" class="mt-3 animate-fade-in-up">
        <view class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索食材名称..."
            class="search-input w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-sm bg-white/90"
            @input="handleSearchInput"
          />
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTY5RkExIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTIxIDIxbC02LTZtMi01YTcgNyAwIDExLTE0IDAgNyA3IDAgMDExNCAweiIvPjwvc3ZnPg=="
            class="w-4 h-4 absolute left-3 top-2.5 opacity-40"
          />
        </view>
      </view>
    </view>

    <!-- Main Content -->
    <view class="px-4 py-4 pb-20">
      <!-- Horizontal Categories -->
      <scroll-view scroll-x class="whitespace-nowrap pb-3 mb-4 -mx-4 px-4 scrollbar-hide animate-fade-in-up delay-100">
        <view class="flex space-x-2">
          <view
            v-for="cat in categoryOptions"
            :key="cat.key"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5"
            :class="selectedCategory === cat.key ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'"
            @click="handleCategoryChange(cat.key)"
          >
            <text v-if="cat.emoji">{{ cat.emoji }}</text>
            <text>{{ cat.label }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- Popular Foods (Horizontal Scroll) -->
      <GlassCard card-class="p-4 mb-6" shadow="lg" class="animate-fade-in-up delay-200">
        <view class="flex items-center justify-between mb-3">
          <text class="text-sm font-medium text-gray-700">热门食材</text>
          <text class="text-xs text-gray-400">滑动查看更多</text>
        </view>
        <scroll-view scroll-x class="whitespace-nowrap pb-2 scrollbar-hide">
          <view class="flex space-x-2">
            <view
              v-for="food in popularFoods"
              :key="food.id"
              class="flex-shrink-0 bg-white rounded-xl p-3 border border-gray-100 min-w-[100px] text-center shadow-sm active:scale-95 transition-all"
              @click="handleViewDetail(food)"
            >
              <text class="text-2xl mb-1 block">{{ food.imageUrl || '🥗' }}</text>
              <text class="text-xs font-medium text-gray-800 block truncate">{{ food.name }}</text>
              <text class="text-xs text-gray-400 block mt-0.5">{{ food.calories }} kcal</text>
            </view>
          </view>
        </scroll-view>
      </GlassCard>

      <!-- Food List -->
      <GlassCard card-class="p-4 flex flex-col" shadow="lg" class="animate-fade-in-up delay-300 min-h-[400px]">
        <view class="flex items-center justify-between mb-3 flex-shrink-0">
          <text class="text-sm font-medium text-gray-700">食物列表</text>
          <text class="text-xs text-gray-400" id="foodCount">共 {{ totalCount }} 种</text>
        </view>
        
        <view v-if="isLoading && allFoods.length === 0" class="py-10 text-center">
          <text class="text-sm text-gray-400">正在获取食材数据...</text>
        </view>
        
        <view v-else class="space-y-2">
          <view 
            v-for="item in allFoods" 
            :key="item.id"
            class="flex items-center p-3 bg-white border border-gray-100 rounded-lg active:bg-gray-50 transition-all"
            @click="handleViewDetail(item)"
          >
            <view 
              class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
              :class="getCategoryBg(item.category)"
            >
              <text class="text-lg">{{ item.imageUrl || '🥗' }}</text>
            </view>
            <view class="flex-1 min-w-0">
              <view class="flex items-center space-x-2">
                <text class="font-medium text-gray-800 block text-sm truncate">{{ item.name }}</text>
                <text
                  class="px-1.5 py-0.5 text-[10px] rounded"
                  :class="item.type === 'system' ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-600'"
                >
                  {{ item.type === 'system' ? '系统' : '我的' }}
                </text>
              </view>
              <view class="flex items-center text-[10px] text-gray-400 mt-0.5 space-x-2">
                <text>🔹 蛋白 {{ item.protein }}g</text>
                <text>🔸 脂肪 {{ item.fat }}g</text>
                <text>🔹 碳水 {{ item.carbs }}g</text>
              </view>
            </view>
            <view class="text-right ml-2">
              <text class="text-sm font-semibold text-gray-800 block">{{ item.calories }}</text>
              <text class="text-[10px] text-gray-400 block">kcal</text>
            </view>
          </view>
        </view>
      </GlassCard>
    </view>

    <!-- Modals -->
    <FoodDetailModal
      :visible="showDetailModal"
      :food="selectedFood"
      @close="handleCloseDetailModal"
    />

    <CustomFoodModal
      :visible="showCustomFoodModal"
      :editing-food="editingFood"
      @close="handleCloseCustomFoodModal"
      @submit="fetchFoods"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import { useNavigationStore } from "@/stores/navigation";
import { FoodItem, searchFoodItems, FoodCategory } from "@/services/modules/food";
import GlassCard from "@/components/common/GlassCard.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import FoodDetailModal from "@/components/food/FoodDetailModal.vue";
import CustomFoodModal from "@/components/food/CustomFoodModal.vue";
import { debounce } from "lodash-es";
import "./index.scss";

// 状态管理
const navStore = useNavigationStore();

useDidShow(() => {
  navStore.setActiveTab(2);
  const page = Taro.getCurrentInstance().page;
  if (page && typeof page.getTabBar === "function" && page.getTabBar()) {
    page.getTabBar().setData({
      selected: 2,
    });
  }
  fetchFoods();
});

const showSearchBar = ref(false);
const searchQuery = ref("");
const selectedCategory = ref<string>("all");
const showDetailModal = ref(false);
const showCustomFoodModal = ref(false);
const selectedFood = ref<FoodItem | null>(null);
const editingFood = ref<FoodItem | null>(null);

const allFoods = ref<FoodItem[]>([]);
const totalCount = ref(0);
const isLoading = ref(false);

const categoryOptions = [
  { key: 'all', label: '全部', emoji: '📊' },
  { key: 'favorites', label: '我的收藏', emoji: '❤️' },
  { key: 'custom', label: '我的创建', emoji: '📝' },
  { key: 'system', label: '系统食材', emoji: '🏪' },
  { key: 'protein', label: '蛋白质', emoji: '🥩' },
  { key: 'vegetables', label: '蔬菜', emoji: '🥬' },
  { key: 'fruits', label: '水果', emoji: '🍎' },
  { key: 'grains', label: '谷物', emoji: '🌾' },
  { key: 'dairy', label: '乳制品', emoji: '🥛' },
  { key: 'nuts', label: '坚果', emoji: '🥜' },
];

// 获取数据
const fetchFoods = async () => {
  isLoading.value = true;
  try {
    const params: any = {
      q: searchQuery.value,
      page: 1,
      pageSize: 50
    };
    
    if (selectedCategory.value !== 'all' && !['favorites', 'custom', 'system'].includes(selectedCategory.value)) {
      params.category = selectedCategory.value as FoodCategory;
    }

    const res = await searchFoodItems(params);
    let filtered = res.items;
    
    // 处理特殊分类
    if (selectedCategory.value === 'system') {
      filtered = filtered.filter(f => f.type === 'system');
    } else if (selectedCategory.value === 'custom') {
      filtered = filtered.filter(f => f.type === 'custom');
    } else if (selectedCategory.value === 'favorites') {
      // TODO: 接收藏接口
      filtered = filtered.filter(f => (f as any).isFavorite);
    }

    allFoods.value = filtered;
    totalCount.value = res.total;
  } catch (error) {
    console.error("Failed to fetch foods:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleToggleSearch = () => {
  showSearchBar.value = !showSearchBar.value;
  if (!showSearchBar.value) {
    searchQuery.value = "";
    fetchFoods();
  }
};

const handleSearchInput = debounce(() => {
  fetchFoods();
}, 500);

const handleCategoryChange = (key: string) => {
  selectedCategory.value = key;
  fetchFoods();
};

const handleViewDetail = (food: FoodItem) => {
  selectedFood.value = food;
  showDetailModal.value = true;
};

const handleCloseDetailModal = () => {
  showDetailModal.value = false;
  selectedFood.value = null;
};

const handleCreateCustomFood = () => {
  editingFood.value = null;
  showCustomFoodModal.value = true;
};

const handleCloseCustomFoodModal = () => {
  showCustomFoodModal.value = false;
  editingFood.value = null;
};

const getCategoryBg = (cat: string) => {
  const colors: Record<string, string> = {
    protein: "bg-red-50",
    vegetables: "bg-green-50",
    fruits: "bg-yellow-50",
    grains: "bg-amber-50",
    dairy: "bg-blue-50",
    nuts: "bg-orange-50",
    oils: "bg-gray-50",
    custom: "bg-purple-50",
  };
  return colors[cat] || "bg-gray-50";
};

const popularFoods = computed(() => allFoods.value.slice(0, 10));
</script>

<style scoped lang="scss">
.min-h-screen {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.search-input {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
</style>
