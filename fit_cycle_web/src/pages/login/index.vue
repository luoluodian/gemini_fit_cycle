<template>
  <view class="min-h-screen">
    <!-- Main Content -->
    <view class="flex flex-col items-center justify-center min-h-screen px-4">
      <!-- Logo/App Info -->
      <view class="animate-item">
        <LogoHeader />
      </view>

      <!-- 说明文案 -->
      <view class="animate-item">
        <WelcomeCard />
      </view>

      <!-- 登录按钮 -->
      <view class="animate-item w-full flex justify-center">
        <LoginButton @login="handleWechatLogin" @guest="handleGuestMode" />
      </view>

      <!-- 隐私政策 -->
      <view class="mt-8 text-center animate-item">
        <view
          @click="showPrivacyPolicy"
          class="text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          查看隐私政策
        </view>
      </view>
    </view>

    <PrivacyModal :visible="privacyModal" @close="closePrivacyPolicy" />
  </view>
</template>

<script setup lang="ts">
import "./index.scss";
import { ref } from "vue";
import Taro from "@tarojs/taro";
import { setStorage } from "@/utils/storage";
import { showSuccess, showModal } from "@/utils/toast";
import { navigateTo, useRouterParams, reLaunch } from "@/router";
import { useUserStore } from "@/stores/user";
import LogoHeader from "@/components/login/LogoHeader.vue";
import WelcomeCard from "@/components/login/WelcomeCard.vue";
import LoginButton from "@/components/login/LoginButton.vue";
import PrivacyModal from "@/components/login/PrivacyModal.vue";

// 响应式状态
const isLoading = ref<boolean>(false);
const privacyModal = ref<boolean>(false);
const userStore = useUserStore();
const routerParams = useRouterParams<{ redirect?: string }>();

/**
 * 处理微信登录流程
 */
const handleWechatLogin = async (): Promise<void> => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    // 1. 获取微信登录 code
    const loginRes = await Taro.login();
    if (!loginRes.code) {
      throw new Error("未能获取微信登录凭证");
    }

    // 2. 调用后端接口
    const authData = await userStore.login(loginRes.code);
    
    console.log("登录成功:", authData);
    await showSuccess("登录成功！");
    
    // 3. 跳转重定向页面或首页
    const targetUrl = routerParams.redirect ? decodeURIComponent(routerParams.redirect) : "/pages/index/index";
    await reLaunch(targetUrl as any);
  } catch (error: any) {
    console.error("微信登录失败:", error);
    const msg = error.message || "登录失败，请重试";
    await showModal({
      title: "登录失败",
      content: msg,
      showCancel: false
    });
  } finally {
    isLoading.value = false;
  }
};

/**
 * 处理免登录体验 (游客模式)
 */
const handleGuestMode = async (): Promise<void> => {
  Taro.showModal({
    title: "提示",
    content: "免登录体验模式下，数据将仅保存在本地。确定要继续吗？",
    success: async (res) => {
      if (res.confirm) {
        setStorage("demoMode", "true");
        await showSuccess("进入体验模式");
        
        const targetUrl = routerParams.redirect ? decodeURIComponent(routerParams.redirect) : "/pages/index/index";
        await reLaunch(targetUrl as any);
      }
    },
  });
};

// 隐私政策函数
const showPrivacyPolicy = (): void => {
  privacyModal.value = true;
};

const closePrivacyPolicy = (): void => {
  privacyModal.value = false;
};
</script>