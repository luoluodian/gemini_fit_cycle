<template>
  <view v-if="foods" class="meal-config-page h-screen flex flex-col overflow-hidden">
    <!-- 1. Header -->
    <BaseNavBar 
      :title="mealLabel + '食材配置'" 
      :show-back="true"
    />

    <!-- 2. Main Content -->
    <view class="flex-1 flex flex-col min-h-0 px-4 py-4 space-y-3 overflow-hidden">
      <!-- 营养汇总卡片 -->
      <view class="flex-shrink-0 animate-fade-in-up">
        <GlassCard 
          background="#ffffff" 
          card-class="p-4 shadow-sm border-[1rpx] border-solid border-gray-200"
          radius="xl"
          :border="false"
        >
          <h3 class="text-sm font-black text-gray-800 mb-4 flex items-center">
            <view class="w-1.5 h-3.5 bg-emerald-500 rounded-full mr-2"></view>
            本餐营养汇总
          </h3>
          <view class="grid grid-cols-4 gap-2 text-center">
            <view class="bg-emerald-50/50 rounded-xl p-2 border border-solid border-emerald-100">
              <text class="text-[16rpx] text-emerald-600 block mb-0.5 font-black">热量</text>
              <text class="text-base font-black text-emerald-700 block">{{ Math.round(totalStats.calories) }}</text>
              <text class="text-[14rpx] text-emerald-400 font-bold">kcal</text>
            </view>
            <view class="bg-blue-50/50 rounded-xl p-2 border border-solid border-blue-100">
              <text class="text-[16rpx] text-blue-600 block mb-0.5 font-black">蛋白</text>
              <text class="text-base font-black text-blue-700 block">{{ Math.round(totalStats.protein) }}</text>
              <text class="text-[14rpx] text-blue-400 font-bold">g</text>
            </view>
            <view class="bg-yellow-50/50 rounded-xl p-2 border border-solid border-yellow-100">
              <text class="text-[16rpx] text-yellow-600 block mb-0.5 font-black">碳水</text>
              <text class="text-base font-black text-yellow-700 block">{{ Math.round(totalStats.carbs) }}</text>
              <text class="text-[14rpx] text-yellow-400 font-bold">g</text>
            </view>
            <view class="bg-red-50/50 rounded-xl p-2 border border-solid border-red-100">
              <text class="text-[16rpx] text-red-600 block mb-0.5 font-black">脂肪</text>
              <text class="text-base font-black text-red-700 block">{{ Math.round(totalStats.fat) }}</text>
              <text class="text-[14rpx] text-red-400 font-bold">g</text>
            </view>
          </view>
        </GlassCard>
      </view>

      <!-- 食物列表卡片 -->
      <view class="flex-1 min-h-0 animate-fade-in-up delay-100">
        <GlassCard 
          background="#ffffff" 
          card-class="p-4 shadow-sm border-[1rpx] border-solid border-gray-200 h-full flex flex-col"
          radius="xl"
          :border="false"
        >
          <view class="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 class="text-sm font-black text-gray-800 flex items-center">
              <view class="w-1.5 h-3.5 bg-orange-500 rounded-full mr-2"></view>
              已选食材清单
            </h3>
            <text class="text-[18rpx] text-gray-300 font-black uppercase tracking-widest">{{ foods.length }} 个食物</text>
          </view>
          
          <BaseScrollView 
            flex
            scroll-view-class="flex-1 min-h-0"
            content-class="pb-2"
          >
            <!-- 空状态 -->
            <view v-if="foods.length === 0" class="flex flex-col items-center justify-center py-12">
              <view class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <text class="text-3xl grayscale opacity-30">🍽️</text>
              </view>
              <text class="text-xs font-black text-gray-300 uppercase tracking-widest">还没有添加任何食材</text>
            </view>

            <!-- 食物列表条目 -->
            <view v-else class="space-y-2">
              <view 
                v-for="(food, index) in foods" 
                :key="index"
                class="flex items-center justify-between p-3 bg-white rounded-xl border-[1rpx] border-solid border-gray-100 shadow-sm transition-all active:scale-[0.98]"
              >
                <view class="flex-1 min-w-0 pr-4">
                  <text class="block font-black text-gray-800 text-sm truncate">{{ food.name }}</text>
                  <view class="flex items-center space-x-2 mt-1">
                    <text class="text-[18rpx] text-gray-400 font-bold uppercase">{{ food.quantity }}{{ food.unit }} · {{ food.calories }}kcal</text>
                    <view class="flex items-center space-x-1.5 text-[16rpx] text-gray-400 font-black">
                      <text>🍞 {{ Math.round(food.carbs || 0) }}</text>
                      <text>🥩 {{ Math.round(food.protein || 0) }}</text>
                      <text>🥑 {{ Math.round(food.fat || 0) }}</text>
                    </view>
                  </view>
                </view>
                <view 
                  @tap="removeFood(index)" 
                  class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-lg active:bg-red-100 border border-solid border-red-100 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </view>
              </view>
            </view>
          </BaseScrollView>
        </GlassCard>
      </view>

      <!-- 添加食材按钮 -->
      <view class="flex-shrink-0 animate-fade-in-up delay-200">
        <view 
          @tap="openFoodSelector" 
          class="w-full py-4 bg-emerald-500 rounded-2xl text-white font-black shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 mb-2"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <text class="tracking-widest text-sm">添加本餐食材</text>
        </view>
      </view>
    </view>

    <!-- 3. Footer -->
    <view 
      class="bg-white border-t border-gray-200 px-4 pt-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <view @tap="handleBack" class="w-full bg-gray-800 text-white py-3.5 rounded-xl font-black active:bg-black transition-colors text-center shadow-sm mb-3 text-sm tracking-widest">
        完成配置并返回
      </view>
    </view>

    <!-- Modals -->
    <FoodSelectionModal
      :visible="foodModalVisible"
      :foods="availableFoods"
      @close="foodModalVisible = false"
      @select="handleSelectFood"
    />

    <QuantityInputModal
      :visible="quantityModalVisible"
      :food-name="selectedFood?.foodName || ''"
      :food-unit="selectedFood?.baseUnit || ''"
      :calories="selectedFood?.calories"
      :protein="selectedFood?.protein"
      :fat="selectedFood?.fat"
      :carbs="selectedFood?.carbs"
      :base-count="selectedFood?.baseCount"
      @close="quantityModalVisible = false"
      @confirm="handleConfirmAdd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Taro from "@tarojs/taro";
