<template>
  <view class="min-h-screen no-tabbar">
    <!-- Main Content -->
    <view
      class="flex flex-col items-center justify-center min-h-screen px-4 pt-20"
    >
      <!-- Logo/App Info -->
      <view class="animate-item pt-30">
        <LogoHeader />
      </view>

      <!-- 说明文案 -->
      <view class="animate-item">
        <WelcomeCard />
      </view>

      <!-- 微信登录按钮 -->
      <LoginButton :loading="isLoading" @click="handleWechatLogin" />

      <!-- 开发者 Mock 登录 (仅开发环境显示) -->
      <view v-if="isDev" class="mt-6 flex flex-col items-center">
        <view
          class="text-xs text-gray-400 mb-2 px-4 py-1 border border-dashed border-gray-200 rounded-full"
          @click="handleMockLogin"
        >
          🛠️ 开发者入口: 点击 Mock 登录
        </view>
      </view>

      <!-- 游客模式入口 -->
      <view class="mt-8 flex justify-center items-center space-x-4">
        <!-- 可以在这里添加游客模式按钮 -->
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
import { useRouterParams, reLaunch } from "@/router";
import { useUserStore } from "@/stores/user";
import LogoHeader from "@/components/login/LogoHeader.vue";
import WelcomeCard from "@/components/login/WelcomeCard.vue";
import LoginButton from "@/components/login/LoginButton.vue";
import PrivacyModal from "@/components/login/PrivacyModal.vue";

// 响应式状态
const isLoading = ref<boolean>(false);
const isDev = process.env.NODE_ENV === "development";
const privacyModal = ref(false);
const userStore = useUserStore();
const routerParams = useRouterParams();

/**
 * 处理 Mock 登录 (开发环境专用)
 */
const handleMockLogin = async (): Promise<void> => {
  try {
    isLoading.value = true;
    await showSuccess("触发 Mock 登录");
    const authData = await userStore.login("mock_code");

    if (authData.accessToken) {
      await showSuccess("登录成功 (Mock)");
      const targetUrl = routerParams.redirect
        ? decodeURIComponent(routerParams.redirect)
        : "/pages/index/index";
      await reLaunch(targetUrl as any);
    }
  } catch (error: any) {
    showError(error.message || "Mock 登录失败");
  } finally {
    isLoading.value = false;
  }
};

/**
 * 处理微信登录逻辑
 */
const handleWechatLogin = async (): Promise<void> => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    // 1. 获取微信登录 code
    let code = "";
    try {
      const loginRes = await Taro.login();
      code = loginRes.code;
    } catch (e) {
      console.warn("Taro.login failed, using mock_code for dev");
      code = "mock_code";
    }

    if (!code || code === "undefined") {
      code = "mock_code";
    }

    // 2. 调用后端接口
    const authData = await userStore.login(code);

    console.log("登录成功:", authData);
    await showSuccess("登录成功！");

    // 3. 跳转重定向页面或首页
    const targetUrl = routerParams.redirect
      ? decodeURIComponent(routerParams.redirect)
      : "/pages/index/index";
    await reLaunch(targetUrl as any);
  } catch (error: any) {
    console.error("微信登录失败:", error);
    // 区分用户拒绝和其他错误
    if (error.errMsg && error.errMsg.includes("auth deny")) {
      await showModal({
        title: "提示",
        content: "需要您的授权才能登录使用完整功能",
        showCancel: false,
      });
    } else {
      const msg = error.message || "登录失败，请重试";
      await showModal({
        title: "登录失败",
        content: msg,
        showCancel: false,
      });
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * 处理免登录体验 (游客模式)
 */
const _handleGuestMode = async (): Promise<void> => {
  Taro.showModal({
    title: "提示",
    content: "免登录体验模式下，数据将仅保存在本地。确定要继续吗？",
    success: async (res) => {
      if (res.confirm) {
        setStorage("demoMode", "true");
        await showSuccess("进入体验模式");

        const targetUrl = routerParams.redirect
          ? decodeURIComponent(routerParams.redirect)
          : "/pages/index/index";
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
