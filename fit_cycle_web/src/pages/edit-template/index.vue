<template>
  <PageLayout 
    v-if="localTemplate" 
    :title="'编辑第 ' + (currentDayIndex + 1) + ' 天'" 
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
          />
        </view>
      </view>
    </template>

    <!-- 2. 中间内容区：当日餐单 (Flex-1 + Scroll) -->
    <view class="flex-1 min-h-0 flex flex-col p-4 animate-fade-in-up delay-200 h-full">
      <PlanDailyMealCard
        :meal-order="mealOrder"
        :meals="localTemplate.meals"
        :show-add-button="planStore.draft.type === 'carb-cycle'"
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
import { ref, computed, onMounted } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import PageLayout from "@/components/common/PageLayout.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import NutritionProgress from "@/components/plan-creator/NutritionProgress.vue";
import PlanDailyMealCard from "@/components/plan-creator/PlanDailyMealCard.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { usePlanStore } from "@/stores/plan";
import { showSuccess, showError } from "@/utils/toast";

const planStore = usePlanStore();
const currentDayIndex = planStore.currentDayIndex;

// 使用本地副本
const localTemplate = ref<any>(null);
const mealOrder = ref(['breakfast', 'lunch', 'dinner', 'snacks']);

onMounted(() => {
  initLocalTemplate();
});

useDidShow(() => {
  if (localTemplate.value) {
    const source = planStore.draft.templates[currentDayIndex];
    if (source) {
      localTemplate.value.meals = JSON.parse(JSON.stringify(source.meals));
    }
  }
});

const initLocalTemplate = () => {
  const source = planStore.draft.templates[currentDayIndex];
  if (source) {
    localTemplate.value = JSON.parse(JSON.stringify(source));
    if (source.mealOrder) {
      mealOrder.value = source.mealOrder;
    }
  } else {
    showError("未找到模板数据");
    Taro.navigateBack();
  }
};

const getMealLabel = (type: string) => {
  const map: any = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snacks: '加餐' };
  // 优先从固定映射找，找不到则看是否是自定义标签
  return map[type] || localTemplate.value?.customLabels?.[type] || '自定义餐次';
};

const getMealIcon = (type: string) => {
  const map: any = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };
  return map[type] || '🍽️';
};

const targetNutrition = computed(() => ({
  calories: localTemplate.value?.targetCalories || 0,
  protein: localTemplate.value?.protein || 0,
  carbs: localTemplate.value?.carbs || 0,
  fat: localTemplate.value?.fat || 0,
}));

const currentNutrition = computed(() => {
  const total = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  if (!localTemplate.value) return total;

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

const goToMealConfig = (mealType: string) => {
  planStore.updateTemplate(currentDayIndex, localTemplate.value);
  planStore.currentMealType = mealType;
  Taro.navigateTo({ url: '/pages/meal-config/index' });
};

const handleDeleteFood = (mealType: string, index: number) => {
  if (localTemplate.value.meals[mealType]) {
    localTemplate.value.meals[mealType].splice(index, 1);
  }
};

const handleBack = () => Taro.navigateBack();

const handleMealMenu = (mealType: string) => {
  const label = getMealLabel(mealType);
  const index = mealOrder.value.indexOf(mealType);
  
  const options = ['删除本餐次', '上移', '下移', '清空食材'];
  
  Taro.showActionSheet({
    itemList: options,
    confirmColor: '#10b981',
    success: (res) => {
      switch (res.tapIndex) {
        case 0: // 删除
          handleDeleteMeal(mealType);
          break;
        case 1: // 上移
          if (index > 0) {
            const arr = [...mealOrder.value];
            [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
            mealOrder.value = arr;
          } else {
            Taro.showToast({ title: '已经是第一项了', icon: 'none' });
          }
          break;
        case 2: // 下移
          if (index < mealOrder.value.length - 1) {
            const arr = [...mealOrder.value];
            [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
            mealOrder.value = arr;
          } else {
            Taro.showToast({ title: '已经是最后一项了', icon: 'none' });
          }
          break;
        case 3: // 清空
          localTemplate.value.meals[mealType] = [];
          break;
      }
    }
  });
};

const handleDeleteMeal = (mealType: string) => {
  const label = getMealLabel(mealType);
  Taro.showModal({
    title: '确认删除',
    content: `确定要删除"${label}"餐次吗？`,
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        mealOrder.value = mealOrder.value.filter(m => m !== mealType);
        // 如果需要，也可以从 localTemplate.meals 中删除键值对
      }
    }
  });
};

// 弹出操作菜单
const handleShowMenu = () => {
  Taro.showActionSheet({
    itemList: ['复制此天', '删除此天'],
    confirmColor: '#10b981',
    success: (res) => {
      if (res.tapIndex === 0) {
        // 复制逻辑
        planStore.copyTemplate(currentDayIndex);
        showSuccess("已复制到周期末尾");
      } else if (res.tapIndex === 1) {
        // 删除逻辑
        handleDelete();
      }
    }
  });
};

const handleDelete = () => {
  Taro.showModal({
    title: '确认删除',
    content: '确定要从周期中删除这一天吗？',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        planStore.deleteTemplate(currentDayIndex);
        Taro.navigateBack();
      }
    }
  });
};

const handleSave = () => {
  if (localTemplate.value.name) {
    localTemplate.value.name = localTemplate.value.name.substring(0, 6);
  }
  
  // 同步所有元数据（名称、餐次顺序、自定义标签、食材）
  planStore.updateTemplate(currentDayIndex, {
    ...localTemplate.value,
    mealOrder: mealOrder.value,
    isConfigured: true
  });
  
  showSuccess("配置已保存");
  setTimeout(() => Taro.navigateBack(), 800);
};

const showAddMealModal = ref(false);
const newMealName = ref("");

const handleShowAddMeal = () => {
  newMealName.value = "";
  showAddMealModal.value = true;
};

const confirmAddMeal = () => {
  const name = newMealName.value.trim();
  if (!name) {
    showError("请输入餐次名称");
    return;
  }
  
  // 生成唯一键名
  const mealKey = `custom_${Date.now()}`;
  
  // 1. 初始化数据结构
  localTemplate.value.meals[mealKey] = [];
  
  // 2. 更新顺序列表
  mealOrder.value.push(mealKey);
  
  // 3. 注册名称映射（用于 getMealLabel）
  if (!localTemplate.value.customLabels) {
    localTemplate.value.customLabels = {};
  }
  localTemplate.value.customLabels[mealKey] = name;

  showAddMealModal.value = false;
  showSuccess("餐次已添加");
};
</script>

<style scoped lang="scss">
.hero-title {
  font-family: 'Noto Serif SC', serif;
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
