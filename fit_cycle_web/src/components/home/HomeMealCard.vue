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
        按计划同步
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

  plannedItems.forEach((pItem: any) => {
    if (!pItem) return;
    const matchIdx = actualLogs.findIndex(log => log && String(log.foodId) === String(pItem.foodId) && log.isPlanned);
    if (matchIdx > -1) {
      result.push({ ...actualLogs[matchIdx], status: 'completed' });
      actualLogs.splice(matchIdx, 1);
    } else {
      result.push({ ...pItem, status: 'ghost' });
    }
  });

  actualLogs.forEach(log => {
    result.push({ ...log, status: 'custom' });
  });

  return result;
});

const mealEmojiMap: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snacks: "🍎" };
const mealEmoji = computed(() => mealEmojiMap[props.mealType] || "🍽️");
const totalCalories = computed(() => {
  if (!props.meals) return 0;
  return Math.round(props.meals.reduce((sum, item) => {
    return sum + (item && item.calories ? Number(item.calories) : 0);
  }, 0));
});

const onAdd = () => emit("add", props.mealType);

const onSyncPlan = async () => {
  try {
    Taro.showLoading({ title: '同步中...', mask: true });
    await recordStore.syncFromPlanAction({ date: props.date, mealType: props.mealType });
    Taro.showToast({ title: '同步成功', icon: 'success' });
  } catch (e) {
    Taro.showToast({ title: '计划暂无内容', icon: 'none' });
  } finally {
    Taro.hideLoading();
  }
};

const handleItemClick = (item: any) => {
  if (item.status === 'ghost') {
    recordStore.addMealLogAction({
      date: props.date,
      mealType: props.mealType,
      foodId: item.foodId,
      quantity: item.quantity
    });
  }
};
</script>
