<template>
  <view class="glass-card rounded-lg p-4 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">周期设置</h3>

    <view class="space-y-4">
      <view class="grid grid-cols-2 gap-4">
        <view>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >每周期天数</label
          >
          <input
            type="number"
            :value="formData.cycleDays"
            @input="handleCycleDaysChange"
            class="w-auto px-4 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="7"
            min="1"
            max="14"
          />
          <p class="text-xs text-gray-500 mt-1">建议 3~7 天为一个周期</p>
        </view>
        <view>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >周期数量</label
          >
          <input
            type="number"
            :value="formData.cycleCount"
            @input="handleCycleCountChange"
            class="w-auto px-4 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="3"
            min="1"
            max="10"
          />
        </view>
      </view>

      <view class="bg-emerald-50 rounded-lg p-3">
        <view class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">总执行天数</span>
          <span class="text-lg font-bold text-emerald-600"
            >{{ totalDays }} 天</span
          >
        </view>
        <p class="text-xs text-gray-500 mt-1">执行时会按周期循环使用日模板</p>
      </view>

      <view class="bg-blue-50 rounded-lg p-3">
        <h4 class="font-medium text-blue-800 mb-2">目标设置方式</h4>
        <view class="space-y-2">
          <view
            class="custom-radio flex items-center cursor-pointer"
            @click="handleTargetModeChange('individual')"
          >
            <view
              :class="[
                'w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center border border-solid',
                formData.targetMode === 'individual'
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'bg-white border-gray-300 hover:border-emerald-500',
              ]"
            >
              <text
                v-if="formData.targetMode === 'individual'"
                class="text-white text-xs"
                >✓</text
              >
            </view>
            <text class="text-sm text-gray-700">每一天单独设置目标</text>
          </view>
          <view
            class="custom-radio flex items-center cursor-pointer"
            @click="handleTargetModeChange('default')"
          >
            <view
              :class="[
                'w-4 h-4 border-2 rounded mr-2 flex items-center justify-center border border-solid border-gray-100',
                formData.targetMode === 'default'
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'bg-white border-gray-300 hover:border-emerald-500',
              ]"
            >
              <text
                v-if="formData.targetMode === 'default'"
                class="text-white text-xs"
                >✓</text
              >
            </view>
            <text class="text-sm text-gray-700"
              >先设置默认每日目标，后面再微调</text
            >
          </view>
        </view>
      </view>

      <view class="bg-yellow-50 rounded-lg p-3">
        <h4 class="font-medium text-yellow-800 mb-2">默认每日目标</h4>
        <view class="grid grid-cols-2 gap-4">
          <view>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >总热量 (kcal)</label
            >
            <input
              type="number"
              :value="formData.defaultCalories"
              @input="handleCaloriesChange"
              class="w-auto px-3 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="1800"
            />
          </view>
          <view>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >蛋白质 (g)</label
            >
            <input
              type="number"
              :value="formData.defaultProtein"
              @input="handleProteinChange"
              class="w-auto px-3 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="120"
            />
          </view>
          <view>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >脂肪 (g)</label
            >
            <input
              type="number"
              :value="formData.defaultFat"
              @input="handleFatChange"
              class="w-auto px-3 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="50"
            />
          </view>
          <view>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >碳水 (g)</label
            >
            <input
              type="number"
              :value="formData.defaultCarbs"
              @input="handleCarbsChange"
              class="w-auto px-3 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="180"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface CycleData {
  cycleDays: number;
  cycleCount: number;
  targetMode: string;
  defaultCalories: number;
  defaultProtein: number;
  defaultFat: number;
  defaultCarbs: number;
}

interface Props {
  formData: CycleData;
}

interface Emits {
  (e: "update:formData", value: Partial<CycleData>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const totalDays = computed(
  () => props.formData.cycleDays * props.formData.cycleCount
);

const handleCycleDaysChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { cycleDays: parseInt(value) || 0 });
};

const handleCycleCountChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { cycleCount: parseInt(value) || 0 });
};

const handleTargetModeChange = (value: string) => {
  emit("update:formData", { targetMode: value });
};

const handleCaloriesChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { defaultCalories: parseInt(value) || 0 });
};

const handleProteinChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { defaultProtein: parseInt(value) || 0 });
};

const handleFatChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { defaultFat: parseInt(value) || 0 });
};

const handleCarbsChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "0";
  emit("update:formData", { defaultCarbs: parseInt(value) || 0 });
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
