<template>
  <view>
    <!-- 1. 搜索与选择主弹窗 -->
    <BaseModal
      :visible="visible"
      position="bottom"
      :title="title"
      content-class="bg-white rounded-t-3xl min-h-[75vh] flex flex-col"
      body-class="flex flex-col overflow-hidden flex-1"
      @close="handleClose"
      @update:visible="(val) => !val && handleClose()"
    >
      <!-- 搜索栏 -->
      <view class="px-4 pt-2 mb-4 flex-shrink-0">
        <SearchBar
          v-model="searchText"
          placeholder="输入食材名称搜索..."
          @input="handleSearch"
        />
      </view>

      <!-- 分类筛选 -->
      <view class="mb-4 flex-shrink-0">
        <FoodCategoryBar v-model="selectedCategory" @update:model-value="handleCategoryChange" />
      </view>

      <!-- 食物列表 -->
      <view class="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <view v-if="loading && foodsList.length === 0" class="absolute inset-0 z-[5] flex items-center justify-center bg-white/80">
          <view class="flex flex-col items-center">
            <view class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></view>
            <text class="text-xs text-gray-400 font-bold">加载中...</text>
          </view>
        </view>

                  <BaseScrollView 
                    flex
                    :is-empty="!loading && foodsList.length === 0"
                    :finished="!hasMore"
                    empty-text="没有找到匹配的食材"
                    scroll-view-class="px-4"
                    content-class="space-y-1 pb-10"
                    @load-more="handleLoadMore"
                  >
                                <FoodItemCard
                                  v-for="food in foodsList"
                                  :key="food.id"
                                  :food="food"
                                  @click="handleOpenDetail(food)"
                                />
                              </BaseScrollView>      </view>
    </BaseModal>

    <!-- 2. 食物详情弹窗 (恢复为二级嵌套弹窗) -->
    <FoodDetailModal
      :visible="!!currentFood"
      :food="currentFood"
      mode="edit"
      @close="currentFood = null"
      @confirm="confirmSelection"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseScrollView from "@/components/common/BaseScrollView.vue";
import SearchBar from "@/components/common/SearchBar.vue";
import FoodCategoryBar from "./FoodCategoryBar.vue";
import FoodItemCard from "./FoodItemCard.vue";
import FoodDetailModal from "./FoodDetailModal.vue";
import { searchFoodItems } from "@/services/modules/food";
import type { FoodItem } from "./types";
import { debounce } from "lodash-es";

interface Props {
  visible: boolean;
  title?: string;
}

interface Emits {
  (e: "update:visible", val: boolean): void;
  (e: "select", result: { food: FoodItem; quantity: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "选择食材",
});
const emit = defineEmits<Emits>();

const searchText = ref("");
const selectedCategory = ref("all");
const foodsList = ref<FoodItem[]>([]);
const loading = ref(false);

const currentFood = ref<FoodItem | null>(null);

// 分页与并发控制
const page = ref(1);
const hasMore = ref(true);
let lastRequestId = 0;

const resetList = () => {
  page.value = 1;
  hasMore.value = true;
  foodsList.value = [];
  fetchFoods();
};

const fetchFoods = async (isLoadMore = false) => {
  if (loading.value || (!hasMore.value && isLoadMore)) return;
  const currentRequestId = ++lastRequestId;
  loading.value = true;
  
  try {
    const params: any = {
      q: searchText.value,
      page: page.value,
      pageSize: 20,
    };
    if (selectedCategory.value !== "all") params.category = selectedCategory.value;

    const res: any = await searchFoodItems(params);
    if (currentRequestId !== lastRequestId) return;

    const items = res.items || (Array.isArray(res) ? res : []);
    const mappedItems = items.map((item: any) => ({ ...item, baseCount: item.baseCount || 100 }));

    if (isLoadMore) {
      foodsList.value = [...foodsList.value, ...mappedItems];
    } else {
      foodsList.value = mappedItems;
    }

    hasMore.value = items.length >= 20;
    if (hasMore.value) page.value++;
  } catch (error) {
    console.error("FoodPicker fetch error:", error);
  } finally {
    if (currentRequestId === lastRequestId) loading.value = false;
  }
};

const handleSearch = (e: any) => {
  const val = e.detail.value;
  if (!val) { resetList(); return; }
  debouncedSearch();
};

const debouncedSearch = debounce(() => resetList(), 500);
const handleCategoryChange = () => resetList();
const handleLoadMore = () => fetchFoods(true);

const handleClose = () => {
  emit("update:visible", false);
  setTimeout(() => {
    searchText.value = "";
    selectedCategory.value = "all";
    resetList();
  }, 300);
};

const handleOpenDetail = (food: FoodItem) => {
  currentFood.value = food;
};

const confirmSelection = (result: { food: FoodItem, quantity: number }) => {
  emit("select", result);
  currentFood.value = null;
  handleClose();
};

watch(() => props.visible, (newVal) => {
  if (newVal && foodsList.value.length === 0) resetList();
});
</script>