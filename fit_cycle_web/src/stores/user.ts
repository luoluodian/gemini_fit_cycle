import { defineStore } from 'pinia';
import { login as apiLogin, AuthResponse, UserInfo } from '@/services/modules/auth';
import { setStorage, getStorage, removeStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '@/constants/storage';
import Taro from '@tarojs/taro';

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: getStorage<string>(ACCESS_TOKEN_KEY) || '',
    refreshToken: getStorage<string>(REFRESH_TOKEN_KEY) || '',
    userInfo: getStorage<UserInfo>(USER_INFO_KEY) || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },
  actions: {
    async login(code: string) {
      try {
        const res = await apiLogin(code);
        this.setLoginState(res);
        return res;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    setLoginState(res: AuthResponse) {
      this.accessToken = res.accessToken;
      this.refreshToken = res.refreshToken || '';
      this.userInfo = res.user;

      setStorage(ACCESS_TOKEN_KEY, res.accessToken);
      if (res.refreshToken) {
        setStorage(REFRESH_TOKEN_KEY, res.refreshToken);
      }
      setStorage(USER_INFO_KEY, res.user);
    },

    logout() {
      this.accessToken = '';
      this.refreshToken = '';
      this.userInfo = null;
      removeStorage(ACCESS_TOKEN_KEY);
      removeStorage(REFRESH_TOKEN_KEY);
      removeStorage(USER_INFO_KEY);
      
      Taro.reLaunch({ url: '/pages/login/index' });
    },

    checkAuth() {
        if (!this.isLoggedIn) {
            // Logic to redirect if not logged in, if needed here
            // Often handled by route guards
        }
    }
  },
});
