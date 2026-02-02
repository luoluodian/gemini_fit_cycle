<template>
  <view
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 z-50"
    @click="handleClose"
  >
    <view
      class="flex items-center justify-center min-h-screen p-4"
      @click.stop
    >
      <view class="bg-white rounded-lg p-6 w-full max-w-sm">
        <text class="text-lg font-bold text-gray-800 mb-4 block"
          >编辑营养目标</text
        >
        <view class="space-y-4">
          <view>
            <text class="block text-sm font-medium text-gray-700 mb-1"
              >热量 (kcal)</text
            >
            <input
              :value="editTargets.calories"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              @input="(e) => editTargets.calories = Number((e.target as HTMLInputElement).value)"
            />
          </view>
          <view>
            <text class="block text-sm font-medium text-gray-700 mb-1"
              >蛋白质 (g)</text
            >
            <input
              :value="editTargets.protein"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              @input="(e) => editTargets.protein = Number((e.target as HTMLInputElement).value)"
            />
          </view>
          <view>
            <text class="block text-sm font-medium text-gray-700 mb-1"
              >脂肪 (g)</text
            >
            <input
              :value="editTargets.fat"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              @input="(e) => editTargets.fat = Number((e.target as HTMLInputElement).value)"
            />
          </view>
          <view>
            <text class="block text-sm font-medium text-gray-700 mb-1"
              >碳水 (g)</text
            >
            <input
              :value="editTargets.carbs"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              @input="(e) => editTargets.carbs = Number((e.target as HTMLInputElement).value)"
            />
          </view>
          <view class="flex space-x-3">
            <view
              class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              @click="handleClose"
            >
              取消
            </view>
            <view
              class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center"
              @click="handleSave"
            >
              保存
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Targets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const props = defineProps<{
  visible: boolean;
  targets: Targets;
}>();

const emit = defineEmits<{
  close: [];
  save: [targets: Targets];
}>();

const editTargets = ref<Targets>({
  calories: props.targets.calories,
  protein: props.targets.protein,
  fat: props.targets.fat,
  carbs: props.targets.carbs,
});

watch(
  () => props.targets,
  (newTargets) => {
    editTargets.value = {
      calories: newTargets.calories,
      protein: newTargets.protein,
      fat: newTargets.fat,
      carbs: newTargets.carbs,
    };
  },
  { immediate: true }
);

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      editTargets.value = {
        calories: props.targets.calories,
        protein: props.targets.protein,
        fat: props.targets.fat,
        carbs: props.targets.carbs,
      };
    }
  }
);

const handleClose = () => {
  emit("close");
};

const handleSave = () => {
  const calories = parseInt(String(editTargets.value.calories));
  const protein = parseInt(String(editTargets.value.protein));
  const fat = parseInt(String(editTargets.value.fat));
  const carbs = parseInt(String(editTargets.value.carbs));

  if (calories <= 0 || protein <= 0 || fat <= 0 || carbs <= 0) {
    return;
  }

  emit("save", { calories, protein, fat, carbs });
};
</script>

