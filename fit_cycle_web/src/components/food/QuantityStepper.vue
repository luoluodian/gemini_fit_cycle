<template>
  <view class="quantity-stepper">
    <!-- 步进器主控 -->
    <view
      class="flex items-center justify-between bg-gray-50 rounded-2xl p-1 border border-solid border-gray-100"
    >
      <!-- 减号 -->
      <view
        class="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-400 active:scale-90 transition-transform"
        @click="handleStep(-1)"
      >
        <text class="text-2xl font-black mb-1">-</text>
      </view>

      <!-- 输入区 -->
      <view class="flex-1 flex flex-col items-center justify-center px-2">
        <view class="flex items-baseline">
          <input
            :value="modelValue"
            type="digit"
            class="text-3xl font-black text-emerald-600 text-center w-24 h-10 caret-emerald-500"
            @input="handleInput"
            @blur="handleBlur"
          />
          <text class="text-sm font-black text-gray-400 ml-1">{{ unit }}</text>
        </view>
      </view>

      <!-- 加号 -->
      <view
        class="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-emerald-600 active:scale-90 transition-transform"
        @click="handleStep(1)"
      >
        <text class="text-2xl font-black mb-1">+</text>
      </view>
    </view>

    <!-- 快捷选项 -->
    <view class="flex justify-between mt-3 space-x-2">
      <view
        v-for="preset in presets"
        :key="preset"
        class="flex-1 py-2 bg-gray-50 rounded-lg text-center text-xs font-black text-gray-500 active:bg-emerald-50 active:text-emerald-600 border border-transparent active:border-emerald-100 transition-colors"
        @click="handlePreset(preset)"
      >
        {{ preset }}{{ unit }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  unit: "g",
  step: 10,
  min: 0,
  max: 9999,
});

const emit = defineEmits(["update:modelValue", "change"]);

const dynamicStep = computed(() => {
  const smallUnits = ["个", "枚", "片", "根", "块", "勺", "瓶", "罐"];
  if (smallUnits.includes(props.unit)) return 1;
  return props.step;
});

const presets = computed(() => {
  if (props.unit === "g") return [50, 100, 150, 200];
  if (props.unit === "ml") return [100, 200, 250, 500];
  const smallUnits = ["个", "枚", "片", "根", "块", "勺", "瓶", "罐"];
  if (smallUnits.includes(props.unit)) return [0.5, 1, 2, 3];
  return [1, 2, 5, 10];
});

const updateValue = (val: number) => {
  let newValue = Math.round(val * 100) / 100;
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  emit("update:modelValue", newValue);
  emit("change", newValue);
};

const handleStep = (direction: number) => {
  updateValue(props.modelValue + direction * dynamicStep.value);
};

const handleInput = (e: any) => {
  const val = Number(e.detail.value);
  emit("update:modelValue", isNaN(val) ? 0 : val);
};

const handleBlur = (e: any) => {
  const val = Number(e.detail.value);
  updateValue(isNaN(val) ? props.min : val);
};

const handlePreset = (val: number) => {
  updateValue(val);
};
</script>
