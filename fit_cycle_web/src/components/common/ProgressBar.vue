<template>
  <view class="relative">
    <!-- 线性进度条 -->
    <view
      v-if="type === 'line'"
      :class="['flex items-center gap-2', wrapperClass]"
    >
      <view
        class="flex-1 bg-gray-200 rounded overflow-hidden"
        :style="{ height: `${height}px` }"
      >
        <view
          class="h-full rounded transition-all duration-500 ease-out"
          :style="{
            width: `${percentage}%`,
            background:
              color ||
              'linear-gradient(90deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)',
          }"
        ></view>
      </view>
      <text
        v-if="showText"
        class="text-xs text-gray-500 min-w-[40px] text-right"
      >
        {{ text }}
      </text>
    </view>

    <!-- 环形进度条 -->
    <view
      v-else-if="type === 'circle'"
      class="relative inline-block"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <svg
        class="transform -rotate-90"
        :width="size"
        :height="size"
        viewBox="0 0 120 120"
      >
        <circle
          class="transition-colors duration-300"
          :stroke="bgColor"
          :stroke-width="strokeWidth"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
        <circle
          class="transition-all duration-500 ease-out"
          :stroke="color || '#10b981'"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference - (circumference * percentage) / 100"
        />
      </svg>
      <view
        v-if="showText"
        class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700"
      >
        <text>{{ text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  percentage: number;
  type?: "line" | "circle";
  color?: string;
  bgColor?: string;
  height?: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  text?: string;
  wrapperClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "line",
  height: 8,
  size: 120,
  strokeWidth: 8,
  showText: true,
  bgColor: "#e5e7eb",
  wrapperClass: "",
});

const circumference = computed(() => 2 * Math.PI * 52);

const text = computed(() => {
  if (props.text !== undefined) {
    return props.text;
  }
  return `${Math.round(props.percentage)}%`;
});
</script>


