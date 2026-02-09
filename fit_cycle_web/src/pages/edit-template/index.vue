<template>
  <PageLayout 
    v-if="localTemplate" 
    :title="'编辑第 ' + (localTemplate.dayNumber || '-') + ' 天'" 
    :use-scroll-view="false"
  >
    <template #nav-right>
      <view 
        @tap="handleShowMenu" 
        class="w-10 h-10 flex items-center justify-center rounded-xl active:bg-black/5 transition-colors"
      >
        <view class="flex flex-col space-y-0.5 items-center">
          <view class="w-1 h-1 rounded-full bg-gray-400"></view>
          <view class="w-1 h-1 rounded-full bg-gray-400"></view>
          <view class="w-1 h-1 rounded-full bg-gray-400"></view>
        </view>
      </view>
    </template>

    <!-- 1. 顶部固定扩展区 (Sticky) -->
    <template #fixed-top>
      <view class="px-4 pt-4 space-y-2">
        <!-- 模板名称 -->
        <view class="animate-fade-in-up">
          <GlassCard 
            background="#ffffff" 
            card-class="p-4 border-[1rpx] border-solid border-gray-200 shadow-sm"
            radius="xl"
            :border="false"
          >
            <view class="flex items-center">
              <view class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mr-3 flex-shrink-0">
                <text class="text-lg">🏷️</text>
              </view>
              <view class="flex-1 min-w-0 relative">
                <text class="text-[20rpx] font-black text-gray-400 block mb-0.5 tracking-widest uppercase">模板名称</text>
                <input 
                  type="text" 
                  v-model="localTemplate.name"
                  maxlength="6"
                  class="w-full py-1 text-base font-black text-gray-800 transition-all border-b-[1rpx] border-solid border-transparent focus:border-emerald-500" 
                  placeholder="例如：练腿日"
                  placeholder-class="text-gray-300 font-bold"
                />
              </view>
              <view class="ml-4 flex flex-col items-center justify-center bg-gray-50 px-2 py-1 rounded-lg border border-solid border-gray-100">
                <text class="text-[18rpx] text-gray-400 font-black leading-none">{{ localTemplate.name?.length || 0 }}</text>
                <view class="w-3 h-[2rpx] bg-gray-200 my-0.5"></view>
                <text class="text-[16rpx] text-gray-300 font-black leading-none">6</text>
              </view>
            </view>
          </GlassCard>
        </view>

        <!-- 营养进度对比 -->
        <view class="animate-fade-in-up delay-100">
          <NutritionProgress 
            :target="targetNutrition"
            :current="currentNutrition"
            :carb-type="localTemplate.carbType"
            :is-carb-cycle="isCarbCycle"
          />
        </view>
      </view>
    </template>

    <!-- 2. 中间内容区：当日餐单 (Flex-1 + Scroll) -->
    <view class="flex-1 min-h-0 flex flex-col p-4 animate-fade-in-up delay-200 h-full">
      <PlanDailyMealCard
        :meal-order="mealOrder"
        :meals="localTemplate.meals"
        :show-add-button="isCarbCycle"
        :flex="true"
        @edit-meal="goToMealConfig"
        @delete-food="handleDeleteFood"
        @add-meal="handleShowAddMeal"
        @meal-menu="handleMealMenu"
      />
    </view>

    <!-- 3. 底部操作区 -->
    <template #footer>
      <view class="flex space-x-3">
        <view
          @tap="handleBack"
          class="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-black active:bg-gray-200 transition-colors text-center"
        >
          取消
        </view>
        <view
          @tap="handleSave"
          class="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black active:bg-emerald-700 transition-colors text-center shadow-sm"
        >
          保存配置
        </view>
      </view>
    </template>

    <!-- 弹窗：添加自定义餐次 -->
    <BaseModal
      :visible="showAddMealModal"
      title="新增餐次"
      @close="showAddMealModal = false"
    >
      <view class="p-4">
        <view class="mb-6">
          <text class="text-xs font-black text-gray-400 block mb-2">餐次名称</text>
          <input 
            type="text" 
            v-model="newMealName"
            maxlength="10"
            class="w-full h-12 px-4 bg-gray-50 border border-solid border-gray-100 rounded-xl text-base font-black text-gray-800" 
            placeholder="例如：训练后补充、夜宵"
            focus
          />
        </view>
        <view class="flex space-x-3">
          <view @tap="showAddMealModal = false" class="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-center text-sm">取消</view>
          <view @tap="confirmAddMeal" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-center text-sm shadow-md">确认添加</view>
        </view>
      </view>
    </BaseModal>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import PageLayout from "@/components/common/PageLayout.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import NutritionProgress from "@/components/plan-creator/NutritionProgress.vue";
