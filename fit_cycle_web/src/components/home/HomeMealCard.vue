<template>
  <view class="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-solid border-gray-100">
    <!-- 头部：标题与汇总 -->
    <view class="flex items-center justify-between mb-4">
      <view class="flex items-center gap-2">
        <text class="text-xl">{{ mealEmoji }}</text>
        <text class="font-black text-gray-800">{{ title }}</text>
      </view>
      <view class="bg-gray-50 px-2 py-1 rounded-lg">
        <text class="text-sm font-black text-gray-800">{{ totalCalories }}</text>
        <text class="text-[20rpx] text-gray-400 ml-0.5">kcal</text>
      </view>
    </view>

    <!-- 食物列表 -->
    <view v-if="meals && meals.length > 0" class="space-y-1">
      <FoodItemAdapter
        v-for="item in meals"
        :key="item.id"
        :food="item"
        @delete="handleDeleteClick"
      />
    </view>

    <!-- 空态展示 -->
    <view v-else class="py-6 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
      <text class="text-xs text-gray-400 font-medium">还没有记录任何食物</text>
    </view>

    <!-- 操作按钮栏 -->
    <view class="flex gap-3 mt-2">
      <!-- R-6: 快捷添加入口 -->
      <view
        class="flex-1 bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-sm font-black text-center active:scale-95 transition-all"
        @click="onSyncPlan"
      >
        按计划记录
      </view>
      
      <!-- R-3: 手动添加入口 -->
      <view
        class="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-sm font-black text-center active:scale-95 transition-all border border-solid border-gray-100"
        @click="onAdd"
      >
        + 添加食物
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Taro from "@tarojs/taro";
import FoodItemAdapter from "./FoodItemAdapter.vue";
import { removeMealLog, syncMealFromPlan, type MealLog } from "@/services/modules/record";

interface Props {
  title: string;
  mealType: string;
  meals: MealLog[];
  date: string; // 由父组件透传 YYYY-MM-DD
}

const props = defineProps<Props>();
const emit = defineEmits(["add", "refresh"]);

const mealEmojiMap: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snacks: "🍎",
};

const mealEmoji = computed(() => mealEmojiMap[props.mealType] || "🍽️");

const totalCalories = computed(() => {
  return Math.round(props.meals.reduce((sum, item) => sum + (item.calories || 0), 0));
});

const onAdd = () => {
  emit("add", props.mealType);
};

/**
 * R-6: 按计划同步打卡逻辑
 */
const onSyncPlan = async () => {
  try {
    Taro.showLoading({ title: '同步中...' });
    const newLogs = await syncMealFromPlan({
      date: props.date,
      mealType: props.mealType
    });
    
    if (newLogs && newLogs.length > 0) {
      Taro.showToast({ title: `已同步 ${newLogs.length} 项`, icon: 'success' });
      emit("refresh");
    } else {
      Taro.showToast({ title: '计划中该餐次无内容', icon: 'none' });
    }
  } catch (e) {
    Taro.showToast({ title: '同步失败', icon: 'none' });
  } finally {
    Taro.hideLoading();
  }
};

const handleDeleteClick = (id: number) => {
  Taro.showModal({
    title: '提示',
    content: '确定要删除这条饮食记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          Taro.showLoading({ title: '正在删除' });
          await removeMealLog(id);
          emit("refresh");
        } catch (e) {
          Taro.showToast({ title: '删除失败', icon: 'none' });
        } finally {
          Taro.hideLoading();
        }
      }
    }
  });
};
</script>

<style scoped lang="scss">
.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
