<template>
  <BaseModal
    :visible="visible"
    :show-header="false"
    content-class="w-[90vw] max-w-md"
    body-class="p-6"
    @update:visible="(val) => emit('update:visible', val)"
    @close="handleClose"
  >
    <view>
      <!-- Header -->
      <view class="flex items-center justify-between mb-6 px-2">
        <text class="text-lg font-bold text-gray-900">添加计划</text>
        <view
          class="text-gray-400 active:bg-gray-100 rounded-full transition-colors"
          @click="handleClose"
        >
          <Close font-size="20"></Close>
        </view>
      </view>

      <!-- Options -->
      <view class="space-y-5">
        <!-- 创建新计划 -->
        <view
          class="w-full flex items-center p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl active:bg-emerald-100 active:scale-[0.98] transition-all duration-200 shadow-sm"
          @click="handleCreate"
        >
          <view
            class="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-emerald-200 shadow-md flex-shrink-0"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </view>
          <view class="text-left flex-1 min-w-0">
            <text class="block font-bold text-gray-900 text-base mb-0.5"
              >创建新计划</text
            >
            <text class="block text-xs text-gray-500 leading-tight"
              >从零开始制定个性化饮食计划</text
            >
          </view>
          <svg
            class="w-5 h-5 text-emerald-300 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </view>

        <!-- 导入计划 -->
        <view
          class="w-full flex items-center p-4 bg-blue-50/80 border border-blue-100 rounded-2xl active:bg-blue-100 active:scale-[0.98] transition-all duration-200 shadow-sm"
          @click="handleImport"
        >
          <view
            class="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-blue-200 shadow-md flex-shrink-0"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </view>
          <view class="text-left flex-1 min-w-0">
            <text class="block font-bold text-gray-900 text-base mb-0.5"
              >导入计划</text
            >
            <text class="block text-xs text-gray-500 leading-tight"
              >使用分享码快速同步他人计划</text
            >
          </view>
          <svg
            class="w-5 h-5 text-blue-300 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </view>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "../common/BaseModal.vue";
import { Close } from "@nutui/icons-vue-taro";

interface Props {
  visible: boolean;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "create"): void;
  (e: "import"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClose = () => {
  emit("update:visible", false);
};

const handleCreate = () => {
  handleClose();
  emit("create");
};

const handleImport = () => {
  handleClose();
  emit("import");
};
</script>