import PlanDailyMealCard from "@/components/plan-creator/PlanDailyMealCard.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";

const planStore = usePlanStore();
const router = useRouter();
const dayId = Number(router.params.dayId);
const planId = Number(router.params.planId);

// 使用本地副本
const localTemplate = ref<any>(null);
const mealOrder = ref(['breakfast', 'lunch', 'dinner', 'snacks']);

// --- 1. 本地缓存防丢逻辑 (V7 Auto-save) ---
const CACHE_KEY = computed(() => `draft_day_${dayId}`);
const CACHE_VERSION = 'v1.0';

const saveToCache = (data: any) => {
  if (!dayId) return;
  const cacheObj = {
    version: CACHE_VERSION,
    timestamp: Date.now(),
    planId,
    data: JSON.parse(JSON.stringify(data)),
    mealOrder: mealOrder.value
  };
  Taro.setStorage({ key: CACHE_KEY.value, data: cacheObj });
};

const loadFromCache = () => {
  try {
    const cached: any = Taro.getStorageSync(CACHE_KEY.value);
    if (cached && cached.version === CACHE_VERSION) {
      if (Date.now() - cached.timestamp < 24 * 3600 * 1000 && cached.planId === planId) {
        return cached;
      }
    }
  } catch (e) {}
  return null;
};

const clearCache = () => {
  Taro.removeStorage({ key: CACHE_KEY.value });
};

// 监听数据变化实时同步缓存
watch([localTemplate, mealOrder], () => {
  if (localTemplate.value) saveToCache(localTemplate.value);
}, { deep: true });

// --- 2. 数据初始化与加载 ---
onMounted(() => {
  initData();
});

const initData = async () => {
  // A. 优先检查缓存
  const cached = loadFromCache();
  if (cached) {
    const res = await Taro.showModal({
      title: '恢复进度',
      content: '检测到您有上次未保存的编辑内容，是否恢复？',
      confirmText: '恢复',
      cancelText: '丢弃',
      confirmColor: '#10b981'
    });
    if (res.confirm) {
      localTemplate.value = cached.data;
      mealOrder.value = cached.mealOrder;
      return;
    } else {
      clearCache();
    }
  }

  // B. 拉取最新数据
  if (dayId) {
    await fetchDetail();
  }
};

const fetchDetail = async () => {
  try {
    showLoading("加载详情...");
    const res: any = await planService.getDayDetail(dayId);
    const dayData = res.data || res;
    
    // 结构适配：后端数组 -> 前端 UI 对象
    const mealsObj: any = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    const order: string[] = [];
    
    if (dayData.planMeals) {
      dayData.planMeals.forEach((m: any) => {
        const typeMap: any = { 1: 'breakfast', 2: 'lunch', 3: 'dinner', 4: 'snacks' };
        const key = typeMap[m.mealType?.id] || `custom_${m.id}`;
        order.push(key);
        mealsObj[key] = m.mealItems?.map((mi: any) => ({
          name: mi.customName,
          quantity: mi.quantity,
          unit: mi.unit,
          calories: mi.calories,
          protein: mi.protein,
          fat: mi.fat,
          carbs: mi.carbs
        })) || [];
      });
    }

    localTemplate.value = { ...dayData, meals: mealsObj };
    if (order.length > 0) mealOrder.value = order;
  } catch (e) {
    showError("加载失败");
  } finally {
    hideToast();
  }
};

// --- 3. 交互逻辑 ---
const isCarbCycle = computed(() => {
  return localTemplate.value?.plan?.type === 'carb-cycle';
});

