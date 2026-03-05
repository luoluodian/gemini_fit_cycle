<template>
  <view
    class="h-screen flex flex-col overflow-hidden food-library-page bg-gradient-to-br from-emerald-50 to-teal-50"
  >
    <!-- 1. Header (Fixed) -->
    <BaseNavBar title="食材库" back-mode="none" class="flex-shrink-0">
      <template #left>
        <view
          class="flex items-center justify-center p-3 border-[1rpx] border-solid border-emerald-600 text-emerald-600 rounded-lg active:scale-95 transition-all ml-2 shadow-sm bg-white/50"
          @click="handleCreateCustomFood"
        >
          <Uploader font-size="18"></Uploader>
        </view>
      </template>
    </BaseNavBar>

    <!-- 2. Search Box (Fixed Row) -->
    <view class="px-4 flex-shrink-0 animate-fade-in-up mt-4">
      <SearchBar
        v-model="searchQuery"
        placeholder="搜索食材名称..."
        @input="handleSearchInput"
      />
    </view>

    <!-- 3. Body (Flex-1) -->
    <!-- 修复点：通过 pb-tabbar 彻底避开底部导航栏，space-y-4 统一间距 -->
    <view
      class="flex-1 min-h-0 flex flex-col px-4 pt-1 overflow-hidden pb-tabbar"
    >
      <!-- 3.1 Horizontal Categories -->
      <view class="flex-shrink-0">
        <FoodCategoryBar
          v-model="selectedCategory"
          @update:model-value="handleCategoryChange"
        />
      </view>

      <!-- 3.2 Popular Foods -->
      <GlassCard
        card-class="flex-shrink-0"
        class="animate-fade-in-up delay-100"
      >
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center gap-2">
            <view class="w-1.5 h-3.5 bg-orange-500 rounded-full"></view>
            <text class="text-sm font-black text-gray-700">热门食材</text>
          </view>
          <text
            v-if="!isPopularLoading && popularFoods.length > 0"
            class="text-[18rpx] text-gray-300 font-bold uppercase tracking-widest"
            >左滑查看更多</text
          >
        </view>

        <view style="height: 180rpx">
          <view
            v-if="isPopularLoading"
            class="h-full flex items-center justify-center"
          >
            <view
              class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"
            ></view>
          </view>
          <BaseScrollView
            v-else-if="popularFoods.length > 0"
            :scroll-x="true"
            :scroll-y="false"
            width="100%"
            height="100%"
            content-class="flex items-center space-x-3 pr-4 h-full"
          >
            <view
              v-for="food in popularFoods"
              :key="food.id"
              class="flex-shrink-0 bg-white rounded-xl w-24 h-[140rpx] text-center shadow-sm active:scale-95 transition-all flex flex-col justify-center items-center py-2 px-1 border border-solid border-gray-50"
              @click="handleViewDetail(food)"
            >
              <view class="text-2xl mb-1">{{ food.imageUrl || "🥗" }}</view>
              <text
                class="text-[20rpx] font-bold text-gray-800 block truncate w-full px-1"
                >{{ food.name }}</text
              >
            </view>
          </BaseScrollView>
          <view v-else class="h-full flex items-center justify-center">
            <text class="text-xs text-gray-300 font-bold">暂无热门食材</text>
          </view>
        </view>
      </GlassCard>

      <!-- 3.3 Food List (Flex-1) -->
      <!-- 修复点：flex-1 min-h-0 是 scroll-view 可滑动的必要条件 -->
      <GlassCard
        card-class="flex-1 flex flex-col min-h-0 overflow-hidden"
        class="animate-fade-in-up delay-200 flex-1 min-h-0 mt-4"
      >
        <view class="flex items-center justify-between mb-4 flex-shrink-0">
          <view class="flex items-center gap-2">
            <view class="w-1.5 h-3.5 bg-emerald-500 rounded-full"></view>
            <text class="text-sm font-black text-gray-700">全部食材</text>
          </view>
          <text
            class="text-[18rpx] text-gray-300 font-black uppercase tracking-widest"
            >共 {{ totalCount }} 种食材</text
          >
        </view>

        <BaseScrollView
          :is-empty="!isLoading && allFoods.length === 0"
          :loading="isLoading"
          :finished="
            !isLoading && allFoods.length >= totalCount && totalCount > 0
          "
          content-class="pr-2 space-y-2 "
          scroll-view-class="flex-1 min-h-0"
        >
          <FoodItemCard
            v-for="item in allFoods"
            :key="item.id"
            :food="item"
            :show-edit="false"
            :show-delete="false"
            @click="handleViewDetail"
          />
        </BaseScrollView>
      </GlassCard>
    </view>

    <!-- 4. Modals -->
    <!-- 系统食材详情弹窗 (带收藏) -->
    <FoodDetailModal
      :visible="showDetailModal"
      :food="selectedFood"
      :is-favorite="selectedFood?.isFavorite"
      :show-confirm="false"
      @close="handleCloseDetailModal"
      @toggleFavorite="handleToggleFavorite"
    />

    <!-- 自建食材编辑弹窗 -->
    <CustomFoodModal
      :visible="showCustomFoodModal"
      :editing-food="editingFood"
      @close="handleCloseCustomFoodModal"
      @submit="fetchInitialData"
      @delete="handleDeleteFood"
      @toggleFavorite="handleToggleFavorite"
      @select-similar="handleSelectSimilar"
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

