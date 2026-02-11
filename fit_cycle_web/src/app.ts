import { createApp } from "vue";
import { createPinia } from "pinia";
import Taro, { useLaunch } from "@tarojs/taro";
import { useUserStore } from "./stores/user";
import { isPublicPage, ROUTES } from "./constants/routes";

import "./app.scss";

const App = createApp({
  setup() {
    const userStore = useUserStore();

    useLaunch(async (options) => {
      console.log("[App] onLaunch options:", options);

      // 1. 检查登录状态
      await userStore.checkLoginStatus();

      // 2. 启动时的权限检查
      const startPath = options.path;
      if (startPath && !isPublicPage(startPath)) {
        if (!userStore.isLoggedIn) {
          console.warn("[App] 启动拦截：未登录访问受保护页面，重定向至登录页");
          Taro.reLaunch({
            url: `${ROUTES.LOGIN}?redirect=${encodeURIComponent(startPath)}`,
          });
        }
      }
    });
  },
  onShow(_options) {},
});

App.use(createPinia());

export default App;
