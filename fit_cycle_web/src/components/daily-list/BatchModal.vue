<template>
  <view
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center min-h-screen p-4"
    @click="handleClose"
  >
    <view
      class="bg-white rounded-2xl p-6 w-full max-w-sm"
      @click.stop
    >
      <text class="text-lg font-bold text-gray-800 mb-4 block">批量配置</text>
      <view class="space-y-4">
        <view>
          <text class="block text-sm font-medium text-gray-700 mb-2">选择操作</text>
          <select
            v-model="selectedAction"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option
              v-for="action in actions"
              :key="action.value"
              :value="action.value"
            >
              {{ action.label }}
            </option>
          </select>
        </view>
        <view class="flex space-x-3">
          <button
            class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            @click="handleClose"
          >
            取消
          </button>
          <button
            class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            @click="handleExecute"
          >
            执行
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Action {
  value: string;
  label: string;
}

interface Props {
  visible: boolean;
}

interface Emits {
  (e: "close"): void;
  (e: "execute", action: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const actions: Action[] = [
  { value: "copy", label: "复制已有配置" },
  { value: "template", label: "应用模板" },
  { value: "reset", label: "重置所有" },
];

const selectedAction = ref("copy");

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      selectedAction.value = "copy";
    }
  }
);

const handleClose = () => {
  emit("close");
};

const handleExecute = () => {
  emit("execute", selectedAction.value);
};
</script>

