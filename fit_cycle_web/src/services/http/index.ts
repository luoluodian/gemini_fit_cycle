/**
 * HTTP服务模块统一导出
 * 提供完整的HTTP请求功能，包括拦截器、Token管理等
 */

// 类型定义
export * from "./types";

// 拦截器
export {
  AuthInterceptor,
  ErrorInterceptor,
  LoggerInterceptor,
  ConfigInterceptor,
} from "./interceptors";

// Token管理已统一在AuthInterceptor中处理，不再单独导出TokenManager

// 请求管理器
export { RequestManager } from "./request";

// 创建默认的请求管理器实例，配置常用拦截器
import { RequestManager } from "./request";
import {
  AuthInterceptor,
  ErrorInterceptor,
  LoggerInterceptor,
  ConfigInterceptor,
} from "./interceptors";

/**
 * 创建默认的请求管理器
 * 预配置常用的拦截器
 */
import { isLogEnabled } from "@/utils/env";

export function createDefaultRequestManager(): RequestManager {
  const manager = new RequestManager();

  // 添加配置拦截器（最先执行）
  manager.addInterceptor(new ConfigInterceptor());

  // 添加认证拦截器
  manager.addInterceptor(new AuthInterceptor());

  // 添加日志拦截器（调试用，生产环境可以移除）
  if (isLogEnabled()) {
    manager.addInterceptor(new LoggerInterceptor());
  }

  // 添加错误处理拦截器（最后执行）
  manager.addInterceptor(new ErrorInterceptor());

  return manager;
}

/**
 * 默认的请求管理器实例
 */
export const httpRequest = createDefaultRequestManager();
