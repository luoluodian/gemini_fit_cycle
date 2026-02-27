<template>
  <GlassCard card-class="mb-4">
    <view class="flex items-center justify-between mb-4">
      <view class="flex items-center gap-2">
        <text class="text-xl">{{ mealEmoji }}</text>
        <text class="font-black text-gray-800 text-base">{{ title }}</text>
      </view>
      <view class="bg-gray-50 px-2 py-1 rounded-lg border border-solid border-gray-100">
        <text class="text-sm font-black text-emerald-600">{{ totalCalories }}</text>
        <text class="text-[20rpx] text-gray-400 ml-0.5 font-bold">{{ displayUnit('kcal') }}</text>
      </view>
    </view>

    <!-- 列表：智能区分虚态(ghost)、草稿(draft)与实态(completed) -->
    <view v-if="mergedMeals.length > 0" class="space-y-1">
      <FoodItemCard
        v-for="(item, idx) in mergedMeals"
        :key="item.id || `ghost-${idx}`"
        :food="item"
        :status="item.status"
        is-snapshot
        :show-delete="item.status !== 'ghost'"
        :show-edit="item.status !== 'ghost'"
        @delete="(f) => $emit('delete', f)"
        @edit="(f) => $emit('edit', f)"
        @click="handleItemClick"
      />
    </view>

    <view v-else class="py-10 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mb-4">
      <view class="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
        <text class="text-2xl opacity-30">🥣</text>
      </view>
      <text class="text-xs text-gray-400 font-bold">还没有记录任何食物</text>
    </view>

    <view class="flex gap-3 mt-2">
      <view 
        v-if="hasUnrecordedItems"
        class="flex-1 bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-sm font-black text-center active:scale-95 shadow-sm shadow-emerald-100" 
        @click="onSyncPlan"
      >
        一键记录
      </view>
      <view class="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-sm font-black text-center active:scale-95 border border-solid border-gray-100 shadow-sm" @click="onAdd">
        + 添加食物
      </view>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Taro from "@tarojs/taro";
import FoodItemCard from "@/components/food/FoodItemCard.vue";
import { useRecordStore } from "@/stores/record";
import { usePlanStore } from "@/stores/plan";
import { displayUnit } from "@/utils";

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
  const template = recordStore.plannedDay; // 🚀 优先使用 recordStore 中的当日模板
  
  let plannedItems: any[] = [];
  if (template?.planMeals) {
    // 映射餐次类型 (兼容后端结构)
    const meal = template.planMeals.find((m: any) => {
      const typeCode = m.mealType?.code || m.mealType;
      return typeCode === props.mealType;
    });
    plannedItems = meal?.mealItems || [];
  } else if (template?.meals) {
    plannedItems = template.meals[props.mealType] || [];
  }

  const result: any[] = [];

  // 1. 处理计划项
  plannedItems.forEach((pItem: any) => {
    if (!pItem) return;
    // 🚀 关键修复：不要将 PlanMealItem 的 ID 当作 foodId
    const pFoodId = pItem.foodId || null; 
    const pName = pItem.customName || pItem.foodName;
    
    // 🚀 增强匹配：优先匹配 foodId，若无则匹配名称
    const matchIdx = actualLogs.findIndex(log => {
      if (!log) return false;
      // 1. 如果两者都有 foodId，精准匹配
      if (log.foodId && pFoodId && String(log.foodId) === String(pFoodId)) return true;
      // 2. 名称匹配（无论是否来自计划，只要名字对上就算占位成功）
      return log.foodName === pName;
    });
    
    if (matchIdx > -1) {
      const log = actualLogs[matchIdx];
      const isRecorded = Number(log.isRecorded) === 1;
      result.push({ 
        ...log, 
        status: isRecorded ? 'completed' : 'draft' 
      });
      actualLogs.splice(matchIdx, 1);
    } else {
      // 物理占位：虚态(ghost)
      result.push({ 
        ...pItem, 
        foodId: pFoodId, // 统一字段名
        status: 'ghost' 
      });
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
    // 🚀 核心优化：只同步那些在 mergedMeals 中依然处于 ghost 或 draft 状态的项
    const syncTargets = mergedMeals.value.filter(m => m.status === 'ghost' || m.status === 'draft');
    
    for (const item of syncTargets) {
      if (item.status === 'draft' && item.id) {
        await recordStore.updateMealAction(item.id, { isRecorded: true });
      } else if (item.status === 'ghost') {
        await recordStore.addMealLogAction({
          date: props.date,
          mealType: props.mealType,
          foodId: item.foodId,
          foodName: item.customName || item.foodName,
          calories: item.calories,
          protein: item.protein,
          fat: item.fat,
          carbs: item.carbs,
          unit: item.unit,
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
      if (item.status === 'draft' && item.id) {
        await recordStore.updateMealAction(item.id, { isRecorded: true });
      } else if (item.status === 'ghost') {
        await recordStore.addMealLogAction({
          date: props.date,
          mealType: props.mealType,
          foodId: item.foodId,
          foodName: item.customName || item.foodName,
          calories: item.calories,
          protein: item.protein,
          fat: item.fat,
          carbs: item.carbs,
          unit: item.unit,
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