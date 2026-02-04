<template>
  <view class="page-header bg-white shadow-sm">
    <view class="px-4 py-6">
      <view class="flex items-center justify-between">
        <view class="flex items-center flex-1">
          <view
            v-if="showBack"
            class="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            @click="handleBack"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </view>
          <view class="ml-2 flex-1">
            <text
              v-if="title"
              class="text-xl font-bold text-gray-800 block font-serif"
              style="font-family: 'Noto Serif SC', serif;"
            >
              {{ title }}
            </text>
            <text v-if="subtitle" class="text-sm text-gray-600 block mt-1">{{
              subtitle
            }}</text>
            <slot name="title"></slot>
          </view>
        </view>
        <view class="flex items-center space-x-2">
          <slot name="actions"></slot>
          <view
            v-for="(action, index) in actions"
            :key="index"
            :class="[
              'flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm',
              action.type === 'primary'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
            ]"
            @click="handleAction(action)"
          >
            <svg
              v-if="action.icon"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="action.icon"
              ></path>
            </svg>
            <text v-if="action.label">{{ action.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { navigateBack } from "@/router";

interface HeaderAction {
  label?: string;
  icon?: string;
  type?: "primary" | "secondary";
  key: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: HeaderAction[];
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  actions: () => [],
});

const emit = defineEmits<{
  back: [];
  action: [action: HeaderAction];
}>();

const handleBack = () => {
  navigateBack();
  emit("back");
};

const handleAction = (action: HeaderAction) => {
  emit("action", action);
};
</script>


