<template>
  <PageLayout
    v-if="foods"
    :title="mealLabel + '食材配置'"
    :use-scroll-view="false"
  >
    <!-- 1. 顶部固定区：营养汇总 (Sticky) -->
    <template #fixed-top>
      <view class="px-4 pt-4">
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
            <view
              class="bg-emerald-50/50 rounded-xl p-2 border border-solid border-emerald-100"
            >
              <text
                class="text-[16rpx] text-emerald-600 block mb-0.5 font-black"
                >热量</text
              >
              <text class="text-base font-black text-emerald-700 block">{{
                Math.round(totalStats.calories)
              }}</text>
              <text class="text-[14rpx] text-emerald-400 font-bold">kcal</text>
            </view>
            <view
              class="bg-blue-50/50 rounded-xl p-2 border border-solid border-blue-100"
            >
              <text class="text-[16rpx] text-blue-600 block mb-0.5 font-black"
                >蛋白</text
              >
              <text class="text-base font-black text-blue-700 block">{{
                totalStats.protein.toFixed(1)
              }}</text>
              <text class="text-[14rpx] text-blue-400 font-bold">g</text>
            </view>
            <view
              class="bg-yellow-50/50 rounded-xl p-2 border border-solid border-yellow-100"
            >
              <text class="text-[16rpx] text-yellow-600 block mb-0.5 font-black"
                >碳水</text
              >
              <text class="text-base font-black text-yellow-700 block">{{
                totalStats.carbs.toFixed(1)
              }}</text>
              <text class="text-[14rpx] text-yellow-400 font-bold">g</text>
            </view>
            <view
              class="bg-red-50/50 rounded-xl p-2 border border-solid border-red-100"
            >
              <text class="text-[16rpx] text-red-600 block mb-0.5 font-black"
                >脂肪</text
              >
              <text class="text-base font-black text-red-700 block">{{
                totalStats.fat.toFixed(1)
              }}</text>
              <text class="text-[14rpx] text-red-400 font-bold">g</text>
            </view>
          </view>
        </GlassCard>
      </view>
    </template>

    <!-- 2. 中间内容区：食物列表 (Flex-1 + Scroll) -->
    <view
      class="flex-1 min-h-0 flex flex-col px-4 pt-3 pb-4 overflow-hidden h-full"
    >
      <GlassCard
        background="#ffffff"
        card-class="p-4 shadow-sm border-[1rpx] border-solid border-gray-200 flex-1 flex flex-col min-h-0 h-full"
        radius="xl"
        :border="false"
      >
        <view class="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 class="text-sm font-black text-gray-800 flex items-center">
            <view class="w-1.5 h-3.5 bg-orange-500 rounded-full mr-2"></view>
            已选食材清单
          </h3>
          <text
            class="text-[18rpx] text-gray-300 font-black uppercase tracking-widest"
            >{{ foods.length }} 个食物</text
          >
        </view>

        <BaseScrollView
          flex
          scroll-view-class="flex-1 min-h-0"
          content-class="pb-4"
        >
          <!-- 1. 列表有内容时的展示模式 -->
          <template v-if="foods.length > 0">
            <view class="space-y-1">
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

            <!-- 列表末尾的“追加”按钮 (长条形) -->
            <view
              class="w-full py-3 border-[1rpx] border-dashed border-emerald-100 bg-emerald-50/10 rounded-xl flex items-center justify-center active:bg-emerald-50 transition-all mt-3"
              @click="openFoodSelector"
            >
              <text class="text-[20rpx] font-black text-emerald-600/60"
                >+ 继续添加食材</text
              >
            </view>
          </template>

          <!-- 2. 列表为空时的展示模式 (正方形占位符) -->
          <view v-else class="flex flex-col items-center pt-10">
            <view
              class="w-32 h-32 border-2 border-dashed border-gray-100 bg-gray-50/30 rounded-2xl flex flex-col items-center justify-center active:scale-95 active:bg-emerald-50/20 active:border-emerald-200 transition-all"
              @click="openFoodSelector"
            >
              <text class="text-4xl text-gray-200 font-light mb-2">+</text>
              <text
                class="text-[20rpx] font-black text-gray-300 uppercase tracking-widest"
                >添加食材</text
              >
            </view>
          </view>
        </BaseScrollView>
      </GlassCard>
    </view>

    <!-- 3. 底部操作区 (精简为单按钮) -->
    <template #footer>
      <view
        @click="handleBack"
        class="w-full bg-gray-800 text-white py-3.5 rounded-xl font-black active:bg-black transition-colors text-center shadow-sm text-sm tracking-widest"
      >
        完成配置并返回
      </view>
    </template>

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
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Taro from "@tarojs/taro";
import { usePlanStore } from "@/stores/plan";
import PageLayout from "@/components/common/PageLayout.vue";
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
  // 优先从 templates[0] 获取（对应单日编辑模式的桥接数据）
  let template = planStore.templates[0];

  // 如果 templates[0] 不存在，则回退到 draft.templates（对应新建计划流程）
  if (!template) {
    template = planStore.draft.templates[currentDayIndex];
  }

  if (!template || !template.meals) return [];
  if (!template.meals[currentMealType]) {
    template.meals[currentMealType] = [];
  }
  return template.meals[currentMealType];
});

