// 类型定义
export * from "./types";

// 路由常量
export * from "../constants/routes";

// 工具函数
export * from "./utils";

// 钩子函数
export * from "./hooks";

/**
 * 路由服务
 * 
 * 提供简洁的路由跳转方法，封装Taro原生路由API
 * 支持类型安全的路由路径和参数传递
 */

import Taro from "@tarojs/taro";
import { RoutePath, ROUTES, isPublicPage } from "../constants/routes";
import { useUserStore } from "../stores/user";

/**
 * 路由守卫：检查权限
 * 返回 true 表示允许跳转，返回 false 表示拦截并已处理重定向
 */
function beforeNavigate(url: string): boolean {
  const userStore = useUserStore();
  
  // 检查是否为公共页面
  if (isPublicPage(url)) {
    return true;
  }

  // 检查登录状态
  if (!userStore.isLoggedIn) {
    console.warn("[Router] 未登录拦截，重定向至登录页:", url);
    Taro.redirectTo({
      url: `${ROUTES.LOGIN}?redirect=${encodeURIComponent(url)}`,
    });
    return false;
  }

  return true;
}

/**
 * 构建带参数的 URL
 */
function buildUrl(url: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return url;

  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null) // 过滤 undefined 和 null
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");

  return query ? `${url}?${query}` : url;
}

/**
 * 普通跳转（保留当前页面）
 */
export function navigateTo(
  url: RoutePath,
  params?: Record<string, string | number | boolean>
): Promise<any> {
  const fullUrl = buildUrl(url, params);

  if (!beforeNavigate(fullUrl)) {
    return Promise.resolve();
  }

  return Taro.navigateTo({
    url: fullUrl,
  }).catch((err) => {
    console.error("[Router] navigateTo failed:", fullUrl, err);
    throw err;
  });
}

/**
 * 重定向跳转（关闭当前页面）
 */
export function redirectTo(
  url: RoutePath,
  params?: Record<string, string | number | boolean>
): Promise<any> {
  const fullUrl = buildUrl(url, params);

  if (!beforeNavigate(fullUrl)) {
    return Promise.resolve();
  }

  return Taro.redirectTo({
    url: fullUrl,
  }).catch((err) => {
    console.error("[Router] redirectTo failed:", fullUrl, err);
    throw err;
  });
}

/**
 * 切换 Tab 页面
 */
export function switchTab(url: RoutePath): Promise<any> {
  if (!beforeNavigate(url)) {
    return Promise.resolve();
  }

  return Taro.switchTab({
    url,
  }).catch((err) => {
    console.error("[Router] switchTab failed:", url, err);
    throw err;
  });
}

/**
 * 重启应用（关闭所有页面）
 */
export function reLaunch(
  url: RoutePath,
  params?: Record<string, string | number | boolean>
): Promise<any> {
  const fullUrl = buildUrl(url, params);

  if (!beforeNavigate(fullUrl)) {
    return Promise.resolve();
  }

  return Taro.reLaunch({
    url: fullUrl,
  }).catch((err) => {
    console.error("[Router] reLaunch failed:", fullUrl, err);
    throw err;
  });
}

/**
 * 返回上一页面
 */
export function navigateBack(delta: number = 1): Promise<any> {
  return Taro.navigateBack({
    delta,
  }).catch((err) => {
    console.error("[Router] navigateBack failed:", delta, err);
    throw err;
  });
}
