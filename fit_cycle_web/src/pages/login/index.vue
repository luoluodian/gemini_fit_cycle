<template>
  <view>
    <!-- Main Content -->
    <view class="flex flex-col items-center justify-center min-h-screen px-4">
      <!-- Logo/App Info -->
      <LogoHeader />

      <!-- 说明文案 -->
      <WelcomeCard />

      <!-- 登录按钮 -->
      <LoginButton @login="wechatLogin" />

      <!-- 错误提示 -->
      <ErrorMessage :message="errorMessage" />

      <!-- 隐私政策 -->
      <view class="mt-8 text-center">
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
import { setStorage } from "@/utils/storage";
import { showSuccess, showError } from "@/utils/toast";
import { navigateTo } from "@/router";
import { login } from "@/services";
import LogoHeader from "@/components/login/LogoHeader.vue";
import WelcomeCard from "@/components/login/WelcomeCard.vue";
import LoginButton from "@/components/login/LoginButton.vue";
import ErrorMessage from "@/components/common/ErrorMessage.vue";
import PrivacyModal from "@/components/login/PrivacyModal.vue";
// 响应式状态
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");
const privacyModal = ref<boolean>(false);

const wechatLogin = () => {
  handleLogin();
};

// 登录处理函数
const handleLogin = async (): Promise<void> => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    const mockUserInfo = await login("mock_code");
    console.log("登录成功，用户信息:", mockUserInfo);
    setStorage("userToken", `mock_token_${Date.now()}`);
    setStorage("userRefToken", `mock_refresh_${Date.now()}`);
    setStorage("userInfo", mockUserInfo);
    // 成功处理
    await showSuccess("登录成功！");
    await navigateTo("/pages/index/index");
  } catch (error) {
    console.error("登录失败:", error);
    errorMessage.value = "登录失败，请重试";
    await showError("登录失败，请重试");
  } finally {
    isLoading.value = false;
  }
};

// 隐私政策函数
const showPrivacyPolicy = (): void => {
  privacyModal.value = true;
};

const closePrivacyPolicy = (): void => {
  privacyModal.value = false;
};
</script>
