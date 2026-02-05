<template>
  <nut-popup
    v-model:visible="popupVisible"
    :position="position"
    :close-on-click-overlay="closeOnOverlay"
    :lock-scroll="true"
    round
    :z-index="zIndex"
    style="border-radius: 16rpx"
  >
    <view
      :class="[
        'bg-white rounded-lg flex flex-col max-h-[85vh] overflow-hidden',
        contentClass,
      ]"
      style="border-radius: 16rpx"
    >
      <!-- 标题栏 -->
      <view v-if="showHeader" class="pt-4 px-4 pb-4 border-b border-gray-200">
        <view class="flex items-center justify-between">
          <view v-if="title" class="flex-1">
            <text class="text-lg font-black text-gray-800">{{ title }}</text>
          </view>
          <slot name="header"></slot>
          <view
            v-if="showClose"
            class="p-1 cursor-pointer transition-colors text-gray-400 hover:text-gray-600 active:scale-90"
            @click="handleClose"
          >
            <Close :size="20"></Close>
          </view>
        </view>
      </view>

      <!-- 内容区 -->
      <view :class="['flex-1 min-h-0', bodyClass || 'overflow-y-auto']">
        <slot></slot>
      </view>

      <!-- 底部操作区 -->
      <view v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-200">
        <slot name="footer"></slot>
      </view>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Close } from "@nutui/icons-vue-taro";

interface Props {
  visible: boolean;
  title?: string;
  position?: "center" | "bottom" | "top" | "left" | "right";
  showClose?: boolean;
  showHeader?: boolean;
  closeOnOverlay?: boolean;
  lockScroll?: boolean;
  round?: boolean;
  zIndex?: number;
  contentClass?: string;
  bodyClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  position: "center",
  showClose: true,
  showHeader: true,
  closeOnOverlay: true,
  lockScroll: true,
  round: true,
  zIndex: 100000,
  contentClass: "",
  bodyClass: "",
});

const emit = defineEmits<{
  close: [];
  update: [visible: boolean];
}>();

const popupVisible = ref(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    popupVisible.value = newVal;
  },
);

watch(popupVisible, (newVal) => {
  emit("update", newVal);
  if (!newVal) {
    emit("close");
  }
});

const handleClose = () => {
  popupVisible.value = false;
  emit("close");
};
</script>
