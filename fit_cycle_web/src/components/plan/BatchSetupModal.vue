<template>
  <BaseModal
    :visible="modalVisible"
    title="批量设置目标"
    @close="handleClose"
    @update="(val) => (modalVisible = val)"
  >
    <view class="p-1 space-y-6">
      <view class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 mb-2">
        <text class="text-xs text-emerald-600 font-bold leading-relaxed"
          >提示：设置后将同步更新本周期内所有日期的营养目标。</text
        >
      </view>

      <view class="grid grid-cols-2 gap-4">
        <!-- 热量 -->
        <view class="space-y-2">
          <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">总热量 (kcal)</label>
          <input
            v-model="formData.calories"
            type="number"
            class="w-full px-4 py-3 bg-white border-[1rpx] border-solid border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-800 shadow-sm"
            placeholder="1800"
          />
        </view>
        <!-- 蛋白质 -->
        <view class="space-y-2">
          <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">蛋白质 (g)</label>
          <input
            v-model="formData.protein"
            type="number"
            class="w-full px-4 py-3 bg-white border-[1rpx] border-solid border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-800 shadow-sm"
            placeholder="120"
          />
        </view>
        <!-- 脂肪 -->
        <view class="space-y-2">
          <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">脂肪 (g)</label>
          <input
            v-model="formData.fat"
            type="number"
            class="w-full px-4 py-3 bg-white border-[1rpx] border-solid border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-800 shadow-sm"
            placeholder="50"
          />
        </view>
        <!-- 碳水 -->
        <view class="space-y-2">
          <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">碳水 (g)</label>
          <input
            v-model="formData.carbs"
            type="number"
            class="w-full px-4 py-3 bg-white border-[1rpx] border-solid border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-800 shadow-sm"
            placeholder="180"
          />
        </view>
      </view>

      <view class="flex space-x-3 pt-2">
        <BaseButton class="flex-1" type="secondary" @click="handleClose">取消</BaseButton>
        <BaseButton class="flex-1 shadow-emerald-200" type="primary" @click="handleSubmit">应用到所有天</BaseButton>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import BaseModal from "../common/BaseModal.vue";
import BaseButton from "../common/BaseButton.vue";

interface Props {
  visible: boolean;
  initialData?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

const props = defineProps<Props>();
const emit = defineEmits(["close", "submit"]);

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => { if (!val) emit("close"); }
});

const formData = ref({
  calories: "" as string | number,
  protein: "" as string | number,
  fat: "" as string | number,
  carbs: "" as string | number,
});

watch(() => props.visible, (newVal) => {
  if (newVal && props.initialData) {
    formData.value = { ...props.initialData };
  }
});

const handleClose = () => emit("close");

const handleSubmit = () => {
  emit("submit", {
    calories: Number(formData.value.calories) || 0,
    protein: Number(formData.value.protein) || 0,
    fat: Number(formData.value.fat) || 0,
    carbs: Number(formData.value.carbs) || 0,
  });
  handleClose();
};
</script>
