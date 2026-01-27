<template>
  <view v-if="visible" class="modal-overlay" @click="handleClose">
    <view class="modal-content" @click.stop>
      <view class="bg-white rounded-2xl w-full max-w-md p-6">
        <view class="flex items-center justify-between mb-4">
          <text class="text-lg font-semibold text-gray-800">{{ food?.name || "食材详情" }}</text>
          <view class="text-gray-400 hover:text-gray-600" @click="handleClose">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </view>
        </view>

        <view v-if="food" class="space-y-4">
          <view class="text-center mb-4">
            <text class="text-4xl mb-2 block">{{ food.emoji }}</text>
            <text class="text-lg font-semibold text-gray-800 block">{{ food.name }}</text>
            <text class="text-sm text-gray-600 block">{{ food.description }}</text>
          </view>

          <view class="bg-gray-50 rounded-lg p-4 mb-4">
            <text class="font-medium text-gray-800 mb-2 block">营养成分 (每{{ food.unit }})</text>
            <view class="grid grid-cols-2 gap-3 text-sm">
              <view class="flex justify-between">
                <text class="text-gray-600">热量</text>
                <text class="font-medium">{{ food.calories }} kcal</text>
              </view>
              <view class="flex justify-between">
                <text class="text-gray-600">蛋白质</text>
                <text class="font-medium">{{ food.protein }}g</text>
              </view>
              <view class="flex justify-between">
                <text class="text-gray-600">脂肪</text>
                <text class="font-medium">{{ food.fat }}g</text>
              </view>
              <view class="flex justify-between">
                <text class="text-gray-600">碳水化合物</text>
                <text class="font-medium">{{ food.carbs }}g</text>
              </view>
            </view>
          </view>

          <view class="bg-blue-50 rounded-lg p-4">
            <text class="font-medium text-gray-800 mb-2 block">健康建议</text>
            <text class="text-sm text-gray-600 block">{{ healthAdvice }}</text>
          </view>
        </view>

        <view class="flex space-x-3 mt-6">
          <view
            class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
            @click="handleClose"
          >
            <text>关闭</text>
          </view>
          <view
            class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center"
            @click="handleAddToMeal"
          >
            <text>添加到餐食</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Food {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  unit: string;
  description: string;
  category: string;
  type: "system" | "custom";
}

const props = defineProps<{
  visible: boolean;
  food: Food | null;
}>();

const emit = defineEmits<{
  close: [];
  addToMeal: [food: Food];
}>();

const healthAdvice = computed(() => {
  if (!props.food) return "";
  const adviceMap: Record<string, string> = {
    "chicken-breast": "鸡胸肉是优质蛋白质来源，适合增肌减脂期间食用。",
    salmon: "三文鱼富含Omega-3脂肪酸，有益心血管健康。",
    broccoli: "西兰花维生素C含量丰富，有助于增强免疫力。",
    apple: "苹果膳食纤维丰富，有助于消化和血糖控制。",
    banana: "香蕉钾含量高，适合运动后补充电解质。",
    "brown-rice": "糙米是全谷物，提供持续的能量和饱腹感。",
  };
  return adviceMap[props.food.id] || "这种食物营养丰富，建议适量食用，搭配其他食物获得均衡营养。";
});

const handleClose = () => {
  emit("close");
};

const handleAddToMeal = () => {
  if (props.food) {
    emit("addToMeal", props.food);
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 448px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>

