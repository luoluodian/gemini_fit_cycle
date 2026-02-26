<template>
  <BaseModal
    :visible="visible"
    :show-header="false"
    content-class="w-[90vw] max-w-md"
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
            <Plus font-size="24" color="#ffffff" />
          </view>
          <view class="text-left flex-1 min-w-0">
            <text class="block font-bold text-gray-900 text-base mb-0.5"
              >创建新计划</text
            >
            <text class="block text-xs text-gray-500 leading-tight"
              >从零开始制定个性化饮食计划</text
            >
          </view>
          <Right font-size="20" color="#6ee7b7" />
        </view>

        <!-- 导入计划 -->
        <view
          class="w-full flex items-center p-4 bg-blue-50/80 border border-blue-100 rounded-2xl active:bg-blue-100 active:scale-[0.98] transition-all duration-200 shadow-sm"
          @click="handleImport"
        >
          <view
            class="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-blue-200 shadow-md flex-shrink-0"
          >
            <Uploader font-size="24" color="#ffffff" />
          </view>
          <view class="text-left flex-1 min-w-0">
            <text class="block font-bold text-gray-900 text-base mb-0.5"
              >导入计划</text
            >
            <text class="block text-xs text-gray-500 leading-tight"
              >使用分享码快速同步他人计划</text
            >
          </view>
          <Right font-size="20" color="#93c5fd" />
        </view>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "../common/BaseModal.vue";
import { Close, Plus, Uploader, Right } from "@nutui/icons-vue-taro";

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
