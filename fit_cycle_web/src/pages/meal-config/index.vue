<template>
  <view class="meal-config-page min-h-screen flex flex-col">
    <!-- 1. Header -->
    <BaseNavBar 
      :title="mealLabel + '配置'" 
      :show-back="true"
    />

    <!-- 2. Main Content -->
    <view class="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <!-- 营养汇总 -->
      <GlassCard 
        background="#ffffff" 
        card-class="p-5 shadow-lg border-[1rpx] border-solid border-gray-200"
        radius="2xl"
        :border="false"
      >
        <h3 class="text-base font-black text-gray-800 mb-5 flex items-center">
          <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
          本餐营养
        </h3>
        <view class="grid grid-cols-4 gap-3 text-center">
          <view class="bg-emerald-50 rounded-2xl p-3 border border-solid border-emerald-100/50">
            <text class="text-[18rpx] text-emerald-600 block mb-1 font-black uppercase">Cals</text>
            <text class="text-lg font-black text-emerald-600 block">{{ Math.round(totalStats.calories) }}</text>
            <text class="text-[16rpx] text-emerald-400 font-bold uppercase">kcal</text>
          </view>
          <view class="bg-blue-50 rounded-2xl p-3 border border-solid border-blue-100/50">
            <text class="text-[18rpx] text-blue-600 block mb-1 font-black uppercase">Carb</text>
            <text class="text-lg font-black text-blue-600 block">{{ Math.round(totalStats.carbs) }}</text>
            <text class="text-[16rpx] text-blue-400 font-bold uppercase">g</text>
          </view>
          <view class="bg-red-50 rounded-2xl p-3 border border-solid border-red-100/50">
            <text class="text-[18rpx] text-red-600 block mb-1 font-black uppercase">Prot</text>
            <text class="text-lg font-black text-red-600 block">{{ Math.round(totalStats.protein) }}</text>
            <text class="text-[16rpx] text-red-400 font-bold uppercase">g</text>
          </view>
          <view class="bg-yellow-50 rounded-2xl p-3 border border-solid border-yellow-100/50">
            <text class="text-[18rpx] text-yellow-600 block mb-1 font-black uppercase">Fat</text>
            <text class="text-lg font-black text-yellow-600 block">{{ Math.round(totalStats.fat) }}</text>
            <text class="text-[16rpx] text-yellow-400 font-bold uppercase">g</text>
          </view>
        </view>
      </GlassCard>

      <!-- 食物列表 -->
      <GlassCard 
        background="#ffffff" 
        card-class="p-5 shadow-lg border-[1rpx] border-solid border-gray-200"
        radius="2xl"
        :border="false"
      >
        <view class="flex items-center justify-between mb-5">
          <h3 class="text-base font-black text-gray-800 flex items-center">
            <view class="w-1 h-4 bg-orange-500 rounded-full mr-2"></view>
            食物列表
          </h3>
          <text class="text-[18rpx] text-gray-300 font-black uppercase tracking-widest">{{ foods.length }} items</text>
        </view>
        
        <view v-if="foods.length === 0" class="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <view class="text-4xl mb-3 grayscale opacity-50">🍽️</view>
          <text class="text-sm font-black text-gray-300 uppercase tracking-tighter">Empty Plate</text>
        </view>

        <view v-else class="space-y-3">
          <view 
            v-for="(food, index) in foods" 
            :key="index"
            class="food-item flex items-center justify-between p-4 bg-white rounded-2xl border border-solid border-gray-100 shadow-sm transition-all active:scale-[0.98]"
          >
            <view class="flex-1 min-w-0 pr-4">
              <text class="block font-black text-gray-800 text-sm truncate">{{ food.name }}</text>
              <text class="block text-[18rpx] text-gray-400 mt-0.5 font-bold uppercase tracking-wider">{{ food.quantity }}{{ food.unit }} · {{ food.calories }} kcal</text>
            </view>
            <view @tap="removeFood(index)" class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-lg active:bg-red-100 transition-colors border border-solid border-red-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </view>
          </view>
        </view>
      </GlassCard>

      <!-- 添加按钮 -->
      <view 
        @tap="openFoodSelector" 
        class="w-full py-5 bg-emerald-500 rounded-3xl text-white font-black shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <text class="uppercase tracking-widest text-sm">Add Food Item</text>
      </view>
      
      <view class="h-32 w-full"></view>
    </view>

    <!-- 3. Footer -->
    <view 
      class="bg-white border-t border-gray-200 px-4 pt-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <view @tap="handleBack" class="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-black active:bg-emerald-700 transition-colors text-center shadow-sm mb-3 uppercase tracking-widest text-sm">
        Save & Back
      </view>
    </view>

    <!-- Modals -->
    <FoodSelectionModal
      :visible="foodModalVisible"
      @close="foodModalVisible = false"
      @select="handleSelectFood"
    />

    <QuantityInputModal
      :visible="quantityModalVisible"
      :food-name="selectedFood?.name || ''"
      :food-unit="'g'"
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
import GlassCard from "@/components/common/GlassCard.vue";
import FoodSelectionModal from "@/components/common/FoodSelectionModal.vue";
import QuantityInputModal from "@/components/common/QuantityInputModal.vue";

const planStore = usePlanStore();
const currentDayIndex = planStore.currentDayIndex;
const currentMealType = planStore.currentMealType;
const template = planStore.draft.templates[currentDayIndex];
const foods = template.meals[currentMealType];

const mealLabel = computed(() => {
  const map: any = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snacks: '加餐' };
  return map[currentMealType];
});

const totalStats = computed(() => {
  return foods.reduce((acc: any, f: any) => ({
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
  const ratio = quantity / 100;
  foods.push({
    name: selectedFood.value.name,
    quantity,
    unit: 'g',
    calories: Math.round(selectedFood.value.calories * ratio),
    protein: Math.round(selectedFood.value.protein * ratio * 10) / 10,
    carbs: Math.round(selectedFood.value.carbs * ratio * 10) / 10,
    fat: Math.round(selectedFood.value.fat * ratio * 10) / 10
  });
  quantityModalVisible.value = false;
};

const removeFood = (index: number) => {
  foods.splice(index, 1);
};

const handleBack = () => Taro.navigateBack();
</script>

<style scoped>
.meal-config-page {
  min-height: 100vh;
}
.hero-title {
  font-family: 'Noto Serif SC', serif;
}
</style>