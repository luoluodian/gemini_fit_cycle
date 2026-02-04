<template>
  <nut-popup
    v-model:visible="popupVisible"
    :position="position"
    :close-on-click-overlay="closeOnOverlay"
    :lock-scroll="true"
    round
    :z-index="zIndex"
    style="border-radius: 16rpx"
    catch-move
  >
    <view
      :class="[
        'bg-white rounded-lg p-4 max-h-[75vh] overflow-hidden flex flex-col',
        contentClass,
      ]"
      style="overflow: hidden; border-radius: 16rpx"
      @touchmove.stop.prevent
    >
      <!-- 标题栏 -->
      <view v-if="showHeader" class="pb-4 border-b border-gray-200">
        <view class="flex items-center justify-between">
          <view v-if="title" class="flex-1">
            <text class="text-lg font-semibold text-gray-800">{{ title }}</text>
          </view>
          <slot name="header"></slot>
          <view
            v-if="showClose"
            class="cursor-pointer transition-colors text-gray-400 hover:text-gray-600"
            @click="handleClose"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
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
  zIndex: 200,
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