// 处理从 meal-config 返回的数据同步
useDidShow(() => {
  if (planStore.currentMealType && planStore.templates[0]?.meals) {
    const mealType = planStore.currentMealType;
    const updatedFoods = planStore.templates[0].meals[mealType];
    if (updatedFoods && localTemplate.value) {
      localTemplate.value.meals[mealType] = [...updatedFoods];
      saveToCache(localTemplate.value);
    }
    planStore.currentMealType = "";
  }
});

const targetNutrition = computed(() => ({
  calories: localTemplate.value?.targetCalories || 0,
  protein: localTemplate.value?.targetProtein || 0,
  carbs: localTemplate.value?.targetCarbs || 0,
  fat: localTemplate.value?.targetFat || 0,
}));

const currentNutrition = computed(() => {
  const total = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  if (!localTemplate.value?.meals) return total;
  Object.values(localTemplate.value.meals).forEach((foods: any) => {
    foods.forEach((f: any) => {
      total.calories += (f.calories || 0);
      total.protein += (f.protein || 0);
      total.fat += (f.fat || 0);
      total.carbs += (f.carbs || 0);
    });
  });
  return total;
});

const getMealLabel = (type: string) => {
  const map: any = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snacks: '加餐' };
  return map[type] || localTemplate.value?.customLabels?.[type] || '自定义餐次';
};

const goToMealConfig = (mealType: string) => {
  // 构建桥接数据，兼容 meal-config 的 store 依赖
  const tempTemplate = {
    ...localTemplate.value,
    meals: JSON.parse(JSON.stringify(localTemplate.value.meals))
  };
  planStore.templates = [tempTemplate]; 
  planStore.currentMealType = mealType;
  Taro.navigateTo({ url: '/pages/meal-config/index' });
};

const handleDeleteFood = (mealType: string, index: number) => {
  if (localTemplate.value.meals[mealType]) {
    localTemplate.value.meals[mealType].splice(index, 1);
  }
};

const handleBack = () => {
  Taro.showModal({
    title: '退出编辑',
    content: '有未保存的修改，退出将丢弃本次编辑内容（下次进入可恢复），确定吗？',
    success: (res) => { if (res.confirm) Taro.navigateBack(); }
  });
};

const handleSave = async () => {
  try {
    showLoading("正在保存...");
    const typeIdMap: any = { breakfast: 1, lunch: 2, dinner: 3, snacks: 4 };
    const mealsDto = mealOrder.value.map(key => ({
      mealTypeId: typeIdMap[key] || 4,
      items: (localTemplate.value.meals[key] || []).map((f: any) => ({
        customName: f.name,
        quantity: f.quantity,
        unit: f.unit,
        calories: f.calories,
        protein: f.protein,
        fat: f.fat,
        carbs: f.carbs
      }))
    }));

    await planService.updateDayFull(dayId, {
      isConfigured: true,
      meals: mealsDto
    });

    clearCache();
    showSuccess("配置已保存");
    setTimeout(() => Taro.navigateBack(), 800);
  } catch (e: any) {
    showError(e.message || "保存失败");
  } finally {
    hideToast();
  }
};

// 菜单、删除等逻辑 (略，保持原有功能)
const handleShowMenu = () => {
  Taro.showActionSheet({
    itemList: ['放弃修改'],
    success: (res) => { if (res.tapIndex === 0) { clearCache(); Taro.navigateBack(); } }
  });
};

const handleMealMenu = (mealType: string) => {
  const options = ['清空食材'];
  Taro.showActionSheet({
    itemList: options,
    success: (res) => { if (res.tapIndex === 0) localTemplate.value.meals[mealType] = []; }
  });
};

const showAddMealModal = ref(false);
const newMealName = ref("");
const handleShowAddMeal = () => { newMealName.value = ""; showAddMealModal.value = true; };
const confirmAddMeal = () => {
  const name = newMealName.value.trim();
  if (!name) return;
  const mealKey = `custom_${Date.now()}`;
  localTemplate.value.meals[mealKey] = [];
  mealOrder.value.push(mealKey);
  if (!localTemplate.value.customLabels) localTemplate.value.customLabels = {};
  localTemplate.value.customLabels[mealKey] = name;
  showAddMealModal.value = false;
};
</script>

<style scoped lang="scss">
.hero-title { font-family: 'Noto Serif SC', serif; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
</style>