<template>
  <BaseModal
    :visible="modalVisible"
    title="创建自定义食材"
    position="center"
    @close="handleClose"
    @update="(val) => modalVisible = val"
  >

    <view class="space-y-4">
      <view>
        <text class="block text-sm font-medium text-gray-700 mb-2">食材名称</text>
        <input
          :value="formData.name"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="例如：自制沙拉"
          @input="(e: any) => formData.name = e.detail?.value || e.target?.value || ''"
        />
      </view>

      <view>
        <text class="block text-sm font-medium text-gray-700 mb-2">单位</text>
        <view
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <picker
            :value="unitIndex"
            :range="units"
            @change="handleUnitChange"
          >
            <view class="text-gray-800">{{ formData.unit }}</view>
          </picker>
        </view>
      </view>

      <view>
        <text class="block text-sm font-medium text-gray-700 mb-2">热量 (kcal)</text>
        <input
          :value="formData.calories"
          type="number"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="每100g的热量"
          @input="(e: any) => formData.calories = parseFloat(e.detail?.value || e.target?.value || '0') || 0"
        />
      </view>

      <view class="grid grid-cols-3 gap-4">
        <view>
          <text class="block text-sm font-medium text-gray-700 mb-2">蛋白质 (g)</text>
          <input
            :value="formData.protein"
            type="number"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="0"
            @input="(e: any) => formData.protein = parseFloat(e.detail?.value || e.target?.value || '0') || 0"
          />
        </view>
        <view>
          <text class="block text-sm font-medium text-gray-700 mb-2">脂肪 (g)</text>
          <input
            :value="formData.fat"
            type="number"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="0"
            @input="(e: any) => formData.fat = parseFloat(e.detail?.value || e.target?.value || '0') || 0"
          />
        </view>
        <view>
          <text class="block text-sm font-medium text-gray-700 mb-2">碳水 (g)</text>
          <input
            :value="formData.carbs"
            type="number"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="0"
            @input="(e: any) => formData.carbs = parseFloat(e.detail?.value || e.target?.value || '0') || 0"
          />
        </view>
      </view>

      <view>
        <text class="block text-sm font-medium text-gray-700 mb-2">描述 (可选)</text>
        <textarea
          :value="formData.description"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="简单描述这个食材..."
          @input="(e: any) => formData.description = e.detail?.value || e.target?.value || ''"
        ></textarea>
      </view>
    </view>

    <template #footer>
      <view class="flex space-x-3">
        <view
          class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
          @click="handleClose"
        >
          <text>取消</text>
        </view>
        <view
          class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center"
          @click="handleSubmit"
        >
          <text>创建食材</text>
        </view>
      </view>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import BaseModal from "../common/BaseModal.vue";

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
  editingFood?: Food | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: any];
}>();

const units = ["g", "ml", "piece", "cup", "tbsp"];
const unitIndex = ref(0);

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      emit("close");
    }
  },
});

const formData = ref({
  name: "",
  unit: "g",
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  description: "",
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.editingFood) {
      formData.value = {
        name: props.editingFood.name,
        unit: props.editingFood.unit,
        calories: props.editingFood.calories,
        protein: props.editingFood.protein,
        fat: props.editingFood.fat,
        carbs: props.editingFood.carbs,
        description: props.editingFood.description,
      };
      unitIndex.value = units.indexOf(props.editingFood.unit);
    } else if (!newVal) {
      formData.value = {
        name: "",
        unit: "g",
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        description: "",
      };
      unitIndex.value = 0;
    }
  }
);

const handleUnitChange = (e: any) => {
  const index = e.detail.value;
  unitIndex.value = index;
  formData.value.unit = units[index];
};

const handleClose = () => {
  emit("close");
};

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.calories) {
    // 这里可以显示提示
    return;
  }
  emit("submit", { ...formData.value });
};
</script>

