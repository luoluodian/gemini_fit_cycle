<template>
  <view class="min-h-screen">
    <!-- Header -->
    <FoodHeader @toggle-search="handleToggleSearch" />

    <!-- Search Bar -->
    <SearchBar :visible="showSearchBar" @search="handleSearch" />

    <!-- Main Content -->
    <view class="px-4 py-6 pb-20">
      <!-- Quick Categories -->
      <QuickCategories
        :selected-category="selectedCategory"
        @category-change="handleCategoryChange"
      />

      <!-- Category Tabs -->
      <view class="glass-card rounded-2xl p-4 mb-6 shadow-lg">
        <CategoryTabs :current-tab="currentTab" @tab-change="handleTabChange" />

        <!-- Recently Used -->
        <RecentlyUsed :foods="recentlyUsedFoods" />

        <!-- Frequently Used -->
        <FrequentlyUsed :foods="frequentlyUsedFoods" />
      </view>

      <!-- Food List -->
      <FoodList
        :foods="filteredFoods"
        @add-to-meal="handleAddToMeal"
        @view-detail="handleViewDetail"
        @toggle-favorite="handleToggleFavorite"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </view>

    <!-- Floating Action Button -->
    <FloatingButton @click="handleCreateCustomFood" />

    <!-- Food Detail Modal -->
    <FoodDetailModal
      :visible="showDetailModal"
      :food="selectedFood"
      @close="handleCloseDetailModal"
      @add-to-meal="handleAddToMealFromDetail"
    />

    <!-- Custom Food Modal -->
    <CustomFoodModal
      :visible="showCustomFoodModal"
      :editing-food="editingFood"
      @close="handleCloseCustomFoodModal"
      @submit="handleSubmitCustomFood"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import FoodHeader from "@/components/food/FoodHeader.vue";
import SearchBar from "@/components/food/SearchBar.vue";
import QuickCategories from "@/components/food/QuickCategories.vue";
import CategoryTabs from "@/components/food/CategoryTabs.vue";
import RecentlyUsed from "@/components/food/RecentlyUsed.vue";
import FrequentlyUsed from "@/components/food/FrequentlyUsed.vue";
import FoodList from "@/components/food/FoodList.vue";
import FloatingButton from "@/components/food/FloatingButton.vue";
import FoodDetailModal from "@/components/food/FoodDetailModal.vue";
import CustomFoodModal from "@/components/food/CustomFoodModal.vue";
import { useNavigationStore } from "@/stores/navigation";

interface Food {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  unit: string;
  description: string;
  category: string;
  type: "system" | "custom";
  isFavorite?: boolean;
}

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
});
const showSearchBar = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");
const currentTab = ref("all");
const showDetailModal = ref(false);
const showCustomFoodModal = ref(false);
const selectedFood = ref<Food | null>(null);
const editingFood = ref<Food | null>(null);

// 写死的数据 - 最近使用
const recentlyUsedFoods = ref<Food[]>([
  { id: "banana", name: "香蕉", emoji: "🍌", calories: 80, protein: 1.1, fat: 0.3, carbs: 23, unit: "100g", description: "钾元素丰富", category: "fruits", type: "system" },
  { id: "egg", name: "鸡蛋", emoji: "🥚", calories: 78, protein: 13, fat: 5, carbs: 1, unit: "100g", description: "优质蛋白质", category: "protein", type: "system" },
  { id: "milk", name: "牛奶", emoji: "🥛", calories: 120, protein: 3.4, fat: 1, carbs: 5, unit: "100ml", description: "钙质丰富", category: "dairy", type: "system" },
  { id: "bread", name: "全麦面包", emoji: "🍞", calories: 120, protein: 8, fat: 2, carbs: 20, unit: "100g", description: "全谷物", category: "grains", type: "system" },
]);

// 写死的数据 - 常用食材
const frequentlyUsedFoods = ref<Food[]>([
  { id: "chicken-breast", name: "鸡胸肉", emoji: "🍗", calories: 165, protein: 31, fat: 3.6, carbs: 0, unit: "100g", description: "高蛋白，低脂肪", category: "protein", type: "system" },
  { id: "broccoli", name: "西兰花", emoji: "🥬", calories: 35, protein: 2.8, fat: 0.4, carbs: 7, unit: "100g", description: "维生素C丰富", category: "vegetables", type: "system" },
  { id: "brown-rice", name: "糙米饭", emoji: "🍚", calories: 180, protein: 2.6, fat: 0.9, carbs: 23, unit: "100g", description: "全谷物，富纤维", category: "grains", type: "system" },
  { id: "salmon", name: "三文鱼", emoji: "🐟", calories: 233, protein: 25, fat: 12, carbs: 0, unit: "100g", description: "富含Omega-3", category: "protein", type: "system" },
]);

