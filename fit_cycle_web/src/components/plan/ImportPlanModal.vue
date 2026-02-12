<template>
  <BaseModal
    :visible="visible"
    title="导入计划"
    content-class="w-[85vw] max-w-sm"
    @update:visible="handleUpdateVisible"
    @close="handleClose"
  >
    <view class="mb-6">
      <text class="block text-sm font-medium text-gray-700 mb-2">分享码</text>
      <input
        v-model="shareCode"
        type="text"
        class="px-4 py-3 border-[1rpx] border-solid border-gray-200 rounded-xl focus:border-emerald-500 transition-colors text-base"
        placeholder="输入分享码，如：PLAN-XXXX"
      />
    </view>

    <view class="flex space-x-3">
      <view
        @click="handleClose"
        class="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-xl font-medium active:bg-gray-100 transition-colors text-center text-sm"
      >
        取消
      </view>
      <view
        @click="handleImport"
        class="flex-1 bg-emerald-600 text-white py-2 px-3 rounded-xl font-medium active:bg-emerald-700 transition-colors text-center text-sm shadow-sm"
      >
        导入
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModal from "../common/BaseModal.vue";
import Taro from "@tarojs/taro";

interface Emits {
  (e: "close"): void;
  (e: "import", shareCode: string): void;
}

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<Emits>();

const shareCode = ref("");

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      shareCode.value = "";
    }
  },
);

const handleUpdateVisible = (val: boolean) => {
  if (!val) {
    emit("close");
  }
};

const handleClose = () => {
  emit("close");
};

const handleImport = () => {
  const code = shareCode.value.trim();
  if (code) {
    emit("import", code);
    // Modal will be closed by parent setting visible=false
  } else {
    Taro.showToast({ title: "请输入分享码", icon: "none" });
  }
};
</script>
