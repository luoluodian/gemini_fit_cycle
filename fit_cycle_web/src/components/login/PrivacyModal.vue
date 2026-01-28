<template>
  <nut-popup
    v-model:visible="popupVisible"
    position="center"
    :close-on-click-overlay="true"
    :lock-scroll="true"
    round
    pop-class="privacy-popup-custom"
  >
    <view class="flex flex-col bg-white w-full h-full overflow-hidden">
      <!-- Header -->
      <view
        class="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-none"
      >
        <text class="text-xl font-bold text-gray-800">隐私政策</text>
        <view
          @click="handleClose"
          class="w-10 h-10 flex items-center justify-center -mr-2 text-gray-400 active:opacity-60"
        >
        </view>
      </view>

      <!-- Content (Scrollable) -->
      <view class="content-area">
        <view class="px-6 py-6 space-y-6 text-sm text-gray-600 leading-relaxed">
          <view>
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
              1. 信息收集
            </h4>
            <p>为了提供更好的服务，我们可能会收集以下信息：</p>
            <view class="mt-2 space-y-1 pl-3 border-l border-emerald-50">
              <view>• 微信昵称和头像</view>
              <view>• 饮食记录和计划数据</view>
              <view>• 使用统计数据</view>
            </view>
          </view>

          <view>
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
              2. 信息使用
            </h4>
            <p>我们收集的信息仅用于：</p>
            <view class="mt-2 space-y-1 pl-3 border-l border-emerald-50">
              <view>• 提供个性化的饮食记录服务</view>
              <view>• 保存和管理用户的饮食计划</view>
              <view>• 改进应用功能和用户体验</view>
            </view>
          </view>

          <view>
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
              3. 数据安全
            </h4>
            <p>您的数据安全对我们至关重要：</p>
            <view class="mt-2 space-y-1 pl-3 border-l border-emerald-50">
              <view>• 采用加密存储技术</view>
              <view>• 定期进行安全性检查</view>
            </view>
          </view>

          <view>
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
              4. 联系我们
            </h4>
            <p>如有任何疑问，请联系我们：</p>
            <p class="mt-1 text-emerald-600">support@fit-cycle.com</p>
          </view>
        </view>
      </view>

      <!-- Footer -->
      <view class="p-6 border-t border-gray-50 bg-gray-50/30 flex-none">
        <BaseButton type="primary" size="md" @click="handleClose">
          我已阅读并同意
        </BaseButton>
      </view>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseButton from "../common/BaseButton.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const emit = defineEmits<{
  close: [];
}>();

const popupVisible = ref(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    popupVisible.value = newVal;
  },
);

watch(popupVisible, (newVal) => {
  if (!newVal) {
    emit("close");
  }
});

const handleClose = () => {
  popupVisible.value = false;
};
</script>

<style lang="scss">
/* 注意：这里不使用 scoped，以确保样式能穿透到 pop-class */
.privacy-popup-custom {
  width: 85vw !important;
  height: 80vh !important;
  border-radius: 32rpx !important;
  overflow: hidden !important;
  background-color: #fff !important;
  padding: 0 !important;
}

/* 使用普通 view + overflow 实现滚动 */
.privacy-popup-custom .content-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
