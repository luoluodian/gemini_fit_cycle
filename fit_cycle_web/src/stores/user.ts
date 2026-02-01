import { defineStore } from 'pinia';
import { login as apiLogin, AuthResponse, UserInfo } from '@/services/modules/auth';
import { getUserProfile, updateUserInfo as apiUpdateUserInfo, HealthProfile, UserStats } from '@/services/modules/user';
import { setStorage, getStorage, removeStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '@/constants/storage';
import Taro from '@tarojs/taro';

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: getStorage<string>(ACCESS_TOKEN_KEY) || '',
    refreshToken: getStorage<string>(REFRESH_TOKEN_KEY) || '',
    userInfo: getStorage<UserInfo>(USER_INFO_KEY) || null,
    healthProfile: null as HealthProfile | null,
    stats: null as UserStats | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },
  actions: {
    /**
     * 微信登录
     */
    async login(code: string) {
      try {
        const res = await apiLogin(code);
        this.setLoginState(res);
        return res;
      } catch (error) {
        console.error('[UserStore] Login failed:', error);
        throw error;
      }
    },

    /**
     * 获取用户完整档案
     */
    async fetchUserProfile() {
      try {
        const res = await getUserProfile();
        if (res.user) {
          this.userInfo = { ...this.userInfo, ...res.user };
          setStorage(USER_INFO_KEY, this.userInfo);
        }
        this.healthProfile = res.health;
        this.stats = res.stats;
        return res;
      } catch (error) {
        console.error('[UserStore] Fetch profile failed:', error);
        // 不抛出错误，以免阻断页面显示，仅记录日志
      }
    },

    /**
     * 更新用户信息
     */
    async updateUserInfo(data: Partial<UserInfo>) {
      try {
        const res = await apiUpdateUserInfo(data);
        // 后端返回的是 UserInfo，但通常我们需要重新拉取完整档案以同步 BMR/TDEE
        // 这里为了简化，直接调用 fetchUserProfile
        await this.fetchUserProfile();
        return res;
      } catch (error) {
        console.error('[UserStore] Update user info failed:', error);
        throw error;
      }
    },

    /**
     * 设置登录状态
     */
    setLoginState(res: AuthResponse) {
      this.accessToken = res.accessToken;
      this.refreshToken = res.refreshToken || '';
      this.userInfo = res.user || null;

      setStorage(ACCESS_TOKEN_KEY, this.accessToken);
      if (this.refreshToken) {
        setStorage(REFRESH_TOKEN_KEY, this.refreshToken);
      }
      if (this.userInfo) {
        setStorage(USER_INFO_KEY, this.userInfo);
      }
    },

    /**
     * 检查登录状态（通常在 App 启动时调用）
     */
    async checkLoginStatus() {
      // 1. 检查本地是否有 Token
      if (!this.accessToken) {
        this.clearLoginState();
        return false;
      }

      // 2. 检查微信 Session 是否过期
      try {
        await Taro.checkSession();
        return true;
      } catch (e) {
        console.warn('[UserStore] WeChat session expired');
        // Session 过期，但 Token 可能仍然有效（拦截器会处理 401）
        // 这里可以根据业务决定是否强制退出，目前选择保留 Token，依赖后端 401 触发刷新
        return true; 
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.clearLoginState();
      Taro.reLaunch({ url: '/pages/login/index' });
    },

    /**
     * 清除登录状态
     */
    clearLoginState() {
      this.accessToken = '';
      this.refreshToken = '';
      this.userInfo = null;
      removeStorage(ACCESS_TOKEN_KEY);
      removeStorage(REFRESH_TOKEN_KEY);
      removeStorage(USER_INFO_KEY);
    }
  },
});