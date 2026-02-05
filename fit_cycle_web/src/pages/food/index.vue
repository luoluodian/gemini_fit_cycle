<template>
  <view class="h-screen flex flex-col overflow-hidden food-library-page">
    <BaseNavBar title="食材库">
      <template #left>
        <view
          class="flex items-center justify-center p-3 border-[1rpx] border-solid border-emerald-300 text-emerald-300 rounded-lg active:scale-95 transition-all ml-2 shadow-sm"
          @click="handleCreateCustomFood"
        >
          <Uploader font-size="18"></Uploader>
        </view>
      </template>
    </BaseNavBar>

    <!-- Search Bar -->
    <view class="px-4 mt-3 animate-fade-in-up w-[100vw] flex-shrink-0">
      <SearchBar
        v-model="searchQuery"
        placeholder="搜索食材名称..."
        @input="handleSearchInput"
      />
    </view>

    <!-- 2. Main Content -->
    <view
      class="flex-1 flex flex-col min-h-0 py-4 px-4 overflow-hidden space-y-4"
    >
      <!-- 2.1 Horizontal Categories -->
      <view class="flex-shrink-0 -mb-4">
        <FoodCategoryBar
          v-model="selectedCategory"
          @update:model-value="handleCategoryChange"
        />
      </view>

      <!-- 2.2 Popular Foods -->
      <GlassCard
        card-class="px-4 pt-4 mb-4 flex-shrink-0"
        shadow="lg"
        class="animate-fade-in-up delay-200"
      >
        <view class="flex items-center justify-between mb-2">
          <text class="text-sm font-black text-gray-700">热门食材</text>
          <text v-if="!isPopularLoading && popularFoods.length > 0" class="text-xs text-gray-400 font-bold">滑动查看</text>
        </view>

        <view style="height: 200rpx">
          <view v-if="isPopularLoading" class="h-full flex items-center justify-center">
             <view class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></view>
          </view>
          <BaseScrollView
            v-else-if="popularFoods.length > 0"
            :scroll-x="true"
            :scroll-y="false"
            width="100%"
            height="100%"
            content-class="flex space-x-3 pr-4 h-full items-center"
          >
            <view
              v-for="food in popularFoods"
              :key="food.id"
              class="flex-shrink-0 bg-white rounded-lg w-20 h-[150rpx] text-center shadow-sm active:scale-95 transition-all flex flex-col justify-between py-2 px-1"
              style="border: 1rpx solid #f3f4f6"
              @click="handleViewDetail(food)"
            >
              <view class="text-2xl">{{ food.imageUrl || "🥗" }}</view>
              <view class="flex flex-col items-center">
                <text
                  class="text-[20rpx] font-bold text-gray-800 block truncate w-full"
                  >{{ food.name }}</text
                >
              </view>
            </view>
          </BaseScrollView>
          <view v-else class="h-full flex items-center justify-center">
            <text class="text-xs text-gray-300 font-bold">暂无热门食材</text>
          </view>
        </view>
      </GlassCard>

      <!-- 2.3 Food List -->
      <GlassCard
        card-class="py-3 px-4 flex flex-col "
        shadow="lg"
        class="animate-fade-in-up delay-300"
      >
        <view class="flex items-center justify-between mb-3 flex-shrink-0">
          <text class="text-sm font-black text-gray-700">食物列表</text>
          <text class="text-xs text-gray-400 font-bold"
            >共 {{ totalCount }} 种</text
          >
        </view>

        <BaseScrollView
          height="620rpx"
          :enhanced="true"
          :is-empty="!isLoading && allFoods.length === 0"
          :finished="!isLoading && allFoods.length > 0"
          content-class="pr-2 space-y-2 "
        >
          <view
            v-if="isLoading && allFoods.length === 0"
            class="py-10 text-center"
          >
            <text class="text-sm text-gray-400 font-bold"
              >正在获取食材数据...</text
            >
          </view>
          <template v-else>
            <FoodItemCard
              v-for="item in allFoods"
              :key="item.id"
              :food="item"
              :show-edit="item.type === 'custom'"
              :show-delete="item.type === 'custom'"
              @click="handleViewDetail"
              @edit="handleEditFood"
              @delete="handleDeleteFood"
            />
          </template>
        </BaseScrollView>
      </GlassCard>
    </view>

    <!-- 3. Modals -->
    <FoodDetailModal
      :visible="showDetailModal"
      :food="selectedFood"
      :is-favorite="selectedFood?.isFavorite"
      @close="handleCloseDetailModal"
      @toggleFavorite="handleToggleFavorite"
      @edit="handleEditFood"
      @delete="handleDeleteFood"
    />

    <CustomFoodModal
      :visible="showCustomFoodModal"
      :editing-food="editingFood"
      @close="handleCloseCustomFoodModal"
      @submit="fetchInitialData"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import { useNavigationStore } from "@/stores/navigation";
