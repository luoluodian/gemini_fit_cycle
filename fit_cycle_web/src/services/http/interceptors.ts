/**
 * HTTP拦截器
 * 实现请求、响应、错误的统一拦截处理
 */

import { ApiResponse, RequestOptions, Interceptor } from "./types";
import {
  ERROR_CODES,
  needAuth,
  isSilentRoute,
  API_BASE_CONFIG,
} from "../../constants";
import { getStorage, setStorage, removeStorage } from "../../utils/storage";
import {
  ApiError,
  createApiError,
  handleApiError,
  isNetworkError,
  isTimeoutError,
} from "../../utils/error-handler";
import { refreshToken as refreshUserToken } from "../../services/modules/user";
import { reLaunch } from "../../router";
import { ROUTES } from "../../constants/routes";

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_INFO_KEY,
} from "../../constants/storage";

/**
 * 认证拦截器
 * 处理Token添加、刷新等认证相关逻辑
 */
export class AuthInterceptor implements Interceptor {
  private static isNavigatingToLogin = false;
  private static refreshing = {
    isRefreshing: false,
    queue: [] as ((token: string) => void)[],
  };

  /**
   * 请求拦截器 - 添加认证头
   */
  async beforeRequest(config: RequestOptions): Promise<RequestOptions> {
    const url = config.url || "";

    // 检查是否需要认证
    if (needAuth(url)) {
      const token = getStorage<string>(ACCESS_TOKEN_KEY);
      if (token) {
        config.header = {
          ...config.header,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    return config;
  }

  /**
   * 响应拦截器 - 处理认证相关响应
   */
  async afterResponse<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    return response;
  }

  /**
   * 错误拦截器 - 处理认证错误
   */
  async onError(error: any): Promise<any> {
    if (error instanceof ApiError && error.code === ERROR_CODES.UNAUTHORIZED) {
      // 如果是认证错误，尝试刷新token
      try {
        const newToken = await this.refreshToken();

        // 更新错误配置，添加新的token
        if (error.config) {
          error.config.header = {
            ...error.config.header,
            Authorization: `Bearer ${newToken}`,
          };
          error.config._isRetry = true;
        }

        return error; // 返回错误供重试
      } catch (refreshError) {
        // 刷新失败，需要重新登录
        await this.navigateToLogin();
        throw createApiError(ERROR_CODES.UNAUTHORIZED, "登录失效，请重新登录");
      }
    }

    throw error;
  }

  /**
   * 刷新Token
   */
  private async refreshToken(): Promise<string> {
    const oldRefresh = getStorage<string>(REFRESH_TOKEN_KEY);
    if (!oldRefresh) {
      console.warn('[Auth] No refresh token found in storage');
      throw new Error("Refresh token 不存在");
    }

    if (AuthInterceptor.refreshing.isRefreshing) {
      console.log('[Auth] Refresh already in progress, queuing request');
      return new Promise((resolve) =>
        AuthInterceptor.refreshing.queue.push(resolve)
      );
    }

    AuthInterceptor.refreshing.isRefreshing = true;
    console.log('[Auth] Starting token refresh...');

    try {
      // 使用refreshToken函数刷新token
      const res = await refreshUserToken(oldRefresh);
      console.log('[Auth] Refresh response:', res);
      
      const newAccessToken = res?.accessToken;
      if (!newAccessToken) {
        throw new Error("刷新Token失败：未获取到新的accessToken");
      }

      setStorage(ACCESS_TOKEN_KEY, newAccessToken);
      if (res?.refreshToken) {
        setStorage(REFRESH_TOKEN_KEY, res.refreshToken);
      }

      const pendingQueue = AuthInterceptor.refreshing.queue;
      AuthInterceptor.refreshing.queue = [];
      AuthInterceptor.refreshing.isRefreshing = false;

      console.log(`[Auth] Token refreshed. Resuming ${pendingQueue.length} queued requests.`);
      pendingQueue.forEach((resolve) => resolve(newAccessToken));

      return newAccessToken;
    } catch (err) {
      console.error('[Auth] Refresh token failed:', err);
      AuthInterceptor.refreshing.isRefreshing = false;
      AuthInterceptor.refreshing.queue = [];
      removeStorage(ACCESS_TOKEN_KEY);
      removeStorage(REFRESH_TOKEN_KEY);
      removeStorage(USER_INFO_KEY);
      throw err;
    }
  }

  /**
   * 跳转到登录页
   */
  private async navigateToLogin(): Promise<void> {
    if (AuthInterceptor.isNavigatingToLogin) return;
    AuthInterceptor.isNavigatingToLogin = true;

    try {
      removeStorage(ACCESS_TOKEN_KEY);
      removeStorage(USER_INFO_KEY);
      removeStorage(REFRESH_TOKEN_KEY);

      // 使用路由封装跳转到登录页
      await reLaunch(ROUTES.LOGIN);
    } catch (error) {
      console.error("跳转登录页失败:", error);
    } finally {
      AuthInterceptor.isNavigatingToLogin = false;
    }
  }
}

/**
 * 错误处理拦截器
 * 统一处理各种错误情况，复用error-handler.ts的工具函数
 */
export class ErrorInterceptor implements Interceptor {
  /**
   * 错误拦截器
   */
  async onError(error: any): Promise<any> {
    // 如果设置了重试标志，不显示错误提示（由请求管理器处理重试）
    const shouldShowError = !error?.config?._isRetry;

    // 如果是API错误，根据配置决定是否显示错误提示
    if (error instanceof ApiError) {
      // 根据配置决定是否显示错误提示
      if (shouldShowError && error.config?.showErrorToast !== false) {
        handleApiError(error);
      }
      throw error;
    }

    // 网络错误处理
    if (isNetworkError(error)) {
      const apiError = createApiError(
        ERROR_CODES.SERVER_ERROR,
        "网络连接失败，请检查网络后重试",
        undefined,
        error.config
      );
      // 根据配置决定是否显示错误提示
      if (shouldShowError && error.config?.showErrorToast !== false) {
        handleApiError(apiError);
      }
      throw apiError;
    }

    // 超时错误处理
    if (isTimeoutError(error)) {
      const apiError = createApiError(
        ERROR_CODES.SERVER_ERROR,
        "请求超时，请稍后重试",
        undefined,
        error.config
      );
      // 根据配置决定是否显示错误提示
      if (shouldShowError && error.config?.showErrorToast !== false) {
        handleApiError(apiError);
      }
      throw apiError;
    }

    // 其他错误
    const apiError = createApiError(
      ERROR_CODES.SERVER_ERROR,
      error.message || "请求失败",
      undefined,
      error.config
    );
    // 根据配置决定是否显示错误提示
    if (shouldShowError && error.config?.showErrorToast !== false) {
      handleApiError(apiError);
    }
    throw apiError;
  }
}

/**
 * 日志拦截器
 * 记录请求和响应信息，便于调试
 */
export class LoggerInterceptor implements Interceptor {
  /**
   * 请求拦截器
   */
  async beforeRequest(config: RequestOptions): Promise<RequestOptions> {
    console.log(`[HTTP Request] ${config.method || "GET"} ${config.url}`);
    if (config.data) {
      console.log("[HTTP Request Data]", config.data);
    }
    return config;
  }

  /**
   * 响应拦截器
   */
  async afterResponse<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    console.log("[HTTP Response]", response);
    return response;
  }

  /**
   * 错误拦截器
   */
  async onError(error: any): Promise<any> {
    console.error("[HTTP Error]", error);
    throw error;
  }
}

/**
 * 配置拦截器
 * 处理请求配置的默认值和格式化
 */
export class ConfigInterceptor implements Interceptor {
  /**
   * 请求拦截器
   */
  async beforeRequest(config: RequestOptions): Promise<RequestOptions> {
    // 设置默认值
    config.timeout = config.timeout || API_BASE_CONFIG.timeout;
    config.header = {
      ...API_BASE_CONFIG.headers,
      ...config.header,
    };

    // 设置默认错误提示
    if (config.showErrorToast === undefined) {
      const url = config.url || "";
      config.showErrorToast =
        !isSilentRoute(url) && API_BASE_CONFIG.showErrorToast;
    }

    return config;
  }
}
