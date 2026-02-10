<template>
  <view class="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-solid border-gray-100">
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

    <!-- 混合列表：基于 isRecorded 驱动视觉状态 -->
    <view v-if="mergedMeals.length > 0" class="space-y-1">
      <FoodItemAdapter
        v-for="(item, idx) in mergedMeals"
        :key="item.id || `ghost-${idx}`"
        :food="item"
        :status="item.status"
        @delete="(f) => $emit('delete', f)"
        @edit="(f) => $emit('edit', f)"
        @click="handleItemClick"
      />
    </view>

    <view v-else class="py-6 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
      <text class="text-xs text-gray-400 font-medium">还没有记录任何食物</text>
    </view>

    <view class="flex gap-3 mt-2">
      <view class="flex-1 bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-sm font-black text-center active:scale-95" @click="onSyncPlan">
        全部记录
      </view>
      <view class="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-sm font-black text-center active:scale-95 border border-solid border-gray-100" @click="onAdd">
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

interface Props {
  title: string;
  mealType: string;
  meals: any[];
  date: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["add", "edit", "delete"]);

const recordStore = useRecordStore();
const planStore = usePlanStore();

const mergedMeals = computed(() => {
  const actualLogs = props.meals ? [...props.meals] : [];
  const template = planStore.getTemplateByDate(props.date);
  const plannedItems = template?.meals?.[props.mealType] || [];
  const result: any[] = [];

  // 1. 处理计划项
  plannedItems.forEach((pItem: any) => {
    if (!pItem) return;
    // 匹配规则：找到 foodId 匹配 且 处于“已记录(isRecorded)”状态的计划项
    const matchIdx = actualLogs.findIndex(log => 
      log && log.isRecorded && log.isPlanned && String(log.foodId) === String(pItem.foodId)
    );
    
    if (matchIdx > -1) {
      // 命中且已打卡：显示淡绿色
      result.push({ ...actualLogs[matchIdx], status: 'completed' });
      actualLogs.splice(matchIdx, 1);
    } else {
      // 未命中或未打卡：显示灰色建议
      result.push({ ...pItem, status: 'ghost' });
    }
  });

  // 2. 处理剩余记录 (包括手动添加项 和 被修改后回滚为未记录的项)
  actualLogs.forEach(log => {
    if (log) {
      // 核心业务：只有 isRecorded 为 true 才是淡绿色，否则统统变灰
      result.push({ 
        ...log, 
        status: log.isRecorded ? 'completed' : 'ghost' 
      });
    }
  });

  return result;
});

const mealEmojiMap: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snacks: "🍎" };
const mealEmoji = computed(() => mealEmojiMap[props.mealType] || "🍽️");
// 仅统计 isRecorded 的热量
const totalCalories = computed(() => {
  if (!props.meals) return 0;
  return Math.round(props.meals.reduce((sum, item) => {
    return sum + (item && item.isRecorded ? (Number(item.calories) || 0) : 0);
  }, 0));
});

const onAdd = () => emit("add", props.mealType);

const onSyncPlan = async () => {
  try {
    Taro.showLoading({ title: '记录中...', mask: true });
    await recordStore.syncFromPlanAction({ date: props.date, mealType: props.mealType });
    Taro.showToast({ title: '同步成功', icon: 'success' });
  } catch (e) {
    Taro.showToast({ title: '当前餐次无计划内容', icon: 'none' });
  } finally {
    Taro.hideLoading();
  }
};

const handleItemClick = (item: any) => {
  // 无论是 ghost 占位还是被回滚的记录，点击都触发“记录/打卡”动作
  if (item.status === 'ghost') {
    // 如果是已有 ID 的回滚项，直接更新 isRecorded
    if (item.id) {
      recordStore.updateMealAction(item.id, { isRecorded: true, quantity: item.quantity });
    } else {
      recordStore.addMealLogAction({
        date: props.date,
        mealType: props.mealType,
        foodId: item.foodId,
        quantity: item.quantity
      });
    }
  }
};
</script>