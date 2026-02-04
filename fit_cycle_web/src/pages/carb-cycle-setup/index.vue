<template>
  <view class="min-h-screen flex flex-col">
    <BaseNavBar title="碳循环设置" :show-back="true" />
    
    <BaseScrollView height="0" scroll-view-class="flex-1 px-4 py-6">
      <view class="text-center py-20">
        <text class="text-gray-400">碳循环核心配置页面 (Step 1.5) 开发中...</text>
      </view>
    </BaseScrollView>
    
    <view class="p-4 bg-white border-t border-gray-100 pb-safe">
      <view class="flex space-x-3">
        <BaseButton class="flex-1" type="secondary" @click="handleBack">上一步</BaseButton>
        <BaseButton class="flex-1" type="primary" @click="handleNext">下一步</BaseButton>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import BaseNavBar from "@/components/common/BaseNavBar.vue";
import BaseScrollView from "@/components/common/BaseScrollView.vue";
import BaseButton from "@/components/common/BaseButton.vue";

const handleBack = () => Taro.navigateBack();
const handleNext = () => {
  Taro.navigateTo({ url: "/pages/plan-templates/index" });
};
</script>
