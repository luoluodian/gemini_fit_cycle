<template>
  <BaseModal
    :visible="modalVisible"
    position="bottom"
    title="选择食物"
    :content-class="'bg-white rounded-t-2xl w-full max-h-[80vh] overflow-hidden'"
    :body-class="'p-4 overflow-y-auto'"
    @close="handleClose"
    @update="(val) => modalVisible = val"
  >
    <view class="text-center text-gray-500 py-8">
      <text class="block">食物选择器功能开发中...</text>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseModal from "../common/BaseModal.vue";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  select: [food: any];
}>();

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      emit("close");
    }
  },
});

const handleClose = () => {
  emit("close");
};
</script>