import {
  searchFoodItems,
  favoriteFood,
  unfavoriteFood,
  getPopularFoodItems,
  deleteFoodItem,
} from "@/services/modules/food";
import type { FoodItem } from "@/services/modules/food";
import { FOOD_CATEGORIES } from "@/constants/food-categories";
import GlassCard from "@/components/common/GlassCard.vue";
import BaseScrollView from "@/components/common/BaseScrollView.vue";
import SearchBar from "@/components/common/SearchBar.vue";
import FoodCategoryBar from "@/components/food/FoodCategoryBar.vue";
import FoodItemCard from "@/components/food/FoodItemCard.vue";
import FoodDetailModal from "@/components/food/FoodDetailModal.vue";
import CustomFoodModal from "@/components/food/CustomFoodModal.vue";
import { showSuccess, showError } from "@/utils/toast";
import { debounce } from "lodash-es";
import { Uploader } from "@nutui/icons-vue-taro";

const navStore = useNavigationStore();

const searchQuery = ref("");
const selectedCategory = ref("all");
const showDetailModal = ref(false);
const showCustomFoodModal = ref(false);
const selectedFood = ref<any>(null);
const editingFood = ref<any>(null);
const allFoods = ref<FoodItem[]>([]);
const popularFoods = ref<FoodItem[]>([]);
const totalCount = ref(0);
const isLoading = ref(false);
const isPopularLoading = ref(false);

useDidShow(() => {
  navStore.setActiveTab(2);
  const page = Taro.getCurrentInstance().page;
  if (page && typeof page.getTabBar === "function" && page.getTabBar()) {
    page.getTabBar().setData({ selected: 2 });
  }
  fetchInitialData();
});

const fetchInitialData = () => {
  fetchFoods();
  fetchPopular();
};

const fetchPopular = async () => {
  isPopularLoading.value = true;
  try {
    let category: string | undefined = undefined;
    let type: string | undefined = undefined;
    const specialKeys = ["all", "favorites", "custom", "system"];
    
    if (selectedCategory.value === "system") {
      type = "system";
    } else if (selectedCategory.value === "custom") {
      type = "custom";
    } else if (!specialKeys.includes(selectedCategory.value)) {
      category = selectedCategory.value;
    }
    
    const res = await getPopularFoodItems(category, type);
    popularFoods.value = res;
  } catch (e) {
    console.error("Failed to fetch popular foods", e);
  } finally {
    isPopularLoading.value = false;
  }
};

const fetchFoods = async () => {
  isLoading.value = true;
  try {
    const params: any = { q: searchQuery.value, page: 1, pageSize: 50 };
    if (
      selectedCategory.value !== "all" &&
      !["favorites", "custom", "system"].includes(selectedCategory.value)
    ) {
      params.category = selectedCategory.value;
    }
    const res = await searchFoodItems(params);
    let filtered = res.items || [];
    if (selectedCategory.value === "system")
      filtered = filtered.filter((f: any) => f.type === "system");
    else if (selectedCategory.value === "custom")
      filtered = filtered.filter((f: any) => f.type === "custom");
    else if (selectedCategory.value === "favorites")
      filtered = filtered.filter((f: any) => f.isFavorite);
    allFoods.value = filtered;
    totalCount.value = res.total || filtered.length;
  } catch (error) {
    console.error("Failed to fetch foods:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSearchInput = debounce(() => fetchFoods(), 500);
const handleCategoryChange = (key: string) => {
  selectedCategory.value = key;
  fetchFoods();
  fetchPopular();
};

const handleViewDetail = (food: FoodItem) => {
  selectedFood.value = food;
  showDetailModal.value = true;
};

const handleCloseDetailModal = () => {
  showDetailModal.value = false;
  selectedFood.value = null;
};

const handleEditFood = (food: FoodItem) => {
  editingFood.value = food;
  showDetailModal.value = false;
  setTimeout(() => {
    showCustomFoodModal.value = true;
  }, 300);
};

const handleCreateCustomFood = () => {
  editingFood.value = null;
  showCustomFoodModal.value = true;
};

const handleCloseCustomFoodModal = () => {
  showCustomFoodModal.value = false;
  editingFood.value = null;
};

const handleToggleFavorite = async (food: any) => {
  try {
    if (food.isFavorite) {
      await unfavoriteFood(food.id);
      food.isFavorite = false;
      showSuccess("已取消收藏");
    } else {
      await favoriteFood(food.id);
      food.isFavorite = true;
      showSuccess("已收藏");
    }
    fetchPopular();
    if (selectedCategory.value === "favorites") fetchFoods();
  } catch (e: any) {
    showError(e.message || "操作失败");
  }
};

const handleDeleteFood = async (food: any) => {
  Taro.showModal({
    title: "确认删除",
    content: "确定要删除此食材吗？",
    success: async (res) => {
      if (res.confirm) {
        await deleteFoodItem(food.id);
        showSuccess("已删除");
        showDetailModal.value = false;
        fetchInitialData();
      }
    },
  });
};
</script>

<style scoped lang="scss">
.food-library-page {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}
</style>
