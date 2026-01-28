/**
 * API配置常量
 * 定义API的基础配置、认证规则、静默路由等
 */
import { getApiBaseUrl } from "@/utils/env";

/**
 * API基础配置
 */
export const API_BASE_CONFIG = {
  // 基础URL，使用环境工具类获取（支持跨平台）
  baseURL: getApiBaseUrl(),

  // 请求超时时间(毫秒)
  timeout: 5000,

  // 默认请求头
  headers: {
    "Content-Type": "application/json",
  },

  // 是否启用自动登录
  enableAutoLogin: true,

  // 是否显示错误提示
  showErrorToast: true,
} as const;

/**
 * 需要认证的API路由(使用正则表达式)
 * 更灵活，支持复杂的匹配规则
 */
export const AUTH_ROUTES = [
  /^\/user\//,
  /^\/diet-logs\//,
  /^\/diet-plans\//,
  /^\/auth\/refreshToken/,
];

/**
 * 不需要认证的公共API路由
 */
export const PUBLIC_ROUTES = [
  "/auth/wechatAuth",
];

/**
 * 静默路由(不显示错误提示)
 * 用于后台检查类接口，失败时不打扰用户
 */
export const SILENT_ROUTES = [
  "/auth/refreshToken",
];

/**
 * 判断是否需要认证
 * @param url 请求URL
 */
export function needAuth(url: string): boolean {
  // 检查是否在公共路由中
  if (PUBLIC_ROUTES.some((route) => url.includes(route))) {
    return false;
  }

  // 检查是否匹配认证路由规则
  return AUTH_ROUTES.some((pattern) => pattern.test(url));
}

/**
 * 判断是否为静默路由
 * @param url 请求URL
 */
export function isSilentRoute(url: string): boolean {
  return SILENT_ROUTES.some((route) => url.includes(route));
}

/**
 * 获取完整的API URL
 * @param path API路径
 */
export function getFullUrl(path: string): string {
  const baseURL = API_BASE_CONFIG.baseURL?.replace(/\/$/, "") || "";
  const cleanPath = path.replace(/^\//, "");
  
  // 如果 baseURL 为空，返回相对路径（用于开发环境的代理）
  if (!baseURL) {
    return `/${cleanPath}`;
  }
  
  // 如果有 baseURL，拼接完整路径
  return `${baseURL}/${cleanPath}`;
}
