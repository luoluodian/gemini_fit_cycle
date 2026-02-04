<template>
  <view class="min-h-screen flex flex-col overflow-hidden">
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
      <view class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索食材名称..."
          class="search-input px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-sm bg-white/90"
          @input="handleSearchInput"
        />
        <image
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTY5RkExIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTIxIDIxbC02LTZtMi01YTcgNyAwIDExLTE0IDAgNyA3IDAgMDExNCAweiIvPjwvc3ZnPg=="
          class="w-4 h-4 absolute left-3 top-2.5 opacity-40"
        />
      </view>
    </view>

    <!-- Main Content Area -->
    <view class="flex-1 flex flex-col min-h-0 py-4 px-4 overflow-hidden">
      <!-- Horizontal Categories -->
      <view class="flex-shrink-0">
        <BaseScrollView
          :scroll-x="true"
          :scroll-y="false"
          width="100%"
          scroll-view-class="pb-3 -mx-4 px-4 animate-fade-in-up delay-100"
          content-class="flex space-x-2 pr-4"
        >
          <view
            v-for="cat in categoryOptions"
            :key="cat.key"
            class="px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 border border-solid flex-shrink-0"
            :class="
              selectedCategory === cat.key
                ? 'bg-emerald-600 text-white shadow-sm border-emerald-600 scale-[1.02]'
                : 'bg-white/80 text-gray-400 border-gray-100'
            "
            @click="handleCategoryChange(cat.key)"
          >
            <text v-if="cat.emoji" class="text-sm">{{ cat.emoji }}</text>
            <text>{{ cat.label }}</text>
          </view>
        </BaseScrollView>
      </view>

      <!-- Popular Foods -->
      <GlassCard
        card-class="px-4 pt-4 mb-4 flex-shrink-0"
        shadow="lg"
        class="animate-fade-in-up delay-200"
      >
        <view class="flex items-center justify-between">
          <text class="text-sm font-medium text-gray-700">热门食材</text>
          <text v-if="popularFoods.length > 0" class="text-xs text-gray-400"
            >滑动查看</text
          >
        </view>

        <view style="height: 200rpx">
          <BaseScrollView
            :scroll-x="true"
            :scroll-y="false"
            width="100%"
            height="100%"
            :is-empty="popularFoods.length === 0"
            content-class="flex space-x-3 pr-4 h-full items-center"
          >
            <template #empty>
              <view class="h-full flex flex-col items-center justify-center">
                <svg
                  class="w-8 h-8 text-gray-100 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <text class="text-[20rpx] text-gray-300">暂无热门食材</text>
              </view>
            </template>

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
        </view>
      </GlassCard>

      <!-- Food List -->
      <GlassCard
        card-class="py-3 px-4 flex flex-col"
        shadow="lg"
        class="animate-fade-in-up delay-300"
      >
        <view class="flex items-center justify-between mb-3 flex-shrink-0">
          <text class="text-sm font-medium text-gray-700">食物列表</text>
          <text class="text-xs text-gray-400" id="foodCount"
            >共 {{ totalCount }} 种</text
          >
        </view>

        <view
          v-if="isLoading && allFoods.length === 0"
          class="py-10 text-center"
        >
          <text class="text-sm text-gray-400">正在获取食材数据...</text>
        </view>

        <BaseScrollView
          v-else
          height="640rpx"
          :is-empty="!isLoading && allFoods.length === 0"
          :finished="!isLoading && allFoods.length > 0"
          content-class="pr-2 space-y-2 pb-10"
        >
          <template #empty>
            <view class="py-10 text-center">
              <text class="text-sm text-gray-400">未找到相关食材</text>
            </view>
          </template>

          <view
            v-for="item in allFoods"
            :key="item.id"
            class="flex items-center p-3 bg-white rounded-lg active:bg-gray-50 transition-all"
            style="border: 2rpx solid #d1d5db"
            @click="handleViewDetail(item)"
          >
            <view
              class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
              :class="getCategoryBg(item.category)"
            >
              <text class="text-lg">{{ item.imageUrl || "🥗" }}</text>
            </view>
            <view class="flex-1 min-w-0">
              <view class="flex items-center space-x-2">
                <text
                  class="font-medium text-gray-800 block text-xs truncate"
                  >{{ item.name }}</text
                >
                <text
                  class="px-1.5 py-0.5 text-[18rpx] rounded"
                  :class="
                    item.type === 'system'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-purple-50 text-purple-600'
                  "
                >
                  {{ item.type === "system" ? "系统" : "我的" }}
                </text>
              </view>
              <view
                class="flex items-center text-[18rpx] text-gray-400 mt-0.5 space-x-2"
              >
                <text>🔹 蛋白 {{ item.protein }}g</text>
                <text>🔸 脂肪 {{ item.fat }}g</text>
                <text>🔹 碳水 {{ item.carbs }}g</text>
              </view>
            </view>
            <view class="text-right ml-2">
              <text class="text-xs font-semibold text-gray-800 block">{{
                item.calories
              }}</text>
              <text class="text-[18rpx] text-gray-400 block">kcal</text>
            </view>
          </view>
        </BaseScrollView>
      </GlassCard>
    </view>

    <!-- Modals -->
    <FoodDetailModal
      :visible="showDetailModal"
      :food="selectedFood"
      :is-favorite="(selectedFood as any)?.isFavorite"
      @close="handleCloseDetailModal"
      @toggle-favorite="handleToggleFavorite"
      @edit="handleEditFood"
      @delete="handleDeleteFood"
    />

    <CustomFoodModal
      :visible="showCustomFoodModal"
      :editing-food="editingFood"
      @close="handleCloseCustomFoodModal"
      @submit="fetchInitialData"
      @delete="handleDeleteFood"
      @toggle-favorite="handleToggleFavorite"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import { useNavigationStore } from "@/stores/navigation";
