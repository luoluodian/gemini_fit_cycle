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
              <text class="text-base font-black text-blue-700 block">{{ totalStats.protein.toFixed(1) }}</text>
              <text class="text-[14rpx] text-blue-400 font-bold">g</text>
            </view>
            <view class="bg-yellow-50/50 rounded-xl p-2 border border-solid border-yellow-100">
              <text class="text-[16rpx] text-yellow-600 block mb-0.5 font-black">碳水</text>
              <text class="text-base font-black text-yellow-700 block">{{ totalStats.carbs.toFixed(1) }}</text>
              <text class="text-[14rpx] text-yellow-400 font-bold">g</text>
            </view>
            <view class="bg-red-50/50 rounded-xl p-2 border border-solid border-red-100">
              <text class="text-[16rpx] text-red-600 block mb-0.5 font-black">脂肪</text>
              <text class="text-base font-black text-red-700 block">{{ totalStats.fat.toFixed(1) }}</text>
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
            <view v-else class="space-y-1">
              <FoodItemCard
                v-for="(food, index) in foods" 
                :key="index"
                :food="food"
                :quantity="food.quantity"
                show-edit
                show-delete
                @edit="handleEditItem(index)"
                @delete="removeFood(index)"
              />
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
    <FoodPicker
      v-model:visible="foodPickerVisible"
      :title="mealLabel + ' - 添加食材'"
      @select="handleFoodPicked"
    />

    <FoodDetailModal
      :visible="editModalVisible"
      :food="editingFood"
      :quantity="editingQuantity"
      mode="edit"
      @close="closeEditModal"
      @confirm="handleUpdateItem"
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
import FoodPicker from "@/components/food/FoodPicker.vue";
import FoodItemCard from "@/components/food/FoodItemCard.vue";
import FoodDetailModal from "@/components/food/FoodDetailModal.vue";
import type { FoodItem } from "@/components/food/types";

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

const mealLabel = computed(() => {
  const map: any = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snacks: '加餐' };
  // 兼容自定义餐次名
  if (planStore.draft.templates[currentDayIndex]?.customLabels?.[currentMealType]) {
    return planStore.draft.templates[currentDayIndex].customLabels[currentMealType];
  }
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

const foodPickerVisible = ref(false);
const editModalVisible = ref(false);
const editingFood = ref<any>(null);
const editingIndex = ref(-1);
const editingQuantity = ref(100);

const openFoodSelector = () => {
  foodPickerVisible.value = true;
};

const handleFoodPicked = (result: { food: FoodItem; quantity: number }) => {
  const { food, quantity } = result;
  const ratio = quantity / (food.baseCount || 100);
  
  foods.value.push({
    ...food,
    name: food.name,
    quantity,
    unit: food.unit,
    calories: Math.round(food.calories * ratio),
    protein: Math.round(food.protein * ratio * 10) / 10,
    carbs: Math.round(food.carbs * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10
  });
};

const handleEditItem = (index: number) => {
  const item = foods.value[index];
  if (!item) return;
  
  editingIndex.value = index;
  // 为了让弹窗能反推基础营养，我们需要传一个类似原始食材的对象
  // 这里假设 item 已经包含了原始的热量（每baseCount的热量）
  // 实际上在 handleFoodPicked 中存入的是计算后的值，所以这里需要小心处理
  // 这里暂时直接把 item 传进去，FoodDetailModal 会根据 quantity 和 baseCount 自动处理逻辑
  editingFood.value = { ...item };
  editingQuantity.value = item.quantity;
  editModalVisible.value = true;
};

const closeEditModal = () => {
  editModalVisible.value = false;
  editingFood.value = null;
  editingIndex.value = -1;
};

const handleUpdateItem = (result: { food: any, quantity: number }) => {
  const { quantity } = result;
  const index = editingIndex.value;
  if (index === -1) return;

  const currentItem = foods.value[index];
  const oldQuantity = currentItem.quantity || 100;
  
  // 基于当前值按比例缩放，避免“滚雪球”误差的最好办法是使用原始基础值，
  // 但目前数据结构中 calories 等存的是计算后的，所以我们按 (新分量/旧分量) 比例计算
  const ratio = quantity / oldQuantity;
  
  const updatedItem = {
    ...currentItem,
    quantity,
    calories: Math.round(currentItem.calories * ratio),
    protein: Math.round(currentItem.protein * ratio * 10) / 10,
    carbs: Math.round(currentItem.carbs * ratio * 10) / 10,
    fat: Math.round(currentItem.fat * ratio * 10) / 10
  };

  foods.value[index] = updatedItem;
  closeEditModal();
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
