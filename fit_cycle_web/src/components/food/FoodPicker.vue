<template>
  <view>
    <!-- 1. 搜索与选择主弹窗 -->
    <BaseModal
      :visible="visible"
      position="bottom"
      :title="title"
      content-class="bg-white rounded-t-3xl h-[65vh] flex flex-col"
      body-class="flex flex-col flex-1 min-h-0 overflow-hidden"
      @close="handleClose"
      @update:visible="(val) => !val && handleClose()"
    >
      <!-- 1. 固定头部：搜索与分类 -->
      <view class="flex-shrink-0 z-10 animate-fade-in-up px-4">
        <!-- 搜索栏 -->
        <view class="mb-3">
          <SearchBar
            v-model="searchText"
            placeholder="搜索食材名称..."
            @input="handleSearch"
          />
        </view>

        <!-- 分类筛选 -->
        <view class="h-[100rpx]">
          <FoodCategoryBar
            v-model="selectedCategory"
            @update:model-value="handleCategoryChange"
          />
        </view>
      </view>

      <!-- 2. 食物列表卡片 (直接使用食材库模块结构) -->
      <view class="px-4 pb-6 flex-1 min-h-0">
        <GlassCard
          card-class="py-3 px-4 flex flex-col h-full"
          shadow="lg"
          class="animate-fade-in-up delay-200 h-full"
        >
          <view class="flex items-center justify-between mb-3 flex-shrink-0">
            <text class="text-sm font-black text-gray-700">食物列表</text>
            <text class="text-xs text-gray-400 font-bold"
              >共 {{ totalCount }} 种</text
            >
          </view>

          <BaseScrollView
            height="550rpx"
            :enhanced="true"
            :is-empty="!loading && foodsList.length === 0"
            :finished="!loading && foodsList.length > 0"
            content-class="pr-2 space-y-2"
            @load-more="handleLoadMore"
          >
            <view
              v-if="loading && foodsList.length === 0"
              class="py-10 text-center"
            >
              <text class="text-sm text-gray-400 font-bold"
                >正在获取食材数据...</text
              >
            </view>
            <template v-else>
              <FoodItemCard
                v-for="item in foodsList"
                :key="item.id"
                :food="item"
                @click="handleOpenDetail"
              />
            </template>
          </BaseScrollView>
        </GlassCard>
      </view>
    </BaseModal>

    <!-- 2. 食物详情弹窗 (二级嵌套弹窗) -->
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
import GlassCard from "@/components/common/GlassCard.vue";
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
const totalCount = ref(0);
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
    if (selectedCategory.value !== "all")
      params.category = selectedCategory.value;

    const res: any = await searchFoodItems(params);
    if (currentRequestId !== lastRequestId) return;

    const items = res.items || (Array.isArray(res) ? res : []);
    totalCount.value =
      res.total ?? (isLoadMore ? totalCount.value : items.length);

    const mappedItems = items.map((item: any) => ({
      ...item,
      baseCount: item.baseCount || 100,
    }));

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

const handleSearch = (val: string) => {
  if (!val) {
    resetList();
    return;
  }
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

const confirmSelection = (result: { food: FoodItem; quantity: number }) => {
  emit("select", result);
  currentFood.value = null;
  handleClose();
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && foodsList.value.length === 0) resetList();
  },
);
</script>

<style scoped lang="scss">
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

.delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
  animation-fill-mode: forwards;
}
</style>
