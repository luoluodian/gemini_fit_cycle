<template>
  <nut-popup
    v-model:visible="popupVisible"
    position="center"
    :close-on-click-overlay="true"
    :lock-scroll="true"
    round
  >
    <view class="p-6 w-[70vw]">
      <view class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">隐私政策</h3>
        <view @click="handleClose" class="text-gray-400 hover:text-gray-600">
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

      <scroll-view scroll-y class="max-h-[60vh]">
        <view class="bg-white rounded-2xl w-full">
          <view class="">
            <view class="space-y-4 text-sm text-gray-600">
              <view>
                <h4 class="font-medium text-gray-800 mb-2">1. 信息收集</h4>
                <p>为了提供更好的服务，我们可能会收集以下信息：</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>微信昵称和头像（用于个人资料展示）</li>
                  <li>饮食记录和计划数据（保存在本地存储）</li>
                  <li>使用统计数据（用于改进应用功能）</li>
                </ul>
              </view>

              <view>
                <h4 class="font-medium text-gray-800 mb-2">2. 信息使用</h4>
                <p>我们收集的信息仅用于：</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>提供个性化的饮食记录服务</li>
                  <li>保存和管理用户的饮食计划</li>
                  <li>改进应用功能和用户体验</li>
                </ul>
              </view>

              <view>
                <h4 class="font-medium text-gray-800 mb-2">3. 信息存储</h4>
                <p>您的数据安全对我们至关重要：</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>所有数据存储在您的设备本地</li>
                  <li>不会上传到我们的服务器</li>
                  <li>清除浏览器数据会删除所有记录</li>
                </ul>
              </view>

              <view>
                <h4 class="font-medium text-gray-800 mb-2">4. 用户权利</h4>
                <p>您拥有以下权利：</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>随时查看、修改或删除您的数据</li>
                  <li>选择是否使用某些功能</li>
                  <li>停止使用本应用</li>
                </ul>
              </view>

              <view>
                <h4 class="font-medium text-gray-800 mb-2">5. 联系我们</h4>
                <p>如有任何疑问，请联系我们：</p>
                <p class="mt-1">邮箱：support@diet-tracker.com</p>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="mt-6 pt-4 border-t border-gray-200">
        <button
          @click="handleClose"
          class="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          我已了解
        </button>
      </view>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// PrivacyModal组件 - 隐私政策模态框
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

// 内部状态管理
const popupVisible = ref(props.visible);

// 监听外部visible变化
watch(
  () => props.visible,
  (newVal) => {
    popupVisible.value = newVal;
    console.log("PrivacyModal visible状态变化:", newVal);
  },
  { immediate: true }
);

// 监听popup内部关闭事件
watch(popupVisible, (newVal) => {
  if (!newVal) {
    handleClose();
  }
});

// 关闭处理函数
const handleClose = () => {
  popupVisible.value = false;
  emit("close");
};
</script>

<style scoped></style>