const mealLabel = computed(() => {
  const map: any = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snacks: "加餐",
  };

  // 同样处理模板引用逻辑
  const template =
    planStore.templates[0] || planStore.draft.templates[currentDayIndex];

  // 兼容自定义餐次名
  if (template?.customLabels?.[currentMealType]) {
    return template.customLabels[currentMealType];
  }
  return map[currentMealType] || currentMealType;
});

const totalStats = computed(() => {
  return foods.value.reduce(
    (acc: any, f: any) => ({
      calories: acc.calories + (f.calories || 0),
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fat: acc.fat + (f.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
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
  const baseCount = food.baseCount || 100;
  const ratio = quantity / baseCount;

  foods.value.push({
    ...food,
    quantity,
    // 存储一份原始营养基准，用于后续精确计算，防止反复修改带来的误差
    reference: {
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      baseCount: baseCount,
    },
    calories: Math.round(food.calories * ratio),
    protein: Math.round(food.protein * ratio * 10) / 10,
    carbs: Math.round(food.carbs * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
  });
};

const handleEditItem = (index: number) => {
  const item = foods.value[index];
  if (!item) return;

  editingIndex.value = index;
  // 传入带有原始基准数据的对象给弹窗
  editingFood.value = {
    ...item,
    // 还原为基准营养值供弹窗显示和计算
    calories: item.reference?.calories ?? item.calories,
    protein: item.reference?.protein ?? item.protein,
    carbs: item.reference?.carbs ?? item.carbs,
    fat: item.reference?.fat ?? item.fat,
    baseCount: item.reference?.baseCount ?? item.baseCount,
  };
  editingQuantity.value = item.quantity;
  editModalVisible.value = true;
};

const closeEditModal = () => {
  editModalVisible.value = false;
  editingFood.value = null;
  editingIndex.value = -1;
};

const handleUpdateItem = (result: { food: any; quantity: number }) => {
  const { quantity } = result;
  const index = editingIndex.value;
  if (index === -1) return;

  const currentItem = foods.value[index];
  // 始终基于原始 reference 进行计算，杜绝误差累加
  const ref = currentItem.reference || {
    calories: currentItem.calories,
    protein: currentItem.protein,
    carbs: currentItem.carbs,
    fat: currentItem.fat,
    baseCount: currentItem.baseCount || 100,
  };

  const ratio = quantity / (ref.baseCount || 100);

  const updatedItem = {
    ...currentItem,
    quantity,
    calories: Math.round(ref.calories * ratio),
    protein: Math.round(ref.protein * ratio * 10) / 10,
    carbs: Math.round(ref.carbs * ratio * 10) / 10,
    fat: Math.round(ref.fat * ratio * 10) / 10,
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

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
</style>
