<template>
  <BaseModal
    :visible="popupVisible"
    position="bottom"
    title="选择食材"
    content-class="bg-white rounded-t-3xl min-h-[75vh] flex flex-col"
    body-class="flex flex-col overflow-hidden flex-1"
    @close="handleClose"
    @update="(val) => (popupVisible = val)"
  >
    <!-- 1. 搜索栏 -->
    <view class="px-4 pt-2 mb-4 flex-shrink-0">
      <view class="relative">
        <input 
          v-model="searchText"
          type="text" 
          placeholder="输入食材名称搜索..."
          class="h-10 px-4 pl-10 bg-gray-50 border border-solid border-gray-100 rounded-xl text-sm font-black text-gray-800 transition-all focus:ring-2 focus:ring-emerald-500"
          style="width: 100%; box-sizing: border-box;"
          @input="handleSearch"
        />
        <image
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTY5RkExIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTIxIDIxbC02LTZtMi01YTcgNyAwIDExLTE0IDAgNyA3IDAgMDExNCAweiIvPjwvc3ZnPg=="
          class="w-4 h-4 absolute left-3.5 top-3 opacity-40"
        />
      </view>
    </view>

    <!-- 2. 分类筛选 -->
    <view class="mb-4 flex-shrink-0">
      <BaseScrollView 
        :scroll-x="true" 
        :scroll-y="false" 
        width="100%"
        content-class="inline-flex space-x-2 px-4 pb-1"
      >
        <view 
          class="inline-block px-4 py-1.5 rounded-full text-xs font-black transition-all border border-solid"
          :class="selectedCategory === 'all' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-100'"
          @tap="handleCategoryChange('all')"
        >
          全部
        </view>
        <view 
          v-for="cat in FOOD_CATEGORIES"
          :key="cat.key"
          class="inline-block px-4 py-1.5 rounded-full text-xs font-black transition-all border border-solid"
          :class="selectedCategory === cat.key ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-100'"
          @tap="handleCategoryChange(cat.key)"
        >
          <text class="mr-1">{{ cat.emoji }}</text>
          {{ cat.label }}
        </view>
      </BaseScrollView>
    </view>

    <!-- 3. 食物列表 -->
    <view class="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <view v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
        <view class="flex flex-col items-center">
          <view class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></view>
          <text class="text-xs text-gray-400 font-bold">加载中...</text>
        </view>
      </view>

      <BaseScrollView 
        flex
        :is-empty="!loading && foodsList.length === 0"
        empty-text="没有找到匹配的食材"
        scroll-view-class="px-4"
        content-class="space-y-3 pb-10"
      >
        <view 
          v-for="(food, index) in foodsList"
          :key="food.id"
          class="flex items-center justify-between p-4 bg-white rounded-2xl border border-solid border-gray-100 shadow-sm active:scale-[0.98] transition-all"
          @tap="handleSelectFood(food)"
        >
          <view class="flex-1 min-w-0 pr-4">
            <view class="flex items-center space-x-2 mb-1">
              <text class="font-black text-gray-800 text-base truncate">{{ food.name }}</text>
              <text v-if="food.protein > 15" class="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[16rpx] font-black rounded">高蛋白</text>
              <text v-if="food.carbs > 40" class="px-1.5 py-0.5 bg-yellow-50 text-yellow-600 text-[16rpx] font-black rounded">优质碳源</text>
            </view>
            <text class="text-[18rpx] text-gray-400 font-bold block mb-1">每 {{ food.baseCount }}{{ food.unit }} · {{ food.calories }}kcal</text>
            <view class="flex items-center space-x-3 text-[18rpx] text-gray-400 font-black">
              <text>🍞 碳水 {{ Math.round(food.carbs || 0) }}g</text>
              <text>🥩 蛋白 {{ Math.round(food.protein || 0) }}g</text>
              <text>🥑 脂肪 {{ Math.round(food.fat || 0) }}g</text>
            </view>
          </view>
          <view class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-solid border-emerald-100">
            <text class="text-emerald-600 font-black text-xl">+</text>
          </view>
        </view>
      </BaseScrollView>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModal from "./BaseModal.vue";
import BaseScrollView from "./BaseScrollView.vue";
import { FOOD_CATEGORIES } from "@/constants/food-categories";
import { searchFoodItems } from "@/services/modules/food";
import type { FoodItem, FoodCategory } from "@/services/modules/food";
import { debounce } from "lodash-es";

interface Props {
  visible: boolean;
}

interface Emits {
  (e: "close"): void;
  (e: "select", food: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchText = ref("");
const selectedCategory = ref("all");
const popupVisible = ref(props.visible);
const foodsList = ref<FoodItem[]>([]);
const loading = ref(false);

const fetchFoods = async () => {
  loading.value = true;
  try {
    const params: any = {
      q: searchText.value,
      page: 1,
      pageSize: 50,
    };

    if (selectedCategory.value !== "all") {
      params.category = selectedCategory.value as FoodCategory;
    }

    const res = await searchFoodItems(params);
    foodsList.value = res.items || (Array.isArray(res) ? res : []);
  } catch (error) {
    console.error("Failed to fetch foods in modal:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = debounce(() => {
  fetchFoods();
}, 500);

const handleCategoryChange = (key: string) => {
  selectedCategory.value = key;
  fetchFoods();
};

const handleClose = () => {
  searchText.value = "";
  selectedCategory.value = "all";
  emit("close");
};

const handleSelectFood = (food: FoodItem) => {
  emit("select", {
    ...food,
    foodId: food.id,
    foodName: food.name,
    baseUnit: food.unit,
    baseCount: food.baseCount || 100
  });
};

watch(() => props.visible, (newVal) => {
  popupVisible.value = newVal;
  if (newVal) {
    fetchFoods();
  }
});

watch(popupVisible, (newVal) => { if (!newVal) handleClose(); });
</script>