import { useUserStore } from "@/stores/user";
import {
  searchFoodItems,
  favoriteFood,
  unfavoriteFood,
  getPopularFoodItems,
  deleteFoodItem,
  FoodCategory,
} from "@/services/modules/food";
import type { FoodItem } from "@/services/modules/food";
import { FOOD_CATEGORIES } from "@/constants/food-categories";
import GlassCard from "@/components/common/GlassCard.vue";
import FoodDetailModal from "@/components/food/FoodDetailModal.vue";
import CustomFoodModal from "@/components/food/CustomFoodModal.vue";
import { showSuccess, showError } from "@/utils/toast";
import { debounce } from "lodash-es";
import { Uploader } from "@nutui/icons-vue-taro";
import "./index.scss";

// ... (existing constants)

const handleEditFood = (food: FoodItem) => {
  editingFood.value = food;
  showDetailModal.value = false; // 先关闭详情
  setTimeout(() => {
    showCustomFoodModal.value = true; // 延迟打开编辑，防止弹窗动画冲突
  }, 300);
};

const handleDeleteFood = async (food: FoodItem) => {
  Taro.showModal({
    title: "删除确认",
    content: `确定要删除食材 "${food.name}" 吗？此操作不可撤销。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteFoodItem(food.id);
          showSuccess("删除成功");
          showDetailModal.value = false;
          showCustomFoodModal.value = false;
          fetchInitialData(); // 刷新列表
        } catch (e: any) {
          showError(e.message || "删除失败");
        }
      }
    },
  });
};

// ... (template remains similar but with new emits)

// 状态管理
const navStore = useNavigationStore();
const userStore = useUserStore();

useDidShow(() => {
  navStore.setActiveTab(2);
  const page = Taro.getCurrentInstance().page;
  if (page && typeof page.getTabBar === "function" && page.getTabBar()) {
    page.getTabBar().setData({
      selected: 2,
    });
  }
  fetchInitialData();
});

const showSearchBar = ref(false);
const searchQuery = ref("");
const selectedCategory = ref<string>("all");
const showDetailModal = ref(false);
const showCustomFoodModal = ref(false);
const selectedFood = ref<FoodItem | null>(null);
const editingFood = ref<FoodItem | null>(null);

const allFoods = ref<FoodItem[]>([]);
const popularFoods = ref<FoodItem[]>([]);
const totalCount = ref(0);
const isLoading = ref(false);

const categoryOptions = [
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

const fetchInitialData = () => {
  fetchFoods();
  fetchPopular();
};

const fetchPopular = async () => {
  try {
    const res = await getPopularFoodItems();
    popularFoods.value = res;
  } catch (e) {
    console.error("Failed to fetch popular foods", e);
  }
};

// 获取数据
const fetchFoods = async () => {
  isLoading.value = true;
  try {
    const params: any = {
      q: searchQuery.value,
      page: 1,
      pageSize: 50,
    };

    // 如果选中的是具体营养分类
    if (
      selectedCategory.value !== "all" &&
      !["favorites", "custom", "system"].includes(selectedCategory.value)
    ) {
      params.category = selectedCategory.value as FoodCategory;
    }

    const res = await searchFoodItems(params);
    let filtered = res.items;

    // 处理特殊本地筛选 (如果后端暂不支持直接传 type=custom 等)
    if (selectedCategory.value === "system") {
      filtered = filtered.filter((f) => f.type === "system");
    } else if (selectedCategory.value === "custom") {
      filtered = filtered.filter((f) => f.type === "custom");
    } else if (selectedCategory.value === "favorites") {
      filtered = filtered.filter((f) => f.isFavorite);
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
  // 1. 获取当前登录用户的 ID (处理多层级嵌套)
  const currentUserId = userStore.userInfo?.user?.id || userStore.userInfo?.id;

  // 2. 核心判断逻辑：是否为用户自建
  // 满足以下任一条件即视为自建：
  // a. type 是 custom 且 userId 匹配
  // b. 如果 userId 暂时没拿到但 type 是 custom，在开发环境也视为自建以便管理
  const isOwn =
    food.type === "custom" &&
    (!food.userId || String(food.userId) === String(currentUserId));

  console.log("[Food] Viewing detail:", {
    foodId: food.id,
    isOwn,
    foodType: food.type,
    currentUserId,
    foodUserId: food.userId,
  });

  if (isOwn) {
    // 进入编辑模式
    editingFood.value = { ...food }; // 解构以断开响应式引用
    showCustomFoodModal.value = true;
  } else {
    // 进入系统详情模式
    selectedFood.value = food;
    showDetailModal.value = true;
  }
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

const handleToggleFavorite = async (food: FoodItem) => {
  if (!food) return;
  const isFav = food.isFavorite;

  try {
    if (isFav) {
      await unfavoriteFood(food.id);
      food.isFavorite = false;
      showSuccess("已取消收藏");
    } else {
      await favoriteFood(food.id);
      food.isFavorite = true;
      showSuccess("已收藏");
    }

    // 同步更新可能处于编辑状态的 food 对象属性，触发 UI 响应
    if (editingFood.value && editingFood.value.id === food.id) {
      editingFood.value.isFavorite = food.isFavorite;
    }
    if (selectedFood.value && selectedFood.value.id === food.id) {
      selectedFood.value.isFavorite = food.isFavorite;
    }

    fetchPopular();
    if (selectedCategory.value === "favorites") {
      fetchFoods();
    }
  } catch (error: any) {
    showError(error.message || "操作失败");
  }
};

const getCategoryBg = (cat: string) => {
  const target = FOOD_CATEGORIES.find((c) => c.key === cat);
  return target ? target.theme.bg : "bg-gray-50";
};
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