import { usePlanStore } from "@/stores/plan";
import BaseNavBar from "@/components/common/BaseNavBar.vue";
import BaseScrollView from "@/components/common/BaseScrollView.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import FoodSelectionModal from "@/components/common/FoodSelectionModal.vue";
import QuantityInputModal from "@/components/common/QuantityInputModal.vue";

const planStore = usePlanStore();
const currentDayIndex = planStore.currentDayIndex;
const currentMealType = planStore.currentMealType;

// 使用 computed 动态获取数据，保证响应式
const foods = computed(() => {
  const template = planStore.draft.templates[currentDayIndex];
  if (!template || !template.meals) return [];
  if (!template.meals[currentMealType]) {
    template.meals[currentMealType] = [];
  }
  return template.meals[currentMealType];
});

const availableFoods = ref([
  {
    foodId: "FOOD_001",
    foodName: "燕麦粥",
    calories: 180,
    baseUnit: "g",
    protein: 6,
    fat: 3,
    carbs: 30,
    baseCount: 100,
  },
  {
    foodId: "FOOD_002",
    foodName: "鸡胸肉",
    calories: 165,
    baseUnit: "g",
    protein: 31,
    fat: 3.6,
    carbs: 0,
    baseCount: 100,
  },
  {
    foodId: "FOOD_003",
    foodName: "西兰花",
    calories: 34,
    baseUnit: "g",
    protein: 2.8,
    fat: 0.4,
    carbs: 7,
    baseCount: 100,
  },
  {
    foodId: "FOOD_004",
    foodName: "三文鱼",
    calories: 208,
    baseUnit: "g",
    protein: 25,
    fat: 13,
    carbs: 0,
    baseCount: 100,
  },
  {
    foodId: "FOOD_005",
    foodName: "糙米饭",
    calories: 111,
    baseUnit: "g",
    protein: 2.6,
    fat: 0.9,
    carbs: 23,
    baseCount: 100,
  },
]);

const mealLabel = computed(() => {
  const map: any = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snacks: '加餐' };
  return map[currentMealType] || currentMealType;
});

const totalStats = computed(() => {
  return foods.value.reduce((acc: any, f: any) => ({
    calories: acc.calories + (f.calories || 0),
    protein: acc.protein + (f.protein || 0),
    carbs: acc.carbs + (f.carbs || 0),
    fat: acc.fat + (f.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
});

const foodModalVisible = ref(false);
const quantityModalVisible = ref(false);
const selectedFood = ref<any>(null);

const openFoodSelector = () => {
  foodModalVisible.value = true;
};

const handleSelectFood = (food: any) => {
  selectedFood.value = food;
  foodModalVisible.value = false;
  quantityModalVisible.value = true;
};

const handleConfirmAdd = (quantity: number) => {
  const ratio = quantity / selectedFood.value.baseCount;
  foods.value.push({
    name: selectedFood.value.foodName,
    quantity,
    unit: selectedFood.value.baseUnit,
    calories: Math.round(selectedFood.value.calories * ratio),
    protein: Math.round(selectedFood.value.protein * ratio * 10) / 10,
    carbs: Math.round(selectedFood.value.carbs * ratio * 10) / 10,
    fat: Math.round(selectedFood.value.fat * ratio * 10) / 10
  });
  quantityModalVisible.value = false;
};

const removeFood = (index: number) => {
  foods.value.splice(index, 1);
};

const handleBack = () => Taro.navigateBack();
</script>

<style scoped lang="scss">
.meal-config-page {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

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
  animation: fadeInUp 0.6s ease-out forwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
</style>