// 写死的数据 - 所有食材
const allFoods = ref<Food[]>([
  {
    id: "chicken-breast",
    name: "鸡胸肉",
    emoji: "🥩",
    calories: 165,
    protein: 31,
    fat: 3.6,
    carbs: 0,
    unit: "100g",
    description: "高蛋白，低脂肪",
    category: "protein",
    type: "system",
    isFavorite: true,
  },
  {
    id: "salmon",
    name: "三文鱼",
    emoji: "🐟",
    calories: 208,
    protein: 25,
    fat: 12,
    carbs: 0,
    unit: "100g",
    description: "富含Omega-3",
    category: "protein",
    type: "system",
    isFavorite: false,
  },
  {
    id: "broccoli",
    name: "西兰花",
    emoji: "🥬",
    calories: 35,
    protein: 2.8,
    fat: 0.4,
    carbs: 7,
    unit: "100g",
    description: "维生素C丰富",
    category: "vegetables",
    type: "system",
    isFavorite: false,
  },
  {
    id: "carrot",
    name: "胡萝卜",
    emoji: "🥕",
    calories: 41,
    protein: 0.9,
    fat: 0.2,
    carbs: 10,
    unit: "100g",
    description: "β-胡萝卜素丰富",
    category: "vegetables",
    type: "system",
    isFavorite: false,
  },
  {
    id: "apple",
    name: "苹果",
    emoji: "🍎",
    calories: 52,
    protein: 0.3,
    fat: 0.2,
    carbs: 14,
    unit: "100g",
    description: "膳食纤维丰富",
    category: "fruits",
    type: "system",
    isFavorite: true,
  },
  {
    id: "banana",
    name: "香蕉",
    emoji: "🍌",
    calories: 89,
    protein: 1.1,
    fat: 0.3,
    carbs: 23,
    unit: "100g",
    description: "钾元素丰富",
    category: "fruits",
    type: "system",
    isFavorite: true,
  },
  {
    id: "brown-rice",
    name: "糙米饭",
    emoji: "🍚",
    calories: 111,
    protein: 2.6,
    fat: 0.9,
    carbs: 23,
    unit: "100g",
    description: "全谷物，富纤维",
    category: "grains",
    type: "system",
    isFavorite: false,
  },
  {
    id: "custom-salad",
    name: "自制沙拉",
    emoji: "🥗",
    calories: 65,
    protein: 3,
    fat: 2,
    carbs: 8,
    unit: "100g",
    description: "混合蔬菜沙拉",
    category: "custom",
    type: "custom",
    isFavorite: false,
  },
]);

// 计算过滤后的食材列表
const filteredFoods = computed(() => {
  let foods = [...allFoods.value];

  // 按标签筛选
  if (currentTab.value === "system") {
    foods = foods.filter((food) => food.type === "system");
  } else if (currentTab.value === "custom") {
    foods = foods.filter((food) => food.type === "custom");
  }

  // 按分类筛选
  if (selectedCategory.value) {
    foods = foods.filter((food) => food.category === selectedCategory.value);
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    foods = foods.filter(
      (food) =>
        food.name.toLowerCase().includes(query) ||
        food.description.toLowerCase().includes(query)
    );
  }

  return foods;
});

// 事件处理
const handleToggleSearch = () => {
  showSearchBar.value = !showSearchBar.value;
};

const handleSearch = (value: string) => {
  searchQuery.value = value;
};

const handleCategoryChange = (category: string) => {
  selectedCategory.value = selectedCategory.value === category ? "" : category;
};

const handleTabChange = (tab: string) => {
  currentTab.value = tab;
};

const handleAddToMeal = (food: Food) => {
  // 这里可以添加跳转逻辑或显示提示
  console.log("添加到餐食:", food.name);
};

const handleViewDetail = (food: Food) => {
  selectedFood.value = food;
  showDetailModal.value = true;
};

const handleCloseDetailModal = () => {
  showDetailModal.value = false;
  selectedFood.value = null;
};

const handleAddToMealFromDetail = (food: Food) => {
  handleAddToMeal(food);
  handleCloseDetailModal();
};

const handleToggleFavorite = (food: Food) => {
  const index = allFoods.value.findIndex((f) => f.id === food.id);
  if (index !== -1) {
    allFoods.value[index].isFavorite = !allFoods.value[index].isFavorite;
  }
};

const handleCreateCustomFood = () => {
  editingFood.value = null;
  showCustomFoodModal.value = true;
};

const handleEdit = (food: Food) => {
  editingFood.value = food;
  showCustomFoodModal.value = true;
};

const handleDelete = (food: Food) => {
  const index = allFoods.value.findIndex((f) => f.id === food.id);
  if (index !== -1) {
    allFoods.value.splice(index, 1);
  }
};

const handleCloseCustomFoodModal = () => {
  showCustomFoodModal.value = false;
  editingFood.value = null;
};

const handleSubmitCustomFood = (data: any) => {
  if (editingFood.value) {
    // 编辑模式
    const index = allFoods.value.findIndex((f) => f.id === editingFood.value!.id);
    if (index !== -1) {
      allFoods.value[index] = {
        ...allFoods.value[index],
        ...data,
      };
    }
  } else {
    // 创建模式
    const newFood: Food = {
      id: `custom_${Date.now()}`,
      name: data.name,
      emoji: "🥗",
      calories: data.calories,
      protein: data.protein || 0,
      fat: data.fat || 0,
      carbs: data.carbs || 0,
      unit: data.unit,
      description: data.description || "自定义食材",
      category: "custom",
      type: "custom",
      isFavorite: false,
    };
    allFoods.value.push(newFood);
  }
  handleCloseCustomFoodModal();
};
</script>

<style scoped>
.min-h-screen {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>

