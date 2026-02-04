<template>
  <view class="edit-template-page min-h-screen flex flex-col">
    <!-- 1. Header (恢复标题居中和右侧插槽) -->
    <BaseNavBar 
      :title="'编辑 Day ' + (currentDayIndex + 1)" 
      :show-back="true"
    >
      <template #right>
        <view 
          @tap="handleDelete" 
          class="text-red-500 text-sm font-black active:opacity-60 uppercase tracking-widest px-4 py-2"
        >
          删除
        </view>
      </template>
    </BaseNavBar>

    <!-- 2. Main Content -->
    <view class="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <!-- 模板名称 -->
      <GlassCard 
        background="#ffffff" 
        card-class="p-5 border-[1rpx] border-solid border-gray-200"
        radius="2xl"
        :border="false"
      >
        <view class="flex items-center space-x-4">
          <text class="text-sm font-black text-gray-700 whitespace-nowrap uppercase tracking-tighter">Title</text>
          <input 
            type="text" 
            v-model="template.name"
            maxlength="6"
            class="flex-1 px-4 py-2.5 bg-gray-50 border border-solid border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-black text-gray-800 transition-all" 
            placeholder="例如：高碳日"
          />
          <text class="text-[18rpx] text-gray-300 font-black">{{ template.name?.length || 0 }}/6</text>
        </view>
      </GlassCard>

      <!-- 当日目标 -->
      <GlassCard 
        background="#ffffff" 
        card-class="p-5 border-[1rpx] border-solid border-gray-200"
        radius="2xl"
        :border="false"
      >
        <h3 class="text-base font-black text-gray-800 mb-5 flex items-center">
          <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
          当日目标
        </h3>
        <view class="grid grid-cols-4 gap-3">
          <view class="bg-emerald-50 rounded-2xl p-3 text-center border border-solid border-emerald-100/50">
            <text class="text-[18rpx] text-emerald-600 block mb-1 font-black uppercase">Cals</text>
            <text class="text-lg font-black text-emerald-700 block">{{ template.targetCalories }}</text>
            <text class="text-[16rpx] text-emerald-400 block uppercase font-black">kcal</text>
          </view>
          <view class="bg-blue-50 rounded-2xl p-3 text-center border border-solid border-blue-100/50">
            <text class="text-[18rpx] text-blue-600 block mb-1 font-black uppercase">Prot</text>
            <text class="text-lg font-black text-blue-700 block">{{ template.protein }}</text>
            <text class="text-[16rpx] text-blue-400 block uppercase font-black">g</text>
          </view>
          <view class="bg-yellow-50 rounded-2xl p-3 text-center border border-solid border-yellow-100/50">
            <text class="text-[18rpx] text-yellow-600 block mb-1 font-black uppercase">Carb</text>
            <text class="text-lg font-black text-yellow-700 block">{{ template.carbs }}</text>
            <text class="text-[16rpx] text-yellow-400 block uppercase font-black">g</text>
          </view>
          <view class="bg-red-50 rounded-2xl p-3 text-center border border-solid border-red-100/50">
            <text class="text-[18rpx] text-red-600 block mb-1 font-black uppercase">Fat</text>
            <text class="text-lg font-black text-red-700 block">{{ template.fat }}</text>
            <text class="text-[16rpx] text-red-400 block uppercase font-black">g</text>
          </view>
        </view>
      </GlassCard>

      <!-- 当日餐单 -->
      <GlassCard 
        background="#ffffff" 
        card-class="p-5 border-[1rpx] border-solid border-gray-200"
        radius="2xl"
        :border="false"
      >
        <view class="flex items-center justify-between mb-5">
          <h3 class="text-base font-black text-gray-800 flex items-center">
            <view class="w-1 h-4 bg-orange-500 rounded-full mr-2"></view>
            当日餐单
          </h3>
          <text class="text-[18rpx] text-gray-300 font-black uppercase tracking-widest">{{ totalFoods }} items</text>
        </view>
        
        <view class="space-y-4">
          <view 
            v-for="meal in mealOrder" 
            :key="meal"
            class="meal-item bg-white rounded-2xl p-4 border border-solid border-gray-100 shadow-sm active:scale-[0.98] transition-all flex items-center justify-between"
            @tap="goToMealConfig(meal)"
          >
            <view class="flex items-center">
              <view class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mr-4 border border-solid border-gray-100">{{ getMealIcon(meal) }}</view>
              <view>
                <text class="block font-black text-gray-800 text-sm">{{ getMealLabel(meal) }}</text>
                <text :class="['text-xs mt-0.5 font-bold', template.meals[meal]?.length ? 'text-emerald-600' : 'text-gray-300']">
                  {{ template.meals[meal]?.length ? `${template.meals[meal].length} 个食物` : '未配置' }}
                </text>
              </view>
            </view>
            <view class="flex items-center space-x-4">
              <view class="text-right">
                <text class="block text-sm font-black text-gray-800">{{ getMealCalories(meal) }} <text class="text-[18rpx] text-gray-400 ml-0.5 font-bold">KCAL</text></text>
                <view class="flex items-center text-[18rpx] text-gray-400 mt-1 space-x-2 font-black">
                  <text>C {{ getMealMacro(meal, 'carbs') }}</text>
                  <text>P {{ getMealMacro(meal, 'protein') }}</text>
                  <text>F {{ getMealMacro(meal, 'fat') }}</text>
                </view>
              </view>
              <svg class="w-4 h-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </view>
          </view>
        </view>
      </GlassCard>
      
      <view class="h-32 w-full"></view>
    </view>

    <!-- 3. Footer -->
    <view 
      class="bg-white border-t border-gray-200 px-4 pt-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <view class="flex space-x-3 max-w-md mx-auto mb-3">
        <view
          @tap="handleBack"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-black active:bg-gray-200 transition-colors text-center"
        >
          取消
        </view>
        <view
          @tap="handleSave"
          class="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-black active:bg-emerald-700 transition-colors text-center shadow-sm"
        >
          完成并返回
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Taro from "@tarojs/taro";
import BaseNavBar from "@/components/common/BaseNavBar.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import { usePlanStore } from "@/stores/plan";
import { showSuccess } from "@/utils/toast";

