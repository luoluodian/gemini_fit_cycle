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

    <!-- 列表：智能区分虚态(ghost)、草稿(draft)与实态(completed) -->
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
      <view 
        v-if="hasUnrecordedItems"
        class="flex-1 bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-sm font-black text-center active:scale-95" 
        @click="onSyncPlan"
      >
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
    const matchIdx = actualLogs.findIndex(log => 
      log && log.isPlanned && String(log.foodId) === String(pItem.foodId)
    );
    
    if (matchIdx > -1) {
      const log = actualLogs[matchIdx];
      const isRecorded = Number(log.isRecorded) === 1;
      // 🚀 分化：已打卡(completed) 或 已回滚(draft)
      result.push({ 
        ...log, 
        status: isRecorded ? 'completed' : 'draft' 
      });
      actualLogs.splice(matchIdx, 1);
    } else {
      // 物理占位：虚态(ghost)
      result.push({ ...pItem, status: 'ghost' });
    }
  });

  // 2. 处理剩余项 (手动添加项)
  actualLogs.forEach(log => {
    if (log) {
      const isRecorded = Number(log.isRecorded) === 1;
      result.push({ 
        ...log, 
        status: isRecorded ? 'completed' : 'draft' 
      });
    }
  });

  return result;
});

const hasUnrecordedItems = computed(() => {
  return mergedMeals.value.some(m => m.status === 'ghost' || m.status === 'draft');
});

const mealEmojiMap: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snacks: "🍎" };
const mealEmoji = computed(() => mealEmojiMap[props.mealType] || "🍽️");

const totalCalories = computed(() => {
  if (!props.meals) return 0;
  return Math.round(props.meals.reduce((sum, item) => {
    return sum + (item && Number(item.isRecorded) === 1 ? (Number(item.calories) || 0) : 0);
  }, 0));
});

const onAdd = () => emit("add", props.mealType);

const onSyncPlan = async () => {
  try {
    Taro.showLoading({ title: '正在记录...', mask: true });
    const targets = mergedMeals.value.filter(m => m.status === 'ghost' || m.status === 'draft');
    for (const item of targets) {
      if (item.id) {
        await recordStore.updateMealAction(item.id, { isRecorded: true });
      } else {
        await recordStore.addMealLogAction({
          date: props.date,
          mealType: props.mealType,
          foodId: item.foodId,
          quantity: item.quantity,
          isPlanned: true
        });
      }
    }
    Taro.showToast({ title: '记录完成', icon: 'success' });
  } catch (e) {
    console.error("同步失败", e);
  } finally {
    Taro.hideLoading();
  }
};

const handleItemClick = async (item: any) => {
  // 点击灰色项(ghost或draft)触发记录
  if (item.status === 'ghost' || item.status === 'draft') {
    try {
      Taro.showLoading({ title: '记录中...', mask: true });
      if (item.id) {
        await recordStore.updateMealAction(item.id, { isRecorded: true });
      } else {
        await recordStore.addMealLogAction({
          date: props.date,
          mealType: props.mealType,
          foodId: item.foodId,
          quantity: item.quantity,
          isPlanned: true
        });
      }
      Taro.showToast({ title: '记录成功', icon: 'success' });
    } catch (e) {
      Taro.showToast({ title: '记录失败', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  }
};
</script>