/**
 * 审计点：差异化详情处理
 * 1. 自建食物 (custom): 直接进入编辑弹窗，支持全量修改
 * 2. 系统食物 (system): 进入详情展示弹窗，仅支持查看与收藏
 */
const handleViewDetail = (food: FoodItem) => {
  if (food.type === "custom") {
    handleEditFood(food);
    return;
  }
  selectedFood.value = food;
  showDetailModal.value = true;
};

const handleCloseDetailModal = () => {
  showDetailModal.value = false;
};

const handleEditFood = (food: FoodItem) => {
  editingFood.value = food;
  showDetailModal.value = false;
  // 延迟 100ms 以确保 Modal 切换动画不冲突
  setTimeout(() => {
    showCustomFoodModal.value = true;
  }, 100);
};

const handleCreateCustomFood = () => {
  editingFood.value = null;
  showCustomFoodModal.value = true;
};

const handleCloseCustomFoodModal = () => {
  showCustomFoodModal.value = false;
  editingFood.value = null;
};

/**
 * 审计点：相似食材联动
 * 点击推荐的相似官方食材后，自动关闭创建弹窗并开启详情页，
 * 引导用户复用已有数据。
 */
const handleSelectSimilar = (food: FoodItem) => {
  showCustomFoodModal.value = false;
  setTimeout(() => {
    handleViewDetail(food);
  }, 300);
};

/**
 * 审计点：收藏状态同步
 * 实现 Optimistic UI (乐观UI) 思想，操作后立即修改本地 Ref，
 * 同时异步同步服务器，提升交互流畅度。
 */
const handleToggleFavorite = async (food: any) => {
  if (!food) return;
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
    // 同步更新全部列表/热门列表中的状态
    const target = allFoods.value.find((f) => f.id === food.id);
    if (target) target.isFavorite = food.isFavorite;

    fetchPopular();
    // 若当前在“我的收藏”分类，则需重刷列表
    if (selectedCategory.value === "favorites") fetchFoods();
  } catch (e: any) {
    showError(e.message || "操作失败");
  }
};

const handleDeleteFood = async (food: any) => {
  Taro.showModal({
    title: "确认删除",
    content: "确定要删除此食材吗？",
    confirmColor: "#ef4444",
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteFoodItem(food.id);
          showSuccess("已删除");
          showCustomFoodModal.value = false;
          showDetailModal.value = false;
          fetchInitialData();
        } catch (e) {
          showError("删除失败");
        }
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