const planStore = usePlanStore();
const currentDayIndex = planStore.currentDayIndex;
const template = planStore.draft.templates[currentDayIndex];

const mealOrder = ['breakfast', 'lunch', 'dinner', 'snacks'];

const getMealLabel = (type: string) => {
  const map: any = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snacks: '加餐' };
  return map[type];
};

const getMealIcon = (type: string) => {
  const map: any = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };
  return map[type];
};

const totalFoods = computed(() => {
  return Object.values(template.meals).reduce((acc: number, curr: any) => acc + curr.length, 0);
});

const getMealCalories = (type: string) => {
  const foods = template.meals[type] || [];
  return Math.round(foods.reduce((acc: number, f: any) => acc + (f.calories || 0), 0));
};

const getMealMacro = (type: string, macro: string) => {
  const foods = template.meals[type] || [];
  return Math.round(foods.reduce((acc: number, f: any) => acc + (f[macro] || 0), 0));
};

const goToMealConfig = (mealType: string) => {
  planStore.currentMealType = mealType;
  Taro.navigateTo({ url: '/pages/meal-config/index' });
};

const handleBack = () => Taro.navigateBack();

const handleDelete = () => {
  Taro.showModal({
    title: '确认删除',
    content: '确定要从周期中删除这一天吗？',
    success: (res) => {
      if (res.confirm) {
        planStore.draft.templates.splice(currentDayIndex, 1);
        Taro.navigateBack();
      }
    }
  });
};

const handleSave = () => {
  showSuccess("配置已暂存");
  Taro.navigateBack();
};
</script>

<style scoped>
.edit-template-page {
  min-height: 100vh;
}
.hero-title {
  font-family: 'Noto Serif SC', serif;
}
</style>
