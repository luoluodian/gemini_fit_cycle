<template>
  <BaseModal
    :visible="popupVisible"
    position="center"
    :show-header="false"
    content-class="bg-white rounded-3xl w-[85vw] max-w-sm overflow-hidden"
    @close="handleClose"
    @update="(val) => (popupVisible = val)"
  >
    <view class="p-6">
      <!-- 标题区域 -->
      <view class="text-center mb-6">
        <text class="text-lg font-black text-gray-800 block mb-1">{{ foodName }}</text>
        <text class="text-xs text-gray-400 font-black tracking-wider">设定摄入分量</text>
      </view>

      <!-- 数量输入 -->
      <view class="bg-gray-50/80 rounded-2xl p-4 border border-solid border-gray-100 mb-6">
        <view class="flex items-center justify-between mb-2">
          <text class="text-xs font-black text-gray-500">输入数值</text>
          <text class="text-xs font-bold text-emerald-600">{{ foodUnit }}</text>
        </view>
        <view class="flex items-center">
          <input
            type="digit"
            v-model="quantity"
            class="flex-1 text-3xl font-black text-gray-800 h-12"
            placeholder="0"
            @input="handleInput"
          />
          <view class="flex space-x-2 ml-4">
            <view 
              @tap="adjust(-10)" 
              class="w-10 h-10 rounded-xl bg-white border border-solid border-gray-200 flex items-center justify-center active:bg-gray-100 transition-all shadow-sm"
            >
              <text class="text-gray-400 font-bold">-</text>
            </view>
            <view 
              @tap="adjust(10)" 
              class="w-10 h-10 rounded-xl bg-white border border-solid border-gray-200 flex items-center justify-center active:bg-gray-100 transition-all shadow-sm"
            >
              <text class="text-gray-400 font-bold">+</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 营养预览 -->
      <view class="bg-white rounded-2xl p-4 border border-solid border-gray-100 shadow-sm mb-8">
        <text class="text-[20rpx] font-black text-gray-400 block mb-3 tracking-widest text-center">营养成分预览</text>
        <view class="grid grid-cols-4 gap-2 text-center">
          <view>
            <text class="block text-[18rpx] text-gray-400 font-bold mb-1">能量</text>
            <text class="block text-sm font-black text-gray-700">{{ previewCalories }}</text>
            <text class="block text-[14rpx] text-gray-300 font-bold">kcal</text>
          </view>
          <view>
            <text class="block text-[18rpx] text-gray-400 font-bold mb-1">🍞碳水</text>
            <text class="block text-sm font-black text-yellow-600">{{ previewCarbs }}</text>
            <text class="block text-[14rpx] text-gray-300 font-bold">g</text>
          </view>
          <view>
            <text class="block text-[18rpx] text-gray-400 font-bold mb-1">🥩蛋白</text>
            <text class="block text-sm font-black text-blue-600">{{ previewProtein }}</text>
            <text class="block text-[14rpx] text-gray-300 font-bold">g</text>
          </view>
          <view>
            <text class="block text-[18rpx] text-gray-400 font-bold mb-1">🥑脂肪</text>
            <text class="block text-sm font-black text-red-600">{{ previewFat }}</text>
            <text class="block text-[14rpx] text-gray-300 font-bold">g</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="flex space-x-3">
        <view
          class="flex-1 py-3.5 rounded-xl font-black text-gray-500 bg-gray-100 active:bg-gray-200 transition-all text-center text-sm tracking-widest"
          @click="handleClose"
        >
          取消
        </view>
        <view
          class="flex-1 py-3.5 rounded-xl font-black text-white bg-emerald-600 active:bg-emerald-700 transition-all text-center shadow-md shadow-emerald-100 text-sm tracking-widest"
          @click="handleConfirm"
        >
          {{ mode === 'edit' ? '确认修改' : '加入餐单' }}
        </view>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "./BaseModal.vue";

interface Props {
  visible: boolean;
  foodName: string;
  foodUnit: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  baseCount?: number;
  existingQuantity?: number;
  mode?: "add" | "edit";
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  foodName: "未知食物",
  foodUnit: "g",
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  baseCount: 100,
  existingQuantity: 100,
  mode: "add"
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", quantity: number, unit: string): void;
}>();

const quantity = ref(props.existingQuantity);
const popupVisible = ref(props.visible);

watch(() => props.visible, (val) => popupVisible.value = val);
watch(() => props.existingQuantity, (val) => quantity.value = val);

const ratio = computed(() => {
  const q = Number(quantity.value) || 0;
  return q / (props.baseCount || 100);
});

const previewCalories = computed(() => Math.round((props.calories || 0) * ratio.value));
const previewProtein = computed(() => ((props.protein || 0) * ratio.value).toFixed(1));
const previewFat = computed(() => ((props.fat || 0) * ratio.value).toFixed(1));
const previewCarbs = computed(() => ((props.carbs || 0) * ratio.value).toFixed(1));

const handleInput = (e: any) => {
  const val = e.detail.value;
  quantity.value = parseFloat(val) || 0;
};

const adjust = (offset: number) => {
  const current = Number(quantity.value) || 0;
  quantity.value = Math.max(0, current + offset);
};

const handleClose = () => emit("close");

const handleConfirm = () => {
  const q = Number(quantity.value);
  if (q > 0) {
    emit("confirm", q, props.foodUnit);
    handleClose();
  }
};
</script>
