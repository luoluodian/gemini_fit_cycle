<template>
  <BaseModal
    :visible="popupVisible"
    position="center"
    :show-header="false"
    :content-class="'bg-white rounded-lg w-80'"
    @close="handleClose"
    @update="(val) => (popupVisible = val)"
  >
    <!-- 标题区域 -->
    <view class="text-center mb-8">
      <view class="flex items-center justify-center mb-4">
        <text class="text-2xl font-semibold text-gray-800 flex-shrink-0">
          {{ currentFood.foodName }}
        </text>
        <view
          v-if="currentFood.tags && currentFood.tags.length > 0"
          class="flex flex-wrap gap-2 ml-2"
        >
          <text
            v-for="tag in currentFood.tags"
            :key="tag"
            class="text-sm bg-blue-100 text-blue-600 rounded-full px-2 py-1"
          >
            {{ tag }}
          </text>
        </view>
      </view>
    </view>

    <!-- 数量输入 -->
    <view class="mb-6">
      <view class="flex items-center gap-4">
        <text class="text-base font-medium text-gray-700 flex-shrink-0 ml-2">
          数量 ({{ currentFood.baseUnit }})
        </text>
        <input
          type="number"
          v-model="quantity"
          class="flex-1 px-4 py-2 border-solid border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
          placeholder="请输入数量"
          @input="updatePreview"
        />
      </view>
    </view>

    <!-- 营养预览 -->
    <view class="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <text class="text-lg font-medium text-gray-800 mb-3 block">营养预览</text>
      <view class="grid grid-cols-2 gap-4">
        <view class="flex items-center gap-2">
          <text class="text-sm text-gray-600 font-medium">热量:</text>
          <text class="text-base font-semibold text-emerald-600"
            >{{ previewCalories }}kcal</text
          >
        </view>
        <view class="flex items-center gap-2">
          <text class="text-sm text-gray-600 font-medium">蛋白质:</text>
          <text class="text-base font-semibold text-emerald-600"
            >{{ previewProtein }}g</text
          >
        </view>
        <view class="flex items-center gap-2">
          <text class="text-sm text-gray-600 font-medium">脂肪:</text>
          <text class="text-base font-semibold text-emerald-600"
            >{{ previewFat }}g</text
          >
        </view>
        <view class="flex items-center gap-2">
          <text class="text-sm text-gray-600 font-medium">碳水:</text>
          <text class="text-base font-semibold text-emerald-600"
            >{{ previewCarbs }}g</text
          >
        </view>
      </view>
    </view>

    <template #footer>
      <view class="flex gap-5">
        <view
          class="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-center"
          @click="handleClose"
        >
          取消
        </view>
        <view
          class="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors text-center"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </view>
      </view>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "./BaseModal.vue";

// 定义食物类型
interface FoodItem {
  id: number;
  foodName: string;
  category: string;
  baseUnit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  tags?: string[];
  description?: string;
}

interface Props {
  visible: boolean;
  food?: FoodItem;
  existingQuantity?: number;
  mode?: "add" | "edit";
}

interface Emits {
  (e: "close"): void;
  (e: "confirm", quantity: number, unit: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  food: () => ({
    id: 0,
    foodName: "食物名称",
    category: "",
    baseUnit: "g",
    calories: 100,
    protein: 5,
    fat: 2,
    carbs: 15,
    tags: [],
  }),
  existingQuantity: 100,
  mode: "add",
});

const emit = defineEmits<Emits>();

// 状态
const currentFood = ref<FoodItem>(props.food);
const quantity = ref(props.existingQuantity);
const currentMode = ref(props.mode);
watch(
  () => props.mode,
  (newMode) => {
    console.log("模式已更新为:", newMode);
  }
);

// 计算属性 - 用于输入验证
const minQuantity = computed(() => 1);
const maxQuantity = computed(() => 1000);

const confirmButtonText = computed(() => {
  return currentMode.value === "edit" ? "编辑" : "添加";
});

const previewCalories = computed(() => {
  const ratio = getRatio();
  return Math.round(currentFood.value.calories * ratio);
});

const previewProtein = computed(() => {
  const ratio = getRatio();
  return (currentFood.value.protein * ratio).toFixed(1);
});

const previewFat = computed(() => {
  const ratio = getRatio();
  return (currentFood.value.fat * ratio).toFixed(1);
});

const previewCarbs = computed(() => {
  const ratio = getRatio();
  return (currentFood.value.carbs * ratio).toFixed(1);
});

// 弹窗可见性管理
const popupVisible = ref(props.visible);

// 监听 props 变化
watch(
  () => props.visible,
  (newVal) => {
    popupVisible.value = newVal;
  }
);

watch(
  () => props.food,
  (newFood) => {
    currentFood.value = newFood;
  },
  { immediate: true }
);

watch(
  () => props.existingQuantity,
  (newQuantity) => {
    if (newQuantity > 0) {
      quantity.value = newQuantity;
    } else {
      quantity.value = currentFood.value.baseUnit === "个" ? 1 : 100;
    }
  },
  { immediate: true }
);

watch(
  () => props.mode,
  (newMode) => {
    currentMode.value = newMode;
  }
);

watch(popupVisible, (newVal) => {
  if (!newVal) {
    emit("close");
  }
});

// 方法
const handleClose = () => {
  emit("close");
};

const handleConfirm = () => {
  const qty = parseFloat(quantity.value.toString());
  if (qty <= 0) {
    // 使用 Taro 的 toast 方法
    // @ts-ignore
    if (typeof uni !== "undefined") {
      // @ts-ignore
      uni.showToast({
        title: "请输入有效的数量",
        icon: "none",
      });
    }
    return;
  }

  emit("confirm", qty, currentFood.value.baseUnit);
  handleClose();
};

const updatePreview = () => {
  // 验证并限制输入值范围
  const qty = parseFloat(quantity.value.toString()) || 0;
  if (qty < minQuantity.value) {
    quantity.value = minQuantity.value;
  } else if (qty > maxQuantity.value) {
    quantity.value = maxQuantity.value;
  }
  // 预览值会通过计算属性自动更新
};

const getRatio = () => {
  const qty = parseFloat(quantity.value.toString()) || 0;
  if (currentFood.value.baseUnit === "个") {
    return qty;
  } else {
    return qty / 100;
  }
};
</script>

<style scoped>
/* Tailwind CSS 类名已经覆盖了大部分样式需求 */
/* 这里只保留必要的自定义样式 */
</style>
