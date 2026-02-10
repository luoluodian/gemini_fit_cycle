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

    <!-- 混合列表 (Ghost + Completed + Custom) -->
    <view v-if="mergedMeals.length > 0" class="space-y-1">
      <FoodItemAdapter
        v-for="(item, idx) in mergedMeals"
        :key="item.id || `ghost-${idx}`"
        :food="item"
        :status="item.status"
        @delete="handleDeleteClick"
        @click="handleItemClick"
      />
    </view>

    <!-- 空态展示 -->
    <view v-else class="py-6 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
      <text class="text-xs text-gray-400 font-medium">还没有记录任何食物</text>
    </view>

    <!-- 操作按钮栏 -->
    <view class="flex gap-3 mt-2">
      <view
        class="flex-1 bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-sm font-black text-center active:scale-95 transition-all"
        @click="onSyncPlan"
      >
        按计划同步
      </view>
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
import { useRecordStore } from "@/stores/record";
import { usePlanStore } from "@/stores/plan";
import type { MealLog } from "@/services/modules/record";

interface Props {
  title: string;
  mealType: string;
  meals: MealLog[];
  date: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["add"]);

const recordStore = useRecordStore();
const planStore = usePlanStore();

// --- 核心算法：混合渲染 ---
const mergedMeals = computed(() => {
  const actualLogs = [...props.meals]; // 浅拷贝用于消费
  const template = planStore.getTemplateByDate(props.date);
  const plannedItems = template?.meals?.[props.mealType] || [];
  
  const result: any[] = [];

  // 1. 处理计划项 (分化为 Ghost 或 Completed)
  plannedItems.forEach((pItem: any) => {
    // 匹配算法：查找 ID 相同且来源于计划的记录
    const matchIdx = actualLogs.findIndex(log => log.foodId === pItem.foodId && log.isPlanned);
    
    if (matchIdx > -1) {
      // 命中：状态设为已完成
      result.push({ ...actualLogs[matchIdx], status: 'completed' });
      actualLogs.splice(matchIdx, 1); // 从消费队列移除
    } else {
      // 未命中：状态设为幽灵占位
      result.push({ ...pItem, status: 'ghost' });
    }
  });

  // 2. 处理剩余项 (标记为 Custom)
  actualLogs.forEach(log => {
    result.push({ ...log, status: 'custom' });
  });

  return result;
});

const mealEmojiMap: Record<string, string> = {
  breakfast: "🌅", lunch: "☀️", dinner: "🌙", snacks: "🍎"
};
const mealEmoji = computed(() => mealEmojiMap[props.mealType] || "🍽️");
const totalCalories = computed(() => Math.round(props.meals.reduce((sum, item) => sum + (item.calories || 0), 0)));

const onAdd = () => emit("add", props.mealType);

const onSyncPlan = async () => {
  try {
    Taro.showLoading({ title: '同步中...', mask: true });
    await recordStore.syncFromPlanAction({ date: props.date, mealType: props.mealType });
    Taro.showToast({ title: '同步成功', icon: 'success' });
  } catch (e) {
    Taro.showToast({ title: '计划无预设内容', icon: 'none' });
  } finally {
    Taro.hideLoading();
  }
};

const handleItemClick = (item: any) => {
  if (item.status === 'ghost') {
    // 点击幽灵项引导打卡
    Taro.showActionSheet({
      itemList: ['按推荐量打卡', '手动调整'],
      success: (res) => {
        if (res.tapIndex === 0) {
          recordStore.addMealLogAction({
            date: props.date,
            mealType: props.mealType,
            foodId: item.foodId,
            quantity: item.quantity
          });
        }
      }
    });
  }
};

const handleDeleteClick = (id: number) => {
  Taro.showModal({
    title: '确认删除',
    content: '此操作将无法撤销',
    success: async (res) => {
      if (res.confirm) {
        try {
          Taro.showLoading({ title: '正在删除...', mask: true });
          await recordStore.removeMealAction(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
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